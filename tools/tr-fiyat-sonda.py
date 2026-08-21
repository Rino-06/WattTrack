"""Türkiye akaryakıt fiyat arşivleri — kazınabilirlik sondası.

Amaç: üç dağıtıcının geçmiş fiyat sayfasından ANKARA / ÇANKAYA verisi
gerçekten çekilebiliyor mu? Sayfa sunucuda mı üretiliyor (kazınabilir),
yoksa JavaScript ile mi doluyor (kazınamaz)?

Her kaynak için: durum kodu, içerik tipi, tablo var mı, tablonun ilk
satırları, Çankaya/Ankara geçiyor mu, fiyat benzeri sayılar var mı.
"""
import gzip, io, json, re, urllib.request, urllib.error

UA = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                  '(KHTML, like Gecko) Chrome/126.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'tr-TR,tr;q=0.9',
}

def al(url, veri=None, ek=None):
    basliklar = dict(UA)
    if ek: basliklar.update(ek)
    try:
        r = urllib.request.Request(url, data=veri, headers=basliklar)
        with urllib.request.urlopen(r, timeout=45) as f:
            ham = f.read(6_000_000)
            if f.headers.get('Content-Encoding') == 'gzip':
                ham = gzip.decompress(ham)
            return f.status, f.headers.get('Content-Type', ''), ham
    except urllib.error.HTTPError as e:
        return e.code, 'HTTPError: ' + str(e.reason), b''
    except Exception as e:
        return None, type(e).__name__ + ': ' + str(e)[:120], b''

def etiketsiz(h):
    h = re.sub(r'(?is)<(script|style)[^>]*>.*?</\1>', ' ', h)
    return re.sub(r'\s+', ' ', re.sub(r'(?s)<[^>]+>', ' ', h)).strip()

def tablo_incele(html, ad):
    tablolar = re.findall(r'(?is)<table[^>]*>.*?</table>', html)
    print(f"    <table> sayısı: {len(tablolar)}")
    for ti, t in enumerate(tablolar[:2]):
        satir = re.findall(r'(?is)<tr[^>]*>(.*?)</tr>', t)
        print(f"    --- tablo {ti+1}: {len(satir)} satır ---")
        for s in satir[:8]:
            h = re.findall(r'(?is)<t[dh][^>]*>(.*?)</t[dh]>', s)
            h = [etiketsiz(x)[:24] for x in h]
            if any(h): print("      |", " | ".join(h[:8]))
    return len(tablolar)

def ozet(ad, url, veri=None, ek=None):
    print("\n" + "=" * 70)
    print(ad)
    print("=" * 70)
    print("  ", url[:150])
    st, ct, body = al(url, veri, ek)
    print(f"    durum={st}  tip={ct[:70]}  boyut={len(body)}")
    if not body:
        return None
    html = body.decode('utf-8', 'replace')
    for kelime in ['Çankaya', 'ÇANKAYA', 'Cankaya', 'Ankara', 'ANKARA']:
        if kelime in html:
            print(f"    '{kelime}' GEÇİYOR")
    for kelime in ['Benzin', 'BENZİN', 'Motorin', 'MOTORİN', 'LPG', 'Otogaz']:
        if kelime in html:
            print(f"    yakıt terimi: {kelime}")
    n = tablo_incele(html, ad)
    # JS ile mi doluyor?
    if n == 0:
        print("    <table> YOK — sayfa JavaScript ile doluyor olabilir")
        for kalip in [r'fetch\([\'"]([^\'"]+)', r'url\s*:\s*[\'"]([^\'"]+)',
                      r'ajax[^)]*[\'"]([^\'"]+\.(?:json|ashx|aspx)[^\'"]*)']:
            for m in re.findall(kalip, html)[:5]:
                if len(str(m)) > 4: print("      olası veri ucu:", str(m)[:110])
    # gömülü JSON
    for m in re.finditer(r'(\[\s*\{[^\[\]]{80,4000}\}\s*\])', html):
        try:
            d = json.loads(m.group(1))
            if isinstance(d, list) and d and isinstance(d[0], dict):
                print("    gömülü JSON dizisi, ilk kayıt anahtarları:", list(d[0].keys())[:10])
                break
        except Exception:
            pass
    # il/ilçe seçenekleri
    sec = re.findall(r'(?is)<select[^>]*name=["\']?([\w\.\-]+)[^>]*>(.*?)</select>', html)
    for adi, icerik in sec[:4]:
        opts = re.findall(r'(?is)<option[^>]*value=["\']?([^"\'>\s]*)["\']?[^>]*>(.*?)</option>', icerik)
        if opts:
            print(f"    <select {adi}>: {len(opts)} seçenek — örnek:",
                  ", ".join(f"{v}={etiketsiz(t)[:16]}" for v, t in opts[:4]))
            for v, t in opts:
                if 'ankaya' in etiketsiz(t):
                    print(f"      >>> ÇANKAYA seçeneği: value={v}")
    return html

ozet("1) TPPD — geçmiş akaryakıt fiyatları (Ankara, tarih aralıklı)",
     "https://www.tppd.com.tr/gecmis-akaryakit-fiyatlari?id=6&county=1000&StartDate=01.01.2025&EndDate=21.08.2026")

ozet("2) Aytemiz — arşiv fiyat listesi",
     "https://www.aytemiz.com.tr/akaryakit-fiyatlari/arsiv-fiyat-listesi")

ozet("3) Enerji Petrol — geçmiş fiyatlar",
     "https://www.enerjipetrol.com/tr/past-prices/")

ozet("4) EPDK bildirim portalı (resmî, karşılaştırma için)",
     "https://bildirim.epdk.gov.tr/bildirim-portal/faces/pages/tarife/petrol/illereGorePetrolAkaryakitFiyatSorgula.xhtml")

print("\n" + "=" * 70)
print("SONDA BİTTİ")
print("=" * 70)
