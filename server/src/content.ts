export type PublicQuestion = {
  id: string;
  question: string;
  options: string[];
};

type Question = PublicQuestion & {
  answer: number;
  explanation: string;
};

export const concepts = [
  {
    id: 'ip',
    number: '01',
    eyebrow: 'MANZILLASH',
    title: 'IP manzil',
    description: 'Tarmoqdagi qurilmani topishga yordam beradigan raqamli manzil.',
    detail: 'Internet orqali ma’lumot yuborilganda, qurilmalar manzillar yordamida qayerga borishni aniqlaydi. IPv4 manzili to‘rtta oktetdan tuziladi.',
    accent: 'mint',
  },
  {
    id: 'dns',
    number: '02',
    eyebrow: 'TARJIMON',
    title: 'DNS',
    description: 'Domen nomini unga mos IP manzil bilan bog‘laydigan tizim.',
    detail: 'Brauzerga domen nomini yozganingizda, DNS kerakli manzilni topishga yordam beradi. Shu sababli saytga kirish uchun raqamlarni yodlash shart emas.',
    accent: 'violet',
  },
  {
    id: 'subdomain',
    number: '03',
    eyebrow: 'TARTIBLASH',
    title: 'Subdomen',
    description: 'Asosiy domen ichida alohida xizmat yoki bo‘lim yaratish usuli.',
    detail: 'Masalan, docs.example.com manzilida “docs” — subdomen, “example.com” esa asosiy domen. Subdomen saytdagi alohida xizmatni ajratishi mumkin.',
    accent: 'orange',
  },
] as const;

export const questions: Question[] = [
  {
    id: 'q1',
    question: 'IPv4 manzili nechta oktetdan iborat?',
    options: ['2 ta', '4 ta', '8 ta', '16 ta'],
    answer: 1,
    explanation: 'IPv4 — 32 bit. U 8 bitdan iborat to‘rtta oktetga ajraladi.',
  },
  {
    id: 'q2',
    question: 'IPv4 manzilidagi har bir oktetning o‘nlik qiymati qaysi oraliqda bo‘ladi?',
    options: ['1–100', '0–999', '0–255', '0–256'],
    answer: 2,
    explanation: '8 bit 2⁸ = 256 xil qiymatni ifodalaydi: 0 dan 255 gacha.',
  },
  {
    id: 'q3',
    question: 'Nega bitta oktetda 256 xil qiymat bor?',
    options: ['Chunki 8 bitning 2⁸ kombinatsiyasi bor', 'Chunki internetda 256 ta sayt bor', 'Chunki har doim 256 bit ishlatiladi', 'Bu shunchaki kelishilgan taxmin'],
    answer: 0,
    explanation: 'Har bir bit 0 yoki 1 bo‘lishi mumkin. 8 bit uchun 2⁸ = 256 kombinatsiya mavjud.',
  },
  {
    id: 'q4',
    question: 'DNS tizimining asosiy vazifasi nima?',
    options: ['Ekran yorqinligini o‘zgartirish', 'Fayllarni siqish', 'Domen nomini IP manzil bilan aniqlash', 'Wi-Fi parolini yaratish'],
    answer: 2,
    explanation: 'DNS domen nomini kerakli tarmoq manziliga topib beradi.',
  },
  {
    id: 'q5',
    question: '“blog.example.com” manzilida subdomen qaysi qism?',
    options: ['com', 'example.com', 'blog', 'https'],
    answer: 2,
    explanation: 'Bu misolda “blog” — example.com domenining subdomeni.',
  },
  {
    id: 'q6',
    question: 'Quyidagilardan qaysi biri to‘g‘ri yozilgan IPv4 manzil?',
    options: ['192.168.1.10', '192.168.1.300', '192.168.-1.10', '192.168.1'],
    answer: 0,
    explanation: '192.168.1.10 to‘rtta oktetdan iborat va barcha oktetlar 0–255 oralig‘ida.',
  },
  {
    id: 'q7',
    question: 'URL ichidagi “/course” odatda nimani bildiradi?',
    options: ['Protokolni', 'Sahifa yoki resurs yo‘lini', 'Subdomenni', 'IP oktetini'],
    answer: 1,
    explanation: 'Domen nomidan keyingi “/course” — sayt ichidagi resurs yo‘li (path).',
  },
];

export const publicQuestions: PublicQuestion[] = questions.map(({ id, question, options }) => ({
  id,
  question,
  options,
}));
