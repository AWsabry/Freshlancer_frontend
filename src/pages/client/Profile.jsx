import React, { useState } from 'react';
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

const Profile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
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
      alert('Profile updated successfully!');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to update profile');
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
    // Format data for API - include clientProfile with socialLinks
    const updateData = {
      name: formData.name,
      phone: formData.phone,
      clientProfile: {
        companyName: formData.companyName,
        industry: formData.industry,
        socialLinks: formData.clientProfile?.socialLinks || {},
      },
    };
    updateMutation.mutate(updateData);
  };

  if (loadingUser) {
    return <Loading text="Loading profile..." />;
  }

  // Check if user data is available
  if (!userData) {
    return (
      <Alert
        type="error"
        message="Failed to load profile data. Please refresh the page."
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
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        {!isEditing && (
          <Button variant="primary" onClick={() => setIsEditing(true)}>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Profile Information */}
      <Card title="Personal Information">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
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
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
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
                  Company Name
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
                  Industry
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Links (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn
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
                    Website
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
                    Telegram
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
                    WhatsApp
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
                Save Changes
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
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-primary-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-semibold text-gray-900">{user?.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold text-gray-900">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="font-semibold text-gray-900">{user?.phone || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-primary-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Company Name</p>
                  <p className="font-semibold text-gray-900">
                    {user?.clientProfile?.companyName || 'Not provided'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Industry</p>
                  <p className="font-semibold text-gray-900">
                    {user?.clientProfile?.industry || 'Not provided'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-semibold text-gray-900">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Not available'}
                  </p>
                </div>
              </div>
            </div>

            {/* Social Links Display */}
            {user?.clientProfile?.socialLinks && Object.values(user.clientProfile.socialLinks).some(link => link) && (
              <div className="pt-6 border-t mt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Social Links</h3>
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
      <Card title="Points Balance">
        {loadingPoints ? (
          <div className="flex items-center justify-center py-12">
            <Loading text="Loading points balance..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200">
              <div className="flex items-center gap-3 mb-2">
                <Coins className="w-6 h-6 text-primary-600" />
                <p className="text-sm font-medium text-primary-900">Available Points</p>
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
                Buy More Points
              </Button>
            </div>

            <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <Eye className="w-6 h-6 text-gray-600" />
                <p className="text-sm font-medium text-gray-700">Points Used</p>
              </div>
              <p className="text-4xl font-bold text-gray-900">{points?.pointsUsed || 0}</p>
              <p className="text-sm text-gray-500 mt-2">
                Used to unlock {points?.unlockedStudentsCount || 0} profiles
              </p>
            </div>

            <div
              className="p-6 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 hover:border-primary-300 transition"
              onClick={() => navigate('/client/unlocked-students')}
            >
              <div className="flex items-center gap-3 mb-2">
                <User className="w-6 h-6 text-gray-600" />
                <p className="text-sm font-medium text-gray-700">Unlocked Profiles</p>
              </div>
              <p className="text-4xl font-bold text-gray-900">
                {points?.unlockedStudentsCount || 0}
              </p>
              <p className="text-sm text-gray-500 mt-2">10 points per profile</p>
            </div>
          </div>
        )}
      </Card>

      {/* Recent Packages */}
      <Card
        title="Recent Package Purchases"
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/client/transactions')}>
            <Receipt className="w-4 h-4 mr-2" />
            View All
          </Button>
        }
      >
        {loadingHistory ? (
          <div className="flex items-center justify-center py-12">
            <Loading text="Loading package history..." />
          </div>
        ) : packages.length === 0 ? (
          <Alert
            type="info"
            message="You haven't purchased any points packages yet. Purchase a package to start unlocking student profiles."
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
