/**
 * Trilingual copy for / (client) and /students (student) landings.
 * Used by LandingLocaleContext — keys are accessed via t('path') or copy.client / copy.student.
 */
export const LANDING_STORAGE_KEY = 'landingLanguage';

export const SUPPORTED_LANDING_LOCALES = ['en', 'it', 'ar'];

const en = {
  client: {
    nav: {
      forStudents: 'For Students',
      signIn: 'Sign In',
      postAJob: 'Post a Job',
      toggleMenu: 'Toggle menu',
      logout: 'Log out',
    },
    mock: {
      new: 'New',
      timeAgo: '2 min ago',
      jobTitle: 'Logo Design Needed',
      priceRange: '500–800 EGP',
      days: '3 days',
      proposals: 'Proposals',
      reviewProposals: 'Review proposals',
      hiredIn24h: 'Hired in 24h',
      avgResponse: 'Avg. response time',
    },
    proposals: [
      { initials: 'SA', name: 'Sara A.', rating: 4.9, snippet: 'I can deliver this in 2 days...' },
      { initials: 'OK', name: 'Omar K.', rating: 4.7, snippet: 'Great at brand identity work...' },
      { initials: 'NM', name: 'Nour M.', rating: 5.0, snippet: 'Ready to start immediately...' },
    ],
    hero: {
      trustBadge: "Egypt's First Student Freelance Platform",
      h1a: 'Hire verified',
      h1b: 'student talent',
      h1c: 'fast and affordable.',
      h2: "Post a job in 2 minutes. Get proposals from Egypt's top university students.",
      cta: 'Post a Job for Free',
      trust1: 'No upfront cost',
      trust2: '500+ vetted students',
      trust3: 'Design, Dev, Marketing & more',
    },
  },
  student: {
    nav: {
      forClients: 'For Clients',
      signIn: 'Sign In',
      startEarning: 'Start Earning',
      toggleMenu: 'Toggle menu',
      logout: 'Log out',
    },
    mock: {
      recentEarnings: 'Recent Earnings',
      live: 'Live',
      firstProject: 'First project',
      avg48: 'avg. in 48h',
      rating: '4.9 avg rating',
      fromClients: 'from clients',
      studentsEarning: '500+ students earning this week',
    },
    rows: [
      { initials: 'AK', name: 'Ahmed K.', skill: 'Graphic Design', amount: '2,500', label: 'this week' },
      { initials: 'SM', name: 'Sara M.', skill: 'Web Development', amount: '4,200', label: 'this month' },
      { initials: 'NR', name: 'Nour R.', skill: 'Video Editing', amount: '1,800', label: 'this week' },
    ],
    hero: {
      topBadge: 'Free to join · No experience needed',
      h1a: 'Turn your',
      h1b: 'university skills',
      h1c: 'into real income.',
      h2: "Egypt's first freelance platform built exclusively for students. Free to join.",
      ctaStart: 'Start Earning',
      ctaHow: 'See How It Works',
      trust1: 'Free to join',
      trust2: 'No experience needed',
      trust3: 'Get paid in EGP directly',
    },
  },
  common: {
    logoAlt: 'FreshLancer',
    egp: 'EGP',
  },
};

const it = {
  client: {
    nav: {
      forStudents: 'Per studenti',
      signIn: 'Accedi',
      postAJob: 'Pubblica lavoro',
      toggleMenu: 'Apri menu',
      logout: 'Esci',
    },
    mock: {
      new: 'Nuovo',
      timeAgo: '2 min fa',
      jobTitle: 'Servono logo e brand',
      priceRange: '500–800 EGP',
      days: '3 giorni',
      proposals: 'Proposte',
      reviewProposals: 'Vedi proposte',
      hiredIn24h: 'Assunzione in 24h',
      avgResponse: 'Tempo risposta medio',
    },
    proposals: [
      { initials: 'SA', name: 'Sara A.', rating: 4.9, snippet: 'Posso consegnare in 2 giorni...' },
      { initials: 'OK', name: 'Omar K.', rating: 4.7, snippet: 'Esperto in identità visiva...' },
      { initials: 'NM', name: 'Nour M.', rating: 5.0, snippet: 'Pronta a iniziare subito...' },
    ],
    hero: {
      trustBadge: 'Prima piattaforma freelance per studenti in Egitto',
      h1a: 'Assumi',
      h1b: 'talento studentesco verificato',
      h1c: 'in modo rapido e conveniente.',
      h2: 'Pubblica un lavoro in 2 minuti. Ricevi proposte dai migliori studenti universitari egiziani.',
      cta: 'Pubblica gratis',
      trust1: 'Nessun costo anticipato',
      trust2: 'Oltre 500 studenti verificati',
      trust3: 'Design, sviluppo, marketing e altro',
    },
  },
  student: {
    nav: {
      forClients: 'Per clienti',
      signIn: 'Accedi',
      startEarning: 'Inizia a guadagnare',
      toggleMenu: 'Apri menu',
      logout: 'Esci',
    },
    mock: {
      recentEarnings: 'Guadagni recenti',
      live: 'Live',
      firstProject: 'Primo progetto',
      avg48: 'media in 48h',
      rating: 'Valutazione media 4,9',
      fromClients: 'da clienti',
      studentsEarning: 'Oltre 500 studenti questa settimana',
    },
    rows: [
      { initials: 'AK', name: 'Ahmed K.', skill: 'Design grafico', amount: '2.500', label: 'questa settimana' },
      { initials: 'SM', name: 'Sara M.', skill: 'Sviluppo web', amount: '4.200', label: 'questo mese' },
      { initials: 'NR', name: 'Nour R.', skill: 'Montaggio video', amount: '1.800', label: 'questa settimana' },
    ],
    hero: {
      topBadge: 'Iscrizione gratuita · Senza esperienza richiesta',
      h1a: 'Trasforma le tue',
      h1b: 'competenze universitarie',
      h1c: 'in un reddito reale.',
      h2: 'Prima piattaforma freelance in Egitto dedicata agli studenti. Iscrizione gratuita.',
      ctaStart: 'Inizia a guadagnare',
      ctaHow: 'Come funziona',
      trust1: 'Iscrizione gratuita',
      trust2: 'Nessuna esperienza richiesta',
      trust3: 'Pagamenti in EGP direttamente',
    },
  },
  common: {
    logoAlt: 'FreshLancer',
    egp: 'EGP',
  },
};

const ar = {
  client: {
    nav: {
      forStudents: 'للطلاب',
      signIn: 'تسجيل الدخول',
      postAJob: 'نشر وظيفة',
      toggleMenu: 'قائمة',
      logout: 'تسجيل الخروج',
    },
    mock: {
      new: 'جديد',
      timeAgo: 'قبل دقيقتين',
      jobTitle: 'مطلوب تصميم شعار',
      priceRange: '٥٠٠–٨٠٠ ج.م',
      days: '٣ أيام',
      proposals: 'عروض',
      reviewProposals: 'مراجعة العروض',
      hiredIn24h: 'تم التعاقد خلال ٢٤ ساعة',
      avgResponse: 'متوسّط زمن الرد',
    },
    proposals: [
      { initials: 'س', name: 'سارة أ.', rating: 4.9, snippet: 'أُسلّم العمل خلال يومين...' },
      { initials: 'ع', name: 'عمر خ.', rating: 4.7, snippet: 'خبرة في هوية بصرية...' },
      { initials: 'ن', name: 'نور م.', rating: 5.0, snippet: 'جاهز للبدء فوراً...' },
    ],
    hero: {
      trustBadge: 'أوّل منصّة لعمل حر لطلاب مصر',
      h1a: 'وظّف',
      h1b: 'موهبة طلابية موثّقة',
      h1c: 'بسرعة وتكلفة مناسبة.',
      h2: 'انشر وظيفتك خلال دقيقتين. استقبل عروضاً من نخبة طلاب الجامعات في مصر.',
      cta: 'انشر وظيفة مجاناً',
      trust1: 'لا تكلفة مقدّمة',
      trust2: 'أكثر من ٥٠٠ طالب موثّق',
      trust3: 'تصميم، برمجة، تسويق وأكثر',
    },
  },
  student: {
    nav: {
      forClients: 'للعملاء',
      signIn: 'تسجيل الدخول',
      startEarning: 'ابدأ الربح',
      toggleMenu: 'قائمة',
      logout: 'تسجيل الخروج',
    },
    mock: {
      recentEarnings: 'أرباح حديثة',
      live: 'مباشر',
      firstProject: 'أوّل مشروع',
      avg48: 'معدّل خلال ٤٨ ساعة',
      rating: 'تقييم ٤٫٩',
      fromClients: 'من العملاء',
      studentsEarning: 'أكثر من ٥٠٠ طالب يتقاضون الأرباح هذا الأسبوع',
    },
    rows: [
      { initials: 'أ', name: 'أحمد ك.', skill: 'تصميم جرافيك', amount: '٢٬٥٠٠', label: 'هذا الأسبوع' },
      { initials: 'س', name: 'سارة م.', skill: 'تطوير ويب', amount: '٤٬٢٠٠', label: 'هذا الشهر' },
      { initials: 'ن', name: 'نور ر.', skill: 'مونتاج فيديو', amount: '١٬٨٠٠', label: 'هذا الأسبوع' },
    ],
    hero: {
      topBadge: 'تسجيل مجاني · بلا حاجة لخبرة',
      h1a: 'حوّل',
      h1b: 'مهاراتك الجامعية',
      h1c: 'إلى دخل حقيقي.',
      h2: 'أوّل منصّة عربية مخصّصة للطلاب. التسجيل مجاني.',
      ctaStart: 'ابدأ الربح',
      ctaHow: 'كيف يعمل؟',
      trust1: 'تسجيل مجاني',
      trust2: 'لا يلزمك خبرة',
      trust3: 'تَسلّم بالجنيه مباشرة',
    },
  },
  common: {
    logoAlt: 'فريش لانسر',
    egp: 'ج.م',
  },
};

export const LANDING_MESSAGES = { en, it, ar };

function getByPath(obj, path) {
  if (!obj || !path) return undefined;
  return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
}

export function translate(locale, key, fallback = 'en') {
  const b = LANDING_MESSAGES[locale] || LANDING_MESSAGES[fallback];
  const v = getByPath(b, key);
  if (v !== undefined) return v;
  return getByPath(LANDING_MESSAGES[fallback], key) ?? key;
}
