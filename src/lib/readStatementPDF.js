import { pdfTextLines, parseStatementLines } from './financeStatement'

export async function readStatementPDF(file) {
  if (!file.name.toLowerCase().endsWith('.pdf')) throw new Error('Bir PDF dosyası seçin.')
  if (file.size > 10 * 1024 * 1024) throw new Error('PDF en fazla 10 MB olabilir.')
  const bytes = await file.arrayBuffer()
  const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(b => b.toString(16).padStart(2, '0')).join('')
  const pdfjs = await import('pdfjs-dist')
  const { default: worker } = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
  pdfjs.GlobalWorkerOptions.workerSrc = worker
  const task = pdfjs.getDocument({ data: new Uint8Array(bytes), isEvalSupported: false, useSystemFonts: true })
  try {
    const pdf = await task.promise
    if (pdf.numPages > 100) throw new Error('Tek seferde en fazla 100 sayfa yükleyin.')
    const pages = []
    for (let number = 1; number <= pdf.numPages; number++) {
      const page = await pdf.getPage(number)
      pages.push(pdfTextLines((await page.getTextContent()).items))
      page.cleanup()
    }
    if (!pages.some(lines => lines.join('').trim())) throw new Error('PDF’de okunabilir metin yok. Taranmış belgeler için OCR henüz desteklenmiyor.')
    const result = parseStatementLines(pages)
    if (result.rows.length > 2000) throw new Error('Tek seferde en fazla 2.000 işlem yükleyin.')
    return { ...result, hash, pageCount: pdf.numPages, filename: file.name }
  } catch (error) {
    if (error.name === 'PasswordException') throw new Error('PDF şifreli. Bankadan şifresiz bir ekstre indirin veya şifresini kendi cihazınızda kaldırın.')
    if (error.name === 'InvalidPDFException') throw new Error('PDF okunamadı. Dosyayı bankadan tekrar indirin.')
    throw error
  } finally { await task.destroy() }
}
