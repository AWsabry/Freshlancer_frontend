import React, { useEffect, useMemo, useState } from 'react';
import Button from '../common/Button';
import { getContractComponentsT, DURATION_VALUES } from '../../locales/contractComponentsLocales';

const round2 = (n) => {
  const num = typeof n === 'string' ? Number(n) : n;
  if (!Number.isFinite(num)) return null;
  return Math.round(num * 100) / 100;
};

const normalizeText = (s) => (typeof s === 'string' ? s.trim() : '');

function normalizeMilestonesForForm(contract, defaultMilestoneTitle, defaultDuration) {
  const defDur = defaultDuration || DURATION_VALUES.default;
  const ms = contract?.milestones || [];
  if (!Array.isArray(ms) || ms.length === 0) {
    return [
      {
        title: defaultMilestoneTitle,
        description: '',
        percent: 100,
        expectedDuration: contract?.expectedDuration || defDur,
      },
    ];
  }
  return ms.map((m) => ({
    title: m?.plan?.title ?? m?.title ?? '',
    description: m?.plan?.description ?? m?.description ?? '',
    percent: m?.plan?.percent ?? m?.percent ?? 0,
    expectedDuration: m?.plan?.expectedDuration ?? m?.expectedDuration ?? contract?.expectedDuration ?? defDur,
    _id: m?._id,
  }));
}

export default function ContractEditor({
  contract,
  canEdit,
  onSave,
  saving,
  highlightFields = [],
  language = 'en',
}) {
  const t = useMemo(() => getContractComponentsT(language), [language]);
  const [projectDescription, setProjectDescription] = useState('');
  const [expectedDuration, setExpectedDuration] = useState(DURATION_VALUES.default);
  const [totalAmount, setTotalAmount] = useState('');
  const [currency, setCurrency] = useState('EGP');
  const [milestones, setMilestones] = useState([]);

  const initialSnapshot = useMemo(() => {
    if (!contract) return null;
    const ms = normalizeMilestonesForForm(contract, t.defaultMilestoneTitle, DURATION_VALUES.default);
    return {
      projectDescription: normalizeText(contract.projectDescription),
      expectedDuration: contract.expectedDuration || DURATION_VALUES.default,
      totalAmount: round2(contract.totalAmount),
      currency: contract.currency || 'EGP',
      milestones: ms.map((m) => ({
        title: normalizeText(m.title),
        description: normalizeText(m.description),
        percent: round2(m.percent),
        expectedDuration: m.expectedDuration || contract.expectedDuration || DURATION_VALUES.default,
      })),
    };
  }, [contract?._id, t.defaultMilestoneTitle]);

  useEffect(() => {
    if (!contract) return;
    setProjectDescription(contract.projectDescription || '');
    setExpectedDuration(contract.expectedDuration || DURATION_VALUES.default);
    setTotalAmount(contract.totalAmount ?? '');
    setCurrency(contract.currency || 'EGP');
    setMilestones(normalizeMilestonesForForm(contract, t.defaultMilestoneTitle, DURATION_VALUES.default));
  }, [contract?._id, t.defaultMilestoneTitle]);

  const percentTotal = useMemo(() => {
    return milestones.reduce((sum, m) => sum + (Number(m.percent) || 0), 0);
  }, [milestones]);

  const canSave = canEdit && projectDescription.trim() && Number(totalAmount) > 0 && Math.round(percentTotal * 100) / 100 === 100;

  const isDirty = useMemo(() => {
    if (!canEdit || !initialSnapshot) return false;
    const currentSnapshot = {
      projectDescription: normalizeText(projectDescription),
      expectedDuration: expectedDuration || DURATION_VALUES.default,
      totalAmount: round2(totalAmount),
      currency: currency || 'EGP',
      milestones: (Array.isArray(milestones) ? milestones : []).map((m) => ({
        title: normalizeText(m.title),
        description: normalizeText(m.description),
        percent: round2(m.percent),
        expectedDuration: m.expectedDuration || expectedDuration || DURATION_VALUES.default,
      })),
    };
    return JSON.stringify(currentSnapshot) !== JSON.stringify(initialSnapshot);
  }, [canEdit, initialSnapshot, projectDescription, expectedDuration, totalAmount, currency, milestones]);

  const highlight = (field) => Array.isArray(highlightFields) && highlightFields.includes(field);

  const durationRows = useMemo(
    () => [
      { value: DURATION_VALUES.lessThanWeek, label: t.dLess },
      { value: DURATION_VALUES.w1to2, label: t.d1to2 },
      { value: DURATION_VALUES.w2to4, label: t.d2to4 },
      { value: DURATION_VALUES.m1to3, label: t.d1to3 },
      { value: DURATION_VALUES.moreThan3, label: t.dMore },
    ],
    [t]
  );

  return (
    <div className="space-y-4">
      <div className={highlight('projectDescription') ? 'border border-yellow-300 bg-yellow-50 rounded-lg p-3' : ''}>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t.projectDescription}</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.totalAmount}</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.currency}</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.contractDuration}</label>
          <select
            value={expectedDuration}
            onChange={(e) => setExpectedDuration(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            disabled={!canEdit}
          >
            {durationRows.map((row) => (
              <option key={row.value} value={row.value}>
                {row.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        className={`border rounded-lg p-4 space-y-3 ${
          highlight('milestones') ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-white'
        }`}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">{t.milestonesHeading}</h3>
          {canEdit ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setMilestones((prev) => [
                  ...prev,
                  { title: '', description: '', percent: 0, expectedDuration: expectedDuration || DURATION_VALUES.default },
                ])
              }
            >
              {t.addMilestone}
            </Button>
          ) : null}
        </div>

        <p className={`text-xs ${Math.round(percentTotal * 100) / 100 === 100 ? 'text-green-600' : 'text-red-600'}`}>
          {t.percentTotal(Math.round(percentTotal * 100) / 100)}
        </p>

        <div className="space-y-3">
          {milestones.map((m, idx) => (
            <div key={m._id || idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 border rounded-lg p-3">
              <div className="sm:col-span-4">
                <label className="block text-xs text-gray-600 mb-1">{t.fieldTitle}</label>
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
                <label className="block text-xs text-gray-600 mb-1">{t.fieldDescription}</label>
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
                <label className="block text-xs text-gray-600 mb-1">{t.fieldPercent}</label>
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
                <label className="block text-xs text-gray-600 mb-1">{t.fieldExpectedDuration}</label>
                <select
                  value={m.expectedDuration || expectedDuration || DURATION_VALUES.default}
                  onChange={(e) => {
                    const v = e.target.value;
                    setMilestones((prev) => prev.map((x, i) => (i === idx ? { ...x, expectedDuration: v } : x)));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  disabled={!canEdit}
                >
                  {durationRows.map((row) => (
                    <option key={row.value} value={row.value}>
                      {row.label}
                    </option>
                  ))}
                </select>
              </div>

              {canEdit ? (
                <div className="sm:col-span-12 flex justify-end">
                  <button
                    type="button"
                    className="text-xs text-red-600 hover:text-red-700"
                    onClick={() => setMilestones((prev) => prev.filter((_, i) => i !== idx))}
                  >
                    {t.remove}
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
            {t.saveContract}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

