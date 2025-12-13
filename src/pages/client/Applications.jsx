import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { applicationService } from '../../services/applicationService';
import { authService } from '../../services/authService';
import { packageService } from '../../services/packageService';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import {
  Eye,
  DollarSign,
  Calendar,
  FileText,
  Briefcase,
} from 'lucide-react';

const translations = {
  en: {
    loading: 'Loading applications...',
    failedToLoad: 'Failed to load applications: {error}',
    jobApplications: 'Job Applications',
    reviewGrouped: 'Review applications grouped by job posting',
    availablePoints: 'Available Points',
    pointsPerContact: '10 points per contact',
    getMorePoints: 'Get More Points',
    insufficientPoints: 'You have insufficient points to unlock student contacts. Purchase a package to continue viewing applicant details.',
    noApplicationsYet: 'No applications received yet.',
    applicants: 'Applicant',
    applicantsPlural: 'Applicants',
    viewJob: 'View Job',
    viewAllApplications: 'View All Applications',
  },
  it: {
    loading: 'Caricamento candidature...',
    failedToLoad: 'Impossibile caricare le candidature: {error}',
    jobApplications: 'Candidature di Lavoro',
    reviewGrouped: 'Rivedi le candidature raggruppate per annuncio di lavoro',
    availablePoints: 'Punti Disponibili',
    pointsPerContact: '10 punti per contatto',
    getMorePoints: 'Ottieni Altri Punti',
    insufficientPoints: 'Hai punti insufficienti per sbloccare i contatti degli studenti. Acquista un pacchetto per continuare a visualizzare i dettagli dei candidati.',
    noApplicationsYet: 'Nessuna candidatura ricevuta ancora.',
    applicants: 'Candidato',
    applicantsPlural: 'Candidati',
    viewJob: 'Visualizza Lavoro',
    viewAllApplications: 'Visualizza Tutte le Candidature',
  },
};

const Applications = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('dashboardLanguage') || 'en';
  });

  // Listen for language changes from DashboardLayout
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

  // Fetch applications for all jobs
  const { data: applicationsData, isLoading: loadingApplications, error: applicationsError } = useQuery({
    queryKey: ['allApplications'],
    queryFn: async () => {
      return applicationService.getMyApplications({ limit: 100 });
    },
  });

  // Fetch user data (including points) - always fetch fresh data
  const { data: userData, isLoading: loadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authService.getMe(),
    refetchOnMount: true,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  // Fetch points balance separately for more reliable data
  const { data: pointsData, isLoading: loadingPoints } = useQuery({
    queryKey: ['pointsBalance'],
    queryFn: () => packageService.getPointsBalance(),
    refetchOnMount: true,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  // Group applications by job
  const groupedApplications = useMemo(() => {
    try {
      const applications = applicationsData?.data?.applications || [];
      const grouped = {};

      applications.forEach((app) => {
        const jobId = app.jobPost?._id;
        if (!jobId) {
          console.warn('Application without jobPost:', app);
          return;
        }

        if (!grouped[jobId]) {
          grouped[jobId] = {
            job: app.jobPost,
            applications: [],
          };
        }
        grouped[jobId].applications.push(app);
      });

      return Object.values(grouped);
    } catch (error) {
      console.error('Error grouping applications:', error);
      return [];
    }
  }, [applicationsData]);

  if (loadingApplications || loadingPoints) {
    return <Loading text={t.loading} />;
  }

  if (applicationsError) {
    return (
      <Alert
        type="error"
        message={t.failedToLoad.replace('{error}', applicationsError.response?.data?.message || applicationsError.message)}
      />
    );
  }

  // Get points from dedicated points service (more reliable) with fallback to user data
  const pointsRemaining = pointsData?.data?.pointsRemaining ?? 
                          userData?.data?.user?.clientProfile?.pointsRemaining ?? 0;
  
  return (
    <div className="space-y-6">
      {/* Header with Points */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.jobApplications}</h1>
          <p className="text-gray-600 mt-1">{t.reviewGrouped}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-primary-50 border border-primary-200 rounded-lg px-4 py-2">
            <p className="text-sm text-primary-600 font-medium">{t.availablePoints}</p>
            <p className="text-2xl font-bold text-primary-700">{pointsRemaining}</p>
            <p className="text-xs text-primary-500">{t.pointsPerContact}</p>
          </div>
          <Button variant="primary" onClick={() => navigate('/client/packages')}>
            {t.getMorePoints}
          </Button>
        </div>
      </div>

      {/* Low Points Warning */}
      {pointsRemaining < 10 && (
        <Alert type="warning" message={t.insufficientPoints} />
      )}

      {/* Grouped Applications by Job */}
      {groupedApplications.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">{t.noApplicationsYet}</p>
     
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {groupedApplications.map(({ job, applications }) => (
            <Card key={job._id}>
              {/* Job Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-6 h-6 text-primary-600 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          {job.budget?.currency} {job.budget?.min} - {job.budget?.max}
                        </span>
          
                        <Badge variant="info">{job.category}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success">
                    {applications.length} {applications.length !== 1 ? t.applicantsPlural : t.applicants}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/client/jobs/${job._id}`)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {t.viewJob}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/client/jobs/${job._id}/applications`)}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {t.viewAllApplications}
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

export default Applications;
