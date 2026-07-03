import { ChevronLeft, ChevronRight, CircleCheck, Edit3 } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatDateLabel, formatWeekday, getMonthMatrix, shiftMonth } from '../date';
import { colors } from '../theme';
import type { Task } from '../types';
import { EmptyState, sharedStyles } from './shared';

type CalendarPageProps = {
  activeDate: string;
  isDesktop: boolean;
  tasks: Task[];
  onDateChange: (dateKey: string) => void;
  onEditTask: (task: Task) => void;
  onToggleTask: (id: string) => void;
};

const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

export function CalendarPage({
  activeDate,
  isDesktop,
  tasks,
  onDateChange,
  onEditTask,
  onToggleTask,
}: CalendarPageProps) {
  const monthKey = activeDate.slice(0, 7);
  const datedTasks = tasks.filter((task) => task.dueDate);
  const selectedTasks = datedTasks.filter((task) => task.dueDate === activeDate);
  const cells = getMonthMatrix(monthKey);

  return (
    <ScrollView contentContainerStyle={[sharedStyles.page, isDesktop && sharedStyles.pageDesktop]}>
      <View style={sharedStyles.pageHeader}>
        <Text style={sharedStyles.eyebrow}>日期视图</Text>
        <Text style={sharedStyles.title}>日历</Text>
        <Text style={sharedStyles.subtitle}>只有设置日期的待办会进入日历；点击日期查看当天行动。</Text>
      </View>

      <View style={sharedStyles.card}>
        <View style={styles.monthHeader}>
          <Pressable style={sharedStyles.ghostButton} onPress={() => onDateChange(`${shiftMonth(monthKey, -1)}-01`)}>
            <ChevronLeft size={16} color={colors.green700} />
            <Text style={sharedStyles.ghostText}>上月</Text>
          </Pressable>
          <Text style={styles.monthTitle}>{monthKey.replace('-', ' 年 ')} 月</Text>
          <Pressable style={sharedStyles.ghostButton} onPress={() => onDateChange(`${shiftMonth(monthKey, 1)}-01`)}>
            <Text style={sharedStyles.ghostText}>下月</Text>
            <ChevronRight size={16} color={colors.green700} />
          </Pressable>
        </View>

        <View style={styles.weekRow}>
          {weekdays.map((weekday) => (
            <Text key={weekday} style={styles.weekday}>
              {weekday}
            </Text>
          ))}
        </View>
        <View style={styles.grid}>
          {cells.map((cell, index) => {
            const dayTasks = cell.dateKey ? datedTasks.filter((task) => task.dueDate === cell.dateKey) : [];
            const doneCount = dayTasks.filter((task) => task.done).length;
            const active = cell.dateKey === activeDate;

            return (
              <Pressable
                key={`${cell.dateKey ?? 'blank'}-${index}`}
                disabled={!cell.dateKey}
                style={[styles.dayCell, active && styles.dayCellActive, !cell.dateKey && styles.blankCell]}
                onPress={() => cell.dateKey && onDateChange(cell.dateKey)}
              >
                <Text style={[styles.dayNumber, active && styles.dayNumberActive]}>{cell.day ?? ''}</Text>
                {dayTasks.length > 0 ? (
                  <View style={styles.taskPill}>
                    <Text style={styles.taskPillText}>
                      {doneCount}/{dayTasks.length}
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={sharedStyles.card}>
        <Text style={styles.selectedTitle}>
          {formatDateLabel(activeDate)} · {formatWeekday(activeDate)}
        </Text>
        {selectedTasks.length === 0 ? (
          <EmptyState title="这天没有待办" body="给待办加上这个日期，它就会出现在这里。" />
        ) : (
          selectedTasks.map((task) => (
            <View key={task.id} style={styles.selectedTask}>
              <Pressable style={[styles.checkbox, task.done && styles.checkboxDone]} onPress={() => onToggleTask(task.id)}>
                {task.done ? <CircleCheck size={14} color={colors.white} strokeWidth={3} /> : null}
              </Pressable>
              <View style={styles.selectedBody}>
                <Text style={[styles.taskTitle, task.done && styles.doneText]}>{task.title}</Text>
                {task.detail ? <Text style={styles.detail}>{task.detail}</Text> : null}
              </View>
              <Pressable style={sharedStyles.ghostButton} onPress={() => onEditTask(task)}>
                <Edit3 size={15} color={colors.green700} />
                <Text style={sharedStyles.ghostText}>编辑</Text>
              </Pressable>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  monthHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monthTitle: {
    color: colors.green800,
    fontSize: 20,
    fontWeight: '800',
  },
  weekRow: {
    flexDirection: 'row',
    marginTop: 18,
  },
  weekday: {
    color: colors.textSoft,
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  dayCell: {
    alignItems: 'center',
    backgroundColor: colors.softGreen,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    borderWidth: 1,
    height: 72,
    justifyContent: 'center',
    width: '13.45%',
  },
  dayCellActive: {
    backgroundColor: colors.green600,
    borderColor: colors.green600,
  },
  blankCell: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  dayNumber: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  dayNumberActive: {
    color: colors.white,
  },
  taskPill: {
    backgroundColor: colors.card,
    borderRadius: 999,
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  taskPillText: {
    color: colors.green700,
    fontSize: 11,
    fontWeight: '800',
  },
  selectedTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  selectedTask: {
    alignItems: 'flex-start',
    borderTopColor: colors.line,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 12,
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
  selectedBody: {
    flex: 1,
  },
  taskTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  doneText: {
    color: colors.textSoft,
    textDecorationLine: 'line-through',
  },
  detail: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },
});
