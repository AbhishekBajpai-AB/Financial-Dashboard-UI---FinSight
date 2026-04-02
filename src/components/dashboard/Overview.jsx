import React, { useMemo, useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const COLORS = ['#22fffb8a', '#00e5ff', '#ffeb3b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Overview() {
  const { transactions } = useFinance();
  const [activeSector, setActiveSector] = useState(null);

  const { totalIncome, totalExpense, balance, categoryData, balanceTrend, monthlyComparison, observation } = useMemo(() => {
    let income = 0;
    let expense = 0;
    const catMap = {};
    const trendMap = {};
    const monthStats = {};
    let largestSingleExpense = null;

    transactions.forEach(t => {
      const amt = Number(t.amount);
      const dateKey = t.date;
      const monthStr = t.date.substring(0, 7);

      if (!trendMap[dateKey]) trendMap[dateKey] = 0;
      if (!monthStats[monthStr]) monthStats[monthStr] = { income: 0, expense: 0, categories: {} };

      if (t.type === 'income') {
        income += amt;
        trendMap[dateKey] += amt;
        monthStats[monthStr].income += amt;
      } else {
        expense += amt;
        trendMap[dateKey] -= amt;
        monthStats[monthStr].expense += amt;
        monthStats[monthStr].categories[t.category] = (monthStats[monthStr].categories[t.category] || 0) + amt;
        catMap[t.category] = (catMap[t.category] || 0) + amt;

        if (!largestSingleExpense || amt > largestSingleExpense.amount) {
          largestSingleExpense = t;
        }
      }
    });

    const catData = Object.keys(catMap).map(key => ({
      name: key,
      value: catMap[key]
    })).sort((a, b) => b.value - a.value);

    const sortedDates = Object.keys(trendMap).sort();
    let currentBal = 0;
    const bTrend = sortedDates.map(date => {
      currentBal += trendMap[date];
      return { date, balance: currentBal };
    });

    const sortedMonths = Object.keys(monthStats).sort();
    let monthlyComp = { title: "Monthly Trend", text: "Add more data to see trends.", isPositive: true };
    if (sortedMonths.length >= 2) {
      const current = monthStats[sortedMonths[sortedMonths.length - 1]];
      const prev = monthStats[sortedMonths[sortedMonths.length - 2]];
      const diff = current.expense - prev.expense;
      if (prev.expense > 0) {
        const pct = Math.round((Math.abs(diff) / prev.expense) * 100);
        let largestChangeCat = null;
        let largestChangeAmt = 0;
        
        const allCats = new Set([...Object.keys(current.categories || {}), ...Object.keys(prev.categories || {})]);
        allCats.forEach(cat => {
            const curCatAmt = current.categories[cat] || 0;
            const prevCatAmt = prev.categories[cat] || 0;
            const catDiff = curCatAmt - prevCatAmt;
            
            if (diff > 0 && catDiff > largestChangeAmt) {
                largestChangeAmt = catDiff;
                largestChangeCat = cat;
            } else if (diff < 0 && catDiff < largestChangeAmt) {
                largestChangeAmt = catDiff;
                largestChangeCat = cat;
            }
        });

        let reason = "";
        if (largestChangeCat) {
            const reasonAction = diff > 0 ? "increased" : "reduced";
            reason = `, mainly due to ${reasonAction} ${largestChangeCat.toLowerCase()} activity`;
        }

        const verb = diff > 0 ? "increased" : "decreased";
        monthlyComp = { 
            title: "Monthly Trend", 
            text: `Expenses ${verb} by ${pct}%${reason}`, 
            isPositive: diff <= 0 
        };
      } else {
        monthlyComp = { title: "Monthly Trend", text: `Expenses are $${current.expense.toLocaleString()} this month, with no expenses last month`, isPositive: false };
      }
    } else if (sortedMonths.length === 1) {
      monthlyComp = { title: "Monthly Trend", text: `Your expenses this month are $${monthStats[sortedMonths[0]].expense.toLocaleString()}`, isPositive: true };
    }

    const obsText = largestSingleExpense
      ? `Your largest expense this period was ${largestSingleExpense.description} for $${largestSingleExpense.amount.toLocaleString()}`
      : "No individual expense observations available";
    const obs = { title: "Largest Expense", text: obsText, isPositive: true };

    return {
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
      categoryData: catData,
      balanceTrend: bTrend,
      monthlyComparison: monthlyComp,
      observation: obs
    };
  }, [transactions]);

  const topCategory = categoryData.length > 0 ? categoryData[0] : null;
  let topSpendingInsight = { title: "Top Spending", text: "Not enough data" };
  if (topCategory && totalExpense > 0) {
    const pct = Math.round((topCategory.value / totalExpense) * 100);
    const unusual = pct >= 40 ? " — unusually high" : "";
    topSpendingInsight = { 
      title: "Top Spending", 
      text: `${topCategory.name} accounts for ${pct}% of your total spend${unusual}` 
    };
  }

  return (
    <div className="overview-container">
      <div className="summary-cards">
        <div className="card summary-card">
          <div className="card-header">
            <h3>Total Balance</h3>
            <div className="icon-wrapper blue"><DollarSign size={20} /></div>
          </div>
          <div className="card-value">${balance.toLocaleString()}</div>
          <div className="card-trend success">↑ 12.4% from last month</div>
        </div>
        <div className="card summary-card">
          <div className="card-header">
            <h3>Total Income</h3>
            <div className="icon-wrapper green"><TrendingUp size={20} /></div>
          </div>
          <div className="card-value success">${totalIncome.toLocaleString()}</div>
          <div className="card-trend success">↑ 8.2% from last month</div>
        </div>
        <div className="card summary-card">
          <div className="card-header">
            <h3>Total Expenses</h3>
            <div className="icon-wrapper red"><TrendingDown size={20} /></div>
          </div>
          <div className="card-value danger">${totalExpense.toLocaleString()}</div>
          <div className="card-trend danger">↓ 2.1% from last month</div>
        </div>
      </div>

      <div className="insights-section">
        <h3 style={{ marginBottom: '16px', fontSize: '1.2rem', color: 'var(--text-primary)' }}>💡 Quick Insights</h3>
        <div className="summary-cards">
          <div className="card summary-card insight-card" style={{ borderLeft: '4px solid var(--accent-color)' }}>
            <div className="card-header">
              <h3>{topSpendingInsight.title}</h3>
            </div>
            <div className="card-value" style={{ fontSize: '1.1rem', marginBottom: '4px', fontWeight: '500', lineHeight: '1.4', whiteSpace: 'normal', wordBreak: 'break-word', color: 'var(--text-primary)' }}>{topSpendingInsight.text}</div>
          </div>
          <div className="card summary-card insight-card" style={{ borderLeftColor: 'var(--success)' }}>
            <div className="card-header">
              <h3>{monthlyComparison.title}</h3>
            </div>
            <div className={`card-value ${monthlyComparison.isPositive ? 'success' : monthlyComparison.isPositive === false ? 'danger' : ''}`} style={{ fontSize: '1.1rem', marginBottom: '4px', fontWeight: '500', lineHeight: '1.4', whiteSpace: 'normal', wordBreak: 'break-word' }}>
              {monthlyComparison.text}
            </div>
          </div>
          <div className="card summary-card insight-card" style={{ borderLeftColor: 'var(--warning)' }}>
            <div className="card-header">
              <h3>{observation.title}</h3>
            </div>
            <div className="card-value" style={{ fontSize: '1.1rem', marginBottom: '4px', fontWeight: '500', lineHeight: '1.4', whiteSpace: 'normal', wordBreak: 'break-word', color: 'var(--text-primary)' }}>{observation.text}</div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card chart-card">
          <h3>Balance Trend</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={balanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--text-secondary)" tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}
                />
                <Line type="stepAfter" dataKey="balance" stroke="var(--accent-color)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card chart-card">
          <h3>Spending Breakdown</h3>
          <div className="chart-wrapper pie-wrapper">
            {categoryData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={90}
                      paddingAngle={2} dataKey="value" stroke="none"
                      onMouseEnter={(_, index) => setActiveSector(index)}
                      onMouseLeave={() => setActiveSector(null)}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          style={{
                            opacity: activeSector === null || activeSector === index ? 1 : 0.3,
                            transition: 'opacity 0.2s ease'
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pie-legend">
                  {categoryData.slice(0, 4).map((entry, idx) => {
                    const percentage = totalExpense > 0 ? Math.round((entry.value / totalExpense) * 100) : 0;
                    return (
                      <div
                        key={entry.name}
                        className="legend-item"
                        onMouseEnter={() => setActiveSector(idx)}
                        onMouseLeave={() => setActiveSector(null)}
                        style={{
                          opacity: activeSector === null || activeSector === idx ? 1 : 0.4,
                          transform: activeSector === idx ? 'translateX(4px)' : 'none',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer'
                        }}
                      >
                        <span className="legend-dot" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                        <span className="legend-name">{entry.name} <span className="legend-pct">({percentage}%)</span></span>
                        <span className="legend-value">${entry.value.toLocaleString()}</span>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <div className="empty-chart">No expense data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
