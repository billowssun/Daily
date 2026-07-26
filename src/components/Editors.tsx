import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '../theme';
import type { Note, NoteInput, Task, TaskInput } from '../types';
import { sharedStyles } from './shared';

type NoteEditorProps = {
  visible: boolean;
  note?: Note;
  onClose: () => void;
  onSave: (input: NoteInput) => void;
};

type TaskEditorProps = {
  visible: boolean;
  task?: Task;
  defaultInput?: TaskInput;
  sourceLabel?: string;
  onClose: () => void;
  onSave: (input: TaskInput) => void;
};

export function NoteEditor({ visible, note, onClose, onSave }: NoteEditorProps) {
  const [content, setContent] = useState('');

  useEffect(() => {
    if (visible) setContent(note?.content ?? '');
  }, [note, visible]);

  const submit = () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    onSave({ content: trimmed });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{note ? '编辑随记' : '新增随记'}</Text>
          <TextInput
            multiline
            placeholder="把脑子里的碎片先放在这里……"
            placeholderTextColor={colors.textSoft}
            style={[styles.input, styles.textarea]}
            value={content}
            onChangeText={setContent}
          />
          <View style={styles.actions}>
            <Pressable style={sharedStyles.ghostButton} onPress={onClose}>
              <Text style={sharedStyles.ghostText}>取消</Text>
            </Pressable>
            <Pressable style={sharedStyles.button} onPress={submit}>
              <Text style={sharedStyles.buttonText}>保存</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function TaskEditor({ visible, task, defaultInput, sourceLabel, onClose, onSave }: TaskEditorProps) {
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (!visible) return;
    setTitle(task?.title ?? defaultInput?.title ?? '');
    setDetail(task?.detail ?? defaultInput?.detail ?? '');
    setDueDate(task?.dueDate ?? defaultInput?.dueDate ?? '');
  }, [defaultInput, task, visible]);

  const submit = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    onSave({
      title: trimmedTitle,
      detail: detail.trim() || undefined,
      dueDate: dueDate.trim() || undefined,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{task ? '编辑待办' : '新增待办'}</Text>
          {sourceLabel ? <Text style={styles.source}>来源随记：{sourceLabel}</Text> : null}
          <TextInput
            placeholder="待办标题"
            placeholderTextColor={colors.textSoft}
            style={styles.input}
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            multiline
            placeholder="备注，可留空"
            placeholderTextColor={colors.textSoft}
            style={[styles.input, styles.textareaSmall]}
            value={detail}
            onChangeText={setDetail}
          />
          <TextInput
            placeholder="日期：YYYY-MM-DD，可留空"
            placeholderTextColor={colors.textSoft}
            style={styles.input}
            value={dueDate}
            onChangeText={setDueDate}
          />
          <View style={styles.actions}>
            <Pressable style={sharedStyles.ghostButton} onPress={onClose}>
              <Text style={sharedStyles.ghostText}>取消</Text>
            </Pressable>
            <Pressable style={sharedStyles.button} onPress={submit}>
              <Text style={sharedStyles.buttonText}>保存</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: colors.backdrop,
    flex: 1,
    justifyContent: 'center',
    padding: 18,
  },
  sheet: {
    backgroundColor: colors.card,
    borderRadius: 22,
    gap: 12,
    maxWidth: 560,
    padding: 20,
    width: '100%',
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  source: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  input: {
    backgroundColor: colors.softGreen,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    minHeight: 46,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  textarea: {
    minHeight: 150,
    textAlignVertical: 'top',
  },
  textareaSmall: {
    minHeight: 84,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
});
