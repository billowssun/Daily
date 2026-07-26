import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock3,
  FileText,
  Plus,
  RotateCcw,
  Sparkles,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, shadow } from '../theme';
import type { Note, TabKey, Task } from '../types';

type CommonProps = {
  isDesktop: boolean;
  notes: Note[];
  tasks: Task[];
  onCreateTask: () => void;
  onEditTask: (task: Task) => void;
  onToggleTask: (id: string) => void;
  onNavigate: (tab: TabKey) => void;
};

export function PlanWorkspace({ isDesktop, tasks, onCreateTask, onEditTask, onToggleTask }: CommonProps) {
  const [filter, setFilter] = useState<'open' | 'all' | 'done'>('open');
  const visible = tasks.filter((task) => filter === 'all' || (filter === 'done' ? task.done : !task.done));

  return (
    <Page>
      <PageHeader
        eyebrow="计划"
        title="把承诺放进合适的时间"
        description="计划不是把一天塞满，而是让重要的事有明确位置。"
        action="添加事项"
        onAction={onCreateTask}
      />
      <View style={styles.filterRow}>
        {([['open', '待完成'], ['all', '全部'], ['done', '已完成']] as const).map(([key, label]) => (
          <Pressable key={key} style={[styles.filter, filter === key && styles.filterActive]} onPress={() => setFilter(key)}>
            <Text style={[styles.filterText, filter === key && styles.filterTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>
      <View style={[styles.planLayout, !isDesktop && styles.stack]}>
        <View style={[styles.panel, styles.planMain]}>
          <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>近期事项</Text><Text style={styles.count}>{visible.length} 项</Text></View>
          {visible.map((task) => (
            <Pressable key={task.id} style={({ pressed }) => [styles.planRow, pressed && styles.pressed]} onPress={() => onEditTask(task)}>
              <Pressable style={[styles.taskCheck, task.done && styles.taskCheckDone]} onPress={() => onToggleTask(task.id)}>
                {task.done ? <Check color={colors.white} size={13} strokeWidth={2.5} /> : null}
              </Pressable>
              <View style={styles.taskContent}>
                <Text style={[styles.taskName, task.done && styles.done]}>{task.title}</Text>
                <Text style={styles.taskDetail} numberOfLines={1}>{task.detail || '没有补充说明'}</Text>
              </View>
              <View style={styles.datePill}><CalendarDays color={colors.green700} size={13} /><Text style={styles.dateText}>{task.dueDate || '未安排'}</Text></View>
              <ChevronRight color={colors.textSoft} size={17} />
            </Pressable>
          ))}
          {visible.length === 0 ? <Empty title="这里已经清空" body="没有符合当前筛选条件的事项。" /> : null}
        </View>
        <View style={styles.planSide}>
          <View style={styles.panel}>
            <Text style={styles.sectionTitle}>本周节奏</Text>
            <Text style={styles.bigMetric}>{tasks.filter((task) => task.done).length}/{tasks.length}</Text>
            <Text style={styles.metricCaption}>已完成事项</Text>
            <View style={styles.progress}><View style={[styles.progressFill, { width: `${Math.round(tasks.filter((task) => task.done).length / Math.max(tasks.length, 1) * 100)}%` }]} /></View>
            <Text style={styles.insight}>把未完成的事项减少到 3 件以内，明天会更轻松。</Text>
          </View>
          <Pressable style={styles.addCard} onPress={onCreateTask}>
            <View style={styles.addIcon}><Plus color={colors.green700} size={21} /></View>
            <Text style={styles.addTitle}>添加下一件重要的事</Text>
            <Text style={styles.addHint}>设置日期后会自动进入日历。</Text>
          </Pressable>
        </View>
      </View>
    </Page>
  );
}

export function CalendarWorkspace({ tasks, onEditTask, onToggleTask }: CommonProps) {
  const [selectedDay, setSelectedDay] = useState(26);
  const selectedDate = `2026-07-${String(selectedDay).padStart(2, '0')}`;
  const selectedTasks = tasks.filter((task) => task.dueDate === selectedDate);
  const days = Array.from({ length: 35 }, (_, index) => index - 2);

  return (
    <Page>
      <PageHeader eyebrow="日历" title="七月，留白也是安排" description="所有设置日期的事项都会在这里出现。" />
      <View style={styles.calendarToolbar}>
        <View style={styles.monthControls}>
          <Pressable style={styles.roundButton}><ChevronLeft color={colors.textMuted} size={18} /></Pressable>
          <Text style={styles.monthTitle}>2026 年 7 月</Text>
          <Pressable style={styles.roundButton}><ChevronRight color={colors.textMuted} size={18} /></Pressable>
        </View>
        <Pressable style={styles.todayButton} onPress={() => setSelectedDay(26)}><Text style={styles.todayText}>回到今天</Text></Pressable>
      </View>
      <View style={styles.calendarLayout}>
        <View style={[styles.panel, styles.calendarPanel]}>
          <View style={styles.weekNames}>{['一', '二', '三', '四', '五', '六', '日'].map((item) => <Text key={item} style={styles.weekName}>{item}</Text>)}</View>
          <View style={styles.monthGrid}>
            {days.map((day, index) => {
              const valid = day >= 1 && day <= 31;
              const active = day === selectedDay;
              const count = valid ? tasks.filter((task) => task.dueDate === `2026-07-${String(day).padStart(2, '0')}`).length : 0;
              return (
                <Pressable key={index} disabled={!valid} style={[styles.dayCell, active && styles.dayCellActive]} onPress={() => setSelectedDay(day)}>
                  <Text style={[styles.dayNumber, !valid && styles.dayInvalid, active && styles.dayActiveText]}>{valid ? day : day < 1 ? 30 + day : day - 31}</Text>
                  {count ? <View style={[styles.eventDot, active && styles.eventDotActive]} /> : null}
                </Pressable>
              );
            })}
          </View>
        </View>
        <View style={[styles.panel, styles.agenda]}>
          <Text style={styles.agendaDate}>7 月 {selectedDay} 日</Text>
          <Text style={styles.agendaWeek}>{selectedDay === 26 ? '今天 · 周日' : '当日安排'}</Text>
          <View style={styles.agendaList}>
            {selectedTasks.map((task) => (
              <Pressable key={task.id} style={styles.agendaRow} onPress={() => onEditTask(task)}>
                <Pressable style={[styles.taskCheck, task.done && styles.taskCheckDone]} onPress={() => onToggleTask(task.id)}>{task.done ? <Check color={colors.white} size={13} /> : null}</Pressable>
                <View style={styles.taskContent}><Text style={[styles.taskName, task.done && styles.done]}>{task.title}</Text><Text style={styles.taskDetail}>{task.detail}</Text></View>
              </Pressable>
            ))}
            {!selectedTasks.length ? <Empty title="这一天很轻" body="还没有安排事项，可以保留这段空白。" /> : null}
          </View>
        </View>
      </View>
    </Page>
  );
}

export function ReviewWorkspace({ notes, tasks, onNavigate }: CommonProps) {
  const done = tasks.filter((task) => task.done);
  const open = tasks.filter((task) => !task.done);
  const converted = notes.filter((note) => note.status === 'converted');
  const completion = Math.round(done.length / Math.max(tasks.length, 1) * 100);

  return (
    <Page>
      <PageHeader eyebrow="回顾" title="看清这一周，才能轻装前行" description="回顾行动、随记与财务健康之间的关系。" />
      <View style={styles.reviewMetrics}>
        <ReviewMetric icon={CheckCircle2} label="完成率" value={`${completion}%`} hint={`${done.length} 项已完成`} />
        <ReviewMetric icon={Clock3} label="待处理" value={`${open.length}`} hint="保持在可掌控范围" />
        <ReviewMetric icon={FileText} label="随记转行动" value={`${converted.length}`} hint={`${notes.length} 条随记`} />
        <ReviewMetric icon={Sparkles} label="本周状态" value="稳定" hint="节奏比数量更重要" />
      </View>
      <View style={styles.reviewGrid}>
        <View style={[styles.panel, styles.reviewWide]}>
          <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>本周完成</Text><Pressable onPress={() => onNavigate('todo')}><Text style={styles.link}>查看计划 →</Text></Pressable></View>
          {done.map((task) => (
            <View key={task.id} style={styles.reviewRow}><CheckCircle2 color={colors.green700} size={17} /><View><Text style={styles.reviewTask}>{task.title}</Text><Text style={styles.reviewDetail}>{task.detail}</Text></View></View>
          ))}
          {!done.length ? <Empty title="还没有完成记录" body="完成一件事后，它会出现在这里。" /> : null}
        </View>
        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>随记线索</Text>
          {notes.slice(0, 3).map((note) => (
            <View key={note.id} style={styles.noteRow}><Circle color={note.status === 'converted' ? colors.green700 : colors.textSoft} fill={note.status === 'converted' ? colors.green700 : 'transparent'} size={8} /><Text style={styles.noteText} numberOfLines={2}>{note.content}</Text></View>
          ))}
          <Pressable style={styles.reviewCta} onPress={() => onNavigate('home')}><RotateCcw color={colors.green700} size={16} /><Text style={styles.reviewCtaText}>回到今天继续行动</Text></Pressable>
        </View>
      </View>
    </Page>
  );
}

function Page({ children }: { children: React.ReactNode }) {
  return <ScrollView style={styles.scroll} contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>{children}</ScrollView>;
}

function PageHeader({ eyebrow, title, description, action, onAction }: { eyebrow: string; title: string; description: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.header}>
      <View><Text style={styles.eyebrow}>{eyebrow}</Text><Text style={styles.title}>{title}</Text><Text style={styles.subtitle}>{description}</Text></View>
      {action ? <Pressable style={styles.primaryButton} onPress={onAction}><Plus color={colors.white} size={17} /><Text style={styles.primaryText}>{action}</Text></Pressable> : null}
    </View>
  );
}

function ReviewMetric({ icon: Icon, label, value, hint }: { icon: typeof Clock3; label: string; value: string; hint: string }) {
  return <View style={styles.reviewMetric}><View style={styles.reviewIcon}><Icon color={colors.green700} size={19} /></View><Text style={styles.reviewLabel}>{label}</Text><Text style={styles.reviewValue}>{value}</Text><Text style={styles.reviewHint}>{hint}</Text></View>;
}

function Empty({ title, body }: { title: string; body: string }) {
  return <View style={styles.empty}><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyBody}>{body}</Text></View>;
}

const styles = StyleSheet.create({
  scroll: { backgroundColor: colors.background, flex: 1 },
  page: { gap: 20, marginHorizontal: 'auto', maxWidth: 1360, padding: 38, paddingBottom: 110, width: '100%' },
  header: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  eyebrow: { color: colors.green700, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: colors.text, fontFamily: 'serif', fontSize: 31, fontWeight: '700', marginTop: 8 },
  subtitle: { color: colors.textMuted, fontSize: 12, marginTop: 8 },
  primaryButton: { alignItems: 'center', backgroundColor: colors.green700, borderRadius: 9, flexDirection: 'row', gap: 8, height: 40, paddingHorizontal: 16 },
  primaryText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  filterRow: { alignSelf: 'flex-start', backgroundColor: '#EAECE8', borderRadius: 10, flexDirection: 'row', padding: 3 },
  filter: { borderRadius: 8, paddingHorizontal: 15, paddingVertical: 8 },
  filterActive: { backgroundColor: colors.card },
  filterText: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  filterTextActive: { color: colors.green800, fontWeight: '800' },
  planLayout: { alignItems: 'flex-start', flexDirection: 'row', gap: 18 },
  stack: { flexDirection: 'column' },
  panel: { ...shadow.soft, backgroundColor: colors.card, borderColor: colors.line, borderRadius: 16, borderWidth: 1, padding: 20 },
  planMain: { flex: 1.5, width: '100%' },
  planSide: { gap: 18, width: 320 },
  sectionHeading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  count: { color: colors.textSoft, fontSize: 10 },
  planRow: { alignItems: 'center', borderBottomColor: colors.line, borderBottomWidth: 1, flexDirection: 'row', gap: 12, minHeight: 72 },
  pressed: { opacity: 0.72 },
  taskCheck: { alignItems: 'center', borderColor: colors.lineDark, borderRadius: 9, borderWidth: 1, height: 19, justifyContent: 'center', width: 19 },
  taskCheckDone: { backgroundColor: colors.green700, borderColor: colors.green700 },
  taskContent: { flex: 1, minWidth: 0 },
  taskName: { color: colors.text, fontSize: 12, fontWeight: '700' },
  done: { color: colors.textSoft, textDecorationLine: 'line-through' },
  taskDetail: { color: colors.textSoft, fontSize: 9, marginTop: 5 },
  datePill: { alignItems: 'center', backgroundColor: colors.softGreen, borderRadius: 8, flexDirection: 'row', gap: 5, paddingHorizontal: 8, paddingVertical: 6 },
  dateText: { color: colors.green800, fontSize: 9 },
  bigMetric: { color: colors.text, fontSize: 34, fontWeight: '800', marginTop: 22 },
  metricCaption: { color: colors.textMuted, fontSize: 10, marginTop: 4 },
  progress: { backgroundColor: colors.line, borderRadius: 3, height: 5, marginTop: 18, overflow: 'hidden' },
  progressFill: { backgroundColor: colors.green700, borderRadius: 3, height: 5 },
  insight: { color: colors.textMuted, fontSize: 10, lineHeight: 16, marginTop: 16 },
  addCard: { alignItems: 'center', backgroundColor: colors.softGreen, borderColor: colors.green200, borderRadius: 16, borderStyle: 'dashed', borderWidth: 1, padding: 24 },
  addIcon: { alignItems: 'center', backgroundColor: colors.card, borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  addTitle: { color: colors.green800, fontSize: 12, fontWeight: '800', marginTop: 12 },
  addHint: { color: colors.textMuted, fontSize: 9, marginTop: 6 },
  calendarToolbar: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  monthControls: { alignItems: 'center', flexDirection: 'row', gap: 14 },
  roundButton: { alignItems: 'center', borderColor: colors.line, borderRadius: 9, borderWidth: 1, height: 36, justifyContent: 'center', width: 36 },
  monthTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
  todayButton: { borderColor: colors.line, borderRadius: 9, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 9 },
  todayText: { color: colors.green700, fontSize: 10, fontWeight: '700' },
  calendarLayout: { flexDirection: 'row', flexWrap: 'wrap', gap: 18 },
  calendarPanel: { flex: 1.45, minWidth: 560 },
  weekNames: { flexDirection: 'row', marginBottom: 8 },
  weekName: { color: colors.textSoft, flex: 1, fontSize: 10, textAlign: 'center' },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { alignItems: 'center', aspectRatio: 1.35, borderColor: colors.line, borderLeftWidth: 0.5, borderTopWidth: 0.5, justifyContent: 'center', width: '14.285%' },
  dayCellActive: { backgroundColor: colors.softGreen },
  dayNumber: { color: colors.text, fontSize: 11 },
  dayInvalid: { color: colors.lineDark },
  dayActiveText: { color: colors.green800, fontWeight: '800' },
  eventDot: { backgroundColor: colors.green700, borderRadius: 3, height: 5, marginTop: 6, width: 5 },
  eventDotActive: { backgroundColor: colors.green900 },
  agenda: { flex: 1, minWidth: 300 },
  agendaDate: { color: colors.text, fontFamily: 'serif', fontSize: 22, fontWeight: '700' },
  agendaWeek: { color: colors.green700, fontSize: 10, marginTop: 5 },
  agendaList: { marginTop: 18 },
  agendaRow: { alignItems: 'flex-start', borderBottomColor: colors.line, borderBottomWidth: 1, flexDirection: 'row', gap: 11, paddingVertical: 13 },
  reviewMetrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  reviewMetric: { backgroundColor: colors.card, borderColor: colors.line, borderRadius: 14, borderWidth: 1, flex: 1, minWidth: 210, padding: 17 },
  reviewIcon: { alignItems: 'center', backgroundColor: colors.softGreen, borderRadius: 11, height: 38, justifyContent: 'center', width: 38 },
  reviewLabel: { color: colors.textMuted, fontSize: 10, marginTop: 14 },
  reviewValue: { color: colors.text, fontSize: 24, fontWeight: '800', marginTop: 5 },
  reviewHint: { color: colors.textSoft, fontSize: 9, marginTop: 5 },
  reviewGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 18 },
  reviewWide: { flex: 1.35, minWidth: 480 },
  link: { color: colors.green700, fontSize: 10, fontWeight: '700' },
  reviewRow: { alignItems: 'flex-start', borderBottomColor: colors.line, borderBottomWidth: 1, flexDirection: 'row', gap: 11, paddingVertical: 13 },
  reviewTask: { color: colors.text, fontSize: 12, fontWeight: '700' },
  reviewDetail: { color: colors.textSoft, fontSize: 9, marginTop: 5 },
  noteRow: { alignItems: 'flex-start', borderBottomColor: colors.line, borderBottomWidth: 1, flexDirection: 'row', gap: 9, paddingVertical: 12 },
  noteText: { color: colors.textMuted, flex: 1, fontSize: 10, lineHeight: 16 },
  reviewCta: { alignItems: 'center', flexDirection: 'row', gap: 8, marginTop: 18 },
  reviewCtaText: { color: colors.green700, fontSize: 10, fontWeight: '700' },
  empty: { alignItems: 'center', justifyContent: 'center', minHeight: 160, padding: 20 },
  emptyTitle: { color: colors.text, fontSize: 13, fontWeight: '700' },
  emptyBody: { color: colors.textSoft, fontSize: 10, marginTop: 7 },
});
