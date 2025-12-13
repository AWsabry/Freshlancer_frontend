import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';

const translations = {
  en: {
    contracts: 'Contracts',
    underConstruction: 'This page is under construction.',
  },
  it: {
    contracts: 'Contratti',
    underConstruction: 'Questa pagina è in costruzione.',
  },
};

const Contracts = () => {
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

  const t = translations[language] || translations.en;

  return (
    <div className="space-y-6">
      <Card title={t.contracts}>
        <p className="text-gray-600">{t.underConstruction}</p>
      </Card>
    </div>
  );
};

export default Contracts;
