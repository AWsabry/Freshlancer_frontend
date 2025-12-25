import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { profileService } from '../../services/profileService';
import { API_BASE_URL } from '../../config/env';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Eye,
  Briefcase,
  Calendar,
  LayoutGrid,
  List,
} from 'lucide-react';

const translations = {
  en: {
    loading: 'Loading unlocked students...',
    error: 'Error',
    failedToLoad: 'Failed to load unlocked students',
    unlockedStudents: 'Unlocked Students',
    allUnlocked: 'All students whose profiles you have unlocked',
    student: 'Student',
    students: 'Students',
    noUnlockedYet: 'No Unlocked Students Yet',
    noUnlockedMessage: "You haven't unlocked any student profiles yet. Browse job applications to unlock student profiles.",
    viewApplications: 'View Applications',
    skills: 'Skills',
    more: 'more',
    joined: 'Joined',
    viewFullProfile: 'View Full Profile',
    available: 'available',
    busy: 'busy',
    unavailable: 'unavailable',
    detailedView: 'Detailed View',
    compactView: 'Compact View',
    viewMode: 'View Mode',
  },
  it: {
    loading: 'Caricamento studenti sbloccati...',
    error: 'Errore',
    failedToLoad: 'Impossibile caricare gli studenti sbloccati',
    unlockedStudents: 'Studenti Sbloccati',
    allUnlocked: 'Tutti gli studenti i cui profili hai sbloccato',
    student: 'Studente',
    students: 'Studenti',
    noUnlockedYet: 'Nessuno Studente Sbloccato Ancora',
    noUnlockedMessage: 'Non hai ancora sbloccato nessun profilo studente. Sfoglia le candidature di lavoro per sbloccare i profili degli studenti.',
    viewApplications: 'Visualizza Candidature',
    skills: 'Competenze',
    more: 'altri',
    joined: 'Iscritto',
    viewFullProfile: 'Visualizza Profilo Completo',
    available: 'disponibile',
    busy: 'occupato',
    unavailable: 'non disponibile',
    detailedView: 'Vista Dettagliata',
    compactView: 'Vista Compatta',
    viewMode: 'Modalità Visualizzazione',
  },
};

const UnlockedStudents = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('dashboardLanguage') || 'en';
  });
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('unlockedStudentsViewMode') || 'detailed';
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

  // Helper function to format date from ISO 8601 format
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'N/A';
    }
  }, [language]);

  // State for image errors
  const [imageErrors, setImageErrors] = useState({});
  
  const handleImageError = (key) => {
    setImageErrors(prev => ({ ...prev, [key]: true }));
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('unlockedStudentsViewMode', mode);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['unlockedStudents'],
    queryFn: () => profileService.getUnlockedStudents(),
  });

  if (isLoading) {
    return <Loading text={t.loading} />;
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <Alert
          type="error"
          title={t.error}
          message={error.response?.data?.message || t.failedToLoad}
        />
      </div>
    );
  }

  const students = data?.data?.students || [];

  console.log(students);

  return (
    <div className="space-y-6 px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t.unlockedStudents}</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            {t.allUnlocked}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="primary" className="text-base sm:text-lg px-4 py-2 w-full sm:w-auto text-center">
            {students.length} {students.length === 1 ? t.student : t.students}
          </Badge>
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1 bg-white">
            <button
              onClick={() => handleViewModeChange('detailed')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'detailed'
                  ? 'bg-primary-600 text-black hover:bg-primary-500'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={t.detailedView}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleViewModeChange('compact')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'compact'
                  ? 'bg-primary-600 text-black hover:bg-primary-500'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={t.compactView}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Students List */}
      {students.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t.noUnlockedYet}
            </h3>
            <p className="text-gray-600 mb-6">
              {t.noUnlockedMessage}
            </p>
     
          </div>
        </Card>
      ) : (
        viewMode === 'compact' ? (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-700">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-semibold">{t.student}</th>
                    <th className="text-left py-3 px-4 font-semibold">{t.skills}</th>
                    <th className="text-left py-3 px-4 font-semibold">{t.joined}</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, idx) => {
                    const imageKey = `img-${student._id}`;
                    return (
                      <tr
                        key={student._id}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                              {student.photo && hasValidPhoto(student.photo) && !imageErrors[imageKey] ? (
                                <img
                                  src={getPhotoUrl(student.photo)}
                                  alt={student.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                  onError={() => handleImageError(imageKey)}
                                />
                              ) : (
                                <span className="text-primary-600 font-semibold text-xs">
                                  {student.name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-gray-900 truncate">{student.name}</div>
                              <div className="text-xs text-gray-500 truncate">{student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {student.studentProfile?.skills && student.studentProfile.skills.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {student.studentProfile.skills.slice(0, 3).map((skill, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {typeof skill === 'string' ? skill : skill.name || skill}
                                </Badge>
                              ))}
                              {student.studentProfile.skills.length > 3 && (
                                <span className="text-xs text-primary-600">
                                  +{student.studentProfile.skills.length - 3}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">No skills</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs text-gray-500">
                            {formatDate(student.joinedAt || student.createdAt)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="primary"
                            size="xs"
                            onClick={() => navigate(`/client/students/${student._id}`)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            {t.viewFullProfile}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {students.map((student) => {
              const imageKey = `img-${student._id}`;
              return (
                <Card key={student._id} className="hover:shadow-lg transition">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                    {/* Profile Photo */}
                    <div className="flex-shrink-0">
                      {student.photo && hasValidPhoto(student.photo) && !imageErrors[imageKey] ? (
                        <img
                          src={getPhotoUrl(student.photo)}
                          alt={student.name}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-primary-100"
                          onError={() => handleImageError(imageKey)}
                        />
                      ) : (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary-100 flex items-center justify-center border-4 border-primary-200">
                          <span className="text-primary-600 font-bold text-2xl sm:text-3xl">
                            {student?.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                    </div>

                {/* Student Info */}
                <div className="flex-1 min-w-0 w-full text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-2">
                    <div className="flex-1">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                        {student.name}
                      </h2>
                      {student.studentProfile?.bio && (
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {student.studentProfile.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail className="w-4 h-4 text-primary-600" />
                      <span className="text-sm">{student.email}</span>
                    </div>
                    {student.phone && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-4 h-4 text-primary-600" />
                        <span className="text-sm">{student.phone}</span>
                      </div>
                    )}
                    {(student.location?.city || student.country) && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="w-4 h-4 text-primary-600" />
                        <span className="text-sm">
                          {[student.location?.city, student.country].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                    {(student.joinedAt || student.createdAt) && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4 text-primary-600" />
                        <span className="text-sm">
                          {t.joined}{' '}
                          {formatDate(student.joinedAt || student.createdAt)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  {student.studentProfile?.skills &&
                    student.studentProfile.skills.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">{t.skills}</h3>
                        <div className="flex flex-wrap gap-2">
                          {student.studentProfile.skills.slice(0, 6).map((skill, index) => (
                            <Badge key={index} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                          {student.studentProfile.skills.length > 6 && (
                            <Badge variant="secondary">
                              +{student.studentProfile.skills.length - 6} {t.more}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                  {/* Experience & Availability */}
                  <div className="flex flex-wrap gap-4 mb-4">
                    {student.studentProfile?.experienceLevel && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 capitalize">
                          {student.studentProfile.experienceLevel}
                        </span>
                      </div>
                    )}
                    {student.studentProfile?.availability && (
                      <Badge
                        variant={
                          student.studentProfile.availability === 'Available'
                            ? 'success'
                            : student.studentProfile.availability === 'busy'
                            ? 'warning'
                            : 'error'
                        }
                      >
                        {student.studentProfile.availability === 'Available' ? t.available :
                         student.studentProfile.availability === 'busy' ? t.busy :
                         t.unavailable}
                      </Badge>
                    )}
                  </div>

                  {/* Action Button */}
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/client/students/${student._id}`)}
                    className="w-full sm:w-auto"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {t.viewFullProfile}
                  </Button>
                </div>
              </div>
            </Card>
              );
            })}
          </div>
        )
      )}
    </div>
  );
};

export default UnlockedStudents;
