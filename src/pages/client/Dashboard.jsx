import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { authService } from '../../services/authService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { Plus, Briefcase, Users, Package, Receipt, UserCheck, Building, FileText, Unlock } from 'lucide-react';
import { logger } from '../../utils/logger';
import { useAuthStore } from '../../stores/authStore';

const translations = {
  en: {
    welcome: 'Welcome to Your Dashboard',
    subtitle: 'Manage your job postings and connect with talented students',
    totalApplications: 'Total Applications',
    receivedForJobs: 'Received for your jobs',
    totalJobsPosted: 'Total Jobs Posted',
    jobsCreated: 'Jobs you\'ve created',
    unlockedProfiles: 'Unlocked Profiles',
    studentContactsUnlocked: 'Student contacts unlocked',
    quickActions: 'Quick Actions',
    postNewJob: 'Post New Job',
    postNewJobDesc: 'Create a new job posting for students',
    myJobs: 'My Jobs',
    myJobsDesc: 'View and manage your job posts',
    applications: 'Applications',
    applicationsDesc: 'Review student applications',
    packages: 'Packages',
    packagesDesc: 'Purchase points packages',
    transactionHistory: 'Transaction History',
    transactionHistoryDesc: 'View your payment history',
    gettingStarted: 'Getting Started',
    step1: 'Click "Post New Job" to create your first job posting',
    step2: 'Students will see your job and can apply with structured proposals',
    step3: 'Review applications and hire the best talent for your projects',
    platformBenefits: 'Platform Benefits',
    benefit1: 'Access to talented student freelancers',
    benefit2: 'Structured application process',
    benefit3: 'Cost-effective solutions for your projects',
    benefit4: 'Easy job management and tracking',
  },
  it: {
    welcome: 'Benvenuto nella Tua Dashboard',
    subtitle: 'Gestisci i tuoi annunci di lavoro e connettiti con studenti talentuosi',
    totalApplications: 'Candidature Totali',
    receivedForJobs: 'Ricevute per i tuoi lavori',
    totalJobsPosted: 'Lavori Pubblicati Totali',
    jobsCreated: 'Lavori che hai creato',
    unlockedProfiles: 'Profili Sbloccati',
    studentContactsUnlocked: 'Contatti studenti sbloccati',
    quickActions: 'Azioni Rapide',
    postNewJob: 'Pubblica Nuovo Lavoro',
    postNewJobDesc: 'Crea un nuovo annuncio di lavoro per studenti',
    myJobs: 'I Miei Lavori',
    myJobsDesc: 'Visualizza e gestisci i tuoi annunci di lavoro',
    applications: 'Candidature',
    applicationsDesc: 'Rivedi le candidature degli studenti',
    packages: 'Pacchetti',
    packagesDesc: 'Acquista pacchetti di punti',
    transactionHistory: 'Cronologia Transazioni',
    transactionHistoryDesc: 'Visualizza la tua cronologia pagamenti',
    gettingStarted: 'Iniziare',
    step1: 'Clicca "Pubblica Nuovo Lavoro" per creare il tuo primo annuncio di lavoro',
    step2: 'Gli studenti vedranno il tuo lavoro e potranno candidarsi con proposte strutturate',
    step3: 'Rivedi le candidature e assumi i migliori talenti per i tuoi progetti',
    platformBenefits: 'Vantaggi della Piattaforma',
    benefit1: 'Accesso a studenti freelance talentuosi',
    benefit2: 'Processo di candidatura strutturato',
    benefit3: 'Soluzioni convenienti per i tuoi progetti',
    benefit4: 'Gestione e monitoraggio facili dei lavori',
  },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('dashboardLanguage') || 'en';
  });

  // Log dashboard view
  useEffect(() => {
    logger.info('Client dashboard viewed', { action: 'dashboard_view', role: 'client', userId: user?._id });
  }, []);

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

  // Fetch platform statistics
  const { data: statsData, isLoading: loadingStats } = useQuery({
    queryKey: ['platformStats'],
    queryFn: () => authService.getPlatformStats(),
  });

  // Fetch client dashboard statistics
  const { data: clientStatsData, isLoading: loadingClientStats } = useQuery({
    queryKey: ['clientDashboardStats'],
    queryFn: () => authService.getClientDashboardStats(),
  });

  const quickActions = [
    {
      title: t.postNewJob,
      description: t.postNewJobDesc,
      icon: Plus,
      action: () => navigate('/client/jobs/new'),
      variant: 'primary',
    },
    {
      title: t.myJobs,
      description: t.myJobsDesc,
      icon: Briefcase,
      action: () => navigate('/client/jobs'),
      variant: 'secondary',
    },
    {
      title: t.applications,
      description: t.applicationsDesc,
      icon: Users,
      action: () => navigate('/client/applications'),
      variant: 'secondary',
    },
    {
      title: t.packages,
      description: t.packagesDesc,
      icon: Package,
      action: () => navigate('/client/packages'),
      variant: 'secondary',
    },
    {
      title: t.transactionHistory,
      description: t.transactionHistoryDesc,
      icon: Receipt,
      action: () => navigate('/client/transactions'),
      variant: 'secondary',
    },
  ];

  const stats = statsData?.data;
  console.log('Platform Stats:', statsData);

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t.welcome}</h1>
        <p className="text-sm sm:text-base text-gray-600">{t.subtitle}</p>
      </div>

      {/* Client Dashboard Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-100 rounded-full">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t.totalApplications}</p>
              <p className="text-3xl font-bold text-gray-900">
                {loadingClientStats ? '...' : clientStatsData?.data?.totalApplications?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">{t.receivedForJobs}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-green-100 rounded-full">
              <Briefcase className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t.totalJobsPosted}</p>
              <p className="text-3xl font-bold text-gray-900">
                {loadingClientStats ? '...' : clientStatsData?.data?.totalJobs?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">{t.jobsCreated}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-purple-100 rounded-full">
              <Unlock className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t.unlockedProfiles}</p>
              <p className="text-3xl font-bold text-gray-900">
                {loadingClientStats ? '...' : clientStatsData?.data?.totalUnlockedProfiles?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">{t.studentContactsUnlocked}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title={t.quickActions}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div
                key={index}
                className="p-6 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all cursor-pointer"
                onClick={action.action}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={`p-4 rounded-full ${
                    action.variant === 'primary'
                      ? 'bg-primary-100 text-primary-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                  <Button
                    variant={action.variant}
                    size="sm"
                    className="w-full"
                  >
                    {action.title}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Additional Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card title={t.gettingStarted}>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-primary-600 font-bold">1.</span>
              <span>{t.step1}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 font-bold">2.</span>
              <span>{t.step2}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 font-bold">3.</span>
              <span>{t.step3}</span>
            </li>
          </ul>
        </Card>

        <Card title={t.platformBenefits}>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>{t.benefit1}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>{t.benefit2}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>{t.benefit3}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>{t.benefit4}</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
