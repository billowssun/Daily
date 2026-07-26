export type AccountType = 'cash' | 'bank' | 'wallet' | 'credit' | 'investment';
export type LoanDirection = 'lent' | 'borrowed';

export type Account = {
  id: string;
  name: string;
  institution: string;
  type: AccountType;
  balance: number;
  limit?: number;
  dueDay?: number;
  last4?: string;
  color: string;
  updatedAt: string;
};

export type Loan = {
  id: string;
  person: string;
  direction: LoanDirection;
  amount: number;
  repaid: number;
  dueDate: string;
  note: string;
  createdAt: string;
};

export type Snapshot = {
  id: string;
  date: string;
  assets: number;
  liabilities: number;
};

export type FinanceState = {
  accounts: Account[];
  loans: Loan[];
  snapshots: Snapshot[];
  monthlyIncome: number;
  emergencyTarget: number;
  currency: 'CNY';
};

export const accountTypeMeta: Record<AccountType, { label: string; short: string }> = {
  bank: { label: '银行卡', short: '银' },
  wallet: { label: '支付账户', short: '支' },
  cash: { label: '现金', short: '现' },
  investment: { label: '投资账户', short: '投' },
  credit: { label: '信用卡', short: '信' },
};

const now = new Date().toISOString();

export const defaultState: FinanceState = {
  accounts: [
    { id: 'a1', name: '工资卡', institution: '招商银行', type: 'bank', balance: 28680, last4: '6618', color: '#E24B4A', updatedAt: now },
    { id: 'a2', name: '日常账户', institution: '工商银行', type: 'bank', balance: 12360, last4: '2046', color: '#C73238', updatedAt: now },
    { id: 'a3', name: '零钱', institution: '微信支付', type: 'wallet', balance: 2380.56, color: '#20A162', updatedAt: now },
    { id: 'a4', name: '支付宝余额', institution: '支付宝', type: 'wallet', balance: 6840.2, color: '#1677FF', updatedAt: now },
    { id: 'a5', name: '应急现金', institution: '现金', type: 'cash', balance: 3000, color: '#A87944', updatedAt: now },
    { id: 'a6', name: '长期账户', institution: '基金账户', type: 'investment', balance: 45680, color: '#7667F8', updatedAt: now },
    { id: 'c1', name: '经典白金卡', institution: '招商银行', type: 'credit', balance: 3280.42, limit: 50000, dueDay: 9, last4: '8891', color: '#1E293B', updatedAt: now },
    { id: 'c2', name: '环球信用卡', institution: '建设银行', type: 'credit', balance: 1860, limit: 30000, dueDay: 18, last4: '4072', color: '#3156A3', updatedAt: now },
  ],
  loans: [
    { id: 'l1', person: '陈宇', direction: 'lent', amount: 8000, repaid: 2000, dueDate: '2026-08-15', note: '装修周转', createdAt: now },
    { id: 'l2', person: '父母', direction: 'borrowed', amount: 20000, repaid: 5000, dueDate: '2026-12-31', note: '购车借款', createdAt: now },
  ],
  snapshots: [
    { id: 's1', date: '2026-02-01', assets: 82600, liabilities: 23100 },
    { id: 's2', date: '2026-03-01', assets: 87100, liabilities: 21800 },
    { id: 's3', date: '2026-04-01', assets: 90200, liabilities: 20300 },
    { id: 's4', date: '2026-05-01', assets: 93600, liabilities: 19700 },
    { id: 's5', date: '2026-06-01', assets: 95600, liabilities: 18900 },
  ],
  monthlyIncome: 18000,
  emergencyTarget: 54000,
  currency: 'CNY',
};

export function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function remainingLoan(loan: Loan) {
  return Math.max(0, loan.amount - loan.repaid);
}

export function calculate(state: FinanceState) {
  const liquid = state.accounts
    .filter((account) => account.type !== 'credit' && account.type !== 'investment')
    .reduce((sum, account) => sum + account.balance, 0);
  const investments = state.accounts
    .filter((account) => account.type === 'investment')
    .reduce((sum, account) => sum + account.balance, 0);
  const creditDebt = state.accounts
    .filter((account) => account.type === 'credit')
    .reduce((sum, account) => sum + account.balance, 0);
  const creditLimit = state.accounts
    .filter((account) => account.type === 'credit')
    .reduce((sum, account) => sum + (account.limit ?? 0), 0);
  const receivables = state.loans
    .filter((loan) => loan.direction === 'lent')
    .reduce((sum, loan) => sum + remainingLoan(loan), 0);
  const borrowings = state.loans
    .filter((loan) => loan.direction === 'borrowed')
    .reduce((sum, loan) => sum + remainingLoan(loan), 0);
  const assets = liquid + investments + receivables;
  const liabilities = creditDebt + borrowings;
  const netWorth = assets - liabilities;
  const utilization = creditLimit > 0 ? creditDebt / creditLimit : 0;
  const emergencyProgress = state.emergencyTarget > 0 ? Math.min(1, liquid / state.emergencyTarget) : 0;
  const debtRatio = assets > 0 ? liabilities / assets : 0;
  const healthScore = Math.max(
    0,
    Math.min(100, Math.round(82 + Math.min(10, emergencyProgress * 10) - utilization * 18 - debtRatio * 25)),
  );

  return {
    liquid,
    investments,
    creditDebt,
    creditLimit,
    receivables,
    borrowings,
    assets,
    liabilities,
    netWorth,
    utilization,
    emergencyProgress,
    debtRatio,
    healthScore,
  };
}

export function addSnapshot(state: FinanceState): FinanceState {
  const totals = calculate(state);
  const date = new Date().toISOString().slice(0, 10);
  const snapshot: Snapshot = {
    id: uid('snapshot'),
    date,
    assets: totals.assets,
    liabilities: totals.liabilities,
  };
  const withoutToday = state.snapshots.filter((item) => item.date !== date);
  return { ...state, snapshots: [...withoutToday, snapshot].slice(-12) };
}

export function formatMoney(value: number, hidden = false, compact = false) {
  if (hidden) return '••••••';
  if (compact && Math.abs(value) >= 10000) return `¥${(value / 10000).toFixed(1)}万`;
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(value: string) {
  if (!value) return '未设置';
  const date = new Date(`${value}T00:00:00`);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

export function daysUntil(value: string) {
  if (!value) return Number.POSITIVE_INFINITY;
  const due = new Date(`${value}T23:59:59`).getTime();
  return Math.ceil((due - Date.now()) / 86_400_000);
}
