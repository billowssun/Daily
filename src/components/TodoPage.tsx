import { CalendarDays, CircleCheck, Edit3, Plus, Trash2 } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatDateLabel, sortTasksByDate } from '../date';
import { colors } from '../theme';
import type { Note, Task } from '../types';
import { EmptyState, sharedStyles } from './shared';

type TodoPageProps = {
  isDesktop: boolean;
  notes: Note[];
  tasks: Task[];
  onCreate: () => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
};

export function TodoPage({ isDesktop, notes, tasks, onCreate, onEdit, onDelete, onToggle }: TodoPageProps) {
  const datedCount = tasks.filter((task) => task.dueDate).length;

  return (
    <ScrollView contentContainerStyle={[sharedStyles.page, isDesktop && sharedStyles.pageDesktop]}>
      <View style={styles.headerRow}>
        <View style={sharedStyles.pageHeader}>
          <Text style={sharedStyles.eyebrow}>行动池</Text>
          <Text style={sharedStyles.title}>待办</Text>
          <Text style={sharedStyles.subtitle}>无日期待办留在行动池；加上日期后自动进入日历。</Text>
        </View>
        <Pressable style={sharedStyles.button} onPress={onCreate}>
          <Plus size={18} color={colors.white} />
          <Text style={sharedStyles.buttonText}>新增待办</Text>
        </Pressable>
      </View>

      <View style={styles.statRow}>
        <StatCard label="全部待办" value={tasks.length} />
        <StatCard label="已进日历" value={datedCount} />
        <StatCard label="已完成" value={tasks.filter((task) => task.done).length} />
      </View>

      {tasks.length === 0 ? (
        <EmptyState title="还没有待办" body="可以手动新增，也可以从随记整理而来。" />
      ) : (
        sortTasksByDate(tasks).map((task) => {
          const sourceNote = task.sourceNoteId ? notes.find((note) => note.id === task.sourceNoteId) : undefined;

          return (
            <View key={task.id} style={sharedStyles.card}>
              <View style={styles.taskTop}>
                <Pressable style={[styles.checkbox, task.done && styles.checkboxDone]} onPress={() => onToggle(task.id)}>
                  {task.done ? <CircleCheck size={15} color={colors.white} strokeWidth={3} /> : null}
                </Pressable>
                <View style={styles.taskBody}>
                  <Text style={[styles.taskTitle, task.done && styles.doneText]}>{task.title}</Text>
                  {task.detail ? <Text style={styles.detail}>{task.detail}</Text> : null}
                  {sourceNote ? <Text style={styles.source}>来源：{sourceNote.content}</Text> : null}
                </View>
              </View>
              <View style={styles.metaRow}>
                <View style={styles.dateBadge}>
                  <CalendarDays size={14} color={task.dueDate ? colors.green700 : colors.textSoft} />
                  <Text style={[styles.dateText, !task.dueDate && styles.muted]}>{formatDateLabel(task.dueDate)}</Text>
                </View>
                <View style={styles.actions}>
                  <Pressable style={sharedStyles.ghostButton} onPress={() => onEdit(task)}>
                    <Edit3 size={15} color={colors.green700} />
                    <Text style={sharedStyles.ghostText}>编辑</Text>
                  </Pressable>
                  <Pressable style={sharedStyles.ghostButton} onPress={() => onDelete(task.id)}>
                    <Trash2 size={15} color="#B85C5C" />
                    <Text style={sharedStyles.dangerText}>删除</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <View style={[sharedStyles.card, styles.statCard]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
  },
  statValue: {
    color: colors.green800,
    fontSize: 28,
    fontWeight: '800',
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  taskTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: colors.lineDark,
    borderRadius: 8,
    borderWidth: 1.5,
    height: 22,
    justifyContent: 'center',
    marginTop: 2,
    width: 22,
  },
  checkboxDone: {
    backgroundColor: colors.green600,
    borderColor: colors.green600,
  },
  taskBody: {
    flex: 1,
  },
  taskTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  doneText: {
    color: colors.textSoft,
    textDecorationLine: 'line-through',
  },
  detail: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },
  source: {
    color: colors.green700,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    marginTop: 14,
  },
  dateBadge: {
    alignItems: 'center',
    backgroundColor: colors.softGreen,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dateText: {
    color: colors.green700,
    fontSize: 13,
    fontWeight: '800',
  },
  muted: {
    color: colors.textSoft,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
});
