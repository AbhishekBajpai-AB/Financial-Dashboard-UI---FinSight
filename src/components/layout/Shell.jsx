import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { LayoutDashboard, WalletCards, Moon, Sun, Shield, ShieldAlert } from 'lucide-react';

export default function Shell({ children, activeTab, setActiveTab }) {
  const { role, setRole, theme, toggleTheme, isLoading, error, fetchData } = useFinance();

  return (
    <div className="shell-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>FinSight</h2>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={20} /> Overview
          </button>
          <button 
            className={`nav-btn ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            <WalletCards size={20} /> Transactions
          </button>
        </nav>
      </aside>
      
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <h1 className="page-title">{activeTab === 'overview' ? 'Overview' : 'Transactions'}</h1>
          </div>
          <div className="topbar-right">
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <div className="role-switcher">
              <span className="role-icon">
                {role === 'Admin' ? <ShieldAlert size={18} className="admin-icon" /> : <Shield size={18} />}
              </span>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                className="role-select"
              >
                <option value="Viewer">Viewer Role</option>
                <option value="Admin">Admin Role</option>
              </select>
            </div>
          </div>
        </header>
        <div className="content-area">
          {isLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading financial data...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <ShieldAlert size={48} className="error-icon" />
              <h2>Oops! Something went wrong.</h2>
              <p>{error}</p>
              <button className="btn btn-primary" onClick={fetchData}>Try Again</button>
            </div>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  );
}
