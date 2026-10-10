# Barcode Beach · QR Menü

Barcode Beach & Restaurant (Boğazkent · Belek) için Akdeniz temalı dijital QR menü ve yönetim paneli.

- **Menü:** `http://localhost:3000`
- **Yönetim paneli:** `http://localhost:3000/admin`
- **İlk şifre:** `barcode2026` → ilk girişte **Ayarlar › Yönetici Şifresi** bölümünden değiştirin.

## Çalıştırma

Node.js 18 veya üzeri yeterli, `npm install` gerekmez (hiç bağımlılık yok).

```bash
node server.js
```

Port değiştirmek için: `PORT=8080 node server.js`

## Yönetim panelinde neler var

| Bölüm | Yapabildikleriniz |
|---|---|
| **Ürünler** | Ekle / düzenle / kopyala / sil · TR-EN ad ve açıklama · tek fiyat veya seçenekli fiyat (kadeh, 35 cl, 70 cl…) · listede doğrudan fiyat değiştirme · Menüde/Gizli ve Tükendi anahtarları · sürükle-bırak sıralama · arama ve filtre (tükenenler, fotoğrafsızlar) |
| **Toplu Fiyat** | Tüm menüye, bir gruba ya da kategoriye % veya ₺ zam/indirim, 5/10/50 ₺ yuvarlama, uygulamadan önce önizleme |
| **Fotoğraflar** | Tıkla veya sürükle-bırak ile yükle (otomatik küçültülür ve WebP'ye çevrilir) · galeriden seç · kaldır |
| **Kategoriler** | Ekle / düzenle / sil · kemerli kapak fotoğrafı · grup değiştirme · sıralama · gizleme · menü gruplarını (Yemekler, Alkollü…) yönetme |
| **Alerjenler** | 14 alerjen hazır · ad, emoji ikon düzenleme · yeni alerjen ekleme · bir alerjeni tek ekranda birden çok ürüne atama |
| **Ayarlar** | İşletme adı, karşılama cümlesi, kapak fotoğrafı, telefon, Wi-Fi, Instagram, adres, alerjen notu · şifre değiştirme · otomatik yedekler ve geri yükleme · JSON dışa/içe aktarma |
| **QR Kod** | Menü adresine göre QR üretimi · masa numaralı PNG indirme · masa aralığı için yazdırılabilir A4 QR kartları |

Her kayıttan önce `data/backups/` klasörüne otomatik yedek alınır (son 30 yedek).

## Müşteri menüsü

- Animasyonlu Akdeniz gün batımı kapağı, dalga geçişleri, kemerli kategori kartları
- TR / EN dil seçimi (cihaz diline göre otomatik açılır)
- Arama (Türkçe karakterlere duyarsız), alerjen filtresi (seçilen alerjenleri içeren ürünleri gizler)
- Ürün detayında büyük fotoğraf, seçenekli fiyatlar, alerjenler; aşağı kaydırarak veya telefonun geri tuşuyla kapanır
- Gece moduna otomatik uyum, mobil öncelikli

## GitHub Pages ile yayın

Site, `public/` klasöründen GitHub Pages'e otomatik yayınlanır (`.github/workflows/pages.yml`). Her push'ta ve yönetim panelinden yapılan her kayıtta yeniden yayınlanır, menü 1-2 dakika içinde güncellenir.

- **Menü:** `https://<kullanıcı>.github.io/barcode-qr-menu/`
- **Yönetim paneli:** `https://<kullanıcı>.github.io/barcode-qr-menu/admin.html`

Panel GitHub Pages'te açıldığında GitHub erişim anahtarı (token) ister:

1. https://github.com/settings/personal-access-tokens/new adresini açın.
2. **Repository access:** Only select repositories → `barcode-qr-menu`
3. **Permissions → Contents:** Read and write
4. Oluşan `github_pat_…` anahtarını panele yapıştırın. Anahtar yalnızca o tarayıcıda saklanır.

Eski menü sürümleri GitHub'daki değişiklik geçmişinde durur.

## Klasörler

```
public/              Yayınlanan site (GitHub Pages)
  index.html         Karşılama ekranı + müşteri menüsü (TR / EN / RU)
  admin.html         Yönetim paneli
  data/menu.json     Tüm menü verisi
  uploads/           Ürün ve arka plan fotoğrafları
server.js            İsteğe bağlı yerel sunucu (node server.js), panel bu durumda şifreyle çalışır
tools/seed.js        Menüyü ilk haline sıfırlar (menu.json'un üzerine yazar)
tools/add-ru.js      Eksik Rusça çevirileri doldurur
```

## Notlar

- Ürün ve fotoğraflar barcodebeachbogazkent.com sitesinden alındı. Sitede fiyatı belirsiz olan birkaç kalemi (ör. Beylerbeyi/Efe şişe fiyatları, beyaz şarap şişeleri, Becks) yakın kalemlerin fiyatıyla doldurdum. Lütfen panelden kontrol edin.
- Alerjen atamaları tarif bilgisine göre tahminidir. Mutfakla birlikte gözden geçirilmelidir.
- Mezelerin sitede ayrı fotoğrafı yok, panelden eklenebilir.
