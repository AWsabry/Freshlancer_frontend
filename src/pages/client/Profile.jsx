import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { packageService } from '../../services/packageService';
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
  Calendar,
  Briefcase,
  Coins,
  Package,
  Eye,
  Receipt,
  Settings,
  Edit2,
  Link as LinkIcon,
  ExternalLink,
} from 'lucide-react';

const translations = {
  en: {
    loadingProfile: 'Loading profile...',
    failedToLoad: 'Failed to load profile data. Please refresh the page.',
    profileUpdated: 'Profile updated successfully!',
    updateFailed: 'Failed to update profile',
    myProfile: 'My Profile',
    editProfile: 'Edit Profile',
    personalInformation: 'Personal Information',
    fullName: 'Full Name',
    email: 'Email',
    emailCannotChange: 'Email cannot be changed',
    phoneNumber: 'Phone Number',
    companyName: 'Company Name',
    industry: 'Industry',
    socialLinks: 'Social Links (Optional)',
    linkedin: 'LinkedIn',
    website: 'Website',
    telegram: 'Telegram',
    whatsapp: 'WhatsApp',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    notProvided: 'Not provided',
    memberSince: 'Member Since',
    notAvailable: 'Not available',
    pointsBalance: 'Points Balance',
    loadingPoints: 'Loading points balance...',
    availablePoints: 'Available Points',
    buyMorePoints: 'Buy More Points',
    pointsUsed: 'Points Used',
    usedToUnlock: 'Used to unlock {count} profiles',
    unlockedProfiles: 'Unlocked Profiles',
    pointsPerProfile: '10 points per profile',
    recentPackages: 'Recent Package Purchases',
    viewAll: 'View All',
    loadingHistory: 'Loading package history...',
    noPackagesYet: "You haven't purchased any points packages yet. Purchase a package to start unlocking student profiles.",
  },
  it: {
    loadingProfile: 'Caricamento profilo...',
    failedToLoad: 'Impossibile caricare i dati del profilo. Si prega di aggiornare la pagina.',
    profileUpdated: 'Profilo aggiornato con successo!',
    updateFailed: 'Impossibile aggiornare il profilo',
    myProfile: 'Il Mio Profilo',
    editProfile: 'Modifica Profilo',
    personalInformation: 'Informazioni Personali',
    fullName: 'Nome Completo',
    email: 'Email',
    emailCannotChange: 'L\'email non può essere modificata',
    phoneNumber: 'Numero di Telefono',
    companyName: 'Nome Azienda',
    industry: 'Settore',
    socialLinks: 'Link Social (Opzionale)',
    linkedin: 'LinkedIn',
    website: 'Sito Web',
    telegram: 'Telegram',
    whatsapp: 'WhatsApp',
    saveChanges: 'Salva Modifiche',
    cancel: 'Annulla',
    notProvided: 'Non fornito',
    memberSince: 'Membro dal',
    notAvailable: 'Non disponibile',
    pointsBalance: 'Saldo Punti',
    loadingPoints: 'Caricamento saldo punti...',
    availablePoints: 'Punti Disponibili',
    buyMorePoints: 'Acquista Altri Punti',
    pointsUsed: 'Punti Utilizzati',
    usedToUnlock: 'Utilizzati per sbloccare {count} profili',
    unlockedProfiles: 'Profili Sbloccati',
    pointsPerProfile: '10 punti per profilo',
    recentPackages: 'Acquisti Pacchetti Recenti',
    viewAll: 'Visualizza Tutti',
    loadingHistory: 'Caricamento cronologia pacchetti...',
    noPackagesYet: 'Non hai ancora acquistato nessun pacchetto di punti. Acquista un pacchetto per iniziare a sbloccare i profili degli studenti.',
  },
};

const Profile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    industry: '',
    clientProfile: {
      socialLinks: {
        linkedin: '',
        website: '',
        telegram: '',
        whatsapp: '',
      },
    },
  });

  // Fetch current user data from backend (to get fresh data with createdAt)
  const { data: userData, isLoading: loadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await authService.getMe();
      return response.data?.user;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0, // Always consider data stale to fetch fresh data
  });

  // Fetch points balance
  const { data: pointsData, isLoading: loadingPoints } = useQuery({
    queryKey: ['pointsBalance'],
    queryFn: () => packageService.getPointsBalance(),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  // Fetch package history
  const { data: historyData, isLoading: loadingHistory } = useQuery({
    queryKey: ['packageHistory'],
    queryFn: () => packageService.getPackageHistory(),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: (data) => authService.updateProfile(data),
    onSuccess: (response) => {
      // Update localStorage with fresh user data
      if (response.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      queryClient.invalidateQueries(['currentUser']);
      setIsEditing(false);
      alert(t.profileUpdated);
    },
    onError: (error) => {
      // Log full error for debugging
      console.error('Profile update error:', error);
      
      // Extract error message from various possible locations
      // Note: API interceptor returns error.response?.data, so error might be the data object itself
      let errorMessage = 'Failed to update profile';
      
      // Check if error is the response data object (from interceptor)
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.error?.message) {
        errorMessage = error.error.message;
      } else if (typeof error?.error === 'string') {
        errorMessage = error.error;
      } else if (error?.status === 'error' && error?.message) {
        errorMessage = error.message;
      }
      
      // Show validation errors if they exist
      if (error?.errors) {
        const validationErrors = Object.values(error.errors)
          .map(err => (typeof err === 'object' && err?.message) ? err.message : err)
          .filter(Boolean)
          .join(', ');
        if (validationErrors) {
          errorMessage = `Validation errors: ${validationErrors}`;
        }
      }
      
      // If we still don't have a good message, show the error object
      if (errorMessage === 'Failed to update profile' && error) {
        console.error('Full error object:', JSON.stringify(error, null, 2));
        errorMessage = `${t.updateFailed}. ${JSON.stringify(error)}`;
      }
      
      alert(errorMessage);
    },
  });

  React.useEffect(() => {
    if (userData) {
      setFormData({
        name: userData?.name || '',
        email: userData?.email || '',
        phone: userData?.phone || '',
        companyName: userData?.clientProfile?.companyName || '',
        industry: userData?.clientProfile?.industry || '',
        clientProfile: {
          socialLinks: {
            linkedin: userData?.clientProfile?.socialLinks?.linkedin || '',
            website: userData?.clientProfile?.socialLinks?.website || '',
            telegram: userData?.clientProfile?.socialLinks?.telegram || '',
            whatsapp: userData?.clientProfile?.socialLinks?.whatsapp || '',
          },
        },
      });
    }
  }, [userData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Clean up social links - convert empty strings to undefined
    const socialLinks = {};
    if (formData.clientProfile?.socialLinks) {
      Object.keys(formData.clientProfile.socialLinks).forEach(key => {
        const value = formData.clientProfile.socialLinks[key];
        // Only include non-empty values
        if (value && value.trim() !== '') {
          socialLinks[key] = value.trim();
        }
      });
    }
    
    // Format data for API - include clientProfile with socialLinks
    const updateData = {
      name: formData.name?.trim() || '',
      phone: formData.phone?.trim() || undefined,
      clientProfile: {
        companyName: formData.companyName?.trim() || undefined,
        industry: formData.industry?.trim() || undefined,
        socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
      },
    };
    
    // Remove undefined values to avoid sending them
    if (!updateData.phone) delete updateData.phone;
    if (updateData.clientProfile.companyName === undefined) delete updateData.clientProfile.companyName;
    if (updateData.clientProfile.industry === undefined) delete updateData.clientProfile.industry;
    if (updateData.clientProfile.socialLinks === undefined) delete updateData.clientProfile.socialLinks;
    
    updateMutation.mutate(updateData);
  };

  if (loadingUser) {
    return <Loading text={t.loadingProfile} />;
  }

  // Check if user data is available
  if (!userData) {
    return (
      <Alert
        type="error"
        message={t.failedToLoad}
      />
    );
  }

  const user = userData;
  const points = pointsData?.data;
  const packages = historyData?.data?.packages || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{t.myProfile}</h1>
        {!isEditing && (
          <Button variant="primary" onClick={() => setIsEditing(true)}>
            <Edit2 className="w-4 h-4 mr-2" />
            {t.editProfile}
          </Button>
        )}
      </div>

      {/* Profile Information */}
      <Card title={t.personalInformation}>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.fullName} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.email} *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">{t.emailCannotChange}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.phoneNumber}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.companyName}
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.industry}
                </label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Social Links Section */}
            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.socialLinks}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.linkedin}
                  </label>
                  <input
                    type="url"
                    value={formData.clientProfile?.socialLinks?.linkedin || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      clientProfile: {
                        ...formData.clientProfile,
                        socialLinks: {
                          ...formData.clientProfile?.socialLinks,
                          linkedin: e.target.value,
                        },
                      },
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.website}
                  </label>
                  <input
                    type="url"
                    value={formData.clientProfile?.socialLinks?.website || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      clientProfile: {
                        ...formData.clientProfile,
                        socialLinks: {
                          ...formData.clientProfile?.socialLinks,
                          website: e.target.value,
                        },
                      },
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.telegram}
                  </label>
                  <input
                    type="url"
                    value={formData.clientProfile?.socialLinks?.telegram || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      clientProfile: {
                        ...formData.clientProfile,
                        socialLinks: {
                          ...formData.clientProfile?.socialLinks,
                          telegram: e.target.value,
                        },
                      },
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://t.me/username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.whatsapp}
                  </label>
                  <input
                    type="url"
                    value={formData.clientProfile?.socialLinks?.whatsapp || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      clientProfile: {
                        ...formData.clientProfile,
                        socialLinks: {
                          ...formData.clientProfile?.socialLinks,
                          whatsapp: e.target.value,
                        },
                      },
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://wa.me/1234567890"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button type="submit" variant="primary" loading={updateMutation.isPending}>
                {t.saveChanges}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  // Reset form data
                  if (userData) {
                    setFormData({
                      name: userData.name || '',
                      email: userData.email || '',
                      phone: userData.phone || '',
                      companyName: userData.clientProfile?.companyName || '',
                      industry: userData.clientProfile?.industry || '',
                      clientProfile: {
                        socialLinks: {
                          linkedin: userData?.clientProfile?.socialLinks?.linkedin || '',
                          website: userData?.clientProfile?.socialLinks?.website || '',
                          telegram: userData?.clientProfile?.socialLinks?.telegram || '',
                          whatsapp: userData?.clientProfile?.socialLinks?.whatsapp || '',
                        },
                      },
                    });
                  }
                }}
              >
                {t.cancel}
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-primary-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">{t.fullName}</p>
                  <p className="font-semibold text-gray-900">{user?.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">{t.email}</p>
                  <p className="font-semibold text-gray-900">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">{t.phoneNumber}</p>
                  <p className="font-semibold text-gray-900">{user?.phone || t.notProvided}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-primary-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">{t.companyName}</p>
                  <p className="font-semibold text-gray-900">
                    {user?.clientProfile?.companyName || t.notProvided}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">{t.industry}</p>
                  <p className="font-semibold text-gray-900">
                    {user?.clientProfile?.industry || t.notProvided}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">{t.memberSince}</p>
                  <p className="font-semibold text-gray-900">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : t.notAvailable}
                  </p>
                </div>
              </div>
            </div>

            {/* Social Links Display */}
            {user?.clientProfile?.socialLinks && Object.values(user.clientProfile.socialLinks).some(link => link) && (
              <div className="pt-6 border-t mt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">{t.socialLinks}</h3>
                <div className="flex flex-wrap gap-4">
                  {user.clientProfile.socialLinks.linkedin && (
                    <a
                      href={user.clientProfile.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
                    >
                      <LinkIcon className="w-4 h-4" />
                      <span className="text-sm">LinkedIn</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {user.clientProfile.socialLinks.website && (
                    <a
                      href={user.clientProfile.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
                    >
                      <LinkIcon className="w-4 h-4" />
                      <span className="text-sm">Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {user.clientProfile.socialLinks.telegram && (
                    <a
                      href={user.clientProfile.socialLinks.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
                    >
                      <LinkIcon className="w-4 h-4" />
                      <span className="text-sm">Telegram</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {user.clientProfile.socialLinks.whatsapp && (
                    <a
                      href={user.clientProfile.socialLinks.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
                    >
                      <LinkIcon className="w-4 h-4" />
                      <span className="text-sm">WhatsApp</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Points Balance */}
      <Card title={t.pointsBalance}>
        {loadingPoints ? (
          <div className="flex items-center justify-center py-12">
            <Loading text={t.loadingPoints} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200">
              <div className="flex items-center gap-3 mb-2">
                <Coins className="w-6 h-6 text-primary-600" />
                <p className="text-sm font-medium text-primary-900">{t.availablePoints}</p>
              </div>
              <p className="text-4xl font-bold text-primary-600">
                {points?.pointsRemaining || 0}
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-4"
                onClick={() => navigate('/client/packages')}
              >
                <Package className="w-4 h-4 mr-2" />
                {t.buyMorePoints}
              </Button>
            </div>

            <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <Eye className="w-6 h-6 text-gray-600" />
                <p className="text-sm font-medium text-gray-700">{t.pointsUsed}</p>
              </div>
              <p className="text-4xl font-bold text-gray-900">{points?.pointsUsed || 0}</p>
              <p className="text-sm text-gray-500 mt-2">
                {t.usedToUnlock.replace('{count}', points?.unlockedStudentsCount || 0)}
              </p>
            </div>

            <div
              className="p-6 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 hover:border-primary-300 transition"
              onClick={() => navigate('/client/unlocked-students')}
            >
              <div className="flex items-center gap-3 mb-2">
                <User className="w-6 h-6 text-gray-600" />
                <p className="text-sm font-medium text-gray-700">{t.unlockedProfiles}</p>
              </div>
              <p className="text-4xl font-bold text-gray-900">
                {points?.unlockedStudentsCount || 0}
              </p>
              <p className="text-sm text-gray-500 mt-2">{t.pointsPerProfile}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Recent Packages */}
      <Card
        title={t.recentPackages}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/client/transactions')}>
            <Receipt className="w-4 h-4 mr-2" />
            {t.viewAll}
          </Button>
        }
      >
        {loadingHistory ? (
          <div className="flex items-center justify-center py-12">
            <Loading text={t.loadingHistory} />
          </div>
        ) : packages.length === 0 ? (
          <Alert
            type="info"
            message={t.noPackagesYet}
          />
        ) : (
          <div className="space-y-3">
            {packages.slice(0, 5).map((pkg) => (
              <div
                key={pkg._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{pkg.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(pkg.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    {pkg.currency} {pkg.amount?.toFixed(2)}
                  </p>
                  <Badge
                    variant={
                      pkg.status === 'completed' || pkg.status === 'succeeded'
                        ? 'success'
                        : pkg.status === 'pending'
                        ? 'info'
                        : 'error'
                    }
                  >
                    {pkg.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

    </div>
  );
};

export default Profile;
