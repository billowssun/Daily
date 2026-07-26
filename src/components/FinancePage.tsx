import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Building2,
  Check,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Eye,
  EyeOff,
  HandCoins,
  Landmark,
  LayoutDashboard,
  MoreHorizontal,
  Pencil,
  PiggyBank,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  WalletCards,
  X,
} from 'lucide-react-native';
import {
  Account,
  AccountType,
  FinanceState,
  Loan,
  LoanDirection,
  accountTypeMeta,
  addSnapshot,
  calculate,
  daysUntil,
  defaultState,
  formatDate,
  formatMoney,
  remainingLoan,
  uid,
} from '../finance';

type PageKey = 'overview' | 'accounts' | 'loans' | 'insights' | 'settings';
type IconType = typeof LayoutDashboard;

const STORAGE_KEY = '@caixu/finance-v2';

const C = {
  ink: '#15231D',
  ink2: '#34443C',
  muted: '#718078',
  faint: '#A6B0AA',
  canvas: '#F4F6F2',
  surface: '#FFFFFF',
  line: '#E3E8E3',
  green: '#0F7A52',
  greenDark: '#0A5138',
  greenSoft: '#E8F4EE',
  lime: '#CFEA80',
  orange: '#E57B45',
  orangeSoft: '#FFF0E7',
  red: '#D95454',
  redSoft: '#FCECEC',
  purple: '#7567D8',
  purpleSoft: '#F0EEFB',
  blue: '#3576C3',
  blueSoft: '#EAF2FB',
  white: '#FFFFFF',
};

const accountColors = ['#0F7A52', '#1677FF', '#E24B4A', '#7667F8', '#A87944', '#1E293B'];

function confirmAction(title: string, message: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (globalThis.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: '取消', style: 'cancel' },
    { text: '确认', style: 'destructive', onPress: onConfirm },
  ]);
}

const navItems: { key: PageKey; label: string; icon: IconType }[] = [
  { key: 'overview', label: '经济看板', icon: LayoutDashboard },
  { key: 'accounts', label: '我的账户', icon: WalletCards },
  { key: 'loans', label: '借入借出', icon: HandCoins },
  { key: 'insights', label: '财务分析', icon: BarChart3 },
  { key: 'settings', label: '偏好设置', icon: Settings },
];

export function FinancePage({ onBack }: { onBack: () => void }) {
  const { width } = useWindowDimensions();
  const desktop = width >= 980;
  const [page, setPage] = useState<PageKey>('overview');
  const [finance, setFinance] = useState<FinanceState>(defaultState);
  const [ready, setReady] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [accountEditor, setAccountEditor] = useState<Account | 'new' | null>(null);
  const [loanEditor, setLoanEditor] = useState<Loan | 'new' | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored) {
          const parsed = JSON.parse(stored) as FinanceState;
          if (Array.isArray(parsed.accounts) && Array.isArray(parsed.loans)) setFinance(parsed);
        }
      })
      .catch(() => setToast('本地数据读取失败，已载入默认内容'))
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(finance)).catch(() => setToast('保存失败，请稍后重试'));
  }, [finance, ready]);

  const totals = useMemo(() => calculate(finance), [finance]);

  const notify = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 2200);
  };

  const commit = (next: FinanceState, message: string) => {
    setFinance(addSnapshot(next));
    notify(message);
  };

  const saveAccount = (account: Account) => {
    const exists = finance.accounts.some((item) => item.id === account.id);
    const accounts = exists
      ? finance.accounts.map((item) => (item.id === account.id ? account : item))
      : [...finance.accounts, account];
    commit({ ...finance, accounts }, exists ? '账户已更新' : '账户已添加');
    setAccountEditor(null);
  };

  const removeAccount = (id: string) => {
    confirmAction('删除账户？', '这只会删除当前余额账户，不会影响其他数据。', () => {
      commit({ ...finance, accounts: finance.accounts.filter((item) => item.id !== id) }, '账户已删除');
      setAccountEditor(null);
    });
  };

  const saveLoan = (loan: Loan) => {
    const exists = finance.loans.some((item) => item.id === loan.id);
    const loans = exists
      ? finance.loans.map((item) => (item.id === loan.id ? loan : item))
      : [...finance.loans, loan];
    commit({ ...finance, loans }, exists ? '借贷记录已更新' : '借贷记录已添加');
    setLoanEditor(null);
  };

  const removeLoan = (id: string) => {
    confirmAction('删除记录？', '删除后无法恢复。', () => {
      commit({ ...finance, loans: finance.loans.filter((item) => item.id !== id) }, '记录已删除');
      setLoanEditor(null);
    });
  };

  const resetData = () => {
    confirmAction('恢复示例数据？', '当前所有账户、借贷与设置会被替换。', () => {
      setFinance(defaultState);
      notify('已恢复示例数据');
    });
  };

  if (!ready) {
    return (
      <View style={styles.loading}>
        <View style={styles.logoMark}><TrendingUp size={24} color={C.greenDark} /></View>
        <ActivityIndicator color={C.green} />
        <Text style={styles.loadingText}>正在整理你的经济全貌</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.app}>
      <StatusBar style="dark" />
      {desktop ? <Sidebar active={page} onChange={setPage} totals={totals} hidden={hidden} onBack={onBack} /> : null}
      <View style={[styles.shell, desktop && styles.shellDesktop]}>
        {!desktop ? (
          <MobileHeader hidden={hidden} onToggleHidden={() => setHidden((value) => !value)} onAdd={() => setAccountEditor('new')} onBack={onBack} />
        ) : null}
        <View style={styles.main}>
          {page === 'overview' ? (
            <Overview
              finance={finance}
              hidden={hidden}
              desktop={desktop}
              onToggleHidden={() => setHidden((value) => !value)}
              onAddAccount={() => setAccountEditor('new')}
              onAddLoan={() => setLoanEditor('new')}
              onOpenAccounts={() => setPage('accounts')}
              onEditAccount={setAccountEditor}
              onEditLoan={setLoanEditor}
            />
          ) : null}
          {page === 'accounts' ? (
            <Accounts finance={finance} hidden={hidden} desktop={desktop} onAdd={() => setAccountEditor('new')} onEdit={setAccountEditor} />
          ) : null}
          {page === 'loans' ? (
            <Loans finance={finance} hidden={hidden} desktop={desktop} onAdd={() => setLoanEditor('new')} onEdit={setLoanEditor} />
          ) : null}
          {page === 'insights' ? <Insights finance={finance} hidden={hidden} desktop={desktop} /> : null}
          {page === 'settings' ? (
            <Preferences
              finance={finance}
              onSave={(next) => {
                setFinance(next);
                notify('设置已保存');
              }}
              onReset={resetData}
              desktop={desktop}
            />
          ) : null}
        </View>
        {!desktop ? <BottomNav active={page} onChange={setPage} /> : null}
      </View>

      <AccountModal
        value={accountEditor}
        onClose={() => setAccountEditor(null)}
        onSave={saveAccount}
        onDelete={removeAccount}
      />
      <LoanModal value={loanEditor} onClose={() => setLoanEditor(null)} onSave={saveLoan} onDelete={removeLoan} />
      {toast ? (
        <View style={styles.toast}>
          <Check size={16} color={C.white} />
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function Sidebar({
  active,
  onChange,
  totals,
  hidden,
  onBack,
}: {
  active: PageKey;
  onChange: (key: PageKey) => void;
  totals: ReturnType<typeof calculate>;
  hidden: boolean;
  onBack: () => void;
}) {
  return (
    <View style={styles.sidebar}>
      <Pressable accessibilityRole="button" onPress={onBack} style={styles.backButton}>
        <ArrowLeft size={16} color={C.lime} />
        <Text style={styles.backButtonText}>返回日序</Text>
      </Pressable>
      <View style={styles.brand}>
        <View style={styles.logoMark}><TrendingUp size={23} color={C.greenDark} strokeWidth={2.7} /></View>
        <View><Text style={styles.brandName}>财序</Text><Text style={styles.brandSub}>个人经济中枢</Text></View>
      </View>
      <View style={styles.navList}>
        {navItems.map(({ key, label, icon: Icon }) => {
          const selected = key === active;
          return (
            <Pressable key={key} onPress={() => onChange(key)} style={({ pressed }) => [styles.navItem, selected && styles.navItemActive, pressed && styles.pressed]}>
              <Icon size={19} color={selected ? C.white : '#AFC0B8'} />
              <Text style={[styles.navText, selected && styles.navTextActive]}>{label}</Text>
              {selected ? <ChevronRight size={16} color={C.lime} /> : null}
            </Pressable>
          );
        })}
      </View>
      <View style={styles.sideSummary}>
        <Text style={styles.sideSummaryLabel}>当前净资产</Text>
        <Text style={styles.sideSummaryValue}>{formatMoney(totals.netWorth, hidden, true)}</Text>
        <View style={styles.sideSummaryRow}><ShieldCheck size={14} color={C.lime} /><Text style={styles.sideSummaryHint}>数据仅保存在本机</Text></View>
      </View>
    </View>
  );
}

function MobileHeader({
  hidden,
  onToggleHidden,
  onAdd,
  onBack,
}: {
  hidden: boolean;
  onToggleHidden: () => void;
  onAdd: () => void;
  onBack: () => void;
}) {
  return (
    <View style={styles.mobileHeader}>
      <Pressable accessibilityRole="button" accessibilityLabel="返回日序" onPress={onBack} style={styles.brand}>
        <ArrowLeft size={18} color={C.greenDark} />
        <View style={styles.mobileLogo}><TrendingUp size={19} color={C.greenDark} /></View>
        <Text style={styles.mobileBrand}>财序</Text>
      </Pressable>
      <View style={styles.headerButtons}>
        <IconButton icon={hidden ? EyeOff : Eye} onPress={onToggleHidden} label="隐藏金额" />
        <IconButton icon={Plus} onPress={onAdd} label="新增账户" filled />
      </View>
    </View>
  );
}

function BottomNav({ active, onChange }: { active: PageKey; onChange: (key: PageKey) => void }) {
  return (
    <View style={styles.bottomNav}>
      {navItems.map(({ key, label, icon: Icon }) => {
        const selected = active === key;
        return (
          <Pressable key={key} onPress={() => onChange(key)} style={styles.bottomItem}>
            <Icon size={20} color={selected ? C.green : C.faint} strokeWidth={selected ? 2.6 : 2} />
            <Text style={[styles.bottomText, selected && styles.bottomTextActive]}>
              {key === 'overview' ? '看板' : key === 'accounts' ? '账户' : key === 'loans' ? '往来' : key === 'insights' ? '分析' : '设置'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function PageHeader({
  eyebrow,
  title,
  description,
  action,
  onAction,
  desktop,
  secondary,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: string;
  onAction?: () => void;
  desktop: boolean;
  secondary?: React.ReactNode;
}) {
  return (
    <View style={[styles.pageHeader, !desktop && styles.pageHeaderMobile]}>
      <View style={styles.pageHeading}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={[styles.pageTitle, !desktop && styles.pageTitleMobile]}>{title}</Text>
        <Text style={styles.pageDescription}>{description}</Text>
      </View>
      <View style={styles.pageActions}>
        {secondary}
        {action && onAction ? <PrimaryButton label={action} icon={Plus} onPress={onAction} /> : null}
      </View>
    </View>
  );
}

function Overview({
  finance,
  hidden,
  desktop,
  onToggleHidden,
  onAddAccount,
  onAddLoan,
  onOpenAccounts,
  onEditAccount,
  onEditLoan,
}: {
  finance: FinanceState;
  hidden: boolean;
  desktop: boolean;
  onToggleHidden: () => void;
  onAddAccount: () => void;
  onAddLoan: () => void;
  onOpenAccounts: () => void;
  onEditAccount: (account: Account) => void;
  onEditLoan: (loan: Loan) => void;
}) {
  const totals = calculate(finance);
  const assets = finance.accounts.filter((account) => account.type !== 'credit').sort((a, b) => b.balance - a.balance);
  const upcoming = finance.loans
    .filter((loan) => remainingLoan(loan) > 0)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 3);

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <PageHeader
        eyebrow="经济看板"
        title="早上好，今天的钱也要心里有数"
        description="不用记每一笔，只维护余额，就能看清资产、负债和人情往来。"
        desktop={desktop}
        action="添加账户"
        onAction={onAddAccount}
        secondary={desktop ? <IconButton icon={hidden ? EyeOff : Eye} onPress={onToggleHidden} label="隐藏金额" /> : undefined}
      />

      <View style={[styles.hero, !desktop && styles.heroMobile]}>
        <View style={styles.heroGlowOne} />
        <View style={styles.heroGlowTwo} />
        <View style={styles.heroMain}>
          <View style={styles.heroLabelRow}><Text style={styles.heroLabel}>净资产</Text><View style={styles.liveDot} /><Text style={styles.liveText}>已汇总 {finance.accounts.length} 个账户</Text></View>
          <Text style={[styles.heroValue, !desktop && styles.heroValueMobile]}>{formatMoney(totals.netWorth, hidden)}</Text>
          <View style={styles.heroTrend}><TrendingUp size={15} color={C.lime} /><Text style={styles.heroTrendText}>资产负债结构健康 · 本月已生成快照</Text></View>
        </View>
        <View style={[styles.heroStats, !desktop && styles.heroStatsMobile]}>
          <HeroStat label="总资产" value={formatMoney(totals.assets, hidden, true)} />
          <View style={styles.heroDivider} />
          <HeroStat label="总负债" value={formatMoney(totals.liabilities, hidden, true)} tone="warm" />
          <View style={styles.heroDivider} />
          <HeroStat label="健康分" value={`${totals.healthScore}`} suffix="/100" />
        </View>
      </View>

      <View style={styles.metricGrid}>
        <MetricCard icon={WalletCards} label="可用现金流" value={formatMoney(totals.liquid, hidden)} detail={`应急金完成 ${Math.round(totals.emergencyProgress * 100)}%`} color={C.green} soft={C.greenSoft} />
        <MetricCard icon={CreditCard} label="信用卡待还" value={formatMoney(totals.creditDebt, hidden)} detail={`额度使用 ${Math.round(totals.utilization * 100)}%`} color={C.orange} soft={C.orangeSoft} />
        <MetricCard icon={ArrowUpRight} label="待收回" value={formatMoney(totals.receivables, hidden)} detail={`${finance.loans.filter((loan) => loan.direction === 'lent' && remainingLoan(loan) > 0).length} 笔借出`} color={C.blue} soft={C.blueSoft} />
        <MetricCard icon={ArrowDownLeft} label="借入未还" value={formatMoney(totals.borrowings, hidden)} detail={`${finance.loans.filter((loan) => loan.direction === 'borrowed' && remainingLoan(loan) > 0).length} 笔借入`} color={C.purple} soft={C.purpleSoft} />
      </View>

      <View style={[styles.dashboardColumns, !desktop && styles.stack]}>
        <SectionCard style={styles.flexWide}>
          <SectionHeading title="资金分布" subtitle="当前可支配资金与长期资产" action="全部账户" onAction={onOpenAccounts} />
          <View style={[styles.allocationBody, !desktop && styles.allocationMobile]}>
            <DonutChart
              total={totals.assets}
              segments={[
                { value: totals.liquid, color: C.green },
                { value: totals.investments, color: C.purple },
                { value: totals.receivables, color: C.blue },
              ]}
              center={formatMoney(totals.assets, hidden, true)}
              label="总资产"
            />
            <View style={styles.allocationLegend}>
              <LegendRow label="现金与支付账户" value={totals.liquid} total={totals.assets} color={C.green} hidden={hidden} />
              <LegendRow label="长期投资" value={totals.investments} total={totals.assets} color={C.purple} hidden={hidden} />
              <LegendRow label="借出待收" value={totals.receivables} total={totals.assets} color={C.blue} hidden={hidden} />
            </View>
          </View>
        </SectionCard>

        <SectionCard style={styles.flexNarrow}>
          <SectionHeading title="经济体检" subtitle="根据当前余额自动评估" />
          <View style={styles.healthTop}>
            <View style={styles.scoreRing}><Text style={styles.score}>{totals.healthScore}</Text><Text style={styles.scoreUnit}>分</Text></View>
            <View style={styles.healthCopy}><Text style={styles.healthTitle}>{totals.healthScore >= 80 ? '状态稳健' : '仍有优化空间'}</Text><Text style={styles.healthText}>现金覆盖较好，信用额度使用率保持在低位。</Text></View>
          </View>
          <HealthRow label="负债率" value={totals.debtRatio} good={totals.debtRatio < 0.35} />
          <HealthRow label="信用使用率" value={totals.utilization} good={totals.utilization < 0.3} />
          <HealthRow label="应急资金" value={totals.emergencyProgress} good={totals.emergencyProgress >= 0.8} />
        </SectionCard>
      </View>

      <View style={[styles.dashboardColumns, !desktop && styles.stack]}>
        <SectionCard style={styles.flexWide}>
          <SectionHeading title="常用账户" subtitle="点击卡片即可更新余额" action="新增" onAction={onAddAccount} />
          <View style={styles.accountMiniGrid}>
            {assets.slice(0, 4).map((account) => (
              <Pressable key={account.id} onPress={() => onEditAccount(account)} style={({ pressed }) => [styles.miniAccount, pressed && styles.pressed]}>
                <View style={[styles.accountIcon, { backgroundColor: `${account.color}16` }]}><Text style={[styles.accountIconText, { color: account.color }]}>{accountTypeMeta[account.type].short}</Text></View>
                <View style={styles.miniAccountInfo}><Text style={styles.miniAccountName}>{account.name}</Text><Text style={styles.miniAccountMeta}>{account.institution}{account.last4 ? ` · ${account.last4}` : ''}</Text></View>
                <Text style={styles.miniAccountValue}>{formatMoney(account.balance, hidden, true)}</Text>
                <ChevronRight size={16} color={C.faint} />
              </Pressable>
            ))}
          </View>
        </SectionCard>

        <SectionCard style={styles.flexNarrow}>
          <SectionHeading title="近期往来" subtitle="借入借出到期提醒" action="新增" onAction={onAddLoan} />
          {upcoming.length ? upcoming.map((loan) => (
            <Pressable key={loan.id} onPress={() => onEditLoan(loan)} style={styles.upcomingRow}>
              <View style={[styles.directionIcon, { backgroundColor: loan.direction === 'lent' ? C.blueSoft : C.purpleSoft }]}>
                {loan.direction === 'lent' ? <ArrowUpRight size={17} color={C.blue} /> : <ArrowDownLeft size={17} color={C.purple} />}
              </View>
              <View style={styles.upcomingInfo}><Text style={styles.upcomingName}>{loan.person}</Text><Text style={styles.upcomingDate}>{formatDate(loan.dueDate)} · {loan.direction === 'lent' ? '待收回' : '待归还'}</Text></View>
              <Text style={styles.upcomingValue}>{formatMoney(remainingLoan(loan), hidden, true)}</Text>
            </Pressable>
          )) : <EmptyState compact title="暂无待处理往来" text="借入或借出后，会在这里提醒。" />}
        </SectionCard>
      </View>
    </ScrollView>
  );
}

function Accounts({
  finance,
  hidden,
  desktop,
  onAdd,
  onEdit,
}: {
  finance: FinanceState;
  hidden: boolean;
  desktop: boolean;
  onAdd: () => void;
  onEdit: (account: Account) => void;
}) {
  const [filter, setFilter] = useState<'all' | 'asset' | 'credit'>('all');
  const [search, setSearch] = useState('');
  const totals = calculate(finance);
  const accounts = finance.accounts.filter((account) => {
    const matchesType = filter === 'all' || (filter === 'credit' ? account.type === 'credit' : account.type !== 'credit');
    const needle = search.trim().toLowerCase();
    return matchesType && (!needle || `${account.name}${account.institution}${account.last4 ?? ''}`.toLowerCase().includes(needle));
  });

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <PageHeader eyebrow="账户中心" title="所有余额，一处维护" description="只记录账户当前余额，不记录消费流水。" desktop={desktop} action="添加账户" onAction={onAdd} />
      <View style={styles.summaryStrip}>
        <SummaryBlock label="资产账户" value={formatMoney(totals.liquid + totals.investments, hidden)} color={C.green} />
        <SummaryBlock label="信用卡负债" value={formatMoney(totals.creditDebt, hidden)} color={C.orange} />
        <SummaryBlock label="账户数量" value={`${finance.accounts.length} 个`} color={C.ink} />
      </View>
      <View style={[styles.toolbar, !desktop && styles.toolbarMobile]}>
        <View style={styles.segment}>
          {([['all', '全部'], ['asset', '资产'], ['credit', '信用卡']] as const).map(([key, label]) => (
            <Pressable key={key} onPress={() => setFilter(key)} style={[styles.segmentItem, filter === key && styles.segmentItemActive]}>
              <Text style={[styles.segmentText, filter === key && styles.segmentTextActive]}>{label}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.searchBox}><Search size={18} color={C.faint} /><TextInput value={search} onChangeText={setSearch} placeholder="搜索账户或尾号" placeholderTextColor={C.faint} style={styles.searchInput} /></View>
      </View>
      {accounts.length ? (
        <View style={styles.accountGrid}>
          {accounts.map((account) => <AccountCard key={account.id} account={account} hidden={hidden} onPress={() => onEdit(account)} />)}
        </View>
      ) : <EmptyState title="没有找到匹配账户" text="换个关键词，或添加一个新账户。" action="添加账户" onAction={onAdd} />}
    </ScrollView>
  );
}

function AccountCard({ account, hidden, onPress }: { account: Account; hidden: boolean; onPress: () => void }) {
  const credit = account.type === 'credit';
  const usage = credit && account.limit ? Math.min(1, account.balance / account.limit) : 0;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.accountCard, pressed && styles.cardPressed]}>
      <View style={[styles.cardAccent, { backgroundColor: account.color }]} />
      <View style={styles.accountCardTop}>
        <View style={[styles.accountIconLarge, { backgroundColor: `${account.color}16` }]}><Text style={[styles.accountIconLargeText, { color: account.color }]}>{accountTypeMeta[account.type].short}</Text></View>
        <View style={styles.accountCardInfo}><Text style={styles.accountCardName}>{account.name}</Text><Text style={styles.accountCardMeta}>{account.institution} · {accountTypeMeta[account.type].label}{account.last4 ? ` · ${account.last4}` : ''}</Text></View>
        <MoreHorizontal size={20} color={C.faint} />
      </View>
      <Text style={styles.balanceLabel}>{credit ? '当前应还' : '当前余额'}</Text>
      <Text style={[styles.accountBalance, credit && { color: C.orange }]}>{formatMoney(account.balance, hidden)}</Text>
      {credit ? (
        <View style={styles.creditInfo}>
          <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.round(usage * 100)}%`, backgroundColor: usage > 0.5 ? C.orange : C.green }]} /></View>
          <View style={styles.creditFooter}><Text style={styles.accountFootText}>额度 {formatMoney(account.limit ?? 0, hidden, true)}</Text><Text style={styles.accountFootText}>{account.dueDay ? `每月 ${account.dueDay} 日还款 · ` : ''}使用 {Math.round(usage * 100)}%</Text></View>
        </View>
      ) : (
        <View style={styles.accountFooter}><Text style={styles.accountFootText}>刚刚更新</Text><View style={styles.editHint}><Pencil size={13} color={C.green} /><Text style={styles.editHintText}>更新余额</Text></View></View>
      )}
    </Pressable>
  );
}

function Loans({
  finance,
  hidden,
  desktop,
  onAdd,
  onEdit,
}: {
  finance: FinanceState;
  hidden: boolean;
  desktop: boolean;
  onAdd: () => void;
  onEdit: (loan: Loan) => void;
}) {
  const [filter, setFilter] = useState<'all' | LoanDirection>('all');
  const totals = calculate(finance);
  const loans = finance.loans.filter((loan) => filter === 'all' || loan.direction === filter);

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <PageHeader eyebrow="人情往来" title="借入借出，清楚不尴尬" description="记住本金、已还金额和约定日期，不做流水账。" desktop={desktop} action="新增往来" onAction={onAdd} />
      <View style={styles.loanHeroGrid}>
        <View style={[styles.loanSummary, { backgroundColor: C.blueSoft }]}><View style={styles.loanSummaryIcon}><ArrowUpRight size={22} color={C.blue} /></View><View><Text style={styles.loanSummaryLabel}>待收回</Text><Text style={[styles.loanSummaryValue, { color: C.blue }]}>{formatMoney(totals.receivables, hidden)}</Text></View></View>
        <View style={[styles.loanSummary, { backgroundColor: C.purpleSoft }]}><View style={styles.loanSummaryIcon}><ArrowDownLeft size={22} color={C.purple} /></View><View><Text style={styles.loanSummaryLabel}>待归还</Text><Text style={[styles.loanSummaryValue, { color: C.purple }]}>{formatMoney(totals.borrowings, hidden)}</Text></View></View>
      </View>
      <View style={styles.segment}>
        {([['all', '全部'], ['lent', '我借出'], ['borrowed', '我借入']] as const).map(([key, label]) => (
          <Pressable key={key} onPress={() => setFilter(key)} style={[styles.segmentItem, filter === key && styles.segmentItemActive]}>
            <Text style={[styles.segmentText, filter === key && styles.segmentTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>
      {loans.length ? (
        <View style={styles.loanList}>
          {loans.map((loan) => <LoanRow key={loan.id} loan={loan} hidden={hidden} onPress={() => onEdit(loan)} />)}
        </View>
      ) : <EmptyState title="这里还没有记录" text="添加借入或借出，系统会自动计入资产负债。" action="新增往来" onAction={onAdd} />}
    </ScrollView>
  );
}

function LoanRow({ loan, hidden, onPress }: { loan: Loan; hidden: boolean; onPress: () => void }) {
  const remaining = remainingLoan(loan);
  const progress = loan.amount > 0 ? Math.min(1, loan.repaid / loan.amount) : 0;
  const days = daysUntil(loan.dueDate);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.loanRow, pressed && styles.cardPressed]}>
      <View style={[styles.loanAvatar, { backgroundColor: loan.direction === 'lent' ? C.blueSoft : C.purpleSoft }]}>
        <Text style={[styles.loanAvatarText, { color: loan.direction === 'lent' ? C.blue : C.purple }]}>{loan.person.slice(0, 1)}</Text>
      </View>
      <View style={styles.loanMain}>
        <View style={styles.loanTitleRow}><Text style={styles.loanPerson}>{loan.person}</Text><View style={[styles.typePill, { backgroundColor: loan.direction === 'lent' ? C.blueSoft : C.purpleSoft }]}><Text style={[styles.typePillText, { color: loan.direction === 'lent' ? C.blue : C.purple }]}>{loan.direction === 'lent' ? '我借出' : '我借入'}</Text></View></View>
        <Text style={styles.loanNote}>{loan.note || '未填写备注'} · {formatDate(loan.dueDate)}到期</Text>
        <View style={styles.loanProgressRow}><View style={styles.loanTrack}><View style={[styles.loanFill, { width: `${Math.round(progress * 100)}%` }]} /></View><Text style={styles.loanProgressText}>已处理 {Math.round(progress * 100)}%</Text></View>
      </View>
      <View style={styles.loanAmountBlock}><Text style={styles.loanAmount}>{formatMoney(remaining, hidden)}</Text><Text style={[styles.dueText, days < 14 && { color: C.orange }]}>{remaining === 0 ? '已结清' : days < 0 ? `逾期 ${Math.abs(days)} 天` : `剩 ${days} 天`}</Text></View>
    </Pressable>
  );
}

function Insights({ finance, hidden, desktop }: { finance: FinanceState; hidden: boolean; desktop: boolean }) {
  const totals = calculate(finance);
  const snapshots = [...finance.snapshots, {
    id: 'current',
    date: new Date().toISOString().slice(0, 10),
    assets: totals.assets,
    liabilities: totals.liabilities,
  }].slice(-6);
  const assetByType = (Object.keys(accountTypeMeta) as AccountType[])
    .filter((type) => type !== 'credit')
    .map((type) => ({
      type,
      value: finance.accounts.filter((item) => item.type === type).reduce((sum, item) => sum + item.balance, 0),
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);
  const maxType = Math.max(...assetByType.map((item) => item.value), 1);

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <PageHeader eyebrow="财务分析" title="看趋势，不看流水" description="通过余额快照判断你的经济结构是否在变好。" desktop={desktop} />
      <View style={[styles.insightGrid, !desktop && styles.stack]}>
        <SectionCard style={styles.flexWide}>
          <SectionHeading title="净资产趋势" subtitle="最近 6 次余额快照" />
          <TrendChart snapshots={snapshots} hidden={hidden} />
        </SectionCard>
        <SectionCard style={styles.flexNarrow}>
          <SectionHeading title="财务健康度" subtitle="结构化评分，非投资建议" />
          <View style={styles.bigScoreBlock}><Text style={styles.bigScore}>{totals.healthScore}</Text><View><Text style={styles.bigScoreTitle}>{totals.healthScore >= 80 ? '优秀' : totals.healthScore >= 65 ? '良好' : '需要关注'}</Text><Text style={styles.bigScoreText}>超过建议基准</Text></View></View>
          <HealthRow label="现金储备" value={totals.emergencyProgress} good={totals.emergencyProgress >= 0.8} />
          <HealthRow label="低负债结构" value={1 - totals.debtRatio} good={totals.debtRatio < 0.35} />
          <HealthRow label="信用额度余量" value={1 - totals.utilization} good={totals.utilization < 0.3} />
        </SectionCard>
      </View>
      <View style={[styles.insightGrid, !desktop && styles.stack]}>
        <SectionCard style={styles.flexWide}>
          <SectionHeading title="资产构成" subtitle="按账户类型汇总" />
          <View style={styles.barList}>
            {assetByType.map((item) => (
              <View key={item.type} style={styles.barRow}>
                <View style={styles.barLabelRow}><Text style={styles.barLabel}>{accountTypeMeta[item.type].label}</Text><Text style={styles.barValue}>{formatMoney(item.value, hidden, true)}</Text></View>
                <View style={styles.horizontalTrack}><View style={[styles.horizontalFill, { width: `${Math.max(7, item.value / maxType * 100)}%` }]} /></View>
              </View>
            ))}
          </View>
        </SectionCard>
        <SectionCard style={styles.flexNarrow}>
          <SectionHeading title="本月建议" subtitle="基于当前余额自动生成" />
          <InsightTip icon={PiggyBank} color={C.green} title="继续补足应急金" text={`当前可用现金覆盖目标的 ${Math.round(totals.emergencyProgress * 100)}%，优先保证 3 个月储备。`} />
          <InsightTip icon={CreditCard} color={C.orange} title="信用卡使用健康" text={`总额度使用率 ${Math.round(totals.utilization * 100)}%，继续全额按时还款。`} />
          <InsightTip icon={HandCoins} color={C.blue} title="关注到期往来" text={`当前待收回 ${formatMoney(totals.receivables, hidden, true)}，建议到期前友好提醒。`} />
        </SectionCard>
      </View>
    </ScrollView>
  );
}

function Preferences({
  finance,
  onSave,
  onReset,
  desktop,
}: {
  finance: FinanceState;
  onSave: (next: FinanceState) => void;
  onReset: () => void;
  desktop: boolean;
}) {
  const [income, setIncome] = useState(String(finance.monthlyIncome));
  const [emergency, setEmergency] = useState(String(finance.emergencyTarget));
  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <PageHeader eyebrow="偏好设置" title="让看板更贴合你" description="所有设置与余额数据都只保存在当前设备。" desktop={desktop} />
      <View style={[styles.settingsLayout, !desktop && styles.stack]}>
        <SectionCard style={styles.settingsMain}>
          <SectionHeading title="经济目标" subtitle="用于计算储备进度和建议" />
          <Field label="月度税后收入" value={income} onChangeText={setIncome} keyboardType="decimal-pad" prefix="¥" hint="仅用于估算，不会生成收入流水" />
          <Field label="应急资金目标" value={emergency} onChangeText={setEmergency} keyboardType="decimal-pad" prefix="¥" hint="建议设置为 3–6 个月固定支出" />
          <View style={styles.settingNote}><ShieldCheck size={18} color={C.green} /><Text style={styles.settingNoteText}>财序不连接银行、不读取短信，也不会上传你的卡号和余额。</Text></View>
          <PrimaryButton label="保存设置" icon={Check} onPress={() => onSave({ ...finance, monthlyIncome: Number(income) || 0, emergencyTarget: Number(emergency) || 0 })} />
        </SectionCard>
        <View style={styles.settingsSide}>
          <SectionCard>
            <SectionHeading title="数据说明" />
            <InfoRow icon={ShieldCheck} title="本地优先" text="余额与借贷记录保存在本机存储。" />
            <InfoRow icon={RefreshCw} title="自动汇总" text="每次修改余额都会更新经济快照。" />
            <InfoRow icon={Bell} title="到期提示" text="借入借出会按约定日期展示提醒。" />
          </SectionCard>
          <SectionCard>
            <Text style={styles.dangerTitle}>恢复示例数据</Text>
            <Text style={styles.dangerText}>用于重新体验产品。当前数据会被覆盖且无法恢复。</Text>
            <Pressable onPress={onReset} style={styles.dangerButton}><RefreshCw size={16} color={C.red} /><Text style={styles.dangerButtonText}>恢复示例数据</Text></Pressable>
          </SectionCard>
        </View>
      </View>
    </ScrollView>
  );
}

function AccountModal({
  value,
  onClose,
  onSave,
  onDelete,
}: {
  value: Account | 'new' | null;
  onClose: () => void;
  onSave: (account: Account) => void;
  onDelete: (id: string) => void;
}) {
  const existing = value && value !== 'new' ? value : null;
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [balance, setBalance] = useState('');
  const [limit, setLimit] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [last4, setLast4] = useState('');
  const [color, setColor] = useState(accountColors[0]);

  useEffect(() => {
    if (!value) return;
    setName(existing?.name ?? '');
    setInstitution(existing?.institution ?? '');
    setType(existing?.type ?? 'bank');
    setBalance(existing ? String(existing.balance) : '');
    setLimit(existing?.limit ? String(existing.limit) : '');
    setDueDay(existing?.dueDay ? String(existing.dueDay) : '');
    setLast4(existing?.last4 ?? '');
    setColor(existing?.color ?? accountColors[0]);
  }, [value, existing]);

  const submit = () => {
    if (!name.trim() || !institution.trim() || !Number.isFinite(Number(balance))) {
      Alert.alert('信息不完整', '请填写账户名称、机构和正确的余额。');
      return;
    }
    if (type === 'credit' && Number(limit) <= 0) {
      Alert.alert('请填写信用额度', '信用卡需要额度才能计算使用率。');
      return;
    }
    onSave({
      id: existing?.id ?? uid('account'),
      name: name.trim(),
      institution: institution.trim(),
      type,
      balance: Math.max(0, Number(balance)),
      limit: type === 'credit' ? Math.max(0, Number(limit)) : undefined,
      dueDay: type === 'credit' && Number(dueDay) >= 1 && Number(dueDay) <= 31 ? Number(dueDay) : undefined,
      last4: last4.replace(/\D/g, '').slice(-4) || undefined,
      color,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <EditorModal visible={Boolean(value)} onClose={onClose} title={existing ? '更新账户' : '添加账户'} subtitle={existing ? '修改余额后，经济看板会立即重算。' : '选择账户类型并填入当前余额。'}>
      <Text style={styles.inputLabel}>账户类型</Text>
      <View style={styles.typeSelector}>
        {(Object.keys(accountTypeMeta) as AccountType[]).map((item) => (
          <Pressable key={item} onPress={() => setType(item)} style={[styles.typeOption, type === item && styles.typeOptionActive]}>
            <Text style={[styles.typeOptionText, type === item && styles.typeOptionTextActive]}>{accountTypeMeta[item].label}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.formRow}>
        <Field label="账户名称" value={name} onChangeText={setName} placeholder="如：工资卡" style={styles.formHalf} />
        <Field label="所属机构" value={institution} onChangeText={setInstitution} placeholder="如：招商银行" style={styles.formHalf} />
      </View>
      <Field label={type === 'credit' ? '当前应还' : '当前余额'} value={balance} onChangeText={setBalance} keyboardType="decimal-pad" prefix="¥" placeholder="0.00" />
      {type === 'credit' ? (
        <View style={styles.formRow}>
          <Field label="信用额度" value={limit} onChangeText={setLimit} keyboardType="decimal-pad" prefix="¥" placeholder="50000" style={styles.formHalf} />
          <Field label="每月还款日" value={dueDay} onChangeText={setDueDay} keyboardType="number-pad" placeholder="1–31" maxLength={2} style={styles.formHalf} />
        </View>
      ) : null}
      <Field label="卡号尾号（可选）" value={last4} onChangeText={setLast4} keyboardType="number-pad" placeholder="仅填写后四位" maxLength={4} />
      <Text style={styles.inputLabel}>卡片颜色</Text>
      <View style={styles.colorRow}>
        {accountColors.map((item) => <Pressable key={item} onPress={() => setColor(item)} style={[styles.colorDot, { backgroundColor: item }, color === item && styles.colorDotActive]}>{color === item ? <Check size={14} color={C.white} /> : null}</Pressable>)}
      </View>
      <View style={styles.modalActions}>
        {existing ? <Pressable onPress={() => onDelete(existing.id)} style={styles.deleteButton}><Trash2 size={17} color={C.red} /><Text style={styles.deleteButtonText}>删除</Text></Pressable> : <View />}
        <View style={styles.modalActionRight}><Pressable onPress={onClose} style={styles.cancelButton}><Text style={styles.cancelButtonText}>取消</Text></Pressable><PrimaryButton label={existing ? '保存更新' : '添加账户'} icon={Check} onPress={submit} /></View>
      </View>
    </EditorModal>
  );
}

function LoanModal({
  value,
  onClose,
  onSave,
  onDelete,
}: {
  value: Loan | 'new' | null;
  onClose: () => void;
  onSave: (loan: Loan) => void;
  onDelete: (id: string) => void;
}) {
  const existing = value && value !== 'new' ? value : null;
  const [direction, setDirection] = useState<LoanDirection>('lent');
  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [repaid, setRepaid] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!value) return;
    setDirection(existing?.direction ?? 'lent');
    setPerson(existing?.person ?? '');
    setAmount(existing ? String(existing.amount) : '');
    setRepaid(existing ? String(existing.repaid) : '0');
    setDueDate(existing?.dueDate ?? '');
    setNote(existing?.note ?? '');
  }, [value, existing]);

  const submit = () => {
    const numericAmount = Number(amount);
    const numericRepaid = Number(repaid);
    if (!person.trim() || numericAmount <= 0 || !dueDate) {
      Alert.alert('信息不完整', '请填写对方、本金和约定日期。');
      return;
    }
    onSave({
      id: existing?.id ?? uid('loan'),
      person: person.trim(),
      direction,
      amount: numericAmount,
      repaid: Math.min(numericAmount, Math.max(0, numericRepaid || 0)),
      dueDate,
      note: note.trim(),
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    });
  };

  return (
    <EditorModal visible={Boolean(value)} onClose={onClose} title={existing ? '更新往来' : '新增往来'} subtitle="本金和已还金额会直接进入资产负债汇总。">
      <Text style={styles.inputLabel}>往来方向</Text>
      <View style={styles.directionSelector}>
        <Pressable onPress={() => setDirection('lent')} style={[styles.directionOption, direction === 'lent' && styles.directionOptionActive]}><ArrowUpRight size={18} color={direction === 'lent' ? C.white : C.blue} /><View><Text style={[styles.directionOptionTitle, direction === 'lent' && styles.directionOptionTitleActive]}>我借出</Text><Text style={[styles.directionOptionText, direction === 'lent' && styles.directionOptionTextActive]}>属于待收资产</Text></View></Pressable>
        <Pressable onPress={() => setDirection('borrowed')} style={[styles.directionOption, direction === 'borrowed' && styles.directionOptionActive]}><ArrowDownLeft size={18} color={direction === 'borrowed' ? C.white : C.purple} /><View><Text style={[styles.directionOptionTitle, direction === 'borrowed' && styles.directionOptionTitleActive]}>我借入</Text><Text style={[styles.directionOptionText, direction === 'borrowed' && styles.directionOptionTextActive]}>属于个人负债</Text></View></Pressable>
      </View>
      <Field label="对方" value={person} onChangeText={setPerson} placeholder="姓名或称呼" />
      <View style={styles.formRow}>
        <Field label="本金" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" prefix="¥" placeholder="0.00" style={styles.formHalf} />
        <Field label="已归还" value={repaid} onChangeText={setRepaid} keyboardType="decimal-pad" prefix="¥" placeholder="0.00" style={styles.formHalf} />
      </View>
      <Field label="约定日期" value={dueDate} onChangeText={setDueDate} placeholder="YYYY-MM-DD" hint="例如 2026-08-31" />
      <Field label="备注（可选）" value={note} onChangeText={setNote} placeholder="用途或约定" />
      <View style={styles.modalActions}>
        {existing ? <Pressable onPress={() => onDelete(existing.id)} style={styles.deleteButton}><Trash2 size={17} color={C.red} /><Text style={styles.deleteButtonText}>删除</Text></Pressable> : <View />}
        <View style={styles.modalActionRight}><Pressable onPress={onClose} style={styles.cancelButton}><Text style={styles.cancelButtonText}>取消</Text></Pressable><PrimaryButton label={existing ? '保存更新' : '添加记录'} icon={Check} onPress={submit} /></View>
      </View>
    </EditorModal>
  );
}

function EditorModal({ visible, onClose, title, subtitle, children }: { visible: boolean; onClose: () => void; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}><View><Text style={styles.modalTitle}>{title}</Text><Text style={styles.modalSubtitle}>{subtitle}</Text></View><IconButton icon={X} onPress={onClose} label="关闭" /></View>
          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{children}</ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function PrimaryButton({ label, icon: Icon, onPress }: { label: string; icon: IconType; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}><Icon size={18} color={C.white} /><Text style={styles.primaryButtonText}>{label}</Text></Pressable>;
}

function IconButton({ icon: Icon, onPress, label, filled }: { icon: IconType; onPress: () => void; label: string; filled?: boolean }) {
  return <Pressable accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.iconButton, filled && styles.iconButtonFilled, pressed && styles.pressed]}><Icon size={19} color={filled ? C.white : C.ink2} /></Pressable>;
}

function SectionCard({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.sectionCard, style]}>{children}</View>;
}

function SectionHeading({ title, subtitle, action, onAction }: { title: string; subtitle?: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeading}>
      <View><Text style={styles.sectionTitle}>{title}</Text>{subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}</View>
      {action && onAction ? <Pressable onPress={onAction} style={styles.textAction}><Text style={styles.textActionText}>{action}</Text><ArrowRight size={15} color={C.green} /></Pressable> : null}
    </View>
  );
}

function MetricCard({ icon: Icon, label, value, detail, color, soft }: { icon: IconType; label: string; value: string; detail: string; color: string; soft: string }) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: soft }]}><Icon size={21} color={color} /></View>
      <View style={styles.metricCopy}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricDetail}>{detail}</Text></View>
      <ChevronRight size={17} color={C.faint} />
    </View>
  );
}

function HeroStat({ label, value, tone, suffix }: { label: string; value: string; tone?: 'warm'; suffix?: string }) {
  return <View style={styles.heroStat}><Text style={styles.heroStatLabel}>{label}</Text><Text style={[styles.heroStatValue, tone === 'warm' && { color: '#FFD3B9' }]}>{value}<Text style={styles.heroStatSuffix}>{suffix}</Text></Text></View>;
}

function DonutChart({ total, segments, center, label }: { total: number; segments: { value: number; color: string }[]; center: string; label: string }) {
  const size = 156;
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 156 156" style={StyleSheet.absoluteFill}>
        <Circle cx="78" cy="78" r={radius} fill="none" stroke="#EDF0EC" strokeWidth="16" />
        {segments.map((segment, index) => {
          const length = total > 0 ? circumference * segment.value / total : 0;
          const currentOffset = -offset;
          offset += length;
          return <Circle key={index} cx="78" cy="78" r={radius} fill="none" stroke={segment.color} strokeWidth="16" strokeLinecap="butt" strokeDasharray={`${length} ${circumference - length}`} strokeDashoffset={currentOffset} transform="rotate(-90 78 78)" />;
        })}
      </Svg>
      <Text style={styles.donutCenter}>{center}</Text><Text style={styles.donutLabel}>{label}</Text>
    </View>
  );
}

function LegendRow({ label, value, total, color, hidden }: { label: string; value: number; total: number; color: string; hidden: boolean }) {
  const percent = total > 0 ? Math.round(value / total * 100) : 0;
  return <View style={styles.legendRow}><View style={[styles.legendDot, { backgroundColor: color }]} /><View style={styles.legendCopy}><Text style={styles.legendLabel}>{label}</Text><Text style={styles.legendSub}>{percent}%</Text></View><Text style={styles.legendValue}>{formatMoney(value, hidden, true)}</Text></View>;
}

function HealthRow({ label, value, good }: { label: string; value: number; good: boolean }) {
  const percent = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return <View style={styles.healthRow}><View style={styles.healthRowTop}><Text style={styles.healthLabel}>{label}</Text><Text style={[styles.healthStatus, { color: good ? C.green : C.orange }]}>{good ? '良好' : '关注'} · {percent}%</Text></View><View style={styles.healthTrack}><View style={[styles.healthFill, { width: `${percent}%`, backgroundColor: good ? C.green : C.orange }]} /></View></View>;
}

function SummaryBlock({ label, value, color }: { label: string; value: string; color: string }) {
  return <View style={styles.summaryBlock}><Text style={styles.summaryLabel}>{label}</Text><Text style={[styles.summaryValue, { color }]}>{value}</Text></View>;
}

function TrendChart({ snapshots, hidden }: { snapshots: FinanceState['snapshots']; hidden: boolean }) {
  const width = 620;
  const height = 220;
  const pad = 28;
  const netValues = snapshots.map((item) => item.assets - item.liabilities);
  const max = Math.max(...netValues, 1);
  const min = Math.min(...netValues, 0);
  const range = Math.max(1, max - min);
  const points = netValues.map((value, index) => ({
    x: pad + index * ((width - pad * 2) / Math.max(1, netValues.length - 1)),
    y: height - pad - ((value - min) / range) * (height - pad * 2),
    value,
  }));
  const path = points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ');
  return (
    <View>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {[0, 1, 2, 3].map((line) => <Line key={line} x1={pad} x2={width - pad} y1={pad + line * 52} y2={pad + line * 52} stroke={C.line} strokeDasharray="4 6" />)}
        <Path d={`${path} L ${points.at(-1)?.x ?? width - pad} ${height - pad} L ${pad} ${height - pad} Z`} fill={C.greenSoft} opacity={0.7} />
        <Path d={path} fill="none" stroke={C.green} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        {points.map((point, index) => <Circle key={index} cx={point.x} cy={point.y} r={4.5} fill={C.white} stroke={C.green} strokeWidth={3} />)}
      </Svg>
      <View style={styles.chartLabels}>{snapshots.map((item) => <Text key={item.id} style={styles.chartLabel}>{new Date(`${item.date}T00:00:00`).getMonth() + 1}月</Text>)}</View>
      <View style={styles.chartCurrent}><Text style={styles.chartCurrentLabel}>当前净资产</Text><Text style={styles.chartCurrentValue}>{formatMoney(netValues.at(-1) ?? 0, hidden)}</Text></View>
    </View>
  );
}

function InsightTip({ icon: Icon, color, title, text }: { icon: IconType; color: string; title: string; text: string }) {
  return <View style={styles.insightTip}><View style={[styles.tipIcon, { backgroundColor: `${color}15` }]}><Icon size={18} color={color} /></View><View style={styles.tipCopy}><Text style={styles.tipTitle}>{title}</Text><Text style={styles.tipText}>{text}</Text></View></View>;
}

function InfoRow({ icon: Icon, title, text }: { icon: IconType; title: string; text: string }) {
  return <View style={styles.infoRow}><View style={styles.infoIcon}><Icon size={18} color={C.green} /></View><View style={styles.tipCopy}><Text style={styles.tipTitle}>{title}</Text><Text style={styles.tipText}>{text}</Text></View></View>;
}

function Field({
  label,
  hint,
  prefix,
  style,
  ...props
}: React.ComponentProps<typeof TextInput> & { label: string; hint?: string; prefix?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.field, style]}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrap}>{prefix ? <Text style={styles.inputPrefix}>{prefix}</Text> : null}<TextInput placeholderTextColor={C.faint} style={styles.input} {...props} /></View>
      {hint ? <Text style={styles.inputHint}>{hint}</Text> : null}
    </View>
  );
}

function EmptyState({ title, text, action, onAction, compact }: { title: string; text: string; action?: string; onAction?: () => void; compact?: boolean }) {
  return (
    <View style={[styles.empty, compact && styles.emptyCompact]}>
      <View style={styles.emptyIcon}><CircleDollarSign size={compact ? 19 : 26} color={C.green} /></View>
      <View style={compact && { flex: 1 }}><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyText}>{text}</Text></View>
      {action && onAction ? <PrimaryButton label={action} icon={Plus} onPress={onAction} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: C.canvas },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: C.canvas },
  loadingText: { color: C.muted, fontSize: 14 },
  shell: { flex: 1 },
  shellDesktop: { marginLeft: 252 },
  main: { flex: 1 },
  sidebar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 252, backgroundColor: C.greenDark, paddingHorizontal: 20, paddingTop: 32, paddingBottom: 24, zIndex: 10 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 22, paddingVertical: 8 },
  backButtonText: { color: C.lime, fontSize: 13, fontWeight: '700' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoMark: { width: 42, height: 42, borderRadius: 14, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center' },
  brandName: { color: C.white, fontSize: 23, fontWeight: '800', letterSpacing: 2 },
  brandSub: { color: '#9BB2A7', fontSize: 11, marginTop: 2 },
  navList: { marginTop: 42, gap: 7 },
  navItem: { height: 48, borderRadius: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 13 },
  navItemActive: { backgroundColor: '#176B4D' },
  navText: { color: '#AFC0B8', fontSize: 14, fontWeight: '600', flex: 1 },
  navTextActive: { color: C.white },
  sideSummary: { marginTop: 'auto', backgroundColor: '#164F3C', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#2C6652' },
  sideSummaryLabel: { color: '#9FB5AA', fontSize: 12 },
  sideSummaryValue: { color: C.white, fontSize: 21, fontWeight: '800', marginTop: 7 },
  sideSummaryRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 13 },
  sideSummaryHint: { color: '#C0D0C8', fontSize: 11 },
  page: { width: '100%', maxWidth: 1420, alignSelf: 'center', padding: 32, paddingBottom: 80, gap: 20 },
  pageHeader: { minHeight: 92, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 },
  pageHeaderMobile: { flexDirection: 'column', minHeight: 0 },
  pageHeading: { flex: 1 },
  eyebrow: { color: C.green, fontSize: 12, fontWeight: '800', letterSpacing: 1.3, marginBottom: 6 },
  pageTitle: { color: C.ink, fontSize: 30, lineHeight: 38, fontWeight: '800', letterSpacing: -0.8 },
  pageTitleMobile: { fontSize: 24, lineHeight: 32 },
  pageDescription: { color: C.muted, fontSize: 14, lineHeight: 21, marginTop: 5 },
  pageActions: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  primaryButton: { height: 44, paddingHorizontal: 18, borderRadius: 12, backgroundColor: C.green, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 7px 18px rgba(15,122,82,0.22)' },
  primaryButtonPressed: { backgroundColor: C.greenDark, transform: [{ scale: 0.98 }] },
  primaryButtonText: { color: C.white, fontSize: 14, fontWeight: '700' },
  iconButton: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  iconButtonFilled: { backgroundColor: C.green, borderColor: C.green },
  mobileHeader: { height: 66, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.line, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 },
  mobileLogo: { width: 34, height: 34, borderRadius: 11, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center' },
  mobileBrand: { fontSize: 20, fontWeight: '800', color: C.ink, letterSpacing: 1 },
  headerButtons: { flexDirection: 'row', gap: 8 },
  bottomNav: { height: 70, backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.line, flexDirection: 'row', paddingHorizontal: 8, paddingBottom: Platform.OS === 'ios' ? 8 : 0 },
  bottomItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  bottomText: { color: C.faint, fontSize: 10.5, fontWeight: '600' },
  bottomTextActive: { color: C.green },
  hero: { minHeight: 210, borderRadius: 24, backgroundColor: C.greenDark, padding: 30, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  heroMobile: { flexDirection: 'column', alignItems: 'stretch', padding: 22, gap: 26 },
  heroGlowOne: { position: 'absolute', width: 260, height: 260, borderRadius: 260, right: -60, top: -130, backgroundColor: '#1D7353', opacity: 0.75 },
  heroGlowTwo: { position: 'absolute', width: 170, height: 170, borderRadius: 170, left: '43%', bottom: -135, backgroundColor: C.lime, opacity: 0.1 },
  heroMain: { flex: 1.35, zIndex: 1 },
  heroLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  heroLabel: { color: '#C5D6CE', fontSize: 14, marginRight: 6 },
  liveDot: { width: 7, height: 7, borderRadius: 7, backgroundColor: C.lime },
  liveText: { color: '#9FB7AC', fontSize: 11 },
  heroValue: { color: C.white, fontSize: 44, lineHeight: 56, fontWeight: '800', letterSpacing: -1.5, marginTop: 8 },
  heroValueMobile: { fontSize: 35, lineHeight: 46 },
  heroTrend: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 7 },
  heroTrendText: { color: '#BFD0C8', fontSize: 12 },
  heroStats: { flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', zIndex: 1 },
  heroStatsMobile: { width: '100%', justifyContent: 'space-between' },
  heroDivider: { width: 1, height: 44, backgroundColor: '#3A6E5C' },
  heroStat: { alignItems: 'flex-start', minWidth: 76 },
  heroStatLabel: { color: '#9FB7AC', fontSize: 11 },
  heroStatValue: { color: C.white, fontSize: 18, fontWeight: '800', marginTop: 8 },
  heroStatSuffix: { fontSize: 10, color: '#9FB7AC', fontWeight: '500' },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  metricCard: { minWidth: 210, flex: 1, minHeight: 112, backgroundColor: C.surface, borderRadius: 18, borderWidth: 1, borderColor: C.line, padding: 17, flexDirection: 'row', alignItems: 'center', gap: 13 },
  metricIcon: { width: 43, height: 43, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  metricCopy: { flex: 1 },
  metricLabel: { color: C.muted, fontSize: 12 },
  metricValue: { color: C.ink, fontSize: 19, fontWeight: '800', marginTop: 4 },
  metricDetail: { color: C.faint, fontSize: 10.5, marginTop: 5 },
  dashboardColumns: { flexDirection: 'row', gap: 18, alignItems: 'stretch' },
  stack: { flexDirection: 'column' },
  flexWide: { flex: 1.45 },
  flexNarrow: { flex: 1 },
  sectionCard: { backgroundColor: C.surface, borderRadius: 20, borderWidth: 1, borderColor: C.line, padding: 21, boxShadow: '0 4px 16px rgba(42,61,51,0.035)' },
  sectionHeading: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 20 },
  sectionTitle: { color: C.ink, fontSize: 17, fontWeight: '800' },
  sectionSubtitle: { color: C.muted, fontSize: 11.5, marginTop: 4 },
  textAction: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 3 },
  textActionText: { color: C.green, fontSize: 12, fontWeight: '700' },
  allocationBody: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', gap: 24 },
  allocationMobile: { flexDirection: 'column' },
  allocationLegend: { flex: 1, gap: 15, minWidth: 230 },
  donutCenter: { color: C.ink, fontSize: 16, fontWeight: '800' },
  donutLabel: { color: C.muted, fontSize: 10.5, marginTop: 3 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  legendDot: { width: 9, height: 9, borderRadius: 9 },
  legendCopy: { flex: 1 },
  legendLabel: { color: C.ink2, fontSize: 12.5, fontWeight: '600' },
  legendSub: { color: C.faint, fontSize: 10.5, marginTop: 2 },
  legendValue: { color: C.ink, fontSize: 13, fontWeight: '700' },
  healthTop: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 19 },
  scoreRing: { width: 67, height: 67, borderRadius: 67, borderWidth: 7, borderColor: C.lime, backgroundColor: C.greenSoft, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  score: { color: C.greenDark, fontSize: 22, fontWeight: '900' },
  scoreUnit: { color: C.green, fontSize: 9, marginTop: 8 },
  healthCopy: { flex: 1 },
  healthTitle: { color: C.ink, fontSize: 15, fontWeight: '800' },
  healthText: { color: C.muted, fontSize: 11, lineHeight: 16, marginTop: 4 },
  healthRow: { marginTop: 13 },
  healthRowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  healthLabel: { color: C.ink2, fontSize: 11.5 },
  healthStatus: { fontSize: 10.5, fontWeight: '700' },
  healthTrack: { height: 5, borderRadius: 5, backgroundColor: '#EDF0ED', overflow: 'hidden' },
  healthFill: { height: 5, borderRadius: 5 },
  accountMiniGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  miniAccount: { width: '48%', minWidth: 245, flexGrow: 1, minHeight: 69, borderRadius: 13, backgroundColor: '#FAFBF9', borderWidth: 1, borderColor: C.line, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  accountIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  accountIconText: { fontSize: 14, fontWeight: '800' },
  miniAccountInfo: { flex: 1 },
  miniAccountName: { color: C.ink, fontSize: 12.5, fontWeight: '700' },
  miniAccountMeta: { color: C.faint, fontSize: 10, marginTop: 3 },
  miniAccountValue: { color: C.ink, fontSize: 12.5, fontWeight: '800' },
  upcomingRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: C.line },
  directionIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  upcomingInfo: { flex: 1 },
  upcomingName: { color: C.ink, fontSize: 12.5, fontWeight: '700' },
  upcomingDate: { color: C.faint, fontSize: 10, marginTop: 3 },
  upcomingValue: { color: C.ink, fontSize: 12.5, fontWeight: '800' },
  summaryStrip: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: C.surface, borderRadius: 18, borderWidth: 1, borderColor: C.line, paddingVertical: 18 },
  summaryBlock: { flex: 1, minWidth: 180, paddingHorizontal: 22, borderRightWidth: 1, borderRightColor: C.line },
  summaryLabel: { color: C.muted, fontSize: 11.5 },
  summaryValue: { fontSize: 21, fontWeight: '800', marginTop: 7 },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 },
  toolbarMobile: { flexDirection: 'column', alignItems: 'stretch' },
  segment: { alignSelf: 'flex-start', flexDirection: 'row', padding: 4, backgroundColor: '#E9EDE8', borderRadius: 12 },
  segmentItem: { height: 34, paddingHorizontal: 17, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  segmentItemActive: { backgroundColor: C.surface, boxShadow: '0 2px 8px rgba(35,50,42,0.08)' },
  segmentText: { color: C.muted, fontSize: 12, fontWeight: '600' },
  segmentTextActive: { color: C.green, fontWeight: '800' },
  searchBox: { width: 270, maxWidth: '100%', height: 43, backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.line, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 9 },
  searchInput: { flex: 1, color: C.ink, fontSize: 13, outlineStyle: 'none' } as never,
  accountGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  accountCard: { width: '31.8%', minWidth: 300, flexGrow: 1, maxWidth: 520, minHeight: 225, backgroundColor: C.surface, borderRadius: 19, borderWidth: 1, borderColor: C.line, padding: 21, overflow: 'hidden' },
  cardAccent: { position: 'absolute', left: 0, right: 0, top: 0, height: 4 },
  cardPressed: { transform: [{ translateY: 1 }], backgroundColor: '#FBFCFA' },
  accountCardTop: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  accountIconLarge: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  accountIconLargeText: { fontSize: 16, fontWeight: '900' },
  accountCardInfo: { flex: 1 },
  accountCardName: { color: C.ink, fontSize: 15, fontWeight: '800' },
  accountCardMeta: { color: C.faint, fontSize: 10.5, marginTop: 4 },
  balanceLabel: { color: C.muted, fontSize: 11, marginTop: 22 },
  accountBalance: { color: C.ink, fontSize: 25, fontWeight: '800', letterSpacing: -0.5, marginTop: 4 },
  creditInfo: { marginTop: 'auto', paddingTop: 18 },
  progressTrack: { height: 6, backgroundColor: '#EDF0ED', borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 6 },
  creditFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  accountFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 18 },
  accountFootText: { color: C.faint, fontSize: 10.5 },
  editHint: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  editHintText: { color: C.green, fontSize: 10.5, fontWeight: '700' },
  loanHeroGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  loanSummary: { flex: 1, minWidth: 270, borderRadius: 18, minHeight: 112, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 15 },
  loanSummaryIcon: { width: 46, height: 46, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.65)', alignItems: 'center', justifyContent: 'center' },
  loanSummaryLabel: { color: C.muted, fontSize: 12 },
  loanSummaryValue: { fontSize: 24, fontWeight: '800', marginTop: 6 },
  loanList: { backgroundColor: C.surface, borderRadius: 19, borderWidth: 1, borderColor: C.line, overflow: 'hidden' },
  loanRow: { minHeight: 104, paddingHorizontal: 16, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: C.line },
  loanAvatar: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  loanAvatarText: { fontSize: 16, fontWeight: '900' },
  loanMain: { flex: 1, minWidth: 120 },
  loanTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  loanPerson: { color: C.ink, fontSize: 14, fontWeight: '800' },
  typePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  typePillText: { fontSize: 9.5, fontWeight: '700' },
  loanNote: { color: C.muted, fontSize: 10.5, marginTop: 5 },
  loanProgressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 9 },
  loanTrack: { width: 130, maxWidth: '60%', height: 5, backgroundColor: '#EDF0ED', borderRadius: 5, overflow: 'hidden' },
  loanFill: { height: 5, backgroundColor: C.green, borderRadius: 5 },
  loanProgressText: { color: C.faint, fontSize: 9.5 },
  loanAmountBlock: { alignItems: 'flex-end', minWidth: 78 },
  loanAmount: { color: C.ink, fontSize: 15, fontWeight: '800' },
  dueText: { color: C.muted, fontSize: 10, marginTop: 5 },
  insightGrid: { flexDirection: 'row', gap: 18, alignItems: 'stretch' },
  bigScoreBlock: { flexDirection: 'row', alignItems: 'center', gap: 15, backgroundColor: C.greenSoft, borderRadius: 15, padding: 17, marginBottom: 8 },
  bigScore: { color: C.greenDark, fontSize: 44, fontWeight: '900' },
  bigScoreTitle: { color: C.ink, fontSize: 17, fontWeight: '800' },
  bigScoreText: { color: C.muted, fontSize: 11, marginTop: 3 },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 18, marginTop: -13 },
  chartLabel: { color: C.faint, fontSize: 10 },
  chartCurrent: { position: 'absolute', left: 18, top: 12 },
  chartCurrentLabel: { color: C.muted, fontSize: 10.5 },
  chartCurrentValue: { color: C.ink, fontSize: 19, fontWeight: '800', marginTop: 4 },
  barList: { gap: 19 },
  barRow: { gap: 8 },
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  barLabel: { color: C.ink2, fontSize: 12.5, fontWeight: '600' },
  barValue: { color: C.ink, fontSize: 12.5, fontWeight: '800' },
  horizontalTrack: { height: 9, borderRadius: 9, backgroundColor: '#EDF0ED', overflow: 'hidden' },
  horizontalFill: { height: 9, borderRadius: 9, backgroundColor: C.green },
  insightTip: { flexDirection: 'row', gap: 11, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: C.line },
  tipIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  tipCopy: { flex: 1 },
  tipTitle: { color: C.ink, fontSize: 12.5, fontWeight: '800' },
  tipText: { color: C.muted, fontSize: 10.5, lineHeight: 16, marginTop: 4 },
  settingsLayout: { flexDirection: 'row', alignItems: 'flex-start', gap: 18 },
  settingsMain: { flex: 1.4 },
  settingsSide: { flex: 1, gap: 18 },
  field: { marginBottom: 17 },
  inputLabel: { color: C.ink2, fontSize: 11.5, fontWeight: '700', marginBottom: 7 },
  inputWrap: { height: 46, borderRadius: 12, borderWidth: 1, borderColor: '#DCE3DD', backgroundColor: '#FBFCFA', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13 },
  inputPrefix: { color: C.muted, fontSize: 14, marginRight: 5 },
  input: { flex: 1, height: '100%', color: C.ink, fontSize: 14, outlineStyle: 'none' } as never,
  inputHint: { color: C.faint, fontSize: 10, marginTop: 5 },
  settingNote: { flexDirection: 'row', gap: 9, backgroundColor: C.greenSoft, borderRadius: 12, padding: 13, marginBottom: 18 },
  settingNoteText: { color: C.greenDark, fontSize: 11, lineHeight: 17, flex: 1 },
  infoRow: { flexDirection: 'row', gap: 11, paddingVertical: 11 },
  infoIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: C.greenSoft, alignItems: 'center', justifyContent: 'center' },
  dangerTitle: { color: C.ink, fontSize: 15, fontWeight: '800' },
  dangerText: { color: C.muted, fontSize: 11, lineHeight: 17, marginTop: 6 },
  dangerButton: { marginTop: 15, height: 40, borderRadius: 10, borderWidth: 1, borderColor: '#F1CACA', backgroundColor: C.redSoft, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  dangerButtonText: { color: C.red, fontSize: 12, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(14,28,22,0.48)', alignItems: 'center', justifyContent: 'center', padding: 18 },
  modalCard: { width: 620, maxWidth: '100%', maxHeight: '92%', backgroundColor: C.surface, borderRadius: 22, overflow: 'hidden', boxShadow: '0 25px 80px rgba(15,35,26,0.25)' },
  modalHeader: { padding: 21, borderBottomWidth: 1, borderBottomColor: C.line, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  modalTitle: { color: C.ink, fontSize: 21, fontWeight: '800' },
  modalSubtitle: { color: C.muted, fontSize: 11.5, marginTop: 5 },
  modalContent: { padding: 21 },
  typeSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 18 },
  typeOption: { height: 35, paddingHorizontal: 13, borderRadius: 10, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  typeOptionActive: { backgroundColor: C.greenSoft, borderColor: '#BFDACD' },
  typeOptionText: { color: C.muted, fontSize: 11 },
  typeOptionTextActive: { color: C.green, fontWeight: '800' },
  formRow: { flexDirection: 'row', gap: 12 },
  formHalf: { flex: 1 },
  colorRow: { flexDirection: 'row', gap: 11, marginBottom: 20 },
  colorDot: { width: 30, height: 30, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  colorDotActive: { borderWidth: 3, borderColor: C.white, outlineWidth: 2, outlineColor: C.green } as never,
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 7, paddingTop: 18, borderTopWidth: 1, borderTopColor: C.line },
  modalActionRight: { flexDirection: 'row', gap: 9 },
  cancelButton: { height: 44, paddingHorizontal: 17, borderRadius: 12, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  cancelButtonText: { color: C.ink2, fontSize: 13, fontWeight: '700' },
  deleteButton: { height: 40, flexDirection: 'row', alignItems: 'center', gap: 6 },
  deleteButtonText: { color: C.red, fontSize: 12, fontWeight: '700' },
  directionSelector: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  directionOption: { flex: 1, minHeight: 62, borderRadius: 13, borderWidth: 1, borderColor: C.line, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 9 },
  directionOptionActive: { backgroundColor: C.green, borderColor: C.green },
  directionOptionTitle: { color: C.ink, fontSize: 12.5, fontWeight: '800' },
  directionOptionTitleActive: { color: C.white },
  directionOptionText: { color: C.muted, fontSize: 9.5, marginTop: 2 },
  directionOptionTextActive: { color: '#CFE1D8' },
  empty: { minHeight: 250, borderRadius: 20, borderWidth: 1, borderStyle: 'dashed', borderColor: '#CED8D1', alignItems: 'center', justifyContent: 'center', padding: 28, backgroundColor: 'rgba(255,255,255,0.55)' },
  emptyCompact: { minHeight: 76, flexDirection: 'row', justifyContent: 'flex-start', padding: 12, gap: 10 },
  emptyIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: C.greenSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 11 },
  emptyTitle: { color: C.ink, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  emptyText: { color: C.muted, fontSize: 11, marginTop: 5, marginBottom: 14, textAlign: 'center' },
  toast: { position: 'absolute', left: '50%', bottom: 26, transform: [{ translateX: -95 }], minWidth: 190, height: 44, borderRadius: 22, backgroundColor: '#183C2E', paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, zIndex: 100 },
  toastText: { color: C.white, fontSize: 12, fontWeight: '700' },
  pressed: { opacity: 0.75 },
});
