import { CheckSquare, Edit3, Plus, Trash2 } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';
import type { Note } from '../types';
import { EmptyState, sharedStyles } from './shared';

type NotesPageProps = {
  isDesktop: boolean;
  notes: Note[];
  onCreate: () => void;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onConvert: (note: Note) => void;
};

export function NotesPage({ isDesktop, notes, onCreate, onEdit, onDelete, onConvert }: NotesPageProps) {
  const inboxCount = notes.filter((note) => note.status === 'inbox').length;

  return (
    <ScrollView contentContainerStyle={[sharedStyles.page, isDesktop && sharedStyles.pageDesktop]}>
      <View style={[styles.headerRow, !isDesktop && styles.headerStack]}>
        <View style={sharedStyles.pageHeader}>
          <Text style={sharedStyles.eyebrow}>收集箱</Text>
          <Text style={sharedStyles.title}>随记</Text>
          <Text style={sharedStyles.subtitle}>先记录琐碎想法，再把能行动的内容整理成待办。</Text>
        </View>
        <Pressable accessibilityRole="button" style={[sharedStyles.button, !isDesktop && styles.headerButton]} onPress={onCreate}>
          <Plus size={18} color={colors.white} />
          <Text style={sharedStyles.buttonText}>新增随记</Text>
        </Pressable>
      </View>

      <View style={styles.statRow}>
        <StatCard label="未整理" value={inboxCount} />
        <StatCard label="已转待办" value={notes.length - inboxCount} />
      </View>

      {notes.length === 0 ? (
        <EmptyState title="随记箱还是空的" body="先写下一条想法，闭环就从这里开始。" />
      ) : (
        notes.map((note) => (
          <View key={note.id} style={sharedStyles.card}>
            <View style={styles.noteTop}>
              <Text style={[styles.badge, note.status === 'converted' && styles.badgeDone]}>
                {note.status === 'converted' ? '已转待办' : '未整理'}
              </Text>
              <Text style={styles.time}>{new Date(note.updatedAt).toLocaleString('zh-CN')}</Text>
            </View>
            <Text style={styles.content}>{note.content}</Text>
            <View style={styles.actions}>
              {note.status === 'inbox' ? (
                <Pressable accessibilityRole="button" style={sharedStyles.ghostButton} onPress={() => onConvert(note)}>
                  <CheckSquare size={16} color={colors.green700} />
                  <Text style={sharedStyles.ghostText}>转为待办</Text>
                </Pressable>
              ) : null}
              <Pressable accessibilityRole="button" style={sharedStyles.ghostButton} onPress={() => onEdit(note)}>
                <Edit3 size={16} color={colors.green700} />
                <Text style={sharedStyles.ghostText}>编辑</Text>
              </Pressable>
              <Pressable accessibilityRole="button" style={sharedStyles.ghostButton} onPress={() => onDelete(note.id)}>
                <Trash2 size={16} color="#B85C5C" />
                <Text style={sharedStyles.dangerText}>删除</Text>
              </Pressable>
            </View>
          </View>
        ))
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
  headerStack: {
    flexDirection: 'column',
  },
  headerButton: {
    alignSelf: 'flex-start',
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
  noteTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badge: {
    backgroundColor: colors.softGreen,
    borderRadius: 999,
    color: colors.green700,
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeDone: {
    color: colors.textSoft,
  },
  time: {
    color: colors.textSoft,
    fontSize: 12,
  },
  content: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
});
