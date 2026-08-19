# MİLAS PERSONAL TRAINING — Üye Takip Paneli

Milas Personal Training spor salonu için hazırlanmış, üye ve antrenör girişli takip paneli.
Referans tasarımdaki koyu zemin + turuncu vurgu paletine ve kart/pill menü diline sadık kalınarak
sıfırdan geliştirildi. Kurulum gerektirmez: `index.html` dosyasını tarayıcıda açmak yeterlidir.

## Demo hesapları

| Rol | E-posta | Şifre |
|---|---|---|
| Üye | `ayse@milaspt.com` | `1234` |
| Üye | `mert@milaspt.com` | `1234` |
| Üye | `zeynep@milaspt.com` | `1234` |
| Üye | `can@milaspt.com` | `1234` |
| Antrenör | `koc@milaspt.com` | `1234` |

Giriş ekranındaki "Üye olarak gir" / "Antrenör olarak gir" düğmeleri tek tıkla oturum açar.

## Çalıştırma

```bash
# Doğrudan açmak yerine küçük bir sunucu önerilir (ES modülleri için)
python3 -m http.server 8000
# tarayıcıda: http://localhost:8000
```

## Üye ekranları

- **Ana Sayfa** — haftalık aktivite kartı (hafta/ay/3 ay), haftalık hedef halkası, antrenman
  yoğunluğu trendi, BMI göstergesi, su takibi, günün beslenme özeti, üyelik paketi, yaklaşan
  dersler, antrenörden gelen bildirimler, ağırlık grafiği, kas grubu dağılımı, etkinlikler ve albüm önizlemesi.
- **Antrenmanlar** — antrenörün girdiği tüm antrenmanlar; kas grubuna göre filtreleme, hareket
  bazında set / tekrar / ağırlık dökümü, tonaj ve RPE bilgisi, antrenör notu.
- **Ders Programı** — aylık takvim, yaklaşan dersler ve **erteleme / iptal talebi** oluşturma;
  taleplerin durumu ve antrenör yanıtı.
- **Beslenme** — günlük kalori ve makro takibi, öğün ekleme/silme, su takibi, 14 günlük kalori trendi.
- **Gelişim** — kilo, yağ oranı, kas oranı, bel/göğüs/kol ölçümleri; metrik bazlı grafik,
  BMI göstergesi, ölçüm geçmişi ve yeni ölçüm ekleme.
- **Üyeliğim** — paket detayı, kalan seans ve gün, ödeme geçmişi/bakiye, dondurma ve yenileme talebi.
- **Etkinlikler** — salon etkinlikleri, kontenjan takibi, katılma / kaydı iptal etme.
- **Albüm** — gelişim fotoğrafları yükleme (cihazdan seçilir, tarayıcıda saklanır), büyütme ve silme.
- **Bildirimler** — antrenörden gelen mesajlar ve antrenöre mesaj gönderme.

## Antrenör ekranları

- **Panel** — günün ders programı, haftalık ders yükü, bekleyen talepler, üye tablosu,
  yaklaşan paket bitişleri, son girilen antrenmanlar.
- **Antrenman Gir** — üye seç, tarih / kas grubu / süre / RPE gir, hareket ekle ve her hareket için
  set–tekrar–ağırlık–dinlenme kaydet. Kas grubuna göre hareket kütüphanesi önerilir; son antrenman
  "Kopyala" ile forma yüklenir. Kayıt sırasında o günün seansı tamamlandı sayılır, paketten seans
  düşülür ve istenirse üyeye bildirim gider.
- **Üyeler** — üye kartları ve üye detayı (paket düzenleme, kilo gelişimi, kas grubu dengesi,
  kalori özeti, albüm, antrenman geçmişi); yeni üye ekleme.
- **Ders Planlama** — güne göre ders listesi, yeni ders planlama (üye otomatik bildirim alır), ders silme.
- **Talepler** — erteleme / iptal / üyelik taleplerini yanıtla. Onaylanan erteleme, dersin
  durumunu günceller ve yeni tarihe seans açar; her sonuçta üyeye bildirim düşer.
- **Bildirimler** — tek üyeye veya tüm salona duyuru; hazır şablonlar ve gönderim geçmişi.
- **Etkinlikler** — etkinlik oluşturma (tüm üyelere otomatik duyurulur), katılımcı listesi, silme.

## Teknik notlar

- Bağımlılık yok: saf HTML + CSS + ES modülleri. Grafiklerin tamamı elle yazılmış inline SVG'dir
  (çubuk, alan/çizgi, halka, yarım gösterge, yığın bar).
- Veriler `localStorage` üzerinde tutulur (`mpt.db.v3`) ve ilk açılışta gerçekçi demo verisiyle
  doldurulur. Sol raydaki yenile düğmesi demo verisini sıfırlar.
- Koyu ve açık tema desteği; tercih tarayıcıda saklanır.
- Mobil, tablet ve masaüstü için duyarlı yerleşim; mobilde menü alt bara taşınır.
- Tüm kullanıcı girdileri ekrana basılmadan önce kaçışlanır (`esc`).

## Dosya yapısı

```
index.html
assets/
  css/styles.css          tasarım sistemi (renk tokenları, kart/grid/tablo/modal bileşenleri)
  js/
    app.js                yönlendirme, kabuk, giriş ekranı
    store.js              veri modeli, demo tohum verisi, sorgular ve türetilmiş metrikler
    ui.js                 ikonlar, grafikler, modal, toast, tema
    views/member.js       üye ekranları
    views/trainer.js      antrenör ekranları
```

> Not: Panel bir demo/prototiptir; veriler tarayıcıda tutulduğu için gerçek kullanımda bir
> sunucu ve kimlik doğrulama katmanıyla değiştirilmelidir.
