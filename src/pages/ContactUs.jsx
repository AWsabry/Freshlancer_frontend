import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { contactService } from '../services/contactService';
import { grantingService } from '../services/grantingService';
import { getPaymobPublicKey } from '../config/paymob';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Alert from '../components/common/Alert';
import {
  Mail,
  Phone,
  Send,
  MessageCircle,
  ExternalLink,
  Heart,
  DollarSign,
  Info,
  ArrowRight,
} from 'lucide-react';

const translations = {
  en: {
    heading: 'Contact Us',
    subheading: 'We\'re here to help! Get in touch with us through any of the methods below.',
    getInTouch: 'Get in Touch',
    email: 'Email',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    contactForm: 'Send us a Message',
    name: 'Name',
    subject: 'Subject',
    message: 'Message',
    submit: 'Send Message',
    sending: 'Sending...',
    success: 'Thank you for contacting us! We will get back to you soon.',
    error: 'Failed to send message. Please try again.',
    required: 'This field is required',
    openWhatsApp: 'Open WhatsApp',
    openTelegram: 'Open Telegram',
    sendEmail: 'Send Email',
    supportUs: 'Support Us',
    supportStudents: 'Support Us in Supporting Students',
    supportDescription: 'Your contribution helps us support students and grow the Freshlancer platform. Every donation makes a difference!',
    amount: 'Amount',
    currency: 'Currency',
    optionalMessage: 'Optional Message',
    supportNow: 'Support Now',
    processing: 'Processing...',
    supportSuccess: 'Thank you for your support! Redirecting to payment in 3 seconds...',
    supportError: 'Failed to create support request. Please try again.',
    invalidPaymentUrl: 'Invalid payment URL. Please contact support.',
    minAmount: 'Minimum amount is 1',
    minAmountEGP: 'Minimum amount for EGP is 100 EGP',
    enterAmount: 'Please enter an amount',
    learnMore: 'Learn more about why we need your support',
    whySupport: 'Why We Need Your Support',
    processingFeeNote: 'Note: A 3% processing fee will be added to your donation amount (EGP). USD payments use PayPal with a 2.9% + $0.30 fee.',
  },
  it: {
    heading: 'Contattaci',
    subheading: 'Siamo qui per aiutarti! Contattaci tramite uno dei metodi qui sotto.',
    getInTouch: 'Contattaci',
    email: 'Email',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    contactForm: 'Inviaci un Messaggio',
    name: 'Nome',
    subject: 'Oggetto',
    message: 'Messaggio',
    submit: 'Invia Messaggio',
    sending: 'Invio in corso...',
    success: 'Grazie per averci contattato! Ti risponderemo presto.',
    error: 'Invio del messaggio fallito. Riprova.',
    required: 'Questo campo è obbligatorio',
    openWhatsApp: 'Apri WhatsApp',
    openTelegram: 'Apri Telegram',
    sendEmail: 'Invia Email',
    supportUs: 'Supportaci',
    supportStudents: 'Supportaci nel Supportare gli Studenti',
    supportDescription: 'Il tuo contributo ci aiuta a supportare gli studenti e far crescere la piattaforma Freshlancer. Ogni donazione fa la differenza!',
    amount: 'Importo',
    currency: 'Valuta',
    optionalMessage: 'Messaggio Opzionale',
    supportNow: 'Supporta Ora',
    processing: 'Elaborazione...',
    supportSuccess: 'Grazie per il tuo supporto! Reindirizzamento al pagamento tra 3 secondi...',
    supportError: 'Creazione della richiesta di supporto fallita. Riprova.',
    invalidPaymentUrl: 'URL di pagamento non valido. Contatta il supporto.',
    minAmount: 'L\'importo minimo è 1',
    minAmountEGP: 'L\'importo minimo per EGP è 100 EGP',
    enterAmount: 'Inserisci un importo',
    learnMore: 'Scopri di più sul perché abbiamo bisogno del tuo supporto',
    whySupport: 'Perché Abbiamo Bisogno del Tuo Supporto',
    processingFeeNote: 'Nota: EGP: commissione 3%. I pagamenti in USD usano PayPal (2,9% + 0,30 USD).',
  },
};

const ContactUs = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('dashboardLanguage') || 'en';
  });

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: '',
  });

  const [supportData, setSupportData] = useState({
    amount: '',
    currency: 'EGP',
    message: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [supportError, setSupportError] = useState('');
  const [supportSuccess, setSupportSuccess] = useState('');
  const [isProcessingSupport, setIsProcessingSupport] = useState(false);

  // Listen for language changes
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await contactService.createContact(formData);
      setSuccess(t.success);
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        subject: '',
        message: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || t.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validate Paymob payment URL
  const isValidPaymobUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    
    try {
      const urlObj = new URL(url);
      // Check if it's a Paymob domain
      const isValidDomain = urlObj.hostname === 'accept.paymob.com' || 
                           urlObj.hostname.includes('paymob.com');
      
      // Check if it has the required parameters for unified checkout
      const hasPublicKey = urlObj.searchParams.has('publicKey');
      const hasClientSecret = urlObj.searchParams.has('clientSecret');
      
      // Valid Paymob URL should have either:
      // 1. Both publicKey and clientSecret (unified checkout)
      // 2. Or be a valid Paymob payment page URL
      return isValidDomain && (hasPublicKey || hasClientSecret || urlObj.pathname.includes('/payment') || urlObj.pathname.includes('/unifiedcheckout'));
    } catch (error) {
      // Invalid URL format
      return false;
    }
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    setSupportError('');
    setSupportSuccess('');
    setIsProcessingSupport(true);

    try {
      const amount = parseFloat(supportData.amount);
      
      if (!supportData.amount || isNaN(amount)) {
        setSupportError(t.enterAmount);
        setIsProcessingSupport(false);
        return;
      }

      // Validate minimum amount based on currency
      if (supportData.currency === 'EGP' && amount < 100) {
        setSupportError(t.minAmountEGP);
        setIsProcessingSupport(false);
        return;
      } else if (supportData.currency === 'USD' && amount < 1) {
        setSupportError(t.minAmount);
        setIsProcessingSupport(false);
        return;
      }

      // Create granting (send origin so redirect after PayPal goes back to this app, e.g. localhost)
      const response = await grantingService.createGranting({
        amount,
        currency: supportData.currency,
        message: supportData.message || '',
        redirectBaseUrl: window.location.origin,
      });

      // API may return { data: { granting, gateway, approvalUrl } } or interceptor may flatten
      const data = response?.data ?? response;
      const payload = data?.data ?? data;
      const gateway = payload?.gateway ?? data?.gateway;
      const approvalUrl = payload?.approvalUrl ?? data?.approvalUrl;

      // USD: PayPal – redirect to approval URL
      if (gateway === 'paypal' && approvalUrl) {
        setSupportSuccess(t.supportSuccess);
        setTimeout(() => {
          window.location.href = approvalUrl;
        }, 1500);
        setIsProcessingSupport(false);
        return;
      }

      // EGP: Paymob – paymentUrl or clientSecret
      const granting = payload?.granting ?? data?.granting ?? response?.granting;
      let paymentUrl = granting?.paymentUrl;
      const clientSecret = granting?.clientSecret;

      if (!paymentUrl && clientSecret) {
        const publicKey = getPaymobPublicKey();
        paymentUrl = publicKey
          ? `https://accept.paymob.com/unifiedcheckout/?publicKey=${encodeURIComponent(publicKey)}&clientSecret=${encodeURIComponent(clientSecret)}`
          : '';
      }

      if (!paymentUrl || !isValidPaymobUrl(paymentUrl)) {
        console.error('Invalid or missing Paymob payment URL:', paymentUrl);
        setSupportError(t.invalidPaymentUrl || 'Invalid payment URL. Please contact support.');
        setIsProcessingSupport(false);
        return;
      }

      setSupportSuccess(t.supportSuccess);
      setTimeout(() => {
        window.location.href = paymentUrl;
      }, 3000);

    } catch (err) {
      console.error('Error creating granting:', err.response?.data || err);
      setSupportError(err.response?.data?.message || t.supportError);
      setIsProcessingSupport(false);
    }
  };

  const whatsappLink = 'https://wa.me/201553359431';
  const telegramLink = 'https://t.me/freshlancer'; // Update with actual Telegram link if available
  const emailAddress = 'support@freshlancer.online';

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {t.heading}
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          {t.subheading}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Contact Information */}
        <Card>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
            {t.getInTouch}
          </h2>
          <div className="space-y-6">
            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#065084] rounded-lg flex items-center justify-center text-white flex-shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{t.email}</h3>
                <a
                  href={`mailto:${emailAddress}`}
                  className="text-[#065084] hover:underline flex items-center gap-2"
                >
                  {emailAddress}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{t.whatsapp}</h3>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#065084] hover:underline flex items-center gap-2"
                >
                  +20 155 335 9431
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Telegram */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                <Send className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{t.telegram}</h3>
                <a
                  href={telegramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#065084] hover:underline flex items-center gap-2"
                >
                  @freshlancer
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </Card>

        {/* Contact Form */}
        <Card>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
            {t.contactForm}
          </h2>
          {error && (
            <Alert
              type="error"
              message={error}
              className="mb-4"
              onClose={() => setError('')}
            />
          )}
          {success && (
            <Alert
              type="success"
              message={success}
              className="mb-4"
              onClose={() => setSuccess('')}
            />
          )}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                {t.name} <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t.name}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t.email} <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t.email}
              />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                {t.subject} <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder={t.subject}
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                {t.message} <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065084] focus:border-transparent resize-none"
                placeholder={t.message}
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? t.sending : t.submit}
            </Button>
          </form>
        </Card>
      </div>

      {/* Support Us Section */}
      <div className="mt-8 sm:mt-12">
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {t.supportUs}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {t.supportStudents}
              </p>
            </div>
          </div>
          
          <p className="text-gray-700 mb-4">
            {t.supportDescription}
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                {t.processingFeeNote}
              </p>
              <p className="text-sm text-blue-800 mt-1">
                {supportData.currency === 'USD' ? (language === 'it' ? 'Pagamento sicuro tramite PayPal.' : 'Secure payment via PayPal.') : (language === 'it' ? 'Pagamento tramite Paymob.' : 'Payment via Paymob.')}
              </p>
            </div>
          </div>
          
          <Link
            to={user?.role === 'student' ? '/student/why-support' : '/client/why-support'}
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm sm:text-base mb-6 transition-colors"
          >
            <Info className="w-4 h-4 sm:w-5 sm:h-5" />
            {t.learnMore}
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>

          {supportError && (
            <Alert
              type="error"
              message={supportError}
              className="mb-4"
              onClose={() => setSupportError('')}
            />
          )}
          {supportSuccess && (
            <Alert
              type="success"
              message={supportSuccess}
              className="mb-4"
              onClose={() => setSupportSuccess('')}
            />
          )}

          <form onSubmit={handleSupportSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.amount} <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  id="amount"
                  name="amount"
                  required
                  min={supportData.currency === 'EGP' ? '100' : '1'}
                  step="0.01"
                  value={supportData.amount}
                  onChange={(e) => setSupportData({ ...supportData, amount: e.target.value })}
                  placeholder={supportData.currency === 'EGP' ? '100.00' : '1.00'}
                />
                {supportData.currency === 'EGP' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum: 100 EGP
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.currency} <span className="text-red-500">*</span>
                </label>
                <Select
                  id="currency"
                  name="currency"
                  value={supportData.currency}
                  onChange={(e) => setSupportData({ ...supportData, currency: e.target.value })}
                  options={[
                    { value: 'EGP', label: 'EGP (Egyptian Pound)' },
                    { value: 'USD', label: 'USD (US Dollar)' },
                  ]}
                />
              </div>
            </div>
            <div>
              <label htmlFor="supportMessage" className="block text-sm font-medium text-gray-700 mb-2">
                {t.optionalMessage}
              </label>
              <textarea
                id="supportMessage"
                name="supportMessage"
                rows={4}
                value={supportData.message}
                onChange={(e) => setSupportData({ ...supportData, message: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065084] focus:border-transparent resize-none"
                placeholder={t.optionalMessage}
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              disabled={isProcessingSupport}
              className="w-full"
            >
              <Heart className="w-4 h-4 mr-2" />
              {isProcessingSupport ? t.processing : t.supportNow}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ContactUs;

