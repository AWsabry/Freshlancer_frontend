import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { subscriptionService } from '../../services/subscriptionService';
import { applicationService } from '../../services/applicationService';
import { verificationService } from '../../services/verificationService';
import { authService } from '../../services/authService';
import { contractService } from '../../services/contractService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { Briefcase, FileText, DollarSign, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { logger } from '../../utils/logger';
import { useAuthStore } from '../../stores/authStore';

const translations = {
  en: {
    loading: 'Loading dashboard...',
    verificationRequired: 'Verification Required',
    verificationRequiredMessage: 'Please complete your student verification to start applying for jobs.',
    applicationsThisMonth: 'Applications This Month',
    ofThisMonth: 'of {limit} this month',
    applicationsRemaining: 'Applications Remaining',
    premiumPlan: 'Premium Plan',
    freePlan: 'Free Plan',
    verification: 'Verification',
    verified: 'Verified',
    pending: 'Pending',
    rejected: 'Rejected',
    unverified: 'Unverified',
    package: 'Package',
    premium: 'Premium',
    free: 'Free',
    quickActions: 'Quick Actions',
    completeVerification: 'Complete Verification',
    browseJobs: 'Browse Jobs',
    viewApplications: 'View Applications',
    upgradeToPremium: 'Upgrade to Premium',
    recentApplications: 'Recent Applications',
    applied: 'Applied',
    noApplicationsYet: 'No applications yet',
  },
  it: {
    loading: 'Caricamento dashboard...',
    verificationRequired: 'Verifica Richiesta',
    verificationRequiredMessage: 'Completa la verifica dello studente per iniziare a candidarti per i lavori.',
    applicationsThisMonth: 'Candidature Questo Mese',
    ofThisMonth: 'di {limit} questo mese',
    applicationsRemaining: 'Candidature Rimanenti',
    premiumPlan: 'Piano Premium',
    freePlan: 'Piano Gratuito',
    verification: 'Verifica',
    verified: 'Verificato',
    pending: 'In Attesa',
    rejected: 'Rifiutato',
    unverified: 'Non Verificato',
    package: 'Pacchetto',
    premium: 'Premium',
    free: 'Gratuito',
    quickActions: 'Azioni Rapide',
    completeVerification: 'Completa Verifica',
    browseJobs: 'Sfoglia Lavori',
    viewApplications: 'Visualizza Candidature',
    upgradeToPremium: 'Passa a Premium',
    recentApplications: 'Candidature Recenti',
    applied: 'Candidato',
    noApplicationsYet: 'Nessuna candidatura ancora',
  },
  ar: {
    loading: 'جاري تحميل لوحة التحكم...',
    verificationRequired: 'التحقق مطلوب',
    verificationRequiredMessage: 'أكملي التحقق من صفتك كطالبة/طالبة لتتمكني من التقديم.',
    applicationsThisMonth: 'طلبات هذا الشهر',
    ofThisMonth: 'من {limit} لهذا الشهر',
    applicationsRemaining: 'الطلبات المتبقية',
    premiumPlan: 'الخطة المميزة',
    freePlan: 'الخطة المجانية',
    verification: 'التحقق',
    verified: 'موثّق',
    pending: 'قيد المراجعة',
    rejected: 'مرفوض',
    unverified: 'غير موثّق',
    package: 'الباقة',
    premium: 'مميز',
    free: 'مجاني',
    quickActions: 'إجراءات سريعة',
    completeVerification: 'أكملي التحقق',
    browseJobs: 'تصفح الوظائف',
    viewApplications: 'عرض الطلبات',
    upgradeToPremium: 'الترقية للمميز',
    recentApplications: 'أحدث الطلبات',
    applied: 'مُرسل',
    noApplicationsYet: 'لا طلبات بعد',
  },
};

const StudentDashboard = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('dashboardLanguage') || 'en';
  });

  // Log dashboard view
  useEffect(() => {
    logger.info('Student dashboard viewed', { action: 'dashboard_view', role: 'student', userId: user?._id });
  }, []);

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

  // Fetch verification status
  const { data: verificationStatus, isLoading: loadingVerification } = useQuery({
    queryKey: ['verificationStatus'],
    queryFn: () => verificationService.getVerificationStatus(),
  });

  // Fetch verification documents
  const { data: verificationData } = useQuery({
    queryKey: ['verifications'],
    queryFn: () => verificationService.getMyVerifications(),
    retry: 1,
  });

  // Fetch current user data (including application counts)
  const { data: userData, isLoading: loadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authService.getMe(),
  });

  // Fetch subscription info
  const { data: subscription, isLoading: loadingSubscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => subscriptionService.getMySubscription(),
  });

  // Fetch recent applications
  const { data: applications, isLoading: loadingApplications } = useQuery({
    queryKey: ['myApplications'],
    queryFn: () => applicationService.getMyApplications({ limit: 5 }),
  });

  // Fetch active contracts
  const { data: contracts, isLoading: loadingContracts } = useQuery({
    queryKey: ['myContracts'],
    queryFn: () => contractService.getMyContracts({ status: 'active' }),
  });

  if (loadingVerification || loadingSubscription || loadingUser) {
    return <Loading text={t.loading} />;
  }

  const subscriptionData = subscription?.data?.subscription;
  const studentProfile = userData?.data?.user?.studentProfile;
  
  // Check verification documents
  const verifications = verificationData?.data?.verifications || [];
  const hasApprovedVerification = Array.isArray(verifications) && verifications.length > 0 && verifications.some(v => v && v.status === 'approved');
  const hasPendingVerification = Array.isArray(verifications) && verifications.length > 0 && verifications.some(v => v && v.status === 'pending');
  
  // Determine verification status - check both user profile and verification documents
  const isVerified = studentProfile?.isVerified || hasApprovedVerification || verificationStatus?.data?.isVerified;
  const verificationStatusText = studentProfile?.verificationStatus || (hasApprovedVerification ? 'verified' : hasPendingVerification ? 'pending' : 'unverified');
  
  // Function to refresh verification status
  const handleRefreshVerification = () => {
    queryClient.invalidateQueries(['userProfile']);
    queryClient.invalidateQueries(['currentUser']);
    queryClient.invalidateQueries(['verifications']);
    queryClient.invalidateQueries(['verificationStatus']);
  };

  // Get application data from user profile
  const applicationsUsedThisMonth = studentProfile?.applicationsUsedThisMonth || 0;
  const subscriptionTier = studentProfile?.subscriptionTier || 'free';
  const applicationLimitPerMonth = subscriptionTier === 'premium' ? 100 : 10;
  const applicationsRemaining = applicationLimitPerMonth - applicationsUsedThisMonth;
  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-4 md:px-6">
      {/* Verification Alert */}
      {!isVerified && (
        <Alert
          type="warning"
          title={t.verificationRequired}
          message={t.verificationRequiredMessage}
        />
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="border-l-4 border-primary-500">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">{t.applicationsThisMonth}</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {applicationsUsedThisMonth}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                {t.ofThisMonth.replace('{limit}', applicationLimitPerMonth)}
              </p>
            </div>
            <Briefcase className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary-500 flex-shrink-0" />
          </div>
        </Card>

        <Card className="border-l-4 border-green-500">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">{t.applicationsRemaining}</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">
                {applicationsRemaining}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                {subscriptionTier === 'premium' ? t.premiumPlan : t.freePlan}
              </p>
            </div>
            <FileText className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-green-500 flex-shrink-0" />
          </div>
        </Card>

        <Card className="border-l-4 border-blue-500">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                <p className="text-xs sm:text-sm text-gray-600">{t.verification}</p>
                {!isVerified && (
                  <button
                    onClick={handleRefreshVerification}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
                    title="Refresh verification status"
                    disabled={loadingVerification || loadingUser}
                  >
                    <RefreshCw 
                      className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-600 ${loadingVerification || loadingUser ? 'animate-spin' : ''}`}
                    />
                  </button>
                )}
              </div>
              <Badge variant={isVerified ? 'success' : verificationStatusText === 'pending' ? 'warning' : 'error'} className="text-xs sm:text-sm">
                {isVerified ? t.verified : verificationStatusText === 'pending' ? t.pending : verificationStatusText === 'rejected' ? t.rejected : t.unverified}
              </Badge>
            </div>
            {isVerified ? (
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-green-500 flex-shrink-0" />
            ) : (
              <Clock className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-yellow-500 flex-shrink-0" />
            )}
          </div>
        </Card>

        <Card className="border-l-4 border-purple-500">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">{t.package}</p>
              <Badge variant="primary" className="text-xs sm:text-sm mt-1">
                {subscriptionTier === 'premium' ? t.premium : t.free}
              </Badge>
            </div>
            <DollarSign className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-purple-500 flex-shrink-0" />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title={t.quickActions}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {!isVerified ? (
            <Link to="/student/verification">
              <Button variant="primary" className="w-full text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                {t.completeVerification}
              </Button>
            </Link>
          ) : (
            <Link to="/student/jobs">
              <Button variant="primary" className="w-full text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5">
                <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                {t.browseJobs}
              </Button>
            </Link>
          )}

          <Link to="/student/applications">
            <Button variant="outline" className="w-full text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
              {t.viewApplications}
            </Button>
          </Link>

          {subscriptionTier === 'free' && applicationsRemaining < 3 && (
            <Link to="/student/subscription" className="sm:col-span-2 lg:col-span-1">
              <Button variant="success" className="w-full text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5">
                {t.upgradeToPremium}
              </Button>
            </Link>
          )}
        </div>
      </Card>

      {/* Recent Applications */}
      <Card title={t.recentApplications}>
        {loadingApplications ? (
          <Loading />
        ) : applications?.data?.applications?.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {applications.data.applications.map((app) => (
              <div key={app._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-2">{app.jobPost?.title}</h4>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">{app.jobPost?.client?.companyName}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                    {t.applied} {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  variant={
                    app.status === 'accepted' ? 'success' :
                    app.status === 'rejected' ? 'error' :
                    app.status === 'shortlisted' ? 'warning' : 'info'
                  }
                  className="text-xs sm:text-sm flex-shrink-0"
                >
                  {app.status}
                </Badge>
              </div>
            ))}
            <Link to="/student/applications">
              <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5">
                View All Applications
              </Button>
            </Link>
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8 px-4 text-gray-500">
            <Briefcase className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-50" />
            <p className="text-sm sm:text-base">{t.noApplicationsYet}</p>
       
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudentDashboard;
