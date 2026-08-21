import sys, re
sys.path.insert(0, 'tools')
import importlib.util
spec = importlib.util.spec_from_file_location('fg', 'tools/fiyat-guncelle.py')
fg = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fg)

html = fg.indir("https://www.tppd.com.tr/gecmis-akaryakit-fiyatlari", 3_000_000).decode('utf-8', 'replace')

print("=== city select onchange / data- attribute ===")
m = re.search(r'(?is)<select[^>]*id=["\']?city["\']?.{0,400}', html)
print(m.group(0) if m else "bulunamadi")

print()
print("=== 'county' geçen HER YER (script dahil) ===")
for m in re.finditer(r'.{60}[Cc]ounty.{60}', html):
    print(" ...", m.group(0).replace("\n"," ").strip(), "...")

print()
print("=== script src listesi ===")
for m in re.finditer(r'<script[^>]*src=["\']([^"\']+)["\']', html, re.I):
    print(" ", m.group(1))

print()
print("=== inline <script> içinde 'ajax' veya 'ilce' veya '/api' geçenler ===")
for m in re.finditer(r'(?is)<script(?![^>]*src)[^>]*>(.*?)</script>', html):
    body = m.group(1)
    if re.search(r'ajax|ilce|/api|county', body, re.I):
        print(body[:1500])
        print("---")
