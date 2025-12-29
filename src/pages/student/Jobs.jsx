import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { jobService } from '../../services/jobService';
import { subscriptionService } from '../../services/subscriptionService';
import { authService } from '../../services/authService';
import { categoryService } from '../../services/categoryService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import {
  Search,
  MapPin,
  DollarSign,
  Clock,
  Briefcase,
  Filter,
  ChevronDown,
  CheckCircle,
  Crown,
  Lock,
  Sparkles,
  Rocket,
  LayoutGrid,
  List,
} from 'lucide-react';

const translations = {
  en: {
    loading: 'Loading jobs...',
    browseJobs: 'Browse Jobs',
    findOpportunity: 'Find your next opportunity via Freshlancer',
    availableJobs: 'Available Jobs',
    appliedJobs: 'Applied Jobs',
    searchPlaceholder: 'Search by title, skills, or keywords... (Press Enter to search)',
    search: 'Search',
    clear: 'Clear',
    filters: 'Filters',
    aiRecommendations: 'AI Recommendations',
    soon: 'Soon',
    category: 'Category',
    allCategories: 'All Categories',
    sortByBudget: 'Sort by Budget',
    sortByBudgetPremium: 'Sort by Budget (Premium Only)',
    createdByDesc: 'Created By (Desc)',
    createdByAsc: 'Created By (Asc)',
    highestBudgetFirst: 'Highest Budget First',
    highestBudgetFirstPremium: 'Highest Budget First 🔒 Premium',
    lowestBudgetFirst: 'Lowest Budget First',
    lowestBudgetFirstPremium: 'Lowest Budget First 🔒 Premium',
    upgradeToSort: 'Upgrade to Premium to sort by budget',
    filterByCurrency: 'Filter by Currency',
    filterByCurrencyPremium: 'Filter by Currency (Premium Only)',
    allCurrencies: 'All Currencies',
    upgradeToFilterCurrency: 'Upgrade to Premium to filter by currency',
    showStartupJobsOnly: 'Show Startup Jobs Only',
    showStartupJobsOnlyPremium: 'Show Startup Jobs Only (Premium Only)',
    upgradeToFilterStartups: 'Upgrade to Premium to filter by startups',
    noJobsFound: 'No jobs found',
    tryAdjusting: 'Try adjusting your search criteria',
    premiumMembersOnly: 'Premium members only',
    appliedOn: 'Applied on',
    more: 'more',
    applicants: 'applicant',
    applicantsPlural: 'applicants',
    viewDetails: 'View Details',
    loadMore: 'Load More Jobs',
    loadingMore: 'Loading more...',
    endOfList: "You've reached the end of the list",
    urgent: 'Urgent',
    accepted: 'accepted',
    rejected: 'rejected',
    shortlisted: 'shortlisted',
    pending: 'pending',
    compactView: 'Compact View',
    detailedView: 'Detailed View',
  },
  it: {
    loading: 'Caricamento lavori...',
    browseJobs: 'Sfoglia Lavori',
    findOpportunity: 'Trova la tua prossima opportunità tramite Freshlancer',
    availableJobs: 'Lavori Disponibili',
    appliedJobs: 'Lavori a cui hai fatto domanda',
    searchPlaceholder: 'Cerca per titolo, competenze o parole chiave... (Premi Invio per cercare)',
    search: 'Cerca',
    clear: 'Cancella',
    filters: 'Filtri',
    aiRecommendations: 'Raccomandazioni IA',
    soon: 'Presto',
    category: 'Categoria',
    allCategories: 'Tutte le Categorie',
    sortByBudget: 'Ordina per Budget',
    sortByBudgetPremium: 'Ordina per Budget (Solo Premium)',
    createdByDesc: 'Creato Per (Disc)',
    createdByAsc: 'Creato Per (Cresc)',
    highestBudgetFirst: 'Budget Più Alto Prima',
    highestBudgetFirstPremium: 'Budget Più Alto Prima 🔒 Premium',
    lowestBudgetFirst: 'Budget Più Basso Prima',
    lowestBudgetFirstPremium: 'Budget Più Basso Prima 🔒 Premium',
    upgradeToSort: 'Passa a Premium per ordinare per budget',
    filterByCurrency: 'Filtra per Valuta',
    filterByCurrencyPremium: 'Filtra per Valuta (Solo Premium)',
    allCurrencies: 'Tutte le Valute',
    upgradeToFilterCurrency: 'Passa a Premium per filtrare per valuta',
    showStartupJobsOnly: 'Mostra Solo Lavori Startup',
    showStartupJobsOnlyPremium: 'Mostra Solo Lavori Startup (Solo Premium)',
    upgradeToFilterStartups: 'Passa a Premium per filtrare per startup',
    noJobsFound: 'Nessun lavoro trovato',
    tryAdjusting: 'Prova a modificare i criteri di ricerca',
    premiumMembersOnly: 'Solo membri Premium',
    appliedOn: 'Candidato il',
    more: 'altri',
    applicants: 'candidato',
    applicantsPlural: 'candidati',
    viewDetails: 'Visualizza Dettagli',
    loadMore: 'Carica Altri Lavori',
    loadingMore: 'Caricamento altri...',
    endOfList: 'Hai raggiunto la fine dell\'elenco',
    urgent: 'Urgente',
    accepted: 'accettato',
    rejected: 'rifiutato',
    shortlisted: 'in lista',
    pending: 'in attesa',
    compactView: 'Vista Compatta',
    detailedView: 'Vista Dettagliata',
  },
};

const Jobs = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('createdAt-desc'); // Default: newest first (descending)
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('available'); // 'available' or 'applied'
  const [startupsOnly, setStartupsOnly] = useState(false); // Filter for startup jobs only
  const [currency, setCurrency] = useState(''); // Filter by currency (premium only)
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('jobsViewMode') || 'detailed'; // 'compact' or 'detailed'
  });
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

  // Check subscription/application limit
  const { data: subscriptionData } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => subscriptionService.getMySubscription(),
  });

  // Fetch current user with appliedJobs from profile
  const { data: userData } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authService.getMe(),
  });

  // Get applied jobs from user profile
  const userAppliedJobs = userData?.data?.user?.studentProfile?.appliedJobs || [];

  // Check if student is on premium plan
  const subscription = subscriptionData?.data?.subscription;
  const isPremium = subscription?.plan === 'premium';

  // Fetch jobs with infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['jobs', searchQuery, category, sortBy, startupsOnly, currency],
    queryFn: ({ pageParam = 1 }) => {
      const params = { page: pageParam, limit: 10 };
      // Add sort - always include default sort, budget sort only for premium
      if (sortBy) {
        // Budget sorting is premium only
        if ((sortBy === 'budget-desc' || sortBy === 'budget-asc') && !isPremium) {
          // If user tries to sort by budget but isn't premium, use default
          params.sort = 'createdAt-desc';
        } else {
          params.sort = sortBy;
        }
      } else {
        // Default sort: newest first (descending)
        params.sort = 'createdAt-desc';
      }
      if (category) params.category = category;
      if (currency && isPremium) params.currency = currency;
      if (searchQuery) {
        return jobService.searchJobs(searchQuery, params);
      }
      return jobService.getAllJobs(params);
    },
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.pagination;
      return page < pages ? page + 1 : undefined;
    },
  });

  const allJobs = data?.pages.flatMap((page) => page.data.jobPosts) || [];

  // Fetch full details for applied jobs
  const appliedJobIds = useMemo(
    () => userAppliedJobs.map(job => job.jobId?.toString()).filter(Boolean),
    [userAppliedJobs]
  );

  const { data: appliedJobsData } = useQuery({
    queryKey: ['appliedJobs', appliedJobIds],
    queryFn: async () => {
      if (appliedJobIds.length === 0) return { data: { jobPosts: [] } };
      // Fetch all applied jobs by their IDs
      const promises = appliedJobIds.map(jobId =>
        jobService.getJob(jobId).catch(() => null)
      );
      const results = await Promise.all(promises);
      return {
        data: {
          jobPosts: results
            .filter(result => result?.data?.jobPost)
            .map(result => result.data.jobPost)
        }
      };
    },
    enabled: appliedJobIds.length > 0,
  });

  const appliedJobsFromAPI = appliedJobsData?.data?.jobPosts || [];

  // Separate available jobs from applied jobs
  const appliedJobIdsSet = useMemo(
    () => new Set(userAppliedJobs.map((job) => job.jobId?.toString())),
    [userAppliedJobs]
  );

  const availableJobs = useMemo(() => {
    let jobs = allJobs.filter((job) => !appliedJobIdsSet.has(job._id));
    
    // Filter for startup jobs only if checkbox is checked and user is premium
    if (startupsOnly && isPremium) {
      jobs = jobs.filter((job) => job.startup && job.startup.startupName && !job.startup.message);
    }
    
    // Filter by currency if selected and user is premium
    if (currency && isPremium) {
      jobs = jobs.filter((job) => job.budget && job.budget.currency === currency && !job.budget.message);
    }
    
    return jobs;
  }, [allJobs, appliedJobIdsSet, startupsOnly, isPremium, currency]);

  // Build applied jobs array with application metadata
  const appliedJobs = useMemo(() => {
    // Create a map of applied jobs metadata from user profile
    const appliedJobMetadata = new Map(
      userAppliedJobs.map(job => [job.jobId?.toString(), job])
    );

    // Map full job data with application status
    let jobs = appliedJobsFromAPI
      .map((job) => {
        const metadata = appliedJobMetadata.get(job._id);
        if (metadata) {
          return {
            ...job,
            applicationStatus: metadata.status,
            appliedAt: metadata.appliedAt,
          };
        }
        return null;
      })
      .filter(job => job !== null);

    // Filter for startup jobs only if checkbox is checked and user is premium
    if (startupsOnly && isPremium) {
      jobs = jobs.filter((job) => job.startup && job.startup.startupName && !job.startup.message);
    }

    return jobs;
  }, [appliedJobsFromAPI, userAppliedJobs, startupsOnly, isPremium]);

  const jobs = activeTab === 'available' ? availableJobs : appliedJobs;

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setSearchQuery(searchInput);
    }
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
  };

  const toggleViewMode = () => {
    const newMode = viewMode === 'compact' ? 'detailed' : 'compact';
    setViewMode(newMode);
    localStorage.setItem('jobsViewMode', newMode);
  };

  // Fetch categories from API
  const { data: categoriesData, isLoading: loadingCategories, error: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAllCategories(),
  });

  const categories = useMemo(() => {
    // Debug: log the response structure
    if (categoriesData) {
      console.log('Categories Data:', categoriesData);
    }
    if (categoriesError) {
      console.error('Categories Error:', categoriesError);
    }
    
    // The API interceptor returns response.data, so categoriesData is already the unwrapped response
    // Backend returns: { status: 'success', data: { categories: [...] } }
    // Try both possible paths in case the structure is different
    const categoriesList = categoriesData?.data?.categories || categoriesData?.categories || [];
    
    if (categoriesList.length === 0 && categoriesData) {
      console.warn('No categories found in response:', categoriesData);
    }
    
    return categoriesList.map((cat) => ({
      value: cat.name,
      label: cat.name,
    }));
  }, [categoriesData, categoriesError]);

    console.log('Jobs Data:', subscription);

  if (isLoading) {
    return <Loading text={t.loading} />;
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">{t.browseJobs}</h1>
        <p className="text-sm sm:text-base text-gray-600">
          {t.findOpportunity}
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-4 sm:mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('available')}
              className={`${
                activeTab === 'available'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 flex-shrink-0`}
            >
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">{t.availableJobs}</span>
              <span className="sm:hidden">Available</span>
              <span className="text-xs sm:text-sm">({availableJobs.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('applied')}
              className={`${
                activeTab === 'applied'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 flex-shrink-0`}
            >
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">{t.appliedJobs}</span>
              <span className="sm:hidden">Applied</span>
              <span className="text-xs sm:text-sm">({appliedJobs.length})</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-4 sm:mb-6">
        <form onSubmit={handleSearch} className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4">
              <Button
                type="submit"
                variant="primary"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 flex-1 sm:flex-initial"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{t.search}</span>
                <span className="sm:hidden">Search</span>
              </Button>
              {searchQuery && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClearSearch}
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5"
                >
                  {t.clear}
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5"
              >
                <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{t.filters}</span>
                <span className="sm:hidden">Filters</span>
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={true}
                className="hidden md:flex items-center gap-2 opacity-60 cursor-not-allowed relative text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5"
                title="Coming Soon: AI-powered job recommendations based on your profile"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden lg:inline">{t.aiRecommendations}</span>
                <span className="lg:hidden">AI</span>
                <span className="ml-1 text-[10px] sm:text-xs bg-yellow-100 text-yellow-800 px-1.5 sm:px-2 py-0.5 rounded-full">
                  {t.soon}
                </span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={toggleViewMode}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5"
                title={viewMode === 'compact' ? t.detailedView : t.compactView}
              >
                {viewMode === 'compact' ? (
                  <>
                    <List className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">{t.detailedView}</span>
                  </>
                ) : (
                  <>
                    <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">{t.compactView}</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t">
              <Select
                label={t.category}
                placeholder=""
                options={[{ value: '', label: t.allCategories }, ...categories]}
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSearchQuery(''); // Reset search when category changes
                  setSearchInput(''); // Clear search input
                }}
              />
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                  {isPremium ? (
                    <>
                      <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                      <span className="text-xs sm:text-sm">{t.sortByBudget}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                      <span className="text-xs sm:text-sm">{t.sortByBudgetPremium}</span>
                    </>
                  )}
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    const selectedValue = e.target.value;
                    // Budget sorting requires premium
                    if ((selectedValue === 'budget-desc' || selectedValue === 'budget-asc') && !isPremium) {
                      // Don't allow budget sorting for free users
                      return;
                    }
                    setSortBy(selectedValue);
                  }}
                  className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    (sortBy === 'budget-desc' || sortBy === 'budget-asc') && !isPremium
                      ? 'bg-gray-100 cursor-not-allowed opacity-60'
                      : ''
                  }`}
                >
                  <option value="createdAt-desc">{t.createdByDesc}</option>
                  <option value="createdAt-asc">{t.createdByAsc}</option>
                  <option
                    value="budget-desc"
                    disabled={!isPremium}
                    className={!isPremium ? 'text-gray-400 bg-gray-100' : ''}
                  >
                    {isPremium ? t.highestBudgetFirst : t.highestBudgetFirstPremium}
                  </option>
                  <option
                    value="budget-asc"
                    disabled={!isPremium}
                    className={!isPremium ? 'text-gray-400 bg-gray-100' : ''}
                  >
                    {isPremium ? t.lowestBudgetFirst : t.lowestBudgetFirstPremium}
                  </option>
                </select>
                {!isPremium && (
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    {t.upgradeToSort}
                  </p>
                )}
              </div>
              
              {/* Currency Filter */}
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                  {isPremium ? (
                    <>
                      <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                      <span className="text-xs sm:text-sm">{t.filterByCurrency}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                      <span className="text-xs sm:text-sm">{t.filterByCurrencyPremium}</span>
                    </>
                  )}
                </label>
                <Select
                  options={[
                    { value: '', label: t.allCurrencies },
                    { value: 'USD', label: 'USD ($) - US Dollar' },
                    { value: 'EUR', label: 'EUR (€) - Euro' },
                    { value: 'EGP', label: 'EGP (£) - Egyptian Pound' },
                    { value: 'GBP', label: 'GBP (£) - British Pound' },
                    { value: 'AED', label: 'AED (د.إ) - UAE Dirham' },
                    { value: 'SAR', label: 'SAR (﷼) - Saudi Riyal' },
                    { value: 'QAR', label: 'QAR (﷼) - Qatari Riyal' },
                    { value: 'KWD', label: 'KWD (د.ك) - Kuwaiti Dinar' },
                    { value: 'BHD', label: 'BHD (.د.ب) - Bahraini Dinar' },
                    { value: 'OMR', label: 'OMR (﷼) - Omani Rial' },
                    { value: 'JOD', label: 'JOD (د.ا) - Jordanian Dinar' },
                    { value: 'LBP', label: 'LBP (ل.ل) - Lebanese Pound' },
                    { value: 'ILS', label: 'ILS (₪) - Israeli Shekel' },
                    { value: 'TRY', label: 'TRY (₺) - Turkish Lira' },
                    { value: 'ZAR', label: 'ZAR (R) - South African Rand' },
                    { value: 'MAD', label: 'MAD (د.م.) - Moroccan Dirham' },
                    { value: 'TND', label: 'TND (د.ت) - Tunisian Dinar' },
                    { value: 'DZD', label: 'DZD (د.ج) - Algerian Dinar' },
                    { value: 'NGN', label: 'NGN (₦) - Nigerian Naira' },
                    { value: 'KES', label: 'KES (KSh) - Kenyan Shilling' },
                    { value: 'GHS', label: 'GHS (₵) - Ghanaian Cedi' },
                    { value: 'UGX', label: 'UGX (USh) - Ugandan Shilling' },
                    { value: 'TZS', label: 'TZS (TSh) - Tanzanian Shilling' },
                    { value: 'ETB', label: 'ETB (Br) - Ethiopian Birr' },
                    { value: 'CHF', label: 'CHF (Fr) - Swiss Franc' },
                    { value: 'SEK', label: 'SEK (kr) - Swedish Krona' },
                    { value: 'NOK', label: 'NOK (kr) - Norwegian Krone' },
                    { value: 'DKK', label: 'DKK (kr) - Danish Krone' },
                    { value: 'PLN', label: 'PLN (zł) - Polish Zloty' },
                    { value: 'CZK', label: 'CZK (Kč) - Czech Koruna' },
                    { value: 'HUF', label: 'HUF (Ft) - Hungarian Forint' },
                    { value: 'RON', label: 'RON (lei) - Romanian Leu' },
                    { value: 'BGN', label: 'BGN (лв) - Bulgarian Lev' },
                    { value: 'HRK', label: 'HRK (kn) - Croatian Kuna' },
                    { value: 'RUB', label: 'RUB (₽) - Russian Ruble' },
                    { value: 'UAH', label: 'UAH (₴) - Ukrainian Hryvnia' },
                  ]}
                  value={currency}
                  onChange={(e) => {
                    if (isPremium) {
                      setCurrency(e.target.value);
                    }
                  }}
                  disabled={!isPremium}
                  className={
                    !isPremium
                      ? 'bg-gray-100 cursor-not-allowed opacity-60'
                      : ''
                  }
                />
                {!isPremium && (
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    {t.upgradeToFilterCurrency}
                  </p>
                )}
              </div>
              
              {/* Startup Jobs Filter */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 pt-4 sm:pt-6 col-span-1 sm:col-span-2 lg:col-span-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="startupsOnly"
                    checked={startupsOnly}
                    onChange={(e) => {
                      if (isPremium) {
                        setStartupsOnly(e.target.checked);
                      }
                    }}
                    disabled={!isPremium}
                    className={`w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 flex-shrink-0 ${
                      isPremium ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                    }`}
                  />
                  <label
                    htmlFor="startupsOnly"
                    className={`text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2 ${
                      isPremium
                        ? 'text-gray-700 cursor-pointer'
                        : 'text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isPremium ? (
                      <>
                        <Rocket className="w-3 h-3 sm:w-4 sm:h-4 text-primary-600" />
                        <span>{t.showStartupJobsOnly}</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                        <span>{t.showStartupJobsOnlyPremium}</span>
                      </>
                    )}
                  </label>
                </div>
                {!isPremium && (
                  <p className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    {t.upgradeToFilterStartups}
                  </p>
                )}
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Job Feed */}
      <div className="space-y-3 sm:space-y-4">
        {jobs.length === 0 ? (
          <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow-md px-4">
            <Briefcase className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <p className="text-gray-600 text-base sm:text-lg">{t.noJobsFound}</p>
            <p className="text-gray-500 text-xs sm:text-sm mt-2">
              {t.tryAdjusting}
            </p>
          </div>
        ) : (
          <div className={viewMode === 'compact' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4' : 'space-y-3 sm:space-y-4'}>
            {jobs.map((job) => (
              <div
                key={job._id}
                className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer ${
                  viewMode === 'compact' ? 'p-3 sm:p-4' : ''
                }`}
                onClick={() => navigate(`/student/jobs/${job._id}`)}
              >
                <div className={viewMode === 'compact' ? 'p-0' : 'p-4 sm:p-6'}>
                {/* Job Header */}
                <div className={`flex flex-col ${viewMode === 'compact' ? 'gap-2' : 'sm:flex-row items-start sm:items-start justify-between mb-3 sm:mb-4 gap-3 sm:gap-4'}`}>
                  <div className="flex-1 min-w-0">
                    <h2 className={`${viewMode === 'compact' ? 'text-sm sm:text-base' : 'text-lg sm:text-xl'} font-bold text-gray-900 ${viewMode === 'compact' ? 'mb-1' : 'mb-2'} hover:text-primary-600 line-clamp-2`}>
                      {job.title}
                    </h2>
                    {viewMode === 'detailed' && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                        <span className="flex items-center gap-1 truncate">
                          <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">
                            {isPremium && job.client && !job.client.message 
                              ? (job.client?.clientProfile?.companyEmail || job.client?.email || job.client?.name || 'N/A')
                              : (job.client?.message || t.premiumMembersOnly)}
                          </span>
                        </span>
                        {job.location && (
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">{job.location}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {viewMode === 'compact' && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  <div className={`flex flex-wrap items-start gap-2 ${viewMode === 'compact' ? '' : 'self-start sm:self-auto'}`}>
                    <Badge variant="info" className="text-xs">{job.category}</Badge>
                    {job.urgent && <Badge variant="error" className="text-xs">{t.urgent}</Badge>}
                    {/* Show startup name tag if premium and startup exists */}
                    {isPremium && job.startup && !job.startup.message && job.startup.startupName && (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                        {job.startup.startupName}
                      </Badge>
                    )}
                    {activeTab === 'applied' && job.applicationStatus && (
                      <Badge
                        variant={
                          job.applicationStatus === 'accepted'
                            ? 'success'
                            : job.applicationStatus === 'rejected'
                            ? 'error'
                            : job.applicationStatus === 'shortlisted'
                            ? 'warning'
                            : 'secondary'
                        }
                        className="text-xs"
                      >
                        {job.applicationStatus === 'accepted' ? t.accepted :
                         job.applicationStatus === 'rejected' ? t.rejected :
                         job.applicationStatus === 'shortlisted' ? t.shortlisted :
                         job.applicationStatus === 'pending' ? t.pending :
                         job.applicationStatus}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Applied At (for applied jobs) */}
                {viewMode === 'detailed' && activeTab === 'applied' && job.appliedAt && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-2">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                    <span>{t.appliedOn} {new Date(job.appliedAt).toLocaleDateString()}</span>
                  </div>
                )}

                {/* Description */}
                {viewMode === 'detailed' && (
                  <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 line-clamp-2">
                    {job.description}
                  </p>
                )}

                {/* Skills */}
                {viewMode === 'detailed' && job.skillsRequired && job.skillsRequired.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                    {job.skillsRequired.slice(0, 5).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skillsRequired.length > 5 && (
                      <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm">
                        +{job.skillsRequired.length - 5} {t.more}
                      </span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className={`flex ${viewMode === 'compact' ? 'flex-col gap-2' : 'flex-col sm:flex-row items-start sm:items-center justify-between pt-3 sm:pt-4 border-t gap-3 sm:gap-4'}`}>
                  <div className={`flex ${viewMode === 'compact' ? 'flex-col gap-1' : 'flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto'}`}>
                    {isPremium && job.budget && !job.budget.message ? (
                      <div className={`flex items-center gap-1 ${viewMode === 'compact' ? 'text-sm' : 'text-base sm:text-lg'} font-semibold text-green-600`}>
                        {job.budget.currency} {job.budget.min} - {job.budget.max}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 italic">
                        {job.budget?.message || t.premiumMembersOnly}
                      </div>
                    )}
                    {viewMode === 'detailed' && job.duration && (
                      <span className="text-xs sm:text-sm text-gray-600">
                        {job.duration}
                      </span>
                    )}
                  </div>
                  <div className={`flex items-center ${viewMode === 'compact' ? 'justify-between w-full' : 'justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto'}`}>
                    {viewMode === 'detailed' && (
                      <span className="text-xs sm:text-sm text-gray-600">
                        {job.applicationsCount || 0} {job.applicationsCount !== 1 ? t.applicantsPlural : t.applicants}
                      </span>
                    )}
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/student/jobs/${job._id}`);
                      }}
                      className={`text-xs sm:text-sm ${viewMode === 'compact' ? 'px-2 sm:px-3 py-1 sm:py-1.5' : 'px-3 sm:px-4 py-1.5 sm:py-2'}`}
                    >
                      {viewMode === 'compact' ? t.viewDetails : t.viewDetails}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasNextPage && (
          <div className="text-center py-4 sm:py-6">
            <Button
              variant="outline"
              onClick={() => fetchNextPage()}
              loading={isFetchingNextPage}
              disabled={isFetchingNextPage}
              className="flex items-center gap-2 mx-auto text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5"
            >
              {isFetchingNextPage ? t.loadingMore : t.loadMore}
              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        )}

        {!hasNextPage && jobs.length > 0 && (
          <div className="text-center py-4 sm:py-6 text-xs sm:text-sm text-gray-500">
            {t.endOfList}
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
