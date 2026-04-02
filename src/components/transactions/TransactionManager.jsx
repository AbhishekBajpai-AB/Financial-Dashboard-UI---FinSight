import React, { useState, useMemo, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Search, Plus, Trash2, ArrowUpRight, ArrowDownRight, Inbox, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

export default function TransactionManager() {
  const { transactions, role, addTransaction, deleteTransaction } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, sortBy]);

  const filteredTransactions = useMemo(() => {
    let result = transactions.filter(t => {
      const matchSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = typeFilter === 'all' || t.type === typeFilter;
      return matchSearch && matchType;
    });

    return result.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'amount-desc') return Number(b.amount) - Number(a.amount);
      if (sortBy === 'amount-asc') return Number(a.amount) - Number(b.amount);
      return 0;
    });
  }, [transactions, searchTerm, typeFilter, sortBy]);

  const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage) || 1;
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredTransactions, currentPage, rowsPerPage]);

  const handleAdd = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newTxn = {
      date: formData.get('date'),
      amount: Number(formData.get('amount')),
      category: formData.get('category'),
      type: formData.get('type'),
      description: formData.get('description'),
    };
    addTransaction(newTxn);
    setIsModalOpen(false);
  };

  const exportCSV = () => {
    if (filteredTransactions.length === 0) return;
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
    const csvRows = [
      headers.join(','),
      ...filteredTransactions.map(t => [t.date, `"${t.description.replace(/"/g, '""')}"`, `"${t.category.replace(/"/g, '""')}"`, t.type, t.amount].join(','))
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transactions_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    if (filteredTransactions.length === 0) return;
    const blob = new Blob([JSON.stringify(filteredTransactions, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transactions_${format(new Date(), 'yyyyMMdd')}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="transactions-container">
      <div className="card manager-card">
        <div className="manager-header">
          <div className="search-filter-group">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search transactions..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Amount: High to Low</option>
              <option value="amount-asc">Amount: Low to High</option>
            </select>
          </div>
          <div className="header-actions" style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={exportCSV} disabled={filteredTransactions.length === 0}>
              <Download size={18} /> CSV
            </button>
            <button className="btn btn-secondary" onClick={exportJSON} disabled={filteredTransactions.length === 0}>
              <Download size={18} /> JSON
            </button>
            {role === 'Admin' && (
              <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                <Plus size={18} /> Add Transaction
              </button>
            )}
          </div>
        </div>

        <div className="table-responsive">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th className="amount-col">Amount</th>
                {role === 'Admin' && <th className="action-col">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map(t => (
                  <tr key={t.id}>
                    <td>{format(new Date(t.date), 'MMM dd, yyyy')}</td>
                    <td className="desc-cell">{t.description}</td>
                    <td><span className="category-badge">{t.category}</span></td>
                    <td className={`amount-col ${t.type === 'income' ? 'success' : ''}`}>
                      <div className="amount-wrapper">
                        {t.type === 'income' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        ${Number(t.amount).toLocaleString()}
                      </div>
                    </td>
                    {role === 'Admin' && (
                      <td className="action-col">
                        <button className="btn-icon danger" onClick={() => deleteTransaction(t.id)}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={role === 'Admin' ? 5 : 4} className="empty-state-cell">
                    <div className="enhanced-empty-state">
                      <Inbox size={48} className="empty-icon" />
                      <h4>No Transactions Found</h4>
                      <p>Adjust your filters or add a new transaction.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderTop: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          <div className="rows-per-page" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Rows per page:</span>
            <select 
              value={rowsPerPage} 
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="filter-select"
              style={{ padding: '6px 12px' }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          
          <div className="pagination-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>
              {filteredTransactions.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}-
              {Math.min(currentPage * rowsPerPage, filteredTransactions.length)} of {filteredTransactions.length}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn-icon" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ 
                  border: '1px solid var(--border-color)', 
                  backgroundColor: currentPage === 1 ? 'transparent' : 'var(--bg-secondary)', 
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer', 
                  opacity: currentPage === 1 ? 0.5 : 1 
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                className="btn-icon" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || filteredTransactions.length === 0}
                style={{ 
                  border: '1px solid var(--border-color)', 
                  backgroundColor: (currentPage === totalPages || filteredTransactions.length === 0) ? 'transparent' : 'var(--bg-secondary)', 
                  cursor: (currentPage === totalPages || filteredTransactions.length === 0) ? 'not-allowed' : 'pointer', 
                  opacity: (currentPage === totalPages || filteredTransactions.length === 0) ? 0.5 : 1 
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && role === 'Admin' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Transaction</h2>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label>Date</label>
                <input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input type="text" name="description" required placeholder="e.g. Grocery Store" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Amount</label>
                  <input type="number" name="amount" min="0" step="0.01" required placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select name="type" required>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Category</label>
                <input type="text" name="category" required placeholder="e.g. Food" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
