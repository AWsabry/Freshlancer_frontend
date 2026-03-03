import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import Button from '../components/common/Button';
import { contactService } from '../services/contactService';
import Alert from '../components/common/Alert';
import { OG_IMAGE_URL, CANONICAL_ORIGIN } from '../config/env';
import Studentimage from '../assets/images/student.png';
import Clientimage from '../assets/images/client.png';
import logo from '../assets/logos/01.png';
import heroLogo from '../assets/logos/02.png';
import {
  Briefcase,
  Users,
  Star,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Zap,
  Award,
  Globe,
  Search,
  DollarSign,
  Target,
  MessageCircle,
  ChevronRight,
  Play,
  Code,
  Palette,
  FileText,
  LayoutDashboard,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Send,
  LogOut,
  Lock,
  AlertCircle,
  Eye,
  Server,
  CreditCard
} from 'lucide-react';

const translations = {
  en: {
    languageLabel: 'Language',
    languageOptions: { en: 'English', it: 'Italiano' },
    seo: {
      title: 'Freshlancer - Hire Talented Students & Find Freelance Jobs | #1 Student Freelance Platform',
      description: 'Connect with skilled student freelancers for your projects or find freelance jobs as a student. 10,000+ verified students, secure escrow payments, client wallet protection, and quality guaranteed. Join Freshlancer today!',
      keywords: 'student freelancers, hire students, freelance jobs for students, student marketplace, freelance platform, find student talent, student jobs online, remote student work, hire freelance students, student gigs, secure escrow payments, client wallet, milestone payments, secure payment gateway, PayMob, PayPal, payment protection',
      ogDescription: 'The premier platform connecting skilled students with clients worldwide. Secure escrow payments, client wallet protection, and milestone-based transactions. Find freelance work or hire top student talent.',
      organizationDescription: 'Leading student freelance marketplace connecting talented students with businesses worldwide. Secure payment system with escrow protection and client wallet management.',
      schemaDescription: 'Premier platform connecting skilled student freelancers with clients worldwide for remote work opportunities. Secure escrow payments, milestone funding, and PCI-DSS compliant payment processing.'
    },
    nav: {
      features: 'Features',
      howItWorks: 'How It Works',
      about: 'About Us',
      contact: 'Contact',
      testimonials: 'Testimonials',
      signIn: 'Sign In',
      getStarted: 'Get Started Free',
      dashboard: 'Go to Dashboard',
      welcome: 'Welcome'
    },
    hero: {
      badge: 'Top-Rated Student Freelance Marketplace 2025',
      headingLine1: 'Hire Talented',
      headingHighlight: 'Student Freelancers',
      description: 'Connect with skilled university students for your projects or discover freelance opportunities. Join 10,000+ students and businesses building success together.',
      primaryCta: 'Start Now - 100% Free',
      secondaryCta: 'Sign In',
      dashboardCta: 'Go to Dashboard',
      noCreditCard: 'No credit card required',
      quickSignup: '2-minute signup',
      primaryAria: 'Start finding freelance jobs or hiring students',
      secondaryAria: 'Sign in to existing account',
      dashboardAria: 'Go to your dashboard'
    },
    featureSection: {
      headingPrefix: 'Why Choose',
      headingHighlight: 'Freshlancer',
      headingSuffix: '?',
      subheading: 'Everything you need to succeed in the student freelance marketplace'
    },
    stats: [
      { number: '10,000+', label: 'Verified Student Freelancers' },
      { number: '5,000+', label: 'Successful Projects Completed' },
      { number: '95%', label: 'Client Satisfaction Rate' },
      { number: '50+', label: 'Countries Worldwide' }
    ],
    features: [
      {
        title: 'Quality Freelance Jobs',
        description: 'Access thousands of vetted freelance opportunities from verified clients across web development, design, writing, marketing, and more'
      },
      {
        title: 'Skilled Student Freelancers',
        description: 'Hire talented university students with fresh ideas and competitive rates for your projects in programming, graphic design, content creation'
      },
      {
        title: 'Secure Payment Protection',
        description: 'Industry-leading secure payment system with escrow protection, client wallet management, milestone-based payments, and PCI-DSS compliant gateways (PayMob, PayPal) for safe transactions'
      },
      {
        title: 'Fast Hiring Process',
        description: 'Find and hire qualified student freelancers in under 24 hours with our streamlined matching algorithm and instant communication'
      },
      {
        title: 'Top-Rated Platform',
        description: 'Trusted review and rating system with 95% client satisfaction rate, helping you choose the best freelancers for your needs'
      },
      {
        title: 'Career Growth Opportunities',
        description: 'Students build professional portfolios, gain real-world experience, and develop in-demand skills while earning money online'
      }
    ],
    jobCategories: [
      'Web Development',
      'Mobile App Development',
      'Graphic Design',
      'UI/UX Design',
      'Content Writing',
      'Digital Marketing',
      'Academic Tasks',
      'Video Editing',
      'Data Entry',
      'Translation Services'
    ],
    categorySection: {
      heading: 'Popular Freelance Categories',
      subheading: 'Find skilled freelancers or discover jobs in these in-demand categories'
    },
    benefits: {
      heading: 'Benefits for Everyone',
      students: {
        title: 'For Students',
        tagline: 'Launch your career',
        intro: 'Gain experience and earn money while studying',
        list: [
          'Apply to many freelance jobs per month with Premium membership',
          'Get verified student badge to increase profile visibility and get more jobs',
          'Build professional portfolio with real client testimonials and gain real-world experience',
          'Flexible remote working hours that fit your study schedule',
          'Gain valuable real-world experience and industry skills in early stages of your career',
          'Direct client communication and long-term project opportunities'
        ],
        cta: 'Join as Student Freelancer'
      },
      clients: {
        title: 'For Clients',
        tagline: 'Find top talent',
        intro: 'Hire skilled students for quality work at competitive rates',
        list: [
          'Access to world wide verified student freelancers with diverse skills',
          'Post unlimited job listings in programming, design, marketing, writing',
          'Review detailed profiles, portfolios, and ratings before hiring',
          'Secure client wallet with escrow protection for milestone payments',
          'Full transaction transparency with detailed wallet and payment history',
          'Quality guarantee with project milestone tracking and secure fund releases'
        ],
        cta: 'Hire Student Talent Today'
      }
    },
    testimonials: {
      heading: 'Success Stories',
      subheading: 'Real results from students and clients on our platform',
      list: [
        {
          name: 'Sarah Johnson',
          role: 'Marketing Manager',
          company: 'Tech Startup Inc.',
          text: 'Found an amazing graphic design student who delivered exceptional work at a fraction of traditional agency costs.',
          rating: 5,
          avatar: 'SJ'
        },
        {
          name: 'Mohammed Ahmed',
          role: 'Computer Science Student',
          company: 'University Graduate',
          text: 'Earneing money in my first semester while building a professional portfolio!',
          rating: 5,
          avatar: 'MA'
        }
      ]
    },
    howItWorks: {
      heading: 'How It Works',
      subheading: 'Get started in three simple steps',
      steps: [
        { title: 'Create Your Profile', description: 'Sign up in 2 minutes with your skills, portfolio, and experience' },
        { title: 'Browse & Connect', description: 'Find jobs or talent, review profiles, and start conversations' },
        { title: 'Work & Succeed', description: 'Complete projects with secure payments and build lasting success' }
      ]
    },
    clientPaymentSecurity: {
      heading: 'Your Payments Are Protected',
      subheading: 'Complete payment security and dispute resolution for peace of mind',
      intro: 'We understand that payment security is your top priority. That\'s why we\'ve built a comprehensive protection system that ensures your funds are safe at every step of the project.',
      features: [
        {
          title: 'Secure Escrow System',
          description: 'All milestone payments are held in secure escrow accounts. Funds are only released when you approve the completed work, giving you full control over payments.',
          icon: 'Shield'
        },
        {
          title: 'Client Wallet Management',
          description: 'Manage all your project funds through your secure client wallet. Track deposits, view transaction history, and monitor escrow balances in real-time.',
          icon: 'CreditCard'
        },
        {
          title: 'Milestone-Based Payments',
          description: 'Break projects into milestones and fund each one separately. Pay only for completed work that meets your approval, reducing financial risk.',
          icon: 'CheckCircle'
        },
        {
          title: 'PCI-DSS Compliant Gateways',
          description: 'We use certified payment processors (PayMob for EGP, PayPal for USD) that meet the highest security standards. Your payment information is never stored on our servers.',
          icon: 'Lock'
        },
        {
          title: 'Dispute Resolution System',
          description: 'If issues arise, our appeal system provides a fair resolution process. File appeals for non-payment, poor quality work, or contract violations with full support.',
          icon: 'AlertCircle'
        },
        {
          title: 'Full Transaction Transparency',
          description: 'View detailed records of all transactions, fees, and payments. Complete transparency on platform fees and transaction charges before you pay.',
          icon: 'Eye'
        },
        {
          title: 'Money-Back Guarantee',
          description: 'If work doesn\'t meet agreed standards, our appeal process can result in refunds. Your satisfaction is protected through our comprehensive guarantee system.',
          icon: 'DollarSign'
        },
        {
          title: '24/7 Security Monitoring',
          description: 'Our systems continuously monitor for fraud and suspicious activity. Real-time alerts and automated security checks protect your account and transactions.',
          icon: 'Server'
        }
      ],
      cta: 'Start Hiring with Confidence'
    },
    studentGrowth: {
      heading: 'Gain Knowledge, Money & Experience',
      subheading: 'Build your career while earning income and developing real-world skills',
      intro: 'As a student freelancer on Freshlancer, you don\'t just earn money—you build a foundation for your future career through real projects, client interactions, and professional growth.',
      pillars: [
        {
          title: 'Earn Money',
          icon: 'DollarSign',
          color: 'bg-green-600',
          description: 'Start earning income while you study',
          benefits: [
            'Competitive rates for student freelancers',
            'Flexible payment options (USD and EGP)',
            'Secure milestone-based payments',
            'Direct deposits to your wallet',
            'Track earnings and transaction history',
            'Withdraw funds when you need them'
          ]
        },
        {
          title: 'Gain Experience',
          icon: 'Briefcase',
          color: 'bg-blue-600',
          description: 'Work on real projects with real clients',
          benefits: [
            'Build a professional portfolio with actual client work',
            'Work on diverse projects across multiple industries',
            'Learn industry-standard tools and practices',
            'Develop time management and project delivery skills',
            'Experience different work styles and client expectations',
            'Add real-world projects to your resume'
          ]
        },
        {
          title: 'Acquire Knowledge',
          icon: 'Award',
          color: 'bg-purple-600',
          description: 'Learn from every project and client interaction',
          benefits: [
            'Learn from client feedback and reviews',
            'Exposure to cutting-edge technologies and trends',
            'Develop problem-solving and critical thinking skills',
            'Understand business requirements and client needs',
            'Build communication and collaboration skills',
            'Gain insights into various industries and markets'
          ]
        }
      ],
      additionalBenefits: {
        title: 'Additional Growth Opportunities',
        items: [
          {
            title: 'Professional Portfolio',
            description: 'Showcase your completed projects to future employers and clients, building credibility and demonstrating your capabilities.'
          },
          {
            title: 'Client Testimonials',
            description: 'Collect authentic reviews and ratings that validate your skills and help you stand out in the marketplace.'
          },
          {
            title: 'Career Networking',
            description: 'Connect with clients who may offer long-term opportunities, internships, or full-time positions after graduation.'
          },
          {
            title: 'Skill Development',
            description: 'Work on projects that challenge you and help you learn new technologies, methodologies, and best practices.'
          }
        ]
      },
      cta: 'Start Your Freelance Journey'
    },
    about: {
      heading: 'About Freshlancer',
      subheading: 'Empowering students and businesses to connect, collaborate, and succeed together',
      missionTitle: 'Our Mission',
      missionParagraphs: [
        'Freshlancer is dedicated to bridging the gap between talented university students and businesses seeking quality freelance work. We believe that students bring fresh perspectives, innovative ideas, and competitive rates to the marketplace.',
        'Our platform provides a secure, verified environment where students can build their professional portfolios while earning income, and businesses can access top-tier talent at affordable rates.'
      ],
      cards: [
        { title: 'Verified Students', description: 'Our platform hosts thousands of verified student freelancers from universities worldwide, each with unique skills and fresh perspectives.' },
        { title: 'Secure Payment System', description: 'We use industry-leading escrow protection with client wallet management, milestone-based payments, and PCI-DSS compliant gateways (PayMob, PayPal) to ensure safe transactions for both students and clients, with full transparency and money-back guarantees.' },
        { title: 'Market competitive prices', description: 'We offer competitive rates for students, allowing you to earn more while learning and building your portfolio.' }
      ]
    },
    contact: {
      heading: 'Contact Us',
      subheading: "Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
      getInTouch: 'Get in Touch',
      methods: {
        email: 'Email',
        phone: 'Phone',
        whatsapp: 'WhatsApp',
        telegram: 'Telegram',
        address: 'Address',
        addressLines: ['123 Business Street', 'City, State 12345', 'Country']
      },
      followUs: 'Follow Us',
      form: {
        name: 'Name',
        email: 'Email',
        subject: 'Subject',
        message: 'Message',
        placeholders: {
          name: 'Your name',
          email: 'your.email@example.com',
          subject: 'What is this regarding?',
          message: 'Your message here...'
        },
        success: 'Thank you for your message! We will get back to you soon.',
        sending: 'Sending...',
        submit: 'Send Message',
        defaultError: 'Failed to send message. Please try again later.'
      }
    },
    faq: {
      heading: 'Frequently Asked Questions',
      list: [
        {
          q: 'How much does it cost to use Freshlancer?',
          a: 'Creating an account is 100% free for both students and clients. Students can apply to 10 jobs per month on the free plan, or upgrade to Premium for $4.99/month to apply to 100 jobs. Clients can post unlimited jobs and only pay when they hire.'
        },
        {
          q: 'Are student freelancers on Freshlancer verified?',
          a: 'Yes! All student freelancers go through a verification process where they submit student ID and enrollment proof. Verified students get a badge on their profile, ensuring clients work with legitimate, talented university students.'
        },
        {
          q: 'What types of freelance jobs are available for students?',
          a: 'We have opportunities in web development, mobile apps, graphic design, UI/UX design, content writing, copywriting, digital marketing, SEO, social media management, video editing, data entry, translation, virtual assistant, and more.'
        },
        {
          q: 'How does payment protection work on Freshlancer?',
          a: 'We use secure escrow payment systems with client wallet management (PayMob for EGP, PayPal for USD) to protect both parties. Funds are held securely in escrow accounts until milestone completion. Clients can fund milestones through their secure wallet, and funds are only released upon approval. All transactions are PCI-DSS compliant and encrypted for maximum security.'
        }
      ]
    },
    cta: {
      heading: 'Ready to Get Started?',
      subheading: 'Join 10,000+ students and businesses finding success on Freshlancer. Sign up free today - no credit card required!',
      primary: 'Start Now - 100% Free',
      secondary: 'Sign In to Account'
    },
    footer: {
      brandCopy: 'The leading student freelance marketplace connecting talented university students with businesses worldwide for remote work opportunities.',
      studentsTitle: 'For Students',
      studentsLinks: ['Find Jobs', 'Build Portfolio', 'Premium Plans', 'Success Stories'],
      clientsTitle: 'For Clients',
      clientsLinks: ['Post Jobs', 'Find Talent', 'Pricing', 'How It Works'],
      copyright: '© 2025 Freshlancer - Premier Student Freelance Platform. All rights reserved.'
    }
  },
  it: {
    languageLabel: 'Lingua',
    languageOptions: { en: 'Inglese', it: 'Italiano' },
    seo: {
      title: 'Freshlancer - Assumi studenti talentuosi e trova lavori freelance | Piattaforma n.1 per studenti freelance',
      description: 'Metti in contatto studenti freelance qualificati con i tuoi progetti oppure trova lavori freelance come studente. Oltre 10.000 studenti verificati, pagamenti escrow sicuri, protezione del portafoglio clienti e qualità garantita. Unisciti a Freshlancer oggi.',
      keywords: 'studenti freelance, assumere studenti, lavori freelance per studenti, marketplace studenti, piattaforma freelance, trovare talenti studenti, lavori online per studenti, lavoro remoto studenti, assumere studenti freelance, incarichi per studenti, pagamenti escrow sicuri, portafoglio clienti, pagamenti milestone, gateway di pagamento sicuro, PayMob, PayPal, protezione pagamenti',
      ogDescription: 'La principale piattaforma che mette in contatto studenti qualificati con clienti in tutto il mondo. Pagamenti escrow sicuri, protezione del portafoglio clienti e transazioni basate su milestone. Trova lavoro freelance o assumi i migliori talenti studenti.',
      organizationDescription: 'Marketplace leader per studenti freelance che collega studenti di talento con aziende in tutto il mondo. Sistema di pagamento sicuro con protezione escrow e gestione del portafoglio clienti.',
      schemaDescription: 'Piattaforma leader che collega studenti freelance qualificati con clienti in tutto il mondo per opportunità di lavoro remoto. Pagamenti escrow sicuri, finanziamento milestone e elaborazione pagamenti conforme PCI-DSS.'
    },
    nav: {
      features: 'Caratteristiche',
      howItWorks: 'Come funziona',
      about: 'Chi siamo',
      contact: 'Contatti',
      testimonials: 'Testimonianze',
      signIn: 'Accedi',
      getStarted: 'Inizia gratis',
      dashboard: 'Vai alla dashboard',
      welcome: 'Ciao'
    },
    hero: {
      badge: 'Marketplace freelance per studenti valutato al top 2025',
      headingLine1: 'Assumi talentuosi',
      headingHighlight: 'studenti freelance',
      description: 'Metti in contatto studenti universitari qualificati con i tuoi progetti oppure scopri opportunità freelance. Oltre 10.000 studenti e aziende che costruiscono il successo insieme.',
      primaryCta: 'Inizia ora - 100% gratis',
      secondaryCta: 'Accedi',
      dashboardCta: 'Vai alla dashboard',
      noCreditCard: 'Nessuna carta di credito richiesta',
      quickSignup: 'Registrazione in 2 minuti',
      primaryAria: 'Inizia a trovare lavori freelance o ad assumere studenti',
      secondaryAria: 'Accedi al tuo account',
      dashboardAria: 'Vai alla tua dashboard'
    },
    featureSection: {
      headingPrefix: 'Perché scegliere',
      headingHighlight: 'Freshlancer',
      headingSuffix: '?',
      subheading: 'Tutto ciò che ti serve per avere successo nel marketplace freelance per studenti'
    },
    stats: [
      { number: '10,000+', label: 'Studenti freelance verificati' },
      { number: '5,000+', label: 'Progetti completati con successo' },
      { number: '95%', label: 'Tasso di soddisfazione dei clienti' },
      { number: '50+', label: 'Paesi nel mondo' }
    ],
    features: [
      {
        title: 'Lavori freelance di qualità',
        description: 'Accedi a migliaia di opportunità freelance verificate da clienti in sviluppo web, design, scrittura, marketing e altro'
      },
      {
        title: 'Studenti freelance qualificati',
        description: 'Assumi studenti universitari talentuosi con idee fresche e tariffe competitive per progetti di programmazione, grafica, contenuti'
      },
      {
        title: 'Pagamenti sicuri con protezione',
        description: 'Sistema di pagamento sicuro all\'avanguardia con protezione escrow, gestione del portafoglio clienti, pagamenti basati su milestone e gateway conformi PCI-DSS (PayMob, PayPal) per transazioni sicure'
      },
      {
        title: 'Assunzioni rapide',
        description: 'Trova e assumi studenti qualificati in meno di 24 ore grazie al nostro algoritmo e alla comunicazione immediata'
      },
      {
        title: 'Piattaforma con valutazioni eccellenti',
        description: 'Sistema di recensioni affidabile con il 95% di clienti soddisfatti per scegliere i freelancer migliori per le tue esigenze'
      },
      {
        title: 'Opportunità di crescita professionale',
        description: 'Gli studenti creano portfoli professionali, fanno esperienza reale e sviluppano competenze richieste mentre guadagnano online'
      }
    ],
    jobCategories: [
      'Sviluppo web',
      'Sviluppo app mobile',
      'Graphic design',
      'UI/UX design',
      'Content writing',
      'Digital marketing',
      'Compiti accademici',
      'Montaggio video',
      'Data entry',
      'Servizi di traduzione'
    ],
    categorySection: {
      heading: 'Categorie freelance più richieste',
      subheading: 'Trova freelancer qualificati o scopri lavori in queste categorie in crescita'
    },
    benefits: {
      heading: 'Vantaggi per tutti',
      students: {
        title: 'Per gli studenti',
        tagline: 'Lancia la tua carriera',
        intro: 'Fai esperienza e guadagna mentre studi',
        list: [
          "Candidati a oltre 100 lavori freelance al mese con l'abbonamento Premium",
          'Ottieni il badge studente verificato per aumentare la visibilità del profilo e ottenere più lavori',
          'Costruisci un portfolio professionale con testimonianze reali dei clienti e acquisisci esperienza reale',
          'Orari di lavoro flessibili da remoto che si adattano allo studio',
          "Acquisisci esperienza reale e competenze richieste nelle prime fasi della carriera",
          'Comunicazione diretta con i clienti e opportunità di progetti a lungo termine'
        ],
        cta: 'Unisciti come studente freelance'
      },
      clients: {
        title: 'Per i clienti',
        tagline: 'Trova i migliori talenti',
        intro: 'Assumi studenti qualificati per lavori di qualità a tariffe competitive',
        list: [
          'Accesso a studenti freelance verificati in tutto il mondo con competenze diverse',
          'Pubblica offerte di lavoro illimitate in programmazione, design, marketing, scrittura',
          'Consulta profili dettagliati, portfolio e recensioni prima di assumere',
          'Portafoglio cliente sicuro con protezione escrow per pagamenti milestone',
          'Trasparenza completa delle transazioni con cronologia dettagliata del portafoglio e dei pagamenti',
          'Garanzia di qualità con tracciamento delle milestone di progetto e rilascio sicuro dei fondi'
        ],
        cta: 'Assumi studenti di talento oggi'
      }
    },
    testimonials: {
      heading: 'Storie di successo',
      subheading: 'Risultati reali di studenti e clienti sulla nostra piattaforma',
      list: [
        {
          name: 'Sarah Johnson',
          role: 'Marketing Manager',
          company: 'Tech Startup Inc.',
          text: "Ho trovato una studentessa di graphic design straordinaria che ha consegnato un lavoro eccellente a una frazione dei costi di un'agenzia.",
          rating: 5,
          avatar: 'SJ'
        },
        {
          name: 'Mohammed Ahmed',
          role: 'Studente di Informatica',
          company: 'University Graduate',
          text: 'Ho guadagnato soldi nel primo semestre mentre costruivo un portfolio professionale. Questa piattaforma mi ha cambiato la vita!',
          rating: 5,
          avatar: 'MA'
        }
      ]
    },
    howItWorks: {
      heading: 'Come funziona',
      subheading: 'Inizia in tre semplici passaggi',
      steps: [
        { title: 'Crea il tuo profilo', description: 'Registrati in 2 minuti con competenze, portfolio ed esperienza' },
        { title: 'Cerca e contatta', description: 'Trova lavori o talenti, consulta i profili e avvia le conversazioni' },
        { title: 'Lavora e cresci', description: 'Completa i progetti con pagamenti sicuri e costruisci il tuo successo' }
      ]
    },
    clientPaymentSecurity: {
      heading: 'I Tuoi Pagamenti Sono Protetti',
      subheading: 'Sicurezza completa dei pagamenti e risoluzione delle controversie per la tua tranquillità',
      intro: 'Comprendiamo che la sicurezza dei pagamenti è la tua priorità. Per questo abbiamo costruito un sistema di protezione completo che garantisce che i tuoi fondi siano al sicuro in ogni fase del progetto.',
      features: [
        {
          title: 'Sistema Escrow Sicuro',
          description: 'Tutti i pagamenti delle milestone sono conservati in account escrow sicuri. I fondi vengono rilasciati solo quando approvi il lavoro completato, dandoti il controllo completo sui pagamenti.',
          icon: 'Shield'
        },
        {
          title: 'Gestione Portafoglio Clienti',
          description: 'Gestisci tutti i fondi del progetto tramite il tuo portafoglio cliente sicuro. Traccia depositi, visualizza la cronologia delle transazioni e monitora i saldi escrow in tempo reale.',
          icon: 'CreditCard'
        },
        {
          title: 'Pagamenti Basati su Milestone',
          description: 'Dividi i progetti in milestone e finanzia ciascuna separatamente. Paga solo per il lavoro completato che soddisfa la tua approvazione, riducendo il rischio finanziario.',
          icon: 'CheckCircle'
        },
        {
          title: 'Gateway Conformi PCI-DSS',
          description: 'Utilizziamo processori di pagamento certificati (PayMob per EGP, PayPal per USD) che soddisfano i più alti standard di sicurezza. Le tue informazioni di pagamento non sono mai memorizzate sui nostri server.',
          icon: 'Lock'
        },
        {
          title: 'Sistema di Risoluzione Controversie',
          description: 'Se sorgono problemi, il nostro sistema di ricorso fornisce un processo di risoluzione equo. Presenta ricorsi per mancato pagamento, lavoro di scarsa qualità o violazioni contrattuali con supporto completo.',
          icon: 'AlertCircle'
        },
        {
          title: 'Trasparenza Completa delle Transazioni',
          description: 'Visualizza registri dettagliati di tutte le transazioni, commissioni e pagamenti. Trasparenza completa su commissioni della piattaforma e addebiti di transazione prima di pagare.',
          icon: 'Eye'
        },
        {
          title: 'Garanzia di Rimborso',
          description: 'Se il lavoro non soddisfa gli standard concordati, il nostro processo di ricorso può comportare rimborsi. La tua soddisfazione è protetta attraverso il nostro sistema di garanzia completo.',
          icon: 'DollarSign'
        },
        {
          title: 'Monitoraggio Sicurezza 24/7',
          description: 'I nostri sistemi monitorano continuamente frodi e attività sospette. Avvisi in tempo reale e controlli di sicurezza automatizzati proteggono il tuo account e le transazioni.',
          icon: 'Server'
        }
      ],
      cta: 'Inizia ad Assumere con Fiducia'
    },
    studentGrowth: {
      heading: 'Acquisisci Conoscenza, Denaro ed Esperienza',
      subheading: 'Costruisci la tua carriera mentre guadagni e sviluppi competenze reali',
      intro: 'Come studente freelance su Freshlancer, non guadagni solo denaro—costruisci una base per la tua futura carriera attraverso progetti reali, interazioni con i clienti e crescita professionale.',
      pillars: [
        {
          title: 'Guadagna Denaro',
          icon: 'DollarSign',
          color: 'bg-green-600',
          description: 'Inizia a guadagnare mentre studi',
          benefits: [
            'Tariffe competitive per studenti freelance',
            'Opzioni di pagamento flessibili (USD e EGP)',
            'Pagamenti sicuri basati su milestone',
            'Depositi diretti nel tuo portafoglio',
            'Traccia guadagni e cronologia transazioni',
            'Preleva fondi quando ne hai bisogno'
          ]
        },
        {
          title: 'Acquisisci Esperienza',
          icon: 'Briefcase',
          color: 'bg-blue-600',
          description: 'Lavora su progetti reali con clienti reali',
          benefits: [
            'Costruisci un portfolio professionale con lavoro reale dei clienti',
            'Lavora su progetti diversi in più settori',
            'Impara strumenti e pratiche standard del settore',
            'Sviluppa competenze di gestione del tempo e consegna progetti',
            'Sperimenta diversi stili di lavoro e aspettative dei clienti',
            'Aggiungi progetti reali al tuo curriculum'
          ]
        },
        {
          title: 'Acquisisci Conoscenza',
          icon: 'Award',
          color: 'bg-purple-600',
          description: 'Impara da ogni progetto e interazione con i clienti',
          benefits: [
            'Impara dal feedback e dalle recensioni dei clienti',
            'Esposizione a tecnologie e tendenze all\'avanguardia',
            'Sviluppa competenze di problem-solving e pensiero critico',
            'Comprendi i requisiti aziendali e le esigenze dei clienti',
            'Costruisci competenze di comunicazione e collaborazione',
            'Ottieni approfondimenti su vari settori e mercati'
          ]
        }
      ],
      additionalBenefits: {
        title: 'Opportunità di Crescita Aggiuntive',
        items: [
          {
            title: 'Portfolio Professionale',
            description: 'Mostra i tuoi progetti completati a futuri datori di lavoro e clienti, costruendo credibilità e dimostrando le tue capacità.'
          },
          {
            title: 'Testimonianze dei Clienti',
            description: 'Raccogli recensioni e valutazioni autentiche che convalidano le tue competenze e ti aiutano a distinguerti nel marketplace.'
          },
          {
            title: 'Networking di Carriera',
            description: 'Connettiti con clienti che possono offrire opportunità a lungo termine, stage o posizioni a tempo pieno dopo la laurea.'
          },
          {
            title: 'Sviluppo Competenze',
            description: 'Lavora su progetti che ti sfidano e ti aiutano a imparare nuove tecnologie, metodologie e best practice.'
          }
        ]
      },
      cta: 'Inizia il Tuo Percorso Freelance'
    },
    about: {
      heading: 'Chi è Freshlancer',
      subheading: 'Mettiamo in contatto studenti e aziende per collaborare e avere successo insieme',
      missionTitle: 'La nostra missione',
      missionParagraphs: [
        'Freshlancer vuole colmare il divario tra studenti universitari talentuosi e aziende che cercano lavori freelance di qualità. Crediamo che gli studenti portino prospettive fresche, idee innovative e tariffe competitive.',
        'La nostra piattaforma offre un ambiente sicuro e verificato dove gli studenti possono costruire il proprio portfolio professionale mentre guadagnano, e le aziende possono accedere a talenti di alto livello a costi accessibili.'
      ],
      cards: [
        { title: 'Studenti verificati', description: 'Ospitiamo migliaia di studenti freelance verificati da università di tutto il mondo, ciascuno con competenze uniche e idee fresche.' },
        { title: 'Pagamenti sicuri', description: 'Usiamo protezione escrow di livello enterprise con gestione del portafoglio clienti, pagamenti basati su milestone e gateway conformi PCI-DSS (PayMob, PayPal) per garantire transazioni sicure per studenti e clienti, con piena trasparenza e garanzie di rimborso.' },
        { title: 'Prezzi competitivi', description: 'Offriamo tariffe competitive per gli studenti, permettendoti di guadagnare di più mentre impari e costruisci il tuo portfolio.' }
      ]
    },
    contact: {
      heading: 'Contattaci',
      subheading: 'Domande? Ci farebbe piacere sentirti. Inviaci un messaggio e ti risponderemo il prima possibile.',
      getInTouch: 'Mettiti in contatto',
      methods: {
        email: 'Email',
        phone: 'Telefono',
        whatsapp: 'WhatsApp',
        telegram: 'Telegram',
        address: 'Indirizzo',
        addressLines: ['123 Business Street', 'Città, Provincia 12345', 'Paese']
      },
      followUs: 'Seguici',
      form: {
        name: 'Nome',
        email: 'Email',
        subject: 'Oggetto',
        message: 'Messaggio',
        placeholders: {
          name: 'Il tuo nome',
          email: 'la.tua.email@example.com',
          subject: 'Di cosa si tratta?',
          message: 'Il tuo messaggio...'
        },
        success: 'Grazie per il messaggio! Ti ricontatteremo al più presto.',
        sending: 'Invio in corso...',
        submit: 'Invia messaggio',
        defaultError: 'Invio non riuscito. Riprova più tardi.'
      }
    },
    faq: {
      heading: 'Domande frequenti',
      list: [
        {
          q: 'Quanto costa usare Freshlancer?',
          a: "Creare un account è gratuito al 100% per studenti e clienti. Gli studenti possono candidarsi a 10 lavori al mese con il piano gratuito o passare a Premium a 4,99 $/mese per candidarsi a 100 lavori. I clienti possono pubblicare lavori illimitati e pagano solo quando assumono."
        },
        {
          q: 'Gli studenti freelance su Freshlancer sono verificati?',
          a: 'Sì! Tutti gli studenti freelance passano un processo di verifica con documento universitario e prova di iscrizione. Gli studenti verificati ottengono un badge sul profilo, così i clienti lavorano con studenti affidabili e talentuosi.'
        },
        {
          q: 'Che tipo di lavori freelance sono disponibili per gli studenti?',
          a: 'Abbiamo opportunità in sviluppo web, app mobile, graphic design, UI/UX, content writing, copywriting, digital marketing, SEO, social media, video editing, data entry, traduzione, assistenza virtuale e altro.'
        },
        {
          q: 'Come funziona la protezione dei pagamenti su Freshlancer?',
          a: 'Usiamo sistemi di pagamento sicuri con escrow e gestione del portafoglio clienti (PayMob per EGP, PayPal per USD) per proteggere entrambe le parti. I fondi sono conservati in sicurezza in account escrow fino al completamento delle milestone. I clienti possono finanziare le milestone tramite il loro portafoglio sicuro, e i fondi vengono rilasciati solo con approvazione. Tutte le transazioni sono conformi PCI-DSS e crittografate per massima sicurezza.'
        }
      ]
    },
    cta: {
      heading: 'Pronto per iniziare?',
      subheading: 'Unisciti a oltre 10.000 studenti e aziende che trovano successo su Freshlancer. Iscriviti gratis oggi: nessuna carta di credito richiesta!',
      primary: 'Inizia ora - 100% gratis',
      secondary: 'Accedi al tuo account'
    },
    footer: {
      brandCopy: 'Il marketplace leader per studenti freelance che mette in contatto studenti universitari di talento con aziende in tutto il mondo per opportunità di lavoro remoto.',
      studentsTitle: 'Per studenti',
      studentsLinks: ['Trova lavori', 'Crea portfolio', 'Piani Premium', 'Storie di successo'],
      clientsTitle: 'Per clienti',
      clientsLinks: ['Pubblica lavori', 'Trova talenti', 'Prezzi', 'Come funziona'],
      copyright: '© 2025 Freshlancer - Piattaforma leader per studenti freelance. Tutti i diritti riservati.'
    }
  }
};

const featureMeta = [
  { icon: <Code className="w-6 h-6" />, color: 'bg-blue-600' },
  { icon: <Users className="w-6 h-6" />, color: 'bg-[#25aaad]' },
  { icon: <Shield className="w-6 h-6" />, color: 'bg-green-600' },
  { icon: <Clock className="w-6 h-6" />, color: 'bg-orange-600' },
  { icon: <Star className="w-6 h-6" />, color: 'bg-yellow-600' },
  { icon: <TrendingUp className="w-6 h-6" />, color: 'bg-indigo-600' }
];

const statMeta = [
  { icon: <Users className="w-8 h-8" /> },
  { icon: <CheckCircle className="w-8 h-8" /> },
  { icon: <Star className="w-8 h-8" /> },
  { icon: <Globe className="w-8 h-8" /> }
];

const categoryMeta = [
  { icon: <Code className="w-5 h-5" />, color: 'bg-blue-500' },
  { icon: <Code className="w-5 h-5" />, color: 'bg-purple-500' },
  { icon: <Palette className="w-5 h-5" />, color: 'bg-pink-500' },
  { icon: <Palette className="w-5 h-5" />, color: 'bg-indigo-500' },
  { icon: <FileText className="w-5 h-5" />, color: 'bg-green-500' },
  { icon: <TrendingUp className="w-5 h-5" />, color: 'bg-orange-500' },
  { icon: <MessageCircle className="w-5 h-5" />, color: 'bg-cyan-500' },
  { icon: <Play className="w-5 h-5" />, color: 'bg-red-500' },
  { icon: <FileText className="w-5 h-5" />, color: 'bg-gray-500' },
  { icon: <Globe className="w-5 h-5" />, color: 'bg-teal-500' }
];

const Landing = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [language, setLanguage] = useState('en');
  const [contactFormData, setContactFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [contactFormError, setContactFormError] = useState('');
  const [contactFormSuccess, setContactFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = translations[language];

  const features = featureMeta.map((meta, index) => ({
    ...meta,
    ...t.features[index]
  }));

  const stats = statMeta.map((meta, index) => ({
    ...meta,
    ...t.stats[index]
  }));

  const jobCategories = categoryMeta.map((meta, index) => ({
    ...meta,
    name: t.jobCategories[index]
  }));

  const testimonials = t.testimonials.list;
  const howItWorksSteps = t.howItWorks.steps;
  const faqItems = t.faq.list;
  const benefits = t.benefits;
  const clientPaymentSecurity = t.clientPaymentSecurity;
  const studentGrowth = t.studentGrowth;

  // Get dashboard path based on user role
  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'student':
        return '/student/dashboard';
      case 'client':
        return '/client/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/login';
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
    setContactFormError('');
    setContactFormSuccess('');
  }, [language]);

  // SEO Meta Tags
  useEffect(() => {
    const { seo } = t;
    document.title = seo.title;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', seo.description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = seo.description;
      document.head.appendChild(meta);
    }

    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', seo.keywords);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = seo.keywords;
      document.head.appendChild(meta);
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:title');
      meta.content = seo.title;
      document.head.appendChild(meta);
    } else {
      ogTitle.content = seo.title;
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:description');
      meta.content = seo.ogDescription;
      document.head.appendChild(meta);
    } else {
      ogDescription.content = seo.ogDescription;
    }

    // Open Graph Image - use canonical origin so previews work for both www and non-www
    const ogImage = document.querySelector('meta[property="og:image"]');
    const imageUrl = OG_IMAGE_URL.startsWith('http') ? OG_IMAGE_URL : `${CANONICAL_ORIGIN}${OG_IMAGE_URL.startsWith('/') ? OG_IMAGE_URL : '/' + OG_IMAGE_URL}`;
    
    if (!ogImage) {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:image');
      meta.content = imageUrl;
      document.head.appendChild(meta);
    } else {
      ogImage.content = imageUrl;
    }

    // Open Graph Image Secure URL - Required for WhatsApp
    const ogImageSecureUrl = document.querySelector('meta[property="og:image:secure_url"]');
    if (!ogImageSecureUrl) {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:image:secure_url');
      meta.content = imageUrl;
      document.head.appendChild(meta);
    } else {
      ogImageSecureUrl.content = imageUrl;
    }

    // Open Graph Image dimensions - Recommended for better previews
    const ogImageWidth = document.querySelector('meta[property="og:image:width"]');
    if (!ogImageWidth) {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:image:width');
      meta.content = '1200';
      document.head.appendChild(meta);
    }

    const ogImageHeight = document.querySelector('meta[property="og:image:height"]');
    if (!ogImageHeight) {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:image:height');
      meta.content = '630';
      document.head.appendChild(meta);
    }

    // Open Graph Image type - Important for WhatsApp
    const ogImageType = document.querySelector('meta[property="og:image:type"]');
    if (!ogImageType) {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:image:type');
      meta.content = 'image/png';
      document.head.appendChild(meta);
    }

    // Open Graph Image alt text
    const ogImageAlt = document.querySelector('meta[property="og:image:alt"]');
    if (!ogImageAlt) {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:image:alt');
      meta.content = 'Freshlancer - Student Freelance Platform';
      document.head.appendChild(meta);
    }

    // Open Graph URL - use canonical origin so same preview for www and non-www
    const canonicalUrl = `${CANONICAL_ORIGIN}/`;
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:url');
      meta.content = canonicalUrl;
      document.head.appendChild(meta);
    } else {
      ogUrl.content = canonicalUrl;
    }

    // Open Graph Type
    const ogType = document.querySelector('meta[property="og:type"]');
    if (!ogType) {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:type');
      meta.content = 'website';
      document.head.appendChild(meta);
    }

    // Open Graph Site Name
    const ogSiteName = document.querySelector('meta[property="og:site_name"]');
    if (!ogSiteName) {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:site_name');
      meta.content = 'Freshlancer';
      document.head.appendChild(meta);
    }

    // Twitter Card
    const twitterCard = document.querySelector('meta[name="twitter:card"]');
    if (!twitterCard) {
      const meta = document.createElement('meta');
      meta.name = 'twitter:card';
      meta.content = 'summary_large_image';
      document.head.appendChild(meta);
    }

    // Twitter Image - Also needed for better previews
    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (!twitterImage) {
      const meta = document.createElement('meta');
      meta.name = 'twitter:image';
      meta.content = imageUrl;
      document.head.appendChild(meta);
    } else {
      twitterImage.content = imageUrl;
    }

    const canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = canonicalUrl;
      document.head.appendChild(link);
    } else {
      canonical.href = canonicalUrl;
    }

  }, [t, language]);

  // Smooth scroll handler for anchor links
  useEffect(() => {
    const handleAnchorClick = (e) => {
      const href = e.target.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', handleAnchorClick);
    });

    return () => {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.removeEventListener('click', handleAnchorClick);
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-white" style={{ scrollBehavior: 'smooth' }}>
      {/* Structured Data (Schema.org) */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Freshlancer",
          "alternateName": "Freshlancer Student Freelance Platform",
          "url": window.location.origin,
          "description": t.seo.schemaDescription
        })}
      </script>

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Freshlancer",
          "url": window.location.origin,
          "logo": `${window.location.origin}/logo.png`,
          "description": t.seo.organizationDescription,
          "paymentAccepted": ["PayMob", "PayPal"],
          "currenciesAccepted": "EGP, USD"
        })}
      </script>

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "serviceType": "Freelance Marketplace",
          "provider": {
            "@type": "Organization",
            "name": "Freshlancer"
          },
          "areaServed": "Worldwide",
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Freelance Services",
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Secure Escrow Payment System",
                  "description": "Industry-leading escrow protection with client wallet management, milestone-based payments, and PCI-DSS compliant payment gateways"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Client Wallet Management",
                  "description": "Secure wallet system for clients to manage funds, track transactions, and fund project milestones with full transparency"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Dispute Resolution System",
                  "description": "Fair appeal process for non-payment, poor quality work, contract violations, and missed deadlines with full support"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Student Career Development",
                  "description": "Opportunities for students to earn money, gain real-world experience, and acquire knowledge through freelance projects"
                }
              }
            ]
          }
        })}
      </script>

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "How are client payments protected on Freshlancer?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "We use secure escrow payment systems with client wallet management. All milestone payments are held in secure escrow accounts until project completion. Clients fund milestones through their secure wallet, and funds are only released upon approval. We use PCI-DSS compliant payment gateways (PayMob for EGP, PayPal for USD) and provide a comprehensive dispute resolution system for appeals."
              }
            },
            {
              "@type": "Question",
              "name": "What happens if there's a dispute with a project?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Our appeal system provides a fair resolution process. Clients can file appeals for non-payment, poor quality work, contract violations, or missed deadlines. Our support team reviews all appeals and can facilitate refunds or work corrections. The escrow system ensures funds are protected until disputes are resolved."
              }
            },
            {
              "@type": "Question",
              "name": "How can students benefit from Freshlancer?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Students can earn money, gain real-world experience, and acquire knowledge through freelance projects. They build professional portfolios with actual client work, develop industry skills, learn from client feedback, and connect with potential long-term employers. The platform offers flexible remote work that fits study schedules."
              }
            }
          ]
        })}
      </script>

      {/* Professional Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo Space - Recommended size: 200px width × 60px height */}
            <div className="flex items-center flex-shrink-0">
              <Link to="/" className="flex items-center">
                <img
                  src={logo}
                  alt="Freshlancer logo"
                  className="h-10 sm:h-12 md:h-[60px] w-auto max-w-[180px] sm:max-w-[220px] md:max-w-[250px] object-contain"
                />
              </Link>
            </div>

            <div className="hidden lg:flex items-center gap-6 xl:gap-8">
              <a href="#features" className="text-sm xl:text-base text-gray-700 hover:text-[#065084] font-medium transition-colors">{t.nav.features}</a>
              <a href="#how-it-works" className="text-sm xl:text-base text-gray-700 hover:text-[#065084] font-medium transition-colors">{t.nav.howItWorks}</a>
              <a href="#about" className="text-sm xl:text-base text-gray-700 hover:text-[#065084] font-medium transition-colors">{t.nav.about}</a>
              <a href="#contact" className="text-sm xl:text-base text-gray-700 hover:text-[#065084] font-medium transition-colors">{t.nav.contact}</a>
              <a href="#testimonials" className="text-sm xl:text-base text-gray-700 hover:text-[#065084] font-medium transition-colors">{t.nav.testimonials}</a>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <div className="flex items-center">
                <label htmlFor="language-select" className="sr-only">
                  {t.languageLabel}
                </label>
      
              </div>
              {isAuthenticated ? (
                <>
                  <Button
                    onClick={() => navigate(getDashboardPath())}
                    aria-label={t.hero.dashboardAria}
                    className="bg-[#065084] text-white hover:bg-[#043d6b] transition-all text-xs sm:text-sm px-2 sm:px-3 md:px-4 py-1.5 sm:py-2"
                  >
                    <LayoutDashboard className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" aria-hidden="true" />
                    <span className="hidden sm:inline">{t.nav.dashboard}</span>
                    <span className="sm:hidden">Dashboard</span>
                  </Button>

                  <button
                    onClick={async () => {
                      await logout();
                      navigate('/');
                    }}
                    aria-label="Logout"
                    className="p-1.5 sm:p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-all border border-transparent hover:border-red-200"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                  </button>

                  <select
                  id="language-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#065084] bg-white"
                  aria-label={t.languageLabel}
                >
                  <option value="en">{t.languageOptions.en}</option>
                  <option value="it">{t.languageOptions.it}</option>
                </select>
                </>
              ) : (
                <>
                  <select
                    id="language-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#065084] bg-white"
                    aria-label={t.languageLabel}
                  >
                    <option value="en">{t.languageOptions.en}</option>
                    <option value="it">{t.languageOptions.it}</option>
                  </select>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/login')}
                    aria-label={t.hero.secondaryAria}
                    className="border-gray-300 text-gray-700 hover:border-[#065084] hover:text-[#065084] text-xs sm:text-sm px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 hidden sm:inline-flex"
                  >
                    {t.nav.signIn}
                  </Button>
                  <Button
                    onClick={() => navigate('/register')}
                    aria-label={t.nav.getStarted}
                    className="bg-[#065084] text-white hover:bg-[#043d6b] transition-all text-xs sm:text-sm px-2 sm:px-3 md:px-4 py-1.5 sm:py-2"
                  >
                    <span className="hidden sm:inline">{t.nav.getStarted}</span>
                    <span className="sm:hidden">Start</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Professional Design */}
      <header className="relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* Left Content */}
            <article className="space-y-6 sm:space-y-8">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#065084]/10 rounded-md text-xs sm:text-sm font-medium text-[#065084] border border-[#065084]/20">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
                <span className="truncate">{t.hero.badge}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {t.hero.headingLine1}
                <br />
                <span className="text-[#065084] font-extrabold" style={{ fontWeight: 900 }}>
                  {t.hero.headingHighlight}
                </span>
              </h2>

              <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed">
                {t.hero.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {isAuthenticated ? (
                  <Button
                    size="lg"
                    onClick={() => navigate(getDashboardPath())}
                    className="bg-[#065084] text-white hover:bg-[#043d6b] transition-all text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
                    aria-label={t.hero.dashboardAria}
                  >
                    <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5 mr-2" aria-hidden="true" />
                    {t.hero.dashboardCta}
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" aria-hidden="true" />
                  </Button>
                ) : (
                  <>
                    <Button
                      size="lg"
                      onClick={() => navigate('/register')}
                      className="bg-[#065084] text-white hover:bg-[#043d6b] transition-all text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
                      aria-label={t.hero.primaryAria}
                    >
                      {t.hero.primaryCta}
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => navigate('/login')}
                      className="border-2 border-gray-300 text-gray-700 hover:border-[#065084] hover:text-[#065084] text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
                      aria-label={t.hero.secondaryAria}
                    >
                      {t.hero.secondaryCta}
                    </Button>
                  </>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 pt-2 sm:pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-600">{t.hero.noCreditCard}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-600">{t.hero.quickSignup}</span>
                </div>
              </div>
            </article>

            {/* Right Image Space - 600x500px recommended */}
            <div className="relative order-first lg:order-last">
              <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] bg-[#065084]/5 rounded-lg flex items-center justify-center border border-gray-200 shadow-lg overflow-hidden">
                <img
                  src={heroLogo}
                  alt="Freshlancer hero logo"
                  className="h-[250px] sm:h-[350px] md:h-[400px] w-auto max-w-full sm:max-w-[500px] object-contain animate-bounce-slow"
                  style={{
                    animation: 'bounce-slow 2s ease-in-out infinite'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Stats Section - Modern Cards */}
          {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-12 sm:mt-16 md:mt-20">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-all"
              >
                <div className="text-[#065084] mb-2 sm:mb-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8">{stat.icon}</div>
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#065084] mb-1 sm:mb-2">
                  {stat.number}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 leading-tight">{stat.label}</div>
              </div>
            ))}
          </div> */}
        </div>
      </header>

      {/* Features Section - Modern Card Grid */}
      <section id="features" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white" aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 id="features-heading" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              {t.featureSection.headingPrefix}{' '}
              <span className="text-[#065084]">{t.featureSection.headingHighlight}</span>
              {t.featureSection.headingSuffix}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              {t.featureSection.subheading}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {features.map((feature, index) => (
              <article
                key={index}
                className="group bg-white p-6 sm:p-8 rounded-lg border border-gray-200 hover:border-[#065084] hover:shadow-lg transition-all"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 ${feature.color} rounded-lg flex items-center justify-center text-white mb-4 sm:mb-6 transition-transform`}>
                  <div className="w-5 h-5 sm:w-6 sm:h-6">{feature.icon}</div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Job Categories Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gray-50" aria-labelledby="categories-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 id="categories-heading" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              {t.categorySection.heading}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 px-4">
              {t.categorySection.subheading}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {jobCategories.map((category, index) => (
              <div
                key={index}
                className="group bg-white p-4 sm:p-6 rounded-lg border border-gray-200 hover:border-[#065084] hover:shadow-md transition-all cursor-pointer"
              >
                <div className={`w-8 h-8 sm:w-10 sm:h-10 ${category.color} rounded-lg flex items-center justify-center text-white mb-2 sm:mb-3 transition-transform`}>
                  <div className="w-4 h-4 sm:w-5 sm:h-5">{category.icon}</div>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-[#065084] transition-colors leading-tight">
                  {category.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section - Dual Cards with Brand Colors */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white" aria-labelledby="benefits-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="benefits-heading" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-8 sm:mb-12 md:mb-16 text-center px-4">
            {benefits.heading}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* For Students Card */}
            <article className="relative bg-white rounded-lg overflow-hidden border-2 border-[#25aaad] hover:border-[#25aaad] transition-all shadow-lg hover:shadow-xl">
              <div className="relative p-6 sm:p-8 md:p-10">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[#25aaad] rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                    <Award className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{benefits.students.title}</h3>
                    <p className="text-sm sm:text-base text-[#25aaad] font-medium">{benefits.students.tagline}</p>
                  </div>
                </div>

                <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 sm:mb-8">
                  {benefits.students.intro}
                </p>

                <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  {benefits.students.list.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 sm:gap-3">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#25aaad] mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <span className="text-xs sm:text-sm md:text-base text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>

                {/* Image Space for Students - 400x300px */}
                <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] rounded-lg mb-4 sm:mb-6 overflow-hidden border border-[#25aaad]/30">
                  <img 
                    src={Studentimage} 
                    alt="Student freelancer working on projects" 
                    className="w-full h-full object-cover"
                  />
                </div>

                <Button
                  className="w-full bg-[#25aaad] text-white hover:bg-[#1a8b8d] text-sm sm:text-base md:text-lg py-4 sm:py-5 md:py-6"
                  onClick={() => navigate('/register')}
                  aria-label={benefits.students.cta}
                >
                  {benefits.students.cta}
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Button>
              </div>
            </article>

            {/* For Clients Card */}
            <article className="relative bg-white rounded-lg overflow-hidden border-2 border-[#065084] hover:border-[#065084] transition-all shadow-lg hover:shadow-xl">
              <div className="relative p-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-[#065084] rounded-lg flex items-center justify-center shadow-md">
                    <Search className="w-8 h-8 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900">{benefits.clients.title}</h3>
                    <p className="text-[#065084] font-medium">{benefits.clients.tagline}</p>
                  </div>
                </div>

                <p className="text-gray-600 mb-8 text-lg">
                  {benefits.clients.intro}
                </p>

                <ul className="space-y-4 mb-8">
                  {benefits.clients.list.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#065084] mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>

                {/* Image Space for Clients - 400x300px */}
                <div className="w-full h-[300px] rounded-lg mb-6 overflow-hidden border border-[#065084]/30">
                  <img 
                    src={Clientimage} 
                    alt="Client hiring student freelancers" 
                    className="w-full h-full object-cover"
                  />
                </div>

                <Button
                  className="w-full bg-[#065084] text-white hover:bg-[#043d6b] text-lg py-6"
                  onClick={() => navigate('/register')}
                  aria-label={benefits.clients.cta}
                >
                  {benefits.clients.cta}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gray-50" aria-labelledby="testimonials-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 id="testimonials-heading" className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {t.testimonials.heading}
            </h2>
            <p className="text-xl text-gray-600">
              {t.testimonials.subheading}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <article
                key={index}
                className="bg-white p-8 rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" aria-hidden="true" />
                  ))}
                </div>

                <blockquote className="text-gray-700 text-lg mb-6 leading-relaxed">
                  "{testimonial.text}"
                </blockquote>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#065084] rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-sm text-gray-500">{testimonial.company}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-white" aria-labelledby="how-it-works-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 id="how-it-works-heading" className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {t.howItWorks.heading}
            </h2>
            <p className="text-xl text-gray-600">
              {t.howItWorks.subheading}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection lines */}
            <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-1 bg-gray-300 -z-10"></div>

            {howItWorksSteps.map((step, index) => (
              <article key={step.title} className="text-center">
                <div className="w-20 h-20 bg-[#065084] rounded-lg flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 shadow-md">
                  {index + 1}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Client Payment Security Section */}
      <section id="payment-security" className="py-24 bg-gradient-to-br from-blue-50 to-indigo-50" aria-labelledby="payment-security-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#065084] rounded-full mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 id="payment-security-heading" className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {t.clientPaymentSecurity.heading}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              {t.clientPaymentSecurity.subheading}
            </p>
            <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
              {t.clientPaymentSecurity.intro}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {t.clientPaymentSecurity.features.map((feature, index) => {
              const iconMap = {
                Shield: Shield,
                CreditCard: CreditCard,
                CheckCircle: CheckCircle,
                Lock: Lock,
                AlertCircle: AlertCircle,
                Eye: Eye,
                DollarSign: DollarSign,
                Server: Server
              };
              const IconComponent = iconMap[feature.icon] || Shield;
              return (
                <article
                  key={index}
                  className="bg-white p-6 rounded-lg border border-gray-200 shadow-md hover:shadow-xl transition-all"
                >
                  <div className="w-12 h-12 bg-[#065084] rounded-lg flex items-center justify-center mb-4">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="text-center">
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-[#065084] text-white hover:bg-[#043d6b] text-lg px-10 py-6 font-semibold"
            >
              {t.clientPaymentSecurity.cta}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Student Growth Section */}
      <section id="student-growth" className="py-24 bg-white" aria-labelledby="student-growth-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#25aaad] rounded-full mb-6">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h2 id="student-growth-heading" className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {t.studentGrowth.heading}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              {t.studentGrowth.subheading}
            </p>
            <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
              {t.studentGrowth.intro}
            </p>
          </div>

          {/* Three Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {t.studentGrowth.pillars.map((pillar, index) => {
              const iconMap = {
                DollarSign: DollarSign,
                Briefcase: Briefcase,
                Award: Award
              };
              const IconComponent = iconMap[pillar.icon] || Award;
              return (
                <article
                  key={index}
                  className="bg-white p-8 rounded-lg border-2 border-gray-200 hover:border-[#25aaad] shadow-lg hover:shadow-xl transition-all"
                >
                  <div className={`w-16 h-16 ${pillar.color} rounded-lg flex items-center justify-center mb-6 mx-auto`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                    {pillar.title}
                  </h3>
                  <p className="text-gray-600 text-center mb-6">
                    {pillar.description}
                  </p>
                  <ul className="space-y-3">
                    {pillar.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-[#25aaad] mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>

          {/* Additional Benefits */}
          <div className="bg-gradient-to-br from-[#25aaad]/10 to-blue-50 rounded-lg p-8 mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              {t.studentGrowth.additionalBenefits.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {t.studentGrowth.additionalBenefits.items.map((item, index) => (
                <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    {item.title}
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-[#25aaad] text-white hover:bg-[#1a8b8d] text-lg px-10 py-6 font-semibold"
            >
              {t.studentGrowth.cta}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-24 bg-white" aria-labelledby="about-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 id="about-heading" className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {t.about.heading.split('Freshlancer')[0]}
              <span className="text-[#065084]">Freshlancer</span>
              {t.about.heading.split('Freshlancer')[1] || ''}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t.about.subheading}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">{t.about.missionTitle}</h3>
              {t.about.missionParagraphs.map((paragraph, index) => (
                <p key={index} className="text-lg text-gray-600 leading-relaxed mb-6">
                  {paragraph}
                </p>
              ))}
              <div className="flex gap-4 mt-8">
                <a href="https://www.facebook.com/people/Freshlancer/61585812083274/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-12 h-12 bg-[#065084] rounded-lg flex items-center justify-center text-white hover:bg-[#043d6b] transition-colors">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="https://www.linkedin.com/company/110654958/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-12 h-12 bg-[#065084] rounded-lg flex items-center justify-center text-white hover:bg-[#043d6b] transition-colors">
                  <Linkedin className="w-6 h-6" />
                </a>
                <a href="https://instagram.com/freshlancer__" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-12 h-12 bg-[#065084] rounded-lg flex items-center justify-center text-white hover:bg-[#043d6b] transition-colors">
                  <Instagram className="w-6 h-6" />
                </a>
              </div>

              {/* Legal Links */}
              <div className="mt-10 pt-6 border-t border-gray-200 flex flex-wrap gap-6 text-sm">
                <Link
                  to="/privacy-policy"
                  className="text-gray-600 hover:text-[#065084] font-medium transition-colors"
                >
                  Privacy Policy
                </Link>

                <Link
                  to="/refund-policy"
                  className="text-gray-600 hover:text-[#065084] font-medium transition-colors"
                >
                  Refund Policy
                </Link>
              </div>
              
            </div>
            <div className="space-y-6">
              {t.about.cards.map((card) => (
                <div key={card.title} className="p-6 bg-gray-50 rounded-lg">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">{card.title}</h4>
                  <p className="text-gray-600">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="py-24 bg-gray-50" aria-labelledby="contact-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 id="contact-heading" className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              <span className="text-[#065084]">{t.contact.heading}</span>
            </h2>
            <p className="text-xl text-gray-600">
              {t.contact.subheading}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">{t.contact.getInTouch}</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#065084] rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">{t.contact.methods.email}</h4>
                    <a href="mailto:support@freshlancer.online" className="text-gray-600 hover:text-[#065084] transition-colors flex items-center gap-2">
                      support@freshlancer.online
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">{t.contact.methods.whatsapp}</h4>
                    <a href="https://wa.me/201553359431" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#065084] transition-colors flex items-center gap-2">
                      +20 155 335 9431
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    <Send className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">{t.contact.methods.telegram}</h4>
                    <a href="https://t.me/freshlancer" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#065084] transition-colors flex items-center gap-2">
                      @freshlancer
                    </a>
                  </div>
                </div>


                      {/* Location */}
                    <div className="flex items-start gap-4">
                      <MapPin className="w-6 h-6 text-[#065084]" />
                      <span>Cairo, Egypt</span>
                    </div>


              </div>
              <div className="mt-8">
                <h4 className="font-bold text-gray-900 mb-4">{t.contact.followUs}</h4>
                <div className="flex gap-4">
                  <a href="https://www.facebook.com/people/Freshlancer/61585812083274/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-gray-700 hover:bg-[#065084] hover:text-white transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href="https://www.linkedin.com/company/110654958/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-gray-700 hover:bg-[#065084] hover:text-white transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href="https://instagram.com/freshlancer__" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-gray-700 hover:bg-[#065084] hover:text-white transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-8 rounded-lg shadow-lg">
              {contactFormError && (
                <Alert type="error" message={contactFormError} className="mb-4 contact-error-alert" onClose={() => setContactFormError('')} />
              )}
              {contactFormSuccess && (
                <Alert type="success" message={contactFormSuccess} className="mb-4 contact-success-alert" onClose={() => setContactFormSuccess('')} />
              )}
              <form
                className="space-y-6"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setContactFormError('');
                  setContactFormSuccess('');
                  setIsSubmitting(true);

                  try {
                    await contactService.createContact(contactFormData);
                    
                    // Clear form immediately
                    setContactFormData({
                      name: '',
                      email: '',
                      subject: '',
                      message: '',
                    });
                    
                    // Show success message
                    setContactFormSuccess(t.contact.form.success);
                    
                    // Scroll to success message
                    setTimeout(() => {
                      const successAlert = document.querySelector('.contact-success-alert');
                      if (successAlert) {
                        successAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }, 100);
                  } catch (error) {
                    setContactFormError(
                      error.response?.data?.message ||
                      t.contact.form.defaultError
                    );
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">
                    {t.contact.form.name}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={contactFormData.name}
                    onChange={(e) =>
                      setContactFormData({ ...contactFormData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065084] focus:border-transparent"
                    placeholder={t.contact.form.placeholders.name}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                    {t.contact.form.email}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={contactFormData.email}
                    onChange={(e) =>
                      setContactFormData({ ...contactFormData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065084] focus:border-transparent"
                    placeholder={t.contact.form.placeholders.email}
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-bold text-gray-700 mb-2">
                    {t.contact.form.subject}
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={contactFormData.subject}
                    onChange={(e) =>
                      setContactFormData({ ...contactFormData, subject: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065084] focus:border-transparent"
                    placeholder={t.contact.form.placeholders.subject}
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-2">
                    {t.contact.form.message}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={contactFormData.message}
                    onChange={(e) =>
                      setContactFormData({ ...contactFormData, message: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065084] focus:border-transparent resize-none"
                    placeholder={t.contact.form.placeholders.message}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#065084] text-white hover:bg-[#043d6b] text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5 mr-2" />
                  {isSubmitting ? t.contact.form.sending : t.contact.form.submit}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gray-50" aria-labelledby="faq-heading">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="faq-heading" className="text-4xl lg:text-5xl font-bold text-gray-900 mb-16 text-center">
            {t.faq.heading}
          </h2>

          <div className="space-y-6">
            {faqItems.map((faq, index) => (
              <article key={index} className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {faq.q}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {faq.a}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#065084] relative overflow-hidden" aria-labelledby="cta-heading">

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Globe className="w-20 h-20 text-white mx-auto mb-8" aria-hidden="true" />
          <h2 id="cta-heading" className="text-4xl lg:text-5xl font-bold text-white mb-6">
            {t.cta.heading}
          </h2>
          <p className="text-xl text-white/90 mb-10 leading-relaxed">
            {t.cta.subheading}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-white text-[#065084] hover:bg-gray-50 hover:shadow-2xl text-lg px-10 py-6 font-semibold"
              aria-label={t.cta.primary}
            >
              {t.cta.primary}
              <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/login')}
              className="border-2 border-white text-white hover:bg-white/10 text-lg px-10 py-6 font-semibold"
              aria-label={t.cta.secondary}
            >
              {t.cta.secondary}
            </Button>
          </div>
      
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         

          <div className="border-t border-gray-800 pt-8">
            <p className="text-center text-gray-500 text-sm">
              {t.footer.copyright}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
