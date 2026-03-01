import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { packageService } from '../../services/packageService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import { Eye, Zap, TrendingUp, CheckCircle, CreditCard, Package, Star, Crown, Flame } from 'lucide-react';

const translations = {
  en: {
    loading: 'Loading packages...',
    pointsBalance: 'Points Balance',
    availablePoints: 'Available Points',
    pointsDescription: 'Each point unlocks one student profile (10 points per unlock)',
    selectCurrency: 'Select Currency',
    usdComingSoon: 'USD coming soon',
    paypalDescription: 'Pay with PayPal using USD. PayPal accepts credit/debit cards, bank accounts, and PayPal balance.',
    paymobDescription: 'Pay with Paymob using Egyptian Pounds (EGP). Paymob accepts credit/debit cards and mobile wallets.',
    buyPointsPackages: 'Buy Points Packages',
    noPackagesAvailable: 'No packages available at the moment.',
    hot: 'Hot',
    mostPopular: 'Most Popular',
    perStudentProfile: 'per student profile',
    buyPackage: 'Buy Package',
    howPointsWork: 'How Points Work',
    step1Title: 'Buy Points',
    step1Description: 'Choose a package that fits your needs and purchase points',
    step2Title: 'Unlock Profiles',
    step2Description: 'Use 10 points to unlock each student\'s full profile and contact information',
    step3Title: 'Connect & Hire',
    step3Description: 'Contact talented students directly and build your team',
  },
  it: {
    loading: 'Caricamento pacchetti...',
    pointsBalance: 'Saldo Punti',
    availablePoints: 'Punti Disponibili',
    pointsDescription: 'Ogni punto sblocca un profilo studente (10 punti per sblocco)',
    selectCurrency: 'Seleziona Valuta',
    usdComingSoon: 'USD in arrivo',
    paypalDescription: 'Paga con PayPal usando USD. PayPal accetta carte di credito/debito, conti bancari e saldo PayPal.',
    paymobDescription: 'Paga con Paymob usando Sterline Egiziane (EGP). Paymob accetta carte di credito/debito e portafogli mobili.',
    buyPointsPackages: 'Acquista Pacchetti di Punti',
    noPackagesAvailable: 'Nessun pacchetto disponibile al momento.',
    hot: 'Popolare',
    mostPopular: 'Più Popolare',
    perStudentProfile: 'per profilo studente',
    buyPackage: 'Acquista Pacchetto',
    howPointsWork: 'Come Funzionano i Punti',
    step1Title: 'Acquista Punti',
    step1Description: 'Scegli un pacchetto adatto alle tue esigenze e acquista punti',
    step2Title: 'Sblocca Profili',
    step2Description: 'Usa 10 punti per sbloccare il profilo completo e le informazioni di contatto di ogni studente',
    step3Title: 'Connetti e Assumi',
    step3Description: 'Contatta direttamente studenti talentuosi e costruisci il tuo team',
  },
};

const Packages = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedCurrency, setSelectedCurrency] = useState('EGP');
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

  // Fetch active package and points balance
  // const { data: activePackage } = useQuery({
  //   queryKey: ['activePackage'],
  //   queryFn: () => packageService.getActivePackage(),
  // });

  const { data: pointsBalance, isLoading: loadingPoints } = useQuery({
    queryKey: ['pointsBalance'],
    queryFn: () => packageService.getPointsBalance(),
  });

  // Fetch packages from API
  const { data: packagesData, isLoading: loadingPackages } = useQuery({
    queryKey: ['availablePackages'],
    queryFn: () => packageService.getAvailablePackages(),
    refetchOnMount: true,
    staleTime: 0,
  });

  const balance = pointsBalance?.data;
  const currentPoints = balance?.pointsRemaining || 0;

  // Icon mapping
  const iconMap = {
    Eye,
    Zap,
    TrendingUp,
    Package,
    Star,
    Crown,
  };

  // Currency conversion rate
  const USD_TO_EGP_RATE = 49.5;

  // Process packages from API
  const packages = useMemo(() => {
    if (!packagesData?.data?.packagesArray) return [];

    const packagesArray = packagesData.data.packagesArray;
    const rates = {
      USD: 1,
      EGP: USD_TO_EGP_RATE,
    };

    return packagesArray
      .filter(pkg => pkg.isActive) // Only show active packages
      .map((pkg) => {
        const IconComponent = iconMap[pkg.icon] || Package;
        const price = Math.round(pkg.priceUSD * rates[selectedCurrency] * 100) / 100;

        return {
          _id: pkg._id,
          name: pkg.name,
          type: pkg.type,
          points: pkg.pointsTotal,
          basePrice: pkg.priceUSD,
          price,
          currency: selectedCurrency,
          icon: IconComponent,
          color: pkg.color || 'primary',
          description: pkg.description,
          features: pkg.features || [],
          popular: pkg.popular || false,
          hot: pkg.hot || false,
        };
      })
      .sort((a, b) => {
        // Sort by displayOrder if available, otherwise by points
        return a.points - b.points;
      });
  }, [packagesData, selectedCurrency]);

  const isLoading = loadingPoints || loadingPackages;

  const handlePurchase = (packageData) => {
    // Route to USD payment page if USD is selected, otherwise to regular payment page
    const paymentPath = selectedCurrency === 'USD' ? '/client/payment-usd' : '/client/payment';
    navigate(paymentPath, {
      state: {
        currency: selectedCurrency,
        amount: packageData.price,
        packageType: packageData.type,
        packageId: packageData._id,
        packageName: packageData.name,
        points: packageData.points,
      },
    });
  };

  if (isLoading) {
    return <Loading text={t.loading} />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6">
      {/* Current Balance */}
      <Card title={t.pointsBalance}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{t.availablePoints}</p>
            <p className="text-4xl font-bold text-primary-600">{currentPoints}</p>
            <p className="text-sm text-gray-500 mt-2">
              {t.pointsDescription}
            </p>
          </div>
          <div className="text-right">
            <CreditCard className="w-16 h-16 text-gray-400" />
          </div>
        </div>
      </Card>

      {/* Currency Selection */}
      <Card title={t.selectCurrency}>
            <div className="flex justify-center">
              <div className="inline-flex rounded-lg border border-gray-300 p-1 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setSelectedCurrency('USD')}
                  className={`px-6 py-2 rounded-md font-medium transition-all border ${
                    selectedCurrency === 'USD'
                      ? 'bg-primary-500 text-[#2f00c0] border-primary-500 shadow-md'
                      : 'text-gray-700 border-transparent hover:bg-gray-100'
                  }`}
                >
                  USD ($)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCurrency('EGP')}
                  className={`px-6 py-2 rounded-md font-medium transition-all border ${
                    selectedCurrency === 'EGP'
                      ? 'bg-primary-500 text-[#2f00c0] border-primary-500 shadow-md'
                      : 'text-gray-700 border-transparent hover:bg-gray-100'
                  }`}
                >
                  EGP (E£)
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 text-center mt-3">
              {selectedCurrency === 'USD' ? t.paypalDescription : t.paymobDescription}
            </p>
        </Card>

      {/* Points Packages */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.buyPointsPackages}</h2>
        {packages.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">{t.noPackagesAvailable}</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {packages.map((pkg) => {
            const Icon = pkg.icon;
            return (
              <Card
                key={pkg._id || pkg.type}
                className={`relative ${
                  pkg.popular ? 'border-2 border-primary-500 shadow-lg' : ''
                }`}
              >
                {/* Hot indicator */}
                {pkg.hot && (
                  <div className="absolute top-4 left-4 z-10">
                    <Badge variant="error" className="flex items-center gap-1">
                      <Flame className="w-4 h-4" />
                      {t.hot}
                    </Badge>
                  </div>
                )}
                {/* Popular badge */}
                {pkg.popular && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="success">{t.mostPopular}</Badge>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div
                    className={`inline-flex p-4 rounded-full mb-4 ${
                      pkg.color === 'blue'
                        ? 'bg-blue-100'
                        : pkg.color === 'primary'
                        ? 'bg-primary-100'
                        : pkg.color === 'purple'
                        ? 'bg-purple-100'
                        : pkg.color === 'green'
                        ? 'bg-green-100'
                        : pkg.color === 'red'
                        ? 'bg-red-100'
                        : pkg.color === 'yellow'
                        ? 'bg-yellow-100'
                        : 'bg-gray-100'
                    }`}
                  >
                    <Icon
                      className={`w-8 h-8 ${
                        pkg.color === 'blue'
                          ? 'text-blue-600'
                          : pkg.color === 'primary'
                          ? 'text-primary-600'
                          : pkg.color === 'purple'
                          ? 'text-purple-600'
                          : pkg.color === 'green'
                          ? 'text-green-600'
                          : pkg.color === 'red'
                          ? 'text-red-600'
                          : pkg.color === 'yellow'
                          ? 'text-yellow-600'
                          : 'text-gray-600'
                      }`}
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{pkg.description}</p>
                  {pkg.savings && (
                    <Badge variant="success" className="mb-4">
                      {pkg.savings}
                    </Badge>
                  )}
                  <p className="text-4xl font-bold text-gray-900">
                    {pkg.currency} {pkg.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {pkg.currency} {(pkg.price / pkg.points).toFixed(2) * 10 } {t.perStudentProfile}
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={pkg.popular ? 'primary' : 'outline'}
                  className="w-full"
                  onClick={() => handlePurchase(pkg)}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  {t.buyPackage}
                </Button>
              </Card>
            );
          })}
          </div>
        )}
      </div>

      {/* How it Works */}
      <Card title={t.howPointsWork}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center">
            <div className="inline-flex p-3 rounded-full bg-primary-100 mb-4">
              <span className="text-2xl font-bold text-primary-600">1</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{t.step1Title}</h3>
            <p className="text-sm text-gray-600">
              {t.step1Description}
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex p-3 rounded-full bg-primary-100 mb-4">
              <span className="text-2xl font-bold text-primary-600">2</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{t.step2Title}</h3>
            <p className="text-sm text-gray-600">
              {t.step2Description}
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex p-3 rounded-full bg-primary-100 mb-4">
              <span className="text-2xl font-bold text-primary-600">3</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{t.step3Title}</h3>
            <p className="text-sm text-gray-600">
              {t.step3Description}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Packages;
