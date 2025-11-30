import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { authService } from '../../services/authService';
import { verificationService } from '../../services/verificationService';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Globe,
  Briefcase,
  Award,
  BookOpen,
  Code,
  Link as LinkIcon,
  FileText,
  Languages,
  DollarSign,
  CheckCircle,
  Clock,
  Edit,
  Save,
  Upload,
  Trash2,
  GraduationCap,
  Shield,
  AlertCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { API_BASE_URL } from '../../config/env';

// Country to Currency mapping
const COUNTRY_CURRENCY_MAP = {
  // Americas
  'United States': 'USD',
  'Canada': 'USD',
  'Mexico': 'USD',
  'Brazil': 'USD',
  'Argentina': 'USD',
  'Chile': 'USD',
  'Colombia': 'USD',
  'Peru': 'USD',
  'Venezuela': 'USD',
  'Ecuador': 'USD',
  'Bolivia': 'USD',
  'Paraguay': 'USD',
  'Uruguay': 'USD',
  'Costa Rica': 'USD',
  'Panama': 'USD',
  'Guatemala': 'USD',
  'Honduras': 'USD',
  'El Salvador': 'USD',
  'Nicaragua': 'USD',
  'Belize': 'USD',
  'Jamaica': 'USD',
  'Cuba': 'USD',
  'Haiti': 'USD',
  'Dominican Republic': 'USD',
  'Bahamas': 'USD',
  'Barbados': 'USD',
  'Trinidad and Tobago': 'USD',
  'Guyana': 'USD',
  'Suriname': 'USD',

  // Middle East
  'Saudi Arabia': 'SAR',
  'United Arab Emirates': 'AED',
  'Kuwait': 'KWD',
  'Qatar': 'QAR',
  'Bahrain': 'BHD',
  'Oman': 'OMR',
  'Jordan': 'JOD',
  'Lebanon': 'LBP',
  'Israel': 'ILS',
  'Palestine': 'ILS',
  'Syria': 'USD',
  'Iraq': 'USD',
  'Iran': 'USD',
  'Yemen': 'USD',

  // North Africa
  'Egypt': 'EGP',
  'Morocco': 'MAD',
  'Tunisia': 'TND',
  'Algeria': 'DZD',
  'Libya': 'USD',
  'Mauritania': 'USD',
  'Sudan': 'USD',

  // Sub-Saharan Africa
  'South Africa': 'ZAR',
  'Nigeria': 'NGN',
  'Kenya': 'KES',
  'Ghana': 'GHS',
  'Uganda': 'UGX',
  'Tanzania': 'TZS',
  'Ethiopia': 'ETB',
  'Rwanda': 'USD',
  'Senegal': 'USD',
  'Ivory Coast': 'USD',
  'Cameroon': 'USD',
  'Zimbabwe': 'USD',
  'Zambia': 'USD',
  'Mozambique': 'USD',
  'Botswana': 'USD',
  'Namibia': 'USD',
  'Angola': 'USD',
  'Congo': 'USD',
  'Mali': 'USD',
  'Burkina Faso': 'USD',
  'Benin': 'USD',
  'Togo': 'USD',
  'Malawi': 'USD',
  'Madagascar': 'USD',

  // Europe - Non-Euro
  'United Kingdom': 'GBP',
  'Switzerland': 'CHF',
  'Sweden': 'SEK',
  'Norway': 'NOK',
  'Denmark': 'DKK',
  'Poland': 'PLN',
  'Czech Republic': 'CZK',
  'Hungary': 'HUF',
  'Romania': 'RON',
  'Bulgaria': 'BGN',
  'Croatia': 'HRK',
  'Russia': 'RUB',
  'Ukraine': 'UAH',
  'Serbia': 'USD',
  'Bosnia and Herzegovina': 'USD',
  'Albania': 'USD',
  'North Macedonia': 'USD',
  'Moldova': 'USD',
  'Belarus': 'USD',
  'Iceland': 'USD',

  // Europe - Euro Zone
  'Germany': 'EUR',
  'France': 'EUR',
  'Italy': 'EUR',
  'Spain': 'EUR',
  'Netherlands': 'EUR',
  'Belgium': 'EUR',
  'Austria': 'EUR',
  'Greece': 'EUR',
  'Portugal': 'EUR',
  'Ireland': 'EUR',
  'Finland': 'EUR',
  'Slovakia': 'EUR',
  'Slovenia': 'EUR',
  'Lithuania': 'EUR',
  'Latvia': 'EUR',
  'Estonia': 'EUR',
  'Cyprus': 'EUR',
  'Malta': 'EUR',
  'Luxembourg': 'EUR',
  'Montenegro': 'EUR',
  'Kosovo': 'EUR',

  // Asia
  'Turkey': 'TRY',
  'China': 'USD',
  'Japan': 'USD',
  'South Korea': 'USD',
  'India': 'USD',
  'Pakistan': 'USD',
  'Bangladesh': 'USD',
  'Indonesia': 'USD',
  'Philippines': 'USD',
  'Vietnam': 'USD',
  'Thailand': 'USD',
  'Malaysia': 'USD',
  'Singapore': 'USD',
  'Myanmar': 'USD',
  'Cambodia': 'USD',
  'Laos': 'USD',
  'Nepal': 'USD',
  'Sri Lanka': 'USD',
  'Afghanistan': 'USD',
  'Mongolia': 'USD',
  'Kazakhstan': 'USD',
  'Uzbekistan': 'USD',
  'Turkmenistan': 'USD',
  'Kyrgyzstan': 'USD',
  'Tajikistan': 'USD',
  'Armenia': 'USD',
  'Azerbaijan': 'USD',
  'Georgia': 'USD',

  // Oceania
  'Australia': 'USD',
  'New Zealand': 'USD',
  'Fiji': 'USD',
  'Papua New Guinea': 'USD',
  'Solomon Islands': 'USD',
  'Vanuatu': 'USD',
  'Samoa': 'USD',
  'Tonga': 'USD',
};

const Profile = () => {
  const queryClient = useQueryClient();
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [formError, setFormError] = useState(null);
  const [verificationFile, setVerificationFile] = useState(null);
  const [verificationError, setVerificationError] = useState(null);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [documentDescription, setDocumentDescription] = useState('');
  const fileInputRef = useRef(null);
  const verificationFileInputRef = useRef(null);
  const additionalDocumentInputRef = useRef(null);
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm();
  const { register: registerVerification, handleSubmit: handleSubmitVerification, formState: { errors: verificationErrors }, reset: resetVerification } = useForm();

  // Fetch user profile
  const { data: userData, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => authService.getMe(),
  });

  const user = userData?.data?.user;
  const studentProfile = user?.studentProfile;

  // Fetch verification status and history
  const { data: verificationData, isLoading: loadingVerification, error: verificationQueryError } = useQuery({
    queryKey: ['verifications'],
    queryFn: () => verificationService.getMyVerifications(),
    retry: 1,
    onError: (error) => {
      console.error('Error fetching verifications:', error);
    },
  });

  const verifications = verificationData?.data?.verifications || [];
  const hasApprovedVerification = Array.isArray(verifications) && verifications.length > 0 && verifications.some(v => v && v.status === 'approved');
  const hasPendingVerification = Array.isArray(verifications) && verifications.length > 0 && verifications.some(v => v && v.status === 'pending');
  
  // Determine verification status - check both user profile and verification documents
  const isVerified = studentProfile?.isVerified || hasApprovedVerification;
  const verificationStatus = studentProfile?.verificationStatus || (hasApprovedVerification ? 'verified' : hasPendingVerification ? 'pending' : 'unverified');
  
  // Function to refresh verification status
  const handleRefreshVerification = () => {
    queryClient.invalidateQueries(['userProfile']);
    queryClient.invalidateQueries(['verifications']);
    queryClient.invalidateQueries(['verificationStatus']);
  };

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data) => authService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfile']);
      setShowEditModal(false);
      reset();
      setFormError(null);
      alert('Profile updated successfully!');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to update profile. Please check your input and try again.';
      setFormError(errorMessage);
      console.error('Profile update error:', error);
      // Scroll to top of form to show error
      const modalContent = document.querySelector('.modal-content');
      if (modalContent) {
        modalContent.scrollTop = 0;
      }
    },
  });

  // Handle opening edit modal and populating form
  const handleOpenEditModal = () => {
    setFormError(null); // Clear any previous errors
    if (user) {
      // Set form default values
      setValue('name', user.name || '');
      setValue('phone', user.phone || '');
      setValue('age', user.age || '');
      setValue('gender', user.gender || '');
      setValue('nationality', user.nationality || '');
      setValue('location.country', user.location?.country || '');
      setValue('location.city', user.location?.city || '');
      setValue('location.timezone', user.location?.timezone || '');

      if (studentProfile) {
        setValue('studentProfile.university', studentProfile.university || '');
        setValue('studentProfile.universityLink', studentProfile.universityLink || '');
        setValue('studentProfile.bio', studentProfile.bio || '');
        setValue('studentProfile.experienceLevel', studentProfile.experienceLevel || '');
        setValue('studentProfile.yearsOfExperience', studentProfile.yearsOfExperience || 0);
        setValue('studentProfile.availability', studentProfile.availability || 'Available');
        setValue('studentProfile.hourlyRate.min', studentProfile.hourlyRate?.min || '');
        setValue('studentProfile.hourlyRate.max', studentProfile.hourlyRate?.max || '');
        setValue('studentProfile.hourlyRate.currency', studentProfile.hourlyRate?.currency || 'USD');
        setValue('studentProfile.socialLinks.github', studentProfile.socialLinks?.github || '');
        setValue('studentProfile.socialLinks.linkedin', studentProfile.socialLinks?.linkedin || '');
        setValue('studentProfile.socialLinks.website', studentProfile.socialLinks?.website || '');
        setValue('studentProfile.socialLinks.behance', studentProfile.socialLinks?.behance || '');
        setValue('studentProfile.socialLinks.telegram', studentProfile.socialLinks?.telegram || '');
        setValue('studentProfile.socialLinks.whatsapp', studentProfile.socialLinks?.whatsapp || '');
      }
    }
    setShowEditModal(true);
  };

  // Handle form submission
  const onSubmit = (data) => {
    updateProfileMutation.mutate(data);
  };

  // Upload resume mutation
  const uploadResumeMutation = useMutation({
    mutationFn: (file) => authService.uploadResume(file),
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfile']);
      setUploadingResume(false);
      alert('Resume uploaded successfully!');
    },
    onError: (error) => {
      setUploadingResume(false);
      alert(error.response?.data?.message || 'Failed to upload resume');
    },
  });

  // Delete resume mutation
  const deleteResumeMutation = useMutation({
    mutationFn: () => authService.deleteResume(),
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfile']);
      alert('Resume deleted successfully!');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to delete resume');
    },
  });

  // Upload additional document mutation
  const uploadAdditionalDocumentMutation = useMutation({
    mutationFn: ({ file, description }) => authService.uploadAdditionalDocument(file, description),
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfile']);
      setUploadingDocument(false);
      setDocumentDescription('');
      if (additionalDocumentInputRef.current) {
        additionalDocumentInputRef.current.value = '';
      }
      alert('Document uploaded successfully!');
    },
    onError: (error) => {
      setUploadingDocument(false);
      alert(error.response?.data?.message || 'Failed to upload document');
    },
  });

  // Delete additional document mutation
  const deleteAdditionalDocumentMutation = useMutation({
    mutationFn: (documentIndex) => authService.deleteAdditionalDocument(documentIndex),
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfile']);
      alert('Document deleted successfully!');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to delete document');
    },
  });

  // Upload verification document mutation
  const uploadVerificationMutation = useMutation({
    mutationFn: (formData) => verificationService.uploadDocument(formData),
    onSuccess: () => {
      queryClient.invalidateQueries(['verifications']);
      queryClient.invalidateQueries(['userProfile']);
      queryClient.invalidateQueries(['verificationStatus']);
      resetVerification();
      setVerificationFile(null);
      setVerificationError(null);
      alert('Verification document submitted successfully! Our team will review it within 24-48 hours.');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to submit verification document. Please try again.';
      setVerificationError(errorMessage);
      console.error('Verification upload error:', error);
    },
  });

  // Handle verification form submission
  const onSubmitVerification = (data) => {
    if (!verificationFile) {
      setVerificationError('Please select a document to upload');
      return;
    }

    const formData = new FormData();
    formData.append('document', verificationFile);
    formData.append('documentType', data.documentType);
    formData.append('institutionName', data.institutionName);
    formData.append('studentIdNumber', data.studentIdNumber);
    formData.append('enrollmentYear', data.enrollmentYear);
    formData.append('expectedGraduationYear', data.expectedGraduationYear);

    uploadVerificationMutation.mutate(formData);
  };

  // Handle resume file selection
  const handleResumeChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a PDF, DOC, or DOCX file');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setUploadingResume(true);
      uploadResumeMutation.mutate(file);
    }
  };

  // Handle delete resume
  const handleDeleteResume = () => {
    if (window.confirm('Are you sure you want to delete your resume?')) {
      deleteResumeMutation.mutate();
    }
  };

  // Handle additional document upload
  const handleAdditionalDocumentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadingDocument(true);
      uploadAdditionalDocumentMutation.mutate({
        file,
        description: documentDescription,
      });
    }
  };

  // Handle additional document delete
  const handleDeleteAdditionalDocument = (index) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      deleteAdditionalDocumentMutation.mutate(index);
    }
  };

  const getVerificationBadgeVariant = (status) => {
    switch (status) {
      case 'verified':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'secondary';
    }
  };

  if (isLoading || loadingVerification) {
    return <Loading text="Loading profile..." />;
  }

  if (!user) {
    return (
      <Alert type="error" message="Failed to load profile data" />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Card */}
      <Card>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <img
              src={user.photo}
              alt={user.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-primary-100"
            />
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                {isVerified ? (
                  <Badge variant="success" className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Verified
                  </Badge>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge variant={getVerificationBadgeVariant(verificationStatus)}>
                      {verificationStatus === 'pending' ? 'Pending' : verificationStatus === 'rejected' ? 'Rejected' : 'Unverified'}
                    </Badge>
                    <button
                      onClick={handleRefreshVerification}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                      title="Refresh verification status"
                      disabled={isLoading || loadingVerification}
                    >
                      <RefreshCw 
                        className={`w-4 h-4 text-gray-600 ${isLoading || loadingVerification ? 'animate-spin' : ''}`}
                      />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 text-gray-600 mb-3">
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </span>
                {user.emailVerified && (
                  <Badge variant="info" size="sm">Email Verified</Badge>
                )}
              </div>
              {studentProfile?.bio && (
                <p className="text-gray-700 max-w-2xl">{studentProfile.bio}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenEditModal}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Personal Information */}
        <div className="lg:col-span-1 space-y-6">
          {/* Personal Details */}
          <Card title="Personal Information">
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                  <User className="w-4 h-4" />
                  Full Name
                </label>
                <p className="text-gray-900">{user.name}</p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <p className="text-gray-900">{user.email}</p>
              </div>

              {user.phone && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                    <Phone className="w-4 h-4" />
                    Phone
                  </label>
                  <p className="text-gray-900">{user.phone}</p>
                </div>
              )}

              {user.age && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                    <Calendar className="w-4 h-4" />
                    Age
                  </label>
                  <p className="text-gray-900">{user.age} years old</p>
                </div>
              )}

              {user.gender && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                    <User className="w-4 h-4" />
                    Gender
                  </label>
                  <p className="text-gray-900">{user.gender}</p>
                </div>
              )}

              {user.nationality && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                    <Globe className="w-4 h-4" />
                    Nationality
                  </label>
                  <p className="text-gray-900">{user.nationality}</p>
                </div>
              )}

              {user.location && (user.location.city || user.location.country) && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                    <MapPin className="w-4 h-4" />
                    Location
                  </label>
                  <p className="text-gray-900">
                    {[user.location.city, user.location.country].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}

              {(user.joinedAt || user.createdAt) && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                    <Calendar className="w-4 h-4" />
                    Member Since
                  </label>
                  <p className="text-gray-900">
                    {new Date(user.joinedAt || user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Professional Info */}
          {studentProfile && (
            <Card title="Professional Details">
              <div className="space-y-4">
                {studentProfile.university && (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                      <BookOpen className="w-4 h-4" />
                      University
                    </label>
                    <p className="text-gray-900">{studentProfile.university}</p>
                  </div>
                )}

                {studentProfile.graduationYear && (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                      <Calendar className="w-4 h-4" />
                      Expected Graduation
                    </label>
                    <p className="text-gray-900">{studentProfile.graduationYear}</p>
                  </div>
                )}

                {studentProfile.experienceLevel && (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                      <Briefcase className="w-4 h-4" />
                      Experience Level
                    </label>
                    <Badge variant="info">{studentProfile.experienceLevel}</Badge>
                  </div>
                )}

                {studentProfile.yearsOfExperience !== undefined && (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                      <Clock className="w-4 h-4" />
                      Years of Experience
                    </label>
                    <p className="text-gray-900">{studentProfile.yearsOfExperience} years</p>
                  </div>
                )}

                {studentProfile.availability && (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                      <Clock className="w-4 h-4" />
                      Availability
                    </label>
                    <Badge
                      variant={
                        studentProfile.availability === 'Available'
                          ? 'success'
                          : studentProfile.availability === 'Busy'
                          ? 'warning'
                          : 'secondary'
                      }
                    >
                      {studentProfile.availability}
                    </Badge>
                  </div>
                )}

                {studentProfile.hourlyRate && (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                      <DollarSign className="w-4 h-4" />
                      Hourly Rate
                    </label>
                    <p className="text-gray-900">
                      {studentProfile.hourlyRate.currency} {studentProfile.hourlyRate.min} - 
                      {studentProfile.hourlyRate.max}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Skills, Education, etc. */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skills */}
          {studentProfile?.skills && studentProfile.skills.length > 0 && (
            <Card title="Skills & Expertise">
              <div className="flex flex-wrap gap-3">
                {studentProfile.skills.map((skill, index) => (
                  <div key={index} className="flex flex-col">
                    <Badge variant="primary" className="mb-1">
                      {skill.name}
                    </Badge>
                    {skill.level && (
                      <span className="text-xs text-gray-500 text-center">{skill.level}</span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Education */}
          {(studentProfile?.university || studentProfile?.graduationYear) && (
            <Card>
              <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-primary-600" />
                Education
              </h3>
              <div className="space-y-4">
                {/* University and Expected Graduation Year */}
                <div className="border-l-4 border-primary-500 pl-4 py-2 bg-primary-50 rounded-r-lg">
                  {studentProfile.university && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-600 mb-1">University</p>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-lg text-gray-900">{studentProfile.university}</p>
                        {studentProfile.universityLink && (
                          <a
                            href={studentProfile.universityLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                            title="Visit university website"
                          >
                            <LinkIcon className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                  {studentProfile.graduationYear && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary-600" />
                      <span className="text-sm text-gray-700">
                        <span className="font-semibold">Expected Graduation:</span> {studentProfile.graduationYear}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Languages */}
          {studentProfile?.languages && studentProfile.languages.length > 0 && (
            <Card title="Languages">
              <div className="grid grid-cols-2 gap-4">
                {studentProfile.languages.map((lang, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-900">{lang.language}</span>
                    <Badge variant="secondary">{lang.proficiency}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Certifications */}
          {studentProfile?.certifications && studentProfile.certifications.length > 0 && (
            <Card title="Certifications">
              <div className="space-y-4">
                {studentProfile.certifications.map((cert, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                        <p className="text-gray-700">{cert.issuingOrganization}</p>
                        {cert.credentialId && (
                          <p className="text-sm text-gray-600">ID: {cert.credentialId}</p>
                        )}
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        {cert.issueDate && (
                          <p>{new Date(cert.issueDate).toLocaleDateString()}</p>
                        )}
                        {cert.expirationDate && (
                          <p className="text-red-600">
                            Expires: {new Date(cert.expirationDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 mt-2"
                      >
                        <LinkIcon className="w-4 h-4" />
                        View Credential
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Portfolio */}
          {studentProfile?.portfolio && studentProfile.portfolio.length > 0 && (
            <Card title="Portfolio">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studentProfile.portfolio.map((project, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900 mb-2">{project.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {project.technologies.map((tech, techIndex) => (
                          <Badge key={techIndex} variant="secondary" size="sm">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                      >
                        <LinkIcon className="w-4 h-4" />
                        View Project
                      </a>
                    )}
                    {project.completedDate && (
                      <p className="text-xs text-gray-500 mt-2">
                        Completed: {new Date(project.completedDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Social Links */}
          {studentProfile?.socialLinks && Object.values(studentProfile.socialLinks).some(link => link) && (
            <Card title="Social Links">
              <div className="grid grid-cols-2 gap-4">
                {studentProfile.socialLinks.github && (
                  <a
                    href={studentProfile.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-700 hover:text-primary-600"
                  >
                    <LinkIcon className="w-4 h-4" />
                    GitHub
                  </a>
                )}
                {studentProfile.socialLinks.linkedin && (
                  <a
                    href={studentProfile.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-700 hover:text-primary-600"
                  >
                    <LinkIcon className="w-4 h-4" />
                    LinkedIn
                  </a>
                )}
                {studentProfile.socialLinks.website && (
                  <a
                    href={studentProfile.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-700 hover:text-primary-600"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Website
                  </a>
                )}
                {studentProfile.socialLinks.behance && (
                  <a
                    href={studentProfile.socialLinks.behance}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-700 hover:text-primary-600"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Behance
                  </a>
                )}
                {studentProfile.socialLinks.telegram && (
                  <a
                    href={studentProfile.socialLinks.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-700 hover:text-primary-600"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Telegram
                  </a>
                )}
                {studentProfile.socialLinks.whatsapp && (
                  <a
                    href={studentProfile.socialLinks.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-700 hover:text-primary-600"
                  >
                    <LinkIcon className="w-4 h-4" />
                    WhatsApp
                  </a>
                )}
              </div>
            </Card>
          )}

          {/* Student Verification */}
          <Card title="Student Verification">
            {loadingVerification ? (
              <Loading text="Loading verification status..." />
            ) : verificationQueryError ? (
              <Alert
                type="error"
                message="Failed to load verification status. Please refresh the page."
              />
            ) : hasApprovedVerification ? (
              <div className="space-y-4">
                <Alert
                  type="success"
                  title="Verification Complete"
                  message="Your student status has been verified. You can now apply for jobs!"
                />
                {verifications.filter(v => v && v.status === 'approved').map((verification, index) => (
                  <div key={verification._id || `approved-${index}`} className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900 capitalize">
                            {verification.documentType ? verification.documentType.replace(/_/g, ' ') : 'Verification Document'}
                          </h4>
                          <Badge variant="success">Approved</Badge>
                        </div>
                        <p className="text-sm text-gray-700">{verification.institutionName || 'N/A'}</p>
                        {verification.reviewedAt && (
                          <p className="text-xs text-gray-600 mt-1">
                            Approved: {new Date(verification.reviewedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : hasPendingVerification ? (
              <div className="space-y-4">
                <Alert
                  type="info"
                  title="Verification Pending"
                  message="Your verification is being reviewed by our admin team. This usually takes 24-48 hours."
                />
                {verifications.filter(v => v && v.status === 'pending').map((verification, index) => (
                  <div key={verification._id || `pending-${index}`} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-start gap-3">
                      <Clock className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900 capitalize">
                            {verification.documentType ? verification.documentType.replace(/_/g, ' ') : 'Verification Document'}
                          </h4>
                          <Badge variant="warning">Pending Review</Badge>
                        </div>
                        <p className="text-sm text-gray-700">{verification.institutionName || 'N/A'}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Submitted: {(verification.uploadedAt || verification.createdAt) ? new Date(verification.uploadedAt || verification.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <Alert
                  type="warning"
                  title="Verification Required"
                  message="Please submit your student verification documents to start applying for jobs."
                />
                
                {/* Verification Upload Form */}
                <form onSubmit={handleSubmitVerification(onSubmitVerification)} className="space-y-4">
                  {verificationError && (
                    <Alert
                      type="error"
                      message={verificationError}
                      onClose={() => setVerificationError(null)}
                    />
                  )}

                  <Select
                    label="Document Type"
                    options={[
                      { value: 'student_id', label: 'Student ID Card' },
                      { value: 'enrollment_certificate', label: 'Enrollment Certificate' },
                      { value: 'transcript', label: 'Official Transcript' },
                      { value: 'other', label: 'Other' },
                    ]}
                    error={verificationErrors.documentType?.message}
                    {...registerVerification('documentType', { required: 'Document type is required' })}
                  />

                  <Input
                    label="Institution Name"
                    placeholder="University of..."
                    error={verificationErrors.institutionName?.message}
                    {...registerVerification('institutionName', { required: 'Institution name is required' })}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Student ID Number"
                      placeholder="123456789"
                      error={verificationErrors.studentIdNumber?.message}
                      {...registerVerification('studentIdNumber', { required: 'Student ID is required' })}
                    />

                    <Input
                      label="Enrollment Year"
                      type="number"
                      placeholder="2020"
                      error={verificationErrors.enrollmentYear?.message}
                      {...registerVerification('enrollmentYear', {
                        required: 'Enrollment year is required',
                        min: { value: 2000, message: 'Please enter a valid year' },
                        max: { value: new Date().getFullYear(), message: 'Cannot be in the future' },
                      })}
                    />
                  </div>

                  <Input
                    label="Expected Graduation Year"
                    type="number"
                    placeholder="2025"
                    error={verificationErrors.expectedGraduationYear?.message}
                    {...registerVerification('expectedGraduationYear', {
                      required: 'Graduation year is required',
                      min: { value: new Date().getFullYear(), message: 'Please enter a valid future year' },
                    })}
                  />

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Document <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-400 transition-colors">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
                            <span>Upload a file</span>
                            <input
                              ref={verificationFileInputRef}
                              type="file"
                              className="sr-only"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  // Validate file size (10MB max)
                                  if (file.size > 10 * 1024 * 1024) {
                                    setVerificationError('File size must be less than 10MB');
                                    return;
                                  }
                                  setVerificationFile(file);
                                  setVerificationError(null);
                                }
                              }}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PDF, JPG, PNG up to 10MB
                        </p>
                        {verificationFile && (
                          <p className="text-sm text-primary-600 font-medium">
                            Selected: {verificationFile.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    loading={uploadVerificationMutation.isPending}
                    disabled={uploadVerificationMutation.isPending}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Submit for Verification
                  </Button>
                </form>
              </div>
            )}

            {/* Verification History */}
            {verifications && verifications.length > 0 && verifications.some(v => v && v.status === 'rejected') && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold text-gray-900 mb-3">Verification History</h4>
                <div className="space-y-3">
                  {verifications.filter(v => v && v.status === 'rejected').map((verification, index) => (
                    <div key={verification._id || `rejected-${index}`} className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-start gap-3">
                        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900 capitalize">
                              {verification.documentType?.replace('_', ' ')}
                            </h4>
                            <Badge variant="error">Rejected</Badge>
                          </div>
                          <p className="text-sm text-gray-700">{verification.institutionName || 'N/A'}</p>
                          {verification.rejectionReason && (
                            <Alert
                              type="error"
                              message={`Rejection reason: ${verification.rejectionReason}`}
                              className="mt-2"
                            />
                          )}
                          <p className="text-xs text-gray-600 mt-1">
                            Submitted: {(verification.uploadedAt || verification.createdAt) ? new Date(verification.uploadedAt || verification.createdAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Resume */}
          <Card title="Resume / CV">
            {studentProfile?.resume && studentProfile.resume.url ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-primary-600" />
                    <div>
                      <p className="font-medium text-gray-900">{studentProfile.resume.filename}</p>
                      {studentProfile.resume.uploadedAt && (
                        <p className="text-sm text-gray-600">
                          Uploaded: {new Date(studentProfile.resume.uploadedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                  onClick={() => window.open(`${API_BASE_URL}${studentProfile.resume.url}`, '_blank')}
                    >
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteResume}
                      loading={deleteResumeMutation.isLoading}
                      disabled={deleteResumeMutation.isLoading}
                      className="text-red-600 hover:text-red-700 border-red-600 hover:border-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="pt-3 border-t">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeChange}
                    className="hidden"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    loading={uploadingResume}
                    disabled={uploadingResume}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Replace Resume
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No resume uploaded yet</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeChange}
                  className="hidden"
                />
                <Button
                  variant="primary"
                  onClick={() => fileInputRef.current?.click()}
                  loading={uploadingResume}
                  disabled={uploadingResume}
                  className="flex items-center gap-2 mx-auto"
                >
                  <Upload className="w-4 h-4" />
                  Upload Resume
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Supported formats: PDF, DOC, DOCX (Max 5MB)
                </p>
              </div>
            )}
          </Card>

          {/* Additional Documents */}
          <Card title="Additional Documents (Optional)">
            <div className="space-y-4">
              {/* Upload Form */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="space-y-3">
                  <Input
                    label="Document Description (Optional)"
                    placeholder="e.g., Portfolio, Certificates, References"
                    value={documentDescription}
                    onChange={(e) => setDocumentDescription(e.target.value)}
                    disabled={uploadingDocument}
                  />
                  <input
                    ref={additionalDocumentInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleAdditionalDocumentChange}
                    className="hidden"
                    disabled={uploadingDocument}
                  />
                  <Button
                    variant="secondary"
                    onClick={() => additionalDocumentInputRef.current?.click()}
                    loading={uploadingDocument || uploadAdditionalDocumentMutation.isPending}
                    disabled={uploadingDocument || uploadAdditionalDocumentMutation.isPending}
                    className="flex items-center gap-2 w-full"
                  >
                    <Upload className="w-4 h-4" />
                    {uploadingDocument ? 'Uploading...' : 'Upload Document'}
                  </Button>
                  <p className="text-xs text-gray-500">
                    Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                  </p>
                </div>
              </div>

              {/* Documents List */}
              {studentProfile?.additionalDocuments && studentProfile.additionalDocuments.length > 0 ? (
                <div className="space-y-3">
                  {studentProfile.additionalDocuments.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
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
                              Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`${API_BASE_URL}${doc.url}`, '_blank')}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAdditionalDocument(index)}
                          loading={deleteAdditionalDocumentMutation.isPending}
                          disabled={deleteAdditionalDocumentMutation.isPending}
                          className="text-red-600 hover:text-red-700 border-red-600 hover:border-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm">No additional documents uploaded yet</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setFormError(null);
          reset();
        }}
        title="Edit Profile"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Error Alert */}
          {formError && (
            <Alert
              type="error"
              message={formError}
              onClose={() => setFormError(null)}
            />
          )}
          
          {/* Personal Information Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                {...register('name', { required: 'Name is required' })}
                error={errors.name?.message}
                placeholder="Enter your full name"
              />

              <Input
                label="Phone"
                type="tel"
                {...register('phone')}
                error={errors.phone?.message}
                placeholder="Enter your phone number"
              />

              <Input
                label="Age"
                type="number"
                {...register('age', {
                  min: { value: 16, message: 'Must be at least 16 years old' },
                  max: { value: 100, message: 'Invalid age' }
                })}
                error={errors.age?.message}
                placeholder="Enter your age"
              />

              <Select
                label="Gender"
                {...register('gender')}
                error={errors.gender?.message}
                options={[
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                ]}
              />

              <div>
                <Select
                  label="Nationality"
                  {...register('nationality')}
                  error={errors.nationality?.message}
                  disabled={true}
                  className="bg-gray-100 cursor-not-allowed"
                  options={[
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
                ]}
              />
                <p className="text-xs text-gray-500 mt-1">Nationality cannot be changed after registration</p>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Select
                  label="Country of Study"
                  {...register('location.country')}
                  error={errors.location?.country?.message}
                  disabled={true}
                  className="bg-gray-100 cursor-not-allowed"
                  options={[
                  { value: 'Afghanistan', label: 'Afghanistan' },
                  { value: 'Albania', label: 'Albania' },
                  { value: 'Algeria', label: 'Algeria' },
                  { value: 'Andorra', label: 'Andorra' },
                  { value: 'Angola', label: 'Angola' },
                  { value: 'Argentina', label: 'Argentina' },
                  { value: 'Armenia', label: 'Armenia' },
                  { value: 'Australia', label: 'Australia' },
                  { value: 'Austria', label: 'Austria' },
                  { value: 'Azerbaijan', label: 'Azerbaijan' },
                  { value: 'Bahamas', label: 'Bahamas' },
                  { value: 'Bahrain', label: 'Bahrain' },
                  { value: 'Bangladesh', label: 'Bangladesh' },
                  { value: 'Barbados', label: 'Barbados' },
                  { value: 'Belarus', label: 'Belarus' },
                  { value: 'Belgium', label: 'Belgium' },
                  { value: 'Belize', label: 'Belize' },
                  { value: 'Benin', label: 'Benin' },
                  { value: 'Bhutan', label: 'Bhutan' },
                  { value: 'Bolivia', label: 'Bolivia' },
                  { value: 'Bosnia and Herzegovina', label: 'Bosnia and Herzegovina' },
                  { value: 'Botswana', label: 'Botswana' },
                  { value: 'Brazil', label: 'Brazil' },
                  { value: 'Brunei', label: 'Brunei' },
                  { value: 'Bulgaria', label: 'Bulgaria' },
                  { value: 'Burkina Faso', label: 'Burkina Faso' },
                  { value: 'Burundi', label: 'Burundi' },
                  { value: 'Cambodia', label: 'Cambodia' },
                  { value: 'Cameroon', label: 'Cameroon' },
                  { value: 'Canada', label: 'Canada' },
                  { value: 'Cape Verde', label: 'Cape Verde' },
                  { value: 'Central African Republic', label: 'Central African Republic' },
                  { value: 'Chad', label: 'Chad' },
                  { value: 'Chile', label: 'Chile' },
                  { value: 'China', label: 'China' },
                  { value: 'Colombia', label: 'Colombia' },
                  { value: 'Comoros', label: 'Comoros' },
                  { value: 'Congo', label: 'Congo' },
                  { value: 'Costa Rica', label: 'Costa Rica' },
                  { value: 'Croatia', label: 'Croatia' },
                  { value: 'Cuba', label: 'Cuba' },
                  { value: 'Cyprus', label: 'Cyprus' },
                  { value: 'Czech Republic', label: 'Czech Republic' },
                  { value: 'Denmark', label: 'Denmark' },
                  { value: 'Djibouti', label: 'Djibouti' },
                  { value: 'Dominica', label: 'Dominica' },
                  { value: 'Dominican Republic', label: 'Dominican Republic' },
                  { value: 'Ecuador', label: 'Ecuador' },
                  { value: 'Egypt', label: 'Egypt' },
                  { value: 'El Salvador', label: 'El Salvador' },
                  { value: 'Equatorial Guinea', label: 'Equatorial Guinea' },
                  { value: 'Eritrea', label: 'Eritrea' },
                  { value: 'Estonia', label: 'Estonia' },
                  { value: 'Ethiopia', label: 'Ethiopia' },
                  { value: 'Fiji', label: 'Fiji' },
                  { value: 'Finland', label: 'Finland' },
                  { value: 'France', label: 'France' },
                  { value: 'Gabon', label: 'Gabon' },
                  { value: 'Gambia', label: 'Gambia' },
                  { value: 'Georgia', label: 'Georgia' },
                  { value: 'Germany', label: 'Germany' },
                  { value: 'Ghana', label: 'Ghana' },
                  { value: 'Greece', label: 'Greece' },
                  { value: 'Grenada', label: 'Grenada' },
                  { value: 'Guatemala', label: 'Guatemala' },
                  { value: 'Guinea', label: 'Guinea' },
                  { value: 'Guinea-Bissau', label: 'Guinea-Bissau' },
                  { value: 'Guyana', label: 'Guyana' },
                  { value: 'Haiti', label: 'Haiti' },
                  { value: 'Honduras', label: 'Honduras' },
                  { value: 'Hungary', label: 'Hungary' },
                  { value: 'Iceland', label: 'Iceland' },
                  { value: 'India', label: 'India' },
                  { value: 'Indonesia', label: 'Indonesia' },
                  { value: 'Iran', label: 'Iran' },
                  { value: 'Iraq', label: 'Iraq' },
                  { value: 'Ireland', label: 'Ireland' },
                  { value: 'Israel', label: 'Israel' },
                  { value: 'Italy', label: 'Italy' },
                  { value: 'Jamaica', label: 'Jamaica' },
                  { value: 'Japan', label: 'Japan' },
                  { value: 'Jordan', label: 'Jordan' },
                  { value: 'Kazakhstan', label: 'Kazakhstan' },
                  { value: 'Kenya', label: 'Kenya' },
                  { value: 'Kiribati', label: 'Kiribati' },
                  { value: 'Kuwait', label: 'Kuwait' },
                  { value: 'Kyrgyzstan', label: 'Kyrgyzstan' },
                  { value: 'Laos', label: 'Laos' },
                  { value: 'Latvia', label: 'Latvia' },
                  { value: 'Lebanon', label: 'Lebanon' },
                  { value: 'Lesotho', label: 'Lesotho' },
                  { value: 'Liberia', label: 'Liberia' },
                  { value: 'Libya', label: 'Libya' },
                  { value: 'Liechtenstein', label: 'Liechtenstein' },
                  { value: 'Lithuania', label: 'Lithuania' },
                  { value: 'Luxembourg', label: 'Luxembourg' },
                  { value: 'Madagascar', label: 'Madagascar' },
                  { value: 'Malawi', label: 'Malawi' },
                  { value: 'Malaysia', label: 'Malaysia' },
                  { value: 'Maldives', label: 'Maldives' },
                  { value: 'Mali', label: 'Mali' },
                  { value: 'Malta', label: 'Malta' },
                  { value: 'Marshall Islands', label: 'Marshall Islands' },
                  { value: 'Mauritania', label: 'Mauritania' },
                  { value: 'Mauritius', label: 'Mauritius' },
                  { value: 'Mexico', label: 'Mexico' },
                  { value: 'Micronesia', label: 'Micronesia' },
                  { value: 'Moldova', label: 'Moldova' },
                  { value: 'Monaco', label: 'Monaco' },
                  { value: 'Mongolia', label: 'Mongolia' },
                  { value: 'Montenegro', label: 'Montenegro' },
                  { value: 'Morocco', label: 'Morocco' },
                  { value: 'Mozambique', label: 'Mozambique' },
                  { value: 'Myanmar', label: 'Myanmar' },
                  { value: 'Namibia', label: 'Namibia' },
                  { value: 'Nauru', label: 'Nauru' },
                  { value: 'Nepal', label: 'Nepal' },
                  { value: 'Netherlands', label: 'Netherlands' },
                  { value: 'New Zealand', label: 'New Zealand' },
                  { value: 'Nicaragua', label: 'Nicaragua' },
                  { value: 'Niger', label: 'Niger' },
                  { value: 'Nigeria', label: 'Nigeria' },
                  { value: 'North Korea', label: 'North Korea' },
                  { value: 'North Macedonia', label: 'North Macedonia' },
                  { value: 'Norway', label: 'Norway' },
                  { value: 'Oman', label: 'Oman' },
                  { value: 'Pakistan', label: 'Pakistan' },
                  { value: 'Palau', label: 'Palau' },
                  { value: 'Palestine', label: 'Palestine' },
                  { value: 'Panama', label: 'Panama' },
                  { value: 'Papua New Guinea', label: 'Papua New Guinea' },
                  { value: 'Paraguay', label: 'Paraguay' },
                  { value: 'Peru', label: 'Peru' },
                  { value: 'Philippines', label: 'Philippines' },
                  { value: 'Poland', label: 'Poland' },
                  { value: 'Portugal', label: 'Portugal' },
                  { value: 'Qatar', label: 'Qatar' },
                  { value: 'Romania', label: 'Romania' },
                  { value: 'Russia', label: 'Russia' },
                  { value: 'Rwanda', label: 'Rwanda' },
                  { value: 'Saint Kitts and Nevis', label: 'Saint Kitts and Nevis' },
                  { value: 'Saint Lucia', label: 'Saint Lucia' },
                  { value: 'Saint Vincent and the Grenadines', label: 'Saint Vincent and the Grenadines' },
                  { value: 'Samoa', label: 'Samoa' },
                  { value: 'San Marino', label: 'San Marino' },
                  { value: 'Sao Tome and Principe', label: 'Sao Tome and Principe' },
                  { value: 'Saudi Arabia', label: 'Saudi Arabia' },
                  { value: 'Senegal', label: 'Senegal' },
                  { value: 'Serbia', label: 'Serbia' },
                  { value: 'Seychelles', label: 'Seychelles' },
                  { value: 'Sierra Leone', label: 'Sierra Leone' },
                  { value: 'Singapore', label: 'Singapore' },
                  { value: 'Slovakia', label: 'Slovakia' },
                  { value: 'Slovenia', label: 'Slovenia' },
                  { value: 'Solomon Islands', label: 'Solomon Islands' },
                  { value: 'Somalia', label: 'Somalia' },
                  { value: 'South Africa', label: 'South Africa' },
                  { value: 'South Korea', label: 'South Korea' },
                  { value: 'South Sudan', label: 'South Sudan' },
                  { value: 'Spain', label: 'Spain' },
                  { value: 'Sri Lanka', label: 'Sri Lanka' },
                  { value: 'Sudan', label: 'Sudan' },
                  { value: 'Suriname', label: 'Suriname' },
                  { value: 'Sweden', label: 'Sweden' },
                  { value: 'Switzerland', label: 'Switzerland' },
                  { value: 'Syria', label: 'Syria' },
                  { value: 'Taiwan', label: 'Taiwan' },
                  { value: 'Tajikistan', label: 'Tajikistan' },
                  { value: 'Tanzania', label: 'Tanzania' },
                  { value: 'Thailand', label: 'Thailand' },
                  { value: 'Timor-Leste', label: 'Timor-Leste' },
                  { value: 'Togo', label: 'Togo' },
                  { value: 'Tonga', label: 'Tonga' },
                  { value: 'Trinidad and Tobago', label: 'Trinidad and Tobago' },
                  { value: 'Tunisia', label: 'Tunisia' },
                  { value: 'Turkey', label: 'Turkey' },
                  { value: 'Turkmenistan', label: 'Turkmenistan' },
                  { value: 'Tuvalu', label: 'Tuvalu' },
                  { value: 'Uganda', label: 'Uganda' },
                  { value: 'Ukraine', label: 'Ukraine' },
                  { value: 'United Arab Emirates', label: 'United Arab Emirates' },
                  { value: 'United Kingdom', label: 'United Kingdom' },
                  { value: 'United States', label: 'United States' },
                  { value: 'Uruguay', label: 'Uruguay' },
                  { value: 'Uzbekistan', label: 'Uzbekistan' },
                  { value: 'Vanuatu', label: 'Vanuatu' },
                  { value: 'Vatican City', label: 'Vatican City' },
                  { value: 'Venezuela', label: 'Venezuela' },
                  { value: 'Vietnam', label: 'Vietnam' },
                  { value: 'Yemen', label: 'Yemen' },
                  { value: 'Zambia', label: 'Zambia' },
                  { value: 'Zimbabwe', label: 'Zimbabwe' },
                ]}
              />
                <p className="text-xs text-gray-500 mt-1">Country of study cannot be changed after registration</p>
              </div>

              <Input
                label="City"
                {...register('location.city')}
                error={errors.location?.city?.message}
                placeholder="Enter your city"
              />

              <Input
                label="Timezone"
                {...register('location.timezone')}
                error={errors.location?.timezone?.message}
                placeholder="e.g., UTC+3, EST"
              />
            </div>
          </div>

          {/* Professional Information Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="col-span-full">
                <Input
                  label="University"
                  placeholder="University of..."
                  error={errors.studentProfile?.university?.message}
                  {...register('studentProfile.university')}
                />
              </div>

              <div className="col-span-full">
                <Input
                  label="University Website (Optional)"
                  type="url"
                  placeholder="https://university.edu"
                  error={errors.studentProfile?.universityLink?.message}
                  {...register('studentProfile.universityLink', {
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: 'Please enter a valid URL starting with http:// or https://',
                    },
                  })}
                />
              </div>

              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  {...register('studentProfile.bio')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Tell us about yourself, your expertise, and what you're passionate about..."
                />
                {errors.studentProfile?.bio && (
                  <p className="mt-1 text-sm text-red-600">{errors.studentProfile.bio.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Experience Level"
                  required
                  {...register('studentProfile.experienceLevel', {
                    required: 'Experience level is required',
                  })}
                  error={errors.studentProfile?.experienceLevel?.message}
                  options={[
                    { value: 'Beginner', label: 'Beginner' },
                    { value: 'Intermediate', label: 'Intermediate' },
                    { value: 'Advanced', label: 'Advanced' },
                    { value: 'Expert', label: 'Expert' },
                  ]}
                  placeholder="Select experience level..."
                />

                <Input
                  label="Years of Experience"
                  type="number"
                  {...register('studentProfile.yearsOfExperience', {
                    min: { value: 0, message: 'Cannot be negative' },
                    max: { value: 50, message: 'Invalid years' }
                  })}
                  error={errors.studentProfile?.yearsOfExperience?.message}
                  placeholder="0"
                />

                <Select
                  label="Availability"
                  {...register('studentProfile.availability')}
                  error={errors.studentProfile?.availability?.message}
                  options={[
                    { value: 'Available', label: 'Available' },
                    { value: 'Busy', label: 'Busy' },
                  ]}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency (Auto-set based on country)
                  </label>
                  <Input
                    {...register('studentProfile.hourlyRate.currency')}
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                    placeholder="Select country first"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Currency is automatically set based on your selected country
                  </p>
                </div>

                <Input
                  label="Hourly Rate (Min)"
                  type="number"
                  {...register('studentProfile.hourlyRate.min', {
                    min: { value: 0, message: 'Cannot be negative' }
                  })}
                  error={errors.studentProfile?.hourlyRate?.min?.message}
                  placeholder="Minimum rate"
                />

                <Input
                  label="Hourly Rate (Max)"
                  type="number"
                  {...register('studentProfile.hourlyRate.max', {
                    min: { value: 0, message: 'Cannot be negative' }
                  })}
                  error={errors.studentProfile?.hourlyRate?.max?.message}
                  placeholder="Maximum rate"
                />
              </div>
            </div>
          </div>

          {/* Social Links Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="GitHub"
                {...register('studentProfile.socialLinks.github')}
                error={errors.studentProfile?.socialLinks?.github?.message}
                placeholder="https://github.com/username"
              />

              <Input
                label="LinkedIn"
                {...register('studentProfile.socialLinks.linkedin')}
                error={errors.studentProfile?.socialLinks?.linkedin?.message}
                placeholder="https://linkedin.com/in/username"
              />

              <Input
                label="Personal Website"
                {...register('studentProfile.socialLinks.website')}
                error={errors.studentProfile?.socialLinks?.website?.message}
                placeholder="https://yourwebsite.com"
              />

              <Input
                label="Behance"
                {...register('studentProfile.socialLinks.behance')}
                error={errors.studentProfile?.socialLinks?.behance?.message}
                placeholder="https://behance.net/username"
              />

              <Input
                label="Telegram (Optional)"
                {...register('studentProfile.socialLinks.telegram')}
                error={errors.studentProfile?.socialLinks?.telegram?.message}
                placeholder="https://t.me/username"
              />

              <Input
                label="WhatsApp (Optional)"
                {...register('studentProfile.socialLinks.whatsapp')}
                error={errors.studentProfile?.socialLinks?.whatsapp?.message}
                placeholder="https://wa.me/1234567890"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEditModal(false)}
              disabled={updateProfileMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={updateProfileMutation.isLoading}
              disabled={updateProfileMutation.isLoading}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Profile;
