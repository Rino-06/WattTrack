import sys, re, json
sys.path.insert(0, 'tools')
import importlib.util
spec = importlib.util.spec_from_file_location('fg', 'tools/fiyat-guncelle.py')
fg = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fg)

html = fg.indir("https://www.tppd.com.tr/gecmis-akaryakit-fiyatlari", 3_000_000).decode('utf-8', 'replace')

# Sayfadaki select elemanlarını bul (id="..." isimleriyle)
selects = re.findall(r'(?is)<select[^>]*(?:id|name)=["\']?([\w-]+)["\']?[^>]*>(.*?)</select>', html)
print("=== sayfadaki <select> elemanları ===")
for name, body in selects:
    opts = re.findall(r'<option[^>]*value=["\']?(\d+)["\']?[^>]*>([^<]+)</option>', body, re.I)
    print(f"-- select={name}  (secenek={len(opts)}) --")
    for v, t in opts[:15]:
        print(f"   {v} -> {t.strip()}")

# JS içinde ilçe/county çağrısı var mı (ajax url) ara
print()
print("=== 'county' veya 'ilce' geçen script parçaları ===")
for m in re.finditer(r'.{80}(county|ilce|İlçe|ilçe).{80}', html, re.I):
    print(" ...", m.group(0).replace("\n", " ").strip(), "...")

# id=6 seçiliyken ilçe dropdown'ı sunucu tarafı render mı ediyor? id parametresiyle tekrar iste
html2 = fg.indir("https://www.tppd.com.tr/gecmis-akaryakit-fiyatlari?id=6", 3_000_000).decode('utf-8', 'replace')
selects2 = re.findall(r'(?is)<select[^>]*(?:id|name)=["\']?([\w-]+)["\']?[^>]*>(.*?)</select>', html2)
print()
print("=== id=6 ile tekrar istekte <select> elemanları ===")
for name, body in selects2:
    opts = re.findall(r'<option[^>]*value=["\']?(\d+)["\']?[^>]*>([^<]+)</option>', body, re.I)
    print(f"-- select={name}  (secenek={len(opts)}) --")
    for v, t in opts[:30]:
        print(f"   {v} -> {t.strip()}")
