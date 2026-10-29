# NetLab — Internetni ichidan tushun

NetLab — IP manzil, DNS, domen va subdomen tushunchalarini amaliy tajriba orqali o‘rgatadigan responsive ta’lim sayti. Bu oddiy vazifalar ro‘yxati emas: foydalanuvchi manzilni o‘zgartiradi, ikkilik bitlarni kuzatadi, URL qismlarini ajratadi va bilimini test orqali tekshiradi.

## Texnologiyalar

- **Frontend:** React 19, TypeScript, Vite, Lucide icons
- **Backend:** Node.js, Express 5, TypeScript
- **Test:** Serverda tekshiriladigan 7 ta savol; API uzilsa frontend zaxira rejimida ham ishlay oladi
- **Deploy:** Express production build ichida React ilovasini ham xizmat qiladi

## Talablar

- Node.js **20.19+** (Node 22 tavsiya etiladi)
- npm

## Lokal ishga tushirish

Loyiha papkasida quyidagilarni bajaring:

```bash
npm install
npm run dev
```

Keyin brauzerda oching:

- Sayt: `http://localhost:5173`
- API holati: `http://localhost:4000/api/health`
- O‘quv kontenti: `http://localhost:4000/api/learning`

`npm run dev` frontend va backendni parallel ishga tushiradi. Vite `/api` so‘rovlarini Express serveriga uzatadi.

## Production build

```bash
npm install
npm run typecheck
npm run build
npm start
```

Production server `PORT` muhit o‘zgaruvchisini ishlatadi; odatiy port — `4000`. Builddan so‘ng React fayllari Express tomonidan xizmat qilinadi.

## GitHub’ga joylash

1. ZIP arxivini oching.
2. GitHub’da yangi, bo‘sh repository yarating.
3. Terminalda loyiha papkasiga kirib, quyidagilarni bajaring:

```bash
git init
git add .
git commit -m "Initial NetLab education site"
git branch -M main
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

`USERNAME` va `REPOSITORY` ni o‘zingizning GitHub ma’lumotlaringiz bilan almashtiring. Bu buyruqlarda `origin` faqat birinchi marta qo‘shiladi.

## Deploy qilish

Node.js ilovasini qo‘llaydigan hostingni tanlang (masalan, Render yoki Railway):

- **Build command:** `npm install && npm run build`
- **Start command:** `npm start`
- **Node version:** 22

Hosting `PORT` qiymatini avtomatik beradi; server shu qiymatga moslashadi. Frontend va API bir xil origin’da ishlaydi.

## API

- `GET /api/health` — server ishlayotganini tekshiradi.
- `GET /api/learning` — tushunchalar va test savollarini yuboradi.
- `POST /api/quiz/grade` — javoblarni serverda baholaydi.

Namuna so‘rov:

```json
{
  "answers": {
    "q1": 1,
    "q2": 2,
    "q3": 0,
    "q4": 2,
    "q5": 2,
    "q6": 0,
    "q7": 1
  }
}
```

Natijalar ma’lumotlar bazasiga yozilmaydi. Login, reklama yoki tashqi API kaliti talab qilinmaydi.

## Kontent haqida

Sahifadagi izohlar berilgan mavzular — IPv4, DNS, domen va subdomen — asosida yozilgan. Darslikning 10- va 11-mavzulari aniq nomi ko‘rsatilmagani sababli sayt bu mavzularni darslikdagi bob nomlari sifatida ko‘rsatmaydi; ularning asosiy tushunchalarini takrorlash va keyingi o‘qishga ko‘prik yaratishga xizmat qiladi.

## Loyiha tuzilishi

```text
netlab-education/
├── .github/workflows/ci.yml
├── client/
│   ├── index.html
│   ├── src/App.tsx
│   ├── src/main.tsx
│   ├── src/styles.css
│   ├── package.json
│   └── vite.config.ts
├── server/
│   ├── src/content.ts
│   ├── src/index.ts
│   └── package.json
├── .gitignore
├── .nvmrc
├── LICENSE
├── package.json
└── README.md
```

## Litsenziya

MIT — `LICENSE` fayliga qarang.
