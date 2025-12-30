import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useAuthStore } from '../stores/authStore';
import { generatePassword, validatePassword } from '../utils/passwordGenerator';
import { universityService } from '../services/universityService';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import UniversitySelect from '../components/common/UniversitySelect';
import Alert from '../components/common/Alert';
import logo from '../assets/logos/01.png';
import { RefreshCw, CheckCircle, XCircle, Eye, EyeOff, Briefcase, Users, Shield, Zap, Star, Globe } from 'lucide-react';

// Country to Currency mapping
const COUNTRY_CURRENCY_MAP = {
  // Americas
  'United States': 'USD', 'Canada': 'USD', 'Mexico': 'USD', 'Brazil': 'USD',
  'Argentina': 'USD', 'Chile': 'USD', 'Colombia': 'USD', 'Peru': 'USD',
  // Middle East
  'Egypt': 'EGP', 'Saudi Arabia': 'SAR', 'United Arab Emirates': 'AED',
  'Kuwait': 'KWD', 'Qatar': 'QAR', 'Bahrain': 'BHD', 'Oman': 'OMR',
  'Jordan': 'JOD', 'Lebanon': 'LBP', 'Palestine': 'USD', 'Turkey': 'TRY',
  // Africa
  'South Africa': 'ZAR', 'Morocco': 'MAD', 'Tunisia': 'TND', 'Algeria': 'DZD',
  'Nigeria': 'NGN', 'Kenya': 'KES', 'Ghana': 'GHS', 'Uganda': 'UGX',
  'Tanzania': 'TZS', 'Ethiopia': 'ETB',
  // Europe
  'United Kingdom': 'GBP', 'Switzerland': 'CHF', 'Sweden': 'SEK', 'Norway': 'NOK', 
  'Denmark': 'DKK', 'Poland': 'PLN', 'Czech Republic': 'CZK', 'Hungary': 'HUF',
  'Romania': 'RON', 'Bulgaria': 'BGN', 'Croatia': 'HRK', 'Russia': 'RUB', 
  'Ukraine': 'UAH', 'Germany': 'EUR', 'France': 'EUR', 'Italy': 'EUR', 
  'Spain': 'EUR', 'Netherlands': 'EUR', 'Belgium': 'EUR', 'Austria': 'EUR', 
  'Greece': 'EUR', 'Portugal': 'EUR', 'Ireland': 'EUR', 'Finland': 'EUR', 
  'Slovakia': 'EUR',
  // Asia
  'China': 'USD', 'Japan': 'USD', 'South Korea': 'USD', 'India': 'USD',
  'Pakistan': 'USD', 'Bangladesh': 'USD', 'Indonesia': 'USD', 'Philippines': 'USD',
  'Vietnam': 'USD', 'Thailand': 'USD', 'Malaysia': 'USD', 'Singapore': 'USD',
  // Oceania
  'Australia': 'USD', 'New Zealand': 'USD',
};

// Country name to ISO country code mapping (for university filtering)
const COUNTRY_TO_ISO_CODE = {
  'Afghanistan': 'AF', 'Albania': 'AL', 'Algeria': 'DZ', 'Argentina': 'AR',
  'Australia': 'AU', 'Austria': 'AT', 'Bahrain': 'BH', 'Bangladesh': 'BD',
  'Belgium': 'BE', 'Brazil': 'BR', 'Bulgaria': 'BG', 'Canada': 'CA',
  'Chile': 'CL', 'China': 'CN', 'Colombia': 'CO', 'Croatia': 'HR',
  'Czech Republic': 'CZ', 'Denmark': 'DK', 'Egypt': 'EG', 'Ethiopia': 'ET',
  'Finland': 'FI', 'France': 'FR', 'Germany': 'DE', 'Ghana': 'GH',
  'Greece': 'GR', 'Hungary': 'HU', 'India': 'IN', 'Indonesia': 'ID',
  'Ireland': 'IE', 'Italy': 'IT', 'Japan': 'JP', 'Jordan': 'JO',
  'Kenya': 'KE', 'Kuwait': 'KW', 'Lebanon': 'LB', 'Malaysia': 'MY',
  'Mexico': 'MX', 'Morocco': 'MA', 'Netherlands': 'NL', 'New Zealand': 'NZ',
  'Nigeria': 'NG', 'Norway': 'NO', 'Oman': 'OM', 'Pakistan': 'PK',
  'Palestine': 'PS', 'Peru': 'PE', 'Philippines': 'PH', 'Poland': 'PL',
  'Portugal': 'PT', 'Qatar': 'QA', 'Romania': 'RO', 'Russia': 'RU',
  'Saudi Arabia': 'SA', 'Singapore': 'SG', 'Slovakia': 'SK', 'South Africa': 'ZA',
  'South Korea': 'KR', 'Spain': 'ES', 'Sweden': 'SE', 'Switzerland': 'CH',
  'Tanzania': 'TZ', 'Thailand': 'TH', 'Tunisia': 'TN', 'Turkey': 'TR',
  'Uganda': 'UG', 'Ukraine': 'UA', 'United Arab Emirates': 'AE', 'United Kingdom': 'GB',
  'United States': 'US', 'Vietnam': 'VN',
};

// Country to Phone Code mapping
const COUNTRY_PHONE_CODE_MAP = {
  'United States': '+1', 'Canada': '+1', 'Mexico': '+52', 'Brazil': '+55',
  'Argentina': '+54', 'Chile': '+56', 'Colombia': '+57', 'Peru': '+51',
  'Venezuela': '+58', 'Ecuador': '+593', 'Bolivia': '+591', 'Paraguay': '+595',
  'Uruguay': '+598', 'Costa Rica': '+506', 'Panama': '+507', 'Guatemala': '+502',
  'Egypt': '+20', 'Saudi Arabia': '+966', 'United Arab Emirates': '+971',
  'Kuwait': '+965', 'Qatar': '+974', 'Bahrain': '+973', 'Oman': '+968',
  'Jordan': '+962', 'Lebanon': '+961', 'Palestine': '+970', 'Turkey': '+90',
  'Israel': '+972', 'Syria': '+963', 'Iraq': '+964', 'Iran': '+98', 'Yemen': '+967',
  'South Africa': '+27', 'Morocco': '+212', 'Tunisia': '+216',
  'Algeria': '+213', 'Nigeria': '+234', 'Kenya': '+254', 'Ghana': '+233',
  'Uganda': '+256', 'Tanzania': '+255', 'Ethiopia': '+251', 'Rwanda': '+250',
  'United Kingdom': '+44', 'Switzerland': '+41', 'Sweden': '+46',
  'Norway': '+47', 'Denmark': '+45', 'Poland': '+48', 'Czech Republic': '+420',
  'Hungary': '+36', 'Romania': '+40', 'Bulgaria': '+359', 'Croatia': '+385',
  'Russia': '+7', 'Ukraine': '+380', 'Germany': '+49', 'France': '+33',
  'Italy': '+39', 'Spain': '+34', 'Netherlands': '+31', 'Belgium': '+32',
  'Austria': '+43', 'Greece': '+30', 'Portugal': '+351', 'Ireland': '+353',
  'Finland': '+358', 'Slovakia': '+421', 'Slovenia': '+386', 'Lithuania': '+370',
  'Latvia': '+371', 'Estonia': '+372', 'Serbia': '+381', 'Albania': '+355',
  'China': '+86', 'Japan': '+81', 'South Korea': '+82', 'India': '+91',
  'Pakistan': '+92', 'Bangladesh': '+880', 'Indonesia': '+62', 'Philippines': '+63',
  'Vietnam': '+84', 'Thailand': '+66', 'Malaysia': '+60', 'Singapore': '+65',
  'Australia': '+61', 'New Zealand': '+64',
};

// Country options for dropdown
const COUNTRY_OPTIONS = [
  { value: 'Afghanistan', label: 'Afghanistan' },
  { value: 'Albania', label: 'Albania' },
  { value: 'Algeria', label: 'Algeria' },
  { value: 'Argentina', label: 'Argentina' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Austria', label: 'Austria' },
  { value: 'Bahrain', label: 'Bahrain' },
  { value: 'Bangladesh', label: 'Bangladesh' },
  { value: 'Belgium', label: 'Belgium' },
  { value: 'Brazil', label: 'Brazil' },
  { value: 'Bulgaria', label: 'Bulgaria' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Chile', label: 'Chile' },
  { value: 'China', label: 'China' },
  { value: 'Colombia', label: 'Colombia' },
  { value: 'Croatia', label: 'Croatia' },
  { value: 'Czech Republic', label: 'Czech Republic' },
  { value: 'Denmark', label: 'Denmark' },
  { value: 'Egypt', label: 'Egypt' },
  { value: 'Ethiopia', label: 'Ethiopia' },
  { value: 'Finland', label: 'Finland' },
  { value: 'France', label: 'France' },
  { value: 'Germany', label: 'Germany' },
  { value: 'Ghana', label: 'Ghana' },
  { value: 'Greece', label: 'Greece' },
  { value: 'Hungary', label: 'Hungary' },
  { value: 'India', label: 'India' },
  { value: 'Indonesia', label: 'Indonesia' },
  { value: 'Ireland', label: 'Ireland' },
  { value: 'Italy', label: 'Italy' },
  { value: 'Japan', label: 'Japan' },
  { value: 'Jordan', label: 'Jordan' },
  { value: 'Kenya', label: 'Kenya' },
  { value: 'Kuwait', label: 'Kuwait' },
  { value: 'Lebanon', label: 'Lebanon' },
  { value: 'Malaysia', label: 'Malaysia' },
  { value: 'Mexico', label: 'Mexico' },
  { value: 'Morocco', label: 'Morocco' },
  { value: 'Netherlands', label: 'Netherlands' },
  { value: 'New Zealand', label: 'New Zealand' },
  { value: 'Nigeria', label: 'Nigeria' },
  { value: 'Norway', label: 'Norway' },
  { value: 'Oman', label: 'Oman' },
  { value: 'Pakistan', label: 'Pakistan' },
  { value: 'Palestine', label: 'Palestine' },
  { value: 'Peru', label: 'Peru' },
  { value: 'Philippines', label: 'Philippines' },
  { value: 'Poland', label: 'Poland' },
  { value: 'Portugal', label: 'Portugal' },
  { value: 'Qatar', label: 'Qatar' },
  { value: 'Romania', label: 'Romania' },
  { value: 'Russia', label: 'Russia' },
  { value: 'Saudi Arabia', label: 'Saudi Arabia' },
  { value: 'Singapore', label: 'Singapore' },
  { value: 'Slovakia', label: 'Slovakia' },
  { value: 'South Africa', label: 'South Africa' },
  { value: 'South Korea', label: 'South Korea' },
  { value: 'Spain', label: 'Spain' },
  { value: 'Sweden', label: 'Sweden' },
  { value: 'Switzerland', label: 'Switzerland' },
  { value: 'Tanzania', label: 'Tanzania' },
  { value: 'Thailand', label: 'Thailand' },
  { value: 'Tunisia', label: 'Tunisia' },
  { value: 'Turkey', label: 'Turkey' },
  { value: 'Uganda', label: 'Uganda' },
  { value: 'Ukraine', label: 'Ukraine' },
  { value: 'United Arab Emirates', label: 'United Arab Emirates' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'United States', label: 'United States' },
  { value: 'Vietnam', label: 'Vietnam' },
];

// Nationality options for dropdown
const NATIONALITY_OPTIONS = [
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
];

// Country code options for phone number
const COUNTRY_CODE_OPTIONS = [
  { value: '+1', label: '+1 (US/Canada)' },
  { value: '+20', label: '+20 (Egypt)' },
  { value: '+27', label: '+27 (South Africa)' },
  { value: '+30', label: '+30 (Greece)' },
  { value: '+31', label: '+31 (Netherlands)' },
  { value: '+32', label: '+32 (Belgium)' },
  { value: '+33', label: '+33 (France)' },
  { value: '+34', label: '+34 (Spain)' },
  { value: '+36', label: '+36 (Hungary)' },
  { value: '+39', label: '+39 (Italy)' },
  { value: '+40', label: '+40 (Romania)' },
  { value: '+41', label: '+41 (Switzerland)' },
  { value: '+43', label: '+43 (Austria)' },
  { value: '+44', label: '+44 (UK)' },
  { value: '+45', label: '+45 (Denmark)' },
  { value: '+46', label: '+46 (Sweden)' },
  { value: '+47', label: '+47 (Norway)' },
  { value: '+48', label: '+48 (Poland)' },
  { value: '+49', label: '+49 (Germany)' },
  { value: '+51', label: '+51 (Peru)' },
  { value: '+52', label: '+52 (Mexico)' },
  { value: '+54', label: '+54 (Argentina)' },
  { value: '+55', label: '+55 (Brazil)' },
  { value: '+56', label: '+56 (Chile)' },
  { value: '+57', label: '+57 (Colombia)' },
  { value: '+60', label: '+60 (Malaysia)' },
  { value: '+61', label: '+61 (Australia)' },
  { value: '+62', label: '+62 (Indonesia)' },
  { value: '+63', label: '+63 (Philippines)' },
  { value: '+64', label: '+64 (New Zealand)' },
  { value: '+65', label: '+65 (Singapore)' },
  { value: '+66', label: '+66 (Thailand)' },
  { value: '+81', label: '+81 (Japan)' },
  { value: '+82', label: '+82 (South Korea)' },
  { value: '+84', label: '+84 (Vietnam)' },
  { value: '+86', label: '+86 (China)' },
  { value: '+90', label: '+90 (Turkey)' },
  { value: '+91', label: '+91 (India)' },
  { value: '+92', label: '+92 (Pakistan)' },
  { value: '+212', label: '+212 (Morocco)' },
  { value: '+213', label: '+213 (Algeria)' },
  { value: '+216', label: '+216 (Tunisia)' },
  { value: '+233', label: '+233 (Ghana)' },
  { value: '+234', label: '+234 (Nigeria)' },
  { value: '+251', label: '+251 (Ethiopia)' },
  { value: '+254', label: '+254 (Kenya)' },
  { value: '+255', label: '+255 (Tanzania)' },
  { value: '+256', label: '+256 (Uganda)' },
  { value: '+351', label: '+351 (Portugal)' },
  { value: '+353', label: '+353 (Ireland)' },
  { value: '+358', label: '+358 (Finland)' },
  { value: '+359', label: '+359 (Bulgaria)' },
  { value: '+385', label: '+385 (Croatia)' },
  { value: '+420', label: '+420 (Czech Republic)' },
  { value: '+421', label: '+421 (Slovakia)' },
  { value: '+880', label: '+880 (Bangladesh)' },
  { value: '+961', label: '+961 (Lebanon)' },
  { value: '+962', label: '+962 (Jordan)' },
  { value: '+965', label: '+965 (Kuwait)' },
  { value: '+966', label: '+966 (Saudi Arabia)' },
  { value: '+970', label: '+970 (Palestine)' },
  { value: '+971', label: '+971 (UAE)' },
  { value: '+973', label: '+973 (Bahrain)' },
  { value: '+974', label: '+974 (Qatar)' },
  { value: '+968', label: '+968 (Oman)' },
];

const translations = {
  en: {
    createAccount: 'Create your account',
    step1of2: 'Step 1 of 2: Basic Information',
    step2of2: 'Step 2 of 2: Complete Your Profile',
    fullName: 'Full Name',
    fullNamePlaceholder: 'John Doe',
    fullNameRequired: 'Please enter your full name',
    emailAddress: 'Email Address',
    emailPlaceholder: 'your@email.com',
    emailRequired: 'Please enter your email address',
    invalidEmail: 'Please enter a valid email address (e.g., name@example.com)',
    password: 'Password',
    passwordRequired: 'Please create a password',
    passwordRequirements: 'Password Requirements:',
    passwordMinLength: 'At least 12 characters',
    passwordUppercase: 'One uppercase letter (A-Z)',
    passwordLowercase: 'One lowercase letter (a-z)',
    passwordNumber: 'One number (0-9)',
    passwordSpecial: 'One special character (!@#$%^&*()_+-=[]{}|;:,.<>?)',
    generatePassword: 'Generate Password',
    passwordGenerated: 'Password generated!',
    showPassword: 'Show Password',
    hidePassword: 'Hide Password',
    confirmPassword: 'Confirm Password',
    confirmPasswordRequired: 'Please confirm your password',
    passwordsDoNotMatch: 'The passwords you entered do not match. Please try again.',
    iAmA: 'I am a...',
    roleRequired: 'Please select whether you\'re a student or client',
    studentLookingForWork: 'Student - Looking for work',
    clientHiringStudents: 'Client - Hiring students',
    completeAllFields: 'Please complete all required fields to continue',
    countryOfStudy: 'Country of Study',
    selectCountryOfStudy: 'Select country of study',
    countryOfStudyRequired: 'Please select the country where you study',
    autoConfigured: 'Auto-configured based on your country:',
    phoneCode: 'Phone Code:',
    currency: 'Currency:',
    nationality: 'Nationality',
    selectNationality: 'Select your nationality',
    nationalityRequired: 'Please select your nationality',
    gender: 'Gender',
    selectGender: 'Select your gender',
    genderRequired: 'Please select your gender',
    male: 'Male',
    female: 'Female',
    phoneNumber: 'Phone Number',
    code: 'Code',
    countryCodeRequired: 'Please select your country code',
    phoneNumberRequired: 'Please enter your phone number',
    invalidPhoneNumber: 'Please enter a valid phone number with 7 to 15 digits',
    countryCodeAutoSet: 'Country code is automatically set based on your country of study',
    university: 'University',
    universityPlaceholder: 'University of...',
    universityRequired: 'Please enter your university name',
    universityOther: 'Other (Please specify)',
    customUniversity: 'Custom University Name',
    customUniversityPlaceholder: 'Enter your university name',
    customUniversityRequired: 'Please enter your university name',
    universitySubmitted: 'Your university has been submitted for review. You can continue with registration.',
    major: 'Major',
    majorPlaceholder: 'Computer Science',
    majorRequired: 'Please enter your field of study or major',
    expectedGraduationYear: 'Expected Graduation Year',
    graduationYearPlaceholder: '2025',
    graduationYearRequired: 'Please enter your expected graduation year',
    invalidGraduationYear: 'Please enter a valid graduation year',
    experienceLevel: 'Experience Level',
    selectExperienceLevel: 'Select your experience level',
    experienceLevelRequired: 'Please select your experience level',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    expert: 'Expert',
    country: 'Country',
    selectCountry: 'Select your country',
    countryRequired: 'Please select your country',
    industry: 'Industry',
    selectIndustry: 'Select your industry',
    technology: 'Technology',
    ecommerce: 'E-commerce',
    healthcare: 'Healthcare',
    finance: 'Finance',
    education: 'Education',
    marketing: 'Marketing',
    realEstate: 'Real Estate',
    manufacturing: 'Manufacturing',
    consulting: 'Consulting',
    nonProfit: 'Non-profit',
    other: 'Other',
    specifyIndustry: 'Please specify your industry',
    enterIndustry: 'Enter your industry',
    specifyIndustryRequired: 'Please specify your industry',
    yearsOfExperience: 'Years of Experience',
    yearsOfExperiencePlaceholder: '5',
    yearsOfExperienceMin: 'Years of experience must be 0 or greater',
    yearsOfExperienceMax: 'Years of experience must be 50 or less',
    age: 'Age',
    agePlaceholder: '25',
    ageRequired: 'Please enter your age',
    ageMin: 'You must be at least 18 years old',
    ageMax: 'Please enter a valid age',
    howDidYouHear: 'How did you hear about us?',
    selectOption: 'Select an option',
    howDidYouHearRequired: 'Please select how you heard about us',
    googleSearch: 'Google Search',
    socialMedia: 'Social Media',
    friendColleague: 'Friend/Colleague',
    universityCollege: 'University/College',
    advertisement: 'Advertisement',
    blogArticle: 'Blog/Article',
    specifyHowYouHeard: 'Please specify how you heard about us',
    enterDetails: 'Enter details',
    iAmStartup: 'I am a startup',
    startupInformation: 'Startup Information',
    startupName: 'Startup Name',
    startupNamePlaceholder: 'My Awesome Startup',
    startupNameRequired: 'Startup name is required',
    yourPosition: 'Your Position',
    positionPlaceholder: 'CEO, Founder, CTO, etc.',
    positionRequired: 'Your position is required',
    numberOfEmployees: 'Number of Employees',
    selectNumberOfEmployees: 'Select number of employees',
    numberOfEmployeesRequired: 'Number of employees is required',
    employees1_5: '1-5 employees',
    employees6_10: '6-10 employees',
    employees11_20: '11-20 employees',
    employees21_50: '21-50 employees',
    employees51_100: '51-100 employees',
    employees100Plus: '100+ employees',
    startupIndustry: 'Startup Industry',
    selectStartupIndustry: 'Select your startup industry',
    startupIndustryRequired: 'Startup industry is required',
    specifyStartupIndustry: 'Please specify your startup industry',
    startupStage: 'Startup Stage',
    selectStartupStage: 'Select your startup stage',
    startupStageRequired: 'Startup stage is required',
    idea: 'Idea',
    mvp: 'MVP',
    earlyStage: 'Early Stage',
    growth: 'Growth',
    scale: 'Scale',
    back: 'Back',
    continue: 'Continue',
    createAccountButton: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    signIn: 'Sign in',
    couldNotCreateAccount: 'We couldn\'t create your account. Please check your information and try again.',
    emailAlreadyRegistered: 'This email address is already registered. Please sign in or use a different email.',
    phoneRequired: 'Please enter your phone number to continue.',
    nationalityRequiredError: 'Please select your nationality to continue.',
    passwordIssue: 'There was an issue with your password. Please ensure it meets all requirements.',
    invalidEmailError: 'Please enter a valid email address.',
    unableToConnect: 'Unable to connect to our servers. Please check your internet connection and try again.',
    experienceLevelRequiredError: 'Experience level is required',
    tagline: 'Join thousands of students and clients building the future together',
    whyJoin: 'Why Join Freshlancer?',
    benefit1: 'Verified Opportunities',
    benefit1Desc: 'Access quality projects from verified startups and businesses',
    benefit2: 'Global Network',
    benefit2Desc: 'Connect with clients and students from around the world',
    benefit3: 'Secure & Trusted',
    benefit3Desc: 'Enterprise-grade security protecting your data and transactions',
    benefit4: 'Build Your Career',
    benefit4Desc: 'Showcase your skills and build a professional portfolio',
    trustedBy: 'Trusted by',
    students: 'Students',
    clients: 'Clients',
    projects: 'Projects Completed',
  },
  it: {
    createAccount: 'Crea il tuo account',
    step1of2: 'Passo 1 di 2: Informazioni Base',
    step2of2: 'Passo 2 di 2: Completa il Tuo Profilo',
    fullName: 'Nome Completo',
    fullNamePlaceholder: 'Mario Rossi',
    fullNameRequired: 'Inserisci il tuo nome completo',
    emailAddress: 'Indirizzo Email',
    emailPlaceholder: 'tua@email.com',
    emailRequired: 'Inserisci il tuo indirizzo email',
    invalidEmail: 'Inserisci un indirizzo email valido (es. nome@esempio.com)',
    password: 'Password',
    passwordRequired: 'Crea una password',
    passwordRequirements: 'Requisiti Password:',
    passwordMinLength: 'Almeno 12 caratteri',
    passwordUppercase: 'Una lettera maiuscola (A-Z)',
    passwordLowercase: 'Una lettera minuscola (a-z)',
    passwordNumber: 'Un numero (0-9)',
    passwordSpecial: 'Un carattere speciale (!@#$%^&*()_+-=[]{}|;:,.<>?)',
    generatePassword: 'Genera Password',
    passwordGenerated: 'Password generata!',
    showPassword: 'Mostra Password',
    hidePassword: 'Nascondi Password',
    confirmPassword: 'Conferma Password',
    confirmPasswordRequired: 'Conferma la tua password',
    passwordsDoNotMatch: 'Le password che hai inserito non corrispondono. Riprova.',
    iAmA: 'Sono un...',
    roleRequired: 'Seleziona se sei uno studente o un cliente',
    studentLookingForWork: 'Studente - Cerco lavoro',
    clientHiringStudents: 'Cliente - Assumo studenti',
    completeAllFields: 'Completa tutti i campi obbligatori per continuare',
    countryOfStudy: 'Paese di Studio',
    selectCountryOfStudy: 'Seleziona il paese di studio',
    countryOfStudyRequired: 'Seleziona il paese dove studi',
    autoConfigured: 'Configurato automaticamente in base al tuo paese:',
    phoneCode: 'Prefisso Telefonico:',
    currency: 'Valuta:',
    nationality: 'Nazionalità',
    selectNationality: 'Seleziona la tua nazionalità',
    nationalityRequired: 'Seleziona la tua nazionalità',
    gender: 'Genere',
    selectGender: 'Seleziona il tuo genere',
    genderRequired: 'Seleziona il tuo genere',
    male: 'Maschio',
    female: 'Femmina',
    phoneNumber: 'Numero di Telefono',
    code: 'Codice',
    countryCodeRequired: 'Seleziona il prefisso del tuo paese',
    phoneNumberRequired: 'Inserisci il tuo numero di telefono',
    invalidPhoneNumber: 'Inserisci un numero di telefono valido con 7-15 cifre',
    countryCodeAutoSet: 'Il prefisso è impostato automaticamente in base al tuo paese di studio',
    university: 'Università',
    universityPlaceholder: 'Università di...',
    universityRequired: 'Inserisci il nome della tua università',
    universityOther: 'Altro (Specifica)',
    customUniversity: 'Nome Università Personalizzato',
    customUniversityPlaceholder: 'Inserisci il nome della tua università',
    customUniversityRequired: 'Inserisci il nome della tua università',
    universitySubmitted: 'La tua università è stata inviata per la revisione. Puoi continuare con la registrazione.',
    major: 'Corso di Laurea',
    majorPlaceholder: 'Informatica',
    majorRequired: 'Inserisci il tuo campo di studio o corso di laurea',
    expectedGraduationYear: 'Anno di Laurea Previsto',
    graduationYearPlaceholder: '2025',
    graduationYearRequired: 'Inserisci il tuo anno di laurea previsto',
    invalidGraduationYear: 'Inserisci un anno di laurea valido',
    experienceLevel: 'Livello di Esperienza',
    selectExperienceLevel: 'Seleziona il tuo livello di esperienza',
    experienceLevelRequired: 'Seleziona il tuo livello di esperienza',
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzato',
    expert: 'Esperto',
    country: 'Paese',
    selectCountry: 'Seleziona il tuo paese',
    countryRequired: 'Seleziona il tuo paese',
    industry: 'Settore',
    selectIndustry: 'Seleziona il tuo settore',
    technology: 'Tecnologia',
    ecommerce: 'E-commerce',
    healthcare: 'Sanità',
    finance: 'Finanza',
    education: 'Istruzione',
    marketing: 'Marketing',
    realEstate: 'Immobiliare',
    manufacturing: 'Manifatturiero',
    consulting: 'Consulenza',
    nonProfit: 'Non profit',
    other: 'Altro',
    specifyIndustry: 'Specifica il tuo settore',
    enterIndustry: 'Inserisci il tuo settore',
    specifyIndustryRequired: 'Specifica il tuo settore',
    yearsOfExperience: 'Anni di Esperienza',
    yearsOfExperiencePlaceholder: '5',
    yearsOfExperienceMin: 'Gli anni di esperienza devono essere 0 o maggiori',
    yearsOfExperienceMax: 'Gli anni di esperienza devono essere 50 o meno',
    age: 'Età',
    agePlaceholder: '25',
    ageRequired: 'Inserisci la tua età',
    ageMin: 'Devi avere almeno 18 anni',
    ageMax: 'Inserisci un\'età valida',
    howDidYouHear: 'Come hai saputo di noi?',
    selectOption: 'Seleziona un\'opzione',
    howDidYouHearRequired: 'Seleziona come hai saputo di noi',
    googleSearch: 'Ricerca Google',
    socialMedia: 'Social Media',
    friendColleague: 'Amico/Collega',
    universityCollege: 'Università/Collegio',
    advertisement: 'Pubblicità',
    blogArticle: 'Blog/Articolo',
    specifyHowYouHeard: 'Specifica come hai saputo di noi',
    enterDetails: 'Inserisci dettagli',
    iAmStartup: 'Sono una startup',
    startupInformation: 'Informazioni Startup',
    startupName: 'Nome Startup',
    startupNamePlaceholder: 'La Mia Fantastica Startup',
    startupNameRequired: 'Il nome della startup è obbligatorio',
    yourPosition: 'La Tua Posizione',
    positionPlaceholder: 'CEO, Fondatore, CTO, ecc.',
    positionRequired: 'La tua posizione è obbligatoria',
    numberOfEmployees: 'Numero di Dipendenti',
    selectNumberOfEmployees: 'Seleziona il numero di dipendenti',
    numberOfEmployeesRequired: 'Il numero di dipendenti è obbligatorio',
    employees1_5: '1-5 dipendenti',
    employees6_10: '6-10 dipendenti',
    employees11_20: '11-20 dipendenti',
    employees21_50: '21-50 dipendenti',
    employees51_100: '51-100 dipendenti',
    employees100Plus: '100+ dipendenti',
    startupIndustry: 'Settore Startup',
    selectStartupIndustry: 'Seleziona il settore della tua startup',
    startupIndustryRequired: 'Il settore della startup è obbligatorio',
    specifyStartupIndustry: 'Specifica il settore della tua startup',
    startupStage: 'Fase Startup',
    selectStartupStage: 'Seleziona la fase della tua startup',
    startupStageRequired: 'La fase della startup è obbligatoria',
    idea: 'Idea',
    mvp: 'MVP',
    earlyStage: 'Fase Iniziale',
    growth: 'Crescita',
    scale: 'Scala',
    back: 'Indietro',
    continue: 'Continua',
    createAccountButton: 'Crea Account',
    alreadyHaveAccount: 'Hai già un account?',
    signIn: 'Accedi',
    couldNotCreateAccount: 'Impossibile creare il tuo account. Controlla le tue informazioni e riprova.',
    emailAlreadyRegistered: 'Questo indirizzo email è già registrato. Accedi o usa un\'email diversa.',
    phoneRequired: 'Inserisci il tuo numero di telefono per continuare.',
    nationalityRequiredError: 'Seleziona la tua nazionalità per continuare.',
    passwordIssue: 'C\'è stato un problema con la tua password. Assicurati che soddisfi tutti i requisiti.',
    invalidEmailError: 'Inserisci un indirizzo email valido.',
    unableToConnect: 'Impossibile connettersi ai nostri server. Controlla la tua connessione internet e riprova.',
    experienceLevelRequiredError: 'Il livello di esperienza è obbligatorio',
    tagline: 'Unisciti a migliaia di studenti e clienti che costruiscono il futuro insieme',
    whyJoin: 'Perché Unirsi a Freshlancer?',
    benefit1: 'Opportunità Verificate',
    benefit1Desc: 'Accedi a progetti di qualità da startup e aziende verificate',
    benefit2: 'Rete Globale',
    benefit2Desc: 'Connettiti con clienti e studenti da tutto il mondo',
    benefit3: 'Sicuro e Affidabile',
    benefit3Desc: 'Sicurezza di livello enterprise che protegge i tuoi dati e transazioni',
    benefit4: 'Costruisci la Tua Carriera',
    benefit4Desc: 'Mostra le tue competenze e costruisci un portfolio professionale',
    trustedBy: 'Fidato da',
    students: 'Studenti',
    clients: 'Clienti',
    projects: 'Progetti Completati',
  },
};

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuthStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('');
  const [step, setStep] = useState(1); // Step 1: Basic info, Step 2: Role-specific info
  const [isOtherUniversity, setIsOtherUniversity] = useState(false);
  const [customUniversityName, setCustomUniversityName] = useState('');
  const [universityAdded, setUniversityAdded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({ isValid: false, errors: [] });
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

  // Save language preference to localStorage and set HTML lang attribute
  useEffect(() => {
    localStorage.setItem('dashboardLanguage', language);
    document.documentElement.lang = language;
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language } }));
  }, [language]);

  const t = translations[language] || translations.en;

  const { register, handleSubmit, watch, setValue, trigger, control, formState: { errors } } = useForm({
    defaultValues: {
      role: ''
    }
  });
  const password = watch('password');
  const selectedRole = watch('role');
  const watchedCountry = watch('country');
  const countryOfStudy = watch('countryOfStudy');
  const phoneCountryCode = watch('phoneCountryCode');
  const phoneNumber = watch('phoneNumber');
  const industry = watch('industry');
  const howDidYouHear = watch('howDidYouHear');
  const isStartup = watch('isStartup');
  const startupIndustry = watch('startupIndustry');

  // Validate password in real-time
  useEffect(() => {
    if (password) {
      const validation = validatePassword(password);
      setPasswordValidation(validation);
    } else {
      setPasswordValidation({ isValid: false, errors: [] });
    }
  }, [password]);

  // Generate password handler
  const handleGeneratePassword = () => {
    const generated = generatePassword(16);
    setValue('password', generated);
    setValue('passwordConfirm', generated);
    setShowPassword(true);
    setShowConfirmPassword(true);
  };

  // Auto-detect currency when country of study changes
  useEffect(() => {
    if (countryOfStudy && COUNTRY_CURRENCY_MAP[countryOfStudy]) {
      const currency = COUNTRY_CURRENCY_MAP[countryOfStudy];
      setValue('currency', currency);
    } else if (countryOfStudy) {
      // Default to USD if country not in map
      setValue('currency', 'USD');
    }
  }, [countryOfStudy, setValue]);

  // Auto-detect phone country code when country of study changes
  useEffect(() => {
    if (countryOfStudy && COUNTRY_PHONE_CODE_MAP[countryOfStudy]) {
      const phoneCode = COUNTRY_PHONE_CODE_MAP[countryOfStudy];
      setValue('phoneCountryCode', phoneCode);
    } else if (countryOfStudy) {
      // Default to +1 if country not in map
      setValue('phoneCountryCode', '+1');
    }
  }, [countryOfStudy, setValue]);

  // Handle first step - basic info validation
  const handleContinue = (data) => {
    setError('');
    // Validate basic fields are filled
    if (!data.name || !data.email || !data.password || !data.passwordConfirm || !data.role) {
      setError(t.completeAllFields);
      return;
    }

    // Check password match
    if (data.password !== data.passwordConfirm) {
      setError(t.passwordsDoNotMatch);
      return;
    }

    // Move to step 2
    setRole(data.role);
    setStep(2);
  };

  // Handle final submission
  const onSubmit = async (data) => {
    // If on step 1, just continue to step 2
    if (step === 1) {
      handleContinue(data);
      return;
    }

    // Step 2: Create account
    try {
      setLoading(true);
      setError('');

      const userData = {
        name: data.name,
        email: data.email,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
        role: data.role,
      };

      // Add role-specific fields
      if (data.role === 'student') {
        // Phone and nationality are required for students
        // Combine country code and phone number
        const fullPhoneNumber = data.phoneCountryCode && data.phoneNumber 
          ? `${data.phoneCountryCode}${data.phoneNumber}` 
          : data.phone || data.phoneNumber;
        userData.phone = fullPhoneNumber;
        userData.nationality = data.nationality;
        userData.gender = data.gender; // Gender is required for students
        
        // Store country of study in country field (NOT in location.country)
        // Location will only contain city (and future fields like zip, lat, long)
        if (data.countryOfStudy) {
          userData.country = data.countryOfStudy;
        }
        
        // Determine currency based on country of study
        const currency = data.countryOfStudy && COUNTRY_CURRENCY_MAP[data.countryOfStudy] 
          ? COUNTRY_CURRENCY_MAP[data.countryOfStudy] 
          : 'USD'; // Default to USD if country not found
        
        // Handle custom university - store the name for now, submit after registration
        let universityName = data.university?.trim() || '';
        if (isOtherUniversity && universityAdded && customUniversityName) {
          universityName = customUniversityName.trim();
        }

        userData.studentProfile = {
          university: universityName,
          major: data.major?.trim() || '',
          graduationYear: data.graduationYear ? parseInt(data.graduationYear) : undefined,
          experienceLevel: data.experienceLevel, // Required field - don't use empty string fallback
          hourlyRate: {
            currency: currency,
          },
        };
        
        // Ensure experienceLevel is provided
        if (!userData.studentProfile.experienceLevel) {
          throw new Error(t.experienceLevelRequiredError);
        }
        
        // Remove graduationYear if it's invalid
        if (isNaN(userData.studentProfile.graduationYear) || userData.studentProfile.graduationYear < 1900 || userData.studentProfile.graduationYear > 2034) {
          delete userData.studentProfile.graduationYear;
        }
      } else if (data.role === 'client') {
        userData.clientProfile = {
          isStartup: data.isStartup || false,
        };
        
        // Handle industry - if "Other" is selected, use industryOther, otherwise use industry
        if (data.industry === 'Other' && data.industryOther) {
          userData.clientProfile.industry = data.industryOther.trim();
        } else if (data.industry && data.industry !== 'Other') {
          userData.clientProfile.industry = data.industry;
        }
        
        // Add years of experience if provided
        if (data.yearsOfExperience) {
          userData.clientProfile.yearsOfExperience = parseInt(data.yearsOfExperience);
        }
        
        // Add age if provided
        if (data.age) {
          userData.age = parseInt(data.age);
        }
        
        // Handle howDidYouHear - if "Other" is selected, use howDidYouHearOther
        if (data.howDidYouHear === 'Other' && data.howDidYouHearOther) {
          userData.clientProfile.howDidYouHear = data.howDidYouHearOther.trim();
        } else if (data.howDidYouHear && data.howDidYouHear !== 'Other') {
          userData.clientProfile.howDidYouHear = data.howDidYouHear;
        }

        // If client is a startup, add startup data to be created after registration
        if (data.isStartup) {
          userData.startup = {
            startupName: data.startupName,
            position: data.startupPosition,
            numberOfEmployees: data.startupNumberOfEmployees,
            industry: data.startupIndustry === 'Other' && data.startupIndustryOther 
              ? data.startupIndustryOther.trim() 
              : data.startupIndustry,
            industryOther: data.startupIndustry === 'Other' ? data.startupIndustryOther?.trim() : undefined,
            stage: data.startupStage,
          };
        }
      }

      const response = await registerUser(userData);

      // Get the registered user - response is already unwrapped by interceptor
      // So response structure is: { status: 'success', token: '...', data: { user: {...} } }
      const user = response.data?.user || response.user;
      
      console.log('[Register] Registration successful, user:', user);
      console.log('[Register] Email verified:', user?.emailVerified);
      console.log('[Register] Full response:', response);
      
      // Submit custom university AFTER registration (user is now authenticated)
      if (isOtherUniversity && universityAdded && customUniversityName) {
        try {
          // Get country code from selected country of study (from form data or userData)
          const countryOfStudy = data.countryOfStudy || userData.country;
          const countryCode = countryOfStudy ? COUNTRY_TO_ISO_CODE[countryOfStudy] : undefined;
          
          console.log('[Register] Submitting custom university:', {
            name: customUniversityName.trim(),
            countryOfStudy,
            countryCode,
          });
          
          if (!countryCode) {
            console.error('[Register] Country code not available for custom university submission. Country of study:', countryOfStudy);
            throw new Error('Country code is required. Please ensure country of study is selected.');
          }
          
          if (!customUniversityName || !customUniversityName.trim()) {
            console.error('[Register] Custom university name is empty');
            throw new Error('University name is required.');
          }
          
          // Submit the custom university to backend (will be pending)
          // User is now authenticated, so this will work
          const universityResponse = await universityService.createPendingUniversity({
            name: customUniversityName.trim(),
            countryCode: countryCode,
          });
          
          // Verify the university was created and update user's university reference
          if (universityResponse?.data?.university || universityResponse?.university) {
            const university = universityResponse.data?.university || universityResponse.university;
            const universityId = university._id || university.id;
            
            console.log('[Register] Custom university submitted successfully:', {
              id: universityId,
              name: university.name,
              countryCode: university.countryCode,
              status: university.status,
            });
            
            // Update user's university reference to link with the created university
            try {
              await authService.updateProfile({
                studentProfile: {
                  university: universityId,
                },
              });
              console.log('[Register] User university reference updated successfully');
            } catch (updateErr) {
              console.error('[Register] Error updating user university reference:', updateErr);
              // Non-blocking error - university is created, reference can be updated later
            }
          } else {
            console.warn('[Register] University response structure unexpected:', universityResponse);
          }
        } catch (err) {
          // Log error but don't block registration - university name is already saved in user profile
          console.error('[Register] Error submitting custom university (non-blocking):', err);
          console.error('[Register] Error details:', {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status,
          });
          if (err.response?.data?.message) {
            console.warn('[Register] University submission error:', err.response.data.message);
          }
        }
      }
      
      // Check if email is verified - if not, redirect to email verification page
      // Default to false if emailVerified is undefined (new registrations should not be verified)
      if (!user?.emailVerified) {
        console.log('[Register] Email not verified, redirecting to verify-email-required');
        // Use replace to prevent back navigation
        navigate('/verify-email-required', { replace: true });
        return;
      }

      // If email is verified, redirect to dashboard based on role
      console.log('[Register] Email verified, redirecting to dashboard');
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'client') {
        navigate('/client/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (err) {
      // Extract user-friendly error message
      let errorMessage = t.couldNotCreateAccount;

      if (err.response?.data?.message) {
        // Make backend error messages more user-friendly
        const backendMessage = err.response.data.message;
        
        // Convert technical messages to user-friendly ones
        if (backendMessage.includes('already registered') || backendMessage.includes('already exists')) {
          errorMessage = t.emailAlreadyRegistered;
        } else if (backendMessage.includes('Phone number is required')) {
          errorMessage = t.phoneRequired;
        } else if (backendMessage.includes('Nationality is required')) {
          errorMessage = t.nationalityRequiredError;
        } else if (backendMessage.includes('password')) {
          errorMessage = t.passwordIssue;
        } else if (backendMessage.includes('email')) {
          errorMessage = t.invalidEmailError;
        } else {
          errorMessage = backendMessage;
        }
      } else if (err.message && err.message !== 'Network Error') {
        errorMessage = err.message;
      }

      // Handle network errors
      if (!err.response && err.message === 'Network Error') {
        errorMessage = t.unableToConnect;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'student', label: t.studentLookingForWork },
    { value: 'client', label: t.clientHiringStudents },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Language Selector - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <div className="flex items-center gap-2 bg-white rounded-lg shadow-md border border-gray-200 px-3 py-2">
          <Globe className="w-4 h-4 text-gray-600" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="border-0 bg-transparent text-sm text-gray-700 focus:outline-none focus:ring-0 cursor-pointer"
            aria-label="Select language"
          >
            <option value="en">EN</option>
            <option value="it">IT</option>
          </select>
        </div>
      </div>

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
        {/* Left Side - Benefits */}
        <div className="hidden lg:block lg:col-span-1 space-y-8 sticky top-8">
          <div className="space-y-4">
          <img src={logo} alt="Freshlancer" className="h-40 w-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
              {t.createAccount}
            </h1>
            <p className="text-base text-gray-600">
              {t.tagline}
            </p>
          </div>
          
          <div className="space-y-6 pt-4">
            <h3 className="text-lg font-semibold text-gray-900">{t.whyJoin}</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-300 transition-colors">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mt-0.5">
                  <CheckCircle className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">{t.benefit1}</h4>
                  <p className="text-xs text-gray-600">{t.benefit1Desc}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-300 transition-colors">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mt-0.5">
                  <Globe className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">{t.benefit2}</h4>
                  <p className="text-xs text-gray-600">{t.benefit2Desc}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-300 transition-colors">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mt-0.5">
                  <Shield className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">{t.benefit3}</h4>
                  <p className="text-xs text-gray-600">{t.benefit3Desc}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-300 transition-colors">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mt-0.5">
                  <Star className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">{t.benefit4}</h4>
                  <p className="text-xs text-gray-600">{t.benefit4Desc}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-4">{t.trustedBy}</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">1000+</div>
                <div className="text-xs text-gray-600 mt-1">{t.students}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">500+</div>
                <div className="text-xs text-gray-600 mt-1">{t.clients}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">2000+</div>
                <div className="text-xs text-gray-600 mt-1">{t.projects}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="lg:col-span-2 w-full">
          <div className="max-w-2xl mx-auto space-y-8 bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="lg:hidden text-center mb-6">
              <img src={logo} alt="Freshlancer" className="h-16 w-auto mx-auto mb-4" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {t.createAccount}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {step === 1 ? t.step1of2 : t.step2of2}
              </p>
            </div>

        {error && (
          <Alert type="error" message={error} />
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label={t.fullName}
                  placeholder={t.fullNamePlaceholder}
                  error={errors.name?.message}
                  {...register('name', { required: t.fullNameRequired })}
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  label={t.emailAddress}
                  type="email"
                  placeholder={t.emailPlaceholder}
                  error={errors.email?.message}
                  {...register('email', {
                    required: t.emailRequired,
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t.invalidEmail,
                    },
                  })}
                />
              </div>

              <div className="md:col-span-2">
                <div className="relative">
                  <Input
                    label={t.password}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    error={errors.password?.message || (password && !passwordValidation.isValid ? passwordValidation.errors[0] : '')}
                    {...register('password', {
                      required: t.passwordRequired,
                      validate: (value) => {
                        const validation = validatePassword(value);
                        if (!validation.isValid) {
                          return validation.errors[0];
                        }
                        return true;
                      },
                    })}
                  />
                  <div className="absolute right-2 top-9 flex gap-1">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                      title={showPassword ? t.hidePassword : t.showPassword}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="p-1 text-primary-600 hover:text-primary-700"
                      title={t.generatePassword}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Password Requirements */}
                <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-xs font-semibold text-gray-700 mb-2">{t.passwordRequirements}</p>
                  <ul className="space-y-1 text-xs text-gray-600">
                    <li className={`flex items-center gap-2 ${password && password.length >= 12 ? 'text-green-600' : ''}`}>
                      {password && password.length >= 12 ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3 text-gray-400" />
                      )}
                      {t.passwordMinLength}
                    </li>
                    <li className={`flex items-center gap-2 ${password && /[a-z]/.test(password) ? 'text-green-600' : ''}`}>
                      {password && /[a-z]/.test(password) ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3 text-gray-400" />
                      )}
                      {t.passwordLowercase}
                    </li>
                    <li className={`flex items-center gap-2 ${password && /[A-Z]/.test(password) ? 'text-green-600' : ''}`}>
                      {password && /[A-Z]/.test(password) ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3 text-gray-400" />
                      )}
                      {t.passwordUppercase}
                    </li>
                    <li className={`flex items-center gap-2 ${password && /[0-9]/.test(password) ? 'text-green-600' : ''}`}>
                      {password && /[0-9]/.test(password) ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3 text-gray-400" />
                      )}
                      {t.passwordNumber}
                    </li>
                    <li className={`flex items-center gap-2 ${password && /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password) ? 'text-green-600' : ''}`}>
                      {password && /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password) ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3 text-gray-400" />
                      )}
                      {t.passwordSpecial}
                    </li>
                  </ul>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="relative">
                  <Input
                    label={t.confirmPassword}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    error={errors.passwordConfirm?.message}
                    {...register('passwordConfirm', {
                      required: t.confirmPasswordRequired,
                      validate: (value) => value === password || t.passwordsDoNotMatch,
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-9 p-1 text-gray-500 hover:text-gray-700"
                    title={showConfirmPassword ? t.hidePassword : t.showPassword}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <Select
                  label={t.iAmA}
                  options={roleOptions}
                  error={errors.role?.message}
                  {...register('role', { required: t.roleRequired })}
                />
              </div>
            </div>
          )}

          {step === 2 && role === 'student' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Select
                  label={t.countryOfStudy}
                  placeholder={t.selectCountryOfStudy}
                  error={errors.countryOfStudy?.message}
                  {...register('countryOfStudy', {
                    required: t.countryOfStudyRequired,
                  })}
                  options={COUNTRY_OPTIONS}
                />
                {countryOfStudy && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800">
                      <strong>{t.autoConfigured}</strong>
                    </p>
                    <ul className="text-xs text-blue-700 mt-1 space-y-1">
                      <li>• {t.phoneCode} {COUNTRY_PHONE_CODE_MAP[countryOfStudy] || '+1'}</li>
                      <li>• {t.currency} {COUNTRY_CURRENCY_MAP[countryOfStudy] || 'USD'}</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <Select
                  label={t.nationality}
                  placeholder={t.selectNationality}
                  error={errors.nationality?.message}
                  {...register('nationality', {
                    required: t.nationalityRequired,
                  })}
                  options={NATIONALITY_OPTIONS}
                />
              </div>

              <Select
                label={t.gender}
                placeholder={t.selectGender}
                error={errors.gender?.message}
                {...register('gender', {
                  required: t.genderRequired,
                })}
                options={[
                  { value: 'Male', label: t.male },
                  { value: 'Female', label: t.female },
                ]}
              />

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.phoneNumber} *
                </label>
                <div className="flex gap-2">
                  <div className="w-1/3">
                    <Input
                      placeholder={t.code}
                      {...register('phoneCountryCode', {
                        required: t.countryCodeRequired,
                      })}
                      disabled
                      className="bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div className="w-2/3">
                    <Input
                      type="tel"
                      placeholder="1234567890"
                      error={errors.phoneNumber?.message}
                      {...register('phoneNumber', {
                        required: t.phoneNumberRequired,
                        pattern: {
                          value: /^[0-9]{7,15}$/,
                          message: t.invalidPhoneNumber,
                        },
                      })}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {t.countryCodeAutoSet}
                </p>
              </div>

              <div className="md:col-span-2">
                <Controller
                  name="university"
                  control={control}
                  rules={{ 
                    required: isOtherUniversity ? (universityAdded ? false : t.customUniversityRequired) : t.universityRequired 
                  }}
                  render={({ field }) => (
                    <>
                      <UniversitySelect
                        label={t.university}
                        placeholder={t.universityPlaceholder}
                        error={errors.university?.message}
                        name="university"
                        value={field.value || ''}
                        countryCode={countryOfStudy ? COUNTRY_TO_ISO_CODE[countryOfStudy] : undefined}
                        onChange={(e) => {
                          console.log('[Register] University onChange called:', e);
                          console.log('[Register] Event target:', e.target);
                          const value = e.target?.value || '';
                          const isOther = e.target?.isOther || value === '__OTHER__';
                          
                          console.log('[Register] University value:', value, 'isOther:', isOther);
                          
                          setIsOtherUniversity(isOther);
                          if (isOther) {
                            field.onChange('__OTHER__');
                            setCustomUniversityName('');
                            setUniversityAdded(false);
                          } else {
                            field.onChange(value);
                            setCustomUniversityName('');
                            setUniversityAdded(false);
                          }
                        }}
                        onBlur={field.onBlur}
                        required
                      />
                      {isOtherUniversity && (
                        <div className="mt-2">
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <Input
                                label={t.customUniversity}
                                placeholder={t.customUniversityPlaceholder}
                                error={errors.university?.message}
                                value={customUniversityName}
                                onChange={(e) => {
                                  setCustomUniversityName(e.target.value);
                                  setUniversityAdded(false);
                                  field.onChange(e.target.value);
                                }}
                                onBlur={field.onBlur}
                                required
                                disabled={universityAdded}
                              />
                            </div>
                            <div className="flex items-end pb-1">
                              <Button
                                type="button"
                                onClick={async () => {
                                  if (!customUniversityName || !customUniversityName.trim()) {
                                    setError(t.customUniversityRequired);
                                    return;
                                  }
                                  if (!countryOfStudy) {
                                    setError(t.countryOfStudyRequired);
                                    return;
                                  }
                                  
                                  // Store the university name - it will be submitted after registration
                                  setUniversityAdded(true);
                                  field.onChange(customUniversityName.trim());
                                  setError('');
                                }}
                                disabled={!customUniversityName?.trim() || !countryOfStudy || universityAdded}
                                size="sm"
                              >
                                {universityAdded ? <CheckCircle className="w-4 h-4" /> : 'Add'}
                              </Button>
                            </div>
                          </div>
                          {universityAdded && (
                            <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              University "{customUniversityName}" will be added after registration
                            </p>
                          )}
                          {!universityAdded && (
                            <p className="mt-1 text-xs text-gray-500">
                              Enter your university name and click "Add" to include it
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                />
              </div>

              <Input
                label={t.major}
                placeholder={t.majorPlaceholder}
                error={errors.major?.message}
                  {...register('major', { required: t.majorRequired })}
              />

              <Input
                label={t.expectedGraduationYear}
                type="number"
                placeholder={t.graduationYearPlaceholder}
                error={errors.graduationYear?.message}
                  {...register('graduationYear', {
                    required: t.graduationYearRequired,
                    min: {
                      value: new Date().getFullYear(),
                      message: t.invalidGraduationYear,
                    },
                    max: {
                      value: 2034,
                      message: t.invalidGraduationYear || 'Graduation year must not exceed 2034',
                    },
                  })}
              />

              <Select
                label={t.experienceLevel}
                placeholder={t.selectExperienceLevel}
                error={errors.experienceLevel?.message}
                {...register('experienceLevel', {
                  required: t.experienceLevelRequired,
                })}
                options={[
                  { value: 'Beginner', label: t.beginner },
                  { value: 'Intermediate', label: t.intermediate },
                  { value: 'Advanced', label: t.advanced },
                  { value: 'Expert', label: t.expert },
                ]}
              />
            </div>
          )}

          {step === 2 && role === 'client' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Select
                  label={t.country}
                  placeholder={t.selectCountry}
                  error={errors.country?.message}
                  {...register('country', {
                    required: t.countryRequired,
                  })}
                  options={COUNTRY_OPTIONS}
                />
              </div>

              <div className="md:col-span-2">
                <Select
                  label={t.industry}
                  placeholder={t.selectIndustry}
                  error={errors.industry?.message}
                  {...register('industry')}
                  options={[
                    { value: 'Technology', label: t.technology },
                    { value: 'E-commerce', label: t.ecommerce },
                    { value: 'Healthcare', label: t.healthcare },
                    { value: 'Finance', label: t.finance },
                    { value: 'Education', label: t.education },
                    { value: 'Marketing', label: t.marketing },
                    { value: 'Real Estate', label: t.realEstate },
                    { value: 'Manufacturing', label: t.manufacturing },
                    { value: 'Consulting', label: t.consulting },
                    { value: 'Non-profit', label: t.nonProfit },
                    { value: 'Other', label: t.other },
                  ]}
                />
              </div>

              {industry === 'Other' && (
                <div className="md:col-span-2">
                  <Input
                    label={t.specifyIndustry}
                    placeholder={t.enterIndustry}
                    error={errors.industryOther?.message}
                    {...register('industryOther', {
                      required: industry === 'Other' ? t.specifyIndustryRequired : false,
                    })}
                  />
                </div>
              )}

              <Input
                label={t.yearsOfExperience}
                type="number"
                placeholder={t.yearsOfExperiencePlaceholder}
                error={errors.yearsOfExperience?.message}
                {...register('yearsOfExperience', {
                  min: {
                    value: 0,
                    message: t.yearsOfExperienceMin,
                  },
                  max: {
                    value: 50,
                    message: t.yearsOfExperienceMax,
                  },
                })}
              />

              <Input
                label={t.age}
                type="number"
                placeholder={t.agePlaceholder}
                error={errors.age?.message}
                {...register('age', {
                  required: t.ageRequired,
                  min: {
                    value: 18,
                    message: t.ageMin,
                  },
                  max: {
                    value: 100,
                    message: t.ageMax,
                  },
                })}
              />

              <div className="md:col-span-2">
                <Select
                  label={t.howDidYouHear}
                  placeholder={t.selectOption}
                  error={errors.howDidYouHear?.message}
                  {...register('howDidYouHear', {
                    required: t.howDidYouHearRequired,
                  })}
                  options={[
                    { value: 'Google Search', label: t.googleSearch },
                    { value: 'Social Media', label: t.socialMedia },
                    { value: 'Friend/Colleague', label: t.friendColleague },
                    { value: 'University/College', label: t.universityCollege },
                    { value: 'Advertisement', label: t.advertisement },
                    { value: 'Blog/Article', label: t.blogArticle },
                    { value: 'Other', label: t.other },
                  ]}
                />
              </div>

              {howDidYouHear === 'Other' && (
                <div className="md:col-span-2">
                  <Input
                    label={t.specifyHowYouHeard}
                    placeholder={t.enterDetails}
                    error={errors.howDidYouHearOther?.message}
                    {...register('howDidYouHearOther', {
                      required: howDidYouHear === 'Other' ? t.specifyHowYouHeard : false,
                    })}
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('isStartup')}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{t.iAmStartup}</span>
                </label>
              </div>

              {isStartup && (
                <>
                  <div className="md:col-span-2 border-t pt-4 mt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.startupInformation}</h3>
                  </div>

                  <div className="md:col-span-2">
                    <Input
                      label={t.startupName}
                      placeholder={t.startupNamePlaceholder}
                      error={errors.startupName?.message}
                      {...register('startupName', {
                        required: isStartup ? t.startupNameRequired : false,
                      })}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Input
                      label={t.yourPosition}
                      placeholder={t.positionPlaceholder}
                      error={errors.startupPosition?.message}
                      {...register('startupPosition', {
                        required: isStartup ? t.positionRequired : false,
                      })}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Select
                      label={t.numberOfEmployees}
                      placeholder={t.selectNumberOfEmployees}
                      error={errors.startupNumberOfEmployees?.message}
                      {...register('startupNumberOfEmployees', {
                        required: isStartup ? t.numberOfEmployeesRequired : false,
                      })}
                      options={[
                        { value: '1-5', label: t.employees1_5 },
                        { value: '6-10', label: t.employees6_10 },
                        { value: '11-20', label: t.employees11_20 },
                        { value: '21-50', label: t.employees21_50 },
                        { value: '51-100', label: t.employees51_100 },
                        { value: '100+', label: t.employees100Plus },
                      ]}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Select
                      label={t.startupIndustry}
                      placeholder={t.selectStartupIndustry}
                      error={errors.startupIndustry?.message}
                      {...register('startupIndustry', {
                        required: isStartup ? t.startupIndustryRequired : false,
                      })}
                      options={[
                        { value: 'Technology', label: t.technology },
                        { value: 'E-commerce', label: t.ecommerce },
                        { value: 'Healthcare', label: t.healthcare },
                        { value: 'Finance', label: t.finance },
                        { value: 'Education', label: t.education },
                        { value: 'Marketing', label: t.marketing },
                        { value: 'Real Estate', label: t.realEstate },
                        { value: 'Manufacturing', label: t.manufacturing },
                        { value: 'Consulting', label: t.consulting },
                        { value: 'Non-profit', label: t.nonProfit },
                        { value: 'Other', label: t.other },
                      ]}
                    />
                  </div>

                  {startupIndustry === 'Other' && (
                    <div className="md:col-span-2">
                      <Input
                        label={t.specifyStartupIndustry}
                        placeholder={t.enterIndustry}
                        error={errors.startupIndustryOther?.message}
                        {...register('startupIndustryOther', {
                          required: startupIndustry === 'Other' && isStartup ? t.specifyStartupIndustry : false,
                        })}
                      />
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <Select
                      label={t.startupStage}
                      placeholder={t.selectStartupStage}
                      error={errors.startupStage?.message}
                      {...register('startupStage', {
                        required: isStartup ? t.startupStageRequired : false,
                      })}
                      options={[
                        { value: 'Idea', label: t.idea },
                        { value: 'MVP', label: t.mvp },
                        { value: 'Early Stage', label: t.earlyStage },
                        { value: 'Growth', label: t.growth },
                        { value: 'Scale', label: t.scale },
                      ]}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <div className="flex gap-4">
            {step === 2 && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setStep(1)}
              >
                {t.back}
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              {step === 1 ? t.continue : t.createAccountButton}
            </Button>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-600">{t.alreadyHaveAccount} </span>
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              {t.signIn}
            </Link>
          </div>
        </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
