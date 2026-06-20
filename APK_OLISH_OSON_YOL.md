# APK olishning eng oson yo'li (kuchsiz kompyuter uchun)

Bu usulda **hech narsa o'rnatmaysiz**. Faqat brauzer kerak. APK GitHub'ning
o'zining bepul serverida (sizning kompyuteringizda emas) quriladi.

---

## 1-qadam: GitHub akkaunt yaratish

Agar akkauntingiz bo'lmasa: https://github.com/signup ga kiring, email va
parol bilan ro'yxatdan o'ting (bepul).

---

## 2-qadam: Yangi repository (loyiha) yaratish

1. https://github.com/new ga kiring
2. **Repository name**: `qarz-daftari` deb yozing
3. **Public** tanlangan bo'lsin (bepul cheksiz qurish uchun)
4. Pastdagi katakchalarni belgilamang ("Add a README" va h.k. — bo'sh qoldiring)
5. **Create repository** tugmasini bosing

---

## 3-qadam: Fayllarni yuklash

1. Ochilgan sahifada **"uploading an existing file"** havolasini bosing
   (yoki yuqorida **Add file → Upload files**)
2. Kompyuteringizda zip'dan chiqargan `qarz-daftari-android` papkasini
   oching
3. Papka ICHIDAGI **barcha fayl va papkalarni** (`.github`, `src`,
   `package.json`, `README.md` va h.k.) belgilab, brauzer oynasiga
   **sudrab tashlang** (drag & drop)

   > Muhim: papkaning o'zini emas, ICHIDAGI fayllarni tashlang — aks
   > holda papka tuzilishi noto'g'ri chiqadi.

4. Pastga tushib, **Commit changes** tugmasini bosing (yashil tugma)

---

## 4-qadam: Qurilishni kuzatish

1. Repository sahifasida yuqoridagi **Actions** bo'limiga o'ting
2. "APK yasash" degan jarayon avtomatik boshlangan bo'ladi (sariq nuqta
   aylanib turadi)
3. **3-5 daqiqa kuting** — sahifani yangilab turing
4. Yashil ✓ belgisi chiqsa — tayyor!

   Agar qizil ✗ chiqsa, jarayon nomini bosing va xato matnini menga
   yuboring — birga tuzatamiz.

---

## 5-qadam: APK'ni yuklab olish

1. Yashil ✓ bo'lgan jarayonni bosing
2. Pastga tushing, **Artifacts** bo'limida **"qarz-daftari-apk"** ni
   ko'rasiz
3. Uni bosib yuklab oling — bu zip fayl, ichida `app-debug.apk` bor
4. Zip'ni oching, `app-debug.apk` faylini chiqaring

---

## 6-qadam: Telefoningizga o'rnatish

1. `app-debug.apk` faylini telefoningizga yuboring (Telegram "Saved
   Messages", Google Drive, USB kabel — qulay bo'lganini tanlang)
2. Telefonda faylni oching
3. "Noma'lum manbalardan o'rnatish" so'ralsa — ruxsat bering
4. **O'rnatish**ni bosing

Tayyor! Ilova endi telefoningizda, internetisiz ishlaydi.

---

## Keyinchalik yangilash kerak bo'lsa

`src/App.jsx` faylini o'zgartirsangiz:
1. GitHub'da o'sha faylni qaytadan yuklang (Add file → Upload files →
   eskisi ustiga yozadi) yoki faylni ochib tahrirlang va **Commit**
   qiling
2. Actions avtomatik qayta ishga tushadi
3. 4-5-qadamlarni takrorlang

---

## Eslatma

- Repository **Public** bo'lgani uchun GitHub Actions **bepul va
  cheksiz** ishlaydi
- Kodning o'zi (App.jsx) hammaga ko'rinadi, lekin bu — ilova *dasturi*,
  sizning shaxsiy qarz-zaym ma'lumotlaringiz emas. Ma'lumotlaringiz
  faqat o'rnatgandan keyin telefoningizda saqlanadi, GitHub'da emas.
- Agar kodni ham yashirin saqlamoqchi bo'lsangiz, **Private** repository
  ham tanlash mumkin — Actions oyiga 2000 daqiqagacha bepul beradi, bu
  yetarli (bir qurish ~3-5 daqiqa oladi).
