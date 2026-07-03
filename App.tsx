import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { CalendarPage } from './src/components/CalendarPage';
import { Dashboard } from './src/components/Dashboard';
import { NoteEditor, TaskEditor } from './src/components/Editors';
import { Navigation } from './src/components/Navigation';
import { NotesPage } from './src/components/NotesPage';
import { OverviewPage } from './src/components/OverviewPage';
import { TodoPage } from './src/components/TodoPage';
import { todayString } from './src/date';
import { initialState } from './src/data/mock';
import { loadRixuState, saveRixuState } from './src/storage';
import { colors } from './src/theme';
import type { Note, NoteInput, RixuState, TabKey, Task, TaskInput } from './src/types';

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

export default function App() {
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [activeDate, setActiveDate] = useState(todayString());
  const [state, setState] = useState<RixuState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState('随记、待办、日历已经连成闭环');
  const [noteEditor, setNoteEditor] = useState<NoteEditorState>({ visible: false });
  const [taskEditor, setTaskEditor] = useState<TaskEditorState>({ visible: false });

  const isDesktop = width >= 900;
  const notes = state.notes;
  const tasks = state.tasks;

  useEffect(() => {
    setState(loadRixuState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveRixuState(state);
  }, [hydrated, state]);

  const sourceLabel = useMemo(() => taskEditor.sourceNote?.content, [taskEditor.sourceNote]);

  const showToast = (message: string) => {
    setToast(message);
  };

  const openNewNote = () => setNoteEditor({ visible: true });
  const openNewTask = (defaultInput?: TaskInput) => setTaskEditor({ visible: true, defaultInput });

  const saveNote = (input: NoteInput) => {
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
  };

  const saveTask = (input: TaskInput) => {
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
  };

  const deleteNote = (id: string) => {
    setState((current) => ({ ...current, notes: current.notes.filter((note) => note.id !== id) }));
    showToast('随记已删除，已转出的待办会保留');
  };

  const deleteTask = (id: string) => {
    setState((current) => ({ ...current, tasks: current.tasks.filter((task) => task.id !== id) }));
    showToast('待办已删除');
  };

  const toggleTask = (id: string) => {
    setState((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === id ? { ...task, done: !task.done, updatedAt: nowIso() } : task,
      ),
    }));
  };

  const convertNote = (note: Note) => {
    setTaskEditor({
      visible: true,
      sourceNote: note,
      defaultInput: {
        title: note.content.slice(0, 28),
        detail: note.content,
        dueDate: activeDate,
      },
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'note':
        return (
          <NotesPage
            isDesktop={isDesktop}
            notes={notes}
            onConvert={convertNote}
            onCreate={openNewNote}
            onDelete={deleteNote}
            onEdit={(note) => setNoteEditor({ visible: true, note })}
          />
        );
      case 'todo':
        return (
          <TodoPage
            isDesktop={isDesktop}
            notes={notes}
            tasks={tasks}
            onCreate={() => openNewTask()}
            onDelete={deleteTask}
            onEdit={(task) => setTaskEditor({ visible: true, task })}
            onToggle={toggleTask}
          />
        );
      case 'calendar':
        return (
          <CalendarPage
            activeDate={activeDate}
            isDesktop={isDesktop}
            tasks={tasks}
            onDateChange={setActiveDate}
            onEditTask={(task) => setTaskEditor({ visible: true, task })}
            onToggleTask={toggleTask}
          />
        );
      case 'overview':
        return <OverviewPage isDesktop={isDesktop} notes={notes} tasks={tasks} onNavigate={setActiveTab} />;
      case 'home':
      default:
        return (
          <Dashboard
            isDesktop={isDesktop}
            notes={notes}
            tasks={tasks}
            onCreateNote={openNewNote}
            onCreateTask={() => openNewTask()}
            onNavigate={setActiveTab}
            onToggleTask={toggleTask}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.appShell}>
      <StatusBar style="dark" />
      <View style={[styles.webFrame, isDesktop && styles.webFrameDesktop]}>
        {isDesktop ? (
          <Navigation activeTab={activeTab} layout="sidebar" onCenterPress={openNewNote} onChange={setActiveTab} />
        ) : null}

        <View style={styles.contentPanel}>{renderContent()}</View>
      </View>

      <Text style={styles.toast} numberOfLines={1}>
        {toast}
      </Text>

      {!isDesktop ? (
        <Navigation activeTab={activeTab} layout="tabs" onCenterPress={openNewNote} onChange={setActiveTab} />
      ) : null}

      <NoteEditor
        note={noteEditor.note}
        visible={noteEditor.visible}
        onClose={() => setNoteEditor({ visible: false })}
        onSave={saveNote}
      />
      <TaskEditor
        defaultInput={taskEditor.defaultInput}
        sourceLabel={sourceLabel}
        task={taskEditor.task}
        visible={taskEditor.visible}
        onClose={() => setTaskEditor({ visible: false })}
        onSave={saveTask}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
    backgroundColor: colors.background,
  },
  webFrame: {
    flex: 1,
  },
  webFrameDesktop: {
    alignSelf: 'center',
    flexDirection: 'row',
    maxWidth: 1180,
    width: '100%',
  },
  contentPanel: {
    flex: 1,
  },
  toast: {
    alignSelf: 'center',
    backgroundColor: colors.toast,
    borderRadius: 999,
    bottom: 98,
    color: colors.green800,
    fontSize: 12,
    fontWeight: '600',
    maxWidth: '82%',
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 7,
    position: 'absolute',
  },
});
