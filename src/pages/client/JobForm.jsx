import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { jobService } from '../../services/jobService';
import startupService from '../../services/startupService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { ArrowLeft, Plus, X } from 'lucide-react';

const JobForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    defaultValues: {
      skillsRequired: [],
      budgetCurrency: 'USD',
    },
  });

  const [skills, setSkills] = React.useState([]);
  const [newSkill, setNewSkill] = React.useState('');
  const [isForStartup, setIsForStartup] = React.useState(false);
  const [selectedStartup, setSelectedStartup] = React.useState('');

  // Fetch job if editing
  const { data: jobData, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobService.getJob(id),
    enabled: isEditing,
  });

  // Fetch client's startups
  const { data: startupsData } = useQuery({
    queryKey: ['myStartups'],
    queryFn: () => startupService.getMyStartups(),
  });

  const startups = startupsData?.data?.startups || [];
  const hasStartups = startups.length > 0;

  // Populate form when job data is loaded
  React.useEffect(() => {
    if (jobData?.data?.jobPost && isEditing) {
      const job = jobData.data.jobPost;
      
      // Set skills
      setSkills(job.skillsRequired || []);
      
      // Set startup fields
      if (job.startup) {
        setIsForStartup(true);
        setSelectedStartup(job.startup._id || job.startup);
      }
      
      // Prepare form data
      const formData = {
        title: job.title || '',
        description: job.description || '',
        category: job.category || '',
        budgetMin: job.budget?.min || '',
        budgetMax: job.budget?.max || '',
        budgetCurrency: job.budget?.currency || 'USD',
        projectDuration: job.projectDuration || '',
        experienceLevel: job.experienceLevel || '',
      };

      // Convert deadline to YYYY-MM-DD format for date input
      if (job.deadline) {
        const date = new Date(job.deadline);
        const formattedDate = date.toISOString().split('T')[0];
        formData.deadline = formattedDate;
      }

      // Reset form with all job data
      reset(formData);
    }
  }, [jobData, isEditing, reset]);

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: (jobData) =>
      isEditing ? jobService.updateJob(id, jobData) : jobService.createJob(jobData),
    onSuccess: () => {
      queryClient.invalidateQueries(['jobs']);
      queryClient.invalidateQueries(['myJobs']);
      alert(isEditing ? 'Job updated successfully!' : 'Job posted successfully!');
      navigate('/client/jobs');
    },
    onError: (error) => {
      // Make error messages user-friendly
      let errorMessage = `We couldn't ${isEditing ? 'update' : 'create'} your job post. Please check your information and try again.`;
      
      if (error.response?.data?.message) {
        const backendMessage = error.response.data.message;
        
        // Convert technical messages to user-friendly ones
        if (backendMessage.includes('title')) {
          errorMessage = 'Please enter a valid job title (5-100 characters)';
        } else if (backendMessage.includes('description')) {
          errorMessage = 'Please provide a detailed job description (at least 20 characters)';
        } else if (backendMessage.includes('budget')) {
          errorMessage = 'Please check your budget amounts. Maximum must be greater than or equal to minimum.';
        } else if (backendMessage.includes('deadline')) {
          errorMessage = 'If you set a deadline, it must be a future date.';
        } else if (backendMessage.includes('skills')) {
          errorMessage = 'Please add at least one required skill for this job.';
        } else if (backendMessage.includes('category')) {
          errorMessage = 'Please select a valid job category.';
        } else if (backendMessage.includes('experience')) {
          errorMessage = 'Please select a valid experience level.';
        } else {
          errorMessage = backendMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    },
  });

  const onSubmit = (data) => {
    console.log('Form Data:', data);
    // Validate skills
    if (skills.length === 0) {
      alert('Please add at least one required skill for this job');
      return;
    }

    if (skills.length > 10) {
      alert('You can add up to 10 skills maximum. Please remove some skills to continue.');
      return;
    }

    const jobData = {
      title: data.title,
      description: data.description,
      category: data.category,
      skillsRequired: skills,
      budget: {
        min: parseFloat(data.budgetMin),
        max: parseFloat(data.budgetMax),
        currency: data.budgetCurrency || 'USD',
      },
      projectDuration: data.projectDuration,
      experienceLevel: data.experienceLevel,
    };

    // Only include deadline if provided (not empty string)
    if (data.deadline && data.deadline.trim() !== '') {
      jobData.deadline = data.deadline;
    }

    // Include startup if selected
    if (isForStartup && selectedStartup) {
      jobData.startup = selectedStartup;
    }

    saveMutation.mutate(jobData);
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  if (isLoading) {
    return <Loading text="Loading job..." />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/client/jobs')}
        className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to My Jobs
      </button>

      <Card title={isEditing ? 'Edit Job Post' : 'Create New Job Post'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Alert
            type="info"
            message="Fill in all required fields to post your job. Students will be able to browse and apply."
          />

          <Input
            label="Job Title"
            placeholder="e.g., Full-Stack Web Developer"
            error={errors.title?.message}
            {...register('title', { required: 'Please enter a job title' })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows="10"
              placeholder="Describe the project, requirements, deliverables..."
              className="input"
              {...register('description', { required: 'Please describe the job and what you need' })}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <Select
            label="Category"
            options={[
              { value: 'Web Development', label: 'Web Development' },
              { value: 'Mobile Development', label: 'Mobile Development' },
              { value: 'Graphic Design', label: 'Graphic Design' },
              { value: 'Writing', label: 'Writing' },
              { value: 'Data Entry', label: 'Data Entry' },
              { value: 'Undergraduate Tasks', label: 'Undergraduate Tasks' },
              { value: 'Other', label: 'Other' },
            ]}
            error={errors.category?.message}
            {...register('category', { required: 'Please select a job category' })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills Required
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Add a skill (e.g., React, Node.js)"
                className="input flex-1"
              />
              <Button type="button" variant="primary" onClick={addSkill}>
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm flex items-center gap-2"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Minimum Budget"
              type="number"
              min="0"
              step="0.01"
              error={errors.budgetMin?.message}
              {...register('budgetMin', {
                required: 'Please enter a minimum budget',
                min: { value: 1, message: 'Minimum budget must be at least 1' },
              })}
            />

            <Input
              label="Maximum Budget"
              type="number"
              min="0"
              step="0.01"
              error={errors.budgetMax?.message}
              {...register('budgetMax', {
                required: 'Please enter a maximum budget',
                validate: (value) =>
                  parseFloat(value) >= parseFloat(watch('budgetMin')) ||
                  'Maximum budget must be greater than or equal to minimum budget',
              })}
            />

            <Select
              label="Currency"
              options={[
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
              error={errors.budgetCurrency?.message}
              {...register('budgetCurrency', { required: 'Please select a currency' })}
            />
          </div>

          <Select
            label="Project Duration"
            options={[
              { value: '', label: 'Select duration' },
              { value: 'Less than 1 week', label: 'Less than 1 week' },
              { value: '1-2 weeks', label: '1-2 weeks' },
              { value: '2-4 weeks', label: '2-4 weeks' },
              { value: '1-3 months', label: '1-3 months' },
              { value: 'More than 3 months', label: 'More than 3 months' },
            ]}
            error={errors.projectDuration?.message}
            {...register('projectDuration', { required: 'Please select the expected project duration' })}
          />

          <Input
            label="Deadline (Optional)"
            type="date"
            error={errors.deadline?.message}
            {...register('deadline', {
              validate: (value) => {
                // Only validate if a deadline is provided
                if (!value) return true;
                const selectedDate = new Date(value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return selectedDate > today || 'If you set a deadline, it must be in the future';
              },
            })}
          />

          <Select
            label="Experience Level"
            options={[
              { value: 'Beginner', label: 'Beginner' },
              { value: 'Intermediate', label: 'Intermediate' },
              { value: 'Advanced', label: 'Advanced' },
              { value: 'Expert', label: 'Expert' },
            ]}
            error={errors.experienceLevel?.message}
            {...register('experienceLevel', { required: 'Please select the required experience level' })}
          />

          {/* Startup Selection */}
          {hasStartups && (
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isForStartup"
                  checked={isForStartup}
                  onChange={(e) => {
                    setIsForStartup(e.target.checked);
                    if (!e.target.checked) {
                      setSelectedStartup('');
                    }
                  }}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="isForStartup" className="text-sm font-medium text-gray-700">
                  This job is for one of my startups
                </label>
              </div>

              {isForStartup && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Startup <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {startups.map((startup) => (
                      <div key={startup._id} className="flex items-center gap-2">
                        <input
                          type="radio"
                          id={`startup-${startup._id}`}
                          name="startup"
                          value={startup._id}
                          checked={selectedStartup === startup._id}
                          onChange={(e) => setSelectedStartup(e.target.value)}
                          className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                        />
                        <label
                          htmlFor={`startup-${startup._id}`}
                          className="text-sm text-gray-700 cursor-pointer"
                        >
                          {startup.startupName}
                        </label>
                      </div>
                    ))}
                  </div>
                  {isForStartup && !selectedStartup && (
                    <p className="mt-1 text-sm text-red-600">Please select a startup</p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/client/jobs')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={saveMutation.isPending}
              disabled={saveMutation.isPending}
              className="flex-1"
            >
              {isEditing ? 'Update Job' : 'Post Job'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default JobForm;
