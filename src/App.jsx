import React, { useState } from 'react';
import { FinanceProvider } from './context/FinanceContext';
import Shell from './components/layout/Shell';
import Overview from './components/dashboard/Overview';
import TransactionManager from './components/transactions/TransactionManager';

function FinanceApp() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <FinanceProvider>
      <Shell activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeTab === 'overview' ? <Overview /> : <TransactionManager />}
      </Shell>
    </FinanceProvider>
  );
}

export default FinanceApp;
