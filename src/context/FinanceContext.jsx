import React, { createContext, useState, useContext, useEffect } from 'react';
import { initialTransactions } from '../data/mockData';

const FinanceContext = createContext();

export function FinanceProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState('Viewer'); // 'Viewer' or 'Admin'
  const [theme, setTheme] = useState('dark');

  const fetchData = () => {
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      if (Math.random() < 0.1) {
        setError('Failed to fetch financial data. Please check your connection.');
        setIsLoading(false);
      } else {
        try {
          const saved = localStorage.getItem('finance_data_v2');
          setTransactions(saved ? JSON.parse(saved) : initialTransactions);
          setError(null);
        } catch (err) {
          setError('Data corruption error.');
        } finally {
          setIsLoading(false);
        }
      }
    }, 800);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!isLoading && !error) {
      localStorage.setItem('finance_data_v2', JSON.stringify(transactions));
    }
  }, [transactions, isLoading, error]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const addTransaction = (txn) => {
    if (role !== 'Admin') return;
    setTransactions(prev => [{ ...txn, id: Date.now().toString() }, ...prev]);
  };

  const deleteTransaction = (id) => {
    if (role !== 'Admin') return;
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const value = {
    transactions,
    isLoading,
    error,
    fetchData,
    role,
    setRole,
    theme,
    toggleTheme,
    addTransaction,
    deleteTransaction
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export const useFinance = () => useContext(FinanceContext);
