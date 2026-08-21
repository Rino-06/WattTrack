"""AB Haftalık Petrol Bülteni — GEÇMİŞ dosyası sondası (2. tur).

Birinci tur şunları kanıtladı:
  - Bülten sayfası erişilebilir, anahtar gerekmiyor
  - Haftalık "vergiler dahil" dosyası AB ÜYELERİNİ kapsıyor, TÜRKİYE YOK
  - Yakıt türleri: Euro-super 95, Gas oil (dizel), LPG — uygulamayla örtüşüyor
  - Birim: 1000 litre başına EUR

Bu tur asıl işe yarayacak dosyayı inceliyor:
  Weekly_Oil_Bulletin_Prices_History_*.xlsx
Sorular: tarih aralığı? ülke listesi? para birimi (EUR mi ulusal mı)?
sütun düzeni nasıl — ayrıştırıcıyı buna göre yazacağız.
"""
import io, re, urllib.request
import openpyxl

UA = {'User-Agent': 'Mozilla/5.0 (compatible; fuel-data-probe)'}

def al(url, limit=80_000_000):
    r = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(r, timeout=120) as f:
        return f.status, f.headers.get('Content-Type', ''), f.read(limit)

LANDING = "https://energy.ec.europa.eu/data-and-analysis/weekly-oil-bulletin_en"

print("=" * 70)
print("ADIM 1 — Geçmiş dosyasının bağlantısını sayfadan KEŞFET")
print("=" * 70)
# UUID'li adres zamanla değişebilir; bağlantı DOSYA ADI ÖRÜNTÜSÜNDEN bulunuyor.
st, ct, body = al(LANDING)
html = body.decode('utf-8', 'replace')
aday = []
for m in re.finditer(r'href="([^"]*document/download/[^"]*?)"', html, re.I):
    h = m.group(1)
    if h.startswith('/'):
        h = 'https://energy.ec.europa.eu' + h
    if re.search(r'Prices?_History', h, re.I):
        aday.append(h.replace('&amp;', '&'))
aday = list(dict.fromkeys(aday))
print(f"  'Prices_History' içeren bağlantı: {len(aday)}")
for h in aday[:5]:
    print("   -", h[:160])
if not aday:
    raise SystemExit("Geçmiş dosyası bağlantısı bulunamadı")

url = aday[0]
print()
print("=" * 70)
print("ADIM 2 — Dosyayı indir ve yapısını çıkar")
print("=" * 70)
st, ct, body = al(url)
print(f"  durum={st}  tip={ct[:60]}  boyut={len(body)}")
wb = openpyxl.load_workbook(io.BytesIO(body), read_only=True, data_only=True)
print(f"  sayfalar ({len(wb.sheetnames)}):", wb.sheetnames[:20])

for sayfa in wb.sheetnames[:3]:
    ws = wb[sayfa]
    print(f"\n  ===== SAYFA: {sayfa} =====")
    satirlar = []
    for i, row in enumerate(ws.iter_rows(values_only=True)):
        satirlar.append(row)
        if i > 400: break
    print(f"  okunan satır: {len(satirlar)}  sütun: {max((len(r) for r in satirlar), default=0)}")
    print("  --- ilk 10 satır (ilk 9 sütun) ---")
    for r in satirlar[:10]:
        h = [('' if c is None else str(c)[:20]) for c in r[:9]]
        print("   |", " | ".join(h))
    print("  --- son 3 satır ---")
    for r in satirlar[-3:]:
        h = [('' if c is None else str(c)[:20]) for c in r[:9]]
        print("   |", " | ".join(h))

    metin = " ".join(str(c) for r in satirlar for c in r if c is not None)
    print("  TÜRKİYE:", "VAR" if re.search(r'Turkey|Türkiye|Turkiye', metin) else "YOK")
    for p in ['EUR', 'euro', 'National', 'national', 'CTR', 'VAT', 'Taxes', 'taxes']:
        if p in metin: print("   ipucu VAR:", p)
    # ülke adı taraması
    ulkeler = ['Austria','Belgium','Bulgaria','Croatia','Cyprus','Czechia','Denmark',
               'Estonia','Finland','France','Germany','Greece','Hungary','Ireland',
               'Italy','Latvia','Lithuania','Luxembourg','Malta','Netherlands','Poland',
               'Portugal','Romania','Slovakia','Slovenia','Spain','Sweden',
               'Norway','Switzerland','United Kingdom','Iceland','Serbia','Albania']
    bulunan = [u for u in ulkeler if u in metin]
    print(f"  bulunan ülke ({len(bulunan)}):", ", ".join(bulunan[:35]))
    # tarih aralığı
    import datetime
    tarihler = [c for r in satirlar for c in r if isinstance(c, datetime.datetime)]
    if tarihler:
        print(f"  tarih aralığı: {min(tarihler).date()} … {max(tarihler).date()}  (adet={len(tarihler)})")

print("\n" + "=" * 70)
print("SONDA BİTTİ")
print("=" * 70)
