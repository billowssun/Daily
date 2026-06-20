import { colors } from '../theme';

export const initialTasks = [
  { id: 'prototype', title: '完成产品原型设计', time: '10:00', done: true },
  { id: 'meeting', title: '与团队周会', time: '11:30', done: false },
  { id: 'fitness', title: '健身 30 分钟', time: '18:30', done: false },
  { id: 'reading', title: '阅读《清醒思考》', time: '20:00', done: false },
  { id: 'review', title: '复盘今日重点', time: '21:30', done: true },
  { id: 'plan', title: '整理明日计划', time: '22:00', done: true },
];

export const weekDays = [
  { name: '一', date: '20', active: true, events: [colors.green600] },
  { name: '二', date: '21', active: false, events: [colors.gold500, colors.gold500] },
  { name: '三', date: '22', active: false, events: [colors.violet500, colors.violet500] },
  { name: '四', date: '23', active: false, events: [] },
  { name: '五', date: '24', active: false, events: [colors.green600, colors.green600] },
  { name: '六', date: '25', active: false, events: [] },
  { name: '日', date: '26', active: false, events: [colors.cyan600] },
];

export const aiSummary = {
  focus: 78,
  done: 18,
  hours: 6.5,
  trend: [18, 26, 20, 32, 24, 36, 30],
};

export const financeSummary = {
  total: 238600,
  growth: 6.5,
  allocation: [
    { label: '现金及存款', value: 45, color: colors.green600 },
    { label: '投资', value: 35, color: colors.cyan600 },
    { label: '保险', value: 10, color: colors.violet500 },
    { label: '其他', value: 10, color: colors.gold500 },
  ],
};
