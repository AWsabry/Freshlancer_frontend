import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { profileService } from '../../services/profileService';
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
  Eye,
  Briefcase,
  Calendar,
} from 'lucide-react';

const UnlockedStudents = () => {
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['unlockedStudents'],
    queryFn: () => profileService.getUnlockedStudents(),
  });

  if (isLoading) {
    return <Loading text="Loading unlocked students..." />;
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <Alert
          type="error"
          title="Error"
          message={error.response?.data?.message || 'Failed to load unlocked students'}
        />
      </div>
    );
  }

  const students = data?.data?.students || [];
  console.log('Unlocked Students:', data);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Unlocked Students</h1>
          <p className="text-gray-600 mt-2">
            All students whose profiles you have unlocked
          </p>
        </div>
        <Badge variant="primary" className="text-lg px-4 py-2">
          {students.length} {students.length === 1 ? 'Student' : 'Students'}
        </Badge>
      </div>

      {/* Students List */}
      {students.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Unlocked Students Yet
            </h3>
            <p className="text-gray-600 mb-6">
              You haven't unlocked any student profiles yet. Browse job applications to unlock
              student profiles.
            </p>
            <Button variant="primary" onClick={() => navigate('/client/applications')}>
              View Applications
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {students.map((student) => (
            <Card key={student._id} className="hover:shadow-lg transition">
              <div className="flex items-start gap-6">
                {/* Profile Photo */}
                <div className="flex-shrink-0">
                  {student.photo ? (
                    <img
                      src={student.photo}
                      alt={student.name}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="w-12 h-12 text-primary-600" />
                    </div>
                  )}
                </div>

                {/* Student Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        {student.name}
                      </h2>
                      {student.studentProfile?.bio && (
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {student.studentProfile.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail className="w-4 h-4 text-primary-600" />
                      <span className="text-sm">{student.email}</span>
                    </div>
                    {student.phone && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-4 h-4 text-primary-600" />
                        <span className="text-sm">{student.phone}</span>
                      </div>
                    )}
                    {student.location?.city && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="w-4 h-4 text-primary-600" />
                        <span className="text-sm">
                          {student.location.city}
                          {student.location.country && `, ${student.location.country}`}
                        </span>
                      </div>
                    )}
                    {student.createdAt && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4 text-primary-600" />
                        <span className="text-sm">
                          Joined{' '}
                          {new Date(student.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  {student.studentProfile?.skills &&
                    student.studentProfile.skills.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {student.studentProfile.skills.slice(0, 6).map((skill, index) => (
                            <Badge key={index} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                          {student.studentProfile.skills.length > 6 && (
                            <Badge variant="secondary">
                              +{student.studentProfile.skills.length - 6} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                  {/* Experience & Availability */}
                  <div className="flex flex-wrap gap-4 mb-4">
                    {student.studentProfile?.experienceLevel && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 capitalize">
                          {student.studentProfile.experienceLevel}
                        </span>
                      </div>
                    )}
                    {student.studentProfile?.availability && (
                      <Badge
                        variant={
                          student.studentProfile.availability === 'available'
                            ? 'success'
                            : student.studentProfile.availability === 'busy'
                            ? 'warning'
                            : 'error'
                        }
                      >
                        {student.studentProfile.availability}
                      </Badge>
                    )}
                  </div>

                  {/* Action Button */}
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/client/students/${student._id}`)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Full Profile
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UnlockedStudents;
