import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { profileService } from '../../services/profileService';
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
  },
};

const UnlockedStudents = () => {
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
  console.log('Unlocked Students:', data);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.unlockedStudents}</h1>
          <p className="text-gray-600 mt-2">
            {t.allUnlocked}
          </p>
        </div>
        <Badge variant="primary" className="text-lg px-4 py-2">
          {students.length} {students.length === 1 ? t.student : t.students}
        </Badge>
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
            <Button variant="primary" onClick={() => navigate('/client/applications')}>
              {t.viewApplications}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {students.map((student) => (
            <Card key={student._id} className="hover:shadow-lg transition">
              <div className="flex items-start gap-6">
                {/* Profile Photo */}
                <div className="flex-shrink-0">
                  {student.photo ? (
                    <img
                      src={student.photo}
                      alt={student.name}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="w-12 h-12 text-primary-600" />
                    </div>
                  )}
                </div>

                {/* Student Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                    {student.location?.city && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="w-4 h-4 text-primary-600" />
                        <span className="text-sm">
                          {student.location.city}
                          {student.location.country && `, ${student.location.country}`}
                        </span>
                      </div>
                    )}
                    {student.createdAt && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4 text-primary-600" />
                        <span className="text-sm">
                          {t.joined}{' '}
                          {new Date(student.createdAt).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', {
                            year: 'numeric',
                            month: 'short',
                          })}
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
                          student.studentProfile.availability === 'available'
                            ? 'success'
                            : student.studentProfile.availability === 'busy'
                            ? 'warning'
                            : 'error'
                        }
                      >
                        {student.studentProfile.availability === 'available' ? t.available :
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
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {t.viewFullProfile}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UnlockedStudents;
