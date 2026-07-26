import { useCallback, useEffect, useMemo, useState } from 'react';

import { todayString } from '../date';
import { initialState } from '../data/mock';
import { loadRixuState, saveRixuState } from '../storage';
import type { Note, NoteInput, RixuState, Task, TaskInput } from '../types';

type NoteEditorState = {
  visible: boolean;
  note?: Note;
};

type TaskEditorState = {
  visible: boolean;
  task?: Task;
  sourceNote?: Note;
  defaultInput?: TaskInput;
};

const nowIso = () => new Date().toISOString();
const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function useRixuState() {
  const [activeDate, setActiveDate] = useState(todayString());
  const [state, setState] = useState<RixuState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState('随记、待办、日历已经连成闭环');
  const [noteEditor, setNoteEditor] = useState<NoteEditorState>({ visible: false });
  const [taskEditor, setTaskEditor] = useState<TaskEditorState>({ visible: false });

  useEffect(() => {
    let active = true;
    loadRixuState().then((stored) => {
      if (!active) return;
      setState(stored);
      setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (hydrated) void saveRixuState(state);
  }, [hydrated, state]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 2400);
    return () => clearTimeout(timer);
  }, [toast]);

  const sourceLabel = useMemo(() => taskEditor.sourceNote?.content, [taskEditor.sourceNote]);

  const showToast = useCallback((message: string) => {
    setToast(message);
  }, []);

  const openNewNote = useCallback(() => setNoteEditor({ visible: true }), []);

  const openNewTask = useCallback(
    (defaultInput?: TaskInput) => setTaskEditor({ visible: true, defaultInput }),
    [],
  );

  const closeNoteEditor = useCallback(() => setNoteEditor({ visible: false }), []);

  const closeTaskEditor = useCallback(() => setTaskEditor({ visible: false }), []);

  const editNote = useCallback((note: Note) => setNoteEditor({ visible: true, note }), []);

  const editTask = useCallback((task: Task) => setTaskEditor({ visible: true, task }), []);

  const saveNote = useCallback(
    (input: NoteInput) => {
      setState((current) => {
        const timestamp = nowIso();
        if (noteEditor.note) {
          return {
            ...current,
            notes: current.notes.map((note) =>
              note.id === noteEditor.note?.id ? { ...note, content: input.content, updatedAt: timestamp } : note,
            ),
          };
        }

        return {
          ...current,
          notes: [
            {
              id: createId('note'),
              content: input.content,
              status: 'inbox',
              createdAt: timestamp,
              updatedAt: timestamp,
            },
            ...current.notes,
          ],
        };
      });
      setNoteEditor({ visible: false });
      showToast(noteEditor.note ? '随记已更新' : '随记已保存');
    },
    [noteEditor.note, showToast],
  );

  const saveTask = useCallback(
    (input: TaskInput) => {
      setState((current) => {
        const timestamp = nowIso();
        if (taskEditor.task) {
          return {
            ...current,
            tasks: current.tasks.map((task) =>
              task.id === taskEditor.task?.id ? { ...task, ...input, updatedAt: timestamp } : task,
            ),
          };
        }

        const taskId = createId('task');
        return {
          notes: taskEditor.sourceNote
            ? current.notes.map((note) =>
                note.id === taskEditor.sourceNote?.id
                  ? { ...note, status: 'converted', convertedTaskId: taskId, updatedAt: timestamp }
                  : note,
              )
            : current.notes,
          tasks: [
            {
              id: taskId,
              title: input.title,
              detail: input.detail,
              dueDate: input.dueDate,
              done: false,
              createdAt: timestamp,
              updatedAt: timestamp,
              sourceNoteId: taskEditor.sourceNote?.id,
            },
            ...current.tasks,
          ],
        };
      });
      setTaskEditor({ visible: false });
      showToast(taskEditor.sourceNote ? '随记已整理成待办' : taskEditor.task ? '待办已更新' : '待办已新增');
    },
    [showToast, taskEditor.sourceNote, taskEditor.task],
  );

  const deleteNote = useCallback(
    (id: string) => {
      setState((current) => ({ ...current, notes: current.notes.filter((note) => note.id !== id) }));
      showToast('随记已删除，已转出的待办会保留');
    },
    [showToast],
  );

  const deleteTask = useCallback(
    (id: string) => {
      setState((current) => ({ ...current, tasks: current.tasks.filter((task) => task.id !== id) }));
      showToast('待办已删除');
    },
    [showToast],
  );

  const toggleTask = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === id ? { ...task, done: !task.done, updatedAt: nowIso() } : task,
      ),
    }));
  }, []);

  const convertNote = useCallback(
    (note: Note) => {
      if (note.status === 'converted') {
        showToast('这条随记已经转成待办');
        return;
      }
      setTaskEditor({
        visible: true,
        sourceNote: note,
        defaultInput: {
          title: note.content.slice(0, 28),
          detail: note.content,
          dueDate: activeDate,
        },
      });
    },
    [activeDate, showToast],
  );

  return {
    activeDate,
    closeNoteEditor,
    closeTaskEditor,
    convertNote,
    deleteNote,
    deleteTask,
    editNote,
    editTask,
    noteEditor,
    notes: state.notes,
    openNewNote,
    openNewTask,
    saveNote,
    saveTask,
    setActiveDate,
    sourceLabel,
    taskEditor,
    tasks: state.tasks,
    toast,
    toggleTask,
  };
}
