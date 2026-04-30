import React, { useEffect, useMemo, useState } from 'react';
import { getContractComponentsT } from '../../locales/contractComponentsLocales';

export default function SignaturePad({ value, onChange, language = 'en' }) {
  const t = useMemo(() => getContractComponentsT(language), [language]);
  const [typedName, setTypedName] = useState(value?.typedName || '');

  useEffect(() => {
    setTypedName(value?.typedName || '');
  }, [value?.typedName]);

  const emit = (name) => {
    onChange?.({ typedName: name, drawnSignatureDataUrl: '' });
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {t.sigTypedLabel}
      </label>
      <input
        value={typedName}
        onChange={(e) => {
          const next = e.target.value;
          setTypedName(next);
          emit(next);
        }}
        placeholder={t.sigTypedPlaceholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
      />
    </div>
  );
}
