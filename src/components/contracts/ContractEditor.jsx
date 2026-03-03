import React, { useEffect, useMemo, useState } from 'react';
import Button from '../common/Button';

const round2 = (n) => {
  const num = typeof n === 'string' ? Number(n) : n;
  if (!Number.isFinite(num)) return null;
  return Math.round(num * 100) / 100;
};

const normalizeText = (s) => (typeof s === 'string' ? s.trim() : '');

function normalizeMilestonesForForm(contract) {
  const ms = contract?.milestones || [];
  if (!Array.isArray(ms) || ms.length === 0) {
    return [{ title: 'Final delivery', description: '', percent: 100, expectedDuration: contract?.expectedDuration || '1-2 weeks' }];
  }
  return ms.map((m) => ({
    title: m?.plan?.title ?? m?.title ?? '',
    description: m?.plan?.description ?? m?.description ?? '',
    percent: m?.plan?.percent ?? m?.percent ?? 0,
    expectedDuration: m?.plan?.expectedDuration ?? m?.expectedDuration ?? contract?.expectedDuration ?? '1-2 weeks',
    _id: m?._id,
  }));
}

export default function ContractEditor({ contract, canEdit, onSave, saving, highlightFields = [] }) {
  const [projectDescription, setProjectDescription] = useState('');
  const [expectedDuration, setExpectedDuration] = useState('1-2 weeks');
  const [totalAmount, setTotalAmount] = useState('');
  const [currency, setCurrency] = useState('EGP');
  const [milestones, setMilestones] = useState([]);

  const initialSnapshot = useMemo(() => {
    if (!contract) return null;
    const ms = normalizeMilestonesForForm(contract);
    return {
      projectDescription: normalizeText(contract.projectDescription),
      expectedDuration: contract.expectedDuration || '1-2 weeks',
      totalAmount: round2(contract.totalAmount),
      currency: contract.currency || 'EGP',
      milestones: ms.map((m) => ({
        title: normalizeText(m.title),
        description: normalizeText(m.description),
        percent: round2(m.percent),
        expectedDuration: m.expectedDuration || contract.expectedDuration || '1-2 weeks',
      })),
    };
  }, [contract?._id]);

  useEffect(() => {
    if (!contract) return;
    setProjectDescription(contract.projectDescription || '');
    setExpectedDuration(contract.expectedDuration || '1-2 weeks');
    setTotalAmount(contract.totalAmount ?? '');
    setCurrency(contract.currency || 'EGP');
    setMilestones(normalizeMilestonesForForm(contract));
  }, [contract?._id]);

  const percentTotal = useMemo(() => {
    return milestones.reduce((sum, m) => sum + (Number(m.percent) || 0), 0);
  }, [milestones]);

  const canSave = canEdit && projectDescription.trim() && Number(totalAmount) > 0 && Math.round(percentTotal * 100) / 100 === 100;

  const isDirty = useMemo(() => {
    if (!canEdit || !initialSnapshot) return false;
    const currentSnapshot = {
      projectDescription: normalizeText(projectDescription),
      expectedDuration: expectedDuration || '1-2 weeks',
      totalAmount: round2(totalAmount),
      currency: currency || 'EGP',
      milestones: (Array.isArray(milestones) ? milestones : []).map((m) => ({
        title: normalizeText(m.title),
        description: normalizeText(m.description),
        percent: round2(m.percent),
        expectedDuration: m.expectedDuration || expectedDuration || '1-2 weeks',
      })),
    };
    return JSON.stringify(currentSnapshot) !== JSON.stringify(initialSnapshot);
  }, [canEdit, initialSnapshot, projectDescription, expectedDuration, totalAmount, currency, milestones]);

  const highlight = (field) => Array.isArray(highlightFields) && highlightFields.includes(field);

  return (
    <div className="space-y-4">
      <div className={highlight('projectDescription') ? 'border border-yellow-300 bg-yellow-50 rounded-lg p-3' : ''}>
        <label className="block text-sm font-medium text-gray-700 mb-1">Project description</label>
        <textarea
          value={projectDescription}
          onChange={(e) => setProjectDescription(e.target.value)}
          className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          disabled={!canEdit}
        />
      </div>

      <div
        className={`grid grid-cols-1 sm:grid-cols-4 gap-3 ${
          highlight('pricing') || highlight('expectedDuration')
            ? 'border border-yellow-300 bg-yellow-50 rounded-lg p-3'
            : ''
        }`}
      >
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Total amount</label>
          <input
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            type="number"
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            disabled={!canEdit}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            disabled={!canEdit}
          >
            <option value="EGP">EGP</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contract duration</label>
          <select
            value={expectedDuration}
            onChange={(e) => setExpectedDuration(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            disabled={!canEdit}
          >
            <option value="Less than 1 week">Less than 1 week</option>
            <option value="1-2 weeks">1-2 weeks</option>
            <option value="2-4 weeks">2-4 weeks</option>
            <option value="1-3 months">1-3 months</option>
            <option value="More than 3 months">More than 3 months</option>
          </select>
        </div>
      </div>

      <div
        className={`border rounded-lg p-4 space-y-3 ${
          highlight('milestones') ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-white'
        }`}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Installments / milestones</h3>
          {canEdit ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMilestones((prev) => [...prev, { title: '', description: '', percent: 0 }])}
            >
              Add milestone
            </Button>
          ) : null}
        </div>

        <p className={`text-xs ${Math.round(percentTotal * 100) / 100 === 100 ? 'text-green-600' : 'text-red-600'}`}>
          Percent total: {Math.round(percentTotal * 100) / 100}% (must be 100%)
        </p>

        <div className="space-y-3">
          {milestones.map((m, idx) => (
            <div key={m._id || idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 border rounded-lg p-3">
              <div className="sm:col-span-4">
                <label className="block text-xs text-gray-600 mb-1">Title</label>
                <input
                  value={m.title}
                  onChange={(e) => {
                    const v = e.target.value;
                    setMilestones((prev) => prev.map((x, i) => (i === idx ? { ...x, title: v } : x)));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  disabled={!canEdit}
                />
              </div>
              <div className="sm:col-span-4">
                <label className="block text-xs text-gray-600 mb-1">Description</label>
                <input
                  value={m.description}
                  onChange={(e) => {
                    const v = e.target.value;
                    setMilestones((prev) => prev.map((x, i) => (i === idx ? { ...x, description: v } : x)));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  disabled={!canEdit}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Percent</label>
                <input
                  value={m.percent}
                  onChange={(e) => {
                    const v = e.target.value;
                    setMilestones((prev) => prev.map((x, i) => (i === idx ? { ...x, percent: v } : x)));
                  }}
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  disabled={!canEdit}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Expected duration</label>
                <select
                  value={m.expectedDuration}
                  onChange={(e) => {
                    const v = e.target.value;
                    setMilestones((prev) => prev.map((x, i) => (i === idx ? { ...x, expectedDuration: v } : x)));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  disabled={!canEdit}
                >
                  <option value="Less than 1 week">Less than 1 week</option>
                  <option value="1-2 weeks">1-2 weeks</option>
                  <option value="2-4 weeks">2-4 weeks</option>
                  <option value="1-3 months">1-3 months</option>
                  <option value="More than 3 months">More than 3 months</option>
                </select>
              </div>

              {canEdit ? (
                <div className="sm:col-span-12 flex justify-end">
                  <button
                    type="button"
                    className="text-xs text-red-600 hover:text-red-700"
                    onClick={() => setMilestones((prev) => prev.filter((_, i) => i !== idx))}
                  >
                    Remove
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {canEdit ? (
        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={() =>
              onSave?.({
                projectDescription,
                expectedDuration,
                totalAmount: Number(totalAmount),
                currency,
                milestones: milestones.map((m) => ({
                  title: m.title,
                  description: m.description,
                  percent: Number(m.percent),
                  expectedDuration: m.expectedDuration,
                })),
              })
            }
            disabled={!canSave || !isDirty || saving}
            loading={saving}
          >
            Save contract
          </Button>
        </div>
      ) : null}
    </div>
  );
}

