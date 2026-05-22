import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { educationBadgeService } from '../../services/educationBadgeService';
import { API_BASE_URL } from '../../config/env';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { ArrowLeft, Eye, Trash2, Award } from 'lucide-react';

const EducationBadgeAwards = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [hasProofFilter, setHasProofFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['educationBadgeAwards', search, hasProofFilter],
    queryFn: () =>
      educationBadgeService.getAdminAwards({
        search: search.trim() || undefined,
        hasProof: hasProofFilter || undefined,
        limit: 150,
      }),
  });

  const awards = data?.data?.awards || [];

  const deleteProofMutation = useMutation({
    mutationFn: (id) => educationBadgeService.deleteAdminAwardProof(id),
    onSuccess: () => queryClient.invalidateQueries(['educationBadgeAwards']),
  });

  const revokeMutation = useMutation({
    mutationFn: (id) => educationBadgeService.revokeAward(id),
    onSuccess: () => queryClient.invalidateQueries(['educationBadgeAwards']),
  });

  const proofBadge = (hasProof) => (
    <Badge variant={hasProof ? 'success' : 'warning'}>{hasProof ? 'Uploaded' : 'Missing'}</Badge>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/education-partners">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Partners
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-7 h-7 text-primary-600" />
            Student awards
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            View certificate proof uploads and revoke badges.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        <Input
          label="Search student"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name or email"
        />
        <Select
          label="Proof filter"
          value={hasProofFilter}
          onChange={(e) => setHasProofFilter(e.target.value)}
          options={[
            { value: '', label: 'All' },
            { value: 'true', label: 'With proof' },
            { value: 'false', label: 'Without proof' },
          ]}
        />
      </div>

      <Card title={`Awards (${awards.length})`}>
        {isLoading ? (
          <Loading text="Loading awards..." />
        ) : awards.length === 0 ? (
          <p className="text-sm text-gray-500">No awards found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="py-2 pr-4">Student</th>
                  <th className="py-2 pr-4">Partner / Certificate</th>
                  <th className="py-2 pr-4">Awarded</th>
                  <th className="py-2 pr-4">Proof</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {awards.map((row) => {
                  const proofUrl = row.proofDocument?.url
                    ? `${API_BASE_URL}${row.proofDocument.url}`
                    : null;
                  return (
                    <tr key={row._id} className="border-b border-gray-100 align-top">
                      <td className="py-3 pr-4">
                        <div className="font-medium">{row.student?.name}</div>
                        <div className="text-xs text-gray-500">{row.student?.email}</div>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="font-medium">{row.entity?.name}</div>
                        <div className="text-gray-600">
                          {row.certificate?.title}
                          {row.certificate?.track ? ` — ${row.certificate.track}` : ''}
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-gray-600 whitespace-nowrap">
                        {row.awardedAt
                          ? new Date(row.awardedAt).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="py-3 pr-4">{proofBadge(row.hasProof)}</td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-2">
                          {proofUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(proofUrl, '_blank')}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Preview
                            </Button>
                          )}
                          {row.hasProof && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (window.confirm('Delete proof document for this student?')) {
                                  deleteProofMutation.mutate(row._id);
                                }
                              }}
                              loading={deleteProofMutation.isPending}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete proof
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => {
                              if (
                                window.confirm(
                                  'Revoke this badge? The student will lose this certificate on their profile.'
                                )
                              ) {
                                revokeMutation.mutate(row._id);
                              }
                            }}
                            loading={revokeMutation.isPending}
                          >
                            Revoke badge
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default EducationBadgeAwards;
