import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useAuthStore } from '../stores/authStore';

const translations = {
  en: {
    paymentFailed: 'Payment Failed',
    missingIdError: 'Payment verification failed - missing transaction ID.',
    transactionNotFound: 'Transaction not found in our system.',
    paymentNotCompleted: 'Payment was not completed successfully.',
    processingError: 'An error occurred while processing your payment.',
    captureFailed: 'We could not complete the payment on our side. If your card was charged, PayPal will refund you automatically within a few days. Please try again or contact support if the amount is not refunded.',
    invalidRequest: 'Invalid payment link or session. Please start the payment again.',
    defaultError: 'Payment could not be completed. Please try again.',
    commonReasons: 'Common reasons for payment failure:',
    insufficientFunds: 'Insufficient funds in your account',
    incorrectCardDetails: 'Incorrect card details',
    cardDeclined: 'Card declined by your bank',
    networkIssues: 'Network connection issues',
    paymentCanceled: 'Payment canceled by user',
    tryAgain: 'Try Again',
    contactSupport: 'Contact Support',
    goBack: 'Go Back',
    errorCode: 'Error Code:',
    includeCodeSupport: 'Please include this code if contacting support',
  },
  it: {
    paymentFailed: 'Pagamento Fallito',
    missingIdError: 'Verifica pagamento fallita - ID transazione mancante.',
    transactionNotFound: 'Transazione non trovata nel nostro sistema.',
    paymentNotCompleted: 'Il pagamento non è stato completato con successo.',
    processingError: 'Si è verificato un errore durante l\'elaborazione del pagamento.',
    captureFailed: 'Non siamo riusciti a completare il pagamento. Se la carta è stata addebitata, PayPal rimborserà automaticamente. Riprova o contatta il supporto.',
    invalidRequest: 'Link o sessione di pagamento non validi. Avvia di nuovo il pagamento.',
    defaultError: 'Il pagamento non può essere completato. Riprova.',
    commonReasons: 'Motivi comuni per il fallimento del pagamento:',
    insufficientFunds: 'Fondi insufficienti nel tuo account',
    incorrectCardDetails: 'Dettagli carta non corretti',
    cardDeclined: 'Carta rifiutata dalla tua banca',
    networkIssues: 'Problemi di connessione di rete',
    paymentCanceled: 'Pagamento annullato dall\'utente',
    tryAgain: 'Riprova',
    contactSupport: 'Contatta il Supporto',
    goBack: 'Torna Indietro',
    errorCode: 'Codice Errore:',
    includeCodeSupport: 'Includi questo codice se contatti il supporto',
  },
  ar: {
    paymentFailed: 'فشل الدفع',
    missingIdError: 'فشل التحقق: معرّف المعاملة مفقود.',
    transactionNotFound: 'المعاملة غير موجودة في نظامنا.',
    paymentNotCompleted: 'لم يكتمل الدفع بنجاح.',
    processingError: 'حدث خطأ أثناء معالجة الدفع.',
    captureFailed:
      'تعذر إكمال الدفع. إن خُصم مبلغ من بطاقتك فسيُرجع PayPal تلقائياً خلال أيام. أعد المحاولة أو راسل الدعم.',
    invalidRequest: 'رابط دفع غير صالح. ابدأ الدفع من جديد.',
    defaultError: 'تعذر إكمال الدفع. حاول مرة أخرى.',
    commonReasons: 'أسباب شائعة لفشل الدفع:',
    insufficientFunds: 'رصيد غير كافٍ',
    incorrectCardDetails: 'بيانات البطاقة غير صحيحة',
    cardDeclined: 'رفضت البنك العملية',
    networkIssues: 'مشاكل في الشبكة',
    paymentCanceled: 'ألغى المستخدم الدفع',
    tryAgain: 'حاول مرة أخرى',
    contactSupport: 'تواصل مع الدعم',
    goBack: 'رجوع',
    errorCode: 'رمز الخطأ:',
    includeCodeSupport: 'اذكر هذا الرمز عند التواصل مع الدعم',
  },
};

const PaymentFailed = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const error = searchParams.get('error') || searchParams.get('reason');
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

  const getErrorMessage = () => {
    switch (error) {
      case 'missing_id':
        return t.missingIdError;
      case 'transaction_not_found':
        return t.transactionNotFound;
      case 'payment_not_completed':
        return t.paymentNotCompleted;
      case 'processing_error':
        return t.processingError;
      case 'capture_failed':
        return t.captureFailed;
      case 'invalid_request':
        return t.invalidRequest;
      case 'failed':
        return t.paymentNotCompleted;
      default:
        return t.defaultError;
    }
  };

  const handleTryAgain = () => {
    if (user?.role === 'student') {
      navigate('/student/subscription');
    } else if (user?.role === 'client') {
      navigate('/client/packages');
    } else {
      navigate('/');
    }
  };

  const handleContactSupport = () => {
    // You can implement support contact functionality here
    window.location.href = 'mailto:support@freshlancer.com?subject=Payment Issue';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="max-w-md w-full">
        <div className="text-center space-y-6 py-8">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              {t.paymentFailed}
            </h1>
            <p className="text-gray-600">
              {getErrorMessage()}
            </p>
          </div>

          {/* Error Details */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm text-left space-y-2">
              <p className="font-medium text-gray-900">
                {t.commonReasons}
              </p>
              <ul className="space-y-1 text-gray-600">
                <li>• {t.insufficientFunds}</li>
                <li>• {t.incorrectCardDetails}</li>
                <li>• {t.cardDeclined}</li>
                <li>• {t.networkIssues}</li>
                <li>• {t.paymentCanceled}</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              variant="primary"
              className="w-full"
              onClick={handleTryAgain}
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              {t.tryAgain}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleContactSupport}
            >
              {t.contactSupport}
            </Button>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t.goBack}
            </Button>
          </div>

          {/* Support Info */}
          {error && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                {t.errorCode} {error}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {t.includeCodeSupport}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PaymentFailed;
