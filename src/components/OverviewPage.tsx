import { ArrowRight, CalendarDays, CheckSquare, PenLine } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatDateLabel, getWeekRange, sortTasksByDate, todayString } from '../date';
import { colors } from '../theme';
import type { Note, TabKey, Task } from '../types';
import { EmptyState, sharedStyles } from './shared';

type OverviewPageProps = {
  isDesktop: boolean;
  notes: Note[];
  tasks: Task[];
  onNavigate: (tab: TabKey) => void;
};

export function OverviewPage({ isDesktop, notes, tasks, onNavigate }: OverviewPageProps) {
  const today = todayString();
  const week = getWeekRange(today);
  const inboxNotes = notes.filter((note) => note.status === 'inbox');
  const todayTasks = tasks.filter((task) => task.dueDate === today);
  const weekTasks = sortTasksByDate(
    tasks.filter((task) => task.dueDate && task.dueDate >= week.start && task.dueDate <= week.end),
  );
  const convertedNotes = notes.filter((note) => note.convertedTaskId).slice(0, 4);

  return (
    <ScrollView contentContainerStyle={[sharedStyles.page, isDesktop && sharedStyles.pageDesktop]}>
      <View style={sharedStyles.pageHeader}>
        <Text style={sharedStyles.eyebrow}>闭环工作台</Text>
        <Text style={sharedStyles.title}>总览</Text>
        <Text style={sharedStyles.subtitle}>从随记、待办到日历，集中看下一步该处理什么。</Text>
      </View>

      <View style={styles.kpiGrid}>
        <Kpi icon={<PenLine size={20} color={colors.green700} />} label="未整理随记" value={inboxNotes.length} />
        <Kpi icon={<CheckSquare size={20} color={colors.green700} />} label="今日待办" value={todayTasks.length} />
        <Kpi icon={<CalendarDays size={20} color={colors.green700} />} label="本周日历项" value={weekTasks.length} />
      </View>

      <View style={[styles.grid, !isDesktop && styles.stack]}>
        <Section title="下一步行动" cta="去待办" onPress={() => onNavigate('todo')}>
          {todayTasks.length === 0 ? (
            <Text style={styles.muted}>今天没有安排待办，可以从随记箱整理一个。</Text>
          ) : (
            todayTasks.map((task) => <TaskLine key={task.id} task={task} />)
          )}
        </Section>

        <Section title="待整理随记" cta="去随记" onPress={() => onNavigate('note')}>
          {inboxNotes.length === 0 ? (
            <Text style={styles.muted}>随记箱清爽，暂时没有待整理内容。</Text>
          ) : (
            inboxNotes.slice(0, 4).map((note) => (
              <Text key={note.id} style={styles.noteLine} numberOfLines={2}>
                {note.content}
              </Text>
            ))
          )}
        </Section>
      </View>

      <Section title="本周联动" cta="看日历" onPress={() => onNavigate('calendar')}>
        {weekTasks.length === 0 ? (
          <EmptyState title="本周还没有日历项" body="给待办设置日期后，这里会出现一周行动线。" />
        ) : (
          weekTasks.map((task) => <TaskLine key={task.id} task={task} showDate />)
        )}
      </Section>

      <Section title="最近转化记录" cta="去随记" onPress={() => onNavigate('note')}>
        {convertedNotes.length === 0 ? (
          <Text style={styles.muted}>还没有随记转成待办。</Text>
        ) : (
          convertedNotes.map((note) => {
            const task = tasks.find((item) => item.id === note.convertedTaskId);
            return (
              <View key={note.id} style={styles.flowLine}>
                <Text style={styles.flowText} numberOfLines={1}>
                  {note.content}
                </Text>
                <ArrowRight size={16} color={colors.textSoft} />
                <Text style={styles.flowText} numberOfLines={1}>
                  {task?.title ?? '原待办已删除'}
                </Text>
              </View>
            );
          })
        )}
      </Section>
    </ScrollView>
  );
}

function Kpi({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <View style={[sharedStyles.card, styles.kpi]}>
      {icon}
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

function Section({
  title,
  cta,
  children,
  onPress,
}: {
  title: string;
  cta: string;
  children: ReactNode;
  onPress: () => void;
}) {
  return (
    <View style={sharedStyles.card}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Pressable onPress={onPress}>
          <Text style={styles.link}>{cta}</Text>
        </Pressable>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function TaskLine({ task, showDate }: { task: Task; showDate?: boolean }) {
  return (
    <View style={styles.taskLine}>
      <View style={[styles.statusDot, task.done && styles.statusDone]} />
      <Text style={[styles.taskText, task.done && styles.doneText]} numberOfLines={1}>
        {task.title}
      </Text>
      {showDate ? <Text style={styles.dateText}>{formatDateLabel(task.dueDate)}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  kpi: {
    flex: 1,
    minWidth: 120,
  },
  kpiValue: {
    color: colors.green800,
    fontSize: 28,
    fontWeight: '800',
    marginTop: 8,
  },
  kpiLabel: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  stack: {
    flexDirection: 'column',
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  link: {
    color: colors.green700,
    fontSize: 13,
    fontWeight: '800',
  },
  sectionBody: {
    gap: 10,
    marginTop: 12,
  },
  muted: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  noteLine: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
  },
  taskLine: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  statusDot: {
    backgroundColor: colors.gold500,
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  statusDone: {
    backgroundColor: colors.green600,
  },
  taskText: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  doneText: {
    color: colors.textSoft,
    textDecorationLine: 'line-through',
  },
  dateText: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '700',
  },
  flowLine: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  flowText: {
    color: colors.textMuted,
    flex: 1,
    fontSize: 13,
  },
});
