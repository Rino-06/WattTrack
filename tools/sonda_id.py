import sys, re, json
sys.path.insert(0, 'tools')
import importlib.util
spec = importlib.util.spec_from_file_location('fg', 'tools/fiyat-guncelle.py')
fg = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fg)

js = fg.indir("https://www.tppd.com.tr/assets/js/turkiye.js", 3_000_000).decode('utf-8', 'replace')
print("dosya boyutu:", len(js))
print()

# ANKARA'yı ve civarındaki ilçe verisini bul
i = js.upper().find("ANKARA")
print("=== 'ANKARA' etrafındaki 3000 karakter ===")
print(js[max(0,i-200):i+3000])
