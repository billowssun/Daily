import { Check, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, shadow } from '../theme';
import type { Note, NoteInput, Task, TaskInput } from '../types';

export function NoteEditor({
  note,
  visible,
  onClose,
  onSave,
}: {
  note?: Note;
  visible: boolean;
  onClose: () => void;
  onSave: (input: NoteInput) => void;
}) {
  const [content, setContent] = useState('');

  useEffect(() => setContent(note?.content ?? ''), [note, visible]);

  return (
    <EditorShell visible={visible} title={note ? '编辑随记' : '快速记录'} subtitle="先记下来，稍后再整理成行动。" onClose={onClose}>
      <TextInput
        autoFocus
        multiline
        placeholder="写下此刻的想法、提醒或灵感…"
        placeholderTextColor={colors.textSoft}
        style={[styles.input, styles.noteInput]}
        value={content}
        onChangeText={setContent}
      />
      <Pressable disabled={!content.trim()} style={[styles.save, !content.trim() && styles.disabled]} onPress={() => onSave({ content: content.trim() })}>
        <Check color={colors.white} size={17} />
        <Text style={styles.saveText}>保存随记</Text>
      </Pressable>
    </EditorShell>
  );
}

export function TaskEditor({
  defaultInput,
  sourceLabel,
  task,
  visible,
  onClose,
  onSave,
}: {
  defaultInput?: TaskInput;
  sourceLabel?: string;
  task?: Task;
  visible: boolean;
  onClose: () => void;
  onSave: (input: TaskInput) => void;
}) {
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    setTitle(task?.title ?? defaultInput?.title ?? '');
    setDetail(task?.detail ?? defaultInput?.detail ?? '');
    setDueDate(task?.dueDate ?? defaultInput?.dueDate ?? '');
  }, [defaultInput, task, visible]);

  return (
    <EditorShell visible={visible} title={task ? '编辑事项' : '添加事项'} subtitle="设置日期后，事项会自动进入日历。" onClose={onClose}>
      {sourceLabel ? <View style={styles.source}><Text style={styles.sourceLabel}>来自随记</Text><Text style={styles.sourceText} numberOfLines={2}>{sourceLabel}</Text></View> : null}
      <Field label="事项名称" value={title} onChangeText={setTitle} placeholder="例如：预约年度体检" />
      <Field label="补充说明" value={detail} onChangeText={setDetail} placeholder="背景、结果或下一步" multiline />
      <Field label="日期" value={dueDate} onChangeText={setDueDate} placeholder="YYYY-MM-DD" />
      <Pressable disabled={!title.trim()} style={[styles.save, !title.trim() && styles.disabled]} onPress={() => onSave({ title: title.trim(), detail: detail.trim(), dueDate: dueDate.trim() || undefined })}>
        <Check color={colors.white} size={17} />
        <Text style={styles.saveText}>保存事项</Text>
      </Pressable>
    </EditorShell>
  );
}

function EditorShell({
  visible,
  title,
  subtitle,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View><Text style={styles.title}>{title}</Text><Text style={styles.subtitle}>{subtitle}</Text></View>
            <Pressable accessibilityLabel="关闭" style={styles.close} onPress={onClose}><X color={colors.textMuted} size={19} /></Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.body}>{children}</ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        multiline={multiline}
        placeholder={placeholder}
        placeholderTextColor={colors.textSoft}
        style={[styles.input, multiline && styles.multiline]}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { alignItems: 'center', backgroundColor: colors.backdrop, flex: 1, justifyContent: 'center', padding: 18 },
  card: { ...shadow.float, backgroundColor: colors.card, borderRadius: 18, maxHeight: '92%', maxWidth: '100%', overflow: 'hidden', width: 600 },
  header: { alignItems: 'flex-start', borderBottomColor: colors.line, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', padding: 21 },
  title: { color: colors.text, fontFamily: 'serif', fontSize: 22, fontWeight: '700' },
  subtitle: { color: colors.textMuted, fontSize: 10, marginTop: 5 },
  close: { alignItems: 'center', borderColor: colors.line, borderRadius: 9, borderWidth: 1, height: 38, justifyContent: 'center', width: 38 },
  body: { padding: 21 },
  field: { marginBottom: 16 },
  label: { color: colors.text, fontSize: 10, fontWeight: '700', marginBottom: 7 },
  input: { backgroundColor: '#FBFBF9', borderColor: colors.line, borderRadius: 9, borderWidth: 1, color: colors.text, fontSize: 12, minHeight: 44, outlineStyle: 'none', paddingHorizontal: 12, paddingVertical: 10 } as never,
  multiline: { minHeight: 92, textAlignVertical: 'top' },
  noteInput: { minHeight: 150, textAlignVertical: 'top' },
  source: { backgroundColor: colors.softGreen, borderRadius: 10, marginBottom: 16, padding: 12 },
  sourceLabel: { color: colors.green700, fontSize: 9, fontWeight: '800' },
  sourceText: { color: colors.textMuted, fontSize: 10, lineHeight: 16, marginTop: 5 },
  save: { alignItems: 'center', backgroundColor: colors.green700, borderRadius: 10, flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: 4, minHeight: 45 },
  disabled: { opacity: 0.35 },
  saveText: { color: colors.white, fontSize: 12, fontWeight: '700' },
});
