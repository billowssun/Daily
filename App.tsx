import { StatusBar } from 'expo-status-bar';
import {
  CalendarDays,
  CheckSquare,
  ChevronRight,
  CircleCheck,
  Home,
  Image as ImageIcon,
  Mic,
  PenLine,
  Plus,
  Search,
  Type,
  UserRound,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { aiSummary, financeSummary, initialTasks, weekDays } from './src/data/mock';
import { colors, radius, shadow } from './src/theme';

type TabKey = 'home' | 'todo' | 'note' | 'calendar' | 'me';

const tabs: Array<{ key: TabKey; label: string; icon: typeof Home }> = [
  { key: 'home', label: '首页', icon: Home },
  { key: 'todo', label: '待办', icon: CheckSquare },
  { key: 'note', label: '随记', icon: PenLine },
  { key: 'calendar', label: '日历', icon: CalendarDays },
  { key: 'me', label: '我的', icon: UserRound },
];

export default function App() {
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [tasks, setTasks] = useState(initialTasks);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [toast, setToast] = useState('早上好，愿你今天专注而从容');

  const completedCount = tasks.filter((task) => task.done).length;
  const progress = completedCount / tasks.length;
  const compact = width < 390;

  const toggleTask = (id: string) => {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
    );
  };

  const quickAction = (label: string) => {
    setToast(`${label}已准备好`);
    setSheetVisible(false);
  };

  const content = useMemo(() => {
    if (activeTab !== 'home') {
      const current = tabs.find((tab) => tab.key === activeTab);
      return (
        <View style={styles.placeholderWrap}>
          <View style={styles.placeholderIcon}>
            {current ? <current.icon size={30} color={colors.green700} /> : null}
          </View>
          <Text style={styles.placeholderTitle}>{current?.label}</Text>
          <Text style={styles.placeholderText}>这个模块已预留入口，下一版可以继续扩展完整功能。</Text>
        </View>
      );
    }

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, compact && styles.scrollContentCompact]}
      >
        <Header />

        <Pressable
          style={({ pressed }) => [styles.searchBar, pressed && styles.pressed]}
          onPress={() => setSheetVisible(true)}
        >
          <Search size={20} color={colors.textMuted} />
          <Text style={styles.searchText} numberOfLines={1}>
            快速添加待办 / 随记 / 搜索
          </Text>
          <View style={styles.searchAdd}>
            <Plus size={24} color={colors.white} strokeWidth={2.5} />
          </View>
        </Pressable>

        <View style={[styles.heroGrid, compact && styles.stackGrid]}>
          <TodoCard tasks={tasks} completedCount={completedCount} progress={progress} onToggle={toggleTask} />
          <QuickNotes onAction={quickAction} />
        </View>

        <WeekCalendar />

        <View style={[styles.summaryGrid, compact && styles.stackGrid]}>
          <AiCard compact={compact} />
          <FinanceCard compact={compact} />
        </View>
      </ScrollView>
    );
  }, [activeTab, compact, completedCount, progress, tasks]);

  return (
    <SafeAreaView style={styles.appShell}>
      <StatusBar style="dark" />
      {content}
      <Text style={styles.toast} numberOfLines={1}>
        {toast}
      </Text>
      <BottomTabs activeTab={activeTab} onChange={setActiveTab} onCenterPress={() => setSheetVisible(true)} />
      <ActionSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} onAction={quickAction} />
    </SafeAreaView>
  );
}

function Header() {
  return (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Text style={styles.brand}>日序</Text>
        <Text style={styles.date}>2024年5月20日  星期一</Text>
        <Text style={styles.greeting}>早上好，愿你今天专注而从容</Text>
      </View>
      <View style={styles.avatar}>
        <PlantAvatar />
      </View>
    </View>
  );
}

function TodoCard({
  tasks,
  completedCount,
  progress,
  onToggle,
}: {
  tasks: typeof initialTasks;
  completedCount: number;
  progress: number;
  onToggle: (id: string) => void;
}) {
  return (
    <View style={[styles.card, styles.todoCard]}>
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <CheckSquare size={18} color={colors.green700} />
          <Text style={styles.cardTitle}>今日待办</Text>
        </View>
        <Text style={styles.cardMeta}>
          {completedCount}/{tasks.length}
        </Text>
      </View>

      <View style={styles.taskList}>
        {tasks.slice(0, 4).map((task) => (
          <Pressable key={task.id} style={styles.taskRow} onPress={() => onToggle(task.id)}>
            <View style={[styles.checkbox, task.done && styles.checkboxDone]}>
              {task.done ? <CircleCheck size={13} color={colors.white} strokeWidth={3} /> : null}
            </View>
            <Text style={[styles.taskText, task.done && styles.taskDone]} numberOfLines={1}>
              {task.title}
            </Text>
            <Text style={styles.taskTime}>{task.time}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>
    </View>
  );
}

function QuickNotes({ onAction }: { onAction: (label: string) => void }) {
  const actions = [
    { label: '语音记录', caption: '一键录入', icon: Mic },
    { label: '图片记录', caption: '拍照 / 选图', icon: ImageIcon },
    { label: '文字记录', caption: '快速输入', icon: Type },
  ];

  return (
    <View style={[styles.card, styles.noteCard]}>
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <PenLine size={18} color={colors.green700} />
          <Text style={styles.cardTitle}>快速随记</Text>
        </View>
      </View>
      {actions.map((action) => (
        <Pressable key={action.label} style={styles.noteAction} onPress={() => onAction(action.label)}>
          <action.icon size={22} color={colors.green700} />
          <View style={styles.noteTextWrap}>
            <Text style={styles.noteLabel} numberOfLines={1}>
              {action.label}
            </Text>
            <Text style={styles.noteCaption} numberOfLines={1}>
              {action.caption}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

function WeekCalendar() {
  return (
    <View style={[styles.card, styles.weekCard]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>本周日历</Text>
        <View style={styles.viewAll}>
          <Text style={styles.viewAllText}>查看全部</Text>
          <ChevronRight size={16} color={colors.textSoft} />
        </View>
      </View>
      <View style={styles.daysRow}>
        {weekDays.map((day) => (
          <View key={day.date} style={styles.dayCell}>
            <Text style={[styles.dayName, day.active && styles.dayActiveText]}>{day.name}</Text>
            <View style={[styles.dayNumberWrap, day.active && styles.dayActive]}>
              <Text style={[styles.dayNumber, day.active && styles.dayActiveNumber]}>{day.date}</Text>
            </View>
            <View style={styles.eventDots}>
              {day.events.map((event, index) => (
                <View key={`${event}-${index}`} style={[styles.eventDot, { backgroundColor: event }]} />
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function AiCard({ compact }: { compact: boolean }) {
  return (
    <View style={[styles.card, styles.metricCard]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>AI 回顾</Text>
        <Text style={styles.cardMeta}>本周总结</Text>
      </View>
      <Text style={styles.aiText}>你的专注度高于上周，完成了 {aiSummary.done} 项任务，继续保持。</Text>
      <View style={styles.aiMetrics}>
        <ProgressRing value={aiSummary.focus} size={compact ? 48 : 52} color={colors.cyan600} />
        <View style={styles.metricMini}>
          <Text style={styles.metricValue}>{aiSummary.done}</Text>
          <Text style={styles.metricLabel}>已完成</Text>
        </View>
        <View style={styles.metricMini}>
          <Text style={styles.metricValue}>{aiSummary.hours}h</Text>
          <Text style={styles.metricLabel}>专注时长</Text>
        </View>
      </View>
      <MiniBars values={aiSummary.trend} />
    </View>
  );
}

function FinanceCard({ compact }: { compact: boolean }) {
  return (
    <View style={[styles.card, styles.metricCard]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>财务总览</Text>
        <Text style={styles.cardMeta}>资产净值</Text>
      </View>
      <Text style={styles.money}>¥ {financeSummary.total.toLocaleString('zh-CN')}</Text>
      <Text style={styles.positive}>较上月 +{financeSummary.growth}%</Text>
      <View style={styles.financeBody}>
        <DonutChart size={compact ? 70 : 78} />
        <View style={styles.legend}>
          {financeSummary.allocation.map((item) => (
            <View key={item.label} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.legendText} numberOfLines={1}>
                {item.label} {item.value}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function BottomTabs({
  activeTab,
  onChange,
  onCenterPress,
}: {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
  onCenterPress: () => void;
}) {
  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.key;
        const isCenter = tab.key === 'note';

        if (isCenter) {
          return (
            <Pressable key={tab.key} style={styles.centerTabWrap} onPress={onCenterPress}>
              <View style={styles.centerTab}>
                <PenLine size={28} color={colors.white} />
              </View>
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
            </Pressable>
          );
        }

        return (
          <Pressable key={tab.key} style={styles.tabItem} onPress={() => onChange(tab.key)}>
            <Icon size={22} color={active ? colors.green700 : colors.textSoft} />
            <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ActionSheet({
  visible,
  onClose,
  onAction,
}: {
  visible: boolean;
  onClose: () => void;
  onAction: (label: string) => void;
}) {
  const actions = [
    { label: '添加待办', icon: CheckSquare },
    { label: '记录灵感', icon: PenLine },
    { label: '安排日程', icon: CalendarDays },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.sheet}>
          <Text style={styles.sheetTitle}>快速开始</Text>
          {actions.map((action) => (
            <Pressable key={action.label} style={styles.sheetAction} onPress={() => onAction(action.label)}>
              <View style={styles.sheetActionIcon}>
                <action.icon size={22} color={colors.green700} />
              </View>
              <Text style={styles.sheetActionText}>{action.label}</Text>
              <ChevronRight size={18} color={colors.textSoft} />
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function ProgressRing({ value, size, color }: { value: number; size: number; color: string }) {
  const stroke = 6;
  const radiusValue = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radiusValue;
  const offset = circumference * (1 - value / 100);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radiusValue}
          stroke={colors.line}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radiusValue}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.ringCenter}>
        <Text style={styles.ringText}>{value}%</Text>
      </View>
    </View>
  );
}

function MiniBars({ values }: { values: number[] }) {
  const max = Math.max(...values);

  return (
    <View style={styles.bars}>
      {values.map((value, index) => (
        <View
          key={`${value}-${index}`}
          style={[
            styles.bar,
            {
              height: 10 + (value / max) * 26,
              backgroundColor: index === values.length - 1 ? colors.green600 : colors.sage300,
            },
          ]}
        />
      ))}
    </View>
  );
}

function DonutChart({ size }: { size: number }) {
  const stroke = 12;
  const radiusValue = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radiusValue;
  let offset = 0;

  return (
    <Svg width={size} height={size}>
      <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
        {financeSummary.allocation.map((item) => {
          const dash = (item.value / 100) * circumference;
          const segment = (
            <Circle
              key={item.label}
              cx={size / 2}
              cy={size / 2}
              r={radiusValue}
              stroke={item.color}
              strokeWidth={stroke}
              fill="none"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
            />
          );
          offset += dash;
          return segment;
        })}
      </G>
      <Circle cx={size / 2} cy={size / 2} r={radiusValue - stroke / 2} fill={colors.card} />
    </Svg>
  );
}

function PlantAvatar() {
  return (
    <Svg width={42} height={42} viewBox="0 0 42 42">
      <Circle cx="21" cy="21" r="21" fill={colors.avatarBg} />
      <Path d="M21 26C18 18 19 12 21 8C24 13 24 20 21 26Z" fill={colors.green600} />
      <Path d="M20 25C13 20 11 16 10 11C16 12 20 17 20 25Z" fill={colors.sage500} />
      <Path d="M22 25C29 20 31 16 32 11C26 12 22 17 22 25Z" fill={colors.sage500} />
      <Rect x="14" y="26" width="14" height="9" rx="3" fill={colors.clay200} />
      <Path d="M16 26H26L24 36H18L16 26Z" fill={colors.clay300} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingTop: 42,
    paddingHorizontal: 20,
    paddingBottom: 126,
    gap: 14,
  },
  scrollContentCompact: {
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    paddingRight: 12,
  },
  brand: {
    color: colors.green800,
    fontSize: 38,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 45,
  },
  date: {
    color: colors.textMuted,
    fontSize: 15,
    marginTop: 4,
  },
  greeting: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '500',
    marginTop: 8,
  },
  avatar: {
    ...shadow.soft,
    backgroundColor: colors.card,
    borderRadius: 25,
    padding: 4,
  },
  searchBar: {
    ...shadow.soft,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 28,
    flexDirection: 'row',
    gap: 10,
    minHeight: 56,
    paddingLeft: 18,
    paddingRight: 8,
  },
  searchText: {
    color: colors.textSoft,
    flex: 1,
    fontSize: 16,
  },
  searchAdd: {
    alignItems: 'center',
    backgroundColor: colors.green600,
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  heroGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  stackGrid: {
    flexDirection: 'column',
  },
  card: {
    ...shadow.soft,
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderRadius: radius.card,
    borderWidth: 1,
  },
  todoCard: {
    flex: 1.35,
    minHeight: 210,
    padding: 14,
  },
  noteCard: {
    flex: 1,
    minHeight: 194,
    padding: 12,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  cardMeta: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  taskList: {
    gap: 12,
  },
  taskRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    minHeight: 24,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: colors.lineDark,
    borderRadius: 6,
    borderWidth: 1.5,
    height: 18,
    justifyContent: 'center',
    width: 18,
  },
  checkboxDone: {
    backgroundColor: colors.green600,
    borderColor: colors.green600,
  },
  taskText: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
  },
  taskDone: {
    color: colors.textSoft,
    textDecorationLine: 'line-through',
  },
  taskTime: {
    color: colors.textSoft,
    fontSize: 12,
  },
  progressTrack: {
    backgroundColor: colors.line,
    borderRadius: 999,
    height: 8,
    marginTop: 'auto',
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.green600,
    borderRadius: 999,
    height: '100%',
  },
  noteAction: {
    alignItems: 'center',
    backgroundColor: colors.softGreen,
    borderColor: colors.cardBorder,
    borderRadius: radius.control,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    minHeight: 44,
    paddingHorizontal: 12,
  },
  noteTextWrap: {
    flex: 1,
  },
  noteLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  noteCaption: {
    color: colors.textSoft,
    fontSize: 11,
    marginTop: 2,
  },
  weekCard: {
    padding: 14,
  },
  viewAll: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  viewAllText: {
    color: colors.textSoft,
    fontSize: 13,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCell: {
    alignItems: 'center',
    flex: 1,
    gap: 5,
  },
  dayName: {
    color: colors.textSoft,
    fontSize: 13,
  },
  dayActiveText: {
    color: colors.green700,
    fontWeight: '700',
  },
  dayNumberWrap: {
    alignItems: 'center',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  dayActive: {
    backgroundColor: colors.green600,
  },
  dayNumber: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  dayActiveNumber: {
    color: colors.white,
  },
  eventDots: {
    flexDirection: 'row',
    gap: 3,
    height: 5,
  },
  eventDot: {
    borderRadius: 3,
    height: 5,
    width: 5,
  },
  metricCard: {
    flex: 1,
    minHeight: 210,
    padding: 14,
  },
  aiText: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 20,
  },
  aiMetrics: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  metricMini: {
    alignItems: 'center',
  },
  metricValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  metricLabel: {
    color: colors.textSoft,
    fontSize: 11,
    marginTop: 3,
  },
  ringCenter: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  ringText: {
    color: colors.green700,
    fontSize: 13,
    fontWeight: '800',
  },
  bars: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 5,
    height: 38,
    justifyContent: 'center',
    marginTop: 13,
  },
  bar: {
    borderRadius: 999,
    width: 7,
  },
  money: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '800',
    marginTop: 2,
  },
  positive: {
    color: colors.green600,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 5,
  },
  financeBody: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  legend: {
    flex: 1,
    gap: 5,
  },
  legendRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  legendDot: {
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  legendText: {
    color: colors.textMuted,
    flex: 1,
    fontSize: 11,
  },
  tabBar: {
    ...shadow.tab,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    bottom: 0,
    flexDirection: 'row',
    height: 88,
    justifyContent: 'space-around',
    left: 0,
    paddingBottom: 18,
    paddingHorizontal: 10,
    position: 'absolute',
    right: 0,
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
    gap: 5,
  },
  centerTabWrap: {
    alignItems: 'center',
    flex: 1,
    gap: 3,
    marginTop: -30,
  },
  centerTab: {
    ...shadow.float,
    alignItems: 'center',
    backgroundColor: colors.green600,
    borderColor: colors.card,
    borderRadius: 30,
    borderWidth: 4,
    height: 62,
    justifyContent: 'center',
    width: 62,
  },
  tabLabel: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: colors.green700,
  },
  toast: {
    alignSelf: 'center',
    backgroundColor: colors.toast,
    borderRadius: 999,
    bottom: 98,
    color: colors.green800,
    fontSize: 12,
    fontWeight: '600',
    maxWidth: '82%',
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 7,
    position: 'absolute',
  },
  modalBackdrop: {
    backgroundColor: colors.backdrop,
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingBottom: 36,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sheetTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
  },
  sheetAction: {
    alignItems: 'center',
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 58,
  },
  sheetActionIcon: {
    alignItems: 'center',
    backgroundColor: colors.softGreen,
    borderRadius: 17,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  sheetActionText: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  placeholderWrap: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  placeholderIcon: {
    alignItems: 'center',
    backgroundColor: colors.softGreen,
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    marginBottom: 18,
    width: 60,
  },
  placeholderTitle: {
    color: colors.green800,
    fontSize: 28,
    fontWeight: '800',
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 23,
    marginTop: 10,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
});
