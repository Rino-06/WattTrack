"""county parametresi GERÇEKTEN dikkate alınıyor mu?

Yöntem: aynı il (Ankara, id=6) için üç ayrı istek — county'siz, county=1000
ve başka bir county. Sonuçlar BİRBİRİNDEN FARKLIYSA parametre işliyor
demektir. Hepsi aynı çıkarsa county yok sayılıyordur ve ilçe kırılımı
elimizde yok demektir (bunu bilmeden ayrıştırıcı yazmak yanlış olur).

Ayrıca ilçe listesini veren uç nokta aranıyor.
"""
import re, urllib.request, urllib.error, hashlib

UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                    '(KHTML, like Gecko) Chrome/126.0 Safari/537.36',
      'Accept-Language': 'tr-TR,tr;q=0.9',
      'X-Requested-With': 'XMLHttpRequest'}

def al(url, ek=None):
    b = {k: v for k, v in UA.items() if k != 'X-Requested-With'}
    if ek: b.update(ek)
    try:
        r = urllib.request.Request(url, headers=b)
        with urllib.request.urlopen(r, timeout=45) as f:
            return f.status, f.read(4_000_000)
    except urllib.error.HTTPError as e:
        return e.code, b''
    except Exception as e:
        return None, b''

def duz(h):
    h = re.sub(r'(?is)<(script|style)[^>]*>.*?</\1>', ' ', h)
    return re.sub(r'\s+', ' ', re.sub(r'(?s)<[^>]+>', ' ', h)).strip()

def satirlar(html, n=4):
    t = re.findall(r'(?is)<table[^>]*>.*?</table>', html)
    if not t: return []
    out = []
    for s in re.findall(r'(?is)<tr[^>]*>(.*?)</tr>', t[0])[1:n+1]:
        h = [duz(x) for x in re.findall(r'(?is)<t[dh][^>]*>(.*?)</t[dh]>', s)]
        if h: out.append(" | ".join(h))
    return out

TABAN = "https://www.tppd.com.tr/gecmis-akaryakit-fiyatlari"
ARALIK = "StartDate=01.08.2026&EndDate=21.08.2026"

print("=" * 70)
print("A) Aynı il, FARKLI county — sonuçlar ayrışıyor mu?")
print("=" * 70)
denemeler = [
    ("county YOK          ", f"{TABAN}?id=6&{ARALIK}"),
    ("county=1000         ", f"{TABAN}?id=6&county=1000&{ARALIK}"),
    ("county=1001         ", f"{TABAN}?id=6&county=1001&{ARALIK}"),
    ("county=9999 (saçma) ", f"{TABAN}?id=6&county=9999&{ARALIK}"),
]
imzalar = {}
for ad, u in denemeler:
    st, body = al(u)
    html = body.decode('utf-8', 'replace')
    sat = satirlar(html, 3)
    imza = hashlib.md5("|".join(sat).encode()).hexdigest()[:10]
    imzalar[ad] = imza
    print(f"\n  {ad} durum={st} imza={imza}")
    for s in sat: print("     ", s)

print("\n  --- KARAR ---")
benzersiz = set(imzalar.values())
if len(benzersiz) == 1:
    print("  TÜM county değerleri AYNI sonucu verdi -> parametre YOK SAYILIYOR")
    print("  (ilçe kırılımı YOK; veri il düzeyinde)")
else:
    print(f"  {len(benzersiz)} farklı sonuç -> county parametresi İŞLİYOR")
    for ad, im in imzalar.items(): print(f"     {ad} -> {im}")

print()
print("=" * 70)
print("B) İlçe listesini veren uç nokta var mı?")
print("=" * 70)
uclar = [
    f"https://www.tppd.com.tr/gecmis-akaryakit-fiyatlari?handler=Counties&id=6",
    f"https://www.tppd.com.tr/api/counties/6",
    f"https://www.tppd.com.tr/GetCounties?cityId=6",
    f"https://www.tppd.com.tr/akaryakit-fiyatlari?id=6",
]
for u in uclar:
    st, body = al(u, ek={'X-Requested-With': 'XMLHttpRequest'})
    ic = body.decode('utf-8', 'replace')[:400] if body else ''
    imza = 'ÇANKAYA VAR' if re.search(r'ankaya', ic, re.I) else ''
    print(f"  durum={st!s:5} boyut={len(body):>7} {imza}  {u[:80]}")
    if body and len(body) < 3000:
        print("     içerik:", ic[:250].replace('\n', ' '))

print()
print("=" * 70)
print("C) Ankara il sayfasında ilçe adı geçiyor mu?")
print("=" * 70)
st, body = al(f"{TABAN}?id=6&county=1000&{ARALIK}")
html = body.decode('utf-8', 'replace')
for ilce in ['Çankaya', 'ÇANKAYA', 'Keçiören', 'Yenimahalle', 'Mamak']:
    if ilce in html:
        i = html.index(ilce)
        print(f"  '{ilce}' GEÇİYOR — bağlam: ...{duz(html[max(0,i-90):i+60])}...")
if not any(x in html for x in ['Çankaya', 'ÇANKAYA', 'Keçiören']):
    print("  Sayfada hiçbir ilçe adı geçmiyor.")

print("\nSONDA BİTTİ")
