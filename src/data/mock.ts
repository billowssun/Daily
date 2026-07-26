import { CalendarDays, CheckSquare, Home, Landmark, Layers3, PenLine } from 'lucide-react-native';

import type { RixuState, TabItem } from '../types';

export const tabs: TabItem[] = [
  { key: 'home', label: '今天', icon: Home },
  { key: 'todo', label: '计划', icon: CheckSquare },
  { key: 'calendar', label: '日历', icon: CalendarDays },
  { key: 'finance', label: '财务', icon: Landmark },
  { key: 'overview', label: '回顾', icon: Layers3 },
  { key: 'note', label: '随记', icon: PenLine },
];

export const initialState: RixuState = {
  notes: [
    {
      id: 'note-review',
      content: '把周视图的信息密度再降低一些，保留真正需要立刻处理的事情。',
      status: 'converted',
      createdAt: '2026-07-24T09:20:00.000Z',
      updatedAt: '2026-07-24T09:40:00.000Z',
      convertedTaskId: 'task-design-review',
    },
    {
      id: 'note-family',
      content: '周末给父母打电话，顺便确认八月的家庭安排。',
      status: 'inbox',
      createdAt: '2026-07-25T15:10:00.000Z',
      updatedAt: '2026-07-25T15:10:00.000Z',
    },
    {
      id: 'note-reading',
      content: '读完《被讨厌的勇气》后，整理三条可以执行的笔记。',
      status: 'inbox',
      createdAt: '2026-07-26T08:30:00.000Z',
      updatedAt: '2026-07-26T08:30:00.000Z',
    },
  ],
  tasks: [
    {
      id: 'task-run',
      title: '晨跑 5 公里',
      detail: '轻松配速，结束后拉伸十分钟。',
      dueDate: '2026-07-26',
      done: true,
      createdAt: '2026-07-24T09:40:00.000Z',
      updatedAt: '2026-07-26T08:20:00.000Z',
    },
    {
      id: 'task-reading',
      title: '读书《被讨厌的勇气》',
      detail: '完成第六章，并记录关键观点。',
      dueDate: '2026-07-26',
      done: false,
      createdAt: '2026-07-24T16:00:00.000Z',
      updatedAt: '2026-07-24T18:30:00.000Z',
    },
    {
      id: 'task-design-review',
      title: '产品设计评审会',
      detail: '与团队同步新版设计方案，确认交互细节与开发排期。',
      dueDate: '2026-07-26',
      done: false,
      createdAt: '2026-07-24T10:00:00.000Z',
      updatedAt: '2026-07-25T10:00:00.000Z',
      sourceNoteId: 'note-review',
    },
    {
      id: 'task-weekly',
      title: '周计划与复盘',
      detail: '回顾本周承诺，安排下周三个最重要的结果。',
      dueDate: '2026-07-26',
      done: false,
      createdAt: '2026-07-25T10:00:00.000Z',
      updatedAt: '2026-07-25T10:00:00.000Z',
    },
    {
      id: 'task-card',
      title: '信用卡还款',
      detail: '招商银行信用卡本期账单。',
      dueDate: '2026-07-26',
      done: false,
      createdAt: '2026-07-20T10:00:00.000Z',
      updatedAt: '2026-07-20T10:00:00.000Z',
    },
    {
      id: 'task-health',
      title: '体检预约',
      detail: '确认体检中心时间和注意事项。',
      dueDate: '2026-07-28',
      done: false,
      createdAt: '2026-07-22T10:00:00.000Z',
      updatedAt: '2026-07-22T10:00:00.000Z',
    },
  ],
};
