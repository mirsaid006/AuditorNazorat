# 🛡️ Anti-Corruption AI: Document Intelligence System

**O'zbekiston davlat xaridlari uchun korrupsion xavflarni avtomatik aniqlash tizimi.**

Ushbu tizim sun'iy intellekt (Gemini 2.5 Flash) yordamida tender hujjatlari, shartnomalar va auktsion shartlarini tahlil qiladi. Tizimning asosiy vazifasi — matnlar orasiga yashirilgan, inson ko'zi bilan ilg'ash qiyin bo'lgan korrupsion "tuzoqlar" va qonunbuzarliklarni fosh qilishdir.

---

## 🚀 Loyiha Maqsadi
Davlat xaridlari jarayonida shaffoflikni ta'minlash va quyidagi manipulyatsiyalarni aniqlash:
*   **Texnik cheklovlar:** Faqat bitta yetkazib beruvchi uchun moslashtirilgan o'ta maxsus talablar.
*   **Mantiqsiz shartlar:** Masalan, texnika uchun real bo'lmagan kafolat muddatlari (15 yil va h.k.).
*   **Zaharli jamlanma (Bundling):** Raqobatni cheklash uchun mantiqsiz tovarlarni bitta lotga birlashtirish.
*   **Huquqiy tuzoqlar:** Shartnomadagi yashirin jarimalar yoki nohaq bekor qilish shartlari.

---

## 🛠 Texnik Stek (Architecture)

Loyiha apparat cheklovlarini (NVIDIA 720M) hisobga olgan holda **Hybrid-Cloud** arxitekturasida qurilgan:

*   **Logic:** Python 3.10+
*   **AI Engine:** Google Gemini 2.5 Flash API (Mantiqiy tahlil va huquqiy xulosa uchun).
*   **PDF Processing:** PyMuPDF (CPU orqali matnni tezkor ajratib olish).
*   **Containerization:** Docker (Tizimni istalgan muhitda bir xil ishlashini ta'minlash uchun).
*   **Prompt Engineering:** Chain-of-Thought (CoT) metodologiyasi asosida yozilgan anti-korrupsiya ko'rsatmalari.

---

## 📂 Loyiha Strukturasi
```text
├── app/
│   ├── main.py            # Asosiy ishga tushirish skripti
│   ├── parser.py          # PDF-ni matnga o'tkazish moduli
│   ├── analyzer.py        # Gemini API bilan aloqa moduli
│   └── utils.py           # Matnni tozalash va normalizatsiya
├── data/
│   ├── uploads/           # Tahlil qilinadigan PDF hujjatlar
│   └── reports/           # Tayyor tahlil natijalari (JSON/PDF)
├── .env                   # API kalitlar va sozlamalar
├── Dockerfile             # Konteyner sozlamalari
└── requirements.txt       # Zarur kutubxonalar ro'yxati
