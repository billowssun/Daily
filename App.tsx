import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, Platform, SafeAreaView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { CalendarPage } from './src/components/CalendarPage';
import { Dashboard } from './src/components/Dashboard';
import { NoteEditor, TaskEditor } from './src/components/Editors';
import { FinancePage } from './src/components/FinancePage';
import { Navigation } from './src/components/Navigation';
import { NotesPage } from './src/components/NotesPage';
import { OverviewPage } from './src/components/OverviewPage';
import { TodoPage } from './src/components/TodoPage';
import { useRixuState } from './src/hooks/use-rixu-state';
import { colors } from './src/theme';
import type { TabKey } from './src/types';

function confirmDelete(message: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (globalThis.confirm(message)) onConfirm();
    return;
  }
  Alert.alert('确认删除', message, [
    { text: '取消', style: 'cancel' },
    { text: '删除', style: 'destructive', onPress: onConfirm },
  ]);
}

export default function App() {
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const rixu = useRixuState();
  const isDesktop = width >= 900;

  if (activeTab === 'finance') {
    return <FinancePage onBack={() => setActiveTab('home')} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'note':
        return (
          <NotesPage
            isDesktop={isDesktop}
            notes={rixu.notes}
            onConvert={rixu.convertNote}
            onCreate={rixu.openNewNote}
            onDelete={(id) => confirmDelete('删除后无法恢复；已经转出的待办仍会保留。', () => rixu.deleteNote(id))}
            onEdit={rixu.editNote}
          />
        );
      case 'todo':
        return (
          <TodoPage
            isDesktop={isDesktop}
            notes={rixu.notes}
            tasks={rixu.tasks}
            onCreate={() => rixu.openNewTask()}
            onDelete={(id) => confirmDelete('删除后无法恢复；来源随记仍会保留。', () => rixu.deleteTask(id))}
            onEdit={rixu.editTask}
            onToggle={rixu.toggleTask}
          />
        );
      case 'calendar':
        return (
          <CalendarPage
            activeDate={rixu.activeDate}
            isDesktop={isDesktop}
            tasks={rixu.tasks}
            onDateChange={rixu.setActiveDate}
            onEditTask={rixu.editTask}
            onToggleTask={rixu.toggleTask}
          />
        );
      case 'overview':
        return <OverviewPage isDesktop={isDesktop} notes={rixu.notes} tasks={rixu.tasks} onNavigate={setActiveTab} />;
      case 'home':
      default:
        return (
          <Dashboard
            isDesktop={isDesktop}
            notes={rixu.notes}
            tasks={rixu.tasks}
            onCreateNote={rixu.openNewNote}
            onCreateTask={() => rixu.openNewTask()}
            onNavigate={setActiveTab}
            onToggleTask={rixu.toggleTask}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.appShell}>
      <StatusBar style="dark" />
      <View style={[styles.webFrame, isDesktop && styles.webFrameDesktop]}>
        {isDesktop ? (
          <Navigation activeTab={activeTab} layout="sidebar" onCenterPress={rixu.openNewNote} onChange={setActiveTab} />
        ) : null}
        <View style={styles.contentPanel}>{renderContent()}</View>
      </View>

      {rixu.toast ? (
        <Text accessibilityLiveRegion="polite" style={styles.toast} numberOfLines={1}>
          {rixu.toast}
        </Text>
      ) : null}

      {!isDesktop ? (
        <Navigation activeTab={activeTab} layout="tabs" onCenterPress={rixu.openNewNote} onChange={setActiveTab} />
      ) : null}

      <NoteEditor
        note={rixu.noteEditor.note}
        visible={rixu.noteEditor.visible}
        onClose={rixu.closeNoteEditor}
        onSave={rixu.saveNote}
      />
      <TaskEditor
        defaultInput={rixu.taskEditor.defaultInput}
        sourceLabel={rixu.sourceLabel}
        task={rixu.taskEditor.task}
        visible={rixu.taskEditor.visible}
        onClose={rixu.closeTaskEditor}
        onSave={rixu.saveTask}
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
    maxWidth: 1440,
    width: '100%',
  },
  contentPanel: {
    flex: 1,
    minWidth: 0,
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
