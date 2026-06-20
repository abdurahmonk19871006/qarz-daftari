# Qarz Daftari — Android ilova loyihasi

Bu papkada **to'liq tayyor manba kod** bor. Quyidagi qadamlarni bajarib,
shaxsiy foydalanish uchun APK fayl yasashingiz mumkin.

Ilova **internetga ulanmaydi** — barcha ma'lumotlar (kontaktlar, qarzlar,
eslatmalar, rasmlar) faqat telefoningizning o'zida saqlanadi.

> 💡 **Kompyuteringiz kuchsiz bo'lsa**, Android Studio o'rnatmasdan
> APK olishning yo'li bor — qarang: **`APK_OLISH_OSON_YOL.md`**
> (APK GitHub'ning bepul serverida quriladi, sizning kompyuteringizda
> emas — faqat brauzer kerak).

Pastdagi yo'riqnoma esa Android Studio o'rnatib, **kompyuteringizda**
qurish uchun (agar kompyuteringiz buni ko'tara olsa).

---

## 1-qadam: Kerakli dasturlarni o'rnatish (kompyuteringizga)

1. **Node.js** (18 yoki undan yuqori) — https://nodejs.org dan yuklab oling
2. **Android Studio** — https://developer.android.com/studio dan yuklab oling
   (JDK Android Studio bilan birga keladi, alohida o'rnatish shart emas)

O'rnatilganini tekshirish uchun terminal/cmd'da:
```
node --version
npm --version
```

---

## 2-qadam: Loyihani tayyorlash

Ushbu `qarz-daftari-android` papkasini kompyuteringizga ko'chiring, so'ng
terminalda (cmd / PowerShell / Terminal) shu papka ichiga kiring:

```
cd qarz-daftari-android
npm install
```

Bu barcha kerakli kutubxonalarni yuklab oladi (internet kerak, bir martalik).

---

## 3-qadam: Veb-versiyani sinab ko'rish (ixtiyoriy, lekin tavsiya etiladi)

APK yasashdan oldin brauzerda tezkor tekshirib ko'rish mumkin:

```
npm run dev
```

Terminalda chiqqan havolani (odatda `http://localhost:5173`) brauzeringizda
oching. Hammasi to'g'ri ishlayotganini ko'rasiz.

`Ctrl+C` bosib to'xtating.

---

## 4-qadam: Android loyihasini yaratish

```
npm run build
npx cap add android
npx cap sync android
```

- `npm run build` — ilovani ishlab chiqarish (production) versiyasiga yig'adi
- `npx cap add android` — `android/` papkasini yaratadi (faqat birinchi marta)
- `npx cap sync android` — veb-kodni Android loyihasiga nusxalaydi

> Eslatma: `npx cap add android` ba'zan internetdan shablon yuklab oladi,
> shuning uchun internet ulanishi kerak bo'ladi.

---

## 5-qadam: APK yasash

```
npx cap open android
```

Bu buyruq **Android Studio**'ni ochadi va loyihani avtomatik yuklaydi
(birinchi ochilishda Gradle sinxronlashishi bir necha daqiqa vaqt olishi
mumkin — kuting).

Android Studio ochilgach:

**A) Telefoningizga to'g'ridan-to'g'ri o'rnatish uchun:**
1. Telefoningizni USB orqali ulang va "USB debugging" rejimini yoqing
   (Sozlamalar → Telefon haqida → "Qurilgan raqami"ni 7 marta bosing →
   Dasturchilar uchun sozlamalar → USB debugging)
2. Android Studio'da yuqorida telefoningiz nomi chiqadi
3. Yashil **▶ Run** tugmasini bosing — ilova avtomatik o'rnatiladi va ishga
   tushadi

**B) APK faylini olish uchun (keyin istalgan telefonga o'rnatish):**
1. Yuqori menyudan: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Tugagach pastda chiqqan "locate" havolasini bosing
3. APK fayl shu yerda bo'ladi:
   `android/app/build/outputs/apk/debug/app-debug.apk`
4. Bu faylni telefoningizga (Telegram, USB kabel, Google Drive orqali)
   yuboring va o'rnating (noma'lum manbalardan o'rnatishga ruxsat berish
   kerak bo'lishi mumkin)

---

## Keyinchalik o'zgartirish kiritsangiz

Kod ichida (`src/App.jsx`) biror narsani o'zgartirgandan keyin, APK'ni
yangilash uchun shu uchta buyruqni qayta bajaring:

```
npm run build
npx cap sync android
npx cap open android
```

So'ng Android Studio'da yana Build yoki Run qiling.

---

## Ilova nomi va belgisini (icon) o'zgartirish

- **Nomi**: `capacitor.config.json` faylidagi `"appName"` qiymatini
  o'zgartiring
- **Belgisi (icon)**: Android Studio'da: sichqonchaning o'ng tugmasi bilan
  `app` papkasini bosing → New → Image Asset → o'zingizning rasmingizni
  tanlang

---

## Fayl tuzilishi

```
qarz-daftari-android/
├── package.json          — kutubxonalar ro'yxati
├── vite.config.js         — qurish (build) sozlamalari
├── capacitor.config.json  — ilova nomi, ID, sozlamalari
├── index.html              — asosiy HTML
├── src/
│   ├── main.jsx            — kirish nuqtasi
│   ├── App.jsx              — butun ilova logikasi va dizayni
│   └── storage.js           — ma'lumotlarni telefon xotirasida saqlash
└── android/                 — (npx cap add android dan keyin paydo bo'ladi)
```

---

## Muammo yuzaga kelsa

- **"command not found: npx"** → Node.js to'g'ri o'rnatilmagan, qaytadan
  yuklab oling
- **Gradle sinxronlash xatosi** → Android Studio'ni eng so'nggi versiyaga
  yangilang, internetni tekshiring
- **Ilova ochilmayapti / oq ekran** → `npm run build` qaytadan ishga
  tushiring, so'ng `npx cap sync android`

Savol tug'ilsa, shu loyihani yaratgan suhbatga qaytib so'rashingiz mumkin.
