import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react-native';

export type TabKey = 'home' | 'note' | 'todo' | 'calendar' | 'overview' | 'finance';

export type TabItem = {
  key: TabKey;
  label: string;
  icon: ComponentType<LucideProps>;
};

export type NoteStatus = 'inbox' | 'converted';

export type Note = {
  id: string;
  content: string;
  status: NoteStatus;
  createdAt: string;
  updatedAt: string;
  convertedTaskId?: string;
};

export type Task = {
  id: string;
  title: string;
  detail?: string;
  dueDate?: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
  sourceNoteId?: string;
};

export type RixuState = {
  notes: Note[];
  tasks: Task[];
};

export type NoteInput = {
  content: string;
};

export type TaskInput = {
  title: string;
  detail?: string;
  dueDate?: string;
};
