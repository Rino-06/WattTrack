"""county parametresinin hangi ilçeye denk geldiğini bulur.

Arşiv sayfası ilçe ADINI yazmıyor, yalnız sayısal county değerini alıyor.
Bu yüzden eşleme dolaylı kuruluyor: önce ilçe listesini sunan sayfadan
(varsa) ad-değer çiftleri okunuyor, olmazsa birkaç county değeri için
BUGÜNÜN fiyatı yazdırılıp elle bilinen değerle karşılaştırılıyor.
"""
import re, urllib.request
from datetime import datetime

BAS = 'https://www.tppd.com.tr'
ARSIV = BAS + '/gecmis-akaryakit-fiyatlari?id=6&county={c}&StartDate={b}&EndDate={s}'
UA = {'User-Agent': 'Mozilla/5.0 (WattTrack fiyat sondasi)'}

def cek(url):
    r = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(r, timeout=60) as f:
        return f.read().decode('utf-8', 'replace')

def temiz(h):
    h = re.sub(r'(?is)<(script|style).*?</\1>', ' ', h)
    return re.sub(r'\s+', ' ', re.sub(r'(?s)<[^>]+>', ' ', h)).strip()

# 1) İlçe listesini sunan sayfayı ara: <option value="1000">ÇANKAYA</option>
print('=' * 70)
print('1) İlçe adı -> county değeri eşlemesi aranıyor')
print('=' * 70)
bulundu = False
for yol in ['/akaryakit-fiyatlari', '/gecmis-akaryakit-fiyatlari?id=6',
            '/akaryakit-fiyatlari?id=6']:
    try:
        h = cek(BAS + yol)
    except Exception as e:
        print(f'  {yol}: {e}'); continue
    ops = re.findall(r'<option[^>]*value=["\']?(\d{3,5})["\']?[^>]*>([^<]{2,40})</option>', h, re.I)
    ops = [(v, a.strip()) for v, a in ops if a.strip()]
    if ops:
        bulundu = True
        print(f'  {yol}: {len(ops)} seçenek')
        for v, a in ops:
            if v in ('1000', '1001') or 'ANKAYA' in a.upper():
                print(f'    >>> value={v}  ad={a}')
        print('    ilk 12:', ops[:12])
    else:
        print(f'  {yol}: option bulunamadı')
if not bulundu:
    print('  (sayfa ilçe listesini sunucu tarafında üretmiyor olabilir)')

# 2) Bugünün fiyatı: birkaç county değeri yan yana
print()
print('=' * 70)
print('2) Bugünün fiyatı — county değerlerine göre')
print('=' * 70)
bugun = datetime.now().strftime('%d.%m.%Y')
bas = datetime.now().strftime('01.%m.%Y')
for c in (1000, 1001, 1002, 1006):
    try:
        h = cek(ARSIV.format(c=c, b=bas, s=bugun))
    except Exception as e:
        print(f'  county={c}: HATA {e}'); continue
    t = temiz(h)
    # son satır: tarih + fiyatlar
    satir = re.findall(r'(\d{2}\.\d{2}\.\d{4})((?:\s+\d+[.,]\d+)+)', t)
    if not satir:
        print(f'  county={c}: veri satırı okunamadı'); continue
    tarih, ham = satir[-1]
    say = [x.replace(',', '.') for x in ham.split()]
    print(f'  county={c:5d}  {tarih}  benzin={say[0]}  motorin={say[2] if len(say)>2 else "?"}'
          f'   (tüm sütunlar: {say})')
