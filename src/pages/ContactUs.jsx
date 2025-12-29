import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { contactService } from '../services/contactService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Alert from '../components/common/Alert';
import {
  Mail,
  Phone,
  Send,
  MessageCircle,
  ExternalLink,
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
  },
};

const ContactUs = () => {
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

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    </div>
  );
};

export default ContactUs;

