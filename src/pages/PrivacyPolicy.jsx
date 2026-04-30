import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import Card from '../components/common/Card';
import {
  Shield,
  Lock,
  Eye,
  Database,
  Users,
  CreditCard,
  Mail,
  Globe,
  FileText,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Cookie,
  Server,
  Key,
  UserCheck,
  Trash2,
  Download,
  Edit,
} from 'lucide-react';

const translations = {
  en: {
    title: 'Privacy Policy',
    lastUpdated: 'Last Updated: January 2025',
    walletSecurity: {
      title: 'Wallet and Payment Security',
      subtitle: 'We implement industry-leading security measures to protect your financial information and transactions.',
      measures: [
        {
          title: 'Escrow Protection',
          description: 'All milestone payments are held in secure escrow accounts until project completion. Funds are only released upon your approval, ensuring you maintain control over payments.',
        },
        {
          title: 'Secure Payment Gateways',
          description: 'We use certified payment processors (PayMob for EGP, PayPal for USD) that comply with PCI-DSS standards. Your payment information is never stored on our servers.',
        },
        {
          title: 'Transaction Security',
          description: 'All transactions are encrypted and monitored for fraud. We maintain detailed transaction records for your reference and dispute resolution.',
        },
        {
          title: 'Wallet Protection',
          description: 'Your wallet balance is protected by multiple security layers. Withdrawals require authentication, and all wallet activities are logged for security auditing.',
        },
        {
          title: 'Fee Transparency',
          description: 'Platform and transaction fees are clearly displayed before payment. You can view all fees and charges in your transaction history.',
        },
      ],
    },
    backToHome: 'Back to Home',
    introduction: {
      title: 'Introduction',
      content: 'At Freshlancer, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.',
      effectiveDate: 'This policy is effective as of January 2025 and applies to all users of the Freshlancer platform.',
    },
    informationWeCollect: {
      title: 'Information We Collect',
      subtitle: 'We collect information that you provide directly to us and information that is automatically collected when you use our services.',
      personalInfo: {
        title: 'Personal Information',
        items: [
          'Name, email address, and phone number',
          'Age, gender, nationality, and country of residence',
          'Profile photo and location information',
          'Account credentials (encrypted passwords)',
        ],
      },
      studentInfo: {
        title: 'Student-Specific Information',
        items: [
          'University name, major, and graduation year',
          'Skills, experience level, and years of experience',
          'Portfolio projects and professional links (GitHub, LinkedIn, etc.)',
          'Resume/CV and additional documents',
          'Verification documents (student ID, enrollment certificates, transcripts)',
          'Intro video and certifications',
          'Languages and proficiency levels',
          'Hourly rate preferences and availability status',
        ],
      },
      clientInfo: {
        title: 'Client-Specific Information',
        items: [
          'Company name, size, and industry',
          'Business registration and tax identification numbers',
          'Billing address and payment method information',
          'Company website and description',
          'Social media and professional links',
          'Wallet balance and transaction history',
          'Escrow account information and milestone funding details',
          'Payment gateway preferences and saved payment methods',
        ],
      },
      usageData: {
        title: 'Usage and Activity Data',
        items: [
          'Job applications and application history',
          'Profile views and unlock activities',
          'Messages and communications',
          'Transaction history and payment information',
          'Subscription status and usage limits',
          'Reviews and ratings given or received',
          'Wallet transactions, escrow deposits, and withdrawals',
          'Contract milestone funding and payment releases',
          'Platform fee and transaction fee records',
        ],
      },
      technicalData: {
        title: 'Technical Information',
        items: [
          'IP address and device information',
          'Browser type and version',
          'Operating system',
          'Device type (desktop, mobile, tablet)',
          'Usage patterns and platform interactions',
          'Cookies and similar tracking technologies',
        ],
      },
    },
    howWeUseInfo: {
      title: 'How We Use Your Information',
      subtitle: 'We use the information we collect for various purposes to provide, maintain, and improve our services.',
      purposes: [
        {
          title: 'Service Provision',
          description: 'To create and manage your account, process transactions, facilitate job applications, and enable communication between students and clients.',
        },
        {
          title: 'Verification and Security',
          description: 'To verify student identities, prevent fraud, ensure platform security, and protect against unauthorized access.',
        },
        {
          title: 'Payment Processing',
          description: 'To process payments for subscriptions, packages, and transactions through our secure payment partners (PayMob for EGP, PayPal for USD). We use escrow protection to secure milestone payments, ensuring funds are held safely until project completion.',
        },
        {
          title: 'Wallet Management',
          description: 'To manage client wallets, process escrow deposits, track milestone funding, handle withdrawals, and maintain transaction records with full security and transparency.',
        },
        {
          title: 'Communication',
          description: 'To send you notifications, updates, respond to inquiries, and provide customer support.',
        },
        {
          title: 'Platform Improvement',
          description: 'To analyze usage patterns, improve our services, develop new features, and enhance user experience.',
        },
        {
          title: 'Legal Compliance',
          description: 'To comply with legal obligations, resolve disputes, and enforce our terms of service.',
        },
      ],
    },
    dataSharing: {
      title: 'Data Sharing and Disclosure',
      subtitle: 'We do not sell your personal information. We may share your information in the following circumstances:',
      scenarios: [
        {
          title: 'With Other Users',
          description: 'Your profile information (as configured in your privacy settings) is visible to other users on the platform. Clients can view anonymized student profiles and unlock full profiles using points.',
        },
        {
          title: 'Service Providers',
          description: 'We share information with third-party service providers who perform services on our behalf, such as payment processing (Paymob), hosting, analytics, and email delivery.',
        },
        {
          title: 'Legal Requirements',
          description: 'We may disclose information if required by law, court order, or government regulation, or to protect our rights, property, or safety.',
        },
        {
          title: 'Business Transfers',
          description: 'In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.',
        },
      ],
    },
    dataSecurity: {
      title: 'Data Security',
      subtitle: 'We implement appropriate technical and organizational measures to protect your personal information.',
      measures: [
        'Encryption of sensitive data in transit and at rest',
        'Secure password hashing using bcrypt',
        'Regular security audits and vulnerability assessments',
        'Access controls and authentication mechanisms',
        'Secure payment processing through certified providers (PayMob, PayPal)',
        'Escrow protection system for milestone payments',
        'Secure wallet infrastructure with encrypted transaction records',
        'PCI-DSS compliant payment gateway integration',
        'Two-factor authentication for sensitive operations',
        'Regular backups and disaster recovery procedures',
        'Real-time fraud detection and monitoring',
      ],
    },
    dataRetention: {
      title: 'Data Retention',
      content: 'We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. When you delete your account, we will delete or anonymize your personal information, except where we are required to retain it for legal or regulatory purposes.',
    },
    yourRights: {
      title: 'Your Rights and Choices',
      subtitle: 'You have certain rights regarding your personal information:',
      rights: [
        {
          title: 'Access',
          description: 'You can access and review your personal information through your account settings.',
        },
        {
          title: 'Correction',
          description: 'You can update or correct your personal information at any time through your profile settings.',
        },
        {
          title: 'Deletion',
          description: 'You can request deletion of your account and personal information, subject to legal retention requirements.',
        },
        {
          title: 'Data Portability',
          description: 'You can request a copy of your data in a portable format.',
        },
        {
          title: 'Opt-Out',
          description: 'You can opt-out of marketing communications and adjust notification preferences in your account settings.',
        },
        {
          title: 'Verification Status',
          description: 'You can view and manage your verification status and documents through your student dashboard.',
        },
      ],
    },
    cookies: {
      title: 'Cookies and Tracking Technologies',
      content: 'We use cookies and similar tracking technologies to collect information about your browsing behavior, preferences, and interactions with our platform. You can control cookies through your browser settings, but disabling cookies may affect the functionality of our services.',
      types: [
        'Essential cookies required for platform functionality',
        'Authentication cookies to maintain your login session',
        'Analytics cookies to understand platform usage',
        'Preference cookies to remember your settings',
      ],
    },
    thirdPartyServices: {
      title: 'Third-Party Services',
      subtitle: 'Our platform integrates with third-party services that have their own privacy policies:',
      services: [
        {
          name: 'PayMob',
          description: 'Payment processing service for EGP transactions. PayMob handles payment data according to PCI-DSS standards. Please review PayMob\'s privacy policy for information about how they handle payment data.',
        },
        {
          name: 'PayPal',
          description: 'Payment processing service for USD transactions. PayPal provides secure payment processing with buyer and seller protection. Please review PayPal\'s privacy policy for information about how they handle payment data.',
        },
        {
          name: 'Email Services',
          description: 'We use email service providers to send transactional and marketing emails.',
        },
        {
          name: 'Analytics Services',
          description: 'We may use analytics services to understand platform usage and improve our services.',
        },
      ],
    },
    childrenPrivacy: {
      title: 'Children\'s Privacy',
      content: 'Our platform is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.',
    },
    internationalTransfers: {
      title: 'International Data Transfers',
      content: 'Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.',
    },
    changes: {
      title: 'Changes to This Privacy Policy',
      content: 'We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date. We encourage you to review this policy periodically.',
    },
    contact: {
      title: 'Contact Us',
      subtitle: 'If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:',
      email: 'Email: privacy@freshlancer.online',
      address: 'Support: support@freshlancer.online',
      note: 'We will respond to your inquiries within a reasonable timeframe.',
    },
  },
  it: {
    title: 'Informativa sulla Privacy',
    lastUpdated: 'Ultimo aggiornamento: Gennaio 2025',
    walletSecurity: {
      title: 'Sicurezza del Portafoglio e dei Pagamenti',
      subtitle: 'Implementiamo misure di sicurezza di livello enterprise per proteggere le tue informazioni finanziarie e le transazioni.',
      measures: [
        {
          title: 'Protezione Escrow',
          description: 'Tutti i pagamenti delle milestone sono conservati in account escrow sicuri fino al completamento del progetto. I fondi vengono rilasciati solo con la tua approvazione, garantendo il controllo sui pagamenti.',
        },
        {
          title: 'Gateway di Pagamento Sicuri',
          description: 'Utilizziamo processori di pagamento certificati (PayMob per EGP, PayPal per USD) conformi agli standard PCI-DSS. Le tue informazioni di pagamento non sono mai memorizzate sui nostri server.',
        },
        {
          title: 'Sicurezza delle Transazioni',
          description: 'Tutte le transazioni sono crittografate e monitorate per frodi. Manteniamo registri dettagliati delle transazioni per riferimento e risoluzione delle controversie.',
        },
        {
          title: 'Protezione del Portafoglio',
          description: 'Il saldo del tuo portafoglio è protetto da più livelli di sicurezza. I prelievi richiedono autenticazione e tutte le attività del portafoglio sono registrate per audit di sicurezza.',
        },
        {
          title: 'Trasparenza delle Commissioni',
          description: 'Le commissioni della piattaforma e di transazione sono chiaramente visualizzate prima del pagamento. Puoi visualizzare tutte le commissioni e gli addebiti nella cronologia delle transazioni.',
        },
      ],
    },
    backToHome: 'Torna alla Home',
    introduction: {
      title: 'Introduzione',
      content: 'In Freshlancer, ci impegniamo a proteggere la tua privacy e garantire la sicurezza delle tue informazioni personali. Questa Informativa sulla Privacy spiega come raccogliamo, utilizziamo, divulghiamo e proteggiamo le tue informazioni quando utilizzi la nostra piattaforma.',
      effectiveDate: 'Questa politica è efficace dal Gennaio 2025 e si applica a tutti gli utenti della piattaforma Freshlancer.',
    },
    informationWeCollect: {
      title: 'Informazioni che Raccogliamo',
      subtitle: 'Raccogliamo informazioni che fornisci direttamente a noi e informazioni che vengono raccolte automaticamente quando utilizzi i nostri servizi.',
      personalInfo: {
        title: 'Informazioni Personali',
        items: [
          'Nome, indirizzo email e numero di telefono',
          'Età, genere, nazionalità e paese di residenza',
          'Foto del profilo e informazioni sulla posizione',
          'Credenziali dell\'account (password crittografate)',
        ],
      },
      studentInfo: {
        title: 'Informazioni Specifiche per Studenti',
        items: [
          'Nome dell\'università, corso di laurea e anno di laurea',
          'Competenze, livello di esperienza e anni di esperienza',
          'Progetti del portfolio e link professionali (GitHub, LinkedIn, ecc.)',
          'Curriculum/CV e documenti aggiuntivi',
          'Documenti di verifica (carta d\'identità studente, certificati di iscrizione, trascrizioni)',
          'Video introduttivo e certificazioni',
          'Lingue e livelli di competenza',
          'Preferenze tariffarie orarie e stato di disponibilità',
        ],
      },
      clientInfo: {
        title: 'Informazioni Specifiche per Clienti',
        items: [
          'Nome dell\'azienda, dimensione e settore',
          'Numeri di registrazione aziendale e identificazione fiscale',
          'Indirizzo di fatturazione e informazioni sui metodi di pagamento',
          'Sito web aziendale e descrizione',
          'Link ai social media e professionali',
        ],
      },
      usageData: {
        title: 'Dati di Utilizzo e Attività',
        items: [
          'Candidature per lavori e cronologia delle candidature',
          'Visualizzazioni del profilo e attività di sblocco',
          'Messaggi e comunicazioni',
          'Cronologia delle transazioni e informazioni di pagamento',
          'Stato dell\'abbonamento e limiti di utilizzo',
          'Recensioni e valutazioni date o ricevute',
        ],
      },
      technicalData: {
        title: 'Informazioni Tecniche',
        items: [
          'Indirizzo IP e informazioni sul dispositivo',
          'Tipo e versione del browser',
          'Sistema operativo',
          'Tipo di dispositivo (desktop, mobile, tablet)',
          'Modelli di utilizzo e interazioni con la piattaforma',
          'Cookie e tecnologie di tracciamento simili',
        ],
      },
    },
    howWeUseInfo: {
      title: 'Come Utilizziamo le Tue Informazioni',
      subtitle: 'Utilizziamo le informazioni che raccogliamo per vari scopi per fornire, mantenere e migliorare i nostri servizi.',
      purposes: [
        {
          title: 'Fornitura di Servizi',
          description: 'Per creare e gestire il tuo account, elaborare transazioni, facilitare le candidature per lavori e consentire la comunicazione tra studenti e clienti.',
        },
        {
          title: 'Verifica e Sicurezza',
          description: 'Per verificare le identità degli studenti, prevenire frodi, garantire la sicurezza della piattaforma e proteggere da accessi non autorizzati.',
        },
        {
          title: 'Elaborazione dei Pagamenti',
          description: 'Per elaborare i pagamenti per abbonamenti, pacchetti e transazioni attraverso i nostri partner di pagamento (Paymob).',
        },
        {
          title: 'Comunicazione',
          description: 'Per inviarti notifiche, aggiornamenti, rispondere alle richieste e fornire supporto clienti.',
        },
        {
          title: 'Miglioramento della Piattaforma',
          description: 'Per analizzare i modelli di utilizzo, migliorare i nostri servizi, sviluppare nuove funzionalità e migliorare l\'esperienza utente.',
        },
        {
          title: 'Conformità Legale',
          description: 'Per conformarci agli obblighi legali, risolvere controversie e far rispettare i nostri termini di servizio.',
        },
      ],
    },
    dataSharing: {
      title: 'Condivisione e Divulgazione dei Dati',
      subtitle: 'Non vendiamo le tue informazioni personali. Possiamo condividere le tue informazioni nelle seguenti circostanze:',
      scenarios: [
        {
          title: 'Con Altri Utenti',
          description: 'Le informazioni del tuo profilo (come configurate nelle impostazioni di privacy) sono visibili ad altri utenti sulla piattaforma. I clienti possono visualizzare profili di studenti anonimi e sbloccare profili completi utilizzando punti.',
        },
        {
          title: 'Fornitori di Servizi',
          description: 'Condividiamo informazioni con fornitori di servizi di terze parti che eseguono servizi per nostro conto, come elaborazione dei pagamenti (Paymob), hosting, analisi e consegna email.',
        },
        {
          title: 'Requisiti Legali',
          description: 'Possiamo divulgare informazioni se richiesto dalla legge, ordine del tribunale o regolamento governativo, o per proteggere i nostri diritti, proprietà o sicurezza.',
        },
        {
          title: 'Trasferimenti Commerciali',
          description: 'In caso di fusione, acquisizione o vendita di asset, le tue informazioni possono essere trasferite all\'entità acquirente.',
        },
      ],
    },
    dataSecurity: {
      title: 'Sicurezza dei Dati',
      subtitle: 'Implementiamo misure tecniche e organizzative appropriate per proteggere le tue informazioni personali.',
      measures: [
        'Crittografia dei dati sensibili in transito e a riposo',
        'Hash sicuro delle password utilizzando bcrypt',
        'Audit di sicurezza regolari e valutazioni delle vulnerabilità',
        'Controlli di accesso e meccanismi di autenticazione',
        'Elaborazione dei pagamenti sicura attraverso provider certificati',
        'Backup regolari e procedure di ripristino di emergenza',
      ],
    },
    dataRetention: {
      title: 'Conservazione dei Dati',
      content: 'Conserviamo le tue informazioni personali per il tempo necessario per fornire i nostri servizi, conformarci agli obblighi legali, risolvere controversie e far rispettare i nostri accordi. Quando elimini il tuo account, elimineremo o anonimizzeremo le tue informazioni personali, tranne dove siamo tenuti a conservarle per scopi legali o normativi.',
    },
    yourRights: {
      title: 'I Tuoi Diritti e Scelte',
      subtitle: 'Hai determinati diritti riguardo alle tue informazioni personali:',
      rights: [
        {
          title: 'Accesso',
          description: 'Puoi accedere e rivedere le tue informazioni personali attraverso le impostazioni del tuo account.',
        },
        {
          title: 'Correzione',
          description: 'Puoi aggiornare o correggere le tue informazioni personali in qualsiasi momento attraverso le impostazioni del profilo.',
        },
        {
          title: 'Eliminazione',
          description: 'Puoi richiedere l\'eliminazione del tuo account e delle tue informazioni personali, soggetto ai requisiti di conservazione legale.',
        },
        {
          title: 'Portabilità dei Dati',
          description: 'Puoi richiedere una copia dei tuoi dati in un formato portabile.',
        },
        {
          title: 'Rinuncia',
          description: 'Puoi rinunciare alle comunicazioni di marketing e regolare le preferenze di notifica nelle impostazioni del tuo account.',
        },
        {
          title: 'Stato di Verifica',
          description: 'Puoi visualizzare e gestire il tuo stato di verifica e i documenti attraverso la dashboard dello studente.',
        },
      ],
    },
    cookies: {
      title: 'Cookie e Tecnologie di Tracciamento',
      content: 'Utilizziamo cookie e tecnologie di tracciamento simili per raccogliere informazioni sul tuo comportamento di navigazione, preferenze e interazioni con la nostra piattaforma. Puoi controllare i cookie attraverso le impostazioni del tuo browser, ma disabilitare i cookie può influire sulla funzionalità dei nostri servizi.',
      types: [
        'Cookie essenziali richiesti per la funzionalità della piattaforma',
        'Cookie di autenticazione per mantenere la sessione di accesso',
        'Cookie di analisi per comprendere l\'utilizzo della piattaforma',
        'Cookie delle preferenze per ricordare le tue impostazioni',
      ],
    },
    thirdPartyServices: {
      title: 'Servizi di Terze Parti',
      subtitle: 'La nostra piattaforma si integra con servizi di terze parti che hanno le proprie politiche sulla privacy:',
      services: [
        {
          name: 'Paymob',
          description: 'Servizio di elaborazione dei pagamenti. Si prega di rivedere l\'informativa sulla privacy di Paymob per informazioni su come gestiscono i dati di pagamento.',
        },
        {
          name: 'Servizi Email',
          description: 'Utilizziamo fornitori di servizi email per inviare email transazionali e di marketing.',
        },
        {
          name: 'Servizi di Analisi',
          description: 'Possiamo utilizzare servizi di analisi per comprendere l\'utilizzo della piattaforma e migliorare i nostri servizi.',
        },
      ],
    },
    childrenPrivacy: {
      title: 'Privacy dei Minori',
      content: 'La nostra piattaforma non è destinata a utenti di età inferiore ai 18 anni. Non raccogliamo consapevolmente informazioni personali da minori. Se ritieni che abbiamo raccolto informazioni da un minore, contattaci immediatamente.',
    },
    internationalTransfers: {
      title: 'Trasferimenti Internazionali di Dati',
      content: 'Le tue informazioni possono essere trasferite ed elaborate in paesi diversi dal tuo paese di residenza. Assicuriamo che siano in atto garanzie appropriate per proteggere le tue informazioni in conformità con questa Informativa sulla Privacy.',
    },
    changes: {
      title: 'Modifiche a Questa Informativa sulla Privacy',
      content: 'Possiamo aggiornare questa Informativa sulla Privacy di tanto in tanto. Ti notificheremo eventuali modifiche materiali pubblicando la nuova politica su questa pagina e aggiornando la data "Ultimo aggiornamento". Ti incoraggiamo a rivedere periodicamente questa politica.',
    },
    contact: {
      title: 'Contattaci',
      subtitle: 'Se hai domande, preoccupazioni o richieste riguardo a questa Informativa sulla Privacy o alle nostre pratiche sui dati, contattaci:',
      email: 'Email: privacy@freshlancer.online',
      address: 'Supporto: support@freshlancer.online',
      note: 'Risponderemo alle tue richieste entro un periodo di tempo ragionevole.',
    },
  },
};

const PrivacyPolicy = () => {
  const { user } = useAuthStore();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('dashboardLanguage') || 'en';
  });

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

  // Determine the correct home path based on user role
  const getHomePath = () => {
    if (user?.role === 'client') {
      return '/client/dashboard';
    } else if (user?.role === 'student') {
      return '/student/dashboard';
    } else if (user?.role === 'admin') {
      return '/admin/dashboard';
    } else {
      return '/';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8">
      {/* Back Button */}
      <Link
        to={getHomePath()}
        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 text-sm sm:text-base"
      >
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        {t.backToHome}
      </Link>

      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full mb-4">
          <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {t.title}
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          {t.lastUpdated}
        </p>
      </div>

      {/* Introduction */}
      <Card className="p-6 sm:p-8 mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-primary-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t.introduction.title}</h2>
        </div>
        <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-3">
          {t.introduction.content}
        </p>
        <p className="text-gray-600 text-sm leading-relaxed">
          {t.introduction.effectiveDate}
        </p>
      </Card>

      {/* Information We Collect */}
      <Card className="p-6 sm:p-8 mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Database className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t.informationWeCollect.title}</h2>
            <p className="text-gray-600 text-sm sm:text-base mt-1">{t.informationWeCollect.subtitle}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Personal Information */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <UserCheck className="w-5 h-5 text-primary-600" />
              <h3 className="text-xl font-semibold text-gray-900">{t.informationWeCollect.personalInfo.title}</h3>
            </div>
            <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm sm:text-base ml-6">
              {t.informationWeCollect.personalInfo.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Student Information */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">{t.informationWeCollect.studentInfo.title}</h3>
            </div>
            <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm sm:text-base ml-6">
              {t.informationWeCollect.studentInfo.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Client Information */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-5 h-5 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-900">{t.informationWeCollect.clientInfo.title}</h3>
            </div>
            <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm sm:text-base ml-6">
              {t.informationWeCollect.clientInfo.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Usage Data */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-5 h-5 text-orange-600" />
              <h3 className="text-xl font-semibold text-gray-900">{t.informationWeCollect.usageData.title}</h3>
            </div>
            <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm sm:text-base ml-6">
              {t.informationWeCollect.usageData.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Technical Data */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Server className="w-5 h-5 text-teal-600" />
              <h3 className="text-xl font-semibold text-gray-900">{t.informationWeCollect.technicalData.title}</h3>
            </div>
            <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm sm:text-base ml-6">
              {t.informationWeCollect.technicalData.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* How We Use Information */}
      <Card className="p-6 sm:p-8 mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Globe className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t.howWeUseInfo.title}</h2>
            <p className="text-gray-600 text-sm sm:text-base mt-1">{t.howWeUseInfo.subtitle}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {t.howWeUseInfo.purposes.map((purpose, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">{purpose.title}</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{purpose.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Data Sharing */}
      <Card className="p-6 sm:p-8 mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t.dataSharing.title}</h2>
            <p className="text-gray-600 text-sm sm:text-base mt-1">{t.dataSharing.subtitle}</p>
          </div>
        </div>

        <div className="space-y-4">
          {t.dataSharing.scenarios.map((scenario, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">{scenario.title}</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{scenario.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Data Security */}
      <Card className="p-6 sm:p-8 mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Lock className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t.dataSecurity.title}</h2>
            <p className="text-gray-600 text-sm sm:text-base mt-1">{t.dataSecurity.subtitle}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {t.dataSecurity.measures.map((measure, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700 text-sm sm:text-base">{measure}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Data Retention */}
      <Card className="p-6 sm:p-8 mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Database className="w-6 h-6 text-teal-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t.dataRetention.title}</h2>
        </div>
        <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
          {t.dataRetention.content}
        </p>
      </Card>

      {/* Your Rights */}
      <Card className="p-6 sm:p-8 mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Key className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t.yourRights.title}</h2>
            <p className="text-gray-600 text-sm sm:text-base mt-1">{t.yourRights.subtitle}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {t.yourRights.rights.map((right, index) => {
            const icons = [Eye, Edit, Trash2, Download, AlertCircle, UserCheck];
            const Icon = icons[index % icons.length];
            return (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="w-5 h-5 text-primary-600" />
                  <h3 className="font-semibold text-gray-900">{right.title}</h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{right.description}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Cookies */}
      <Card className="p-6 sm:p-8 mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Cookie className="w-6 h-6 text-indigo-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t.cookies.title}</h2>
        </div>
        <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-4">
          {t.cookies.content}
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm sm:text-base ml-6">
          {t.cookies.types.map((type, index) => (
            <li key={index}>{type}</li>
          ))}
        </ul>
      </Card>

      {/* Third-Party Services */}
      <Card className="p-6 sm:p-8 mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Globe className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t.thirdPartyServices.title}</h2>
            <p className="text-gray-600 text-sm sm:text-base mt-1">{t.thirdPartyServices.subtitle}</p>
          </div>
        </div>

        <div className="space-y-4">
          {t.thirdPartyServices.services.map((service, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">{service.name}</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Wallet and Payment Security */}
      <Card className="p-6 sm:p-8 mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t.walletSecurity.title}</h2>
            <p className="text-gray-600 text-sm sm:text-base mt-1">{t.walletSecurity.subtitle}</p>
          </div>
        </div>

        <div className="space-y-4">
          {t.walletSecurity.measures.map((measure, index) => (
            <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">{measure.title}</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{measure.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Children's Privacy */}
      <Card className="p-6 sm:p-8 mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-amber-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t.childrenPrivacy.title}</h2>
        </div>
        <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
          {t.childrenPrivacy.content}
        </p>
      </Card>

      {/* International Transfers */}
      <Card className="p-6 sm:p-8 mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Globe className="w-6 h-6 text-cyan-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t.internationalTransfers.title}</h2>
        </div>
        <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
          {t.internationalTransfers.content}
        </p>
      </Card>

      {/* Changes to Policy */}
      <Card className="p-6 sm:p-8 mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-gray-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t.changes.title}</h2>
        </div>
        <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
          {t.changes.content}
        </p>
      </Card>

      {/* Contact Us */}
      <Card className="p-6 sm:p-8 bg-gradient-to-br from-primary-50 to-blue-50 border-2 border-primary-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Mail className="w-6 h-6 text-primary-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t.contact.title}</h2>
        </div>
        <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-4">
          {t.contact.subtitle}
        </p>
        <div className="space-y-2 text-gray-700 text-sm sm:text-base">
          <p><strong>{t.contact.email}</strong></p>
          <p><strong>{t.contact.address}</strong></p>
        </div>
        <p className="text-gray-600 text-sm mt-4">
          {t.contact.note}
        </p>
      </Card>
    </div>
  );
};

export default PrivacyPolicy;

