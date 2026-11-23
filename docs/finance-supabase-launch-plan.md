# Finans: Supabase ve canlıya çıkış planı

Tarih: 15 Kasım 2026. Bu belge uygulama planıdır; Supabase şeması değiştirilmedi ve dağıtım yapılmadı.

## Hazırlanan entegrasyon — 21 Kasım 2026

İlk kişisel sürüm için aşağıdaki çok tablolu tasarım sadeleştirildi: aynı Supabase projesinde tek `finance_workspace` satırı, mevcut yönetici Auth hesabına bağlı tüm finans alanını JSONB olarak tutuyor. Hesaplar, işlemler, bütçeler, hedefler, ödemeler, yatırımlar, değerlemeler ve PDF import metadatası tek atomik kayıtla güncelleniyor. RLS sadece SQL kurulumu sırasında belirlenen sahibin okumasına izin veriyor; istemcinin doğrudan INSERT/UPDATE/DELETE yetkisi yok. Yazma yalnızca sahip kontrolü, sunucu doğrulaması ve revision karşılaştırması yapan `finance_save_workspace` RPC'si üzerinden.

Bu model tek kişinin küçük çalışma alanında mevcut ekranları koruyarak güvenli kalıcılık sağlar. Her kayıtta finans belgesinin tamamı gönderilir; 10 MB belge ve koleksiyon başına 50.000 kayıt sınırı var. Büyük arşiv veya sunucu taraflı sorgulama gerektiğinde aşağıdaki normalize tablolar gelecekteki ayrıştırma planıdır; ilk kurulum için zorunlu değiller. Trade geçmişi olmayan mevcut prototipten geriye dönük bir işlem defteri uydurulmaz.

Kurulum dosyası: `supabase/migrations/202611210001_finance_workspace.sql`. Tek değişiklik `owner_email` satırına mevcut giriş e-postasının yazılması. Yeni hesap veya yeni Supabase projesi gerekmiyor. SQL portfolyo tablolarını değiştirmez ve yeniden çalıştırıldığında mevcut finans kaydını sıfırlamaz. İlk alan boş ve sıfır bakiyelerle başlar; yerel demo kayıtları otomatik taşınmaz.

Arayüzde sunucu onayı beklenir; hata halinde form tutulur ve başarı mesajı verilmez. Kayıt başarılı olup HTTP yanıtı kaybolursa son mutation kimliği okunarak sonuç doğrulanır. Başka cihaz/sekme revision'ı değiştirmişse eski ekran üzerine yazamaz. Oturum sahibi değişince alan yeniden yüklenir; gerçek kayıtlar localStorage'a yazılmaz. Demo giriş yalnızca yapılandırılmamış geliştirme ortamında kalır, üretimde kapanır.

Yerel PostgreSQL/PGlite testleri: anonim ve farklı kullanıcı erişimi, doğrudan yazma, sahip değiştirme, şema doğrulaması, aynı mutation tekrarı, revision çatışması ve kurulumun tekrar çalıştırılması. Arayüz doğrulaması gerçek projeden ayrı geçici Auth/REST test servisi ile yapılıyor. Gerçek projenin kurulumu kullanıcı SQL'i çalıştırdıktan sonra ayrıca doğrulanmalı.

Canlı piyasa fiyatı bu veri kalıcılığı kurulumuna dahil değil; BIST/altın fiyatları elle girilir. Yahoo erişimi ve 429 koşulu çözüldüğünde fiyat servisi ayrı bir migration/function olarak eklenebilir. PDF hâlâ cihazda okunur, yalnızca onaylı işlemler özel finans alanına gönderilir.

## Kararlaştırılan kapsam: tek kişilik, mevcut Supabase projesi

Bu uygulamanın tek kullanıcısı portfolyo sahibi. Finans alanı mevcut portfolyo Supabase projesine eklenecek; aynı proje URL’si, istemci ve mevcut yönetici Auth hesabı kullanılacak. Ayrı bir Supabase projesi, yeni üyelik akışı, kullanıcı yönetimi veya çok kullanıcılı ürün yapısı gerekmiyor.

Portfolyonun ziyaretçilere açık verileri mevcut erişim modeliyle kalır. Finans tabloları `finance_` ön ekiyle eklenir ve sadece mevcut sahibin Auth UUID’sine açılır. Admin menüsündeki “Finansa git” aynı oturumu kullanır. URL’yi bilmek veya başka bir Auth hesabına sahip olmak finans verilerine erişim sağlamaz.

Aşağıdaki `user_id` alanları çok kullanıcılı ürün gereksinimi değildir; kaydın senin Auth hesabına bağlı olduğunu doğrulamak içindir. Yetkilendirme mevcut sahip UUID’sine sabitlenir. Ayrı rol/izin yönetim sistemi kurulmaz.

## Mevcut durum

- React/Vite uygulaması, `/finance` ve admin menüsünden erişim; mevcut Supabase istemcisi ve Auth bağlantısı bulunuyor.
- Finans işlemleri, bütçeler, hedefler, pozisyonlar ve tarihli değerlemeler `mhl-finance-demo-v1` anahtarıyla tarayıcıda tutuluyor. Bu alan şu an tarayıcıya bağlıdır; aynı hesabın başka cihazından erişilemez. Kalıcı kişisel kayıtlar mevcut Supabase projesine taşınmalı.
- Başlangıç hesapları, açılış bakiyeleri, işlemler ve yatırım fiyatları temsili. İçe aktarılan gerçek işlemler şu an bu yerel çalışma alanına eklenir; banka bakiyesiyle otomatik mutabakat yapılmaz.
- Metin içeren Kuveyt Türk TL PDF ekstreleri cihazda PDF.js ile okunur. Dosya veya tam metin sunucuya gönderilmez/saklanmaz. Kullanıcı her işlem adayını düzenleyip onaylar. Birden fazla tutar varsa işlem tutarı seçilir; işaretsiz tutarın yönü tahmin edilmez.
- Dosya SHA-256 özeti + kaynak satırı aynı dosyanın tekrarını; hesap/tarih/yön/tutar/normalize açıklama eşleşmesi örtüşen işlemleri kontrol eder. Aynı gün aynı açıklama/tutardaki gerçekten farklı işlemler de eşleşebilir. Bankanın işlem referansı alınana kadar bu eşleşmeler kullanıcıya gösterilmeli; doğrudan veri kaybına yol açan otomatik silme yapılmamalı.
- Gerçek Kuveyt Türk PDF örneği henüz sağlanmadı. Çok satırlı açıklamalar, sütun yerleşimleri, borç/alacak işaretleri ve sayfa sonları gerçek örnekle doğrulanmalı. Taranmış/şifreli dosyalar, döviz/altın hesapları ve kredi kartı ekstreleri bu ilk kapsamın dışında.
- Yatırım geçmişi günlük değerleme kaydıdır; alım/satım dahil değer değişimi gösterir. Getiri oranı değildir. Aynı günün son kaydı korunur. Yeni gerçek pozisyonlara geçmiş fiyat eğrisi uydurulmaz.
- Yahoo chart uç noktası önceki denemede 429 döndürdü. Canlı fiyat bağlantısı mevcut değil. Supabase sunucu ve önbellek ihtiyacını karşılar; veri sağlayıcının erişim/sözleşme sınırlarını kaldırmaz.

## 1. Üretimden önce kapatılacak açıklar

1. `DataContext.jsx` ve `Login.jsx` içindeki `admin123` / `portfolio_auth` demo girişi üretimde kapatılmalı. Ortam bilgisi eksikse sistem girişe kapalı kalmalı; sessizce demo girişine geçmemeli. İstenirse ayrı, açıkça etiketlenmiş demo rotası kullanılmalı.
2. `ProtectedRoute` tek başına yetkilendirme değildir. Mevcut kodda oturum sahibi olmak admin erişimine yetiyor. Mevcut yönetici hesabının Auth UUID’si izin verilen tek sahip olarak DB politikalarında ve gereken sunucu kontrollerinde kullanılmalı. Yeni kullanıcı kaydı kapalı olmalı. Ayrı rol/izin listesi sistemi gerekmez; istemcideki metadata yetki kaynağı sayılmamalı. Portfolyo admin yazmaları da bu mevcut sahip hesabıyla sınırlandırılmalı.
3. Çıkışta finansın bellek/önbellek içeriği temizlenmeli. Üretimde Supabase verisi yüklenemezse yerel demo veriyle başarı görüntüsü verilmemeli. Gerçek ekstre kayıtlarını ortak tarayıcıda kalıcı localStorage’a bırakmak yerine sunucu kaydı esas alınmalı.
4. `npm audit` incelemesinde 20 bulgu var: 12 high, 7 moderate, 1 low. PDF.js bu raporda listelenmiyor; Vite, React Router ve geçişli bağımlılıklar incelenmeli. Geliştirme sunucusuna özgü risklerle tarayıcıda çalışan bağımlılık riskleri ayrılmalı. Otomatik `--force` yerine kontrollü sürüm yükseltme ve regresyon testi yapılmalı. Mevcut Vite ana sürüm yükseltmesi ayrı değişiklik olmalı.
5. Depoda bulunan mevcut genel lint sorunları temizlenmeli veya açıkça kayıtlı başlangıç seviyesi belirlenmeli. Bu çalışmanın finans dosyaları için hedefli lint, test ve build kontrolü kullanılıyor.

## 2. İleride ayrıştırılabilecek veri modeli

Mevcut portfolio tablolarının alanları ve RLS politikaları önce salt okunur şema envanteriyle alınmalı; aşağıdaki adlar `finance_` ön ekiyle çakışmayı önler. Şema henüz mevcut Supabase projesinden doğrulanmadı.

Tüm kişisel finans tabloları: `id uuid`, `user_id uuid NOT NULL REFERENCES auth.users`, `created_at timestamptz`, `updated_at timestamptz`. Günlük tarihler `date`, fiyat zamanları `timestamptz`; görüntüleme dilimi Europe/Istanbul. Parasal değerler JS float yerine DB'de `numeric(20,2)`; lot/gram miktarı ve birim maliyeti `numeric(24,8)`.

| Tablo | Alanlar ve kısıtlar |
| --- | --- |
| `finance_accounts` | name, institution, currency, opening_balance, opening_date, archived_at. İlk sürüm TRY. Açılış tarihinden önceki ekstre için kullanıcı mutabakatı gerekir; başlangıç bakiyesi çift sayılmamalı. |
| `finance_categories` | name, kind (income/expense), icon, color. Sahibin hesabına bir kez oluşturulan varsayılan kategoriler. |
| `finance_import_batches` | account_id, bank, file_sha256, parser_version, status, imported_count, undone_at. Ham PDF/IBAN/tam metin tutulmaz. Özet idempotency anahtarıdır, anonim veri kabul edilmemeli. |
| `finance_transactions` | account_id, category_id, occurred_on, title, amount > 0, kind, note, source, import_batch_id, source_row_key, bank_reference nullable, revision, deleted_at. `(user_id, account_id, occurred_on)` indeks; dosyadan gelenler için `(user_id, account_id, file_sha256, source_row_key)` benzersizliği veya eşdeğer kaynak tablosu. Banka referansı varsa ayrıca benzersizlik. Açıklama/tutar parmak izi kesin benzersiz kısıt olmamalı. |
| `finance_budgets` | category_id, month veya NULL (varsayılan), limit_amount > 0. Kullanıcı/kategori/dönem benzersizliği; NULL varsayılanı için ayrı unique indeks. |
| `finance_goals` | name, target_amount > 0, deadline nullable, icon, color, archived_at. Biriken tutar hareketlerden hesaplanmalı. |
| `finance_goal_movements` | goal_id, amount > 0, direction, occurred_on, note. Çekim mevcut birikimi aşmamalı; eşzamanlı işlemler atomik doğrulanmalı. Hedef hareketleri nakit hesabını otomatik değiştirmez. |
| `finance_bills` | account_id, category_id, name, due_on, amount, paid_transaction_id. Ödeme işaretlemesi tek işlem üretmeli. |
| `finance_instruments` | owner user_id, kind, symbol, name, unit, quote_currency. BIST kodu ile Yahoo `.IS` sağlayıcı sembolü ayrı alanlar. Aynı kod farklı varlık türlerinde çakışmamalı. |
| `finance_investment_trades` | instrument_id, direction buy/sell/opening, quantity > 0, unit_price, fees, executed_at, cash_transaction_id nullable. Satış eldeki miktarı aşmamalı. Ağırlıklı maliyet ve gerçekleşen kâr/zarar kayıt defterinden hesaplanmalı. |
| `finance_manual_quotes` | instrument_id, price > 0, quoted_at, provenance=manual. Yalnızca sahibin erişebildiği elle girilmiş fiyat. |
| `finance_valuation_snapshots` | valuation_date, source, BIST/gold cost/value veya alt kalem tablosu. `(user_id, valuation_date)` unique; mevcut günlük grafiği korur. İleride gün içi grafik istenirse yeni zaman damgalı model gerekir. |
| `finance_market_price_cache` | provider, external_symbol, currency, unit, price, quoted_at, fetched_at, expires_at, status. Birleşik unique anahtar. Sunucu yazabilir; yalnızca sahip okuyabilir. Pozisyon miktarları burada tutulmaz. |

Pozisyon özeti bir view/RPC ile trade kayıtlarından üretilmeli; hem elle düzenlenebilen pozisyon toplamı hem işlem defteri ayrı gerçek kaynaklar olmamalı. Mevcut localStorage yalnızca açık pozisyon ve toplam gerçekleşen kâr tutuyor; geriye dönük alım/satım kayıtları yeniden üretilemez. Geçişte `opening` kayıtları + açıklanmış geçmiş kâr düzeltmesi kullanılmalı, işlem geçmişi uydurulmamalı.

## 3. RLS ve atomik işlemler

- Kişisel finans tablolarında RLS: SELECT/INSERT/UPDATE/DELETE için hem `auth.uid() = <MEVCUT_SAHIP_UUID>` hem `user_id = auth.uid()` kontrol edilmeli; INSERT/UPDATE tarafında WITH CHECK de uygulanmalı. UUID mevcut Auth hesabından alınır, yeni hesap oluşturulmaz. Anon veya kazara oluşturulmuş başka bir Auth hesabı finans verisine erişemez.
- Alt kayıtların hesabı/kategorisi/hedefi de mevcut sahibin kayıtları olmalı. İlişkiler foreign key ve sahiplik kontrolleriyle doğrulanmalı; portfolyonun açık tablolarına finans verisi bağlayan veya açığa çıkaran bir ilişki/view eklenmemeli.
- `finance_market_price_cache` istemci yazmalarına kapalı. Gizli sağlayıcı anahtarı ve service-role/secret key yalnızca Edge Function ortamında; `VITE_*` içine konmaz. Tarayıcıdaki public anon/publishable anahtar ancak doğru RLS ile kullanılır.
- Import, import geri alma, hedef para çekme, fatura ödeme ve yatırım trade işlemleri atomik RPC olmalı. Sunucu tarih, tutar, kategori, para birimi, sahiplik ve idempotency kontrollerini tekrar yapmalı. İstemci kontrolüne güvenilmemeli.
- İçe aktarma RPC'si bir batch ve satırları tek transaction içinde işler; aynı talebin tekrarında ikinci kayıt oluşturmaz. Geri alma yalnızca aynı kullanıcıya ait batch kayıtlarını soft-delete eder, `undone_at` yazar; ilgisiz manuel işlemlere dokunmaz. Geri alınmış dosyanın yeniden aktarım davranışı açıkça tasarlanmalı.
- RPC varsayılanı SECURITY INVOKER. Definer zorunluysa sabit search_path, açık auth/sahiplik kontrolü ve dar EXECUTE izni uygulanmalı. RLS aşan yönetim rolü tarayıcıya verilmez. Özet view'ları da RLS'yi aşmamalı.
- Eşzamanlı trade ve hedef çekiminde satır kilidi/transaction; kayıp güncellemeler için revision kontrolü ve kullanıcıya çatışma bildirimi.

Supabase'in [RLS dokümanı](https://supabase.com/docs/guides/database/postgres/row-level-security) tablo güvenliği ve Auth entegrasyonunu açıklıyor; [üretim güvenliği kontrolü](https://supabase.com/docs/guides/security/production-checklist) yayına çıkışta ayrıca uygulanmalı.

## 4. PDF akışının üretime taşınması

İlk sürümde PDF okuma tarayıcıda kalabilir; bunun için Edge Function veya Storage zorunlu değil. Sadece kullanıcı onaylı normalize işlemler Auth ile RPC'ye gönderilir. Ham dosyanın bulutta tutulmaması veri miktarını azaltır.

Önce anonimleştirilmiş gerçek Kuveyt Türk TL örnekleriyle doğrulama seti hazırlanmalı: tek/çok sayfa, uzun açıklama, aynı gün iki eş işlem, borç/alacak ve eksi/artı işaretleri, tutar+bakiye, tarih+valör, iade/masraf, ay/yıl sınırı, şifreli/taranmış belge. Kaynak satırı ve banka referansı varsa korunmalı. Aday sayısı ve onaylanan toplamlar PDF ile karşılaştırılmalı. Hesaplar arası transfer ve yatırım alımı normal gelir/gider değildir; üretim öncesi transfer/eşleştirme türü eklenmeli.

OCR istenirse ayrı, kullanıcıya açık bir özellik olarak tasarlanmalı. Dosya sunucuya gönderilmeden önce amaç/saklama süresi belirtilmeli. Gerekirse private Storage bucket, `user_id/batch_id` yol politikası, kısa ömürlü signed URL, dosya boyut/tür doğrulaması ve otomatik silme eklenmeli. Public bucket kullanılmamalı. Loglarda ekstre satırları, açıklamalar ve hesap bilgileri bulunmamalı.

## 5. BIST ve altın fiyat servisi

1. Auth gerektiren `market-quotes` Edge Function: izinli sağlayıcı/sembol eşlemesi, sabit upstream adresi, süre sınırı, yanıt şema/birim/para birimi doğrulaması. Kullanıcıdan rastgele URL alınmaz.
2. Önce geçerli DB cache; süresi geçtiyse sınırlı upstream yenileme. Aynı sembolde istek birleştirme/kilit, istek ve sembol bazlı hız sınırı; 429 için Retry-After/backoff. Son geçerli değer tarihiyle birlikte “güncel değil” olarak gösterilebilir. Hata halinde sıfır veya örnek fiyat yazılmaz.
3. Gün içi sıklık erişim sözleşmesi ve kota doğrulandıktan sonra ayarlanmalı; ilk aşamada elle yenileme yeterli. Zamanlanmış yenileme gerekiyorsa Supabase Cron sunucu görevi, yalnızca takip edilen izinli semboller ve belirlenmiş işlem saatleriyle çalışmalı.
4. Yahoo resmi, garantili ücretsiz BIST/yerel altın API'si olarak kabul edilmemeli. 429 ve erişim koşulları çözülene kadar elle fiyat girişi çalışır kalmalı; gerekiyorsa lisanslı sağlayıcı seçilmeli. [Borsa İstanbul veri dağıtımı](https://www.borsaistanbul.com/en/data/data-dissemination) koşulları kontrol edilmeli.
5. `GC=F` gibi vadeli altın USD/ons serisi doğrudan Türkiye gram/çeyrek altın satış fiyatı değildir. Gram dönüşümü kullanılacaksa ons birimi, saflık ve eş zamanlı USD/TRY kaynağı belirtilmeli; sonuç “hesaplanan teorik gram fiyatı” olmalı. Çeyrek ve perakende altın için ayrı doğrulanmış ürün fiyatı/alış-satış makası gerekir.
6. Fiyat güncellemesi sonrası gerçek eldeki miktarla tarihli portföy değerlemesi oluşturulmalı. Geçmiş grafiği bugünkü miktarı geçmiş tüm fiyatlarla çarparak kurulmamalı. Geçmiş değerler için işlem defteri ve o tarihin fiyat/kur verileri gerekir.

[Supabase Edge Function secrets](https://supabase.com/docs/guides/functions/secrets) ve [CORS](https://supabase.com/docs/guides/functions/cors) yapılandırması uygulanmalı. CORS yetkilendirmenin yerine geçmez.

## 6. Geçiş ve uygulama sırası

1. **Envanter:** mevcut tablolar, politikalar, Auth kayıt ayarları, depolama ve host ortamını incele. Gerçek PDF düzenini doğrula. Mevcut portfolyo Supabase projesi hedef olarak korunur. Migration’ları önce yerel Supabase/test veritabanında dene; mevcut projenin yedeğini al. Ayrı ücretli/host edilen staging projesi zorunlu değil, istenirse eklenebilir.
2. **Migration 001:** hesap/kategori/işlem/import tabloları, kısıtlar, RLS, indeksler. **002:** bütçe/hedef/hareket/fatura. **003:** enstrüman/trade/manuel fiyat/değerleme. **004:** fiyat cache/RPC ve sahip erişimi. Migration dosyaları versiyonlanmalı; mevcut `.gitignore` içindeki `*.sql` kuralı yalnızca migration dizinini kapsayacak istisnayla düzeltilmeli.
3. **Servis katmanı:** Finance bileşenindeki localStorage yazmalarını mevcut sahip oturumunu kullanan repository/hook'a taşı. Yükleniyor/hata/boş durumları; başarılı sunucu yanıtı gelmeden kayıt tamamlandı deme. Import RPC ve geri alma öncelikli.
4. **Yerel veri geçişi:** kullanıcı girişinden sonra isteğe bağlı önizleme ve adet/tutar özeti. Örnek demo kayıtları varsayılan olarak taşınmaz; kullanıcı tarafından onaylanmış gerçek kayıtlar hesap eşlemesiyle aktarılır. UUID'leri ve ilişkileri map et. Tekrarlanabilir migration batch id'si kullan; sunucu başarılı olana kadar yerel kopyayı silme. Mevcut yerel veriler senin onayınla bu sahip hesabına bağlanır; örnek kayıtlar gerçek kayıt gibi taşınmaz.
5. **Yatırım ve fiyat:** trade defteri ve snapshot yazmalarını sunucuya bağla; fiyat sağlayıcısını ayrı özellik anahtarıyla aç. Manuel fiyat ve API fiyatı kaynağı görünür kalmalı.
6. **Yerel/önizleme kabulü:** aşağıdaki testleri geç; domain/env/redirect ayarlarını doğrula. Sonrasında üretim migration, deployment ve smoke test sırasıyla yürütülür.

## 7. Hosting ve canlıya çıkış kabulü

Mevcut `vercel.json` SPA rewrite içeriyor. Vercel korunursa build `npm ci && npm run build`, çıktı `dist`; `/admin`, `/admin/login`, `/finance?view=investments` ve doğrudan yenileme test edilmeli. Başka statik hostta aynı SPA fallback ve doğru `.mjs` MIME türü gerekir. PDF worker yerel build asset'idir; CDN'e bağımlı değildir. PDF kütüphanesi yalnızca dosya seçildiğinde yüklenir.

- Frontend: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (veya istemci güncellenirse publishable key). CI build eksik env'de üretim paketini reddetmeli. Sunucu anahtarları sadece Supabase function secrets.
- Auth: üretim Site URL/redirect allowlist, HTTPS, yeni kullanıcı kaydının kapatılması, mevcut yönetici hesabı için MFA/uygun oturum ayarları, hata veren/sona eren session davranışı.
- Yerel/önizleme ile üretim ortamı değişkenlerini ayır; log/sourcemap'te anahtar ve kişisel veri taraması. CSP, özellikle PDF için `worker-src 'self'` ve gereken diğer kaynaklar önizlemede sınanmalı. HSTS ve diğer başlıklar host üzerinden kurulmalı.
- Mevcut büyük ana JS paketi ve Supabase static/dynamic import uyarısı var. PDF chunk'ı ve worker ayrıca büyük; ilk açılışın bunları indirmediği ve desteklenen tarayıcıların PDF.js sürümüyle uyumlu olduğu kontrol edilmeli.
- Yedekleme/saklama kapasitesi seçilen Supabase planından doğrulanmalı; fiyat/kota varsayılmamalı. Geri yükleme yerel/test veritabanında denenmeli. Üretimde dev server çalıştırılmamalı.

| Kabul testi | Beklenen sonuç |
| --- | --- |
| Oturumsuz istek + sahibin oturumu + farklı UUID ile politika testi | Yalnızca mevcut sahip finans kayıtlarını okuyup yazabiliyor; normal kullanıcı yönetimi ekranı gerekmiyor |
| Herkese açık portfolyo ve admin kontrolü | Portfolyo sayfaları çalışıyor; finans verileri açık sorgularda ve portfolyo API yanıtlarında bulunmuyor |
| Eksik env, bozuk/sona ermiş session | Demo admin girişine veya yerel gerçek kayıtları oturumsuz göstermiyor |
| Manuel işlem, bütçe/hedef CRUD | Sunucu kaydı yenileme/başka cihazda korunuyor; hatalar görünür |
| PDF tekrarı / örtüşen dosya / eşzamanlı istek | İstemci ve sunucu tarafında idempotency; yanlış bakiye tutarı sessiz seçilmiyor |
| Import geri alma | Sadece ilgili batch geri alınıyor; önceki manuel işlemler duruyor |
| Açılış bakiyesi / transfer / tarih sınırları | Banka mutabakatı mümkün; geçmiş dönemler filtrede ve grafikte erişilebilir |
| Trade / fiyat / hedef çekimi yarışları | Miktar ve maliyet tutarlı; negatif stok/birikim oluşmuyor |
| Fiyat sağlayıcı 429 / timeout / hatalı birim | Son geçerli değer ve tarihi korunuyor; canlı fiyat yanılsaması oluşmuyor |
| Mobil, karanlık/açık tema, klavye | Form/önizleme/grafik kullanılabilir, sayfa yatay taşmıyor |
| Test, build, güvenlik taraması | Anlamlı testler geçiyor; açık bulgular değerlendirilip yayın engelleri kapanıyor |

Rollout: önce yerel/test veritabanı ve önizleme → mevcut portfolyo Supabase projesine yalnızca eklemeli migration → mevcut sahip için boş finans alanı → küçük onaylı PDF batch → bakiye/tutar mutabakatı → diğer kayıtlar → isteğe bağlı canlı fiyat. Hata halinde frontend önceki sürüme döndürülür; veri migration'ları geriye uyumlu eklemeler olmalı. Veri geri dönüşü snapshot/yedek ve import soft-delete üzerinden yapılmalı; üretim tabloları rastgele drop edilmemeli.

**Yayına çıkış için gereken bilgiler:** mevcut domain/hosting ayarları, portfolyonun mevcut Supabase şema/politika erişimi, mevcut yönetici hesabının Auth UUID’si, anonimleştirilmiş gerçek Kuveyt Türk TL PDF örneği, açılış bakiyesi tarihi ve seçilecek fiyat sağlayıcısı. Bunlar belirlenmeden mevcut prototip gerçek finans verisiyle üretime hazır ilan edilmez.
