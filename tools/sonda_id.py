import sys, re
sys.path.insert(0, 'tools')
import importlib.util
spec = importlib.util.spec_from_file_location('fg', 'tools/fiyat-guncelle.py')
fg = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fg)

# 1) Ana sayfadan id -> şirket adı eşlemesini bul (select/option kalıbı)
html = fg.indir("https://www.tppd.com.tr/gecmis-akaryakit-fiyatlari", 3_000_000).decode('utf-8', 'replace')
opts = re.findall(r'<option[^>]*value=["\']?(\d+)["\']?[^>]*>([^<]+)</option>', html, re.I)
print("=== id seçenekleri (ilk 40) ===")
for v, t in opts[:40]:
    print(f"  id={v}  ->  {t.strip()}")
print(f"toplam seçenek: {len(opts)}")

print()
print("=== id=6 için ham temmuz satırları (county=1000) ===")
tablo = fg.tr_tablo()
print("2026-07 secilen deger:", tablo['m'].get('2026-07'))

# Ham satırları da göster
url = (f"https://www.tppd.com.tr/gecmis-akaryakit-fiyatlari"
       f"?id=6&county=1000&StartDate=01.07.2026&EndDate=31.07.2026")
html2 = fg.indir(url, 3_000_000).decode('utf-8', 'replace')
tablolar = re.findall(r'(?is)<table[^>]*>.*?</table>', html2)
if tablolar:
    satirlar = re.findall(r'(?is)<tr[^>]*>(.*?)</tr>', tablolar[0])
    basliklar = [fg.duz(x) for x in re.findall(r'(?is)<t[dh][^>]*>(.*?)</t[dh]>', satirlar[0])]
    print("basliklar:", basliklar)
    for s in satirlar[1:]:
        h = [fg.duz(x) for x in re.findall(r'(?is)<t[dh][^>]*>(.*?)</t[dh]>', s)]
        print(" ", h)
else:
    print("tablo bulunamadi")
