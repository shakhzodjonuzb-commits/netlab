import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Binary,
  BookOpen,
  Check,
  ChevronDown,
  CircleCheck,
  CircleHelp,
  Compass,
  Cpu,
  Globe,
  Layers,
  Lightbulb,
  Menu,
  Network,
  RotateCcw,
  Server,
  SlidersHorizontal,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';

type Concept = {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  detail: string;
  accent: string;
};
type QuizQuestion = { id: string; question: string; options: string[] };
type LearningPayload = {
  title: string;
  subtitle: string;
  concepts: Concept[];
  quiz: QuizQuestion[];
  learningPath: LearningPathStep[];
};
type QuizResult = {
  score: number;
  total: number;
  percent: number;
  message: string;
  results: { id: string; correct: boolean; selected: number | null; correctAnswer: number; explanation: string }[];
};
type AddressPart = 'protocol' | 'subdomain' | 'domain' | 'tld' | 'path' | 'query' | 'fragment';

const fallbackConcepts: Concept[] = [
  { id: 'ip', number: '01', eyebrow: 'MANZILLASH', title: 'IP manzil', description: 'Tarmoqdagi qurilmani topishga yordam beradigan raqamli manzil.', detail: 'IPv4 manzili 32 bitdan iborat: 8 bitli to‘rtta oktet. Har bir oktet o‘nlik ko‘rinishda 0 dan 255 gacha yoziladi.', accent: 'mint' },
  { id: 'dns', number: '02', eyebrow: 'TARJIMON', title: 'DNS', description: 'Domen nomini IP manzili bilan bog‘lashga yordam beradigan tizim.', detail: 'DNS domen nomini mos tarmoq manziliga yechadi. Shuning uchun saytga kirish uchun raqamlarni eslab qolish shart emas.', accent: 'violet' },
  { id: 'subdomain', number: '03', eyebrow: 'TARTIBLASH', title: 'Subdomen', description: 'Asosiy domen ichida alohida bo‘lim yoki xizmat ajratish usuli.', detail: 'Masalan, docs.example.com manzilida docs — subdomen, example.com esa asosiy domen.', accent: 'orange' },
];
const fallbackQuiz: QuizQuestion[] = [
  { id: 'q1', question: 'IPv4 manzili nechta oktetdan iborat?', options: ['2 ta', '4 ta', '8 ta', '16 ta'] },
  { id: 'q2', question: 'Har bir oktet qaysi oraliqdagi qiymatni oladi?', options: ['1–100', '0–999', '0–255', '0–256'] },
  { id: 'q3', question: 'Nega bitta oktetda 256 xil qiymat bor?', options: ['8 bitning 2⁸ kombinatsiyasi bor', 'Internetda 256 sayt bor', '256 bit ishlatiladi', 'Bu taxmin'] },
  { id: 'q4', question: 'DNS tizimi nima qiladi?', options: ['Ekran yorqinligini o‘zgartiradi', 'Fayllarni siqadi', 'Domen nomini IP bilan aniqlaydi', 'Wi-Fi parolini yaratadi'] },
  { id: 'q5', question: 'blog.example.com manzilida subdomen qaysi?', options: ['com', 'example.com', 'blog', 'https'] },
  { id: 'q6', question: 'Qaysi biri to‘g‘ri IPv4 manzil?', options: ['192.168.1.10', '192.168.1.300', '192.168.-1.10', '192.168.1'] },
  { id: 'q7', question: 'URL ichidagi /course odatda nimani bildiradi?', options: ['Protokol', 'Resurs yo‘li', 'Subdomen', 'IP okteti'] },
];
const answerKey: Record<string, number> = { q1: 1, q2: 2, q3: 0, q4: 2, q5: 2, q6: 0, q7: 1 };
const partDescriptions: Record<AddressPart, { label: string; title: string; description: string; color: string }> = {
  protocol: { label: 'PROTOKOL', title: 'https://', description: 'Brauzer server bilan qaysi xavfsiz aloqa usulida bog‘lanishini bildiradi.', color: 'part-blue' },
  subdomain: { label: 'SUBDOMEN', title: 'learn', description: 'example.com ichidagi alohida bo‘lim. Xuddi shu usulda api.example.com yoki docs.example.com ishlashi mumkin.', color: 'part-mint' },
  domain: { label: 'ASOSIY DOMEN', title: 'example', description: 'Sayt nomining asosiy qismi. Bu misolda u example.com nomining markaziy qismi.', color: 'part-violet' },
  tld: { label: 'YUQORI DARAJALI DOMEN', title: '.com', description: 'Domenning oxirgi qismi. Boshqa misollar: .org, .uz, .edu.', color: 'part-orange' },
  path: { label: 'YO‘L (PATH)', title: '/course', description: 'Sayt ichidagi sahifa yoki resursga yo‘l ko‘rsatadi.', color: 'part-blue' },
  query: { label: 'SO‘ROV (QUERY)', title: '?chapter=10', description: 'Serverga qo‘shimcha parametr yuboradi. Bu misolda chapter qiymati 10.', color: 'part-violet' },
  fragment: { label: 'BO‘LIM (FRAGMENT)', title: '#quiz', description: 'Sahifa ichidagi muayyan bo‘limga ishora qilishi mumkin.', color: 'part-mint' },
};

const addressPresets = [
  { label: 'Uy tarmog‘i', values: [192, 168, 1, 24] },
  { label: 'Mahalliy qurilma', values: [10, 0, 0, 42] },
  { label: 'Chegara misoli', values: [255, 0, 255, 255] },
  { label: 'Nol qiymati', values: [0, 0, 0, 0] },
];

function binaryByte(value: number): string {
  return value.toString(2).padStart(8, '0');
}

function App() {
  const [learning, setLearning] = useState<LearningPayload | null>(null);
  const [apiStatus, setApiStatus] = useState<'loading' | 'online' | 'offline'>('loading');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [octets, setOctets] = useState<number[]>([192, 168, 1, 24]);
  const [presetIndex, setPresetIndex] = useState(0);
  const [activePart, setActivePart] = useState<AddressPart>('subdomain');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [quizBusy, setQuizBusy] = useState(false);
  const [quizError, setQuizError] = useState('');
  const [expandedConcept, setExpandedConcept] = useState<string | null>('ip');
  const [showBitDetails, setShowBitDetails] = useState(true);

  useEffect(() => {
    let stillHere = true;
    fetch('/api/learning')
      .then((response) => {
        if (!response.ok) throw new Error('API unavailable');
        return response.json() as Promise<LearningPayload>;
      })
      .then((payload) => {
        if (!stillHere) return;
        setLearning(payload);
        setApiStatus('online');
      })
      .catch(() => {
        if (!stillHere) return;
        setApiStatus('offline');
      });
    return () => { stillHere = false; };
  }, []);

  const concepts = learning?.concepts ?? fallbackConcepts;
  const questions = learning?.quiz ?? fallbackQuiz;
  const activeAddress = octets.join('.');
  const bits = octets.map(binaryByte);
  const allAnswered = questions.length > 0 && questions.every((question) => Number.isInteger(answers[question.id]));
  const answeredCount = questions.filter((question) => Number.isInteger(answers[question.id])).length;
  const activePartInfo = partDescriptions[activePart];
  const quizPercent = useMemo(() => questions.length ? Math.round((answeredCount / questions.length) * 100) : 0, [answeredCount, questions.length]);

  function updateOctet(index: number, raw: string) {
    if (raw.trim() === '') {
      setOctets((current) => current.map((value, i) => i === index ? 0 : value));
      return;
    }
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed)) return;
    const safe = Math.max(0, Math.min(255, parsed));
    setOctets((current) => current.map((value, i) => i === index ? safe : value));
  }

  function choosePreset(index: number) {
    setPresetIndex(index);
    setOctets(addressPresets[index].values);
  }

  function createRandomAddress() {
    const choice = Math.floor(Math.random() * 3);
    const next = choice === 0
      ? [10, randomByte(), randomByte(), randomByte()]
      : choice === 1
        ? [172, 16 + Math.floor(Math.random() * 16), randomByte(), randomByte()]
        : [192, 168, randomByte(), randomByte()];
    setOctets(next);
    setPresetIndex(-1);
  }

  async function submitQuiz() {
    if (!allAnswered || quizBusy) return;
    setQuizBusy(true);
    setQuizError('');
    try {
      const response = await fetch('/api/quiz/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      if (!response.ok) throw new Error('API grading failed');
      setQuizResult(await response.json() as QuizResult);
    } catch {
      const results = questions.map((question) => ({
        id: question.id,
        correct: answers[question.id] === answerKey[question.id],
        selected: answers[question.id] ?? null,
        correctAnswer: answerKey[question.id] ?? 0,
        explanation: 'To‘g‘ri javobni eslab qolish uchun yuqoridagi tushuntirish va tajribalarni qayta ko‘rib chiqing.',
      }));
      const score = results.filter((result) => result.correct).length;
      const percent = Math.round((score / questions.length) * 100);
      setQuizResult({ score, total: questions.length, percent, message: percent === 100 ? 'Ajoyib! Hammasi to‘g‘ri.' : percent >= 70 ? 'Yaxshi natija. Bir-ikki nuqtani mustahkamlang.' : 'Tajribalarga yana qayting, keyin qayta urinib ko‘ring.', results });
      setQuizError('Server bilan aloqa yo‘q. Natija brauzerning zaxira rejimida hisoblandi.');
    } finally {
      setQuizBusy(false);
    }
  }

  function resetQuiz() {
    setAnswers({});
    setQuizResult(null);
    setQuizError('');
  }

  function navigateTo(id: string) {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="site-shell">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <div className="topline" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="NetLab bosh sahifa" onClick={(event) => { event.preventDefault(); navigateTo('top'); }}>
          <span className="brand-mark"><Network size={19} strokeWidth={2.2} /></span>
          <span className="brand-copy"><strong>net<span>lab</span></strong><small>INTERNET ATLASI</small></span>
        </a>
        <nav className={`desktop-nav ${mobileMenuOpen ? 'nav-open' : ''}`} aria-label="Asosiy navigatsiya">
          <a href="#ip-lab" onClick={(event) => { event.preventDefault(); navigateTo('ip-lab'); }}>IP laboratoriya</a>
          <a href="#domains" onClick={(event) => { event.preventDefault(); navigateTo('domains'); }}>Domenlar</a>
          <a href="#knowledge" onClick={(event) => { event.preventDefault(); navigateTo('knowledge'); }}>Bilim maydoni</a>
        </nav>
        <div className="header-right">
          <div className={`api-indicator api-${apiStatus}`} title={apiStatus === 'online' ? 'Server ulangan' : apiStatus === 'offline' ? 'Zaxira rejimida' : 'Server tekshirilmoqda'}>
            <span className="status-dot" />
            <span>{apiStatus === 'online' ? 'LIVE API' : apiStatus === 'offline' ? 'LOCAL MODE' : 'CONNECTING'}</span>
          </div>
          <button className="menu-button" onClick={() => setMobileMenuOpen((open) => !open)} aria-label={mobileMenuOpen ? 'Menyuni yopish' : 'Menyuni ochish'} aria-expanded={mobileMenuOpen}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <button className="header-cta" onClick={() => navigateTo('knowledge')}>O‘rganishni boshlash <ArrowUpRight size={16} /></button>
        </div>
      </header>

      <main id="top">
        <section className="hero section-wrap" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> TARMOQ ASOSLARI <span className="eyebrow-tag">FIELD NOTES / 001</span></div>
            <h1 id="hero-title">Internetni<br />ichidan <span className="title-accent">tushun.</span></h1>
            <p className="hero-lede">Manzillar, domenlar va internet ortidagi mantiq. Quruq ta’riflar emas — ko‘rib, o‘zgartirib, o‘zingiz anglaydigan tajribalar.</p>
            <div className="hero-actions">
              <button className="button-primary" onClick={() => navigateTo('ip-lab')}>Tajribani boshlash <ArrowDownRight size={17} /></button>
              <button className="button-quiet" onClick={() => navigateTo('domains')}><span className="play-ring"><ArrowRight size={12} /></span> 2 daqiqalik ko‘rish</button>
            </div>
            <div className="hero-social-proof">
              <div className="avatar-stack" aria-hidden="true"><span>IP</span><span>DNS</span><span>01</span></div>
              <p><strong>3 ta asosiy tushuncha</strong><br /><span>bitta bog‘langan tizimda</span></p>
              <div className="hero-proof-divider" />
              <p className="proof-time"><Zap size={14} /> Taxminan 10 daqiqa</p>
            </div>
          </div>

          <div className="hero-visual" aria-label="To‘rt oktetli IP manzil vizualizatsiyasi">
            <div className="visual-topline"><span><span className="tiny-live" /> MANZIL TUZILISHI</span><span>FIG. 01</span></div>
            <div className="orbit orbit-outer" aria-hidden="true" />
            <div className="orbit orbit-inner" aria-hidden="true" />
            <div className="visual-glow" aria-hidden="true" />
            <div className="visual-core">
              <div className="core-icon"><Binary size={30} strokeWidth={1.5} /></div>
              <span className="core-overline">IPv4 / 32 BIT</span>
              <strong>192.168<span>.</span>1<span>.</span>24</strong>
              <div className="core-bits"><span>11000000</span><i /> <span>10101000</span><i /> <span>00000001</span><i /> <span>00011000</span></div>
              <div className="core-bottom"><span><span className="tiny-live" /> PRIVATE NETWORK</span><span>4 × 8 BIT</span></div>
            </div>
            <div className="float-chip chip-top"><span className="chip-icon mint-icon"><Cpu size={15} /></span><span><small>BITLAR SONI</small><strong>32 bit</strong></span></div>
            <div className="float-chip chip-bottom"><span className="chip-icon purple-icon"><Layers size={15} /></span><span><small>OKTETLAR</small><strong>4 × 8 bit</strong></span></div>
            <div className="visual-coordinate coordinate-one">41°18' N</div>
            <div className="visual-coordinate coordinate-two">NET / 256</div>
            <div className="crosshair crosshair-a" aria-hidden="true" />
            <div className="crosshair crosshair-b" aria-hidden="true" />
          </div>
          <div className="hero-bottomline"><span>01 / TUSHUNISH</span><div className="bottomline-track"><span /></div><span>03 / QO‘LLASH</span><span className="scroll-hint">PASTGA O‘TING <ChevronDown size={13} /></span></div>
        </section>

        <section className="quick-facts section-wrap" aria-label="IPv4 haqida tezkor ma’lumotlar">
          <div className="fact-intro"><span className="section-kicker">BIR QARASHDA</span><p>Oddiy ko‘rinadi.<br /><strong>Ichida aniq matematika bor.</strong></p></div>
          <div className="fact"><span className="fact-number">32<span>bit</span></span><span className="fact-label">IPv4 hajmi</span><div className="fact-mini-bars"><i /><i /><i /><i /></div></div>
          <div className="fact"><span className="fact-number">04<span>×</span>08</span><span className="fact-label">Oktet × bit</span><div className="fact-mini-bars"><i /><i /><i /><i /></div></div>
          <div className="fact"><span className="fact-number">256</span><span className="fact-label">Har oktetdagi qiymat</span><div className="fact-mini-bars"><i /><i /><i /><i /></div></div>
          <div className="fact-end"><span className="tiny-live" /> ASOSIY G‘OYA <ArrowDownRight size={18} /></div>
        </section>

        <section className="ip-section section-wrap" id="ip-lab">
          <div className="section-heading">
            <div><span className="section-kicker">01 — INTERAKTIV LABORATORIYA</span><h2>Raqamni o‘zgartir.<br /><span>Bitlarni kuzat.</span></h2></div>
            <p>IPv4 manzili to‘rtta son bilan yoziladi. Har bir son sakkizta bitga mos keladi. Slayderlarni siljitib, sonning ikkilik ko‘rinishi qanday o‘zgarishini ko‘ring.</p>
          </div>
          <div className="ip-lab-grid">
            <div className="lab-main panel-surface">
              <div className="panel-heading"><div className="panel-title"><span className="panel-index">A</span><div><strong>IPv4 konstruktori</strong><small>MANZILNI O‘ZINGIZ TUZING</small></div></div><span className="panel-live"><span className="tiny-live" /> LIVE</span></div>
              <div className="address-display"><span className="address-label">SIZNING MANZILINGIZ</span><div className="address-number" aria-live="polite">{octets.map((value, index) => <span className="address-octet-wrap" key={index}><span className={`address-octet ${index === 0 ? 'octet-mint' : index === 1 ? 'octet-violet' : index === 2 ? 'octet-orange' : 'octet-blue'}`}>{value}</span>{index < 3 && <span className="address-dot">.</span>}</span>)}</div><div className="address-caption"><span><Network size={13} /> IPv4 / 32-bit manzil</span><span className="valid-badge"><CircleCheck size={13} /> FORMAT TO‘G‘RI</span></div></div>
              <div className="octet-controls">
                {octets.map((value, index) => (
                  <div className={`octet-control octet-color-${index}`} key={index}>
                    <div className="octet-control-top"><label htmlFor={`octet-${index}`}>OKTET 0{index + 1}</label><div className="octet-input-wrap"><input id={`octet-${index}`} type="number" min="0" max="255" inputMode="numeric" value={value} onChange={(event) => updateOctet(index, event.target.value)} aria-label={`${index + 1}-oktet qiymati`} /><span>/ 255</span></div></div>
                    <input className="octet-slider" type="range" min="0" max="255" step="1" value={value} style={{ '--range-progress': `${(value / 255) * 100}%` } as CSSProperties} onChange={(event) => updateOctet(index, event.target.value)} aria-label={`${index + 1}-oktet slayderi`} />
                    <div className="slider-scale"><span>0</span><span>127</span><span>255</span></div>
                    {showBitDetails && <div className="binary-line"><span>BIN</span><strong>{bits[index]}</strong></div>}
                  </div>
                ))}
              </div>
              <div className="lab-footer"><div className="preset-group"><span>NAMUNA</span>{addressPresets.map((preset, index) => <button key={preset.label} className={`preset-chip ${presetIndex === index ? 'preset-active' : ''}`} onClick={() => choosePreset(index)}>{preset.label}</button>)}</div><button className="icon-action" onClick={createRandomAddress} title="Tasodifiy manzil yaratish" aria-label="Yangi manzil yaratish"><RotateCcw size={15} /> <span>Yangi manzil</span></button></div>
            </div>
            <aside className="lab-side">
              <div className="bit-card panel-surface">
                <div className="panel-heading compact-heading"><div className="panel-title"><span className="panel-index panel-index-violet"><Binary size={15} /></span><div><strong>8 bit = 1 oktet</strong><small>IKKILIK TIZIM</small></div></div><button className="plain-icon-button" onClick={() => setShowBitDetails((show) => !show)} aria-label={showBitDetails ? 'Bit tafsilotlarini yashirish' : 'Bit tafsilotlarini ko‘rsatish'}><SlidersHorizontal size={16} /></button></div>
                <div className="bit-visual"><div className="bit-squares" aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <span key={index} className={(octets[0] & (1 << (7 - index))) !== 0 ? 'bit-on' : ''}>{(octets[0] & (1 << (7 - index))) !== 0 ? '1' : '0'}</span>)}</div><div className="bit-bracket"><span /><i>8 TA BIT</i><span /></div><div className="bit-equation"><span>2<sup>8</sup></span><ArrowRight size={15} /><strong>256</strong><small>xil qiymat</small></div></div>
                <p className="side-explain">Har bir bit faqat <b>0</b> yoki <b>1</b> bo‘ladi. Sakkizta bit birga 256 xil kombinatsiya hosil qiladi — 0 dan 255 gacha.</p>
                <div className="range-note"><span className="range-note-icon"><Lightbulb size={15} /></span><p><strong>Nega 256 emas, 255 gacha?</strong><br />Chunki sanash 0 dan boshlanadi: 0, 1, 2 ... 255. Jami 256 ta qiymat.</p></div>
              </div>
              <div className="mini-tip"><div className="mini-tip-icon"><Sparkles size={17} /></div><div><strong>Sinab ko‘ring</strong><p>Bir oktetni 127 ga qo‘ying, keyin 128 ga o‘zgartiring. Ikkilik kodning o‘zgarishini kuzating.</p></div></div>
            </aside>
          </div>
        </section>

        <section className="domains-section" id="domains">
          <div className="section-wrap domains-inner">
            <div className="section-heading domains-heading">
              <div><span className="section-kicker">02 — DOMEN DETEKTORI</span><h2>Manzilni qatlamlarga<br /><span>ajratib ko‘r.</span></h2></div>
              <p>URL — shunchaki sayt nomi emas. Har bir bo‘lagi o‘z vazifasiga ega. Quyidagi rangli qismlarni bosing va manzil qanday tuzilganini o‘rganing.</p>
            </div>
            <div className="domain-explorer panel-surface">
              <div className="domain-browserbar"><div className="browser-dots"><i /><i /><i /></div><div className="browser-lock"><Server size={12} /> EXAMPLE URL</div><div className="browser-actions"><span /><span /><span /></div></div>
              <div className="domain-content">
                <div className="domain-instruction"><span className="tiny-live" /> URL QISMLARINI TANLANG <span>01 — 07</span></div>
                <div className="url-composition" aria-label="URL qismlarini tanlang">
                  <button className={`url-part ${activePart === 'protocol' ? 'url-selected' : ''} part-blue`} onClick={() => setActivePart('protocol')}>https://</button>
                  <button className={`url-part ${activePart === 'subdomain' ? 'url-selected' : ''} part-mint`} onClick={() => setActivePart('subdomain')}>learn</button><span className="url-dot">.</span>
                  <button className={`url-part ${activePart === 'domain' ? 'url-selected' : ''} part-violet`} onClick={() => setActivePart('domain')}>example</button>
                  <button className={`url-part ${activePart === 'tld' ? 'url-selected' : ''} part-orange`} onClick={() => setActivePart('tld')}>.com</button>
                  <button className={`url-part ${activePart === 'path' ? 'url-selected' : ''} part-blue`} onClick={() => setActivePart('path')}>/course</button>
                  <button className={`url-part ${activePart === 'query' ? 'url-selected' : ''} part-violet`} onClick={() => setActivePart('query')}>?chapter=10</button>
                  <button className={`url-part ${activePart === 'fragment' ? 'url-selected' : ''} part-mint`} onClick={() => setActivePart('fragment')}>#quiz</button>
                </div>
                <div className="url-underline"><span /><span /><span /><span /><span /><span /><span /></div>
                <div className="domain-detail">
                  <div className={`detail-code ${activePartInfo.color}`}>{activePartInfo.title}</div>
                  <div className="detail-copy"><div className="detail-label">{activePartInfo.label}</div><h3>{activePartInfo.title} <span>— nima qiladi?</span></h3><p>{activePartInfo.description}</p></div>
                  <div className="detail-counter">{(['protocol', 'subdomain', 'domain', 'tld', 'path', 'query', 'fragment'] as AddressPart[]).indexOf(activePart) + 1}<span> / 07</span></div>
                </div>
              </div>
              <div className="domain-legend"><span><i className="legend-dot mint-dot" /> Subdomen</span><span><i className="legend-dot violet-dot" /> Domen</span><span><i className="legend-dot orange-dot" /> Domen zonasi</span><span><i className="legend-dot blue-dot" /> Texnik qism</span></div>
            </div>
            <div className="domain-note-row"><div className="domain-note-icon"><Compass size={19} /></div><p><strong>Subdomenni eslab qolishning oson yo‘li:</strong> <code>docs.example.com</code> manzilidagi <code>docs</code> — alohida bo‘lim nomi. <code>example.com</code> esa asosiy domen.</p><button onClick={() => { setActivePart('subdomain'); navigateTo('domains'); }}>Subdomenni ko‘rsat <ArrowRight size={15} /></button></div>
          </div>
        </section>

        <section className="concepts-section section-wrap" id="concepts">
          <div className="section-heading concept-heading">
            <div><span className="section-kicker">03 — TUSHUNCHALAR XARITASI</span><h2>Uch qism.<br /><span>Bitta internet.</span></h2></div>
            <p>Tarmoqni tushunish uchun atamalarni alohida yodlash yetmaydi. Ularning bir-biriga qanday ulanayotganini ko‘rish muhim.</p>
          </div>
          <div className="concept-flow">
            {concepts.map((concept, index) => {
              const Icon = concept.id === 'ip' ? Network : concept.id === 'dns' ? Globe : Layers;
              const expanded = expandedConcept === concept.id;
              return <article className={`concept-card panel-surface concept-${concept.accent} ${expanded ? 'concept-expanded' : ''}`} key={concept.id}>
                <button className="concept-card-button" onClick={() => setExpandedConcept(expanded ? null : concept.id)} aria-expanded={expanded}>
                  <div className="concept-card-top"><span className="concept-number">{concept.number} / 03</span><span className="concept-icon"><Icon size={19} /></span></div>
                  <span className="concept-eyebrow">{concept.eyebrow}</span><h3>{concept.title}</h3><p>{concept.description}</p>
                  <span className="concept-open">{expanded ? 'Qisqartirish' : 'Batafsil ochish'} <ArrowDownRight size={15} /></span>
                </button>
                {expanded && <div className="concept-extra"><p>{concept.detail}</p></div>}
                {index < concepts.length - 1 && <div className="concept-connector" aria-hidden="true"><ArrowRight size={15} /></div>}
              </article>;
            })}
          </div>
          <div className="flow-caption"><span><Activity size={15} /> MANTIQIY ZANJIR</span><p>Qurilma <b>IP</b> orqali topiladi, <b>DNS</b> domenni aniqlashga yordam beradi, <b>subdomen</b> esa manzillarni tartiblaydi.</p></div>
        </section>

        <section className="knowledge-section" id="knowledge">
          <div className="section-wrap knowledge-grid">
            <div className="knowledge-intro">
              <span className="section-kicker">04 — MUSTAHKAMLASH MAYDONI</span>
              <h2>Bilimni yodda emas,<br /><span>fikrda saqla.</span></h2>
              <p>Javobni taxmin qilib bosishdan ko‘ra, sababini tushunishga harakat qiling. Har savoldan keyin natijangizni ko‘rib chiqasiz.</p>
              <div className="knowledge-metrics"><div><span className="metric-icon"><BookOpen size={16} /></span><strong>7 savol</strong><small>Asosiy tushunchalar</small></div><div><span className="metric-icon metric-violet"><CircleHelp size={16} /></span><strong>Izohlar bilan</strong><small>Har bir javobdan so‘ng</small></div></div>
              <div className="knowledge-quote"><span>“</span><p>Tushunilgan bilim — yangi savollarga yo‘l ochadi.</p><small>NETLAB / O‘RGANISH TAMOYILI</small></div>
            </div>
            <div className="quiz-panel panel-surface">
              <div className="quiz-head"><div><span className="section-kicker">QUICK CHECK / 01</span><h3>Qanchalik tushundingiz?</h3></div><div className="quiz-spark"><Sparkles size={18} /></div></div>
              {!quizResult ? <>
                <div className="quiz-progress-head"><span>JAVOBLAR</span><strong>{String(answeredCount).padStart(2, '0')} <i>/ {String(questions.length).padStart(2, '0')}</i></strong></div>
                <div className="quiz-progress"><span style={{ width: `${quizPercent}%` }} /></div>
                <div className="quiz-questions">
                  {questions.map((question, qIndex) => (
                    <fieldset className="quiz-question" key={question.id}>
                      <legend><span className="question-number">{String(qIndex + 1).padStart(2, '0')}</span><span>{question.question}</span></legend>
                      <div className="answer-options">
                        {question.options.map((option, optionIndex) => {
                          const selected = answers[question.id] === optionIndex;
                          return <button type="button" key={option} className={`answer-option ${selected ? 'answer-selected' : ''}`} onClick={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))} aria-pressed={selected}><span className="answer-letter">{String.fromCharCode(65 + optionIndex)}</span><span>{option}</span><span className="answer-check">{selected && <Check size={14} />}</span></button>;
                        })}
                      </div>
                    </fieldset>
                  ))}
                </div>
                {quizError && <p className="quiz-inline-note">{quizError}</p>}
                <button className="button-primary quiz-submit" onClick={submitQuiz} disabled={!allAnswered || quizBusy}>{quizBusy ? 'Natija hisoblanmoqda…' : 'Natijani ko‘rish'} <ArrowRight size={16} /></button>
                <p className="quiz-footnote"><CircleCheck size={13} /> Javoblaringiz bu saytda saqlanmaydi.</p>
              </> : <div className="quiz-result" aria-live="polite">
                <div className={`result-ring ${quizResult.percent >= 70 ? 'result-good' : ''}`}><strong>{quizResult.percent}<small>%</small></strong><span>{quizResult.score} / {quizResult.total} to‘g‘ri</span></div>
                <span className="result-overline">TAJRIBA YAKUNI</span><h4>{quizResult.percent === 100 ? 'Mukammal bajarildi.' : quizResult.percent >= 70 ? 'Yaxshi tushunibsiz.' : 'Yana bir aylanib chiqing.'}</h4><p className="result-message">{quizResult.message}</p>
                <div className="result-breakdown">{quizResult.results.map((result, index) => {
                  const question = questions.find((item) => item.id === result.id);
                  return <div className="result-row" key={result.id}><span className={result.correct ? 'result-mark correct-mark' : 'result-mark wrong-mark'}>{result.correct ? <Check size={13} /> : <X size={13} />}</span><div><strong>{String(index + 1).padStart(2, '0')}. {question?.question}</strong><p>{result.correct ? 'To‘g‘ri.' : `To‘g‘ri javob: ${question?.options[result.correctAnswer] ?? ''}.`} {result.explanation}</p></div></div>;
                })}</div>
                {quizError && <p className="quiz-inline-note">{quizError}</p>}
                <button className="button-primary quiz-submit" onClick={resetQuiz}><RotateCcw size={15} /> Qayta urinib ko‘rish</button>
              </div>}
            </div>
          </div>
        </section>

        <section className="next-chapter section-wrap" id="next-step">
          <div className="next-chapter-art" aria-hidden="true"><div className="next-orbit next-orbit-a" /><div className="next-orbit next-orbit-b" /><div className="next-orbit next-orbit-c" /><div className="next-core"><BookOpen size={29} /></div><span className="art-label art-label-one">CH. 10</span><span className="art-label art-label-two">CH. 11</span></div>
          <div className="next-chapter-copy"><span className="section-kicker">KEYINGI QADAM</span><h2>Qiziqish tugamagan<br />joyda <span>o‘rganish boshlanadi.</span></h2><p>Bugungi tushunchalarni darslikdagi mavzular bilan bog‘lang. Keyingi mavzuni o‘qiyotganda IP, DNS va domenlar qayerda uchrashiga e’tibor bering.</p><button className="button-outline" onClick={() => navigateTo('concepts')}>Tushunchalarni yana ko‘rish <ArrowUpRight size={16} /></button></div>
          <div className="next-index"><span>YOUR LEARNING PATH</span><strong>01<span>—</span>11</strong><small>Har bir tushuncha keyingisiga ko‘prik.</small></div>
        </section>
      </main>

      <footer className="site-footer section-wrap">
        <a className="brand footer-brand" href="#top" onClick={(event) => { event.preventDefault(); navigateTo('top'); }}><span className="brand-mark"><Network size={18} /></span><span className="brand-copy"><strong>net<span>lab</span></strong><small>INTERNET ATLASI</small></span></a>
        <p>Internet — tushunish mumkin bo‘lgan tizim.</p>
        <div className="footer-links"><a href="#ip-lab" onClick={(event) => { event.preventDefault(); navigateTo('ip-lab'); }}>IP LAB</a><a href="#domains" onClick={(event) => { event.preventDefault(); navigateTo('domains'); }}>DOMENLAR</a><a href="#knowledge" onClick={(event) => { event.preventDefault(); navigateTo('knowledge'); }}>TEST</a></div>
        <span className="footer-copyright">© 2026 NETLAB / LEARN BY EXPLORING</span>
      </footer>
    </div>
  );
}

function randomByte(): number {
  return Math.floor(Math.random() * 256);
}

export default App;
