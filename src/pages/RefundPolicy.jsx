import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import Card from '../components/common/Card';
import {
  Shield,
  ArrowLeft,
  AlertCircle,
  Mail,
  FileText,
  CreditCard,
  XCircle,
} from 'lucide-react';

const translations = {
  en: {
    title: 'Refund Policy',
    lastUpdated: 'Effective Date: January 2025',
    backToHome: 'Back to Home',

    introduction: {
      title: 'Freshlancer Refund Policy',
      content:
        'Please read this refund policy carefully before making any payment to Freshlancer.',
    },

    noRefund: {
      title: 'NO REFUNDS AFTER PAYMENT',
      exclusionsTitle: 'We do not offer refunds for:',
      points: [
        'All payments made to Freshlancer are final and non-refundable.',
        'Once a payment has been processed and completed, no refund will be issued under any circumstances.',
        'This policy applies to all services, subscriptions, one-time payments, and any other transactions conducted through Freshlancer.',
      ],
      exclusions: [
        'Change of mind',
        'Partial use of services',
        'Dissatisfaction with the service',
        'Any other reason after payment has been made',
      ],
    },

    beforePay: {
      title: 'BEFORE YOU PAY',
      content:
        'We encourage you to review our services, terms, and any applicable descriptions carefully before making a payment. By proceeding with payment, you confirm that you have read, understood, and agree to this no-refund policy.',
    },

    contact: {
      title: 'Contact',
      content:
        'If you have questions about this refund policy, please contact us before making any payment.',
      email: 'support@freshlancer.online',
    },

    footer: '© Freshlancer. All rights reserved.',
  },
  it: {
    title: 'Politica sui rimborsi',
    lastUpdated: 'In vigore: gennaio 2025',
    backToHome: 'Torna alla home',
    introduction: {
      title: 'Politica sui rimborsi Freshlancer',
      content:
        'Leggi con attenzione questa politica sui rimborsi prima di effettuare un pagamento a Freshlancer.',
    },
    noRefund: {
      title: 'NESSUN RIMBORSO DOPO IL PAGAMENTO',
      exclusionsTitle: 'Non offriamo rimborsi per:',
      points: [
        'Tutti i pagamenti a Freshlancer sono definitivi e non rimborsabili.',
        'Una volta completato, nessun rimborso sarà emesso in nessun caso.',
        'La politica si applica a servizi, abbonamenti, pagamenti una tantum e ogni altra transazione su Freshlancer.',
      ],
      exclusions: [
        'Ripensamento',
        'Uso parziale dei servizi',
        'Insoddisfazione per il servizio',
        'Qualsiasi altro motivo dopo il pagamento',
      ],
    },
    beforePay: {
      title: 'PRIMA DI PAGARE',
      content:
        'Ti invitiamo a esaminare servizi, condizioni e descrizioni prima di pagare. Procedendo con il pagamento confermi di aver compreso e accettare questa politica di mancato rimborso.',
    },
    contact: {
      title: 'Contatti',
      content:
        'Per domande su questa politica sui rimborsi, contattaci prima di effettuare un pagamento.',
      email: 'support@freshlancer.online',
    },
    footer: '© Freshlancer. Tutti i diritti riservati.',
  },
  ar: {
    title: 'سياسة الاسترداد',
    lastUpdated: 'سريان: يناير 2025',
    backToHome: 'العودة للرئيسية',
    introduction: {
      title: 'سياسة الاسترداد — فريش لانسر',
      content: 'يُرجى قراءة سياسة الاسترداد بعناية قبل أي دفع لـ Freshlancer.',
    },
    noRefund: {
      title: 'لا استرداد بعد إتمام الدفع',
      exclusionsTitle: 'لا نقدّم استرداداً في حالات مثل:',
      points: [
        'جميع المدفوعات إلى Freshlancer نهائية وغير قابلة للاسترداد.',
        'بعد اكتمال الدفع لن يُصدر استرداد تحت أي ظرف.',
        'تنطبق السياسة على الخدمات والاشتراكات والدفعات لمرة واحدة وغيرها عبر المنصة.',
      ],
      exclusions: [
        'تغيّر الرأي',
        'استخدام جزئي للخدمة',
        'عدم الرضا عن الخدمة',
        'أي سبب آخر بعد الدفع',
      ],
    },
    beforePay: {
      title: 'قبل أن تدفع',
      content:
        'ننصحك بمراجعة الخدمات والشروط والوصف بعناية. بمتابعة الدفع تؤكد أنك قرأت ووافقت على سياسة عدم الاسترداد.',
    },
    contact: {
      title: 'تواصل',
      content: 'للأسئلة حول سياسة الاسترداد يرجى التواصل قبل الدفع.',
      email: 'support@freshlancer.online',
    },
    footer: '© فريش لانسر. جميع الحقوق محفوظة.',
  },
};

const RefundPolicy = () => {
  const { user } = useAuthStore();
  const [language, setLanguage] = useState(
    () => localStorage.getItem('dashboardLanguage') || 'en'
  );

  useEffect(() => {
    const onLang = (e) => setLanguage(e.detail?.language || localStorage.getItem('dashboardLanguage') || 'en');
    const handleStorageChange = () => {
      setLanguage(localStorage.getItem('dashboardLanguage') || 'en');
    };
    window.addEventListener('languageChanged', onLang);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('languageChanged', onLang);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const t = translations[language] || translations.en;

  const getHomePath = () => {
    if (user?.role === 'client') return '/client/dashboard';
    if (user?.role === 'student') return '/student/dashboard';
    if (user?.role === 'admin') return '/admin/dashboard';
    return '/';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Back Button */}
      <Link
        to={getHomePath()}
        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        {t.backToHome}
      </Link>

      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
          <Shield className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {t.title}
        </h1>
        <p className="text-gray-600">
          {t.lastUpdated}
        </p>
      </div>

      {/* Introduction */}
      <Card className="p-8 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-6 h-6 text-primary-600" />
          <h2 className="text-2xl font-bold">{t.introduction.title}</h2>
        </div>
        <p className="text-gray-700 leading-relaxed">
          {t.introduction.content}
        </p>
      </Card>

      {/* No Refund Section */}
      <Card className="p-8 mb-8 border-2 border-red-200 bg-red-50">
        <div className="flex items-center gap-3 mb-6">
          <XCircle className="w-6 h-6 text-red-600" />
          <h2 className="text-2xl font-bold text-red-700">
            {t.noRefund.title}
          </h2>
        </div>

        <ul className="list-disc list-inside space-y-3 text-gray-800 mb-6">
          {t.noRefund.points.map((point, index) => (
            <li key={index}>{point}</li>
          ))}
        </ul>

        <div>
          <h3 className="font-semibold text-gray-900 mb-2">
            {t.noRefund.exclusionsTitle}
          </h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {t.noRefund.exclusions.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Before You Pay */}
      <Card className="p-8 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold">{t.beforePay.title}</h2>
        </div>
        <p className="text-gray-700 leading-relaxed">
          {t.beforePay.content}
        </p>
      </Card>

      {/* Contact */}
      <Card className="p-8 bg-gradient-to-br from-primary-50 to-blue-50 border-2 border-primary-200">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-6 h-6 text-primary-600" />
          <h2 className="text-2xl font-bold">{t.contact.title}</h2>
        </div>
        <p className="text-gray-700 mb-4">
          {t.contact.content}
        </p>
        <p className="font-semibold text-primary-700">
          {t.contact.email}
        </p>

        <div className="mt-6 text-sm text-gray-500">
          {t.footer}
        </div>
      </Card>

    </div>
  );
};

export default RefundPolicy;