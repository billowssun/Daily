import { CalendarDays, CheckSquare, PenLine, Plus } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatDateLabel, sortTasksByDate, todayString } from '../date';
import { colors } from '../theme';
import type { Note, TabKey, Task } from '../types';
import { PlantAvatar } from './PlantAvatar';
import { sharedStyles } from './shared';

type DashboardProps = {
  isDesktop: boolean;
  notes: Note[];
  tasks: Task[];
  onCreateNote: () => void;
  onCreateTask: () => void;
  onNavigate: (tab: TabKey) => void;
  onToggleTask: (id: string) => void;
};

export function Dashboard({
  isDesktop,
  notes,
  tasks,
  onCreateNote,
  onCreateTask,
  onNavigate,
  onToggleTask,
}: DashboardProps) {
  const today = todayString();
  const inboxNotes = notes.filter((note) => note.status === 'inbox');
  const todayTasks = tasks.filter((task) => task.dueDate === today);
  const nextDatedTasks = sortTasksByDate(tasks.filter((task) => task.dueDate && !task.done)).slice(0, 4);

  return (
    <ScrollView contentContainerStyle={[sharedStyles.page, isDesktop && sharedStyles.pageDesktop]}>
      <View style={styles.header}>
        <View style={[sharedStyles.pageHeader, styles.headerCopy]}>
          <Text style={styles.brand}>日序</Text>
          <Text style={sharedStyles.subtitle}>随记收集，整理成待办，有日期的行动自动进入日历。</Text>
        </View>
        <View style={[styles.avatar, !isDesktop && styles.avatarMobile]}>
          <PlantAvatar />
        </View>
      </View>

      <View style={styles.quickRow}>
        <Pressable style={sharedStyles.button} onPress={onCreateNote}>
          <Plus size={18} color={colors.white} />
          <Text style={sharedStyles.buttonText}>写随记</Text>
        </Pressable>
        <Pressable style={sharedStyles.ghostButton} onPress={onCreateTask}>
          <CheckSquare size={18} color={colors.green700} />
          <Text style={sharedStyles.ghostText}>加待办</Text>
        </Pressable>
      </View>

      <View style={styles.kpiGrid}>
        <Kpi icon={<PenLine size={20} color={colors.green700} />} label="未整理随记" value={inboxNotes.length} />
        <Kpi icon={<CheckSquare size={20} color={colors.green700} />} label="今日待办" value={todayTasks.length} />
        <Kpi icon={<CalendarDays size={20} color={colors.green700} />} label="日历待办" value={tasks.filter((task) => task.dueDate).length} />
      </View>

      <View style={[styles.grid, !isDesktop && styles.stack]}>
        <View style={[sharedStyles.card, styles.panel]}>
          <PanelHeader title="收集箱" action="去整理" onPress={() => onNavigate('note')} />
          {inboxNotes.length === 0 ? (
            <Text style={styles.muted}>没有未整理随记，今天脑袋很清爽。</Text>
          ) : (
            inboxNotes.slice(0, 3).map((note) => (
              <Text key={note.id} style={styles.noteLine} numberOfLines={2}>
                {note.content}
              </Text>
            ))
          )}
        </View>

        <View style={[sharedStyles.card, styles.panel]}>
          <PanelHeader title="今日行动" action="去待办" onPress={() => onNavigate('todo')} />
          {todayTasks.length === 0 ? (
            <Text style={styles.muted}>今天没有日期待办，可以先从随记整理一个。</Text>
          ) : (
            todayTasks.map((task) => (
              <Pressable key={task.id} style={styles.taskLine} onPress={() => onToggleTask(task.id)}>
                <View style={[styles.dot, task.done && styles.dotDone]} />
                <Text style={[styles.taskText, task.done && styles.doneText]} numberOfLines={1}>
                  {task.title}
                </Text>
              </Pressable>
            ))
          )}
        </View>
      </View>

      <View style={sharedStyles.card}>
        <PanelHeader title="接下来会出现在日历上的事" action="看日历" onPress={() => onNavigate('calendar')} />
        {nextDatedTasks.length === 0 ? (
          <Text style={styles.muted}>暂时没有未完成的日期待办。</Text>
        ) : (
          nextDatedTasks.map((task) => (
            <View key={task.id} style={styles.timelineRow}>
              <Text style={styles.date}>{formatDateLabel(task.dueDate)}</Text>
              <Text style={styles.taskText} numberOfLines={1}>
                {task.title}
              </Text>
            </View>
          ))
        )}
      </View>
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

function PanelHeader({ title, action, onPress }: { title: string; action: string; onPress: () => void }) {
  return (
    <View style={styles.panelHeader}>
      <Text style={styles.panelTitle}>{title}</Text>
      <Pressable onPress={onPress}>
        <Text style={styles.link}>{action}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  brand: {
    color: colors.green800,
    fontSize: 38,
    fontWeight: '800',
  },
  avatar: {
    backgroundColor: colors.card,
    borderRadius: 25,
    padding: 4,
  },
  avatarMobile: {
    transform: [{ scale: 0.82 }],
  },
  quickRow: {
    flexDirection: 'row',
    gap: 10,
  },
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
  panel: {
    flex: 1,
  },
  panelHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  panelTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  link: {
    color: colors.green700,
    fontSize: 13,
    fontWeight: '800',
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
    marginBottom: 10,
  },
  taskLine: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  dot: {
    backgroundColor: colors.gold500,
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  dotDone: {
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
  timelineRow: {
    alignItems: 'center',
    borderTopColor: colors.line,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 12,
  },
  date: {
    color: colors.green700,
    fontSize: 13,
    fontWeight: '800',
    width: 72,
  },
});
