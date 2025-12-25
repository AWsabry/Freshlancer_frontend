import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { verificationService } from '../../services/verificationService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { Upload, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';

const translations = {
  en: {
    loading: 'Loading verification status...',
    verificationComplete: 'Verification Complete',
    verificationCompleteMessage: 'Your student status has been verified. You can now apply for jobs!',
    verificationPending: 'Verification Pending',
    verificationPendingMessage: 'Your verification is being reviewed by our admin team. This usually takes 24-48 hours.',
    verificationRequired: 'Verification Required',
    verificationRequiredMessage: 'Please submit your student verification documents to start applying for jobs.',
    submitVerificationDocument: 'Submit Verification Document',
    documentType: 'Document Type',
    documentTypeRequired: 'Document type is required',
    studentIdCard: 'Student ID Card',
    enrollmentCertificate: 'Enrollment Certificate',
    officialTranscript: 'Official Transcript',
    other: 'Other',
    institutionName: 'Institution Name',
    institutionNamePlaceholder: 'University of...',
    institutionNameRequired: 'Institution name is required',
    studentIdNumber: 'Student ID Number',
    studentIdNumberPlaceholder: '123456789',
    studentIdRequired: 'Student ID is required',
    enrollmentYear: 'Enrollment Year',
    enrollmentYearPlaceholder: '2020',
    enrollmentYearRequired: 'Enrollment year is required',
    enrollmentYearInvalid: 'Please enter a valid year',
    expectedGraduationYear: 'Expected Graduation Year',
    expectedGraduationYearPlaceholder: '2025',
    graduationYearRequired: 'Graduation year is required',
    graduationYearInvalid: 'Please enter a valid future year',
    uploadDocument: 'Upload Document',
    uploadFile: 'Upload a file',
    orDragAndDrop: 'or drag and drop',
    fileTypes: 'PDF, JPG, PNG up to 10MB',
    selected: 'Selected:',
    submitForVerification: 'Submit for Verification',
    verificationHistory: 'Verification History',
    submitted: 'Submitted:',
    approved: 'Approved',
    rejected: 'Rejected',
    pendingReview: 'Pending Review',
    reason: 'Reason:',
    approvedDate: 'Approved:',
    documentUploadedSuccess: 'Document uploaded successfully!',
    documentUploadFailed: 'Failed to upload document',
    pleaseSelectFile: 'Please select a file to upload',
  },
  it: {
    loading: 'Caricamento stato verifica...',
    verificationComplete: 'Verifica Completata',
    verificationCompleteMessage: 'Il tuo status di studente è stato verificato. Ora puoi candidarti per i lavori!',
    verificationPending: 'Verifica in Sospeso',
    verificationPendingMessage: 'La tua verifica è in fase di revisione dal nostro team amministrativo. Di solito richiede 24-48 ore.',
    verificationRequired: 'Verifica Richiesta',
    verificationRequiredMessage: 'Invia i tuoi documenti di verifica studente per iniziare a candidarti per i lavori.',
    submitVerificationDocument: 'Invia Documento di Verifica',
    documentType: 'Tipo di Documento',
    documentTypeRequired: 'Il tipo di documento è obbligatorio',
    studentIdCard: 'Carta d\'Identità Studente',
    enrollmentCertificate: 'Certificato di Iscrizione',
    officialTranscript: 'Trascrizione Ufficiale',
    other: 'Altro',
    institutionName: 'Nome Istituzione',
    institutionNamePlaceholder: 'Università di...',
    institutionNameRequired: 'Il nome dell\'istituzione è obbligatorio',
    studentIdNumber: 'Numero ID Studente',
    studentIdNumberPlaceholder: '123456789',
    studentIdRequired: 'L\'ID studente è obbligatorio',
    enrollmentYear: 'Anno di Iscrizione',
    enrollmentYearPlaceholder: '2020',
    enrollmentYearRequired: 'L\'anno di iscrizione è obbligatorio',
    enrollmentYearInvalid: 'Inserisci un anno valido',
    expectedGraduationYear: 'Anno di Laurea Previsto',
    expectedGraduationYearPlaceholder: '2025',
    graduationYearRequired: 'L\'anno di laurea è obbligatorio',
    graduationYearInvalid: 'Inserisci un anno futuro valido',
    uploadDocument: 'Carica Documento',
    uploadFile: 'Carica un file',
    orDragAndDrop: 'o trascina e rilascia',
    fileTypes: 'PDF, JPG, PNG fino a 10MB',
    selected: 'Selezionato:',
    submitForVerification: 'Invia per Verifica',
    verificationHistory: 'Cronologia Verifiche',
    submitted: 'Inviato:',
    approved: 'Approvato',
    rejected: 'Rifiutato',
    pendingReview: 'In Attesa di Revisione',
    reason: 'Motivo:',
    approvedDate: 'Approvato:',
    documentUploadedSuccess: 'Documento caricato con successo!',
    documentUploadFailed: 'Impossibile caricare il documento',
    pleaseSelectFile: 'Seleziona un file da caricare',
  },
};

const Verification = () => {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState(null);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('dashboardLanguage') || 'en';
  });
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

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

  // Fetch verification status and history
  const { data, isLoading } = useQuery({
    queryKey: ['verifications'],
    queryFn: () => verificationService.getMyVerifications(),
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: (formData) => verificationService.uploadDocument(formData),
    onSuccess: () => {
      queryClient.invalidateQueries(['verifications']);
      queryClient.invalidateQueries(['verificationStatus']);
      reset();
      setSelectedFile(null);
      alert(t.documentUploadedSuccess);
    },
    onError: (error) => {
      alert(error.message || t.documentUploadFailed);
    },
  });

  const onSubmit = (data) => {
    if (!selectedFile) {
      alert(t.pleaseSelectFile);
      return;
    }

    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('documentType', data.documentType);
    formData.append('institutionName', data.institutionName);
    formData.append('studentIdNumber', data.studentIdNumber);
    formData.append('enrollmentYear', data.enrollmentYear);
    formData.append('expectedGraduationYear', data.expectedGraduationYear);

    uploadMutation.mutate(formData);
  };

  if (isLoading) {
    return <Loading text={t.loading} />;
  }

  const verifications = data?.data?.verifications || [];
  const hasApprovedVerification = verifications.some(v => v.status === 'approved');
  const hasPendingVerification = verifications.some(v => v.status === 'pending');

  const documentTypeOptions = [
    { value: 'student_id', label: t.studentIdCard },
    { value: 'enrollment_certificate', label: t.enrollmentCertificate },
    { value: 'transcript', label: t.officialTranscript },
    { value: 'other', label: t.other },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">{t.approved}</Badge>;
      case 'rejected':
        return <Badge variant="error">{t.rejected}</Badge>;
      case 'pending':
        return <Badge variant="warning">{t.pendingReview}</Badge>;
      default:
        return <Badge variant="info">{status}</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />;
      default:
        return <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 px-3 sm:px-4 md:px-6">
      {/* Status Alert */}
      {hasApprovedVerification && (
        <Alert
          type="success"
          title={t.verificationComplete}
          message={t.verificationCompleteMessage}
        />
      )}

      {hasPendingVerification && !hasApprovedVerification && (
        <Alert
          type="info"
          title={t.verificationPending}
          message={t.verificationPendingMessage}
        />
      )}

      {!hasApprovedVerification && !hasPendingVerification && (
        <Alert
          type="warning"
          title={t.verificationRequired}
          message={t.verificationRequiredMessage}
        />
      )}

      {/* Upload Form */}
      {!hasApprovedVerification && (
        <Card title={t.submitVerificationDocument}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
            <Select
              label={t.documentType}
              options={documentTypeOptions}
              error={errors.documentType?.message}
              {...register('documentType', { required: t.documentTypeRequired })}
            />

            <Input
              label={t.institutionName}
              placeholder={t.institutionNamePlaceholder}
              error={errors.institutionName?.message}
              {...register('institutionName', { required: t.institutionNameRequired })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Input
                label={t.studentIdNumber}
                placeholder={t.studentIdNumberPlaceholder}
                error={errors.studentIdNumber?.message}
                {...register('studentIdNumber', { required: t.studentIdRequired })}
              />

              <Input
                label={t.enrollmentYear}
                type="number"
                placeholder={t.enrollmentYearPlaceholder}
                error={errors.enrollmentYear?.message}
                {...register('enrollmentYear', {
                  required: t.enrollmentYearRequired,
                  min: { value: 2000, message: t.enrollmentYearInvalid },
                })}
              />
            </div>

            <Input
              label={t.expectedGraduationYear}
              type="number"
              placeholder={t.expectedGraduationYearPlaceholder}
              error={errors.expectedGraduationYear?.message}
              {...register('expectedGraduationYear', {
                required: t.graduationYearRequired,
                min: { value: new Date().getFullYear(), message: t.graduationYearInvalid },
              })}
            />

            {/* File Upload */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                {t.uploadDocument} <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex justify-center px-4 sm:px-6 pt-4 sm:pt-5 pb-4 sm:pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-400 transition-colors">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                  <div className="flex flex-col sm:flex-row items-center justify-center text-xs sm:text-sm text-gray-600 gap-1">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
                      <span>{t.uploadFile}</span>
                      <input
                        type="file"
                        className="sr-only"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                      />
                    </label>
                    <p className="sm:pl-1">{t.orDragAndDrop}</p>
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-500">
                    {t.fileTypes}
                  </p>
                  {selectedFile && (
                    <p className="text-xs sm:text-sm text-primary-600 font-medium truncate max-w-full px-2">
                      {t.selected} {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5"
              loading={uploadMutation.isPending}
              disabled={uploadMutation.isPending}
            >
              {t.submitForVerification}
            </Button>
          </form>
        </Card>
      )}

      {/* Verification History */}
      {verifications.length > 0 && (
        <Card title={t.verificationHistory}>
          <div className="space-y-3 sm:space-y-4">
            {verifications.map((verification) => (
              <div
                key={verification._id}
                className="flex items-start justify-between p-3 sm:p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {getStatusIcon(verification.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 mb-1">
                      <h4 className="text-sm sm:text-base font-semibold text-gray-900 capitalize">
                        {verification.documentType?.replace('_', ' ')}
                      </h4>
                      {getStatusBadge(verification.status)}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {verification.institutionName}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                      {t.submitted} {new Date(verification.createdAt).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US')}
                    </p>
                    {verification.status === 'rejected' && verification.rejectionReason && (
                      <Alert
                        type="error"
                        message={`${t.reason} ${verification.rejectionReason}`}
                        className="mt-2"
                      />
                    )}
                    {verification.status === 'approved' && verification.approvedAt && (
                      <p className="text-[10px] sm:text-xs text-green-600 mt-1">
                        {t.approvedDate} {new Date(verification.approvedAt).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Verification;
