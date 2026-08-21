"""county değerinin hangi ilçeye denk geldiğini fiyattan doğrular.

Arşiv sayfası ilçe ADINI hiçbir yerde yazmıyor; yalnız sayısal county
değerini alıyor. Bu yüzden eşleme dolaylı kuruluyor: aynı gün için farklı
county değerlerinin GÜNLÜK fiyatları yan yana yazdırılıyor. Elde bilinen
bir Çankaya fiyatı varsa hangi değerin tuttuğu buradan görülüyor.

Ayrıştırma güncelleyicinin kendi ayrıştırıcısıyla AYNI (kopya değil,
doğrudan onu içe aktarıyor) — sonda başka bir şey okuyup yanlış güven
vermesin diye.
"""
import importlib.util, os, re
from collections import defaultdict
from datetime import datetime, timezone

yol = os.path.join(os.path.dirname(__file__), 'fiyat-guncelle.py')
spec = importlib.util.spec_from_file_location('fg', yol)
fg = importlib.util.module_from_spec(spec); spec.loader.exec_module(fg)

BAS = '01.06.2026'
bugun = datetime.now(timezone.utc).strftime('%d.%m.%Y')

def gunluk(county):
    url = (f"https://www.tppd.com.tr/gecmis-akaryakit-fiyatlari"
           f"?id={fg.TPPD_IL}&county={county}&StartDate={BAS}&EndDate={bugun}")
    html = fg.indir(url, 12_000_000).decode('utf-8', 'replace')
    tablolar = re.findall(r'(?is)<table[^>]*>.*?</table>', html)
    if not tablolar: return None, 'tablo yok'
    satirlar = re.findall(r'(?is)<tr[^>]*>(.*?)</tr>', tablolar[0])
    basliklar = [fg.duz(x) for x in re.findall(r'(?is)<t[dh][^>]*>(.*?)</t[dh]>', satirlar[0])]
    idx = {}
    for i, b in enumerate(basliklar):
        u = b.upper()
        if 'BENZİN' in u and 'petrol' not in idx: idx['petrol'] = i
        elif 'MOTORİN' in u and 'diesel' not in idx: idx['diesel'] = i
    out = []
    for s in satirlar[1:]:
        h = [fg.duz(x) for x in re.findall(r'(?is)<t[dh][^>]*>(.*?)</t[dh]>', s)]
        if len(h) < 2: continue
        p = fg.sayi(h[idx['petrol']]) if idx.get('petrol', 99) < len(h) else None
        d = fg.sayi(h[idx['diesel']]) if idx.get('diesel', 99) < len(h) else None
        if p or d: out.append((h[0], p, d))
    return out, None

print('=' * 72)
print(f'TPPD günlük fiyat — il={fg.TPPD_IL}, {BAS} … {bugun}')
print('Uygulamanın kullandığı county değeri:', fg.TPPD_ILCE)
print('=' * 72)
for c in (1000, 1001, 1002, 1006, 1010):
    try:
        satir, hata = gunluk(c)
    except Exception as e:
        print(f'  county={c:5d}  HATA: {e}'); continue
    if hata or not satir:
        print(f'  county={c:5d}  okunamadı ({hata})'); continue
    isaret = '  <== uygulamanın kullandığı' if c == fg.TPPD_ILCE else ''
    print(f'  county={c:5d}  satır={len(satir):3d}  SON: {satir[-1][0]}  '
          f'benzin={satir[-1][1]}  motorin={satir[-1][2]}{isaret}')
    for t, p, d in satir[-3:]:
        print(f'              {t}  benzin={p}  motorin={d}')
