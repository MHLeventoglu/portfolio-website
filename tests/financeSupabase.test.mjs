import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { PGlite } from '@electric-sql/pglite'
import { createEmptyFinance, validateFinanceWorkspace, createFinanceRepository, financeError } from '../src/lib/financeWorkspace.js'

const owner = '11111111-1111-4111-8111-111111111111'
const outsider = '22222222-2222-4222-8222-222222222222'
const migration = (await readFile(new URL('../supabase/migrations/202611210001_finance_workspace.sql', import.meta.url), 'utf8')).replaceAll('BURAYA_GIRIS_EPOSTANI_YAZ', 'owner@example.test').replace("if owner_email = 'owner@example.test' then", "if owner_email = '' then")

async function database() {
  const db = new PGlite()
  await db.exec(`create role anon; create role authenticated; create schema auth;
    create table auth.users(id uuid primary key, email text);
    insert into auth.users values ('${owner}', 'owner@example.test'), ('${outsider}', 'other@example.test');
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid$$;
    grant usage on schema auth to anon, authenticated;
    create table public.projects(id integer primary key, title text); insert into public.projects values(1,'Existing portfolio');`)
  await db.exec(migration)
  return db
}
async function asUser(db, id, role = 'authenticated') {
  await db.exec('reset role')
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id || ''])
  await db.exec(`set role ${role}`)
}
async function save(db, state, revision, mutation = randomUUID()) {
  return (await db.query('select (public.finance_save_workspace($1::jsonb,$2::bigint,$3::uuid)).*', [JSON.stringify(state), revision, mutation])).rows[0]
}

test('SQL creates a single empty owner workspace without changing portfolio data; rerun preserves saved records', async () => {
  const db = await database()
  try {
    assert.equal((await db.query('select title from public.projects')).rows[0].title, 'Existing portfolio')
    const initial = (await db.query('select * from public.finance_workspace')).rows[0]
    assert.deepEqual(initial.state, createEmptyFinance())
    await asUser(db, owner)
    const next = createEmptyFinance()
    next.transactions.push({ id: 'tx-1', title: 'Market', amount: 125.5, date: '2026-11-21', type: 'expense', category: 'food', account: 'daily' })
    const row = await save(db, next, 0)
    assert.equal(Number(row.revision), 1)
    assert.equal(row.state.transactions[0].amount, 125.5)
    await db.exec('reset role')
    await db.exec(migration)
    assert.deepEqual((await db.query('select state from public.finance_workspace')).rows[0].state, next)
  } finally { await db.close() }
})

test('RLS denies anonymous access, other accounts, direct writes and owner reassignment', async () => {
  const db = await database()
  try {
    await asUser(db, null, 'anon')
    await assert.rejects(db.query('select * from public.finance_workspace'), error => error.code === '42501')
    await assert.rejects(save(db, createEmptyFinance(), 0), error => error.code === '42501')
    await asUser(db, outsider)
    assert.equal((await db.query('select * from public.finance_workspace')).rows.length, 0)
    await assert.rejects(save(db, createEmptyFinance(), 0), error => error.code === '42501')
    await assert.rejects(db.query('insert into public.finance_workspace(owner_id,state) values($1,$2)', [outsider, '{}']), error => error.code === '42501')
    await asUser(db, owner)
    assert.equal((await db.query('select * from public.finance_workspace')).rows.length, 1)
    await assert.rejects(db.query('update public.finance_workspace set owner_id=$1', [outsider]), error => error.code === '42501')
    await assert.rejects(db.query('update public.finance_workspace set state=$1', ['{}']), error => error.code === '42501')
    await assert.rejects(db.query('delete from public.finance_workspace'), error => error.code === '42501')
  } finally { await db.close() }
})

test('SQL rejects invalid data atomically and detects stale revisions; retries do not duplicate records', async () => {
  const db = await database()
  try {
    await asUser(db, owner)
    for (const edit of [s => { s.transactions = null }, s => { s.budgets = {} }, s => { s.accounts[0].opening = -1e30 }, s => { s.transactions.push({ id: 'bad', title: 'Bad', type: 'expense', category: 'food', account: 'daily', date: '2026-02-30', amount: -1 }) }, s => { s.investments.push({ id: 'invalid' }) }]) {
      const invalid = createEmptyFinance(); edit(invalid)
      await assert.rejects(save(db, invalid, 0), error => error.code === '22023')
      assert.equal(Number((await db.query('select revision from public.finance_workspace')).rows[0].revision), 0)
    }
    const next = createEmptyFinance(); next.goals.push({ id: 'goal', name: 'Bilgisayar', target: 10000, saved: 100, deadline: '2027-04', icon: 'studio', color: 'teal' })
    const mutation = randomUUID()
    await save(db, next, 0, mutation)
    await save(db, next, 0, mutation)
    assert.equal(Number((await db.query('select revision from public.finance_workspace')).rows[0].revision), 1)
    await assert.rejects(save(db, createEmptyFinance(), 0), error => error.code === '40001')
    await assert.rejects(save(db, createEmptyFinance(), 1, mutation), error => error.code === '22023')
    assert.equal((await db.query('select state from public.finance_workspace')).rows[0].state.goals[0].saved, 100)
  } finally { await db.close() }
})

test('repository requires matching owner and commit acknowledgement and reconciles a lost response', async () => {
  const state = createEmptyFinance(), mutation = randomUUID()
  const row = { owner_id: owner, state, revision: 1, last_mutation_id: mutation, updated_at: '2026-11-21T12:00:00Z' }
  let serverRow = row, rpcResponse = { data: row }
  const client = { from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: serverRow }) }) }) }), rpc: async () => rpcResponse }
  const repo = createFinanceRepository(client)
  assert.equal((await repo.save(owner, state, 0, mutation)).revision, 1)
  rpcResponse = { error: new TypeError('Failed to fetch') }
  assert.equal((await repo.save(owner, state, 0, mutation)).revision, 1)
  serverRow = { ...row, last_mutation_id: randomUUID() }
  await assert.rejects(repo.save(owner, state, 0, mutation))
  await assert.rejects(repo.load(outsider))
  serverRow = null
  await assert.rejects(repo.load(owner), error => error.code === 'FINANCE_OWNER')
  assert.equal(financeError({ code: 'PGRST205' }).kind, 'setup')
  assert.equal(financeError({ code: '40001' }).kind, 'conflict')
})

test('empty finance has no demo amounts, positions or history and validates all required collections', () => {
  const state = createEmptyFinance()
  assert.equal(validateFinanceWorkspace(state), state)
  assert.equal(state.accounts.reduce((sum, account) => sum + account.opening, 0), 0)
  assert.equal(state.investments.length + state.transactions.length + state.goals.length + state.investmentHistory.length, 0)
  assert.throws(() => validateFinanceWorkspace({ ...state, transactions: [{ id: 't' }] }))
  assert.throws(() => validateFinanceWorkspace({ ...state, accounts: [] }))
})
