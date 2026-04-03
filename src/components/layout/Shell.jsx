import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { LayoutDashboard, WalletCards, Moon, Sun, Shield, ShieldAlert, ChevronDown } from 'lucide-react';

export default function Shell({ children, activeTab, setActiveTab }) {
  const { role, setRole, theme, toggleTheme, isLoading, error, fetchData } = useFinance();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
                <div className="custom-dropdown-container" ref={dropdownRef}>
                  <button 
                    className="custom-dropdown-button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    {role} Role
                    <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
                  </button>
                  {dropdownOpen && (
                    <div className="custom-dropdown-menu">
                      <button 
                        className={`custom-dropdown-item ${role === 'Viewer' ? 'active' : ''}`}
                        onClick={() => { setRole('Viewer'); setDropdownOpen(false); }}
                      >
                        <Shield size={16} /> Viewer
                      </button>
                      <button 
                        className={`custom-dropdown-item ${role === 'Admin' ? 'active' : ''}`}
                        onClick={() => { setRole('Admin'); setDropdownOpen(false); }}
                      >
                        <ShieldAlert size={16} className="admin-icon" /> Admin
                      </button>
                    </div>
                  )}
                </div>
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
