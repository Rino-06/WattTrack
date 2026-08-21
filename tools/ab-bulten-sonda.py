"""AB Petrol Bülteni geçmiş dosyası — 3. tur: ülke ve para birimi haritası.

Kanıtlanan (1. ve 2. tur):
  - Dosya: Weekly_Oil_Bulletin_Prices_History_*.xlsx, anahtar gerekmiyor
  - Sayfa "Prices with taxes" = vergiler dahil tüketici fiyatı (uygulamanın istediği)
  - 2018-10-15 … 2026-08-17, HAFTALIK, 399 satır, 226 sütun
  - Yakıtlar: Euro-super 95 · Gas oil automobile (dizel) · GPL (LPG) — 1000 litre başına
  - TÜRKİYE YOK

Bu tur: 226 sütun hangi ülkelere ait, fiyatlar EUR mu ulusal para mı?
"""
import io, re, urllib.request, datetime
import openpyxl

UA = {'User-Agent': 'Mozilla/5.0 (compatible; fuel-data-probe)'}
def al(url, limit=80_000_000):
    r = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(r, timeout=120) as f:
        return f.read(limit)

html = al("https://energy.ec.europa.eu/data-and-analysis/weekly-oil-bulletin_en").decode('utf-8','replace')
url = None
for m in re.finditer(r'href="([^"]*document/download/[^"]*?)"', html, re.I):
    h = m.group(1)
    if h.startswith('/'): h = 'https://energy.ec.europa.eu' + h
    if re.search(r'Prices?_History', h, re.I):
        url = h.replace('&amp;','&'); break
print("dosya:", url[:120])

wb = openpyxl.load_workbook(io.BytesIO(al(url)), read_only=True, data_only=True)
ws = wb['Prices with taxes']
rows = []
for i, r in enumerate(ws.iter_rows(values_only=True)):
    rows.append(r)
    if i > 6: break
baslik, altbaslik, birim = rows[0], rows[1], rows[2]
ornek = rows[3]

print("\n" + "="*70)
print("SÜTUN HARİTASI — ülke blokları")
print("="*70)
# Düzen: [Tarih] [CTR] [6 fiyat] [para birimi] [CTR] [6 fiyat] [para birimi] ...
bloklar = []
for i, v in enumerate(baslik):
    if v == 'CTR':
        kod = ornek[i] if i < len(ornek) else None
        # bloğun sonundaki para birimi işareti
        para = None
        for j in range(i+1, min(i+9, len(ornek))):
            s = str(ornek[j]) if ornek[j] is not None else ''
            if re.match(r'^[A-Z]{3}_$', s): para = s; break
        bloklar.append((i, kod, para))
print(f"blok sayısı: {len(bloklar)}")
for i, kod, para in bloklar:
    print(f"  sütun {i:>3}  ülke={str(kod):<6} para={str(para):<6}")

kodlar = [str(k).rstrip('_') for _, k, _ in bloklar if k]
paralar = sorted({str(p) for _, _, p in bloklar if p})
print(f"\nülke kodları ({len(kodlar)}):", ", ".join(kodlar))
print("kullanılan para birimleri:", paralar)

print("\n" + "="*70)
print("WattTrack'in 45 ÜLKESİYLE ÖRTÜŞME")
print("="*70)
wt = ['TR','DE','FR','GB','US','CA','ES','IT','NL','BE','AT','CH','PT','IE','NO','SE',
      'DK','FI','IS','PL','CZ','SK','HU','RO','BG','GR','HR','SI','RS','BA','ME','MK',
      'AL','XK','MD','EE','LV','LT','LU','MT','CY','LI','MC','AD','SM']
bult = {k for k in kodlar if len(k) == 2}
var = [c for c in wt if c in bult]
yok = [c for c in wt if c not in bult]
print(f"KAPSANAN ({len(var)}/45):", ", ".join(var))
print(f"KAPSANMAYAN ({len(yok)}):", ", ".join(yok))

print("\n" + "="*70)
print("YAKIT SÜTUNLARI (ilk ülke bloğu)")
print("="*70)
i0 = bloklar[0][0]
for j in range(i0+1, i0+8):
    if j < len(altbaslik):
        print(f"  sütun {j}: {str(altbaslik[j])[:45]:<45} birim={birim[j] if j < len(birim) else ''}")
print("\nSONDA BİTTİ")
