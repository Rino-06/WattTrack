# WattTrack

EV şarj harcaması takibi. Veriler yalnızca cihazda (IndexedDB / Dexie.js)
saklanır; tek dış bağlantı isteğe bağlı döviz kuru sorgusudur.

- Yayın kontrol listesi: [KURULUM.md](KURULUM.md)
- Testler: `cd test && npm install && npm test`

---

## Açılış animasyonu (splash) medya dosyaları — WT-37

Açılış ekranı bir videoyla oynatılır. **Video dosyaları depoda değildir**;
aşağıdaki dosyalar kök dizine konduğunda video kendiliğinden devreye girer.
Dosyalar yokken uygulama statik logoyla açılır — bu bilinçli bir yedek yol,
hata değildir.

| Dosya | Zorunlu | Açıklama |
|---|---|---|
| `splash.mp4` | ana kaynak | H.264, yuv420p, **ses kanalı YOK** |
| `splash.webm` | opsiyonel | VP9; yalnız mp4'ten küçükse ekle |
| `splash-poster.png` | evet | videonun ilk karesi (siyah flaş olmasın) |

**Bu ölçüler değişirse açılış bozulur — güncellerken buraya da bak:**

- **Süre:** en fazla 2,0 saniye (ideal 1,2–1,5 sn).
  `SPLASH_FAILSAFE_MS = 2500` bunu varsayıyor; daha uzun bir video güvenlik
  ağı tarafından yarıda kesilir.
- **Dosya boyutu:** MP4 ≤ 1,2 MB. İlk açılış maliyetine doğrudan eklenir.
  Aşarsa `sw.js` içindeki `OPTIONAL_ASSETS` listesinden çıkar — video normal
  ağ isteğiyle gelir, ilk açılışta statik yedek görünür.
- **Çözünürlük:** 1080×1080 kare (her ekran oranında kırpılmadan sığar).
- **Arka plan:** videonun arka planı splash arka planıyla AYNI renk olmalı —
  açık tema `#F1F7F2`, koyu tema `#0f172a`. Tek videoyla iki tema
  desteklenemiyorsa `splash-dark.mp4` ekle ve `initSplash()` içinde tema
  tercihine göre `src` seç.

### Davranış

- Splash, **video bitince VE uygulama verisi hazır olunca** kapanır; ikisinden
  geç olanı belirler. Her hâlükârda 2500 ms sonra zorla kapanır.
- Video oturumda **yalnız bir kez** oynar (`sessionStorage: wt-splash-seen`);
  ikinci açılışta splash tamamen atlanır.
- Yedek yollar: otomatik oynatma engellenirse (`play()` reject) veya dosya
  yoksa (`onerror`) statik logo + 900 ms; `prefers-reduced-motion: reduce`
  açıksa video hiç oynatılmaz, statik logo + 400 ms.
- `muted` ve `playsinline` özniteliklerini KALDIRMA — onlar olmadan iOS Safari
  ve Android Chrome otomatik oynatmayı engeller.

### Elle doğrulanması gerekenler (jsdom bunları koşamaz)

- iOS Safari ve Android Chrome'da video otomatik oynuyor mu?
- Uçak modunda ilk açılış (service worker önbelleğinden) çalışıyor mu?
- `splash.mp4` silinince uygulama yine açılıyor, statik logo görünüyor mu?
- `prefers-reduced-motion` açıkken video oynamıyor mu?
