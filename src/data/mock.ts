import { CalendarDays, CheckSquare, Home, Layers3, PenLine } from 'lucide-react-native';

import type { RixuState, TabItem } from '../types';

export const tabs: TabItem[] = [
  { key: 'home', label: '首页', icon: Home },
  { key: 'note', label: '随记', icon: PenLine },
  { key: 'todo', label: '待办', icon: CheckSquare },
  { key: 'calendar', label: '日历', icon: CalendarDays },
  { key: 'overview', label: '总览', icon: Layers3 },
];

export const initialState: RixuState = {
  notes: [
    {
      id: 'note-idea-web',
      content: '把零碎想法先放进随记箱，每天晚上统一整理。',
      status: 'converted',
      createdAt: '2026-07-01T09:20:00.000Z',
      updatedAt: '2026-07-01T09:40:00.000Z',
      convertedTaskId: 'task-review-notes',
    },
    {
      id: 'note-calendar',
      content: '日历要能看到带日期的待办，不然闭环不明显。',
      status: 'inbox',
      createdAt: '2026-07-02T15:10:00.000Z',
      updatedAt: '2026-07-02T15:10:00.000Z',
    },
    {
      id: 'note-global',
      content: '做一个总览，能看到随记、待办、日历之间怎么联动。',
      status: 'inbox',
      createdAt: '2026-07-03T08:30:00.000Z',
      updatedAt: '2026-07-03T08:30:00.000Z',
    },
  ],
  tasks: [
    {
      id: 'task-review-notes',
      title: '整理随记箱',
      detail: '把可行动的想法转成待办，其余保留在收集箱。',
      dueDate: '2026-07-03',
      done: false,
      createdAt: '2026-07-01T09:40:00.000Z',
      updatedAt: '2026-07-01T09:40:00.000Z',
      sourceNoteId: 'note-idea-web',
    },
    {
      id: 'task-calendar-flow',
      title: '确认日历联动规则',
      detail: '只有带日期的待办进入日历。',
      dueDate: '2026-07-04',
      done: true,
      createdAt: '2026-07-02T16:00:00.000Z',
      updatedAt: '2026-07-02T18:30:00.000Z',
    },
    {
      id: 'task-undated',
      title: '收集下一版想法',
      detail: '先不安排日期，停留在待办池。',
      done: false,
      createdAt: '2026-07-03T10:00:00.000Z',
      updatedAt: '2026-07-03T10:00:00.000Z',
    },
  ],
};
