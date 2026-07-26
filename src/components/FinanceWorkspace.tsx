import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  ChevronRight,
  CreditCard,
  Eye,
  EyeOff,
  HandCoins,
  Landmark,
  Pencil,
  Plus,
  ShieldCheck,
  WalletCards,
  X,
} from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  Account,
  AccountType,
  FinanceState,
  Loan,
  LoanDirection,
  accountTypeMeta,
  addSnapshot,
  calculate,
  defaultState,
  formatDate,
  formatMoney,
  remainingLoan,
  uid,
} from '../finance';
import { colors, shadow } from '../theme';

type FinanceSection = 'overview' | 'accounts' | 'loans';
const STORAGE_KEY = '@rixu/finance-v3';

const sections: { key: FinanceSection; label: string }[] = [
  { key: 'overview', label: '经济总览' },
  { key: 'accounts', label: '账户与负债' },
  { key: 'loans', label: '借入借出' },
];

export function FinanceWorkspace() {
  const { width } = useWindowDimensions();
  const compact = width < 840;
  const [finance, setFinance] = useState<FinanceState>(defaultState);
  const [section, setSection] = useState<FinanceSection>('overview');
  const [hidden, setHidden] = useState(false);
  const [accountEditor, setAccountEditor] = useState<Account | 'new' | null>(null);
  const [loanEditor, setLoanEditor] = useState<Loan | 'new' | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (!value) return;
      const parsed = JSON.parse(value) as FinanceState;
      if (Array.isArray(parsed.accounts) && Array.isArray(parsed.loans)) setFinance(parsed);
    }).catch(() => undefined);
  }, []);

  const commit = (next: FinanceState) => {
    const withSnapshot = addSnapshot(next);
    setFinance(withSnapshot);
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(withSnapshot));
  };

  const totals = useMemo(() => calculate(finance), [finance]);

  const saveAccount = (account: Account) => {
    const exists = finance.accounts.some((item) => item.id === account.id);
    commit({
      ...finance,
      accounts: exists ? finance.accounts.map((item) => item.id === account.id ? account : item) : [...finance.accounts, account],
    });
    setAccountEditor(null);
  };

  const saveLoan = (loan: Loan) => {
    const exists = finance.loans.some((item) => item.id === loan.id);
    commit({
      ...finance,
      loans: exists ? finance.loans.map((item) => item.id === loan.id ? loan : item) : [...finance.loans, loan],
    });
    setLoanEditor(null);
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={[styles.page, compact && styles.pageCompact]} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, compact && styles.headerCompact]}>
        <View>
          <Text style={styles.eyebrow}>财务健康</Text>
          <Text style={styles.title}>看余额，也看生活的底气</Text>
          <Text style={styles.subtitle}>不记流水，只维护账户余额、信用卡负债和借入借出。</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable accessibilityLabel={hidden ? '显示金额' : '隐藏金额'} style={styles.iconButton} onPress={() => setHidden((value) => !value)}>
            {hidden ? <EyeOff color={colors.textMuted} size={19} /> : <Eye color={colors.textMuted} size={19} />}
          </Pressable>
          <Pressable style={styles.primaryButton} onPress={() => setAccountEditor('new')}>
            <Plus color={colors.white} size={17} />
            <Text style={styles.primaryText}>添加账户</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.segment}>
        {sections.map((item) => (
          <Pressable key={item.key} style={[styles.segmentItem, section === item.key && styles.segmentActive]} onPress={() => setSection(item.key)}>
            <Text style={[styles.segmentText, section === item.key && styles.segmentTextActive]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      {section === 'overview' ? (
        <>
          <View style={[styles.hero, compact && styles.heroCompact]}>
            <View style={styles.heroMain}>
              <View style={styles.heroLabel}><ShieldCheck color="#BCD8D1" size={15} /><Text style={styles.heroLabelText}>当前净资产</Text></View>
              <Text style={[styles.heroValue, compact && styles.heroValueCompact]}>{formatMoney(totals.netWorth, hidden)}</Text>
              <Text style={styles.heroHint}>资产结构稳定，信用卡使用率 {Math.round(totals.utilization * 100)}%</Text>
            </View>
            <View style={styles.heroStats}>
              <HeroStat label="总资产" value={formatMoney(totals.assets, hidden, true)} />
              <HeroStat label="总负债" value={formatMoney(totals.liabilities, hidden, true)} />
              <HeroStat label="健康度" value={`${totals.healthScore}/100`} />
            </View>
          </View>

          <View style={styles.metricGrid}>
            <Metric icon={WalletCards} label="现金流账户" value={formatMoney(totals.liquid, hidden)} hint={`${finance.accounts.filter((item) => item.type !== 'credit' && item.type !== 'investment').length} 个可用账户`} />
            <Metric icon={CreditCard} label="信用卡负债" value={formatMoney(totals.creditDebt, hidden)} hint={`额度使用 ${Math.round(totals.utilization * 100)}%`} tone="red" />
            <Metric icon={ArrowUpRight} label="借出待收" value={formatMoney(totals.receivables, hidden)} hint={`${finance.loans.filter((item) => item.direction === 'lent').length} 项往来`} />
            <Metric icon={ArrowDownLeft} label="借入未还" value={formatMoney(totals.borrowings, hidden)} hint={`${finance.loans.filter((item) => item.direction === 'borrowed').length} 项往来`} />
          </View>

          <View style={[styles.columns, compact && styles.columnsCompact]}>
            <View style={[styles.panel, styles.panelWide]}>
              <SectionHeader title="账户概览" subtitle="点击卡片直接更新余额" action="查看全部" onPress={() => setSection('accounts')} />
              <View style={styles.accountList}>
                {finance.accounts.slice(0, 5).map((account) => (
                  <AccountRow key={account.id} account={account} hidden={hidden} onPress={() => setAccountEditor(account)} />
                ))}
              </View>
            </View>
            <View style={styles.panel}>
              <SectionHeader title="近期提醒" subtitle="负债和人情往来" action="新增借贷" onPress={() => setLoanEditor('new')} />
              {finance.accounts.filter((item) => item.type === 'credit').map((account) => (
                <Reminder key={account.id} title={`${account.institution} ${account.name}`} meta={`${account.dueDay} 日还款`} value={formatMoney(account.balance, hidden)} alert />
              ))}
              {finance.loans.slice(0, 2).map((loan) => (
                <Reminder key={loan.id} title={loan.person} meta={`${formatDate(loan.dueDate)} · ${loan.direction === 'lent' ? '待收回' : '待归还'}`} value={formatMoney(remainingLoan(loan), hidden)} />
              ))}
            </View>
          </View>
        </>
      ) : null}

      {section === 'accounts' ? (
        <View style={styles.panel}>
          <SectionHeader title="账户与信用卡" subtitle="资产账户记余额，信用卡记当前应还" action="添加账户" onPress={() => setAccountEditor('new')} />
          <View style={styles.cardGrid}>
            {finance.accounts.map((account) => (
              <Pressable key={account.id} style={({ pressed }) => [styles.accountCard, pressed && styles.pressed]} onPress={() => setAccountEditor(account)}>
                <View style={[styles.accountAccent, { backgroundColor: account.color }]} />
                <View style={styles.accountCardTop}>
                  <View style={[styles.accountBadge, { backgroundColor: `${account.color}18` }]}><Text style={[styles.accountBadgeText, { color: account.color }]}>{accountTypeMeta[account.type].short}</Text></View>
                  <View style={styles.accountCardCopy}><Text style={styles.accountName}>{account.name}</Text><Text style={styles.accountMeta}>{account.institution}{account.last4 ? ` · ${account.last4}` : ''}</Text></View>
                  <Pencil color={colors.textSoft} size={15} />
                </View>
                <Text style={styles.balanceLabel}>{account.type === 'credit' ? '当前应还' : '当前余额'}</Text>
                <Text style={[styles.balance, account.type === 'credit' && styles.debt]}>{formatMoney(account.balance, hidden)}</Text>
                <Text style={styles.updated}>点击更新余额 · 数据仅保存在本设备</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {section === 'loans' ? (
        <View style={styles.panel}>
          <SectionHeader title="借入借出" subtitle="记录关系、金额和约定日期" action="添加记录" onPress={() => setLoanEditor('new')} />
          <View style={styles.loanSummary}>
            <Metric icon={ArrowUpRight} label="借出待收" value={formatMoney(totals.receivables, hidden)} hint="计入个人资产" />
            <Metric icon={ArrowDownLeft} label="借入未还" value={formatMoney(totals.borrowings, hidden)} hint="计入个人负债" tone="red" />
          </View>
          {finance.loans.map((loan) => (
            <Pressable key={loan.id} style={styles.loanRow} onPress={() => setLoanEditor(loan)}>
              <View style={[styles.loanIcon, loan.direction === 'borrowed' && styles.loanIconBorrowed]}>
                {loan.direction === 'lent' ? <ArrowUpRight color={colors.green700} size={18} /> : <ArrowDownLeft color={colors.red} size={18} />}
              </View>
              <View style={styles.loanCopy}>
                <Text style={styles.loanPerson}>{loan.person}</Text>
                <Text style={styles.loanMeta}>{loan.note || '未填写备注'} · {formatDate(loan.dueDate)}</Text>
              </View>
              <View style={styles.loanValueWrap}>
                <Text style={styles.loanValue}>{formatMoney(remainingLoan(loan), hidden)}</Text>
                <Text style={styles.loanDirection}>{loan.direction === 'lent' ? '待收回' : '待归还'}</Text>
              </View>
              <ChevronRight color={colors.textSoft} size={17} />
            </Pressable>
          ))}
        </View>
      ) : null}

      <AccountEditor value={accountEditor} onClose={() => setAccountEditor(null)} onSave={saveAccount} />
      <LoanEditor value={loanEditor} onClose={() => setLoanEditor(null)} onSave={saveLoan} />
    </ScrollView>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return <View><Text style={styles.heroStatLabel}>{label}</Text><Text style={styles.heroStatValue}>{value}</Text></View>;
}

function Metric({ icon: Icon, label, value, hint, tone }: { icon: typeof Landmark; label: string; value: string; hint: string; tone?: 'red' }) {
  const color = tone === 'red' ? colors.red : colors.green700;
  return (
    <View style={styles.metric}>
      <View style={[styles.metricIcon, { backgroundColor: tone === 'red' ? colors.redSoft : colors.softGreen }]}><Icon color={color} size={19} /></View>
      <View><Text style={styles.metricLabel}>{label}</Text><Text style={[styles.metricValue, tone === 'red' && styles.debt]}>{value}</Text><Text style={styles.metricHint}>{hint}</Text></View>
    </View>
  );
}

function SectionHeader({ title, subtitle, action, onPress }: { title: string; subtitle: string; action: string; onPress: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <View><Text style={styles.sectionTitle}>{title}</Text><Text style={styles.sectionSubtitle}>{subtitle}</Text></View>
      <Pressable onPress={onPress}><Text style={styles.sectionAction}>{action} →</Text></Pressable>
    </View>
  );
}

function AccountRow({ account, hidden, onPress }: { account: Account; hidden: boolean; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.accountRow, pressed && styles.pressed]} onPress={onPress}>
      <View style={[styles.accountBadge, { backgroundColor: `${account.color}18` }]}><Text style={[styles.accountBadgeText, { color: account.color }]}>{accountTypeMeta[account.type].short}</Text></View>
      <View style={styles.accountCardCopy}><Text style={styles.accountName}>{account.name}</Text><Text style={styles.accountMeta}>{account.institution}{account.last4 ? ` · ${account.last4}` : ''}</Text></View>
      <Text style={[styles.accountRowValue, account.type === 'credit' && styles.debt]}>{formatMoney(account.balance, hidden)}</Text>
    </Pressable>
  );
}

function Reminder({ title, meta, value, alert }: { title: string; meta: string; value: string; alert?: boolean }) {
  return (
    <View style={styles.reminder}>
      <View style={[styles.reminderDot, alert && styles.reminderDotAlert]} />
      <View style={styles.reminderCopy}><Text style={styles.reminderTitle}>{title}</Text><Text style={styles.reminderMeta}>{meta}</Text></View>
      <Text style={[styles.reminderValue, alert && styles.debt]}>{value}</Text>
    </View>
  );
}

function AccountEditor({ value, onClose, onSave }: { value: Account | 'new' | null; onClose: () => void; onSave: (account: Account) => void }) {
  const existing = value && value !== 'new' ? value : undefined;
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [balance, setBalance] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [last4, setLast4] = useState('');
  const [limit, setLimit] = useState('');
  const [dueDay, setDueDay] = useState('');

  useEffect(() => {
    setName(existing?.name ?? '');
    setInstitution(existing?.institution ?? '');
    setBalance(existing ? String(existing.balance) : '');
    setType(existing?.type ?? 'bank');
    setLast4(existing?.last4 ?? '');
    setLimit(existing?.limit ? String(existing.limit) : '');
    setDueDay(existing?.dueDay ? String(existing.dueDay) : '');
  }, [existing, value]);

  const submit = () => {
    if (!name.trim() || !Number.isFinite(Number(balance))) return;
    onSave({
      id: existing?.id ?? uid('account'),
      name: name.trim(),
      institution: institution.trim() || accountTypeMeta[type].label,
      balance: Number(balance),
      type,
      last4: last4.trim() || undefined,
      limit: type === 'credit' ? Number(limit) || 0 : undefined,
      dueDay: type === 'credit' ? Number(dueDay) || undefined : undefined,
      color: existing?.color ?? (type === 'credit' ? '#29333A' : '#2F766E'),
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <EditorShell visible={Boolean(value)} title={existing ? '更新账户余额' : '添加账户'} subtitle="只填写当前余额，不记录每笔收支。" onClose={onClose}>
      <Text style={styles.fieldLabel}>账户类型</Text>
      <View style={styles.typeRow}>
        {(Object.keys(accountTypeMeta) as AccountType[]).map((key) => (
          <Pressable key={key} style={[styles.typeItem, type === key && styles.typeItemActive]} onPress={() => setType(key)}>
            <Text style={[styles.typeText, type === key && styles.typeTextActive]}>{accountTypeMeta[key].label}</Text>
          </Pressable>
        ))}
      </View>
      <Field label="账户名称" value={name} onChangeText={setName} placeholder="例如：工资卡" />
      <View style={styles.formRow}>
        <Field label="机构" value={institution} onChangeText={setInstitution} placeholder="例如：招商银行" half />
        <Field label="尾号（可选）" value={last4} onChangeText={setLast4} placeholder="四位数字" half />
      </View>
      <Field label={type === 'credit' ? '当前应还' : '当前余额'} value={balance} onChangeText={setBalance} placeholder="0.00" numeric />
      {type === 'credit' ? <View style={styles.formRow}><Field label="信用额度" value={limit} onChangeText={setLimit} placeholder="50000" numeric half /><Field label="还款日" value={dueDay} onChangeText={setDueDay} placeholder="1–31" numeric half /></View> : null}
      <Pressable style={styles.saveButton} onPress={submit}><Check color={colors.white} size={17} /><Text style={styles.saveText}>保存账户</Text></Pressable>
    </EditorShell>
  );
}

function LoanEditor({ value, onClose, onSave }: { value: Loan | 'new' | null; onClose: () => void; onSave: (loan: Loan) => void }) {
  const existing = value && value !== 'new' ? value : undefined;
  const [direction, setDirection] = useState<LoanDirection>('lent');
  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [repaid, setRepaid] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    setDirection(existing?.direction ?? 'lent');
    setPerson(existing?.person ?? '');
    setAmount(existing ? String(existing.amount) : '');
    setRepaid(existing ? String(existing.repaid) : '0');
    setDueDate(existing?.dueDate ?? '');
    setNote(existing?.note ?? '');
  }, [existing, value]);

  const submit = () => {
    if (!person.trim() || !Number.isFinite(Number(amount))) return;
    onSave({
      id: existing?.id ?? uid('loan'),
      direction,
      person: person.trim(),
      amount: Number(amount),
      repaid: Number(repaid) || 0,
      dueDate,
      note: note.trim(),
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    });
  };

  return (
    <EditorShell visible={Boolean(value)} title={existing ? '更新借贷记录' : '添加借贷记录'} subtitle="借出计入资产，借入计入负债。" onClose={onClose}>
      <View style={styles.directionRow}>
        <Pressable style={[styles.directionItem, direction === 'lent' && styles.directionActive]} onPress={() => setDirection('lent')}><ArrowUpRight color={direction === 'lent' ? colors.white : colors.green700} size={19} /><Text style={[styles.directionText, direction === 'lent' && styles.directionTextActive]}>我借出</Text></Pressable>
        <Pressable style={[styles.directionItem, direction === 'borrowed' && styles.directionActive]} onPress={() => setDirection('borrowed')}><ArrowDownLeft color={direction === 'borrowed' ? colors.white : colors.red} size={19} /><Text style={[styles.directionText, direction === 'borrowed' && styles.directionTextActive]}>我借入</Text></Pressable>
      </View>
      <Field label="对方" value={person} onChangeText={setPerson} placeholder="姓名或称呼" />
      <View style={styles.formRow}><Field label="金额" value={amount} onChangeText={setAmount} placeholder="0.00" numeric half /><Field label="已归还" value={repaid} onChangeText={setRepaid} placeholder="0.00" numeric half /></View>
      <Field label="约定日期" value={dueDate} onChangeText={setDueDate} placeholder="YYYY-MM-DD" />
      <Field label="备注" value={note} onChangeText={setNote} placeholder="用途或约定" />
      <Pressable style={styles.saveButton} onPress={submit}><Check color={colors.white} size={17} /><Text style={styles.saveText}>保存记录</Text></Pressable>
    </EditorShell>
  );
}

function EditorShell({ visible, title, subtitle, onClose, children }: { visible: boolean; title: string; subtitle: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}><View><Text style={styles.modalTitle}>{title}</Text><Text style={styles.modalSubtitle}>{subtitle}</Text></View><Pressable style={styles.iconButton} onPress={onClose}><X color={colors.textMuted} size={19} /></Pressable></View>
          <ScrollView contentContainerStyle={styles.modalBody}>{children}</ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function Field({ label, value, onChangeText, placeholder, numeric, half }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; numeric?: boolean; half?: boolean }) {
  return (
    <View style={[styles.field, half && styles.fieldHalf]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput style={styles.input} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.textSoft} keyboardType={numeric ? 'decimal-pad' : 'default'} />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { backgroundColor: colors.background, flex: 1 },
  page: { gap: 18, marginHorizontal: 'auto', maxWidth: 1360, padding: 38, paddingBottom: 70, width: '100%' },
  pageCompact: { padding: 18, paddingBottom: 104 },
  header: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  headerCompact: { alignItems: 'stretch', flexDirection: 'column', gap: 18 },
  eyebrow: { color: colors.green700, fontSize: 11, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  title: { color: colors.text, fontFamily: 'serif', fontSize: 31, fontWeight: '700', marginTop: 8 },
  subtitle: { color: colors.textMuted, fontSize: 12, marginTop: 8 },
  headerActions: { flexDirection: 'row', gap: 10 },
  iconButton: { alignItems: 'center', borderColor: colors.line, borderRadius: 9, borderWidth: 1, height: 40, justifyContent: 'center', width: 40 },
  primaryButton: { alignItems: 'center', backgroundColor: colors.green700, borderRadius: 9, flexDirection: 'row', gap: 8, height: 40, paddingHorizontal: 16 },
  primaryText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  segment: { alignSelf: 'flex-start', backgroundColor: '#EAECE8', borderRadius: 10, flexDirection: 'row', padding: 3 },
  segmentItem: { borderRadius: 8, paddingHorizontal: 16, paddingVertical: 9 },
  segmentActive: { backgroundColor: colors.card },
  segmentText: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  segmentTextActive: { color: colors.green800, fontWeight: '800' },
  hero: { backgroundColor: colors.green900, borderRadius: 18, flexDirection: 'row', overflow: 'hidden', padding: 28 },
  heroCompact: { flexDirection: 'column', gap: 26 },
  heroMain: { flex: 1.2 },
  heroLabel: { alignItems: 'center', flexDirection: 'row', gap: 7 },
  heroLabelText: { color: '#C7D8D4', fontSize: 11 },
  heroValue: { color: colors.white, fontSize: 42, fontWeight: '800', letterSpacing: -1.4, marginTop: 8 },
  heroValueCompact: { fontSize: 32 },
  heroHint: { color: '#AAC4BE', fontSize: 11, marginTop: 10 },
  heroStats: { alignItems: 'center', flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  heroStatLabel: { color: '#9DB9B2', fontSize: 10 },
  heroStatValue: { color: colors.white, fontSize: 17, fontWeight: '800', marginTop: 7 },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metric: { alignItems: 'center', backgroundColor: colors.card, borderColor: colors.line, borderRadius: 14, borderWidth: 1, flex: 1, flexDirection: 'row', gap: 12, minWidth: 220, padding: 16 },
  metricIcon: { alignItems: 'center', borderRadius: 12, height: 42, justifyContent: 'center', width: 42 },
  metricLabel: { color: colors.textMuted, fontSize: 10 },
  metricValue: { color: colors.text, fontSize: 17, fontWeight: '800', marginTop: 4 },
  metricHint: { color: colors.textSoft, fontSize: 9, marginTop: 4 },
  debt: { color: colors.red },
  columns: { alignItems: 'stretch', flexDirection: 'row', gap: 18 },
  columnsCompact: { flexDirection: 'column' },
  panel: { ...shadow.soft, backgroundColor: colors.card, borderColor: colors.line, borderRadius: 16, borderWidth: 1, flex: 1, padding: 20 },
  panelWide: { flex: 1.35 },
  sectionHeader: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 17 },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  sectionSubtitle: { color: colors.textSoft, fontSize: 10, marginTop: 5 },
  sectionAction: { color: colors.green700, fontSize: 10, fontWeight: '700' },
  accountList: { gap: 1 },
  accountRow: { alignItems: 'center', borderBottomColor: colors.line, borderBottomWidth: 1, flexDirection: 'row', gap: 11, minHeight: 62 },
  accountBadge: { alignItems: 'center', borderRadius: 10, height: 36, justifyContent: 'center', width: 36 },
  accountBadgeText: { fontSize: 13, fontWeight: '800' },
  accountCardCopy: { flex: 1 },
  accountName: { color: colors.text, fontSize: 12, fontWeight: '700' },
  accountMeta: { color: colors.textSoft, fontSize: 9, marginTop: 4 },
  accountRowValue: { color: colors.text, fontSize: 12, fontWeight: '800' },
  reminder: { alignItems: 'center', borderBottomColor: colors.line, borderBottomWidth: 1, flexDirection: 'row', gap: 10, minHeight: 62 },
  reminderDot: { backgroundColor: colors.green600, borderRadius: 4, height: 8, width: 8 },
  reminderDotAlert: { backgroundColor: colors.red },
  reminderCopy: { flex: 1 },
  reminderTitle: { color: colors.text, fontSize: 11, fontWeight: '700' },
  reminderMeta: { color: colors.textSoft, fontSize: 9, marginTop: 4 },
  reminderValue: { color: colors.text, fontSize: 11, fontWeight: '800' },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  accountCard: { backgroundColor: '#FCFCFA', borderColor: colors.line, borderRadius: 14, borderWidth: 1, flexGrow: 1, minHeight: 190, minWidth: 280, overflow: 'hidden', padding: 18, width: '31%' },
  accountAccent: { height: 3, left: 0, position: 'absolute', right: 0, top: 0 },
  accountCardTop: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  balanceLabel: { color: colors.textMuted, fontSize: 10, marginTop: 25 },
  balance: { color: colors.text, fontSize: 24, fontWeight: '800', marginTop: 5 },
  updated: { color: colors.textSoft, fontSize: 9, marginTop: 'auto', paddingTop: 22 },
  pressed: { opacity: 0.72 },
  loanSummary: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 18 },
  loanRow: { alignItems: 'center', borderBottomColor: colors.line, borderBottomWidth: 1, flexDirection: 'row', gap: 12, minHeight: 78 },
  loanIcon: { alignItems: 'center', backgroundColor: colors.softGreen, borderRadius: 11, height: 40, justifyContent: 'center', width: 40 },
  loanIconBorrowed: { backgroundColor: colors.redSoft },
  loanCopy: { flex: 1 },
  loanPerson: { color: colors.text, fontSize: 13, fontWeight: '800' },
  loanMeta: { color: colors.textSoft, fontSize: 10, marginTop: 5 },
  loanValueWrap: { alignItems: 'flex-end' },
  loanValue: { color: colors.text, fontSize: 13, fontWeight: '800' },
  loanDirection: { color: colors.textSoft, fontSize: 9, marginTop: 4 },
  overlay: { alignItems: 'center', backgroundColor: colors.backdrop, flex: 1, justifyContent: 'center', padding: 18 },
  modal: { backgroundColor: colors.card, borderRadius: 18, maxHeight: '92%', maxWidth: '100%', overflow: 'hidden', width: 620 },
  modalHeader: { alignItems: 'flex-start', borderBottomColor: colors.line, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  modalTitle: { color: colors.text, fontFamily: 'serif', fontSize: 21, fontWeight: '700' },
  modalSubtitle: { color: colors.textMuted, fontSize: 10, marginTop: 5 },
  modalBody: { padding: 20 },
  field: { marginBottom: 15 },
  fieldHalf: { flex: 1 },
  fieldLabel: { color: colors.text, fontSize: 10, fontWeight: '700', marginBottom: 7 },
  input: { backgroundColor: '#FBFBF9', borderColor: colors.line, borderRadius: 9, borderWidth: 1, color: colors.text, fontSize: 12, height: 44, outlineStyle: 'none', paddingHorizontal: 12 } as never,
  formRow: { flexDirection: 'row', gap: 12 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 18 },
  typeItem: { borderColor: colors.line, borderRadius: 8, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 8 },
  typeItemActive: { backgroundColor: colors.softGreen, borderColor: colors.green200 },
  typeText: { color: colors.textMuted, fontSize: 10 },
  typeTextActive: { color: colors.green800, fontWeight: '800' },
  saveButton: { alignItems: 'center', backgroundColor: colors.green700, borderRadius: 10, flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: 6, minHeight: 44 },
  saveText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  directionRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  directionItem: { alignItems: 'center', borderColor: colors.line, borderRadius: 10, borderWidth: 1, flex: 1, flexDirection: 'row', gap: 8, justifyContent: 'center', minHeight: 52 },
  directionActive: { backgroundColor: colors.green700, borderColor: colors.green700 },
  directionText: { color: colors.text, fontSize: 11, fontWeight: '700' },
  directionTextActive: { color: colors.white },
});
