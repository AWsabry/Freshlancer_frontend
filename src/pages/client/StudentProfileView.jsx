import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { profileService } from '../../services/profileService';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  Globe,
  Github,
  Linkedin,
  FileText,
  Download,
  Star,
  Clock,
  DollarSign,
  ArrowLeft,
  ExternalLink,
  Crown,
} from 'lucide-react';
import { API_BASE_URL } from '../../config/env';

const translations = {
  en: {
    loading: 'Loading student profile...',
    failedToLoad: 'Failed to load student profile:',
    backToApplications: 'Back to Applications',
    studentNotFound: 'Student not found',
    yearsOld: 'years old',
    socialLinks: 'Social Links:',
    resumeCV: 'Resume / CV',
    uploaded: 'Uploaded:',
    downloadCV: 'Download CV',
    additionalDocuments: 'Additional Documents',
    view: 'View',
    experienceRate: 'Experience & Rate',
    experienceLevel: 'Experience Level',
    yearsOfExperience: 'Years of Experience',
    years: 'years',
    hourlyRate: 'Hourly Rate',
    skills: 'Skills',
    education: 'Education',
    university: 'University',
    visitUniversityWebsite: 'Visit university website',
    expectedGraduation: 'Expected Graduation:',
    portfolio: 'Portfolio',
    completed: 'Completed:',
    certifications: 'Certifications',
    issued: 'Issued:',
    expires: 'Expires:',
    credentialId: 'Credential ID:',
    verify: 'Verify',
    languages: 'Languages',
    available: 'Available',
    busy: 'Busy',
  },
  it: {
    loading: 'Caricamento profilo studente...',
    failedToLoad: 'Impossibile caricare il profilo studente:',
    backToApplications: 'Torna alle Candidature',
    studentNotFound: 'Studente non trovato',
    yearsOld: 'anni',
    socialLinks: 'Link Social:',
    resumeCV: 'Curriculum / CV',
    uploaded: 'Caricato:',
    downloadCV: 'Scarica CV',
    additionalDocuments: 'Documenti Aggiuntivi',
    view: 'Visualizza',
    experienceRate: 'Esperienza e Tariffa',
    experienceLevel: 'Livello di Esperienza',
    yearsOfExperience: 'Anni di Esperienza',
    years: 'anni',
    hourlyRate: 'Tariffa Oraria',
    skills: 'Competenze',
    education: 'Istruzione',
    university: 'Università',
    visitUniversityWebsite: 'Visita il sito web dell\'università',
    expectedGraduation: 'Laurea Prevista:',
    portfolio: 'Portfolio',
    completed: 'Completato:',
    certifications: 'Certificazioni',
    issued: 'Rilasciato:',
    expires: 'Scade:',
    credentialId: 'ID Credenziale:',
    verify: 'Verifica',
    languages: 'Lingue',
    available: 'Disponibile',
    busy: 'Occupato',
  },
};

const StudentProfileView = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
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

  // State for image error
  const [photoLoadError, setPhotoLoadError] = useState(false);

  // Fetch student profile
  const { data: profileData, isLoading, error } = useQuery({
    queryKey: ['studentProfile', studentId],
    queryFn: () => profileService.getStudentProfile(studentId),
  });

  if (isLoading) {
    return <Loading text={t.loading} />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert
          type="error"
          message={`${t.failedToLoad} ${error.response?.data?.message || error.message}`}
        />
        <Button variant="secondary" onClick={() => navigate('/client/applications')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t.backToApplications}
        </Button>
      </div>
    );
  }

  const student = profileData?.data?.student;

  if (!student) {
    return <Alert type="error" message={t.studentNotFound} />;
  }

  const profile = student.studentProfile || {};

  return (
    <div className="space-y-6 px-4 sm:px-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="secondary" onClick={() => navigate('/client/applications')} className="w-full sm:w-auto">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t.backToApplications}
        </Button>
      </div>

      {/* Basic Information Card */}
      <Card>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          {/* Profile Photo */}
          <div className="flex-shrink-0">
            {student.photo && hasValidPhoto(student.photo) && !photoLoadError ? (
              <img
                src={getPhotoUrl(student.photo)}
                alt={student.name}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-primary-100"
                onError={() => setPhotoLoadError(true)}
                onLoad={() => setPhotoLoadError(false)}
              />
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-primary-100 flex items-center justify-center border-4 border-primary-200">
                <span className="text-primary-600 font-bold text-3xl sm:text-4xl">
                  {student?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="flex-1 w-full text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{student.name}</h1>
              {student.subscriptionTier === 'premium' && (
                <Badge variant="success" className="flex items-center gap-1 text-xs sm:text-sm bg-yellow-100 text-yellow-800 border-yellow-300">
                  <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
                  Premium
                </Badge>
              )}
            </div>

            {profile.bio && (
              <p className="text-gray-600 mb-4">{profile.bio}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
              <div className="flex items-center gap-2 text-gray-700">
                <Mail className="w-5 h-5 text-primary-600" />
                <span>{student.email}</span>
              </div>

              {student.phone && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="w-5 h-5 text-primary-600" />
                  <span>{student.phone}</span>
                </div>
              )}

              {student.age && (
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="w-5 h-5 text-primary-600" />
                  <span>{student.age} {t.yearsOld}</span>
                </div>
              )}

              {student.nationality && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Globe className="w-5 h-5 text-primary-600" />
                  <span>{student.nationality}</span>
                </div>
              )}

              {(student.location?.city || student.country) && (
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  <span>
                    {[student.location?.city, student.country].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}

              {profile.availability && (
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary-600" />
                  <Badge
                    variant={
                      profile.availability === 'Available'
                        ? 'success'
                        : profile.availability === 'Busy'
                        ? 'warning'
                        : 'default'
                    }
                  >
                    {profile.availability === 'Available' ? t.available :
                     profile.availability === 'Busy' ? t.busy :
                     profile.availability}
                  </Badge>
                </div>
              )}
            </div>

            {/* Social Links */}
            {profile.socialLinks && Object.values(profile.socialLinks).some(link => link) && (
              <div className="flex items-center gap-3 pt-4 border-t">
                <span className="font-semibold text-gray-700">{t.socialLinks}</span>
                {profile.socialLinks.github && (
                  <a
                    href={profile.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary-600 hover:text-primary-700"
                  >
                    <Github className="w-5 h-5" />
                    <span className="text-sm">GitHub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {profile.socialLinks.linkedin && (
                  <a
                    href={profile.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary-600 hover:text-primary-700"
                  >
                    <Linkedin className="w-5 h-5" />
                    <span className="text-sm">LinkedIn</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {profile.socialLinks.website && (
                  <a
                    href={profile.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary-600 hover:text-primary-700"
                  >
                    <Globe className="w-5 h-5" />
                    <span className="text-sm">Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {profile.socialLinks.behance && (
                  <a
                    href={profile.socialLinks.behance}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary-600 hover:text-primary-700"
                  >
                    <Briefcase className="w-5 h-5" />
                    <span className="text-sm">Behance</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {profile.socialLinks.telegram && (
                  <a
                    href={profile.socialLinks.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary-600 hover:text-primary-700"
                  >
                    <Globe className="w-5 h-5" />
                    <span className="text-sm">Telegram</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {profile.socialLinks.whatsapp && (
                  <a
                    href={profile.socialLinks.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary-600 hover:text-primary-700"
                  >
                    <Phone className="w-5 h-5" />
                    <span className="text-sm">WhatsApp</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Resume/CV */}
      {profile.resume && profile.resume.url && (
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-primary-600" />
              <div>
                <h3 className="font-bold text-lg">{t.resumeCV}</h3>
                <p className="text-sm text-gray-600">{profile.resume.filename || 'resume.pdf'}</p>
                {profile.resume.uploadedAt && (
                  <p className="text-xs text-gray-500">
                    {t.uploaded} {new Date(profile.resume.uploadedAt).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US')}
                  </p>
                )}
              </div>
            </div>
            <a
              href={`${API_BASE_URL}${profile.resume.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <Button variant="primary">
                <Download className="w-4 h-4 mr-2" />
                {t.downloadCV}
              </Button>
            </a>
          </div>
        </Card>
      )}

      {/* Additional Documents */}
      {profile.additionalDocuments && profile.additionalDocuments.length > 0 && (
        <Card>
          <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary-600" />
            {t.additionalDocuments}
          </h3>
          <div className="space-y-3">
            {profile.additionalDocuments.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3 flex-1">
                  <FileText className="w-6 h-6 text-primary-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{doc.filename}</p>
                    {doc.description && (
                      <p className="text-sm text-gray-600 truncate">{doc.description}</p>
                    )}
                    {doc.uploadedAt && (
                      <p className="text-xs text-gray-500">
                        {t.uploaded} {new Date(doc.uploadedAt).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US')}
                      </p>
                    )}
                  </div>
                </div>
                <a
                  href={`${API_BASE_URL}${doc.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <Button variant="primary" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    {t.view}
                  </Button>
                </a>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Experience & Rate */}
      {(profile.experienceLevel || profile.hourlyRate) && (
        <Card>
          <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary-600" />
            {t.experienceRate}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {profile.experienceLevel && (
              <div>
                <p className="text-sm text-gray-600 mb-1">{t.experienceLevel}</p>
                <Badge variant="info" className="text-base">
                  {profile.experienceLevel}
                </Badge>
              </div>
            )}
            {profile.yearsOfExperience !== undefined && (
              <div>
                <p className="text-sm text-gray-600 mb-1">{t.yearsOfExperience}</p>
                <p className="font-bold text-lg">{profile.yearsOfExperience} {t.years}</p>
              </div>
            )}
            {profile.hourlyRate && (
              <div>
                <p className="text-sm text-gray-600 mb-1">{t.hourlyRate}</p>
                <p className="font-bold text-lg text-green-600">
                  {profile.hourlyRate.min} - {profile.hourlyRate.max} {profile.hourlyRate.currency}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <Card>
          <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
            <Code className="w-6 h-6 text-primary-600" />
            {t.skills}
          </h3>
          <div className="flex flex-wrap gap-3">
            {profile.skills.map((skill, index) => (
              <div key={index} className="bg-primary-50 border border-primary-200 rounded-lg px-4 py-2">
                <div className="font-semibold text-primary-900">
                  {typeof skill === 'string' ? skill : skill.name || skill}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Education */}
      {(profile.university || profile.graduationYear) && (
        <Card>
          <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary-600" />
            {t.education}
          </h3>
          <div className="space-y-4">
            {/* University and Expected Graduation Year */}
            <div className="border-l-4 border-primary-500 pl-4 py-2 bg-primary-50 rounded-r-lg">
              {profile.university && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600 mb-1">{t.university}</p>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-lg text-gray-900">{profile.university}</p>
                    {profile.universityLink && (
                      <a
                        href={profile.universityLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                        title={t.visitUniversityWebsite}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              )}
              {profile.graduationYear && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary-600" />
                  <span className="text-sm text-gray-700">
                    <span className="font-semibold">{t.expectedGraduation}</span> {profile.graduationYear}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Portfolio */}
      {profile.portfolio && profile.portfolio.length > 0 && (
        <Card>
          <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary-600" />
            {t.portfolio}
          </h3>
          <div className="grid gap-4">
            {profile.portfolio.map((project, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-2">{project.title}</h4>
                    <p className="text-gray-700 mb-3">{project.description}</p>
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {project.technologies.map((tech, techIndex) => (
                          <Badge key={techIndex} variant="default">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {project.completedDate && (
                      <p className="text-sm text-gray-500">
                        {t.completed} {new Date(project.completedDate).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US')}
                      </p>
                    )}
                  </div>
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4"
                    >
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {t.view}
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Certifications */}
      {profile.certifications && profile.certifications.length > 0 && (
        <Card>
          <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-primary-600" />
            {t.certifications}
          </h3>
          <div className="space-y-4">
            {profile.certifications.map((cert, index) => (
              <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">{cert.name}</h4>
                    <p className="text-gray-700">{cert.issuingOrganization}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      {cert.issueDate && (
                        <span>
                          {t.issued} {new Date(cert.issueDate).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US')}
                        </span>
                      )}
                      {cert.expirationDate && (
                        <span>
                          {t.expires} {new Date(cert.expirationDate).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US')}
                        </span>
                      )}
                    </div>
                    {cert.credentialId && (
                      <p className="text-xs text-gray-500 mt-1">
                        {t.credentialId} {cert.credentialId}
                      </p>
                    )}
                  </div>
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4"
                    >
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {t.verify}
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Languages */}
      {profile.languages && profile.languages.length > 0 && (
        <Card>
          <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary-600" />
            {t.languages}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {profile.languages.map((lang, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <p className="font-semibold text-gray-900">{lang.language}</p>
                <p className="text-sm text-gray-600">{lang.proficiency}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default StudentProfileView;
