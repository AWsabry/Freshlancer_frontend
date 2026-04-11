// Common error message translations
const errorTranslations = {
  en: {
    // Generic errors
    'network error': 'Network error: Please check your internet connection and try again.',
    'timeout': 'Request timed out. Please try again.',
    'unauthorized': 'You are not authorized to perform this action.',
    'forbidden': 'You do not have permission to perform this action.',
    'not found': 'The requested resource was not found.',
    'server error': 'Server error occurred. Please try again later or contact support.',
    'bad request': 'Invalid request. Please check your input and try again.',
    'validation error': 'Validation error. Please check all fields and try again.',
    
    // Application errors
    'already applied': 'You have already applied for this job.',
    'application limit reached': 'You have reached your monthly application limit.',
    'must be verified': 'You must be verified as a student to apply for jobs. Please submit your verification documents from your profile page and wait for admin approval.',
    'verification required': 'You must be verified as a student to apply for jobs. Please submit your verification documents from your profile page and wait for admin approval.',
    
    // Payment errors
    'payment failed': 'Payment failed. Please try again.',
    'insufficient funds': 'Insufficient funds in your account.',
    'card declined': 'Card declined by your bank.',
    'invalid card': 'Invalid card details.',
    
    // Authentication errors
    'invalid credentials': 'Invalid email or password.',
    'email not verified': 'Please verify your email address before logging in.',
    'account suspended': 'Your account has been suspended. Please contact support.',
    'account deleted': 'This account has been deleted.',
    
    // Default
    'unknown error': 'An unexpected error occurred. Please try again or contact support.',
  },
  it: {
    // Generic errors
    'network error': 'Errore di rete: Controlla la tua connessione internet e riprova.',
    'timeout': 'Richiesta scaduta. Riprova.',
    'unauthorized': 'Non sei autorizzato a eseguire questa azione.',
    'forbidden': 'Non hai il permesso di eseguire questa azione.',
    'not found': 'La risorsa richiesta non è stata trovata.',
    'server error': 'Si è verificato un errore del server. Riprova più tardi o contatta il supporto.',
    'bad request': 'Richiesta non valida. Controlla i tuoi input e riprova.',
    'validation error': 'Errore di validazione. Controlla tutti i campi e riprova.',
    
    // Application errors
    'already applied': 'Hai già fatto domanda per questo lavoro.',
    'application limit reached': 'Hai raggiunto il limite mensile di candidature.',
    'must be verified': 'Devi essere verificato come studente per candidarti per i lavori. Invia i tuoi documenti di verifica dalla pagina del profilo e attendi l\'approvazione dell\'amministratore.',
    'verification required': 'Devi essere verificato come studente per candidarti per i lavori. Invia i tuoi documenti di verifica dalla pagina del profilo e attendi l\'approvazione dell\'amministratore.',
    
    // Payment errors
    'payment failed': 'Pagamento fallito. Riprova.',
    'insufficient funds': 'Fondi insufficienti nel tuo account.',
    'card declined': 'Carta rifiutata dalla tua banca.',
    'invalid card': 'Dettagli carta non validi.',
    
    // Authentication errors
    'invalid credentials': 'Email o password non valide.',
    'email not verified': 'Verifica il tuo indirizzo email prima di accedere.',
    'account suspended': 'Il tuo account è stato sospeso. Contatta il supporto.',
    'account deleted': 'Questo account è stato eliminato.',
    
    // Default
    'unknown error': 'Si è verificato un errore imprevisto. Riprova o contatta il supporto.',
  },
};

/**
 * Translates an error message to the user's language
 * @param {string} errorMessage - The error message to translate
 * @param {string} language - The target language ('en' or 'it')
 * @param {object} customTranslations - Optional custom translations object
 * @returns {string} - The translated error message
 */
export const translateError = (errorMessage, language = 'en', customTranslations = {}) => {
  if (!errorMessage || typeof errorMessage !== 'string') {
    return errorTranslations[language]?.['unknown error'] || errorTranslations.en['unknown error'];
  }

  const lang = language === 'it' ? 'it' : 'en';
  const translations = { ...errorTranslations[lang], ...customTranslations };
  
  // Convert error message to lowercase for matching
  const lowerMessage = errorMessage.toLowerCase();
  
  // Try to find a matching translation
  for (const [key, translation] of Object.entries(translations)) {
    if (lowerMessage.includes(key.toLowerCase())) {
      return translation;
    }
  }
  
  // If no match found, return the original message
  // (it might already be translated or be a specific error)
  return errorMessage;
};

export default translateError;

