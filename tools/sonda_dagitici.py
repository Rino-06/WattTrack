"""Opet / Petrol Ofisi / Aytemiz: arşiv var mı, ne kadar derin, kazınabilir mi?

Ölçüt üç şey — çünkü karar bunlara bağlı:
  1) sayfa sunucu tarafında mı üretiliyor (JS gerekiyorsa kazımak zor)
  2) GEÇMİŞ fiyat arşivi var mı, kaç yıl geriye gidiyor
  3) ilçe/il ayrımı var mı
"""
import re, urllib.request, gzip, io

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

ADAYLAR = [
    ('OPET  fiyat',      'https://www.opet.com.tr/akaryakit-fiyatlari'),
    ('OPET  gecmis',     'https://www.opet.com.tr/gecmis-akaryakit-fiyatlari'),
    ('PO    fiyat',      'https://www.petrolofisi.com.tr/akaryakit-fiyatlari'),
    ('PO    gecmis',     'https://www.petrolofisi.com.tr/akaryakit-fiyatlari/ankara-akaryakit-fiyatlari'),
    ('AYTEMIZ arsiv',    'https://www.aytemiz.com.tr/akaryakit-fiyatlari/arsiv-fiyat-listesi'),
    ('AYTEMIZ fiyat',    'https://www.aytemiz.com.tr/akaryakit-fiyatlari'),
    ('ENERJIPETROL',     'https://www.enerjipetrol.com/tr/past-prices/'),
]

for ad, url in ADAYLAR:
    print('=' * 74)
    print(f'{ad}   {url}')
    print('=' * 74)
    try:
        kod, html = cek(url)
    except Exception as e:
        print(f'  ERISILEMEDI: {type(e).__name__}: {e}')
        print()
        continue
    print(f'  HTTP {kod}   boyut={len(html)}')
    tablolar = re.findall(r'(?is)<table[^>]*>.*?</table>', html)
    print(f'  <table> sayisi: {len(tablolar)}')
    # tarih benzeri metin var mi (arsiv isareti)
    yillar = sorted(set(re.findall(r'\b(20[12]\d)\b', duz(html))))
    print(f'  metinde gecen yillar: {yillar[:12]}')
    # fiyat benzeri sayi
    fiyatlar = re.findall(r'\b\d{2},\d{2}\b', duz(html))
    print(f'  fiyat benzeri sayi: {len(fiyatlar)} ornek={fiyatlar[:6]}')
    # il/ilce secici
    sel = re.findall(r'(?is)<select[^>]*(?:id|name)=["\']?([\w-]+)', html)
    print(f'  <select> alanlari: {sel[:8]}')
    if tablolar:
        s = re.findall(r'(?is)<tr[^>]*>(.*?)</tr>', tablolar[0])[:4]
        for satir in s:
            h = [duz(x) for x in re.findall(r'(?is)<t[dh][^>]*>(.*?)</t[dh]>', satir)]
            if h: print('   ', h[:9])
    print()
