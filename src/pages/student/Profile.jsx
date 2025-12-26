import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import Cropper from 'react-easy-crop';
import { authService } from '../../services/authService';
import { verificationService } from '../../services/verificationService';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import TagInput from '../../components/common/TagInput';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Globe,
  Briefcase,
  Award,
  BookOpen,
  Code,
  Link as LinkIcon,
  FileText,
  Languages,
  DollarSign,
  CheckCircle,
  Clock,
  Edit,
  Save,
  Upload,
  Trash2,
  GraduationCap,
  Shield,
  AlertCircle,
  XCircle,
  RefreshCw,
  Check,
  X,
} from 'lucide-react';
import { API_BASE_URL } from '../../config/env';

const translations = {
  en: {
    loading: 'Loading profile...',
    failedToLoad: 'Failed to load profile data',
    refreshVerification: 'Refresh verification status',
    profileUpdated: 'Profile updated successfully!',
    updateFailed: 'Failed to update profile. Please check your input and try again.',
    resumeUploaded: 'Resume uploaded successfully!',
    resumeUploadFailed: 'Failed to upload resume',
    resumeDeleted: 'Resume deleted successfully!',
    resumeDeleteFailed: 'Failed to delete resume',
    deleteResumeConfirm: 'Are you sure you want to delete your resume?',
    documentUploaded: 'Document uploaded successfully!',
    documentUploadFailed: 'Failed to upload document',
    documentDeleted: 'Document deleted successfully!',
    documentDeleteFailed: 'Failed to delete document',
    deleteDocumentConfirm: 'Are you sure you want to delete this document?',
    verificationSubmitted: 'Verification document submitted successfully! Our team will review it within 24-48 hours.',
    verificationFailed: 'Failed to submit verification document. Please try again.',
    selectDocument: 'Please select a document to upload',
    invalidFileType: 'Please upload a PDF, DOC, or DOCX file',
    fileSizeTooLarge: 'File size must be less than 5MB',
    verificationFileSizeTooLarge: 'File size must be less than 10MB',
    editProfile: 'Edit Profile',
    personalInformation: 'Personal Information',
    fullName: 'Full Name',
    nameRequired: 'Name is required',
    enterFullName: 'Enter your full name',
    phone: 'Phone',
    enterPhone: 'Enter your phone number',
    age: 'Age',
    ageMin: 'Must be at least 16 years old',
    ageMax: 'Invalid age',
    enterAge: 'Enter your age',
    yearsOld: 'years old',
    nationality: 'Nationality',
    nationalityCannotChange: 'Nationality cannot be changed after registration',
    location: 'Location',
    countryOfStudy: 'Country of Study',
    countryCannotChange: 'Country of study cannot be changed after registration',
    city: 'City',
    enterCity: 'Enter your city',
    timezone: 'Timezone',
    timezonePlaceholder: 'e.g., UTC+3, EST',
    professionalInformation: 'Professional Information',
    university: 'University',
    universityPlaceholder: 'University of...',
    universityWebsite: 'University Website (Optional)',
    universityWebsitePlaceholder: 'https://university.edu',
    invalidUrl: 'Please enter a valid URL starting with http:// or https://',
    bio: 'Bio',
    bioPlaceholder: 'Tell us about yourself, your expertise, and what you\'re passionate about...',
    experienceLevel: 'Experience Level',
    experienceLevelRequired: 'Experience level is required',
    selectExperienceLevel: 'Select experience level...',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    expert: 'Expert',
    yearsOfExperience: 'Years of Experience',
    cannotBeNegative: 'Cannot be negative',
    invalidYears: 'Invalid years',
    availability: 'Availability',
    available: 'Available',
    busy: 'Busy',
    currency: 'Currency',
    selectCurrency: 'Select currency',
    currencyAutoSet: 'Currency (Auto-set based on country)',
    currencyAutoSetInfo: 'Currency is automatically set based on your selected country',
    selectCountryFirst: 'Select country first',
    hourlyRateMin: 'Hourly Rate (Min)',
    hourlyRateMax: 'Hourly Rate (Max)',
    minimumRate: 'Minimum rate',
    maximumRate: 'Maximum rate',
    socialLinks: 'Social Links',
    github: 'GitHub',
    githubPlaceholder: 'https://github.com/username',
    linkedin: 'LinkedIn',
    linkedinPlaceholder: 'https://linkedin.com/in/username',
    personalWebsite: 'Personal Website',
    websitePlaceholder: 'https://yourwebsite.com',
    behance: 'Behance',
    behancePlaceholder: 'https://behance.net/username',
    telegram: 'Telegram (Optional)',
    telegramPlaceholder: 'https://t.me/username',
    whatsapp: 'WhatsApp (Optional)',
    whatsappPlaceholder: 'https://wa.me/1234567890',
    cancel: 'Cancel',
    saveChanges: 'Save Changes',
    name: 'Name',
    email: 'Email',
    gender: 'Gender',
    locationLabel: 'Location',
    personalDetails: 'Personal Information',
    professionalDetails: 'Professional Details',
    major: 'Major',
    graduationYear: 'Graduation Year',
    experienceLevelLabel: 'Experience Level',
    hourlyRate: 'Hourly Rate',
    skillsExpertise: 'Skills & Expertise',
    addSkills: 'Add your skills (e.g., JavaScript, Python, Design)',
    skillsInfo: 'Add your skills as tags. Press Enter or comma to add each skill.',
    education: 'Education',
    visitUniversity: 'Visit university website',
    languages: 'Languages',
    certifications: 'Certifications',
    credentialId: 'ID:',
    expired: 'Expired',
    viewCredential: 'View Credential',
    portfolio: 'Portfolio',
    viewProject: 'View Project',
    technologies: 'Technologies:',
    socialLinksTitle: 'Social Links',
    studentVerification: 'Student Verification',
    loadingVerification: 'Loading verification status...',
    verificationLoadFailed: 'Failed to load verification status. Please refresh the page.',
    verificationComplete: 'Verification Complete',
    verificationCompleteMessage: 'Your student status has been verified. You can now apply for jobs!',
    approved: 'Approved',
    approvedOn: 'Approved:',
    verificationPending: 'Verification Pending',
    verificationPendingMessage: 'Your verification is being reviewed by our admin team. This usually takes 24-48 hours.',
    pendingReview: 'Pending Review',
    submitted: 'Submitted:',
    verificationRequired: 'Verification Required',
    verificationRequiredMessage: 'Please submit your student verification documents to start applying for jobs.',
    completeVerification: 'Complete Verification',
    documentType: 'Document Type',
    documentTypeRequired: 'Document type is required',
    studentIdCard: 'Student ID Card',
    enrollmentCertificate: 'Enrollment Certificate',
    officialTranscript: 'Official Transcript',
    other: 'Other',
    institutionName: 'Institution Name',
    institutionNameRequired: 'Institution name is required',
    institutionPlaceholder: 'University of...',
    studentIdNumber: 'Student ID Number',
    studentIdRequired: 'Student ID is required',
    studentIdPlaceholder: '123456789',
    enrollmentYear: 'Enrollment Year',
    enrollmentYearRequired: 'Enrollment year is required',
    validYear: 'Please enter a valid year',
    cannotBeFuture: 'Cannot be in the future',
    enrollmentYearPlaceholder: '2020',
    expectedGraduationYear: 'Expected Graduation Year',
    graduationYearRequired: 'Graduation year is required',
    validFutureYear: 'Please enter a valid future year',
    graduationYearPlaceholder: '2025',
    uploadDocument: 'Upload Document',
    uploadFile: 'Upload a file',
    dragAndDrop: 'or drag and drop',
    fileFormats: 'PDF, JPG, PNG up to 10MB',
    selected: 'Selected:',
    submitForVerification: 'Submit for Verification',
    verificationHistory: 'Verification History',
    rejected: 'Rejected',
    rejectionReason: 'Rejection reason:',
    resumeCv: 'Resume / CV',
    uploaded: 'Uploaded:',
    download: 'Download',
    replaceResume: 'Replace Resume',
    noResumeUploaded: 'No resume uploaded yet',
    uploadResume: 'Upload Resume',
    changePhoto: 'Change Photo',
    uploadPhoto: 'Upload Photo',
    photoUploaded: 'Photo uploaded successfully!',
    photoUploadFailed: 'Failed to upload photo',
    selectPhoto: 'Select a photo',
    photoSupportedFormats: 'Supported formats: JPG, PNG, GIF, WEBP (Max 5MB)',
    cropPhoto: 'Crop Photo',
    cropPhotoDescription: 'Adjust the image to your desired size and position',
    saveCrop: 'Save & Upload',
    supportedFormats: 'Supported formats: PDF, DOC, DOCX (Max 5MB)',
    additionalDocuments: 'Additional Documents (Optional)',
    documentDescription: 'Document Description (Optional)',
    documentDescriptionPlaceholder: 'e.g., Portfolio, Certificates, References',
    uploading: 'Uploading...',
    uploadDocumentButton: 'Upload Document',
    supportedFormatsAdditional: 'Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)',
    view: 'View',
    noAdditionalDocuments: 'No additional documents uploaded yet',
    verified: 'Verified',
    unverified: 'Unverified',
    pending: 'Pending',
    na: 'N/A',
    emailVerified: 'Email Verified',
    memberSince: 'Member Since',
    expectedGraduation: 'Expected Graduation',
    years: 'years',
    noSkillsAdded: 'No skills added yet. Start typing and press Enter to add skills.',
    expires: 'Expires',
    completed: 'Completed',
    verificationDocument: 'Verification Document',
  },
  it: {
    loading: 'Caricamento profilo...',
    failedToLoad: 'Impossibile caricare i dati del profilo',
    refreshVerification: 'Aggiorna stato verifica',
    profileUpdated: 'Profilo aggiornato con successo!',
    updateFailed: 'Aggiornamento profilo fallito. Controlla i tuoi dati e riprova.',
    resumeUploaded: 'CV caricato con successo!',
    resumeUploadFailed: 'Caricamento CV fallito',
    resumeDeleted: 'CV eliminato con successo!',
    resumeDeleteFailed: 'Eliminazione CV fallita',
    deleteResumeConfirm: 'Sei sicuro di voler eliminare il tuo CV?',
    documentUploaded: 'Documento caricato con successo!',
    documentUploadFailed: 'Caricamento documento fallito',
    documentDeleted: 'Documento eliminato con successo!',
    documentDeleteFailed: 'Eliminazione documento fallita',
    deleteDocumentConfirm: 'Sei sicuro di voler eliminare questo documento?',
    verificationSubmitted: 'Documento di verifica inviato con successo! Il nostro team lo esaminerà entro 24-48 ore.',
    verificationFailed: 'Invio documento di verifica fallito. Riprova.',
    selectDocument: 'Seleziona un documento da caricare',
    invalidFileType: 'Carica un file PDF, DOC o DOCX',
    fileSizeTooLarge: 'La dimensione del file deve essere inferiore a 5MB',
    verificationFileSizeTooLarge: 'La dimensione del file deve essere inferiore a 10MB',
    editProfile: 'Modifica Profilo',
    personalInformation: 'Informazioni Personali',
    fullName: 'Nome Completo',
    nameRequired: 'Il nome è obbligatorio',
    enterFullName: 'Inserisci il tuo nome completo',
    phone: 'Telefono',
    enterPhone: 'Inserisci il tuo numero di telefono',
    age: 'Età',
    ageMin: 'Devi avere almeno 16 anni',
    ageMax: 'Età non valida',
    enterAge: 'Inserisci la tua età',
    yearsOld: 'anni',
    nationality: 'Nazionalità',
    nationalityCannotChange: 'La nazionalità non può essere modificata dopo la registrazione',
    location: 'Posizione',
    countryOfStudy: 'Paese di Studio',
    countryCannotChange: 'Il paese di studio non può essere modificato dopo la registrazione',
    city: 'Città',
    enterCity: 'Inserisci la tua città',
    timezone: 'Fuso Orario',
    timezonePlaceholder: 'es. UTC+3, EST',
    professionalInformation: 'Informazioni Professionali',
    university: 'Università',
    universityPlaceholder: 'Università di...',
    universityWebsite: 'Sito Web Università (Opzionale)',
    universityWebsitePlaceholder: 'https://university.edu',
    invalidUrl: 'Inserisci un URL valido che inizi con http:// o https://',
    bio: 'Biografia',
    bioPlaceholder: 'Raccontaci di te, le tue competenze e le tue passioni...',
    experienceLevel: 'Livello di Esperienza',
    experienceLevelRequired: 'Il livello di esperienza è obbligatorio',
    selectExperienceLevel: 'Seleziona livello di esperienza...',
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzato',
    expert: 'Esperto',
    yearsOfExperience: 'Anni di Esperienza',
    cannotBeNegative: 'Non può essere negativo',
    invalidYears: 'Anni non validi',
    availability: 'Disponibilità',
    available: 'Disponibile',
    busy: 'Occupato',
    currency: 'Valuta',
    selectCurrency: 'Seleziona valuta',
    currencyAutoSet: 'Valuta (Impostata automaticamente in base al paese)',
    currencyAutoSetInfo: 'La valuta viene impostata automaticamente in base al paese selezionato',
    selectCountryFirst: 'Seleziona prima il paese',
    hourlyRateMin: 'Tariffa Oraria (Min)',
    hourlyRateMax: 'Tariffa Oraria (Max)',
    minimumRate: 'Tariffa minima',
    maximumRate: 'Tariffa massima',
    socialLinks: 'Link Social',
    github: 'GitHub',
    githubPlaceholder: 'https://github.com/username',
    linkedin: 'LinkedIn',
    linkedinPlaceholder: 'https://linkedin.com/in/username',
    personalWebsite: 'Sito Web Personale',
    websitePlaceholder: 'https://yourwebsite.com',
    behance: 'Behance',
    behancePlaceholder: 'https://behance.net/username',
    telegram: 'Telegram (Opzionale)',
    telegramPlaceholder: 'https://t.me/username',
    whatsapp: 'WhatsApp (Opzionale)',
    whatsappPlaceholder: 'https://wa.me/1234567890',
    cancel: 'Annulla',
    saveChanges: 'Salva Modifiche',
    name: 'Nome',
    email: 'Email',
    gender: 'Genere',
    locationLabel: 'Posizione',
    personalDetails: 'Informazioni Personali',
    professionalDetails: 'Dettagli Professionali',
    major: 'Indirizzo di Studio',
    graduationYear: 'Anno di Laurea',
    experienceLevelLabel: 'Livello di Esperienza',
    hourlyRate: 'Tariffa Oraria',
    skillsExpertise: 'Competenze ed Esperienza',
    addSkills: 'Aggiungi le tue competenze (es. JavaScript, Python, Design)',
    skillsInfo: 'Aggiungi le tue competenze come tag. Premi Invio o virgola per aggiungere ogni competenza.',
    education: 'Istruzione',
    visitUniversity: 'Visita il sito web dell\'università',
    languages: 'Lingue',
    certifications: 'Certificazioni',
    credentialId: 'ID:',
    expired: 'Scaduto',
    viewCredential: 'Visualizza Credenziale',
    portfolio: 'Portfolio',
    viewProject: 'Visualizza Progetto',
    technologies: 'Tecnologie:',
    socialLinksTitle: 'Link Social',
    studentVerification: 'Verifica Studente',
    loadingVerification: 'Caricamento stato verifica...',
    verificationLoadFailed: 'Impossibile caricare lo stato di verifica. Ricarica la pagina.',
    verificationComplete: 'Verifica Completata',
    verificationCompleteMessage: 'Il tuo stato di studente è stato verificato. Ora puoi candidarti per i lavori!',
    approved: 'Approvato',
    approvedOn: 'Approvato il:',
    verificationPending: 'Verifica in Attesa',
    verificationPendingMessage: 'La tua verifica è in fase di revisione dal nostro team amministrativo. Di solito richiede 24-48 ore.',
    pendingReview: 'In Attesa di Revisione',
    submitted: 'Inviato il:',
    verificationRequired: 'Verifica Richiesta',
    verificationRequiredMessage: 'Invia i tuoi documenti di verifica studente per iniziare a candidarti per i lavori.',
    completeVerification: 'Completa Verifica',
    documentType: 'Tipo di Documento',
    documentTypeRequired: 'Il tipo di documento è obbligatorio',
    studentIdCard: 'Carta d\'Identità Studente',
    enrollmentCertificate: 'Certificato di Iscrizione',
    officialTranscript: 'Trascrizione Ufficiale',
    other: 'Altro',
    institutionName: 'Nome Istituzione',
    institutionNameRequired: 'Il nome dell\'istituzione è obbligatorio',
    institutionPlaceholder: 'Università di...',
    studentIdNumber: 'Numero ID Studente',
    studentIdRequired: 'L\'ID studente è obbligatorio',
    studentIdPlaceholder: '123456789',
    enrollmentYear: 'Anno di Iscrizione',
    enrollmentYearRequired: 'L\'anno di iscrizione è obbligatorio',
    validYear: 'Inserisci un anno valido',
    cannotBeFuture: 'Non può essere nel futuro',
    enrollmentYearPlaceholder: '2020',
    expectedGraduationYear: 'Anno di Laurea Previsto',
    graduationYearRequired: 'L\'anno di laurea è obbligatorio',
    validFutureYear: 'Inserisci un anno futuro valido',
    graduationYearPlaceholder: '2025',
    uploadDocument: 'Carica Documento',
    uploadFile: 'Carica un file',
    dragAndDrop: 'o trascina e rilascia',
    fileFormats: 'PDF, JPG, PNG fino a 10MB',
    selected: 'Selezionato:',
    submitForVerification: 'Invia per Verifica',
    verificationHistory: 'Cronologia Verifiche',
    rejected: 'Rifiutato',
    rejectionReason: 'Motivo del rifiuto:',
    resumeCv: 'CV / Curriculum',
    uploaded: 'Caricato il:',
    download: 'Scarica',
    replaceResume: 'Sostituisci CV',
    changePhoto: 'Cambia Foto',
    uploadPhoto: 'Carica Foto',
    photoUploaded: 'Foto caricata con successo!',
    photoUploadFailed: 'Impossibile caricare la foto',
    selectPhoto: 'Seleziona una foto',
    photoSupportedFormats: 'Formati supportati: JPG, PNG, GIF, WEBP (Max 5MB)',
    cropPhoto: 'Ritaglia Foto',
    cropPhotoDescription: 'Regola l\'immagine alla dimensione e posizione desiderate',
    saveCrop: 'Salva e Carica',
    noResumeUploaded: 'Nessun CV caricato ancora',
    uploadResume: 'Carica CV',
    supportedFormats: 'Formati supportati: PDF, DOC, DOCX (Max 5MB)',
    additionalDocuments: 'Documenti Aggiuntivi (Opzionale)',
    documentDescription: 'Descrizione Documento (Opzionale)',
    documentDescriptionPlaceholder: 'es. Portfolio, Certificati, Referenze',
    uploading: 'Caricamento...',
    uploadDocumentButton: 'Carica Documento',
    supportedFormatsAdditional: 'Formati supportati: PDF, DOC, DOCX, JPG, PNG (Max 10MB)',
    view: 'Visualizza',
    noAdditionalDocuments: 'Nessun documento aggiuntivo caricato ancora',
    verified: 'Verificato',
    unverified: 'Non Verificato',
    pending: 'In Attesa',
    na: 'N/D',
    emailVerified: 'Email Verificata',
    memberSince: 'Membro dal',
    expectedGraduation: 'Laurea Prevista',
    years: 'anni',
    noSkillsAdded: 'Nessuna competenza aggiunta ancora. Inizia a digitare e premi Invio per aggiungere competenze.',
    expires: 'Scade',
    completed: 'Completato',
    verificationDocument: 'Documento di Verifica',
  },
};

// Country to Currency mapping
const COUNTRY_CURRENCY_MAP = {
  // Americas
  'United States': 'USD',
  'Canada': 'USD',
  'Mexico': 'USD',
  'Brazil': 'USD',
  'Argentina': 'USD',
  'Chile': 'USD',
  'Colombia': 'USD',
  'Peru': 'USD',
  'Venezuela': 'USD',
  'Ecuador': 'USD',
  'Bolivia': 'USD',
  'Paraguay': 'USD',
  'Uruguay': 'USD',
  'Costa Rica': 'USD',
  'Panama': 'USD',
  'Guatemala': 'USD',
  'Honduras': 'USD',
  'El Salvador': 'USD',
  'Nicaragua': 'USD',
  'Belize': 'USD',
  'Jamaica': 'USD',
  'Cuba': 'USD',
  'Haiti': 'USD',
  'Dominican Republic': 'USD',
  'Bahamas': 'USD',
  'Barbados': 'USD',
  'Trinidad and Tobago': 'USD',
  'Guyana': 'USD',
  'Suriname': 'USD',

  // Middle East
  'Saudi Arabia': 'SAR',
  'United Arab Emirates': 'AED',
  'Kuwait': 'KWD',
  'Qatar': 'QAR',
  'Bahrain': 'BHD',
  'Oman': 'OMR',
  'Jordan': 'JOD',
  'Lebanon': 'LBP',
  'Israel': 'ILS',
  'Palestine': 'ILS',
  'Syria': 'USD',
  'Iraq': 'USD',
  'Iran': 'USD',
  'Yemen': 'USD',

  // North Africa
  'Egypt': 'EGP',
  'Morocco': 'MAD',
  'Tunisia': 'TND',
  'Algeria': 'DZD',
  'Libya': 'USD',
  'Mauritania': 'USD',
  'Sudan': 'USD',

  // Sub-Saharan Africa
  'South Africa': 'ZAR',
  'Nigeria': 'NGN',
  'Kenya': 'KES',
  'Ghana': 'GHS',
  'Uganda': 'UGX',
  'Tanzania': 'TZS',
  'Ethiopia': 'ETB',
  'Rwanda': 'USD',
  'Senegal': 'USD',
  'Ivory Coast': 'USD',
  'Cameroon': 'USD',
  'Zimbabwe': 'USD',
  'Zambia': 'USD',
  'Mozambique': 'USD',
  'Botswana': 'USD',
  'Namibia': 'USD',
  'Angola': 'USD',
  'Congo': 'USD',
  'Mali': 'USD',
  'Burkina Faso': 'USD',
  'Benin': 'USD',
  'Togo': 'USD',
  'Malawi': 'USD',
  'Madagascar': 'USD',

  // Europe - Non-Euro
  'United Kingdom': 'GBP',
  'Switzerland': 'CHF',
  'Sweden': 'SEK',
  'Norway': 'NOK',
  'Denmark': 'DKK',
  'Poland': 'PLN',
  'Czech Republic': 'CZK',
  'Hungary': 'HUF',
  'Romania': 'RON',
  'Bulgaria': 'BGN',
  'Croatia': 'HRK',
  'Russia': 'RUB',
  'Ukraine': 'UAH',
  'Serbia': 'USD',
  'Bosnia and Herzegovina': 'USD',
  'Albania': 'USD',
  'North Macedonia': 'USD',
  'Moldova': 'USD',
  'Belarus': 'USD',
  'Iceland': 'USD',

  // Europe - Euro Zone
  'Germany': 'EUR',
  'France': 'EUR',
  'Italy': 'EUR',
  'Spain': 'EUR',
  'Netherlands': 'EUR',
  'Belgium': 'EUR',
  'Austria': 'EUR',
  'Greece': 'EUR',
  'Portugal': 'EUR',
  'Ireland': 'EUR',
  'Finland': 'EUR',
  'Slovakia': 'EUR',
  'Slovenia': 'EUR',
  'Lithuania': 'EUR',
  'Latvia': 'EUR',
  'Estonia': 'EUR',
  'Cyprus': 'EUR',
  'Malta': 'EUR',
  'Luxembourg': 'EUR',
  'Montenegro': 'EUR',
  'Kosovo': 'EUR',

  // Asia
  'Turkey': 'TRY',
  'China': 'USD',
  'Japan': 'USD',
  'South Korea': 'USD',
  'India': 'USD',
  'Pakistan': 'USD',
  'Bangladesh': 'USD',
  'Indonesia': 'USD',
  'Philippines': 'USD',
  'Vietnam': 'USD',
  'Thailand': 'USD',
  'Malaysia': 'USD',
  'Singapore': 'USD',
  'Myanmar': 'USD',
  'Cambodia': 'USD',
  'Laos': 'USD',
  'Nepal': 'USD',
  'Sri Lanka': 'USD',
  'Afghanistan': 'USD',
  'Mongolia': 'USD',
  'Kazakhstan': 'USD',
  'Uzbekistan': 'USD',
  'Turkmenistan': 'USD',
  'Kyrgyzstan': 'USD',
  'Tajikistan': 'USD',
  'Armenia': 'USD',
  'Azerbaijan': 'USD',
  'Georgia': 'USD',

  // Oceania
  'Australia': 'USD',
  'New Zealand': 'USD',
  'Fiji': 'USD',
  'Papua New Guinea': 'USD',
  'Solomon Islands': 'USD',
  'Vanuatu': 'USD',
  'Samoa': 'USD',
  'Tonga': 'USD',
};

const Profile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [formError, setFormError] = useState(null);
  const [verificationFile, setVerificationFile] = useState(null);
  const [verificationError, setVerificationError] = useState(null);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [documentDescription, setDocumentDescription] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoLoadError, setPhotoLoadError] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const fileInputRef = useRef(null);
  const verificationFileInputRef = useRef(null);
  const additionalDocumentInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('dashboardLanguage') || 'en';
  });

  // Listen for language changes from DashboardLayout
  useEffect(() => {
    const handleLanguageChange = (event) => {
      setLanguage(event.detail.language);
    };
    
    // Listen for custom language change event
    window.addEventListener('languageChanged', handleLanguageChange);
    
    // Also listen for storage events (for cross-tab updates)
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

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm();
  const { register: registerVerification, handleSubmit: handleSubmitVerification, formState: { errors: verificationErrors }, reset: resetVerification } = useForm();

  // Fetch user profile
  const { data: userData, isLoading, error: profileError } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => authService.getMe(),
    retry: 1,
    onError: (error) => {
      console.error('Error fetching user profile:', error);
    },
  });

  const user = userData?.data?.user;
  const studentProfile = user?.studentProfile;

  // Helper function to get photo URL
  const getPhotoUrl = useCallback((photo) => {
    if (!photo) return null;
    
    // If it's already a full URL (starts with http), return as is
    if (photo.startsWith('http://') || photo.startsWith('https://')) {
      return photo;
    }
    
    // If it's a relative path (starts with /), prepend API_BASE_URL
    if (photo.startsWith('/')) {
      return `${API_BASE_URL}${photo}`;
    }
    
    // Otherwise, prepend API_BASE_URL with a slash
    return `${API_BASE_URL}/${photo}`;
  }, []);

  // Check if photo exists and is valid (not default Firebase image)
  const hasValidPhoto = useCallback((photo) => {
    if (!photo || typeof photo !== 'string') {
      return false;
    }
    // Check if it's the default Firebase image
    const isDefaultPhoto = photo.includes('firebasestorage') && photo.includes('default.jpg');
    return !isDefaultPhoto;
  }, []);

  // Reset photo load error when user or photo changes
  useEffect(() => {
    setPhotoLoadError(false);
  }, [user?.photo, photoPreview]);

  // Fetch verification status and history
  const { data: verificationData, isLoading: loadingVerification, error: verificationQueryError } = useQuery({
    queryKey: ['verifications'],
    queryFn: () => verificationService.getMyVerifications(),
    retry: 1,
    onError: (error) => {
      console.error('Error fetching verifications:', error);
    },
  });

  const verifications = verificationData?.data?.verifications || [];
  const hasApprovedVerification = Array.isArray(verifications) && verifications.length > 0 && verifications.some(v => v && v.status === 'approved');
  const hasPendingVerification = Array.isArray(verifications) && verifications.length > 0 && verifications.some(v => v && v.status === 'pending');
  
  // Determine verification status - check both user profile and verification documents
  const isVerified = studentProfile?.isVerified || hasApprovedVerification;
  const verificationStatus = studentProfile?.verificationStatus || (hasApprovedVerification ? 'verified' : hasPendingVerification ? 'pending' : 'unverified');
  
  // Function to refresh verification status
  const handleRefreshVerification = () => {
    queryClient.invalidateQueries(['userProfile']);
    queryClient.invalidateQueries(['verifications']);
    queryClient.invalidateQueries(['verificationStatus']);
  };

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data) => authService.updateProfile(data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries(['userProfile']);
      // Only close modal and reset if it was opened (not for skills-only updates)
      if (showEditModal) {
        setShowEditModal(false);
        reset();
      }
      setFormError(null);
      // Only show alert if it's not a skills-only update (skills update shows no alert)
      if (variables.studentProfile && Object.keys(variables.studentProfile).length > 1 || !variables.studentProfile?.skills) {
        alert(t.profileUpdated);
      }
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          t.updateFailed;
      setFormError(errorMessage);
      console.error('Profile update error:', error);
      // Scroll to top of form to show error
      const modalContent = document.querySelector('.modal-content');
      if (modalContent) {
        modalContent.scrollTop = 0;
      }
    },
  });

  // Handle opening edit modal and populating form
  const handleOpenEditModal = () => {
    setFormError(null); // Clear any previous errors
    if (user) {
      // Set form default values
      setValue('name', user.name || '');
      setValue('phone', user.phone || '');
      setValue('age', user.age || '');
      setValue('nationality', user.nationality || '');
      // Use user.country (from registration) - country is NOT stored in location.country
      // Location only contains city (and future fields like zip, lat, long)
      setValue('location.country', user.country || '');
      setValue('location.city', user.location?.city || '');
      setValue('location.timezone', user.location?.timezone || '');

      if (studentProfile) {
        setValue('studentProfile.university', studentProfile.university || '');
        setValue('studentProfile.universityLink', studentProfile.universityLink || '');
        setValue('studentProfile.bio', studentProfile.bio || '');
        setValue('studentProfile.experienceLevel', studentProfile.experienceLevel || '');
        setValue('studentProfile.yearsOfExperience', studentProfile.yearsOfExperience || 0);
        setValue('studentProfile.availability', studentProfile.availability || 'Available');
        setValue('studentProfile.hourlyRate.min', studentProfile.hourlyRate?.min || '');
        setValue('studentProfile.hourlyRate.max', studentProfile.hourlyRate?.max || '');
        setValue('studentProfile.hourlyRate.currency', studentProfile.hourlyRate?.currency || 'USD');
        setValue('studentProfile.socialLinks.github', studentProfile.socialLinks?.github || '');
        setValue('studentProfile.socialLinks.linkedin', studentProfile.socialLinks?.linkedin || '');
        setValue('studentProfile.socialLinks.website', studentProfile.socialLinks?.website || '');
        setValue('studentProfile.socialLinks.behance', studentProfile.socialLinks?.behance || '');
        setValue('studentProfile.socialLinks.telegram', studentProfile.socialLinks?.telegram || '');
        setValue('studentProfile.socialLinks.whatsapp', studentProfile.socialLinks?.whatsapp || '');
        // Set skills - handle both array of objects and array of strings
        const skills = studentProfile.skills || [];
        setValue('studentProfile.skills', skills);
      }
    }
    setShowEditModal(true);
  };

  // Handle form submission
  const onSubmit = (data) => {
    updateProfileMutation.mutate(data);
  };

  // Upload resume mutation
  const uploadResumeMutation = useMutation({
    mutationFn: (file) => authService.uploadResume(file),
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfile']);
      setUploadingResume(false);
      alert(t.resumeUploaded);
    },
    onError: (error) => {
      setUploadingResume(false);
      alert(error.response?.data?.message || t.resumeUploadFailed);
    },
  });

  // Delete resume mutation
  const deleteResumeMutation = useMutation({
    mutationFn: () => authService.deleteResume(),
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfile']);
      alert(t.resumeDeleted);
    },
    onError: (error) => {
      alert(error.response?.data?.message || t.resumeDeleteFailed);
    },
  });

  // Upload additional document mutation
  const uploadAdditionalDocumentMutation = useMutation({
    mutationFn: ({ file, description }) => authService.uploadAdditionalDocument(file, description),
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfile']);
      setUploadingDocument(false);
      setDocumentDescription('');
      if (additionalDocumentInputRef.current) {
        additionalDocumentInputRef.current.value = '';
      }
      alert(t.documentUploaded);
    },
    onError: (error) => {
      setUploadingDocument(false);
      alert(error.response?.data?.message || t.documentUploadFailed);
    },
  });

  // Delete additional document mutation
  const deleteAdditionalDocumentMutation = useMutation({
    mutationFn: (documentIndex) => authService.deleteAdditionalDocument(documentIndex),
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfile']);
      alert(t.documentDeleted);
    },
    onError: (error) => {
      alert(error.response?.data?.message || t.documentDeleteFailed);
    },
  });

  // Upload photo mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: (file) => authService.uploadPhoto(file),
    onSuccess: async (response) => {
      setUploadingPhoto(false);
      
      // Update preview with the new photo URL from response
      // Backend returns: { status: 'success', data: { user: {...}, photo: '...' } }
      const photo = response.data?.data?.photo || response.data?.data?.user?.photo;
      if (photo) {
        const photoUrl = photo.startsWith('/uploads/') 
          ? `${API_BASE_URL}${photo}` 
          : photo;
        setPhotoPreview(photoUrl);
      }
      
      // Clear crop modal state
      setImageToCrop(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      if (photoInputRef.current) {
        photoInputRef.current.value = '';
      }
      
      // Invalidate and refetch user profile to get updated photo
      await queryClient.invalidateQueries(['userProfile']);
      await queryClient.refetchQueries(['userProfile']);
      
      // Clear preview after a short delay to show the actual uploaded photo
      setTimeout(() => {
        setPhotoPreview(null);
      }, 1000);
      
      alert(t.photoUploaded);
    },
    onError: (error) => {
      setUploadingPhoto(false);
      setPhotoPreview(null);
      console.error('Photo upload error:', error);
      alert(error.response?.data?.message || t.photoUploadFailed);
    },
  });

  // Create cropped image blob
  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    // Set canvas size to match cropped area
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Draw the cropped image
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  };

  // Handle crop completion
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Handle photo file selection
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      return;
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert(t.photoSupportedFormats);
      if (photoInputRef.current) {
        photoInputRef.current.value = '';
      }
      return;
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      if (photoInputRef.current) {
        photoInputRef.current.value = '';
      }
      return;
    }
    
    // Create preview and show crop modal
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageToCrop(reader.result);
      setShowCropModal(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    };
    reader.onerror = () => {
      alert('Error reading file. Please try again.');
      if (photoInputRef.current) {
        photoInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle crop and upload
  const handleCropAndUpload = async () => {
    if (!imageToCrop || !croppedAreaPixels) {
      alert('Please adjust the crop area before saving.');
      return;
    }

    try {
      setUploadingPhoto(true);
      const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      
      // Create a File object from the blob
      const croppedFile = new File([croppedBlob], 'profile-photo.jpg', {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });

      // Upload the cropped image
      uploadPhotoMutation.mutate(croppedFile);
      
      // Close crop modal
      setShowCropModal(false);
      setImageToCrop(null);
      setPhotoPreview(imageToCrop); // Show preview while uploading
    } catch (error) {
      alert(t.photoUploadFailed);
      setUploadingPhoto(false);
    }
  };

  // Handle crop cancel
  const handleCropCancel = () => {
    setShowCropModal(false);
    setImageToCrop(null);
    setPhotoPreview(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  // Upload verification document mutation
  const uploadVerificationMutation = useMutation({
    mutationFn: (formData) => verificationService.uploadDocument(formData),
    onSuccess: () => {
      queryClient.invalidateQueries(['verifications']);
      queryClient.invalidateQueries(['userProfile']);
      queryClient.invalidateQueries(['verificationStatus']);
      resetVerification();
      setVerificationFile(null);
      setVerificationError(null);
      alert(t.verificationSubmitted);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          t.verificationFailed;
      setVerificationError(errorMessage);
      console.error('Verification upload error:', error);
    },
  });

  // Handle verification form submission
  const onSubmitVerification = (data) => {
    if (!verificationFile) {
      setVerificationError(t.selectDocument);
      return;
    }

    const formData = new FormData();
    formData.append('document', verificationFile);
    formData.append('documentType', data.documentType);
    formData.append('institutionName', data.institutionName);
    formData.append('studentIdNumber', data.studentIdNumber);
    formData.append('enrollmentYear', data.enrollmentYear);
    formData.append('expectedGraduationYear', data.expectedGraduationYear);

    uploadVerificationMutation.mutate(formData);
  };

  // Handle resume file selection
  const handleResumeChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        alert(t.invalidFileType);
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert(t.fileSizeTooLarge);
        return;
      }

      setUploadingResume(true);
      uploadResumeMutation.mutate(file);
    }
  };

  // Handle delete resume
  const handleDeleteResume = () => {
    if (window.confirm(t.deleteResumeConfirm)) {
      deleteResumeMutation.mutate();
    }
  };

  // Handle additional document upload
  const handleAdditionalDocumentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadingDocument(true);
      uploadAdditionalDocumentMutation.mutate({
        file,
        description: documentDescription,
      });
    }
  };

  // Handle additional document delete
  const handleDeleteAdditionalDocument = (index) => {
    if (window.confirm(t.deleteDocumentConfirm)) {
      deleteAdditionalDocumentMutation.mutate(index);
    }
  };

  const getVerificationBadgeVariant = (status) => {
    switch (status) {
      case 'verified':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'secondary';
    }
  };

  if (isLoading || loadingVerification) {
    return <Loading text={t.loading} />;
  }

  if (profileError || !user) {
    return (
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4">
        <Alert 
          type="error" 
          message={profileError?.response?.data?.message || profileError?.message || t.failedToLoad} 
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 px-3 sm:px-4 md:px-6">
      {/* Header Card */}
      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 w-full sm:w-auto">
            <div className="relative">
              {(() => {
                const photoUrl = photoPreview || (user.photo && hasValidPhoto(user.photo) && !photoLoadError ? getPhotoUrl(user.photo) : null);
                
                // If photo failed to load or no valid photo, show initial
                if (!photoUrl || photoLoadError) {
                  return (
                    <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-primary-100 border-4 border-primary-100 flex items-center justify-center flex-shrink-0 relative">
                      <span className="text-primary-600 font-bold text-2xl sm:text-3xl md:text-4xl">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  );
                }
                
                // Show image if we have a valid photo URL
                return (
                  <img
                    key={photoUrl} // Force re-render when URL changes
                    src={photoUrl}
                    alt={user.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-primary-100 flex-shrink-0"
                    onError={(e) => {
                      setPhotoLoadError(true);
                      // Hide the broken image
                      e.target.style.display = 'none';
                    }}
                    onLoad={() => {
                      setPhotoLoadError(false);
                    }}
                  />
                );
              })()}
              {/* Edit Photo Button */}
              <input
                type="file"
                ref={photoInputRef}
                onChange={handlePhotoChange}
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                className="hidden"
                disabled={uploadingPhoto}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!uploadingPhoto && photoInputRef.current) {
                    photoInputRef.current.click();
                  }
                }}
                disabled={uploadingPhoto}
                className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-white hover:bg-primary-50 text-primary-600 rounded-full flex items-center justify-center shadow-lg border-2 border-primary-600 transition-all duration-200 hover:scale-110 z-10"
                title={t.changePhoto}
              >
                {uploadingPhoto ? (
                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                ) : (
                  <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                )}
              </button>
            </div>
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{user.name}</h1>
                <div className="flex items-center gap-2">
                  {isVerified ? (
                    <Badge variant="success" className="flex items-center gap-1 text-xs sm:text-sm">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      {t.verified}
                    </Badge>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge variant={getVerificationBadgeVariant(verificationStatus)} className="text-xs sm:text-sm">
                        {verificationStatus === 'pending' ? t.pending : verificationStatus === 'rejected' ? t.rejected : t.unverified}
                      </Badge>
                      <button
                        onClick={handleRefreshVerification}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        title={t.refreshVerification}
                        disabled={isLoading || loadingVerification}
                      >
                        <RefreshCw 
                          className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-600 ${isLoading || loadingVerification ? 'animate-spin' : ''}`}
                        />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4 text-sm sm:text-base text-gray-600 mb-2 sm:mb-3">
                <span className="flex items-center gap-1.5 sm:gap-2">
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">{user.email}</span>
                </span>
                {user.emailVerified && (
                  <Badge variant="info" size="sm" className="text-xs">{t.emailVerified || 'Email Verified'}</Badge>
                )}
              </div>
              {studentProfile?.bio && (
                <p className="text-sm sm:text-base text-gray-700 max-w-2xl">{studentProfile.bio}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenEditModal}
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 w-full sm:w-auto"
            >
              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
              {t.editProfile}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Personal Information */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          {/* Personal Details */}
          <Card title={t.personalDetails}>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-gray-500 mb-1">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  {t.fullName}
                </label>
                <p className="text-sm sm:text-base text-gray-900">{user.name}</p>
              </div>

              <div>
                <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-gray-500 mb-1">
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  {t.email}
                </label>
                <p className="text-sm sm:text-base text-gray-900 break-words">{user.email}</p>
              </div>

              {user.phone && (
                <div>
                  <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-gray-500 mb-1">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    {t.phone}
                  </label>
                  <p className="text-sm sm:text-base text-gray-900">{user.phone}</p>
                </div>
              )}

              {user.age && (
                <div>
                  <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-gray-500 mb-1">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    {t.age}
                  </label>
                  <p className="text-sm sm:text-base text-gray-900">{user.age} {t.yearsOld}</p>
                </div>
              )}

              {user.gender && (
                <div>
                  <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-gray-500 mb-1">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    {t.gender}
                  </label>
                  <p className="text-sm sm:text-base text-gray-900">{user.gender}</p>
                </div>
              )}

              {user.nationality && (
                <div>
                  <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-gray-500 mb-1">
                    <Globe className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    {t.nationality}
                  </label>
                  <p className="text-sm sm:text-base text-gray-900">{user.nationality}</p>
                </div>
              )}

              {(user.location?.city || user.country) && (
                <div>
                  <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-gray-500 mb-1">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    {t.locationLabel}
                  </label>
                  <p className="text-sm sm:text-base text-gray-900">
                    {[user.location?.city, user.country].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}

              {(user.joinedAt || user.createdAt) && (
                <div>
                  <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-gray-500 mb-1">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    {t.memberSince || 'Member Since'}
                  </label>
                  <p className="text-sm sm:text-base text-gray-900">
                    {new Date(user.joinedAt || user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Professional Info */}
          {studentProfile && (
            <Card title={t.professionalDetails}>
              <div className="space-y-3 sm:space-y-4">
                {studentProfile.university && (
                  <div>
                    <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-gray-500 mb-1">
                      <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      {t.university}
                    </label>
                    <p className="text-sm sm:text-base text-gray-900">{studentProfile.university}</p>
                  </div>
                )}

                {studentProfile.graduationYear && (
                  <div>
                    <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-gray-500 mb-1">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      {t.graduationYear}
                    </label>
                    <p className="text-sm sm:text-base text-gray-900">{studentProfile.graduationYear}</p>
                  </div>
                )}

                {studentProfile.experienceLevel && (
                  <div>
                    <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-gray-500 mb-1">
                      <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      {t.experienceLevelLabel}
                    </label>
                    <Badge variant="info" className="text-xs sm:text-sm">{studentProfile.experienceLevel}</Badge>
                  </div>
                )}

                {studentProfile.yearsOfExperience !== undefined && (
                  <div>
                    <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-gray-500 mb-1">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      {t.yearsOfExperience}
                    </label>
                    <p className="text-sm sm:text-base text-gray-900">{studentProfile.yearsOfExperience} {t.years || 'years'}</p>
                  </div>
                )}

                {studentProfile.availability && (
                  <div>
                    <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-gray-500 mb-1">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      {t.availability}
                    </label>
                    <Badge
                      variant={
                        studentProfile.availability === 'Available'
                          ? 'success'
                          : studentProfile.availability === 'Busy'
                          ? 'warning'
                          : 'secondary'
                      }
                      className="text-xs sm:text-sm"
                    >
                      {studentProfile.availability}
                    </Badge>
                  </div>
                )}

                {studentProfile.hourlyRate && (
                  <div>
                    <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-gray-500 mb-1">
                      <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      {t.hourlyRate}
                    </label>
                    <p className="text-sm sm:text-base text-gray-900">
                      {studentProfile.hourlyRate.currency} {studentProfile.hourlyRate.min} - 
                      {studentProfile.hourlyRate.max}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Skills Management Card */}
          {studentProfile && (
            <Card title={t.skillsExpertise}>
              <TagInput
                label=""
                tags={studentProfile.skills || []}
                onChange={async (newSkills) => {
                  try {
                    // Ensure skills are strings and filter out empty ones
                    const formattedSkills = newSkills
                      .map(skill => {
                        // Handle both string and object formats (for backward compatibility)
                        if (typeof skill === 'string') {
                          return skill.trim();
                        }
                        // If it's an object, extract the name
                        return (skill.name || skill).toString().trim();
                      })
                      .filter(skill => skill && skill.length > 0); // Remove empty skills

                    console.log('Updating skills:', formattedSkills);

                    // Build update payload - only include skills to avoid validation issues
                    const updatePayload = {
                      studentProfile: {
                        skills: formattedSkills,
                      },
                    };

                    await updateProfileMutation.mutateAsync(updatePayload);
                  } catch (error) {
                    console.error('Failed to update skills:', error);
                    const errorMessage = error.response?.data?.message || 
                                        error.response?.data?.error ||
                                        error.message || 
                                        t.updateFailed;
                    alert(errorMessage);
                  }
                }}
                placeholder={t.addSkills}
                maxTags={20}
              />
              {(!studentProfile.skills || studentProfile.skills.length === 0) && (
                <p className="text-sm text-gray-500 mt-2">
                  {t.noSkillsAdded || 'No skills added yet. Start typing and press Enter to add skills.'}
                </p>
              )}
            </Card>
          )}
        </div>

        {/* Right Column - Education, etc. */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Education */}
          {(studentProfile?.university || studentProfile?.graduationYear) && (
            <Card>
              <h3 className="font-bold text-lg sm:text-xl mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 flex-shrink-0" />
                {t.education}
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {/* University and Expected Graduation Year */}
                <div className="border-l-4 border-primary-500 pl-3 sm:pl-4 py-2 bg-primary-50 rounded-r-lg">
                  {studentProfile.university && (
                    <div className="mb-2">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">{t.university}</p>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <p className="font-bold text-base sm:text-lg text-gray-900 truncate">{studentProfile.university}</p>
                        {studentProfile.universityLink && (
                          <a
                            href={studentProfile.universityLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700 flex items-center gap-1 flex-shrink-0"
                            title={t.visitUniversity}
                          >
                            <LinkIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                  {studentProfile.graduationYear && (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-primary-600 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-700">
                        <span className="font-semibold">{t.expectedGraduation || 'Expected Graduation'}:</span> {studentProfile.graduationYear}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Languages */}
          {studentProfile?.languages && studentProfile.languages.length > 0 && (
            <Card title={t.languages}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {studentProfile.languages.map((lang, index) => (
                  <div key={index} className="flex items-center justify-between gap-2">
                    <span className="text-sm sm:text-base text-gray-900 truncate">{lang.language}</span>
                    <Badge variant="secondary" className="text-xs sm:text-sm flex-shrink-0">{lang.proficiency}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Certifications */}
          {studentProfile?.certifications && studentProfile.certifications.length > 0 && (
            <Card title={t.certifications}>
              <div className="space-y-3 sm:space-y-4">
                {studentProfile.certifications.map((cert, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-3 sm:pl-4 py-2">
                    <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900">{cert.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-700">{cert.issuingOrganization}</p>
                        {cert.credentialId && (
                          <p className="text-xs text-gray-600">{t.credentialId} {cert.credentialId}</p>
                        )}
                      </div>
                      <div className="text-left sm:text-right text-xs sm:text-sm text-gray-600 flex-shrink-0">
                        {cert.issueDate && (
                          <p>{new Date(cert.issueDate).toLocaleDateString()}</p>
                        )}
                        {cert.expirationDate && (
                          <p className="text-red-600">
                            {t.expires || 'Expires'}: {new Date(cert.expirationDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 mt-2"
                      >
                        <LinkIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        {t.viewCredential}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Portfolio */}
          {studentProfile?.portfolio && studentProfile.portfolio.length > 0 && (
            <Card title={t.portfolio}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {studentProfile.portfolio.map((project, index) => (
                  <div key={index} className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 sm:mb-2">{project.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">{project.description}</p>
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                        {project.technologies.map((tech, techIndex) => (
                          <Badge key={techIndex} variant="secondary" size="sm" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                      >
                        <LinkIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        {t.viewProject}
                      </a>
                    )}
                    {project.completedDate && (
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-2">
                        {t.completed || 'Completed'}: {new Date(project.completedDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Social Links */}
          {studentProfile?.socialLinks && Object.values(studentProfile.socialLinks).some(link => link) && (
            <Card title={t.socialLinksTitle}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {studentProfile.socialLinks.github && (
                  <a
                    href={studentProfile.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base text-gray-700 hover:text-primary-600"
                  >
                    <LinkIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">GitHub</span>
                  </a>
                )}
                {studentProfile.socialLinks.linkedin && (
                  <a
                    href={studentProfile.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base text-gray-700 hover:text-primary-600"
                  >
                    <LinkIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">LinkedIn</span>
                  </a>
                )}
                {studentProfile.socialLinks.website && (
                  <a
                    href={studentProfile.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base text-gray-700 hover:text-primary-600"
                  >
                    <LinkIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">Website</span>
                  </a>
                )}
                {studentProfile.socialLinks.behance && (
                  <a
                    href={studentProfile.socialLinks.behance}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base text-gray-700 hover:text-primary-600"
                  >
                    <LinkIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">Behance</span>
                  </a>
                )}
                {studentProfile.socialLinks.telegram && (
                  <a
                    href={studentProfile.socialLinks.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base text-gray-700 hover:text-primary-600"
                  >
                    <LinkIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">Telegram</span>
                  </a>
                )}
                {studentProfile.socialLinks.whatsapp && (
                  <a
                    href={studentProfile.socialLinks.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base text-gray-700 hover:text-primary-600"
                  >
                    <LinkIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">WhatsApp</span>
                  </a>
                )}
              </div>
            </Card>
          )}

          {/* Student Verification */}
          <Card title={t.studentVerification}>
            {loadingVerification ? (
              <Loading text={t.loadingVerification} />
            ) : verificationQueryError ? (
              <Alert
                type="error"
                message={t.verificationLoadFailed}
              />
            ) : hasApprovedVerification ? (
              <div className="space-y-3 sm:space-y-4">
                <Alert
                  type="success"
                  title={t.verificationComplete}
                  message={t.verificationCompleteMessage}
                />
                {verifications.filter(v => v && v.status === 'approved').map((verification, index) => (
                  <div key={verification._id || `approved-${index}`} className="p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0 mt-0.5 sm:mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                          <h4 className="text-sm sm:text-base font-semibold text-gray-900 capitalize">
                            {verification.documentType ? verification.documentType.replace(/_/g, ' ') : t.verificationDocument || 'Verification Document'}
                          </h4>
                          <Badge variant="success" className="text-xs sm:text-sm self-start sm:self-auto">{t.approved}</Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-700">{verification.institutionName || t.na}</p>
                        {verification.reviewedAt && (
                          <p className="text-[10px] sm:text-xs text-gray-600 mt-1">
                            {t.approvedOn} {new Date(verification.reviewedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : hasPendingVerification ? (
              <div className="space-y-3 sm:space-y-4">
                <Alert
                  type="info"
                  title={t.verificationPending}
                  message={t.verificationPendingMessage}
                />
                {verifications.filter(v => v && v.status === 'pending').map((verification, index) => (
                  <div key={verification._id || `pending-${index}`} className="p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 flex-shrink-0 mt-0.5 sm:mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                          <h4 className="text-sm sm:text-base font-semibold text-gray-900 capitalize">
                            {verification.documentType ? verification.documentType.replace(/_/g, ' ') : t.verificationDocument || 'Verification Document'}
                          </h4>
                          <Badge variant="warning" className="text-xs sm:text-sm self-start sm:self-auto">{t.pendingReview}</Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-700">{verification.institutionName || t.na}</p>
                        <p className="text-[10px] sm:text-xs text-gray-600 mt-1">
                          {t.submitted} {(verification.uploadedAt || verification.createdAt) ? new Date(verification.uploadedAt || verification.createdAt).toLocaleDateString() : t.na}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                <Alert
                  type="warning"
                  title={t.verificationRequired}
                  message={t.verificationRequiredMessage}
                />
                
                {/* Verification Upload Form */}
                <form onSubmit={handleSubmitVerification(onSubmitVerification)} className="space-y-3 sm:space-y-4">
                  {verificationError && (
                    <Alert
                      type="error"
                      message={verificationError}
                      onClose={() => setVerificationError(null)}
                    />
                  )}

                  <Select
                    label={t.documentType}
                    options={[
                      { value: 'student_id', label: t.studentIdCard },
                      { value: 'enrollment_certificate', label: t.enrollmentCertificate },
                      { value: 'transcript', label: t.officialTranscript },
                      { value: 'other', label: t.other },
                    ]}
                    error={verificationErrors.documentType?.message}
                    {...registerVerification('documentType', { required: t.documentTypeRequired })}
                  />

                  <Input
                    label={t.institutionName}
                    placeholder={t.institutionPlaceholder}
                    error={verificationErrors.institutionName?.message}
                    {...registerVerification('institutionName', { required: t.institutionNameRequired })}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <Input
                      label={t.studentIdNumber}
                      placeholder={t.studentIdPlaceholder}
                      error={verificationErrors.studentIdNumber?.message}
                      {...registerVerification('studentIdNumber', { required: t.studentIdRequired })}
                    />

                    <Input
                      label={t.enrollmentYear}
                      type="number"
                      placeholder={t.enrollmentYearPlaceholder}
                      error={verificationErrors.enrollmentYear?.message}
                      {...registerVerification('enrollmentYear', {
                        required: t.enrollmentYearRequired,
                        min: { value: 2000, message: t.validYear },
                        max: { value: new Date().getFullYear(), message: t.cannotBeFuture },
                      })}
                    />
                  </div>

                  <Input
                    label={t.expectedGraduationYear}
                    type="number"
                    placeholder={t.graduationYearPlaceholder}
                    error={verificationErrors.expectedGraduationYear?.message}
                    {...registerVerification('expectedGraduationYear', {
                      required: t.graduationYearRequired,
                      min: { value: new Date().getFullYear(), message: t.validFutureYear },
                      max: { value: 2034, message: t.validFutureYear || 'Expected graduation year must not exceed 2034' },
                    })}
                  />

                  {/* File Upload */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      {t.uploadDocument} <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 flex justify-center px-4 sm:px-6 pt-4 sm:pt-5 pb-4 sm:pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-400 transition-colors">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                        <div className="flex flex-col sm:flex-row items-center justify-center text-xs sm:text-sm text-gray-600 gap-1">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
                            <span>{t.uploadFile}</span>
                            <input
                              ref={verificationFileInputRef}
                              type="file"
                              className="sr-only"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  // Validate file size (10MB max)
                                  if (file.size > 10 * 1024 * 1024) {
                                    setVerificationError(t.verificationFileSizeTooLarge);
                                    return;
                                  }
                                  setVerificationFile(file);
                                  setVerificationError(null);
                                }
                              }}
                            />
                          </label>
                          <p className="sm:pl-1">{t.dragAndDrop}</p>
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-500">
                          {t.fileFormats}
                        </p>
                        {verificationFile && (
                          <p className="text-xs sm:text-sm text-primary-600 font-medium truncate max-w-full px-2">
                            {t.selected} {verificationFile.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5"
                    loading={uploadVerificationMutation.isPending}
                    disabled={uploadVerificationMutation.isPending}
                  >
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    {t.submitForVerification}
                  </Button>
                </form>
              </div>
            )}

            {/* Verification History */}
            {verifications && verifications.length > 0 && verifications.some(v => v && v.status === 'rejected') && (
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
                <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3">{t.verificationHistory}</h4>
                <div className="space-y-2 sm:space-y-3">
                  {verifications.filter(v => v && v.status === 'rejected').map((verification, index) => (
                    <div key={verification._id || `rejected-${index}`} className="p-3 sm:p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0 mt-0.5 sm:mt-1" />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900 capitalize">
                              {verification.documentType?.replace('_', ' ')}
                            </h4>
                            <Badge variant="error" className="text-xs sm:text-sm self-start sm:self-auto">{t.rejected}</Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-700">{verification.institutionName || t.na}</p>
                          {verification.rejectionReason && (
                            <Alert
                              type="error"
                              message={`${t.rejectionReason} ${verification.rejectionReason}`}
                              className="mt-2"
                            />
                          )}
                          <p className="text-[10px] sm:text-xs text-gray-600 mt-1">
                            {t.submitted} {(verification.uploadedAt || verification.createdAt) ? new Date(verification.uploadedAt || verification.createdAt).toLocaleDateString() : t.na}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Resume */}
          <Card title={t.resumeCv}>
            {!isVerified || verificationStatus !== 'verified' ? (
              <div className="text-center py-6 sm:py-8 px-4">
                <Shield className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-gray-600 mb-2">{t.verificationRequired}</p>
                <p className="text-xs sm:text-sm text-gray-500 mb-4">{t.verificationRequiredMessage}</p>
                <Button
                  variant="primary"
                  onClick={() => navigate('/student/verification')}
                  className="text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5"
                >
                  {t.completeVerification}
                </Button>
              </div>
            ) : studentProfile?.resume && studentProfile.resume.url ? (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm sm:text-base font-medium text-gray-900 truncate">{studentProfile.resume.filename}</p>
                      {studentProfile.resume.uploadedAt && (
                        <p className="text-xs sm:text-sm text-gray-600">
                          {t.uploaded} {new Date(studentProfile.resume.uploadedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                  onClick={() => window.open(`${API_BASE_URL}${studentProfile.resume.url}`, '_blank')}
                      className="flex-1 sm:flex-initial text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
                    >
                      {t.download}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteResume}
                      loading={deleteResumeMutation.isLoading}
                      disabled={deleteResumeMutation.isLoading}
                      className="text-red-600 hover:text-red-700 border-red-600 hover:border-red-700 px-3 sm:px-4 py-1.5 sm:py-2"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>
                <div className="pt-2 sm:pt-3 border-t">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeChange}
                    className="hidden"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    loading={uploadingResume}
                    disabled={uploadingResume}
                    className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 w-full sm:w-auto"
                  >
                    <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                    {t.replaceResume}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8 px-4">
                <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">{t.noResumeUploaded}</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeChange}
                  className="hidden"
                />
                <Button
                  variant="primary"
                  onClick={() => fileInputRef.current?.click()}
                  loading={uploadingResume}
                  disabled={uploadingResume}
                  className="flex items-center gap-1.5 sm:gap-2 mx-auto text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5"
                >
                  <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                  {t.uploadResume}
                </Button>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-2">
                  {t.supportedFormats}
                </p>
              </div>
            )}
          </Card>

          {/* Additional Documents */}
          <Card title={t.additionalDocuments}>
            {!isVerified || verificationStatus !== 'verified' ? (
              <div className="text-center py-6 sm:py-8 px-4">
                <Shield className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-gray-600 mb-2">{t.verificationRequired}</p>
                <p className="text-xs sm:text-sm text-gray-500 mb-4">{t.verificationRequiredMessage}</p>
                <Button
                  variant="primary"
                  onClick={() => navigate('/student/verification')}
                  className="text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5"
                >
                  {t.completeVerification}
                </Button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {/* Upload Form */}
                <div className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-gray-50">
                <div className="space-y-2 sm:space-y-3">
                  <Input
                    label={t.documentDescription}
                    placeholder={t.documentDescriptionPlaceholder}
                    value={documentDescription}
                    onChange={(e) => setDocumentDescription(e.target.value)}
                    disabled={uploadingDocument}
                  />
                  <input
                    ref={additionalDocumentInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleAdditionalDocumentChange}
                    className="hidden"
                    disabled={uploadingDocument}
                  />
                  <Button
                    variant="secondary"
                    onClick={() => additionalDocumentInputRef.current?.click()}
                    loading={uploadingDocument || uploadAdditionalDocumentMutation.isPending}
                    disabled={uploadingDocument || uploadAdditionalDocumentMutation.isPending}
                    className="flex items-center gap-1.5 sm:gap-2 w-full text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5"
                  >
                    <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                    {uploadingDocument ? t.uploading : t.uploadDocumentButton}
                  </Button>
                  <p className="text-[10px] sm:text-xs text-gray-500">
                    {t.supportedFormatsAdditional}
                  </p>
                </div>
              </div>

              {/* Documents List */}
              {studentProfile?.additionalDocuments && studentProfile.additionalDocuments.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {studentProfile.additionalDocuments.map((doc, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 p-2 sm:p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 w-full sm:w-auto">
                        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{doc.filename}</p>
                          {doc.description && (
                            <p className="text-xs text-gray-600 truncate">{doc.description}</p>
                          )}
                          {doc.uploadedAt && (
                            <p className="text-[10px] sm:text-xs text-gray-500">
                              {t.uploaded} {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`${API_BASE_URL}${doc.url}`, '_blank')}
                          className="flex-1 sm:flex-initial text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
                        >
                          {t.view}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAdditionalDocument(index)}
                          loading={deleteAdditionalDocumentMutation.isPending}
                          disabled={deleteAdditionalDocumentMutation.isPending}
                          className="text-red-600 hover:text-red-700 border-red-600 hover:border-red-700 px-3 sm:px-4 py-1.5 sm:py-2"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 sm:py-6 text-gray-500 px-4">
                  <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm">{t.noAdditionalDocuments}</p>
                </div>
              )}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Crop Photo Modal */}
      <Modal
        isOpen={showCropModal}
        onClose={handleCropCancel}
        title={t.cropPhoto}
        size="lg"
      >
        <div className="space-y-4 sm:space-y-6">
          <p className="text-sm sm:text-base text-gray-600">{t.cropPhotoDescription}</p>
          <div 
            className="relative w-full mx-auto rounded-lg overflow-hidden" 
            style={{ 
              height: '300px',
              maxHeight: '70vh',
              backgroundColor: '#000' 
            }}
          >
            {imageToCrop && (
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                style={{
                  containerStyle: {
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                  },
                }}
              />
            )}
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Zoom: {Math.round(zoom * 100)}%
              </label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCropCancel}
                disabled={uploadingPhoto}
                className="flex items-center justify-center gap-2 w-full sm:w-auto text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5"
              >
                <X className="w-4 h-4" />
                {t.cancel}
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleCropAndUpload}
                loading={uploadingPhoto}
                disabled={uploadingPhoto || !croppedAreaPixels}
                className="flex items-center justify-center gap-2 w-full sm:w-auto text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5"
              >
                <Check className="w-4 h-4" />
                {t.saveCrop}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setFormError(null);
          reset();
        }}
        title={t.editProfile}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
          {/* Error Alert */}
          {formError && (
            <Alert
              type="error"
              message={formError}
              onClose={() => setFormError(null)}
            />
          )}
          
          {/* Personal Information Section */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">{t.personalInformation}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Input
                label={t.fullName}
                {...register('name', { required: t.nameRequired })}
                error={errors.name?.message}
                placeholder={t.enterFullName}
              />

              <Input
                label={t.phone}
                type="tel"
                {...register('phone')}
                error={errors.phone?.message}
                placeholder={t.enterPhone}
              />

              <Input
                label={t.age}
                type="number"
                {...register('age', {
                  min: { value: 16, message: t.ageMin },
                  max: { value: 100, message: t.ageMax }
                })}
                error={errors.age?.message}
                placeholder={t.enterAge}
              />


              <div>
                <Select
                  label={t.nationality}
                  {...register('nationality')}
                  error={errors.nationality?.message}
                  disabled={true}
                  className="bg-gray-100 cursor-not-allowed"
                  options={[
                  { value: 'Egyptian', label: 'Egyptian' },
                  { value: 'Saudi Arabian', label: 'Saudi Arabian' },
                  { value: 'Emirati', label: 'Emirati' },
                  { value: 'Kuwaiti', label: 'Kuwaiti' },
                  { value: 'Qatari', label: 'Qatari' },
                  { value: 'Bahraini', label: 'Bahraini' },
                  { value: 'Omani', label: 'Omani' },
                  { value: 'Jordanian', label: 'Jordanian' },
                  { value: 'Lebanese', label: 'Lebanese' },
                  { value: 'Palestinian', label: 'Palestinian' },
                  { value: 'Syrian', label: 'Syrian' },
                  { value: 'Iraqi', label: 'Iraqi' },
                  { value: 'Yemeni', label: 'Yemeni' },
                  { value: 'Libyan', label: 'Libyan' },
                  { value: 'Tunisian', label: 'Tunisian' },
                  { value: 'Algerian', label: 'Algerian' },
                  { value: 'Moroccan', label: 'Moroccan' },
                  { value: 'Sudanese', label: 'Sudanese' },
                  { value: 'American', label: 'American' },
                  { value: 'British', label: 'British' },
                  { value: 'Canadian', label: 'Canadian' },
                  { value: 'Australian', label: 'Australian' },
                  { value: 'German', label: 'German' },
                  { value: 'French', label: 'French' },
                  { value: 'Italian', label: 'Italian' },
                  { value: 'Spanish', label: 'Spanish' },
                  { value: 'Dutch', label: 'Dutch' },
                  { value: 'Belgian', label: 'Belgian' },
                  { value: 'Swiss', label: 'Swiss' },
                  { value: 'Austrian', label: 'Austrian' },
                  { value: 'Swedish', label: 'Swedish' },
                  { value: 'Norwegian', label: 'Norwegian' },
                  { value: 'Danish', label: 'Danish' },
                  { value: 'Finnish', label: 'Finnish' },
                  { value: 'Polish', label: 'Polish' },
                  { value: 'Czech', label: 'Czech' },
                  { value: 'Hungarian', label: 'Hungarian' },
                  { value: 'Romanian', label: 'Romanian' },
                  { value: 'Bulgarian', label: 'Bulgarian' },
                  { value: 'Greek', label: 'Greek' },
                  { value: 'Turkish', label: 'Turkish' },
                  { value: 'Russian', label: 'Russian' },
                  { value: 'Ukrainian', label: 'Ukrainian' },
                  { value: 'Indian', label: 'Indian' },
                  { value: 'Pakistani', label: 'Pakistani' },
                  { value: 'Bangladeshi', label: 'Bangladeshi' },
                  { value: 'Chinese', label: 'Chinese' },
                  { value: 'Japanese', label: 'Japanese' },
                  { value: 'South Korean', label: 'South Korean' },
                  { value: 'Filipino', label: 'Filipino' },
                  { value: 'Indonesian', label: 'Indonesian' },
                  { value: 'Malaysian', label: 'Malaysian' },
                  { value: 'Thai', label: 'Thai' },
                  { value: 'Vietnamese', label: 'Vietnamese' },
                  { value: 'Singaporean', label: 'Singaporean' },
                  { value: 'Brazilian', label: 'Brazilian' },
                  { value: 'Mexican', label: 'Mexican' },
                  { value: 'Argentine', label: 'Argentine' },
                  { value: 'Chilean', label: 'Chilean' },
                  { value: 'Colombian', label: 'Colombian' },
                  { value: 'Peruvian', label: 'Peruvian' },
                  { value: 'Venezuelan', label: 'Venezuelan' },
                  { value: 'South African', label: 'South African' },
                  { value: 'Nigerian', label: 'Nigerian' },
                  { value: 'Kenyan', label: 'Kenyan' },
                  { value: 'Ghanaian', label: 'Ghanaian' },
                  { value: 'Ethiopian', label: 'Ethiopian' },
                  { value: 'Tanzanian', label: 'Tanzanian' },
                  { value: 'Ugandan', label: 'Ugandan' },
                  { value: 'Other', label: 'Other' },
                ]}
              />
                <p className="text-xs text-gray-500 mt-1">{t.nationalityCannotChange}</p>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">{t.location}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Select
                  label={t.countryOfStudy}
                  {...register('location.country')}
                  error={errors.location?.country?.message}
                  disabled={true}
                  className="bg-gray-100 cursor-not-allowed"
                  options={[
                  { value: 'Afghanistan', label: 'Afghanistan' },
                  { value: 'Albania', label: 'Albania' },
                  { value: 'Algeria', label: 'Algeria' },
                  { value: 'Andorra', label: 'Andorra' },
                  { value: 'Angola', label: 'Angola' },
                  { value: 'Argentina', label: 'Argentina' },
                  { value: 'Armenia', label: 'Armenia' },
                  { value: 'Australia', label: 'Australia' },
                  { value: 'Austria', label: 'Austria' },
                  { value: 'Azerbaijan', label: 'Azerbaijan' },
                  { value: 'Bahamas', label: 'Bahamas' },
                  { value: 'Bahrain', label: 'Bahrain' },
                  { value: 'Bangladesh', label: 'Bangladesh' },
                  { value: 'Barbados', label: 'Barbados' },
                  { value: 'Belarus', label: 'Belarus' },
                  { value: 'Belgium', label: 'Belgium' },
                  { value: 'Belize', label: 'Belize' },
                  { value: 'Benin', label: 'Benin' },
                  { value: 'Bhutan', label: 'Bhutan' },
                  { value: 'Bolivia', label: 'Bolivia' },
                  { value: 'Bosnia and Herzegovina', label: 'Bosnia and Herzegovina' },
                  { value: 'Botswana', label: 'Botswana' },
                  { value: 'Brazil', label: 'Brazil' },
                  { value: 'Brunei', label: 'Brunei' },
                  { value: 'Bulgaria', label: 'Bulgaria' },
                  { value: 'Burkina Faso', label: 'Burkina Faso' },
                  { value: 'Burundi', label: 'Burundi' },
                  { value: 'Cambodia', label: 'Cambodia' },
                  { value: 'Cameroon', label: 'Cameroon' },
                  { value: 'Canada', label: 'Canada' },
                  { value: 'Cape Verde', label: 'Cape Verde' },
                  { value: 'Central African Republic', label: 'Central African Republic' },
                  { value: 'Chad', label: 'Chad' },
                  { value: 'Chile', label: 'Chile' },
                  { value: 'China', label: 'China' },
                  { value: 'Colombia', label: 'Colombia' },
                  { value: 'Comoros', label: 'Comoros' },
                  { value: 'Congo', label: 'Congo' },
                  { value: 'Costa Rica', label: 'Costa Rica' },
                  { value: 'Croatia', label: 'Croatia' },
                  { value: 'Cuba', label: 'Cuba' },
                  { value: 'Cyprus', label: 'Cyprus' },
                  { value: 'Czech Republic', label: 'Czech Republic' },
                  { value: 'Denmark', label: 'Denmark' },
                  { value: 'Djibouti', label: 'Djibouti' },
                  { value: 'Dominica', label: 'Dominica' },
                  { value: 'Dominican Republic', label: 'Dominican Republic' },
                  { value: 'Ecuador', label: 'Ecuador' },
                  { value: 'Egypt', label: 'Egypt' },
                  { value: 'El Salvador', label: 'El Salvador' },
                  { value: 'Equatorial Guinea', label: 'Equatorial Guinea' },
                  { value: 'Eritrea', label: 'Eritrea' },
                  { value: 'Estonia', label: 'Estonia' },
                  { value: 'Ethiopia', label: 'Ethiopia' },
                  { value: 'Fiji', label: 'Fiji' },
                  { value: 'Finland', label: 'Finland' },
                  { value: 'France', label: 'France' },
                  { value: 'Gabon', label: 'Gabon' },
                  { value: 'Gambia', label: 'Gambia' },
                  { value: 'Georgia', label: 'Georgia' },
                  { value: 'Germany', label: 'Germany' },
                  { value: 'Ghana', label: 'Ghana' },
                  { value: 'Greece', label: 'Greece' },
                  { value: 'Grenada', label: 'Grenada' },
                  { value: 'Guatemala', label: 'Guatemala' },
                  { value: 'Guinea', label: 'Guinea' },
                  { value: 'Guinea-Bissau', label: 'Guinea-Bissau' },
                  { value: 'Guyana', label: 'Guyana' },
                  { value: 'Haiti', label: 'Haiti' },
                  { value: 'Honduras', label: 'Honduras' },
                  { value: 'Hungary', label: 'Hungary' },
                  { value: 'Iceland', label: 'Iceland' },
                  { value: 'India', label: 'India' },
                  { value: 'Indonesia', label: 'Indonesia' },
                  { value: 'Iran', label: 'Iran' },
                  { value: 'Iraq', label: 'Iraq' },
                  { value: 'Ireland', label: 'Ireland' },
                  { value: 'Israel', label: 'Israel' },
                  { value: 'Italy', label: 'Italy' },
                  { value: 'Jamaica', label: 'Jamaica' },
                  { value: 'Japan', label: 'Japan' },
                  { value: 'Jordan', label: 'Jordan' },
                  { value: 'Kazakhstan', label: 'Kazakhstan' },
                  { value: 'Kenya', label: 'Kenya' },
                  { value: 'Kiribati', label: 'Kiribati' },
                  { value: 'Kuwait', label: 'Kuwait' },
                  { value: 'Kyrgyzstan', label: 'Kyrgyzstan' },
                  { value: 'Laos', label: 'Laos' },
                  { value: 'Latvia', label: 'Latvia' },
                  { value: 'Lebanon', label: 'Lebanon' },
                  { value: 'Lesotho', label: 'Lesotho' },
                  { value: 'Liberia', label: 'Liberia' },
                  { value: 'Libya', label: 'Libya' },
                  { value: 'Liechtenstein', label: 'Liechtenstein' },
                  { value: 'Lithuania', label: 'Lithuania' },
                  { value: 'Luxembourg', label: 'Luxembourg' },
                  { value: 'Madagascar', label: 'Madagascar' },
                  { value: 'Malawi', label: 'Malawi' },
                  { value: 'Malaysia', label: 'Malaysia' },
                  { value: 'Maldives', label: 'Maldives' },
                  { value: 'Mali', label: 'Mali' },
                  { value: 'Malta', label: 'Malta' },
                  { value: 'Marshall Islands', label: 'Marshall Islands' },
                  { value: 'Mauritania', label: 'Mauritania' },
                  { value: 'Mauritius', label: 'Mauritius' },
                  { value: 'Mexico', label: 'Mexico' },
                  { value: 'Micronesia', label: 'Micronesia' },
                  { value: 'Moldova', label: 'Moldova' },
                  { value: 'Monaco', label: 'Monaco' },
                  { value: 'Mongolia', label: 'Mongolia' },
                  { value: 'Montenegro', label: 'Montenegro' },
                  { value: 'Morocco', label: 'Morocco' },
                  { value: 'Mozambique', label: 'Mozambique' },
                  { value: 'Myanmar', label: 'Myanmar' },
                  { value: 'Namibia', label: 'Namibia' },
                  { value: 'Nauru', label: 'Nauru' },
                  { value: 'Nepal', label: 'Nepal' },
                  { value: 'Netherlands', label: 'Netherlands' },
                  { value: 'New Zealand', label: 'New Zealand' },
                  { value: 'Nicaragua', label: 'Nicaragua' },
                  { value: 'Niger', label: 'Niger' },
                  { value: 'Nigeria', label: 'Nigeria' },
                  { value: 'North Korea', label: 'North Korea' },
                  { value: 'North Macedonia', label: 'North Macedonia' },
                  { value: 'Norway', label: 'Norway' },
                  { value: 'Oman', label: 'Oman' },
                  { value: 'Pakistan', label: 'Pakistan' },
                  { value: 'Palau', label: 'Palau' },
                  { value: 'Palestine', label: 'Palestine' },
                  { value: 'Panama', label: 'Panama' },
                  { value: 'Papua New Guinea', label: 'Papua New Guinea' },
                  { value: 'Paraguay', label: 'Paraguay' },
                  { value: 'Peru', label: 'Peru' },
                  { value: 'Philippines', label: 'Philippines' },
                  { value: 'Poland', label: 'Poland' },
                  { value: 'Portugal', label: 'Portugal' },
                  { value: 'Qatar', label: 'Qatar' },
                  { value: 'Romania', label: 'Romania' },
                  { value: 'Russia', label: 'Russia' },
                  { value: 'Rwanda', label: 'Rwanda' },
                  { value: 'Saint Kitts and Nevis', label: 'Saint Kitts and Nevis' },
                  { value: 'Saint Lucia', label: 'Saint Lucia' },
                  { value: 'Saint Vincent and the Grenadines', label: 'Saint Vincent and the Grenadines' },
                  { value: 'Samoa', label: 'Samoa' },
                  { value: 'San Marino', label: 'San Marino' },
                  { value: 'Sao Tome and Principe', label: 'Sao Tome and Principe' },
                  { value: 'Saudi Arabia', label: 'Saudi Arabia' },
                  { value: 'Senegal', label: 'Senegal' },
                  { value: 'Serbia', label: 'Serbia' },
                  { value: 'Seychelles', label: 'Seychelles' },
                  { value: 'Sierra Leone', label: 'Sierra Leone' },
                  { value: 'Singapore', label: 'Singapore' },
                  { value: 'Slovakia', label: 'Slovakia' },
                  { value: 'Slovenia', label: 'Slovenia' },
                  { value: 'Solomon Islands', label: 'Solomon Islands' },
                  { value: 'Somalia', label: 'Somalia' },
                  { value: 'South Africa', label: 'South Africa' },
                  { value: 'South Korea', label: 'South Korea' },
                  { value: 'South Sudan', label: 'South Sudan' },
                  { value: 'Spain', label: 'Spain' },
                  { value: 'Sri Lanka', label: 'Sri Lanka' },
                  { value: 'Sudan', label: 'Sudan' },
                  { value: 'Suriname', label: 'Suriname' },
                  { value: 'Sweden', label: 'Sweden' },
                  { value: 'Switzerland', label: 'Switzerland' },
                  { value: 'Syria', label: 'Syria' },
                  { value: 'Taiwan', label: 'Taiwan' },
                  { value: 'Tajikistan', label: 'Tajikistan' },
                  { value: 'Tanzania', label: 'Tanzania' },
                  { value: 'Thailand', label: 'Thailand' },
                  { value: 'Timor-Leste', label: 'Timor-Leste' },
                  { value: 'Togo', label: 'Togo' },
                  { value: 'Tonga', label: 'Tonga' },
                  { value: 'Trinidad and Tobago', label: 'Trinidad and Tobago' },
                  { value: 'Tunisia', label: 'Tunisia' },
                  { value: 'Turkey', label: 'Turkey' },
                  { value: 'Turkmenistan', label: 'Turkmenistan' },
                  { value: 'Tuvalu', label: 'Tuvalu' },
                  { value: 'Uganda', label: 'Uganda' },
                  { value: 'Ukraine', label: 'Ukraine' },
                  { value: 'United Arab Emirates', label: 'United Arab Emirates' },
                  { value: 'United Kingdom', label: 'United Kingdom' },
                  { value: 'United States', label: 'United States' },
                  { value: 'Uruguay', label: 'Uruguay' },
                  { value: 'Uzbekistan', label: 'Uzbekistan' },
                  { value: 'Vanuatu', label: 'Vanuatu' },
                  { value: 'Vatican City', label: 'Vatican City' },
                  { value: 'Venezuela', label: 'Venezuela' },
                  { value: 'Vietnam', label: 'Vietnam' },
                  { value: 'Yemen', label: 'Yemen' },
                  { value: 'Zambia', label: 'Zambia' },
                  { value: 'Zimbabwe', label: 'Zimbabwe' },
                ]}
              />
                <p className="text-xs text-gray-500 mt-1">{t.countryCannotChange}</p>
              </div>

              <Input
                label={t.city}
                {...register('location.city')}
                error={errors.location?.city?.message}
                placeholder={t.enterCity}
              />

              <Input
                label={t.timezone}
                {...register('location.timezone')}
                error={errors.location?.timezone?.message}
                placeholder={t.timezonePlaceholder}
              />
            </div>
          </div>

          {/* Professional Information Section */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">{t.professionalInformation}</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="col-span-full">
                <Input
                  label={t.university}
                  placeholder={t.universityPlaceholder}
                  error={errors.studentProfile?.university?.message}
                  {...register('studentProfile.university')}
                />
              </div>

              <div className="col-span-full">
                <Input
                  label={t.universityWebsite}
                  type="url"
                  placeholder={t.universityWebsitePlaceholder}
                  error={errors.studentProfile?.universityLink?.message}
                  {...register('studentProfile.universityLink', {
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: t.invalidUrl,
                    },
                  })}
                />
              </div>

              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.bio}
                </label>
                <textarea
                  {...register('studentProfile.bio')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={t.bioPlaceholder}
                />
                {errors.studentProfile?.bio && (
                  <p className="mt-1 text-sm text-red-600">{errors.studentProfile.bio.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Select
                  label={t.experienceLevel}
                  required
                  {...register('studentProfile.experienceLevel', {
                    required: t.experienceLevelRequired,
                  })}
                  error={errors.studentProfile?.experienceLevel?.message}
                  options={[
                    { value: 'Beginner', label: t.beginner },
                    { value: 'Intermediate', label: t.intermediate },
                    { value: 'Advanced', label: t.advanced },
                    { value: 'Expert', label: t.expert },
                  ]}
                  placeholder={t.selectExperienceLevel}
                />

                <Input
                  label={t.yearsOfExperience}
                  type="number"
                  {...register('studentProfile.yearsOfExperience', {
                    min: { value: 0, message: t.cannotBeNegative },
                    max: { value: 50, message: t.invalidYears }
                  })}
                  error={errors.studentProfile?.yearsOfExperience?.message}
                  placeholder="0"
                />

                <Select
                  label={t.availability}
                  {...register('studentProfile.availability')}
                  error={errors.studentProfile?.availability?.message}
                  options={[
                    { value: 'Available', label: t.available },
                    { value: 'Busy', label: t.busy },
                  ]}
                />

                <Select
                  label={t.currency}
                  {...register('studentProfile.hourlyRate.currency')}
                  error={errors.studentProfile?.hourlyRate?.currency?.message}
                  options={[
                    { value: 'USD', label: 'USD - US Dollar' },
                    { value: 'EUR', label: 'EUR - Euro' },
                    { value: 'EGP', label: 'EGP - Egyptian Pound' },
                    { value: 'GBP', label: 'GBP - British Pound' },
                    { value: 'AED', label: 'AED - UAE Dirham' },
                    { value: 'SAR', label: 'SAR - Saudi Riyal' },
                    { value: 'QAR', label: 'QAR - Qatari Riyal' },
                    { value: 'KWD', label: 'KWD - Kuwaiti Dinar' },
                    { value: 'BHD', label: 'BHD - Bahraini Dinar' },
                    { value: 'OMR', label: 'OMR - Omani Rial' },
                    { value: 'JOD', label: 'JOD - Jordanian Dinar' },
                    { value: 'LBP', label: 'LBP - Lebanese Pound' },
                    { value: 'ILS', label: 'ILS - Israeli Shekel' },
                    { value: 'TRY', label: 'TRY - Turkish Lira' },
                    { value: 'ZAR', label: 'ZAR - South African Rand' },
                    { value: 'MAD', label: 'MAD - Moroccan Dirham' },
                    { value: 'TND', label: 'TND - Tunisian Dinar' },
                    { value: 'DZD', label: 'DZD - Algerian Dinar' },
                    { value: 'NGN', label: 'NGN - Nigerian Naira' },
                    { value: 'KES', label: 'KES - Kenyan Shilling' },
                    { value: 'GHS', label: 'GHS - Ghanaian Cedi' },
                    { value: 'UGX', label: 'UGX - Ugandan Shilling' },
                    { value: 'TZS', label: 'TZS - Tanzanian Shilling' },
                    { value: 'ETB', label: 'ETB - Ethiopian Birr' },
                    { value: 'CHF', label: 'CHF - Swiss Franc' },
                    { value: 'SEK', label: 'SEK - Swedish Krona' },
                    { value: 'NOK', label: 'NOK - Norwegian Krone' },
                    { value: 'DKK', label: 'DKK - Danish Krone' },
                    { value: 'PLN', label: 'PLN - Polish Zloty' },
                    { value: 'CZK', label: 'CZK - Czech Koruna' },
                    { value: 'HUF', label: 'HUF - Hungarian Forint' },
                    { value: 'RON', label: 'RON - Romanian Leu' },
                    { value: 'BGN', label: 'BGN - Bulgarian Lev' },
                    { value: 'HRK', label: 'HRK - Croatian Kuna' },
                    { value: 'RUB', label: 'RUB - Russian Ruble' },
                    { value: 'UAH', label: 'UAH - Ukrainian Hryvnia' },
                  ]}
                  placeholder={t.selectCurrency}
                />

                <Input
                  label={t.hourlyRateMin}
                  type="number"
                  {...register('studentProfile.hourlyRate.min', {
                    min: { value: 0, message: t.cannotBeNegative }
                  })}
                  error={errors.studentProfile?.hourlyRate?.min?.message}
                  placeholder={t.minimumRate}
                />

                <Input
                  label={t.hourlyRateMax}
                  type="number"
                  {...register('studentProfile.hourlyRate.max', {
                    min: { value: 0, message: t.cannotBeNegative }
                  })}
                  error={errors.studentProfile?.hourlyRate?.max?.message}
                  placeholder={t.maximumRate}
                />
              </div>
            </div>
          </div>

          {/* Social Links Section */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">{t.socialLinks}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Input
                label={t.github}
                {...register('studentProfile.socialLinks.github')}
                error={errors.studentProfile?.socialLinks?.github?.message}
                placeholder={t.githubPlaceholder}
              />

              <Input
                label={t.linkedin}
                {...register('studentProfile.socialLinks.linkedin')}
                error={errors.studentProfile?.socialLinks?.linkedin?.message}
                placeholder={t.linkedinPlaceholder}
              />

              <Input
                label={t.personalWebsite}
                {...register('studentProfile.socialLinks.website')}
                error={errors.studentProfile?.socialLinks?.website?.message}
                placeholder={t.websitePlaceholder}
              />

              <Input
                label={t.behance}
                {...register('studentProfile.socialLinks.behance')}
                error={errors.studentProfile?.socialLinks?.behance?.message}
                placeholder={t.behancePlaceholder}
              />

              <Input
                label={t.telegram}
                {...register('studentProfile.socialLinks.telegram')}
                error={errors.studentProfile?.socialLinks?.telegram?.message}
                placeholder={t.telegramPlaceholder}
              />

              <Input
                label={t.whatsapp}
                {...register('studentProfile.socialLinks.whatsapp')}
                error={errors.studentProfile?.socialLinks?.whatsapp?.message}
                placeholder={t.whatsappPlaceholder}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEditModal(false)}
              disabled={updateProfileMutation.isLoading}
              className="w-full sm:w-auto text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5"
            >
              {t.cancel}
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={updateProfileMutation.isLoading}
              disabled={updateProfileMutation.isLoading}
              className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5"
            >
              <Save className="w-3 h-3 sm:w-4 sm:h-4" />
              {t.saveChanges}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Profile;
