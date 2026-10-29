import express, { type Request, type Response, type NextFunction } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { concepts, publicQuestions, questions } from './content.js';

const app = express();
const port = Number(process.env.PORT ?? 4000);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'NetLab API', timestamp: new Date().toISOString() });
});

app.get('/api/learning', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({
    title: 'Internetni ichidan tushun',
    subtitle: 'Tarmoq manzillari va domenlar — misol, tajriba va mantiq orqali.',
    concepts,
    quiz: publicQuestions,
    learningPath: [
      { label: 'IPv4 tuzilishi', time: '3 daqiqa', type: 'explore' },
      { label: 'Domen va DNS', time: '2 daqiqa', type: 'read' },
      { label: 'Subdomenni ajratish', time: '2 daqiqa', type: 'interact' },
      { label: 'Bilimni sinash', time: '3 daqiqa', type: 'quiz' },
    ],
  });
});

app.post('/api/quiz/grade', (req: Request, res: Response) => {
  const input: unknown = req.body?.answers;
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    res.status(400).json({ error: 'Javoblar obyekt ko‘rinishida yuborilishi kerak.' });
    return;
  }

  const answers = input as Record<string, unknown>;
  let score = 0;
  const results = questions.map((question) => {
    const selected = answers[question.id];
    const validSelection = Number.isInteger(selected)
      && (selected as number) >= 0
      && (selected as number) < question.options.length;
    const isCorrect = validSelection && selected === question.answer;
    if (isCorrect) score += 1;

    return {
      id: question.id,
      correct: isCorrect,
      selected: validSelection ? selected : null,
      correctAnswer: question.answer,
      explanation: question.explanation,
    };
  });

  const total = questions.length;
  const percent = Math.round((score / total) * 100);
  const message = percent === 100
    ? 'Ajoyib! Tarmoq asoslarini aniq tushunibsiz.'
    : percent >= 70
      ? 'Yaxshi natija. Izohlarni ko‘rib, mayda farqlarni mustahkamlang.'
      : percent >= 40
        ? 'Yaxshi boshlanish. Tajribalarni yana bir marta ko‘rib chiqing.'
        : 'Avval tushunchalarni yana bir bor ko‘rib chiqing — keyin qayta urinib ko‘ring.';

  res.json({ score, total, percent, message, results });
});

app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Bunday API manzili mavjud emas.' });
});

// Builddan keyin Express React ilovasini ham xizmat qiladi.
const clientDist = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDist, { index: false, maxAge: '1h' }));
app.get('/{*splat}', (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api/')) {
    next();
    return;
  }
  res.sendFile(path.join(clientDist, 'index.html'), (error) => {
    if (error) next(error);
  });
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[NetLab API]', error);
  res.status(500).json({ error: 'Serverda kutilmagan xatolik yuz berdi.' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`NetLab API ishga tushdi: http://localhost:${port}`);
});
