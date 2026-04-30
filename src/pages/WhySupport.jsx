import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  Heart,
  Target,
  Eye,
  Users,
  GraduationCap,
  Briefcase,
  DollarSign,
  Rocket,
  Globe,
  ArrowLeft,
  Lightbulb,
  Shield,
  TrendingUp,
} from 'lucide-react';

const translations = {
  en: {
    title: 'Why We Need Your Support',
    backToContact: 'Back to Contact Us',
    vision: 'Our Vision',
    mission: 'Our Mission',
    whySupport: 'Why Your Support Matters',
    supportNow: 'Support Us Now',
    visionText: 'To create a thriving ecosystem where students can gain real-world experience, build their portfolios, and earn income while helping businesses find talented, affordable talent.',
    missionText: 'To bridge the gap between ambitious students and businesses seeking quality work at fair prices. We provide a platform that empowers students to showcase their skills, connect with clients, and grow professionally while offering businesses access to fresh, innovative talent.',
    reason1Title: 'Empowering Student Talent',
    reason1Desc: 'Your support helps us provide free access to students, allowing them to build their careers without financial barriers. We believe every student deserves a chance to showcase their skills.',
    reason2Title: 'Platform Development & Maintenance',
    reason2Desc: 'Maintaining a secure, fast, and user-friendly platform requires continuous investment in technology, security, and infrastructure. Your contributions help us improve and scale our services.',
    reason3Title: 'Supporting Student Growth',
    reason3Desc: 'We invest in resources, tools, and programs that help students develop their skills, build portfolios, and succeed in their freelance careers. Your support directly funds these initiatives.',
    reason4Title: 'Expanding Opportunities',
    reason4Desc: 'With your support, we can reach more students and businesses, creating more job opportunities and connections. Every contribution helps us grow our community and impact.',
    reason5Title: 'Keeping Services Affordable',
    reason5Desc: 'Your donations help us keep our platform accessible and affordable for students, ensuring that financial constraints don\'t prevent talented individuals from pursuing their dreams.',
    reason6Title: 'Innovation & Features',
    reason6Desc: 'We continuously work on new features, improvements, and innovations to enhance the platform experience. Your support enables us to invest in research and development.',
    futureVision: 'Our Future Vision',
    futureVisionDesc: 'The landscape of work is rapidly changing, and we\'re here to help students adapt and thrive.',
    aiImpact: 'The Age of AI and Student Opportunities',
    aiImpactDesc: 'We\'re witnessing a significant shift in the workforce. The average age of workers in many industries is decreasing as AI and automation reshape traditional roles. This creates unprecedented opportunities for students who are tech-savvy, adaptable, and ready to embrace new technologies.',
    studentAdvantage: 'Why Students Excel',
    studentAdvantageDesc: 'Students bring fresh perspectives, digital-native skills, and the ability to quickly learn and adapt to new tools and technologies. They can deliver high-quality work at competitive rates, making them ideal partners for businesses looking to innovate and grow.',
    courseHub: 'Course Hub Initiative',
    courseHubTitle: 'Building a Learning Ecosystem',
    courseHubDesc: 'One of our key targets is to create a comprehensive course hub where students can learn directly from experienced company employees. This initiative will provide students with real-world skills, industry insights, and mentorship opportunities that bridge the gap between academic learning and professional practice.',
    courseHubBenefits: 'Benefits of the Course Hub',
    courseHubBenefit1: 'Direct learning from industry professionals',
    courseHubBenefit2: 'Practical, job-relevant skills and knowledge',
    courseHubBenefit3: 'Mentorship and networking opportunities',
    courseHubBenefit4: 'Certification and portfolio building',
    courseHubBenefit5: 'Better preparation for freelance and full-time careers',
    internshipPrograms: 'Internship Company Programs Partners',
    internshipProgramsTitle: 'We will create internship company programs partners for top-tier students',
    internshipProgramsDesc: 'We are planning to establish partnerships with leading companies to offer exclusive internship opportunities for our top-performing students. This program will provide real-world experience, mentorship from industry experts, and potential pathways to full-time employment.',
  },
  it: {
    title: 'Perché Abbiamo Bisogno del Tuo Supporto',
    backToContact: 'Torna a Contattaci',
    vision: 'La Nostra Visione',
    mission: 'La Nostra Missione',
    whySupport: 'Perché il Tuo Supporto è Importante',
    supportNow: 'Supportaci Ora',
    visionText: 'Creare un ecosistema fiorente dove gli studenti possono acquisire esperienza nel mondo reale, costruire i loro portfolio e guadagnare reddito mentre aiutano le aziende a trovare talenti talentuosi e convenienti.',
    missionText: 'Colmare il divario tra studenti ambiziosi e aziende che cercano lavoro di qualità a prezzi equi. Forniamo una piattaforma che consente agli studenti di mostrare le loro competenze, connettersi con i clienti e crescere professionalmente, offrendo alle aziende l\'accesso a talenti freschi e innovativi.',
    reason1Title: 'Potenziare il Talento degli Studenti',
    reason1Desc: 'Il tuo supporto ci aiuta a fornire accesso gratuito agli studenti, permettendo loro di costruire le loro carriere senza barriere finanziarie. Crediamo che ogni studente meriti una possibilità di mostrare le proprie competenze.',
    reason2Title: 'Sviluppo e Manutenzione della Piattaforma',
    reason2Desc: 'Mantenere una piattaforma sicura, veloce e user-friendly richiede investimenti continui in tecnologia, sicurezza e infrastruttura. I tuoi contributi ci aiutano a migliorare e scalare i nostri servizi.',
    reason3Title: 'Supportare la Crescita degli Studenti',
    reason3Desc: 'Investiamo in risorse, strumenti e programmi che aiutano gli studenti a sviluppare le loro competenze, costruire portfolio e avere successo nelle loro carriere freelance. Il tuo supporto finanzia direttamente queste iniziative.',
    reason4Title: 'Espandere le Opportunità',
    reason4Desc: 'Con il tuo supporto, possiamo raggiungere più studenti e aziende, creando più opportunità di lavoro e connessioni. Ogni contributo ci aiuta a far crescere la nostra comunità e il nostro impatto.',
    reason5Title: 'Mantenere i Servizi Accessibili',
    reason5Desc: 'Le tue donazioni ci aiutano a mantenere la nostra piattaforma accessibile e conveniente per gli studenti, assicurando che i vincoli finanziari non impediscano a individui talentuosi di perseguire i loro sogni.',
    reason6Title: 'Innovazione e Funzionalità',
    reason6Desc: 'Lavoriamo continuamente su nuove funzionalità, miglioramenti e innovazioni per migliorare l\'esperienza della piattaforma. Il tuo supporto ci consente di investire in ricerca e sviluppo.',
    futureVision: 'La Nostra Visione Futura',
    futureVisionDesc: 'Il panorama del lavoro sta cambiando rapidamente, e siamo qui per aiutare gli studenti ad adattarsi e prosperare.',
    aiImpact: 'L\'Era dell\'IA e le Opportunità degli Studenti',
    aiImpactDesc: 'Stiamo assistendo a un cambiamento significativo nella forza lavoro. L\'età media dei lavoratori in molti settori sta diminuendo mentre l\'IA e l\'automazione rimodellano i ruoli tradizionali. Questo crea opportunità senza precedenti per gli studenti che sono esperti di tecnologia, adattabili e pronti ad abbracciare nuove tecnologie.',
    studentAdvantage: 'Perché gli Studenti Eccellono',
    studentAdvantageDesc: 'Gli studenti portano prospettive fresche, competenze digital-native e la capacità di apprendere e adattarsi rapidamente a nuovi strumenti e tecnologie. Possono fornire lavoro di alta qualità a tariffe competitive, rendendoli partner ideali per le aziende che cercano di innovare e crescere.',
    courseHub: 'Iniziativa Course Hub',
    courseHubTitle: 'Costruire un Ecosistema di Apprendimento',
    courseHubDesc: 'Uno dei nostri obiettivi chiave è creare un hub di corsi completo dove gli studenti possono apprendere direttamente da dipendenti aziendali esperti. Questa iniziativa fornirà agli studenti competenze del mondo reale, approfondimenti del settore e opportunità di mentorship che colmano il divario tra l\'apprendimento accademico e la pratica professionale.',
    courseHubBenefits: 'Vantaggi del Course Hub',
    courseHubBenefit1: 'Apprendimento diretto da professionisti del settore',
    courseHubBenefit2: 'Competenze e conoscenze pratiche e rilevanti per il lavoro',
    courseHubBenefit3: 'Opportunità di mentorship e networking',
    courseHubBenefit4: 'Certificazione e costruzione del portfolio',
    courseHubBenefit5: 'Migliore preparazione per carriere freelance e a tempo pieno',
    internshipPrograms: 'Programmi di Stage Aziendali Partner',
    internshipProgramsTitle: 'Creeremo programmi di stage aziendali partner per studenti di alto livello',
    internshipProgramsDesc: 'Stiamo pianificando di stabilire partnership con aziende leader per offrire opportunità di stage esclusive per i nostri studenti più performanti. Questo programma fornirà esperienza nel mondo reale, mentorship da esperti del settore e potenziali percorsi verso l\'occupazione a tempo pieno.',
  },
  ar: {
    title: 'لماذا نحتاج دعمك',
    backToContact: 'العودة لاتصل بنا',
    vision: 'رؤيتنا',
    mission: 'مهمتنا',
    whySupport: 'لماذا يهم دعمك',
    supportNow: 'تبرّع',
    visionText: 'أن نبني منظومة ينمّي فيها الطلاب خبرة حقيقية ودخلاً عادلاً ويصل فيها العملاء لموهبة مميزة.',
    missionText: 'ربط الطموحين بالشركات بأسعار عادلة، بمنصة تبني المهارات وتمكّن الجانبين.',
    reason1Title: 'تمكين الطلاب',
    reason1Desc: 'دعمك يعني وصولاً أسهل وفرصة لإظهار المهارة دون عوائق مادية تمنع الموهوبين.',
    reason2Title: 'تطوير المنصة',
    reason2Desc: 'نستثمر في الأمان، السرعة، والبنية — مساهمتك تُبقي الخدمة موثوقة وقابلة للنمو.',
    reason3Title: 'نمو المهارات',
    reason3Desc: 'نمول أدوات وبرامج تساعد الطلاب على التعلم وبناء سيرة قوية.',
    reason4Title: 'توسيع الفرص',
    reason4Desc: 'نتوسع بمجتمعنا ونربط المزيد من الأطراف بفضل دعمك.',
    reason5Title: 'الأسعار المناسبة',
    reason5Desc: 'تبرعاتك تساعد على بقاء المنصة في متناول من يحتاجونها.',
    reason6Title: 'الابتكار',
    reason6Desc: 'نطوّر مزايا جديدة بفضل دعمكم للبحث والتطوير.',
    futureVision: 'نظرة مستقبلية',
    futureVisionDesc: 'عالم العمل يتغيّر — ونساعد الطلاب على التأقلم والنجاح.',
    aiImpact: 'الذكاء الاصطناعي والفرص',
    aiImpactDesc: 'يُعيد تشكيل السوق — والطلاب الأكثر مرونة وإلماماً بالتقنية هم الأقرب لاغتنام الفرص.',
    studentAdvantage: 'ميزة الطلاب',
    studentAdvantageDesc: 'نظرة جديدة، مهارات رقمية، وسرعة تعلّم — جودة عالية بقيمة مناسبة.',
    courseHub: 'مبادرة «مركز الدورات»',
    courseHubTitle: 'منظومة تعلم',
    courseHubDesc: 'نستهدف بناء حاضنة دورات يلتقي فيها الطلاب بخبراء من القطاع.',
    courseHubBenefits: 'الفوائد',
    courseHubBenefit1: 'تعلم مباشر من الممارسين',
    courseHubBenefit2: 'مهارات عملية',
    courseHubBenefit3: 'إرشاد وشبكات',
    courseHubBenefit4: 'شهادات ومحفظة',
    courseHubBenefit5: 'استعداد أفضل لسوق العمل',
    internshipPrograms: 'شراكات تدريب',
    internshipProgramsTitle: 'برامج مع شركات رائدة',
    internshipProgramsDesc: 'نخطط لعروض تدريب حصرية لأفضل أداء، مع خبرة حقيقية وإمكان توظيف لاحق.',
  },
};

const WhySupport = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('dashboardLanguage') || 'en';
  });

  // Determine the correct contact-us path based on user role or current path
  const getContactUsPath = () => {
    if (user?.role === 'client') {
      return '/client/contact-us';
    } else if (user?.role === 'student') {
      return '/student/contact-us';
    } else if (location.pathname.includes('/client/')) {
      return '/client/contact-us';
    } else {
      return '/student/contact-us';
    }
  };

  useEffect(() => {
    const handleLanguageChange = (event) => {
      setLanguage(event.detail.language);
    };
    
    window.addEventListener('languageChanged', handleLanguageChange);
    const handleStorageChange = () => {
      setLanguage(localStorage.getItem('dashboardLanguage') || 'en');
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const t = translations[language] || translations.en;

  const reasons = [
    {
      icon: GraduationCap,
      title: t.reason1Title,
      description: t.reason1Desc,
      color: 'blue',
    },
    {
      icon: Rocket,
      title: t.reason2Title,
      description: t.reason2Desc,
      color: 'purple',
    },
    {
      icon: TrendingUp,
      title: t.reason3Title,
      description: t.reason3Desc,
      color: 'green',
    },
    {
      icon: Globe,
      title: t.reason4Title,
      description: t.reason4Desc,
      color: 'orange',
    },
    {
      icon: DollarSign,
      title: t.reason5Title,
      description: t.reason5Desc,
      color: 'teal',
    },
    {
      icon: Lightbulb,
      title: t.reason6Title,
      description: t.reason6Desc,
      color: 'yellow',
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      purple: 'bg-purple-100 text-purple-600',
      green: 'bg-green-100 text-green-600',
      orange: 'bg-orange-100 text-orange-600',
      teal: 'bg-teal-100 text-teal-600',
      yellow: 'bg-yellow-100 text-yellow-600',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8">
      {/* Back Button */}
      <Link
        to={getContactUsPath()}
        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 text-sm sm:text-base"
      >
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        {t.backToContact}
      </Link>

      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full mb-4">
          <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {t.title}
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
          {t.futureVisionDesc}
        </p>
      </div>

      {/* Vision & Mission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
        <Card className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Eye className="w-6 h-6 text-primary-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t.vision}</h2>
          </div>
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
            {t.visionText}
          </p>
        </Card>

        <Card className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t.mission}</h2>
          </div>
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
            {t.missionText}
          </p>
        </Card>
      </div>

      {/* Why Support Section */}
      <div className="mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
          {t.whySupport}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className={`w-12 h-12 ${getColorClasses(reason.color)} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {reason.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {reason.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Support Button - Centered */}
      <div className="flex justify-center items-center mb-8 sm:mb-12">
        <Link to={getContactUsPath()}>
          <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-base sm:text-lg">
            <Heart className="w-5 h-5 mr-2" />
            {t.supportNow}
          </Button>
        </Link>
      </div>

      {/* Future Vision Section */}
      <Card className="p-6 sm:p-8 bg-gradient-to-br from-primary-50 to-green-50 border-2 border-primary-200">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <Eye className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            {t.futureVision}
          </h2>
          <p className="text-gray-700 text-sm sm:text-base max-w-3xl mx-auto">
            {t.futureVisionDesc}
          </p>
        </div>

        {/* AI Impact Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Rocket className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
              {t.aiImpact}
            </h3>
          </div>
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-4">
            {t.aiImpactDesc}
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <h4 className="font-semibold text-gray-900 mb-2">{t.studentAdvantage}</h4>
            <p className="text-gray-700 text-sm sm:text-base">
              {t.studentAdvantageDesc}
            </p>
          </div>
        </div>

        {/* Course Hub Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
              {t.courseHub}
            </h3>
          </div>
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-4">
            <strong className="text-gray-900">{t.courseHubTitle}:</strong> {t.courseHubDesc}
          </p>
          
          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
            <h4 className="font-semibold text-gray-900 mb-3">{t.courseHubBenefits}</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                <span className="text-purple-600 font-bold mt-1">•</span>
                <span>{t.courseHubBenefit1}</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                <span className="text-purple-600 font-bold mt-1">•</span>
                <span>{t.courseHubBenefit2}</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                <span className="text-purple-600 font-bold mt-1">•</span>
                <span>{t.courseHubBenefit3}</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                <span className="text-purple-600 font-bold mt-1">•</span>
                <span>{t.courseHubBenefit4}</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                <span className="text-purple-600 font-bold mt-1">•</span>
                <span>{t.courseHubBenefit5}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Internship Programs Section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
              {t.internshipPrograms}
            </h3>
          </div>
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
            <strong className="text-gray-900">{t.internshipProgramsTitle}:</strong> {t.internshipProgramsDesc}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default WhySupport;

