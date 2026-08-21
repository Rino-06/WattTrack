"""Opet'in gerçek fiyat sayfasını bul + Enerji Petrol arşivinin derinliğini ölç."""
import re, urllib.request, gzip

UA = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 '
                    '(KHTML, like Gecko) Chrome/120 Safari/537.36',
      'Accept-Language': 'tr-TR,tr;q=0.9'}

def cek(url, limit=6_000_000):
    r = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(r, timeout=45) as f:
        ham = f.read(limit)
        if f.headers.get('Content-Encoding') == 'gzip':
            ham = gzip.decompress(ham)
        return f.getcode(), ham.decode('utf-8', 'replace')

def duz(h):
    h = re.sub(r'(?is)<(script|style).*?</\1>', ' ', h)
    return re.sub(r'\s+', ' ', re.sub(r'(?s)<[^>]+>', ' ', h)).strip()

print('=' * 74)
print('1) OPET ana sayfasindan fiyat baglantisi ara')
print('=' * 74)
try:
    kod, html = cek('https://www.opet.com.tr/')
    print(f'  HTTP {kod} boyut={len(html)}')
    baglar = re.findall(r'href=["\']([^"\']*(?:fiyat|price|akaryakit)[^"\']*)["\']', html, re.I)
    for b in sorted(set(baglar))[:25]:
        print('   ', b)
except Exception as e:
    print(f'  HATA: {type(e).__name__}: {e}')

print()
print('=' * 74)
print('2) OPET aday adresler')
print('=' * 74)
for yol in ['/akaryakit-fiyatlari/ankara', '/tr/akaryakit-fiyatlari',
            '/akaryakit-fiyatlari/guncel-akaryakit-fiyatlari',
            '/istasyonlar/akaryakit-fiyatlari', '/gunluk-akaryakit-fiyatlari']:
    try:
        kod, h = cek('https://www.opet.com.tr' + yol, 2_000_000)
        t = re.findall(r'(?is)<table[^>]*>.*?</table>', h)
        print(f'  {yol}: HTTP {kod} tablo={len(t)} boyut={len(h)}')
    except Exception as e:
        print(f'  {yol}: {type(e).__name__}')

print()
print('=' * 74)
print('3) ENERJI PETROL arsivi: Ankara + gecmis bir tarih gercekten geliyor mu')
print('=' * 74)
try:
    kod, h = cek('https://www.enerjipetrol.com/tr/past-prices/')
    tarihler = re.findall(r'\b(\d{1,2}\.\d{1,2}\.20\d\d)\b', duz(h))
    print(f'  arsivdeki tarih sayisi: {len(set(tarihler))}')
    ts = sorted(set(tarihler), key=lambda d: tuple(map(int, reversed(d.split('.')))))
    print(f'  en eski: {ts[0]}   en yeni: {ts[-1]}')
    tab = re.findall(r'(?is)<table[^>]*>.*?</table>', h)
    for i, t in enumerate(tab):
        satirlar = re.findall(r'(?is)<tr[^>]*>(.*?)</tr>', t)[:5]
        print(f'  -- tablo {i}: {len(re.findall(r"(?is)<tr", t))} satir --')
        for s in satirlar:
            hu = [duz(x) for x in re.findall(r'(?is)<t[dh][^>]*>(.*?)</t[dh]>', s)]
            if hu: print('    ', hu[:8])
except Exception as e:
    print(f'  HATA: {type(e).__name__}: {e}')
