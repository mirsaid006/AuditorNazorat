# 🛡️ AuditorNazorat: Anti-Corruption AI Interface

**AuditorNazorat** — davlat xaridlaridagi shubhali tenderlarni va yashirin korrupsion sxemalarni aniqlash uchun mo'ljallangan intellektual veb-platforma. Ushbu frontend ilovasi **Gemini 2.5 Flash** imkoniyatlaridan foydalanib, foydalanuvchiga real vaqt rejimida tahliliy hisobotlarni taqdim etadi.

---

## 🏗️ Loyiha Strukturasi (File Structure)

Rasmda ko'rsatilganidek, loyiha zamonaviy va modulli arxitekturaga ega:

*   **`src/services/geminiService.ts`**: Gemini API bilan aloqa o'rnatuvchi asosiy mantiqiy qatlam.
*   **`src/App.tsx`**: Ilovaning asosiy kirish nuqtasi va interfeys komponenti.
*   **`src/main.tsx`**: React ilovasini domga ulaydigan renderlash fayli.
*   **`vite.config.ts`**: Vite yordamida loyihani tezkor build qilish va serverni sozlash fayli.
*   **`tsconfig.json`**: TypeScript qoidalari va turlarni nazorat qilish sozlamalari.

---

## 🚀 Texnologik Stek

*   **Framework:** React 18+ (Vite bilan)
*   **Language:** TypeScript (Xavfsiz va tushunarli kod yozish uchun)
*   **AI Integration:** Gemini API (Google AI SDK)
*   **Styling:** Tailwind CSS / CSS Modules
*   **Build Tool:** Vite (Tezkor va yengil ishlab chiqish muhiti)

---

## 🛠️ O'rnatish va Ishga tushirish

NVIDIA 720M kabi cheklangan resurslarda ham ushbu frontend ilovasi juda tez ishlaydi, chunki barcha og'ir hisob-kitoblar brauzer va Google bulutida bajariladi.

1.  **Kutubxonalarni o'rnatish:**
    ```bash
    npm install
    ```

2.  **.env faylini sozlash:**
    Loyiha ildiz papkasida `.env` faylini yarating va API kalitingizni kiriting:
    ```env
    VITE_GEMINI_API_KEY=sizning_maxfiy_kalitingiz
    ```

3.  **Lokal serverni ishga tushirish:**
    ```bash
    npm run dev
    ```

---

## 💡 Asosiy Funksionallik

1.  **Document Upload:** Foydalanuvchi tender hujjatini (matn yoki rasm formatida) tizimga yuklaydi.
2.  **AI Analysis:** `geminiService.ts` orqali matn Gemini 2.5 Flash modeliga tahlil uchun yuboriladi.
3.  **Result Rendering:** Ilova topilgan "Red Flags" (shubhali bandlar)ni xavf darajasiga ko'ra ranglar bilan (Qizil, Sariq, Yashil) vizuallashtiradi.
4.  **Export:** Tahlil natijalarini auditorlar uchun hisobot shaklida saqlash.

---

## 🔐 Xavfsizlik

*   API kalitlar `.env` fayli orqali boshqariladi va `git`ga yuklanmaydi.
*   Foydalanuvchi yuklagan ma'lumotlar faqat tahlil davomida ishlatiladi va qurilma xotirasida uzoq vaqt saqlanib qolmaydi.

---

## 🤝 Hamkorlik

Ushbu loyiha korrupsiyaga qarshi kurashishda texnologiyaning o'rnini ko'rsatib berishga qaratilgan. Savollar yoki takliflar bo'lsa, **Issues** bo'limida qoldiring.
