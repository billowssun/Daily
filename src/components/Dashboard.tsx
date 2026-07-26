import {
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  Circle,
  CircleDollarSign,
  CloudSun,
  Dumbbell,
  Flag,
  NotebookPen,
  Pencil,
  Trash2,
  Users,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { colors } from '../theme';
import type { Note, TabKey, Task } from '../types';

type DashboardProps = {
  isDesktop: boolean;
  notes: Note[];
  tasks: Task[];
  onCreateNote: () => void;
  onCreateTask: () => void;
  onNavigate: (tab: TabKey) => void;
  onToggleTask: (id: string) => void;
  onEditTask: (task: Task) => void;
};

const week = [
  ['周一', '20', '2 事项'],
  ['周二', '21', '3 事项'],
  ['周三', '22', '4 事项'],
  ['周四', '23', '2 事项'],
  ['周五', '24', '5 事项'],
  ['周六', '25', '1 事项'],
  ['今天 周日', '26', '3 事项'],
  ['周一', '27', '2 事项'],
];

const timeMap: Record<string, string> = {
  'task-run': '07:30',
  'task-reading': '09:00',
  'task-design-review': '10:30',
  'task-weekly': '14:00',
  'task-card': '16:00',
  lunch: '12:30',
  'family-dinner': '19:30',
  'bedtime-reading': '22:30',
};

const durationMap: Record<string, string> = {
  'task-run': '45 分钟',
  'task-reading': '60 分钟',
  'task-design-review': '90 分钟',
  'task-weekly': '60 分钟',
  'task-card': '10 分钟',
  lunch: '60 分钟',
  'family-dinner': '90 分钟',
  'bedtime-reading': '30 分钟',
};

const ambientTasks: Task[] = [
  { id: 'lunch', title: '午餐与散步', detail: '离开屏幕，慢慢吃一顿午餐。', dueDate: '2026-07-26', done: false, createdAt: '', updatedAt: '' },
  { id: 'family-dinner', title: '与家人晚餐', detail: '留出完整的晚餐时间，不看工作消息。', dueDate: '2026-07-26', done: false, createdAt: '', updatedAt: '' },
  { id: 'bedtime-reading', title: '睡前阅读', detail: '睡前读半小时，不再处理工作消息。', dueDate: '2026-07-26', done: false, createdAt: '', updatedAt: '' },
];

export function Dashboard({
  isDesktop,
  notes,
  tasks,
  onCreateNote,
  onCreateTask,
  onNavigate,
  onToggleTask,
  onEditTask,
}: DashboardProps) {
  const { width } = useWindowDimensions();
  const todayTasks = useMemo(() => tasks.filter((task) => task.dueDate === '2026-07-26'), [tasks]);
  const scheduleTasks = useMemo(
    () => [...todayTasks, ...ambientTasks].sort((a, b) => (timeMap[a.id] ?? '12:30').localeCompare(timeMap[b.id] ?? '12:30')),
    [todayTasks],
  );
  const [selectedId, setSelectedId] = useState(todayTasks.find((task) => task.id === 'task-design-review')?.id ?? todayTasks[0]?.id);
  const selected = scheduleTasks.find((task) => task.id === selectedId);
  const compact = width < 1120;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.page, !isDesktop && styles.pageMobile]}
      showsVerticalScrollIndicator={false}
    >
      <WeekRail isDesktop={isDesktop} onCalendar={() => onNavigate('calendar')} />

      <View style={[styles.workspace, compact && styles.workspaceCompact]}>
        <View style={[styles.dayColumn, !isDesktop && styles.dayColumnMobile]}>
          <View style={[styles.dayHeader, !isDesktop && styles.dayHeaderMobile]}>
            <View style={styles.dayTitleRow}>
              <Text style={styles.dayTitle}>周日</Text>
              <Text style={styles.dayDate}>7月26日</Text>
              <Text style={styles.lunar}>农历 六月十二</Text>
            </View>
            <View style={styles.weather}>
              {isDesktop ? <Text style={styles.weatherHint}>日序能带来专注与从容。</Text> : null}
              <CloudSun color={colors.amber} size={21} strokeWidth={1.7} />
              <Text style={styles.weatherText}>28° 多云</Text>
            </View>
          </View>

          <View style={styles.timeline}>
            {scheduleTasks.map((task) => (
              <TimelineItem
                key={task.id}
                task={task}
                selected={task.id === selectedId}
                onSelect={() => setSelectedId(task.id)}
                onToggle={() => todayTasks.some((item) => item.id === task.id) ? onToggleTask(task.id) : undefined}
              />
            ))}
          </View>

          <Pressable accessibilityRole="button" style={[styles.composer, isDesktop && styles.composerDesktop]} onPress={onCreateNote}>
            <View style={styles.composerTabs}>
              <Text style={styles.composerTabActive}>记一条</Text>
              <Text style={styles.composerTab}>记笔记</Text>
            </View>
            <Text style={styles.composerPlaceholder}>要做什么或记录什么…</Text>
            <View style={styles.composerFooter}>
              <View style={styles.composerMeta}>
                <CalendarDays color={colors.green700} size={15} />
                <Text style={styles.composerMetaText}>今天</Text>
                <Text style={styles.composerMetaText}># 分类</Text>
                <Flag color={colors.textSoft} size={14} />
                <Text style={styles.composerMetaText}>中等</Text>
              </View>
              <View style={styles.sendButton}>
                <NotebookPen color={colors.white} size={16} />
              </View>
            </View>
          </Pressable>
        </View>

        {isDesktop && !compact ? (
          <DetailPanel
            task={selected}
            notes={notes}
            onEdit={() => selected && (todayTasks.some((item) => item.id === selected.id) ? onEditTask(selected) : onCreateTask())}
            onToggle={() => selected && todayTasks.some((item) => item.id === selected.id) && onToggleTask(selected.id)}
            onFinance={() => onNavigate('finance')}
          />
        ) : null}
      </View>

      <LifePulse tasks={tasks} onNavigate={onNavigate} />
    </ScrollView>
  );
}

function WeekRail({ isDesktop, onCalendar }: { isDesktop: boolean; onCalendar: () => void }) {
  const visibleWeek = isDesktop ? week : [week[6], week[7], week[5], week[4], week[3], week[2], week[1], week[0]];
  return (
    <ScrollView
      horizontal
      contentContainerStyle={[styles.weekRail, isDesktop && styles.weekRailDesktop]}
      showsHorizontalScrollIndicator={false}
      style={styles.weekRailScroller}
    >
      {visibleWeek.map(([label, day, count]) => {
        const active = day === '26';
        return (
          <Pressable key={`${label}-${day}`} style={[styles.weekDay, active && styles.weekDayActive]} onPress={onCalendar}>
            <Text style={[styles.weekLabel, active && styles.weekLabelActive]}>{label}</Text>
            <Text style={[styles.weekNumber, active && styles.weekNumberActive]}>{day}</Text>
            <Text style={styles.weekCount}>{count}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function TimelineItem({
  task,
  selected,
  onSelect,
  onToggle,
  time = timeMap[task.id] ?? '12:30',
  duration = durationMap[task.id] ?? '60 分钟',
}: {
  task: Task;
  selected: boolean;
  onSelect: () => void;
  onToggle: () => void;
  time?: string;
  duration?: string;
}) {
  const financial = task.id === 'task-card';
  const Icon = financial ? CircleDollarSign : task.id === 'task-run' ? Dumbbell : task.id === 'task-design-review' ? Users : BookOpen;

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [styles.timelineRow, selected && styles.timelineRowSelected, pressed && styles.rowPressed]}
      onPress={onSelect}
    >
      <Text style={[styles.time, selected && styles.selectedTime, financial && styles.financialText]}>{time}</Text>
      <Pressable accessibilityLabel={task.done ? '标记为未完成' : '标记为完成'} style={[styles.check, selected && styles.checkSelected, task.done && styles.checkDone, financial && styles.checkFinancial]} onPress={onToggle}>
        {task.done ? <Check color={colors.white} size={13} strokeWidth={2.5} /> : selected ? <Circle color={colors.green700} fill={colors.green700} size={7} /> : null}
      </Pressable>
      <View style={styles.taskCopy}>
        <View style={styles.taskTitleRow}>
          <Text style={[styles.taskTitle, task.done && styles.taskDone, financial && styles.financialText]} numberOfLines={1}>
            {task.title}{financial ? '（招商 7,842 元）' : ''}
          </Text>
          <View style={styles.category}>
            <Icon color={financial ? colors.red : colors.textSoft} size={14} strokeWidth={1.6} />
            <Text style={styles.categoryText}>{financial ? '财务' : task.id === 'task-run' ? '运动' : task.id === 'task-design-review' ? '工作' : '成长'}</Text>
          </View>
        </View>
        {financial ? <Text style={styles.dueToday}>今天到期</Text> : null}
      </View>
      <Text style={styles.duration}>{duration}</Text>
    </Pressable>
  );
}

function DetailPanel({
  task,
  notes,
  onEdit,
  onToggle,
  onFinance,
}: {
  task?: Task;
  notes: Note[];
  onEdit: () => void;
  onToggle: () => void;
  onFinance: () => void;
}) {
  if (!task) {
    return (
      <View style={styles.detailPanel}>
        <Text style={styles.detailEmpty}>选择一件事，在这里查看详情。</Text>
      </View>
    );
  }

  const financial = task.id === 'task-card';

  return (
    <View style={styles.detailPanel}>
      <View style={styles.detailHeader}>
        <Text style={styles.detailTitle}>{task.title}</Text>
        <Text style={styles.close}>×</Text>
      </View>
      <View style={[styles.statusPill, financial && styles.statusPillFinancial]}>
        <Text style={[styles.statusText, financial && styles.financialText]}>{task.done ? '已完成' : financial ? '今天到期' : '进行中'}</Text>
      </View>
      <Text style={styles.detailMeta}>今天 10:30–12:00　·　90 分钟</Text>
      <Text style={styles.detailCategory}>▣ 工作</Text>
      <Text style={styles.detailBody}>{task.detail || '还没有补充说明。'}</Text>

      <View style={styles.detailSection}>
        <Text style={styles.detailSectionTitle}>相关笔记</Text>
        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>新版日历视图优化方案</Text>
          <Text style={styles.noteExcerpt} numberOfLines={2}>{notes[0]?.content || '聚焦周视图的信息密度与操作效率。'}</Text>
          <Text style={styles.noteDate}>更新于 7月24日</Text>
        </View>
      </View>

      <View style={styles.detailSection}>
        <Text style={styles.detailSectionTitle}>财务影响</Text>
        <Pressable style={[styles.financeImpact, financial && styles.financeImpactAlert]} onPress={onFinance}>
          <View>
            <Text style={[styles.financeTag, financial && styles.financialText]}>{financial ? '待还款' : '支出'}</Text>
            <Text style={styles.financeName}>{financial ? '招商银行信用卡' : 'Figma 年费（团队版）'}</Text>
            <Text style={styles.financeMeta}>工商银行（尾号 1234）</Text>
          </View>
          <Text style={[styles.financeValue, financial && styles.financialText]}>{financial ? '-7,842.00 元' : '-1,280.00 元'}</Text>
        </Pressable>
      </View>

      <View style={styles.detailActions}>
        <Pressable style={styles.detailAction} onPress={onToggle}><Check color={colors.green700} size={15} /><Text style={styles.detailActionText}>{task.done ? '恢复' : '完成'}</Text></Pressable>
        <Pressable style={styles.detailAction} onPress={onEdit}><Pencil color={colors.green700} size={15} /><Text style={styles.detailActionText}>编辑</Text></Pressable>
      </View>
      <Pressable style={styles.deleteAction}><Trash2 color={colors.textSoft} size={14} /><Text style={styles.deleteText}>删除事项</Text></Pressable>
    </View>
  );
}

function LifePulse({ tasks, onNavigate }: { tasks: Task[]; onNavigate: (tab: TabKey) => void }) {
  const done = tasks.filter((task) => task.done).length;
  return (
    <View style={styles.pulse}>
      <View style={styles.pulseHeader}>
        <Text style={styles.pulseTitle}>生活脉络</Text>
        <Text style={styles.pulseRange}>本周 7.20–7.26</Text>
      </View>
      <View style={styles.pulseGrid}>
        <View style={styles.pulseBlock}>
          <Text style={styles.pulseLabel}>未完成的事项</Text>
          <Text style={styles.pulseLine}>• 信用卡还款　<Text style={styles.dueInline}>今天到期</Text></Text>
          <Text style={styles.pulseLine}>• 体检预约　7/28 到期</Text>
          <Pressable onPress={() => onNavigate('todo')}><Text style={styles.pulseLink}>查看全部 →</Text></Pressable>
        </View>
        <View style={styles.pulseBlock}>
          <Text style={styles.pulseLabel}>本周承诺</Text>
          <Text style={styles.pulseMetric}>{done} / {tasks.length} 项</Text>
          <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.max(16, Math.round((done / Math.max(tasks.length, 1)) * 100))}%` }]} /></View>
          <Text style={styles.pulseHint}>保持节奏，不追求填满每一天。</Text>
        </View>
        <View style={styles.pulseBlock}>
          <Text style={styles.pulseLabel}>财务健康</Text>
          <Text style={styles.pulseMetric}>净资产　¥ 128,650</Text>
          <Text style={styles.positive}>较上周 +2,350</Text>
          <Pressable onPress={() => onNavigate('finance')}><Text style={styles.pulseLink}>进入财务 →</Text></Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { backgroundColor: colors.background, flex: 1 },
  page: { paddingBottom: 38 },
  pageMobile: { paddingBottom: 106 },
  weekRailScroller: {
    backgroundColor: colors.surface,
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexGrow: 0,
    height: 132,
  },
  weekRail: {
    height: 132,
    paddingHorizontal: 24,
  },
  weekRailDesktop: { minWidth: '100%' },
  weekDay: {
    alignItems: 'center',
    borderLeftColor: 'transparent',
    borderLeftWidth: 1,
    borderRightColor: 'transparent',
    borderRightWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minWidth: 94,
    paddingVertical: 16,
  },
  weekDayActive: { backgroundColor: '#FBFCF9', borderLeftColor: colors.line, borderRightColor: colors.line },
  weekLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  weekLabelActive: { color: colors.green700 },
  weekNumber: { color: colors.textMuted, fontSize: 13, marginTop: 13 },
  weekNumberActive: {
    backgroundColor: colors.green700,
    borderRadius: 18,
    color: colors.white,
    fontSize: 15,
    height: 36,
    lineHeight: 36,
    marginTop: 7,
    textAlign: 'center',
    width: 36,
  },
  weekCount: { color: colors.textSoft, fontSize: 11, marginTop: 12 },
  workspace: { flexDirection: 'row', marginHorizontal: 'auto', maxWidth: 1460, width: '100%' },
  workspaceCompact: { flexDirection: 'column' },
  dayColumn: { flex: 1, minWidth: 0, paddingHorizontal: 42, paddingVertical: 34, position: 'relative' },
  dayColumnMobile: { paddingHorizontal: 26, paddingVertical: 28 },
  dayHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  dayHeaderMobile: { alignItems: 'flex-start', flexDirection: 'column', gap: 10 },
  dayTitleRow: { alignItems: 'baseline', flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  dayTitle: { color: colors.text, fontFamily: 'serif', fontSize: 28, fontWeight: '700' },
  dayDate: { color: colors.text, fontFamily: 'serif', fontSize: 22, fontWeight: '600' },
  lunar: { color: colors.textSoft, fontSize: 11 },
  weather: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  weatherHint: { color: colors.textSoft, fontSize: 11, marginRight: 14 },
  weatherText: { color: colors.textMuted, fontSize: 12 },
  timeline: { borderColor: colors.green200, borderLeftWidth: 1, borderStyle: 'dashed', marginLeft: 63 },
  timelineRow: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    minHeight: 52,
    paddingHorizontal: 12,
    position: 'relative',
  },
  timelineRowSelected: { backgroundColor: '#E9F1F0' },
  rowPressed: { opacity: 0.76 },
  time: { color: colors.textSoft, fontSize: 12, left: -74, position: 'absolute', width: 54 },
  selectedTime: { color: colors.green700, fontWeight: '700' },
  check: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.textSoft,
    borderRadius: 10,
    borderWidth: 1,
    height: 20,
    justifyContent: 'center',
    marginLeft: -22,
    marginRight: 18,
    width: 20,
  },
  checkDone: { backgroundColor: colors.green700, borderColor: colors.green700 },
  checkSelected: { borderColor: colors.green700 },
  checkFinancial: { borderColor: colors.red },
  taskCopy: { flex: 1, minWidth: 0 },
  taskTitleRow: { alignItems: 'center', flexDirection: 'row', gap: 14 },
  taskTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
  taskDone: { color: colors.textMuted },
  financialText: { color: colors.red },
  category: { alignItems: 'center', flexDirection: 'row', gap: 5 },
  categoryText: { color: colors.textSoft, fontSize: 11 },
  dueToday: { color: colors.red, fontSize: 10, marginTop: 5 },
  duration: { color: colors.textSoft, fontSize: 10, marginLeft: 12 },
  composer: {
    alignSelf: 'center',
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 28,
    padding: 14,
    width: 300,
  },
  composerDesktop: {
    bottom: 34,
    left: '50%',
    marginTop: 0,
    position: 'absolute',
    transform: [{ translateX: -150 }],
    zIndex: 3,
  },
  composerTabs: { borderBottomColor: colors.line, borderBottomWidth: 1, flexDirection: 'row', gap: 18 },
  composerTabActive: { borderBottomColor: colors.green700, borderBottomWidth: 2, color: colors.text, fontSize: 12, fontWeight: '700', paddingBottom: 9 },
  composerTab: { color: colors.textSoft, fontSize: 12 },
  composerPlaceholder: { color: colors.textSoft, fontSize: 12, paddingVertical: 17 },
  composerFooter: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  composerMeta: { alignItems: 'center', flexDirection: 'row', gap: 7 },
  composerMetaText: { color: colors.textSoft, fontSize: 10 },
  sendButton: { alignItems: 'center', backgroundColor: colors.green700, borderRadius: 7, height: 32, justifyContent: 'center', width: 34 },
  detailPanel: {
    backgroundColor: colors.surface,
    borderLeftColor: colors.line,
    borderLeftWidth: 1,
    minHeight: 580,
    padding: 28,
    width: 420,
  },
  detailEmpty: { color: colors.textSoft, fontSize: 13, marginTop: 40, textAlign: 'center' },
  detailHeader: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  detailTitle: { color: colors.text, flex: 1, fontFamily: 'serif', fontSize: 21, fontWeight: '700' },
  close: { color: colors.textSoft, fontSize: 22 },
  statusPill: { alignSelf: 'flex-start', backgroundColor: colors.softGreen, borderRadius: 12, marginTop: 16, paddingHorizontal: 10, paddingVertical: 5 },
  statusPillFinancial: { backgroundColor: colors.redSoft },
  statusText: { color: colors.green700, fontSize: 10, fontWeight: '700' },
  detailMeta: { color: colors.textMuted, fontSize: 11, marginTop: 14 },
  detailCategory: { color: colors.textMuted, fontSize: 11, marginTop: 10 },
  detailBody: { color: colors.text, fontSize: 12, lineHeight: 19, marginTop: 14 },
  detailSection: { borderTopColor: colors.line, borderTopWidth: 1, marginTop: 22, paddingTop: 20 },
  detailSectionTitle: { color: colors.text, fontSize: 12, fontWeight: '700', marginBottom: 12 },
  noteCard: { borderColor: colors.line, borderRadius: 9, borderWidth: 1, padding: 13 },
  noteTitle: { color: colors.text, fontSize: 12, fontWeight: '700' },
  noteExcerpt: { color: colors.textMuted, fontSize: 10, lineHeight: 16, marginTop: 6 },
  noteDate: { color: colors.textSoft, fontSize: 9, marginTop: 8 },
  financeImpact: { alignItems: 'center', backgroundColor: '#FBFBF9', borderColor: colors.line, borderRadius: 9, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', padding: 13 },
  financeImpactAlert: { backgroundColor: colors.redSoft, borderColor: '#F2D4D0' },
  financeTag: { color: colors.red, fontSize: 10, fontWeight: '700' },
  financeName: { color: colors.text, fontSize: 11, fontWeight: '700', marginTop: 7 },
  financeMeta: { color: colors.textSoft, fontSize: 9, marginTop: 5 },
  financeValue: { color: colors.red, fontSize: 12, fontWeight: '700' },
  detailActions: { borderTopColor: colors.line, borderTopWidth: 1, flexDirection: 'row', gap: 24, marginTop: 22, paddingTop: 16 },
  detailAction: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  detailActionText: { color: colors.green700, fontSize: 11, fontWeight: '700' },
  deleteAction: { alignItems: 'center', borderTopColor: colors.line, borderTopWidth: 1, flexDirection: 'row', gap: 7, marginTop: 18, paddingTop: 15 },
  deleteText: { color: colors.textSoft, fontSize: 10 },
  pulse: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 14, borderWidth: 1, marginHorizontal: 30, marginTop: 6, padding: 24 },
  pulseHeader: { alignItems: 'baseline', flexDirection: 'row', gap: 12, marginBottom: 18 },
  pulseTitle: { color: colors.text, fontFamily: 'serif', fontSize: 17, fontWeight: '700' },
  pulseRange: { color: colors.textSoft, fontSize: 10 },
  pulseGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  pulseBlock: { borderRightColor: colors.line, borderRightWidth: 1, flex: 1, minWidth: 240, paddingHorizontal: 24 },
  pulseLabel: { color: colors.text, fontSize: 12, fontWeight: '700', marginBottom: 12 },
  pulseLine: { color: colors.textMuted, fontSize: 10, marginBottom: 8 },
  dueInline: { color: colors.red },
  pulseMetric: { color: colors.text, fontSize: 13, fontWeight: '700', marginBottom: 9 },
  pulseHint: { color: colors.textMuted, fontSize: 10, marginTop: 9 },
  pulseLink: { color: colors.green700, fontSize: 10, fontWeight: '700', marginTop: 12 },
  positive: { color: colors.green600, fontSize: 10 },
  progressTrack: { backgroundColor: colors.line, borderRadius: 3, height: 5, overflow: 'hidden' },
  progressFill: { backgroundColor: colors.green700, borderRadius: 3, height: 5 },
});
