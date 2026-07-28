import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { AuthGate, AuthProvider, useAuth } from './src/auth';
import { AdminWorkspace } from './src/components/AdminWorkspace';
import { Dashboard } from './src/components/Dashboard';
import { NoteEditor, TaskEditor } from './src/components/Editors';
import { FinanceWorkspace } from './src/components/FinanceWorkspace';
import { Navigation } from './src/components/Navigation';
import { CalendarWorkspace, PlanWorkspace, ReviewWorkspace } from './src/components/WorkspacePages';
import { useRixuState } from './src/hooks/use-rixu-state';
import { colors } from './src/theme';
import type { TabKey } from './src/types';

export default function App() {
  return (
    <AuthProvider>
      <AuthGate>
        <AuthenticatedApp />
      </AuthGate>
    </AuthProvider>
  );
}

function AuthenticatedApp() {
  const { width } = useWindowDimensions();
  const { profile, signOut, user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const rixu = useRixuState(user!.id);
  const isDesktop = width >= 760;

  useEffect(() => {
    if (activeTab === 'note') {
      rixu.openNewNote();
      setActiveTab('home');
    }
  }, [activeTab, rixu]);

  const common = {
    isDesktop,
    notes: rixu.notes,
    tasks: rixu.tasks,
    onCreateTask: () => rixu.openNewTask(),
    onEditTask: rixu.editTask,
    onToggleTask: rixu.toggleTask,
    onNavigate: setActiveTab,
  };

  return (
    <SafeAreaView style={styles.app}>
      <StatusBar style="dark" />
      <View style={styles.shell}>
        {isDesktop ? (
          <Navigation
            activeTab={activeTab}
            isAdmin={profile?.role === 'admin'}
            layout="sidebar"
            profileName={profile?.display_name || user?.email || '用户'}
            onCenterPress={rixu.openNewNote}
            onChange={setActiveTab}
            onSignOut={() => void signOut()}
          />
        ) : null}

        <View style={styles.content}>
          {activeTab === 'home' ? (
            <Dashboard
              isDesktop={isDesktop}
              notes={rixu.notes}
              tasks={rixu.tasks}
              onCreateNote={rixu.openNewNote}
              onCreateTask={() => rixu.openNewTask()}
              onNavigate={setActiveTab}
              onToggleTask={rixu.toggleTask}
              onEditTask={rixu.editTask}
            />
          ) : null}
          {activeTab === 'todo' ? <PlanWorkspace {...common} /> : null}
          {activeTab === 'calendar' ? <CalendarWorkspace {...common} /> : null}
          {activeTab === 'finance' ? <FinanceWorkspace userId={user!.id} /> : null}
          {activeTab === 'overview' ? <ReviewWorkspace {...common} /> : null}
          {activeTab === 'admin' && profile?.role === 'admin' ? <AdminWorkspace currentUserId={user!.id} /> : null}
        </View>

        {!isDesktop ? (
          <Navigation
            activeTab={activeTab}
            isAdmin={profile?.role === 'admin'}
            layout="tabs"
            profileName={profile?.display_name || user?.email || '用户'}
            onCenterPress={rixu.openNewNote}
            onChange={setActiveTab}
            onSignOut={() => void signOut()}
          />
        ) : null}
      </View>

      <NoteEditor note={rixu.noteEditor.note} visible={rixu.noteEditor.visible} onClose={rixu.closeNoteEditor} onSave={rixu.saveNote} />
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
  app: { backgroundColor: colors.background, flex: 1 },
  shell: { flex: 1 },
  content: { flex: 1, minHeight: 0 },
});
