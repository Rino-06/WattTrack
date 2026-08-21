"""TPPD ayrıştırıcısı için son ayrıntılar.

1. tur kanıtladı: sayfa sunucuda üretiliyor, tablo düz HTML, tarih aralığı
GET parametresi, il seçimi id=, ilçe seçimi county=.

Bu tur: Çankaya'nın gerçek ilçe kodu ne? Sütun başlıkları tam olarak ne?
LPG/otogaz var mı? Geçmiş nereye kadar gidiyor? Enerji Petrol ile tutuyor mu?
"""
import re, urllib.request, urllib.error

UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                    '(KHTML, like Gecko) Chrome/126.0 Safari/537.36',
      'Accept-Language': 'tr-TR,tr;q=0.9'}

def al(url):
    try:
        r = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(r, timeout=45) as f:
            return f.status, f.read(6_000_000)
    except urllib.error.HTTPError as e:
        return e.code, b''
    except Exception as e:
        print("   hata:", type(e).__name__, str(e)[:90]); return None, b''

def duz(h):
    h = re.sub(r'(?is)<(script|style)[^>]*>.*?</\1>', ' ', h)
    return re.sub(r'\s+', ' ', re.sub(r'(?s)<[^>]+>', ' ', h)).strip()

TABAN = "https://www.tppd.com.tr/gecmis-akaryakit-fiyatlari"

print("=" * 70)
print("A) ANKARA (id=6) sayfasındaki İLÇE listesi — Çankaya'yı bul")
print("=" * 70)
st, body = al(f"{TABAN}?id=6")
html = body.decode('utf-8', 'replace')
print("  durum:", st, " boyut:", len(html))
for adi, icerik in re.findall(r'(?is)<select[^>]*(?:name|id)=["\']?([\w\.\-]+)[^>]*>(.*?)</select>', html):
    opts = re.findall(r'(?is)<option[^>]*value=["\']?([^"\'>\s]*)["\']?[^>]*>(.*?)</option>', icerik)
    if not opts: continue
    ilce = [(v, duz(t)) for v, t in opts if 'ankaya' in duz(t).lower()]
    print(f"  <select {adi}>: {len(opts)} seçenek")
    if ilce:
        for v, t in ilce: print(f"     >>> ÇANKAYA bulundu: value={v}  metin={t}")
    else:
        print("     ilk 6:", ", ".join(f"{v}={t[:20]}" for v, t in opts[:6]))

print()
print("=" * 70)
print("B) Çankaya + geniş tarih aralığı — tam başlıklar, satır sayısı, aralık")
print("=" * 70)
url = f"{TABAN}?id=6&county=1000&StartDate=01.01.2020&EndDate=21.08.2026"
print("  ", url)
st, body = al(url)
html = body.decode('utf-8', 'replace')
print("  durum:", st, " boyut:", len(html))

# sayfada hangi il/ilçe seçili görünüyor?
for m in re.finditer(r'(?is)<option[^>]*selected[^>]*>(.*?)</option>', html):
    print("  SEÇİLİ görünen:", duz(m.group(1))[:40])

tablolar = re.findall(r'(?is)<table[^>]*>.*?</table>', html)
print("  tablo sayısı:", len(tablolar))
if tablolar:
    satir = re.findall(r'(?is)<tr[^>]*>(.*?)</tr>', tablolar[0])
    print("  satır sayısı:", len(satir))
    basliklar = re.findall(r'(?is)<t[dh][^>]*>(.*?)</t[dh]>', satir[0])
    print("\n  --- TAM SÜTUN BAŞLIKLARI ---")
    for i, b in enumerate(basliklar):
        print(f"    [{i}] {duz(b)}")
    print("\n  --- ilk 3 veri satırı ---")
    for s in satir[1:4]:
        h = [duz(x) for x in re.findall(r'(?is)<t[dh][^>]*>(.*?)</t[dh]>', s)]
        print("    ", " | ".join(h))
    print("  --- son 3 veri satırı ---")
    for s in satir[-3:]:
        h = [duz(x) for x in re.findall(r'(?is)<t[dh][^>]*>(.*?)</t[dh]>', s)]
        print("    ", " | ".join(h))
    tarihler = []
    for s in satir[1:]:
        h = [duz(x) for x in re.findall(r'(?is)<t[dh][^>]*>(.*?)</t[dh]>', s)]
        if h: tarihler.append(h[0])
    if tarihler:
        print(f"\n  tarih aralığı: {tarihler[0]}  …  {tarihler[-1]}   (veri satırı={len(tarihler)})")

print()
print("=" * 70)
print("C) LPG / OTOGAZ ayrı sayfada mı?")
print("=" * 70)
st, body = al(TABAN)
h2 = body.decode('utf-8', 'replace')
for m in re.finditer(r'href="([^"]*(?:otogaz|lpg|fiyat)[^"]*)"', h2, re.I):
    u = m.group(1)
    if 'fiyat' in u.lower(): print("   bağlantı:", u[:110])
print("   sayfada 'Otogaz' geçiyor mu:", 'Otogaz' in h2 or 'OTOGAZ' in h2)

print()
print("=" * 70)
print("D) Enerji Petrol ile ÇAPRAZ DOĞRULAMA (Ankara, güncel)")
print("=" * 70)
st, body = al("https://www.enerjipetrol.com/tr/past-prices/")
# sayfa windows-1254 (Türkçe) — doğru çözümle
ep = body.decode('windows-1254', 'replace')
t = re.findall(r'(?is)<table[^>]*>.*?</table>', ep)
if len(t) > 1:
    for s in re.findall(r'(?is)<tr[^>]*>(.*?)</tr>', t[1]):
        h = [duz(x) for x in re.findall(r'(?is)<t[dh][^>]*>(.*?)</t[dh]>', s)]
        if h and h[0].strip() in ('Ankara', 'Şehir'):
            print("   ", " | ".join(h[:5]))

print("\nSONDA BİTTİ")
