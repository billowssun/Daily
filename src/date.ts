import type { Task } from './types';

export const todayString = () => toDateKey(new Date());

export const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const formatDateLabel = (dateKey?: string) => {
  if (!dateKey) return '未安排日期';
  const date = parseDateKey(dateKey);
  return `${date.getMonth() + 1} 月 ${date.getDate()} 日`;
};

export const formatWeekday = (dateKey: string) => {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return weekdays[parseDateKey(dateKey).getDay()];
};

export const getMonthMatrix = (monthKey: string) => {
  const firstDay = parseDateKey(`${monthKey}-01`);
  const year = firstDay.getFullYear();
  const month = firstDay.getMonth();
  const firstWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ dateKey?: string; day?: number }> = [];

  for (let index = 0; index < firstWeekday; index += 1) {
    cells.push({});
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ dateKey: toDateKey(new Date(year, month, day)), day });
  }

  while (cells.length % 7 !== 0) {
    cells.push({});
  }

  return cells;
};

export const shiftMonth = (monthKey: string, offset: number) => {
  const current = parseDateKey(`${monthKey}-01`);
  return toDateKey(new Date(current.getFullYear(), current.getMonth() + offset, 1)).slice(0, 7);
};

export const sortTasksByDate = (tasks: Task[]) =>
  [...tasks].sort((left, right) => {
    const leftDate = left.dueDate ?? '9999-12-31';
    const rightDate = right.dueDate ?? '9999-12-31';
    return leftDate.localeCompare(rightDate) || left.createdAt.localeCompare(right.createdAt);
  });

export const getWeekRange = (dateKey: string) => {
  const date = parseDateKey(dateKey);
  const day = date.getDay();
  const start = new Date(date);
  start.setDate(date.getDate() - day);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: toDateKey(start), end: toDateKey(end) };
};
