import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';

// ─── Budgeting App Component Library ─────────────────────────────────────────
// Design tokens: Primary Blue #3366FF | Header Blue #1C53C6 | Olive #8B9A5E
// Pink Badge #F5C6D0 | Yellow Badge #E8D88E | BG #F0EDE8
// Progress Green #2ECC71 | Warning Red #E84B4B
// Fonts: Caveat (headings/nav) + Inter (body)
// ─────────────────────────────────────────────────────────────────────────────

type Screen = 'home' | 'details' | 'add' | 'trends' | 'budget' | 'savings';

const COLORS = {
  blue: '#3366FF',
  blueDeep: '#1C53C6',
  olive: '#8B9A5E',
  pink: '#F5C6D0',
  yellow: '#E8D88E',
  green: '#2ECC71',
  red: '#E84B4B',
  dark: '#1A1F3A',
  bg: '#F0EDE8',
};

// ── Prototype data ────────────────────────────────────────────────────────────
// Everything on the screens is derived from these, so adding a transaction,
// changing a limit or topping up a goal shows up on every tab.

type Category = 'Housing' | 'Food' | 'Transport' | 'Shopping';
const CATEGORIES: Category[] = ['Housing', 'Food', 'Transport', 'Shopping'];
const CAT_EMOJI: Record<Category, string> = { Housing: '🏠', Food: '🍔', Transport: '🚗', Shopping: '🛍️' };

interface Txn {
  id: number;
  name: string;
  type: 'expense' | 'income';
  cat?: Category;
  amt: number;
  day: number; // day of November 2024
}

interface Goal { name: string; emoji: string; saved: number; goal: number; color: string }

// The mock "today" is 18 November: 18 days into a 30-day month.
const TODAY = 18;
const DAYS_IN_MONTH = 30;
const OPENING_BALANCE = 3140;
const PREVIOUS_MONTHS = [{ m: 'Aug', v: 1420 }, { m: 'Sep', v: 1610 }, { m: 'Oct', v: 1380 }];

const INITIAL_TXNS: Txn[] = [
  { id: 1, name: 'Salary', type: 'income', amt: 2400, day: 1 },
  { id: 2, name: 'Rent Payment', type: 'expense', cat: 'Housing', amt: 700, day: 1 },
  { id: 3, name: 'Trainline', type: 'expense', cat: 'Transport', amt: 46.5, day: 2 },
  { id: 4, name: "Sainsbury's", type: 'expense', cat: 'Food', amt: 34.2, day: 3 },
  { id: 5, name: 'Uber', type: 'expense', cat: 'Transport', amt: 18.5, day: 4 },
  { id: 6, name: 'Amazon', type: 'expense', cat: 'Shopping', amt: 89, day: 5 },
  { id: 7, name: 'Waitrose', type: 'expense', cat: 'Food', amt: 52.4, day: 7 },
  { id: 8, name: 'Uniqlo', type: 'expense', cat: 'Shopping', amt: 76, day: 9 },
  { id: 9, name: 'Dishoom', type: 'expense', cat: 'Food', amt: 41, day: 11 },
  { id: 10, name: 'TfL Top-up', type: 'expense', cat: 'Transport', amt: 30, day: 12 },
  { id: 11, name: 'Waterstones', type: 'expense', cat: 'Shopping', amt: 75.5, day: 13 },
  { id: 12, name: 'Tesco', type: 'expense', cat: 'Food', amt: 31, day: 15 },
  { id: 13, name: 'Boots', type: 'expense', cat: 'Shopping', amt: 24.5, day: 16 },
  { id: 14, name: 'ASOS', type: 'expense', cat: 'Shopping', amt: 45, day: 17 },
  { id: 15, name: 'Pret A Manger', type: 'expense', cat: 'Food', amt: 8.9, day: 17 },
  { id: 16, name: 'Tesco Express', type: 'expense', cat: 'Food', amt: 12.5, day: 18 },
  { id: 17, name: 'TfL Oyster', type: 'expense', cat: 'Transport', amt: 5, day: 18 },
];

const INITIAL_LIMITS: Record<Category, number> = { Housing: 900, Food: 400, Transport: 100, Shopping: 300 };

const INITIAL_GOALS: Goal[] = [
  { name: 'Holiday Fund', emoji: '✈️', saved: 1200, goal: 2000, color: COLORS.blue },
  { name: 'Emergency Fund', emoji: '🛡️', saved: 3000, goal: 5000, color: COLORS.green },
  { name: 'New Laptop', emoji: '💻', saved: 450, goal: 1200, color: COLORS.olive },
];

const money = (n: number, decimals = 0) =>
  `${n < 0 ? '−' : ''}£${Math.abs(n).toLocaleString('en-GB', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
const dayLabel = (day: number) => day === TODAY ? 'Today' : day === TODAY - 1 ? 'Yesterday' : `Nov ${day}`;

function summarise(txns: Txn[], limits: Record<Category, number>) {
  const spentBy = Object.fromEntries(CATEGORIES.map(c => [c, 0])) as Record<Category, number>;
  let income = 0;
  let spentToday = 0;
  for (const t of txns) {
    if (t.type === 'income') { income += t.amt; continue; }
    if (t.cat) spentBy[t.cat] += t.amt;
    if (t.day === TODAY) spentToday += t.amt;
  }
  const spent = CATEGORIES.reduce((sum, c) => sum + spentBy[c], 0);
  const totalLimit = CATEGORIES.reduce((sum, c) => sum + limits[c], 0);
  return {
    spentBy, spent, income, spentToday, totalLimit,
    balance: OPENING_BALANCE + income - spent,
    left: totalLimit - spent,
    over: CATEGORIES.filter(c => spentBy[c] > limits[c]),
  };
}
type Summary = ReturnType<typeof summarise>;

// ── Shared phone shell ────────────────────────────────────────────────────────
const PHONE_W = 390;
const PHONE_H = 844;

function PhoneShell({ activeScreen, onTabChange, children }: {
  activeScreen: Screen;
  onTabChange: (s: Screen) => void;
  children: React.ReactNode;
}) {
  const headerBlue = activeScreen === 'home';
  const tabs: { id: Screen; emoji: string; label: string }[] = [
    { id: 'home', emoji: '🏠', label: 'Home' },
    { id: 'details', emoji: '📋', label: 'Details' },
    { id: 'add', emoji: '➕', label: 'Add' },
    { id: 'trends', emoji: '📊', label: 'Trends' },
    { id: 'budget', emoji: '💰', label: 'Budget' },
    { id: 'savings', emoji: '🐷', label: 'Savings' },
  ];
  return (
    <div style={{
      width: PHONE_W, flexShrink: 0,
      background: COLORS.bg,
      borderRadius: 48,
      boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.07)',
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      height: PHONE_H,
    }}>
      {/* Status bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 28px 8px',
        background: headerBlue ? COLORS.blue : COLORS.bg,
        color: headerBlue ? '#fff' : COLORS.dark,
        transition: 'background 0.3s',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>9:41</span>
        <div style={{ display: 'flex', gap: 6, fontSize: 11, fontWeight: 500 }}>
          <span>●●●●</span><span>WiFi</span><span>▮▮▮</span>
        </div>
      </div>
      {/* Screen */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
      {/* Bottom nav */}
      <div role="tablist" aria-label="App screens" style={{
        display: 'flex', background: '#fff',
        borderTop: '1px solid rgba(0,0,0,0.06)',
        paddingBottom: 8, flexShrink: 0,
      }}>
        {tabs.map(t => (
          <button key={t.id} role="tab" aria-selected={activeScreen === t.id} onClick={() => onTabChange(t.id)} style={{
            flex: 1, padding: '10px 4px 6px', border: 'none', background: 'transparent',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          }}>
            <span style={{ fontSize: t.id === 'add' ? 20 : 16 }}>{t.emoji}</span>
            <span style={{
              fontFamily: "'Caveat', cursive", fontSize: 11, fontWeight: 600,
              color: activeScreen === t.id ? COLORS.blue : '#999',
            }}>{t.label}</span>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: activeScreen === t.id ? COLORS.blue : 'transparent' }} />
          </button>
        ))}
      </div>
    </div>
  );
}

// Scales the fixed-size phone down so it fits narrow (real phone) screens.
function FittedPhone({ children }: { children: React.ReactNode }) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => {
      const gutter = Math.min(40, Math.max(16, window.innerWidth * 0.05));
      setScale(Math.min(1, (window.innerWidth - gutter * 2) / PHONE_W));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  return (
    <div style={{ width: PHONE_W * scale, height: PHONE_H * scale }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: PHONE_W }}>
        {children}
      </div>
    </div>
  );
}

const screenTitle = { fontFamily: "'Caveat', cursive", fontSize: 28, fontWeight: 700, color: COLORS.dark, marginBottom: 4 } as const;
const fieldLabel = { fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: 6 } as const;

// ── Home screen ───────────────────────────────────────────────────────────────
function HomeScreen({ summary, limits, onSearch }: { summary: Summary; limits: Record<Category, number>; onSearch: () => void }) {
  const [filter, setFilter] = useState<'All' | Category>('All');
  const visible = filter === 'All' ? CATEGORIES : [filter];
  const firstOver = summary.over[0];
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: COLORS.bg }}>
      {/* Blue header */}
      <div style={{
        background: `linear-gradient(160deg, ${COLORS.blue} 0%, ${COLORS.blueDeep} 100%)`,
        padding: '16px 20px 32px', borderRadius: '0 0 28px 28px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: 32, fontWeight: 700, color: '#fff' }}>Budget</span>
          <button onClick={onSearch} aria-label="Search transactions" style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🔍</button>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '20px 22px', backdropFilter: 'blur(10px)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.75)', marginBottom: 6, textTransform: 'uppercase' }}>Total Balance</p>
          <p style={{ fontSize: 36, fontWeight: 700, color: '#fff', marginBottom: 16 }}>{money(summary.balance)}</p>
          <div style={{ display: 'flex', gap: 24 }}>
            {[{ l: 'SPENT', v: money(summary.spent) }, { l: 'LEFT', v: money(summary.left) }, { l: 'DAYS', v: String(DAYS_IN_MONTH - TODAY) }].map(i => (
              <div key={i.l}>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{i.v}</p>
                <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase' }}>{i.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ padding: '16px 16px 0' }}>
        {/* Badges */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          {[
            { bg: COLORS.pink, l: 'Today', v: money(summary.spentToday, 2) },
            { bg: COLORS.yellow, l: 'Per day', v: money(summary.spent / TODAY, 2) },
            { bg: '#E8E8E8', l: 'Income', v: money(summary.income) },
          ].map(b => (
            <div key={b.l} style={{ flex: 1, background: b.bg, borderRadius: 12, padding: '10px 12px' }}>
              <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', color: '#666', textTransform: 'uppercase', marginBottom: 4 }}>{b.l}</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: COLORS.dark }}>{b.v}</p>
            </div>
          ))}
        </div>
        {/* On track / over budget */}
        <div style={{ background: firstOver ? COLORS.red : COLORS.olive, borderRadius: 14, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, transition: 'background 0.3s' }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2 }}>
              {firstOver ? `Over budget on ${summary.over.join(' & ')}` : 'On track! 🎯'}
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>
              {firstOver ? `${money(summary.spentBy[firstOver] - limits[firstOver], 2)} over — adjust it in Budget` : 'Keep spending at this rate'}
            </p>
          </div>
          <span style={{ fontSize: 24 }}>{firstOver ? '⚠️' : '💰'}</span>
        </div>
        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto' }}>
          {(['All', 'Food', 'Transport', 'Shopping', 'Housing'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '6px 14px', borderRadius: 20, border: 'none',
              background: filter === f ? COLORS.dark : '#fff',
              color: filter === f ? '#fff' : COLORS.dark,
              fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            }}>{f === 'All' ? '' : `${CAT_EMOJI[f]} `}{f}</button>
          ))}
        </div>
        {/* Category grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, paddingBottom: 20 }}>
          {visible.map(c => {
            const spent = summary.spentBy[c];
            const limit = limits[c];
            const pct = Math.min(spent / limit, 1);
            const over = spent > limit;
            const dark = c === 'Housing';
            return (
              <div key={c} style={{ background: dark ? COLORS.dark : '#fff', borderRadius: 16, padding: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{CAT_EMOJI[c]}</div>
                <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', color: dark ? 'rgba(255,255,255,0.6)' : '#888', textTransform: 'uppercase', marginBottom: 4 }}>{c}</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: dark ? '#fff' : COLORS.dark, marginBottom: 2 }}>{money(spent / TODAY, 2)}/day</p>
                {over
                  ? <p style={{ fontSize: 11, fontWeight: 600, color: COLORS.red, marginBottom: 8 }}>Over budget</p>
                  : <p style={{ fontSize: 11, color: dark ? 'rgba(255,255,255,0.5)' : '#999', marginBottom: 8 }}>{money(spent)} of {money(limit)}</p>
                }
                <div style={{ height: 4, background: dark ? 'rgba(255,255,255,0.2)' : '#eee', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: `${pct * 100}%`, background: over ? COLORS.red : COLORS.green, borderRadius: 2, transition: 'width 0.4s' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Details screen ────────────────────────────────────────────────────────────
function DetailsScreen({ txns, focusSearch, onDelete }: { txns: Txn[]; focusSearch: boolean; onDelete: (id: number) => void }) {
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (focusSearch) searchRef.current?.focus({ preventScroll: true }); }, [focusSearch]);

  const q = query.trim().toLowerCase();
  const shown = [...txns]
    .sort((a, b) => b.day - a.day || b.id - a.id)
    .filter(t => !q || t.name.toLowerCase().includes(q) || (t.cat ?? 'income').toLowerCase().includes(q));
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: COLORS.bg, padding: '20px 20px 0' }}>
      <h2 style={screenTitle}>Transactions</h2>
      <p style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>November 2024</p>
      <input
        ref={searchRef}
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="🔍  Search transactions"
        aria-label="Search transactions"
        style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: 'none', background: '#fff', fontSize: 16, color: COLORS.dark, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', outline: 'none', boxSizing: 'border-box', marginBottom: 14 }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 20 }}>
        {shown.length === 0 && (
          <p style={{ fontSize: 13, color: '#999', textAlign: 'center', padding: '24px 0' }}>No transactions match “{query}”</p>
        )}
        {shown.map(t => {
          const income = t.type === 'income';
          return (
            <div key={t.id} style={{ background: '#fff', borderRadius: 14, padding: '14px 12px 14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: COLORS.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{t.cat ? CAT_EMOJI[t.cat] : '💷'}</div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: COLORS.dark, marginBottom: 2 }}>{t.name}</p>
                  <p style={{ fontSize: 11, color: '#999' }}>{dayLabel(t.day)} · {t.cat ?? 'Income'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: income ? COLORS.green : COLORS.red }}>{income ? '+' : ''}{money(t.amt, 2)}</p>
                <button onClick={() => onDelete(t.id)} aria-label={`Delete ${t.name}`} style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'transparent', color: '#bbb', fontSize: 16, lineHeight: 1 }}>×</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Add screen ────────────────────────────────────────────────────────────────
function AddScreen({ onAdd }: { onAdd: (t: Omit<Txn, 'id' | 'day'>) => void }) {
  const blank = { name: '', amount: '', cat: 'Food' as Category, type: 'expense' as Txn['type'] };
  const [form, setForm] = useState(blank);
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle');
  const amount = parseFloat(form.amount);
  const handle = () => {
    if (!form.name.trim() || !(amount > 0)) { setStatus('error'); return; }
    onAdd({ name: form.name.trim(), amt: Math.round(amount * 100) / 100, type: form.type, cat: form.type === 'expense' ? form.cat : undefined });
    setStatus('success');
    setForm(blank);
  };
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: COLORS.bg, padding: 20 }}>
      <h2 style={screenTitle}>Add {form.type === 'expense' ? 'Expense' : 'Income'}</h2>
      <p style={{ fontSize: 12, color: '#888', marginBottom: 24 }}>Record a new transaction</p>
      {status === 'success' && <div role="status" style={{ background: COLORS.green, borderRadius: 14, padding: '14px 18px', color: '#fff', fontWeight: 600, fontSize: 14, marginBottom: 20, textAlign: 'center' }}>✓ Added! Check Home or Details</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', background: '#fff', borderRadius: 14, padding: 4, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          {(['expense', 'income'] as const).map(t => (
            <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))} style={{ flex: 1, padding: 10, borderRadius: 10, border: 'none', background: form.type === t ? (t === 'expense' ? COLORS.red : COLORS.green) : 'transparent', color: form.type === t ? '#fff' : '#888', fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>{t}</button>
          ))}
        </div>
        <div>
          <label htmlFor="budget-desc" style={fieldLabel}>Description</label>
          <input id="budget-desc" value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setStatus('idle'); }} placeholder="e.g. Coffee, Groceries..." style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: 'none', background: '#fff', fontSize: 16, color: COLORS.dark, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label htmlFor="budget-amount" style={fieldLabel}>Amount (£)</label>
          <input id="budget-amount" type="number" inputMode="decimal" min="0" step="0.01" value={form.amount} onChange={e => { setForm(f => ({ ...f, amount: e.target.value })); setStatus('idle'); }} onKeyDown={e => { if (e.key === 'Enter') handle(); }} placeholder="0.00" style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: 'none', background: '#fff', fontSize: 20, fontWeight: 700, color: COLORS.dark, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        {form.type === 'expense' && (
          <div>
            <span style={fieldLabel}>Category</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, cat: c }))} style={{ padding: 12, borderRadius: 12, border: 'none', background: form.cat === c ? COLORS.dark : '#fff', color: form.cat === c ? '#fff' : COLORS.dark, fontSize: 13, fontWeight: 500, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>{CAT_EMOJI[c]} {c}</button>
              ))}
            </div>
          </div>
        )}
        {status === 'error' && <p role="alert" style={{ fontSize: 12, color: COLORS.red, fontWeight: 600 }}>Add a description and an amount above £0.</p>}
        <button onClick={handle} style={{ width: '100%', padding: 16, borderRadius: 14, border: 'none', background: `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.blueDeep})`, color: '#fff', fontSize: 15, fontWeight: 700, marginTop: 8, boxShadow: `0 4px 16px ${COLORS.blue}55` }}>Add Transaction</button>
      </div>
    </div>
  );
}

// ── Trends screen ─────────────────────────────────────────────────────────────
function TrendsScreen({ summary, limits }: { summary: Summary; limits: Record<Category, number> }) {
  const data = [...PREVIOUS_MONTHS, { m: 'Nov', v: Math.round(summary.spent) }];
  const max = Math.max(...data.map(d => d.v), 1);
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: COLORS.bg, padding: 20 }}>
      <h2 style={screenTitle}>Spending Trends</h2>
      <p style={{ fontSize: 12, color: '#888', marginBottom: 24 }}>Last 4 months</p>
      <div style={{ background: '#fff', borderRadius: 20, padding: 20, marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: '#888', textTransform: 'uppercase', marginBottom: 16 }}>Monthly Spend</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 140, justifyContent: 'space-around' }}>
          {data.map((d, i) => {
            const h = (d.v / max) * 90;
            const latest = i === data.length - 1;
            return (
              <div key={d.m} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 6, height: '100%' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: latest ? COLORS.blue : '#888' }}>{money(d.v)}</p>
                <div style={{ width: 40, height: `${h}px`, minHeight: 8, background: latest ? `linear-gradient(180deg, ${COLORS.blue}, ${COLORS.blueDeep})` : '#E8E8E8', borderRadius: '6px 6px 0 0', transition: 'height 0.4s' }} />
                <p style={{ fontSize: 12, fontFamily: "'Caveat', cursive", fontWeight: 600, color: '#888' }}>{d.m}</p>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ background: '#fff', borderRadius: 20, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: '#888', textTransform: 'uppercase', marginBottom: 16 }}>Category Breakdown</p>
        {CATEGORIES.map(c => {
          const spent = summary.spentBy[c];
          const pct = summary.spent ? (spent / summary.spent) * 100 : 0;
          const over = spent > limits[c];
          return (
            <div key={c} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: COLORS.dark }}>{CAT_EMOJI[c]} {c}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.dark }}>{money(spent)} <span style={{ fontWeight: 400, color: '#aaa' }}>· {pct.toFixed(0)}%</span></span>
              </div>
              <div style={{ height: 6, background: COLORS.bg, borderRadius: 3 }}>
                <div style={{ height: '100%', width: `${pct}%`, background: over ? COLORS.red : COLORS.blue, borderRadius: 3, transition: 'width 0.4s' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Budget screen ─────────────────────────────────────────────────────────────
const LIMIT_STEP = 50;

function BudgetScreen({ summary, limits, onLimitChange }: { summary: Summary; limits: Record<Category, number>; onLimitChange: (c: Category, limit: number) => void }) {
  const totalPct = Math.min(summary.spent / summary.totalLimit, 1);
  const stepBtn = { width: 28, height: 28, borderRadius: 8, border: 'none', background: COLORS.bg, color: COLORS.dark, fontSize: 16, fontWeight: 600, lineHeight: 1 } as const;
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: COLORS.bg, padding: 20 }}>
      <h2 style={screenTitle}>Budget Limits</h2>
      <p style={{ fontSize: 12, color: '#888', marginBottom: 24 }}>November 2024 · tap − / + to adjust</p>
      <div style={{ background: `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.blueDeep})`, borderRadius: 20, padding: 20, marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', marginBottom: 8 }}>Total Budget</p>
        <p style={{ fontSize: 32, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{money(summary.totalLimit)}</p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
          {money(summary.spent)} spent · {summary.left >= 0 ? `${money(summary.left)} remaining` : `${money(-summary.left)} over`}
        </p>
        <div style={{ height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 3, marginTop: 14 }}>
          <div style={{ height: '100%', width: `${totalPct * 100}%`, background: '#fff', borderRadius: 3, transition: 'width 0.4s' }} />
        </div>
      </div>
      {CATEGORIES.map(c => {
        const spent = summary.spentBy[c];
        const limit = limits[c];
        const pct = Math.min(spent / limit, 1);
        const over = spent > limit;
        return (
          <div key={c} style={{ background: '#fff', borderRadius: 16, padding: '16px 18px', marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>{CAT_EMOJI[c]}</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: COLORS.dark }}>{c}</p>
                  <p style={{ fontSize: 11, color: '#999' }}>{money(spent / TODAY, 2)}/day</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button style={stepBtn} aria-label={`Lower ${c} limit`} disabled={limit <= LIMIT_STEP} onClick={() => onLimitChange(c, limit - LIMIT_STEP)}>−</button>
                <div style={{ textAlign: 'right', minWidth: 64 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: over ? COLORS.red : COLORS.dark }}>{money(spent)}</p>
                  <p style={{ fontSize: 11, color: '#999' }}>of {money(limit)}</p>
                </div>
                <button style={stepBtn} aria-label={`Raise ${c} limit`} onClick={() => onLimitChange(c, limit + LIMIT_STEP)}>+</button>
              </div>
            </div>
            <div style={{ height: 6, background: COLORS.bg, borderRadius: 3 }}>
              <div style={{ height: '100%', width: `${pct * 100}%`, background: over ? COLORS.red : pct > 0.8 ? '#F5A623' : COLORS.green, borderRadius: 3, transition: 'width 0.4s, background 0.3s' }} />
            </div>
            {over && <p style={{ fontSize: 11, color: COLORS.red, fontWeight: 600, marginTop: 6 }}>Over by {money(spent - limit, 2)}</p>}
          </div>
        );
      })}
    </div>
  );
}

// ── Savings screen ────────────────────────────────────────────────────────────
const TOP_UP = 50;

function SavingsScreen({ goals, onTopUp }: { goals: Goal[]; onTopUp: (index: number) => void }) {
  const total = goals.reduce((sum, g) => sum + g.saved, 0);
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: COLORS.bg, padding: 20 }}>
      <h2 style={screenTitle}>Savings Goals</h2>
      <p style={{ fontSize: 12, color: '#888', marginBottom: 24 }}>Track your progress</p>
      <div style={{ background: COLORS.dark, borderRadius: 20, padding: 20, marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: 8 }}>Total Saved</p>
        <p style={{ fontSize: 36, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{money(total)}</p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>across {goals.length} goals</p>
      </div>
      {goals.map((g, i) => {
        const pct = Math.min((g.saved / g.goal) * 100, 100);
        const done = g.saved >= g.goal;
        return (
          <div key={g.name} style={{ background: '#fff', borderRadius: 18, padding: '18px 20px', marginBottom: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: `${g.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{g.emoji}</div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: COLORS.dark, marginBottom: 2 }}>{g.name}</p>
                  <p style={{ fontSize: 12, color: '#999' }}>{pct.toFixed(0)}% complete</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: g.color }}>{money(g.saved)}</p>
                <p style={{ fontSize: 11, color: '#bbb' }}>of {money(g.goal)}</p>
              </div>
            </div>
            <div style={{ height: 8, background: COLORS.bg, borderRadius: 4 }}>
              <div style={{ height: '100%', width: `${pct}%`, background: g.color, borderRadius: 4, transition: 'width 0.4s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
              <p style={{ fontSize: 12, color: done ? g.color : '#aaa', fontWeight: done ? 600 : 400 }}>{done ? 'Goal reached 🎉' : `${money(g.goal - g.saved)} to go`}</p>
              {!done && (
                <button onClick={() => onTopUp(i)} style={{ padding: '6px 12px', borderRadius: 10, border: 'none', background: `${g.color}18`, color: g.color, fontSize: 12, fontWeight: 700 }}>+ {money(TOP_UP)}</button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Color Palette section ─────────────────────────────────────────────────────
function ColorPalette() {
  const swatches = [
    { name: 'Primary Blue', hex: '#3366FF' },
    { name: 'Header Blue', hex: '#1C53C6' },
    { name: 'Olive Green', hex: '#8B9A5E' },
    { name: 'Pink Badge', hex: '#F5C6D0' },
    { name: 'Yellow Badge', hex: '#E8D88E' },
    { name: 'Progress Green', hex: '#2ECC71' },
    { name: 'Warning Red', hex: '#E84B4B' },
    { name: 'Dark Navy', hex: '#1A1F3A' },
  ];
  return (
    <div>
      <h2 style={{ fontFamily: "'Caveat', cursive", fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Color Palette</h2>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 24, fontWeight: 300 }}>Design tokens extracted from the Budgeting app</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
        {swatches.map(s => (
          <div key={s.name} style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
            <div style={{ height: 80, background: s.hex }} />
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 12px' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{s.name}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace' }}>{s.hex}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Typography section ────────────────────────────────────────────────────────
function Typography() {
  const specs = [
    { label: 'Page Title', sample: 'Budget', font: 'Caveat Bold', size: '32px', style: { fontFamily: "'Caveat', cursive", fontSize: 32, fontWeight: 700, color: '#fff' } },
    { label: 'Card Heading', sample: '£4,250', font: 'Inter Bold', size: '28px', style: { fontFamily: 'Inter', fontSize: 28, fontWeight: 700, color: '#fff' } },
    { label: 'Section Label', sample: 'TOTAL BALANCE', font: 'Inter Semibold', size: '10px', style: { fontFamily: 'Inter', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.6)' } },
    { label: 'Body Amount', sample: '£35.00/day', font: 'Inter Bold', size: '16px', style: { fontFamily: 'Inter', fontSize: 16, fontWeight: 700, color: '#fff' } },
    { label: 'Body Text', sample: '£700 of £900', font: 'Inter Regular', size: '13px', style: { fontFamily: 'Inter', fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.6)' } },
    { label: 'Nav Label', sample: 'Home', font: 'Caveat Medium', size: '12px', style: { fontFamily: "'Caveat', cursive", fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.7)' } },
  ];
  return (
    <div>
      <h2 style={{ fontFamily: "'Caveat', cursive", fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Typography</h2>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 24, fontWeight: 300 }}>Font system: Caveat + Inter</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {specs.map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: 8 }}>{s.label}</p>
              <span style={s.style}>{s.sample}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>{s.font}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>{s.size}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function BudgetApp() {
  const [, setLocation] = useLocation();
  const [activeScreen, setActiveScreen] = useState<Screen>('home');
  const [focusSearch, setFocusSearch] = useState(false);
  const [txns, setTxns] = useState(INITIAL_TXNS);
  const [limits, setLimits] = useState(INITIAL_LIMITS);
  const [goals, setGoals] = useState(INITIAL_GOALS);
  const summary = summarise(txns, limits);

  const goTo = (screen: Screen) => { setFocusSearch(false); setActiveScreen(screen); };
  const openSearch = () => { setFocusSearch(true); setActiveScreen('details'); };
  const addTxn = (t: Omit<Txn, 'id' | 'day'>) =>
    setTxns(list => [...list, { ...t, id: Math.max(0, ...list.map(x => x.id)) + 1, day: TODAY }]);
  const deleteTxn = (id: number) => setTxns(list => list.filter(t => t.id !== id));
  const changeLimit = (c: Category, limit: number) => setLimits(l => ({ ...l, [c]: limit }));
  const topUp = (index: number) =>
    setGoals(gs => gs.map((g, i) => i === index ? { ...g, saved: Math.min(g.goal, g.saved + TOP_UP) } : g));

  const screenContent: Record<Screen, React.ReactNode> = {
    home: <HomeScreen summary={summary} limits={limits} onSearch={openSearch} />,
    details: <DetailsScreen txns={txns} focusSearch={focusSearch} onDelete={deleteTxn} />,
    add: <AddScreen onAdd={addTxn} />,
    trends: <TrendsScreen summary={summary} limits={limits} />,
    budget: <BudgetScreen summary={summary} limits={limits} onLimitChange={changeLimit} />,
    savings: <SavingsScreen goals={goals} onTopUp={topUp} />,
  };

  return (
    <div style={{
      width: '100vw', minHeight: '100vh',
      background: '#0a0a0a',
      fontFamily: 'Inter, sans-serif',
      overflowX: 'hidden',
    }}>
      {/* Back button */}
      <button
        className="liquid-glass"
        onClick={() => setLocation('/ui-design')}
        style={{
          position: 'fixed', top: 24, left: 24, zIndex: 200,
          borderRadius: 8, color: '#fff', fontFamily: "'Barlow', sans-serif",
          fontSize: '0.75rem', letterSpacing: '0.15em', padding: '8px 16px',
          transition: 'all 0.3s ease', fontWeight: '400',
        }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = 'inset 0 1px 1px rgba(255,255,255,0.2), 0 0 12px rgba(255,255,255,0.08)'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'inset 0 1px 1px rgba(255,255,255,0.1)'; }}
      >
        Back
      </button>

      {/* Page header */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px clamp(16px, 5vw, 40px) 60px' }}>
        <p style={{ fontSize: '0.65rem', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', fontFamily: "'Barlow', sans-serif", fontWeight: 300, marginBottom: 12 }}>UI DESIGN · CASE STUDY</p>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 'normal', color: '#fff', marginBottom: 16 }}>Budgeting App</h1>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', maxWidth: 560, lineHeight: 1.8, fontWeight: 300 }}>
          A mobile budgeting app with real-time spending tracking, category breakdowns, and savings goals. Built with a warm off-white palette, Caveat + Inter typography, and a blue-dominant design system.
        </p>
      </div>

      {/* Interactive phone + info */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(16px, 5vw, 40px) 80px', display: 'flex', gap: 60, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Phone */}
        <div style={{ flexShrink: 0, margin: '0 auto', width: 'min-content' }}>
          <FittedPhone>
            <PhoneShell activeScreen={activeScreen} onTabChange={goTo}>
              {screenContent[activeScreen]}
            </PhoneShell>
          </FittedPhone>
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.7rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textWrap: 'balance' }}>TRY IT — ADD AN EXPENSE, ADJUST A BUDGET, TOP UP A GOAL</p>
        </div>

        {/* Right column: color + typography */}
        <div style={{ flex: 1, minWidth: 'min(300px, 100%)', display: 'flex', flexDirection: 'column', gap: 60 }}>
          <ColorPalette />
          <Typography />
        </div>
      </div>
    </div>
  );
}
