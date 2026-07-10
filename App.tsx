import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Circle, Line, Path, Polyline } from 'react-native-svg';
import {
  BarChart3,
  CalendarDays,
  Check,
  CheckSquare2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Grid2X2,
  Home,
  Image as ImageIcon,
  List,
  Mic,
  MoreHorizontal,
  PenLine,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Sun,
} from 'lucide-react-native';

type PageKey = 'today' | 'todos' | 'notes' | 'calendar' | 'review';

const C = {
  blue: '#2F73F6',
  blueSoft: '#EEF4FF',
  ink: '#172033',
  muted: '#73819D',
  faint: '#A8B3C7',
  line: '#E6EBF3',
  canvas: '#F8FAFD',
  white: '#FFFFFF',
  green: '#3DBB73',
  greenSoft: '#ECF9F1',
  purple: '#9A6AF0',
  purpleSoft: '#F4EEFF',
  amber: '#FDBA3B',
  amberSoft: '#FFF7E6',
  red: '#F05D62',
  redSoft: '#FFF1F1',
};

const navItems: { key: PageKey; label: string; icon: typeof Home }[] = [
  { key: 'today', label: '今天', icon: Home },
  { key: 'todos', label: '待办', icon: CheckSquare2 },
  { key: 'notes', label: '随记', icon: PenLine },
  { key: 'calendar', label: '日历', icon: CalendarDays },
  { key: 'review', label: '回顾', icon: BarChart3 },
];

const tasks = [
  ['完成产品需求文档初稿', '工作', '10:00'],
  ['晨跑 30 分钟', '健康', '07:00'],
  ['产品需求评审会议', '工作', '10:00'],
  ['与设计团队评审界面方案', '工作', '14:00'],
  ['整理上周的用户反馈', '工作', '16:00'],
  ['购买生日礼物', '生活', '18:30'],
  ['学习《高效能人士的七个习惯》第 3 章', '健康', '20:00'],
  ['准备明天的周会汇报材料', '工作', '明天 09:00'],
] as const;

const futureTasks = [
  ['提交项目阶段性总结', '工作', '5月22日 周四'],
  ['预约牙科检查', '生活 · 健康', '5月23日 周五'],
  ['阅读《纳瓦尔宝典》', '健康', '5月24日 周六'],
  ['周末家庭聚餐', '生活', '5月25日 周日'],
  ['制定下周工作计划', '工作', '5月26日 周一'],
] as const;

const events = [
  ['09:00', '团队每日站会', '30 分钟', 'blue'],
  ['10:00', '产品需求评审', '60 分钟', 'blue'],
  ['13:30', '专注工作时间', '90 分钟', 'green'],
  ['15:30', '与设计沟通', '60 分钟', 'amber'],
  ['17:00', '复盘与整理', '30 分钟', 'purple'],
] as const;

export default function App() {
  const { width } = useWindowDimensions();
  const compact = width < 920;
  const [page, setPage] = useState<PageKey>('today');
  const [done, setDone] = useState<Set<number>>(new Set([0, 1]));
  const [toast, setToast] = useState('');

  const toggleTask = (index: number) => {
    setDone((current) => {
      const next = new Set(current);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  const notify = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 1800);
  };

  return (
    <View style={styles.app}>
      <StatusBar style="dark" />
      {!compact ? <Sidebar active={page} onChange={setPage} /> : <MobileNav active={page} onChange={setPage} />}
      <View style={[styles.main, compact && styles.mainCompact]}>
        {page === 'today' && <TodayPage done={done} onToggle={toggleTask} onOpenTodos={() => setPage('todos')} notify={notify} />}
        {page === 'todos' && <TodosPage done={done} onToggle={toggleTask} notify={notify} />}
        {page === 'notes' && <NotesPage notify={notify} />}
        {page === 'calendar' && <CalendarPage notify={notify} />}
        {page === 'review' && <ReviewPage notify={notify} />}
      </View>
      {toast ? <View style={styles.toast}><Text style={styles.toastText}>{toast}</Text></View> : null}
    </View>
  );
}

function Sidebar({ active, onChange }: { active: PageKey; onChange: (key: PageKey) => void }) {
  return (
    <View style={styles.sidebar}>
      <View style={styles.brandRow}>
        <View style={styles.logo}><PenLine size={25} color={C.white} strokeWidth={2.6} /></View>
        <Text style={styles.brand}>日序</Text>
      </View>
      <View style={styles.nav}>
        {navItems.map(({ key, label, icon: Icon }) => {
          const selected = active === key;
          return (
            <Pressable key={key} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => onChange(key)} style={[styles.navItem, selected && styles.navItemActive]}>
              {selected ? <View style={styles.activeRail} /> : null}
              <Icon size={20} color={selected ? C.blue : C.muted} strokeWidth={2} />
              <Text style={[styles.navLabel, selected && styles.navLabelActive]}>{label}</Text>
            </Pressable>
          );
        })}
        <View style={styles.navDivider} />
        <Pressable style={styles.navItem} accessibilityRole="button">
          <Settings size={20} color={C.muted} />
          <Text style={styles.navLabel}>设置</Text>
        </Pressable>
      </View>
      <View style={styles.localBadge}><View style={styles.onlineDot} /><Text style={styles.localText}>本地数据 · 离线可用</Text></View>
    </View>
  );
}

function MobileNav({ active, onChange }: { active: PageKey; onChange: (key: PageKey) => void }) {
  return (
    <View style={styles.mobileNav}>
      <Text style={styles.mobileBrand}>日序</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mobileLinks}>
        {navItems.map(({ key, label }) => (
          <Pressable key={key} onPress={() => onChange(key)} style={[styles.mobileLink, active === key && styles.mobileLinkActive]}>
            <Text style={[styles.mobileLinkText, active === key && styles.mobileLinkTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function PageHeader({ title, subtitle, action = '快速记录', onAction }: { title: string; subtitle?: string; action?: string; onAction: () => void }) {
  return (
    <View style={styles.pageHeader}>
      <View>
        <Text style={styles.pageTitle}>{title}</Text>
        {subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.headerActions}>
        <Pressable style={styles.primaryButton} onPress={onAction} accessibilityRole="button">
          <Plus size={20} color={C.white} /><Text style={styles.primaryButtonText}>{action}</Text><ChevronDown size={15} color={C.white} />
        </Pressable>
        <Pressable style={styles.iconButton} accessibilityLabel="切换主题"><Sun size={20} color={C.ink} /></Pressable>
      </View>
    </View>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function SectionTitle({ icon: Icon, children, link }: { icon?: typeof Home; children: React.ReactNode; link?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>{Icon ? <Icon size={19} color={C.blue} /> : null}<Text style={styles.sectionTitle}>{children}</Text></View>
      {link ? <Text style={styles.link}>{link} 〉</Text> : null}
    </View>
  );
}

function Donut({ value, label, color = C.green, size = 126, display }: { value: number; label: string; color?: string; size?: number; display?: string }) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 120 120" style={StyleSheet.absoluteFill}>
        <Circle cx="60" cy="60" r={radius} stroke="#E7ECF5" strokeWidth="9" fill="none" />
        <Circle cx="60" cy="60" r={radius} stroke={color} strokeWidth="9" fill="none" strokeLinecap="round" strokeDasharray={`${circumference * value / 100} ${circumference}`} transform="rotate(-90 60 60)" />
      </Svg>
      <Text style={styles.donutValue}>{display ?? `${value}%`}</Text><Text style={[styles.donutLabel, { color }]}>{label}</Text>
    </View>
  );
}

function TodayPage({ done, onToggle, onOpenTodos, notify }: { done: Set<number>; onToggle: (i: number) => void; onOpenTodos: () => void; notify: (s: string) => void }) {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <PageHeader title="今天" subtitle="5月20日 周二  农历四月廿三" onAction={() => notify('已打开快速记录')} />
      <Card style={styles.progressCard}>
        <Text style={styles.cardTitle}>今日进度</Text>
        <View style={styles.progressContent}>
          <Donut value={60} label="已完成" />
          <View style={styles.legend}>
            <Legend color={C.green} label="已完成" value="3" />
            <Legend color={C.blue} label="进行中" value="2" />
            <Legend color={C.faint} label="待完成" value="2" />
          </View>
          <View style={styles.quoteDivider} />
          <View style={styles.quote}><Text style={styles.quoteMark}>“</Text><Text style={styles.quoteText}>专注当下，{`\n`}让每一步都算数。</Text></View>
          <View style={styles.mountains}><View style={styles.mountainBack} /><View style={styles.mountainFront} /></View>
        </View>
      </Card>
      <View style={styles.twoColumns}>
        <Card style={styles.columnCard}>
          <SectionTitle icon={CheckSquare2} link="全部待办">今日待办</SectionTitle>
          {tasks.slice(0, 5).map((task, i) => <TaskRow key={task[0]} task={task} index={i} checked={done.has(i)} onToggle={onToggle} />)}
          <Pressable style={styles.addRow} onPress={onOpenTodos}><Plus size={18} color={C.blue} /><Text style={styles.addText}>新建待办</Text></Pressable>
        </Card>
        <Card style={styles.columnCard}>
          <SectionTitle icon={CalendarDays} link="日历视图">今日日程</SectionTitle>
          <View style={styles.timeline}>{events.map((event) => <EventRow key={event[0]} event={event} />)}</View>
        </Card>
      </View>
      <Card>
        <SectionTitle icon={PenLine} link="查看全部">今日随记</SectionTitle>
        <View style={styles.noteStrip}>
          <MiniNote time="10:15" color={C.green} title="灵感：" body="可以为随记添加标签和引用，方便日后回顾和整理。" tag="产品想法" />
          <MiniNote time="12:40" color={C.amber} title="午餐：" body="轻食沙拉 + 美式咖啡 ☕" />
          <MiniNote time="16:30" color={C.blue} title="会议记录要点：" body={'1. 需求优先级调整\n2. 上线时间预计提前一周'} />
        </View>
        <View style={styles.noteActions}><SmallAction icon={PenLine} label="文字" /><SmallAction icon={Mic} label="语音" /><SmallAction icon={ImageIcon} label="图片" /></View>
      </Card>
    </ScrollView>
  );
}

function Legend({ color, label, value }: { color: string; label: string; value: string }) {
  return <View style={styles.legendRow}><View style={[styles.dot, { backgroundColor: color }]} /><Text style={styles.legendLabel}>{label}</Text><Text style={styles.legendValue}>{value}</Text></View>;
}

function labelStyle(label: string) {
  if (label.includes('生活')) return [styles.tag, styles.tagGreen];
  if (label.includes('健康')) return [styles.tag, styles.tagPurple];
  return [styles.tag, styles.tagBlue];
}

function TaskRow({ task, index, checked, onToggle, priority }: { task: readonly [string, string, string]; index: number; checked: boolean; onToggle: (i: number) => void; priority?: string }) {
  return (
    <View style={styles.taskRow}>
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked }} onPress={() => onToggle(index)} style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked ? <Check size={15} color={C.white} strokeWidth={3} /> : null}
      </Pressable>
      <Text numberOfLines={1} style={[styles.taskText, checked && styles.taskDone]}>{task[0]}</Text>
      <Text style={labelStyle(task[1])}>{task[1]}</Text>
      {priority ? <Text style={[styles.priority, priority === '高' ? styles.priorityHigh : priority === '中' ? styles.priorityMid : styles.priorityLow]}>↑ {priority}</Text> : null}
      <Text style={styles.taskTime}>{task[2]}</Text>
    </View>
  );
}

function EventRow({ event }: { event: readonly [string, string, string, string] }) {
  const color = event[3] === 'green' ? C.green : event[3] === 'amber' ? C.amber : event[3] === 'purple' ? C.purple : C.blue;
  const soft = event[3] === 'green' ? C.greenSoft : event[3] === 'amber' ? C.amberSoft : event[3] === 'purple' ? C.purpleSoft : C.blueSoft;
  return (
    <View style={styles.eventRow}>
      <View style={styles.timeDot}><View style={[styles.dot, { backgroundColor: color }]} /><Text style={[styles.eventTime, { color }]}>{event[0]}</Text></View>
      <View style={[styles.eventPill, { backgroundColor: soft }]}><Text style={styles.eventTitle}>{event[1]}</Text><Text style={styles.eventDuration}>{event[2]}</Text></View>
    </View>
  );
}

function MiniNote({ time, color, title, body, tag }: { time: string; color: string; title: string; body: string; tag?: string }) {
  return <View style={styles.miniNote}><View style={styles.miniTime}><View style={[styles.dot, { backgroundColor: color }]} /><Text style={styles.miniTimeText}>{time}</Text></View><Text style={styles.miniTitle}>{title}</Text><Text style={styles.miniBody}>{body}</Text>{tag ? <Text style={[styles.tag, styles.tagBlue, styles.noteTag]}>{tag}</Text> : null}</View>;
}

function SmallAction({ icon: Icon, label }: { icon: typeof Home; label: string }) {
  return <Pressable style={styles.smallAction}><Icon size={17} color={C.blue} /><Text style={styles.smallActionText}>{label}</Text></Pressable>;
}

function TodosPage({ done, onToggle, notify }: { done: Set<number>; onToggle: (i: number) => void; notify: (s: string) => void }) {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <PageHeader title="待办事项" subtitle="专注当下，逐一完成，让每一件事都有进展。" action="添加任务" onAction={() => notify('已创建一条新任务')} />
      <View style={styles.todoLayout}>
        <Card style={styles.todoMain}>
          <View style={styles.filterBar}>
            <View style={styles.tabs}><Filter active label="今天" /><Filter label="本周" /><Filter label="全部" /><Filter label="已完成" /></View>
            <View style={styles.filters}><View style={styles.search}><Search size={17} color={C.faint} /><Text style={styles.searchText}>搜索任务</Text></View><Filter label="优先级⌄" /><Filter label="标签⌄" /><Pressable style={styles.moreButton}><MoreHorizontal size={18} color={C.ink} /></Pressable></View>
          </View>
          <Text style={styles.groupTitle}>今天 · 5月20日 周二  <Text style={styles.countBadge}> 8 </Text></Text>
          {tasks.map((task, i) => <TaskRow key={task[0]} task={task} index={i} checked={done.has(i)} onToggle={onToggle} priority={i === 0 || i === 2 ? '高' : i === 1 || i === 3 || i === 7 ? '中' : '低'} />)}
          <Pressable style={styles.addRow} onPress={() => notify('已创建一条新任务')}><Plus size={18} color={C.blue} /><Text style={styles.addText}>添加任务</Text></Pressable>
          <View style={styles.groupDivider} /><Text style={styles.groupTitle}>未来 · <Text style={styles.mutedText}>5</Text></Text>
          {futureTasks.map((task, i) => <TaskRow key={task[0]} task={task} index={i + 10} checked={false} onToggle={() => {}} />)}
        </Card>
        <View style={styles.todoSide}>
          <Card><Text style={styles.cardTitle}>概览</Text><View style={styles.overviewRow}><Donut value={75} display="8" label="全部任务" size={110} color={C.green} /><View style={styles.smallLegend}><Legend color={C.green} label="已完成" value="2" /><Legend color={C.blue} label="待完成" value="6" /><Legend color={C.red} label="已逾期" value="0" /></View></View></Card>
          <Card><Text style={styles.cardTitle}>按标签分布</Text><View style={styles.distRows}><Legend color={C.blue} label="工作" value="6" /><Legend color={C.green} label="生活" value="3" /><Legend color={C.purple} label="健康" value="2" /></View></Card>
          <Card><Text style={styles.cardTitle}>日历视图</Text><MiniCalendar /></Card>
          <Card><Text style={styles.cardTitle}>完成进度</Text><View style={styles.progressLabel}><Text style={styles.bigMetric}>25%</Text><Text style={styles.mutedText}>2 / 8 已完成</Text></View><View style={styles.bar}><View style={[styles.barFill, { width: '25%' }]} /></View></Card>
        </View>
      </View>
    </ScrollView>
  );
}

function Filter({ label, active }: { label: string; active?: boolean }) { return <Pressable style={[styles.filter, active && styles.filterActive]}><Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text></Pressable>; }

function MiniCalendar() {
  const days = ['一','二','三','四','五','六','日', '28','29','30','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','1'];
  return <View><View style={styles.calendarHeading}><ChevronLeft size={15} color={C.ink} /><Text style={styles.calendarMonth}>2025年5月</Text><ChevronRight size={15} color={C.ink} /></View><View style={styles.miniCalendarGrid}>{days.map((d,i) => <View key={`${d}-${i}`} style={[styles.miniDay, d === '20' && i > 20 && styles.miniDayActive]}><Text style={[styles.miniDayText, i < 7 && styles.weekText, d === '20' && i > 20 && styles.miniDayActiveText]}>{d}</Text></View>)}</View></View>;
}

function NotesPage({ notify }: { notify: (s: string) => void }) {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <PageHeader title="随记" subtitle="本地优先 · 快速捕捉一闪而过的想法" onAction={() => notify('已新建一条随记')} />
      <View style={styles.noteToolbar}><View style={[styles.search, styles.noteSearch]}><Search size={19} color={C.muted} /><Text style={styles.searchText}>搜索随记内容或标签...</Text></View><SmallAction icon={PenLine} label="文字" /><SmallAction icon={Mic} label="语音" /><SmallAction icon={ImageIcon} label="图片" /></View>
      <View style={styles.notesFilter}><View style={styles.tabs}><Filter active label="全部  32" /><Filter label="文字  23" /><Filter label="语音  5" /><Filter label="图片  4" /></View><View style={styles.viewToggle}><Text style={styles.mutedText}>最新⌄</Text><Grid2X2 size={18} color={C.blue} /><List size={18} color={C.muted} /></View></View>
      <View style={styles.masonry}>
        <NoteCard type="文字" time="今天 09:41" body={'生活不是等待风暴过去，\n而是学会在雨中起舞。'} tag="#灵感" />
        <NoteCard type="文字" time="今天 08:22" title="今日随记" body={'• 早起喝了杯温水，整个人清醒了不少\n• 读完《纳瓦尔宝典》第 3 章，很受启发\n• 下午去公园散步，拍了几张秋天的照片\n• 晚上试着做了番茄炒蛋，味道不错'} tag="#日常" green />
        <NoteCard type="文字" time="昨天 16:17" title="关于专注的思考" body={'真正的专注，不是让自己变得更努力，\n而是学会排除干扰，把注意力放在最\n重要的事情上。'} tag="#思考" />
        <NoteCard type="图片" time="昨天 15:03" body="午后的阳光和咖啡，刚刚好的组合。" tag="#生活" image />
        <NoteCard type="文字" time="5月18日 11:26" title="会议纪要：产品优化讨论" body={'• 优化首页信息层级，突出核心功能\n• 简化新用户引导流程\n• 增加深色模式切换选项\n• 下周一前输出原型方案'} tag="#工作   #会议" />
        <NoteCard type="语音" time="5月18日 10:45" body={'在散步时的想法：\n可以尝试把日序的回顾功能，加入\n更多可视化的数据展示。'} tag="#想法" audio />
        <NoteCard type="文字" time="5月17日 20:31" body={'今晚读到一句很喜欢的话：\n“你无法控制风的方向，\n但可以调整船帆。”'} tag="#灵感" />
        <NoteCard type="文字" time="5月17日 14:08" title="周末计划" body={'☑ 整理书架和桌面\n☐ 完成读书笔记\n☐ 跑步 5 公里\n☐ 看一部电影'} tag="#计划" green />
      </View>
    </ScrollView>
  );
}

function NoteCard({ type, time, title, body, tag, image, audio, green }: { type: string; time: string; title?: string; body: string; tag: string; image?: boolean; audio?: boolean; green?: boolean }) {
  return <Card style={styles.noteCard}><View style={styles.noteCardTop}><View style={styles.noteType}><PenLine size={15} color={type === '图片' ? C.green : type === '语音' ? C.purple : C.blue} /><Text style={styles.noteTypeText}>{type}</Text></View><Text style={styles.mutedText}>{time}</Text></View>{image ? <Image source={require('./assets/note-coffee.png')} style={styles.noteImage as never} accessibilityLabel="咖啡、笔记本和钢笔" /> : null}{audio ? <View style={styles.audioBar}><View style={styles.play}><Text style={styles.playText}>▶</Text></View><Text style={styles.wave}>▂▅▃▆▄▇▃▅▇▂▆▄▅▃▇▅▂</Text><Text style={styles.mutedText}>01:28</Text></View> : null}{title ? <Text style={styles.noteTitle}>{title}</Text> : null}<Text style={styles.noteBody}>{body}</Text><View style={styles.noteBottom}><Text style={[styles.noteTagPill, green && styles.noteTagGreen]}>{tag}</Text><MoreHorizontal size={18} color={C.muted} /></View></Card>;
}

const weekEvents = [
  { day: 0, top: 55, h: 74, title: '团队每日站会', time: '09:00', color: 'blue' },
  { day: 1, top: 82, h: 82, title: '需求对齐会', time: '09:30', color: 'amber' },
  { day: 2, top: 55, h: 74, title: '团队每日站会', time: '09:00', color: 'blue' },
  { day: 2, top: 137, h: 78, title: '用户访谈', time: '10:30', color: 'purple' },
  { day: 3, top: 82, h: 102, title: '产品方案评审', time: '09:30', color: 'green' },
  { day: 4, top: 55, h: 74, title: '团队每日站会', time: '09:00', color: 'blue' },
  { day: 0, top: 330, h: 92, title: '项目进度同步', time: '14:00', color: 'green' },
  { day: 1, top: 330, h: 92, title: '设计方案评审', time: '14:00', color: 'amber' },
  { day: 2, top: 330, h: 92, title: '与客户沟通', time: '14:00', color: 'blue' },
  { day: 3, top: 385, h: 84, title: '技术方案讨论', time: '15:00', color: 'amber' },
  { day: 4, top: 330, h: 92, title: '数据分析复盘', time: '14:00', color: 'green' },
  { day: 6, top: 330, h: 92, title: '周末健身', time: '14:00', color: 'purple' },
] as const;

function CalendarPage({ notify }: { notify: (s: string) => void }) {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <PageHeader title="日历" action="新建日程" onAction={() => notify('已新建日程')} />
      <View style={styles.calendarToolbar}><View style={styles.toolbarLeft}><Filter label="今天" /><Filter label="‹" /><Filter label="›" /><CalendarDays size={18} color={C.ink} /><Text style={styles.calendarTitle}>2025年5月（第21周）⌄</Text></View><View style={styles.segment}><Text style={styles.segmentText}>日</Text><Text style={[styles.segmentText, styles.segmentActive]}>周</Text><Text style={styles.segmentText}>月</Text></View></View>
      <View style={styles.calendarLayout}>
        <Card style={styles.weekCalendar}><View style={styles.weekHeader}><View style={styles.timeColumn} />{['5/19\n周一','5/20\n周二','5/21\n周三','5/22\n周四','5/23\n周五','5/24\n周六','5/25\n周日'].map((d,i) => <View key={d} style={styles.weekHeaderCell}><Text style={[styles.weekHeaderText, i === 2 && styles.selectedDateText]}>{d}</Text></View>)}</View><View style={styles.allDayRow}><Text style={styles.timeLabel}>全天</Text><Text style={[styles.allDayEvent, { left: '17%' }]}>产品评审</Text><Text style={[styles.allDayEvent, { left: '51%', color: C.blue, backgroundColor: C.blueSoft }]}>团队建设活动</Text><Text style={[styles.allDayEvent, { left: '76%', color: C.purple, backgroundColor: C.purpleSoft }]}>周末阅读计划</Text></View><View style={styles.timeGrid}>{Array.from({ length: 14 },(_,i) => <View key={i} style={[styles.hourLine, { top: i * 55 }]}><Text style={styles.hourText}>{String(i + 8).padStart(2,'0')}:00</Text></View>)}{weekEvents.map((e,i) => <CalendarEvent key={i} event={e} />)}<View style={styles.nowLine}><View style={styles.nowDot} /></View></View></Card>
        <Card style={styles.dayPanel}><SectionTitle link="详情">5月21日 周三</SectionTitle>{[['09:00','团队每日站会','30分钟'],['10:30','用户访谈','60分钟'],['12:30','午餐与休息','60分钟'],['14:00','与客户沟通','60分钟'],['16:00','撰写产品文档','90分钟'],['19:30','复盘与准备','60分钟']].map((e,i) => <View key={e[0]} style={styles.dayAgenda}><View style={[styles.dot,{backgroundColor:i===1?C.purple:i===4?C.amber:C.blue}]} /><Text style={styles.agendaTime}>{e[0]}</Text><View><Text style={styles.agendaTitle}>{e[1]}</Text><Text style={styles.mutedText}>{e[2]}</Text></View></View>)}<View style={styles.groupDivider}/><SectionTitle link="全部待办">近期待办</SectionTitle>{futureTasks.map((t,i)=><View key={t[0]} style={styles.sideTask}><View style={styles.checkbox}/><Text style={styles.sideTaskText}>{t[0]}</Text><Text style={labelStyle(i===2?'健康':i===1?'生活':'工作')}>{i===2?'健康':i===1?'生活':'工作'}</Text></View>)}<Pressable style={styles.addRow}><Plus size={18} color={C.blue}/><Text style={styles.addText}>新建待办</Text></Pressable></Card>
      </View>
    </ScrollView>
  );
}

function CalendarEvent({ event }: { event: typeof weekEvents[number] }) {
  const palette = event.color === 'green' ? [C.greenSoft,C.green] : event.color === 'amber' ? [C.amberSoft,C.amber] : event.color === 'purple' ? [C.purpleSoft,C.purple] : [C.blueSoft,C.blue];
  return <View style={[styles.calendarEvent,{ left: `${8.5 + event.day * 13.07}%`, top:event.top, height:event.h, backgroundColor:palette[0]}]}><Text style={[styles.calendarEventTime,{color:palette[1]}]}>{event.time}</Text><Text style={styles.calendarEventTitle}>{event.title}</Text><Text style={styles.calendarEventDuration}>60分钟</Text></View>;
}

function ReviewPage({ notify }: { notify: (s: string) => void }) {
  const [wins,setWins] = useState('');
  const [issues,setIssues] = useState('');
  const rate = useMemo(() => 78, []);
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <PageHeader title="回顾总结" subtitle="回顾过去，总结经验，持续进步。" onAction={() => notify('已打开快速记录')} />
      <View style={styles.reviewToolbar}><View style={styles.reviewTabs}><Filter label="日回顾" /><Filter active label="周回顾" /><Filter label="月回顾" /></View><View style={styles.toolbarLeft}><Filter label="‹" /><Filter label="5月13日 – 5月19日（第20周）" /><Filter label="›" /><Pressable style={styles.exportButton}><Download size={18} color={C.ink}/><Text style={styles.filterText}>导出回顾</Text></Pressable></View></View>
      <View style={styles.metricGrid}><MetricCard icon="✓" value="18" label="已完成任务" trend="较上周 +4 ↑" color={C.green}/><MetricCard icon="◷" value="5" label="未完成任务" trend="较上周 -2 ↓" color={C.amber}/><MetricCard icon="▤" value="12" label="随记条数" trend="较上周 +3 ↑" color={C.blue}/><Card style={styles.metricCard}><Donut value={rate} label="" size={94} color={C.purple}/><View><Text style={styles.metricLabel}>整体完成率</Text><Text style={[styles.metricTrend,{color:C.green}]}>较上周 +8% ↑</Text></View></Card></View>
      <View style={styles.reviewColumns}><View style={styles.reviewLeft}><ReviewInputCard color={C.green} title="本周完成了什么" subtitle="哪些事情进展顺利？有哪些值得肯定的成果？" placeholder="记录本周的收获与成就..." value={wins} onChange={setWins}/><ReviewInputCard color={C.amber} title="遇到的问题" subtitle="遇到了哪些困难？是什么原因造成的？" placeholder="记录问题、挑战及原因..." value={issues} onChange={setIssues}/><Card><Text style={styles.cardTitle}><Text style={{color:C.blue}}>●  </Text>下周最重要的三件事</Text><Text style={styles.mutedText}>明确优先级，聚焦最重要的事项。</Text>{[1,2,3].map(i=><View key={i} style={styles.priorityInput}><Text>{i}.</Text><TextInput style={styles.lineInput}/><View style={styles.tinyCheck}/><Text style={styles.mutedText}>重要</Text></View>)}</Card></View><View style={styles.reviewRight}><Card><Text style={styles.cardTitle}>完成率趋势</Text><LineChart /></Card><Card><Text style={styles.cardTitle}>本周任务完成分布</Text><View style={styles.distribution}><Donut value={56} display="18" label="总计" size={120} color={C.blue}/><View style={styles.distLegend}><Legend color={C.blue} label="工作" value="10（56%）"/><Legend color={C.green} label="生活" value="5（28%）"/><Legend color={C.amber} label="学习" value="2（11%）"/><Legend color="#FFB5B7" label="其他" value="1（5%）"/></View></View></Card><Card><Text style={styles.cardTitle}>本周高频标签</Text><View style={styles.tagCloud}><Text style={[styles.tag,styles.tagBlue]}>工作  28</Text><Text style={[styles.tag,styles.tagGreen]}>项目  14</Text><Text style={[styles.tag,styles.tagPurple]}>健康  9</Text><Text style={[styles.tag,styles.tagAmber]}>思考  7</Text><Text style={[styles.tag,styles.tagRed]}>学习  6</Text></View></Card></View></View>
      <Card style={styles.reviewFooter}><View><Text style={styles.cardTitle}>🌱  本周小结</Text><Text style={styles.mutedText}>感谢自己的持续努力，每一次回顾，都是为了走得更远。</Text></View><Pressable style={styles.primaryButton} onPress={()=>notify('回顾已保存')}><Text style={styles.primaryButtonText}>保存回顾</Text></Pressable></Card>
    </ScrollView>
  );
}

function MetricCard({icon,value,label,trend,color}:{icon:string;value:string;label:string;trend:string;color:string}) { return <Card style={styles.metricCard}><View style={[styles.metricIcon,{backgroundColor:`${color}18`}]}><Text style={[styles.metricIconText,{color}]}>{icon}</Text></View><View><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text><Text style={[styles.metricTrend,{color:trend.includes('-')?C.red:C.green}]}>{trend}</Text></View></Card>; }
function ReviewInputCard({color,title,subtitle,placeholder,value,onChange}:{color:string;title:string;subtitle:string;placeholder:string;value:string;onChange:(s:string)=>void}) { return <Card><Text style={styles.cardTitle}><Text style={{color}}>●  </Text>{title}</Text><Text style={styles.mutedText}>{subtitle}</Text><TextInput multiline value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={C.faint} style={styles.reviewInput}/><Text style={styles.counter}>{value.length}/1000</Text></Card>; }
function LineChart() { return <View style={styles.chart}><Svg width="100%" height="150" viewBox="0 0 500 150"><Line x1="35" y1="120" x2="485" y2="120" stroke={C.line}/><Line x1="35" y1="18" x2="35" y2="120" stroke={C.line}/><Polyline points="80,82 180,70 280,52 380,56 460,42" fill="none" stroke={C.blue} strokeWidth="2"/><Path d="M80 82 L180 70 L280 52 L380 56 L460 42" fill="none" stroke={C.blue}/>{[[80,82],[180,70],[280,52],[380,56],[460,42]].map((p,i)=><Circle key={i} cx={p[0]} cy={p[1]} r="4" fill={C.blue}/>)}</Svg><View style={styles.chartLabels}>{['第16周','第17周','第18周','第19周','第20周'].map(x=><Text key={x} style={styles.mutedText}>{x}</Text>)}</View></View>; }

const styles = StyleSheet.create({
  app:{flex:1,backgroundColor:C.canvas,flexDirection:'row',minHeight:'100%'},main:{flex:1,marginLeft:260},mainCompact:{marginLeft:0,paddingTop:74},page:{padding:32,gap:20,minWidth:0},
  sidebar:{position:'absolute',left:0,top:0,bottom:0,width:260,backgroundColor:C.white,borderRightColor:C.line,borderRightWidth:1,paddingHorizontal:20,paddingTop:42,paddingBottom:28,zIndex:5},brandRow:{flexDirection:'row',alignItems:'center',gap:15,paddingHorizontal:14},logo:{width:44,height:44,borderRadius:11,backgroundColor:C.blue,alignItems:'center',justifyContent:'center',boxShadow:'0 8px 18px rgba(47,115,246,.25)'},brand:{fontSize:27,fontWeight:'800',color:C.ink,letterSpacing:1},nav:{marginTop:38,gap:5},navItem:{height:48,borderRadius:9,flexDirection:'row',alignItems:'center',gap:18,paddingHorizontal:20,position:'relative'},navItemActive:{backgroundColor:C.blueSoft},activeRail:{position:'absolute',left:-10,width:3,height:24,borderRadius:3,backgroundColor:C.blue},navLabel:{fontSize:16,color:C.muted,fontWeight:'500'},navLabelActive:{color:C.blue,fontWeight:'700'},navDivider:{height:1,backgroundColor:C.line,marginVertical:12,marginHorizontal:10},localBadge:{marginTop:'auto',height:44,borderColor:C.line,borderWidth:1,borderRadius:10,flexDirection:'row',alignItems:'center',gap:10,paddingHorizontal:14},onlineDot:{width:9,height:9,borderRadius:9,backgroundColor:C.green},localText:{fontSize:13,color:C.muted},mobileNav:{position:'absolute',top:0,left:0,right:0,height:74,backgroundColor:C.white,zIndex:10,flexDirection:'row',alignItems:'center',paddingHorizontal:18,borderBottomWidth:1,borderBottomColor:C.line},mobileBrand:{fontSize:22,fontWeight:'800',color:C.ink},mobileLinks:{alignItems:'center',gap:4,paddingLeft:18},mobileLink:{paddingHorizontal:12,paddingVertical:8,borderRadius:8},mobileLinkActive:{backgroundColor:C.blueSoft},mobileLinkText:{color:C.muted,fontWeight:'600'},mobileLinkTextActive:{color:C.blue},
  pageHeader:{flexDirection:'row',alignItems:'flex-start',justifyContent:'space-between',minHeight:72,gap:16},pageTitle:{fontSize:32,lineHeight:40,fontWeight:'800',color:C.ink,letterSpacing:-.5},pageSubtitle:{marginTop:4,fontSize:15,color:C.muted},headerActions:{flexDirection:'row',gap:14},primaryButton:{height:48,backgroundColor:C.blue,borderRadius:10,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:9,paddingHorizontal:20,boxShadow:'0 7px 16px rgba(47,115,246,.24)'},primaryButtonText:{color:C.white,fontSize:15,fontWeight:'700'},iconButton:{width:48,height:48,borderRadius:10,backgroundColor:C.white,borderWidth:1,borderColor:C.line,alignItems:'center',justifyContent:'center',boxShadow:'0 5px 14px rgba(34,55,90,.08)'},card:{backgroundColor:C.white,borderWidth:1,borderColor:C.line,borderRadius:12,padding:20,boxShadow:'0 4px 14px rgba(34,55,90,.05)'},cardTitle:{fontSize:17,fontWeight:'700',color:C.ink},sectionHeader:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:13},sectionTitleRow:{flexDirection:'row',alignItems:'center',gap:11},sectionTitle:{fontSize:17,fontWeight:'700',color:C.ink},link:{fontSize:14,color:C.blue},
  progressCard:{minHeight:220,overflow:'hidden'},progressContent:{flexDirection:'row',alignItems:'center',gap:46,paddingLeft:28,paddingTop:6,flex:1},donutValue:{fontSize:29,fontWeight:'800',color:C.ink},donutLabel:{fontSize:14,marginTop:1},legend:{width:175,gap:18},legendRow:{flexDirection:'row',alignItems:'center',gap:11,minHeight:18},dot:{width:9,height:9,borderRadius:9},legendLabel:{fontSize:14,color:C.muted,flex:1},legendValue:{fontSize:14,color:C.ink},quoteDivider:{height:120,width:1,backgroundColor:C.line},quote:{minWidth:260},quoteMark:{fontSize:44,color:'#D7DEEB',height:34,fontWeight:'800'},quoteText:{fontSize:20,lineHeight:29,color:'#596A89'},mountains:{position:'absolute',right:-50,bottom:-50,width:380,height:130,opacity:.8},mountainBack:{position:'absolute',right:0,bottom:0,width:260,height:100,backgroundColor:'#EEF3FF',transform:[{rotate:'-18deg'}]},mountainFront:{position:'absolute',right:110,bottom:-20,width:220,height:100,backgroundColor:'#F4F7FE',transform:[{rotate:'18deg'}]},twoColumns:{flexDirection:'row',gap:18,alignItems:'stretch',flexWrap:'wrap'},columnCard:{flex:1,minWidth:400},taskRow:{minHeight:54,borderBottomWidth:1,borderBottomColor:C.line,flexDirection:'row',alignItems:'center',gap:13},checkbox:{width:21,height:21,borderRadius:5,borderWidth:1.5,borderColor:'#C8D3E5',alignItems:'center',justifyContent:'center'},checkboxChecked:{backgroundColor:C.blue,borderColor:C.blue},taskText:{fontSize:14.5,color:C.ink,flex:1},taskDone:{textDecorationLine:'line-through',color:C.muted},tag:{paddingHorizontal:10,paddingVertical:4,borderRadius:99,fontSize:12,overflow:'hidden'},tagBlue:{backgroundColor:C.blueSoft,color:C.blue},tagGreen:{backgroundColor:C.greenSoft,color:C.green},tagPurple:{backgroundColor:C.purpleSoft,color:C.purple},tagAmber:{backgroundColor:C.amberSoft,color:'#E39B18'},tagRed:{backgroundColor:C.redSoft,color:C.red},taskTime:{fontSize:13,color:'#8292B2',minWidth:72,textAlign:'right'},priority:{fontSize:12,borderRadius:99,paddingHorizontal:10,paddingVertical:4,overflow:'hidden',minWidth:57,textAlign:'center'},priorityHigh:{color:C.red,backgroundColor:C.redSoft},priorityMid:{color:'#EE9D0B',backgroundColor:C.amberSoft},priorityLow:{color:C.blue,backgroundColor:C.blueSoft},addRow:{height:42,flexDirection:'row',alignItems:'center',gap:10},addText:{fontSize:14.5,color:C.blue},timeline:{gap:12},eventRow:{flexDirection:'row',alignItems:'center',gap:14},timeDot:{width:62,flexDirection:'row',alignItems:'center',gap:8},eventTime:{fontSize:13},eventPill:{height:44,borderRadius:8,flex:1,flexDirection:'row',alignItems:'center',paddingHorizontal:16},eventTitle:{fontSize:14,color:C.ink,fontWeight:'600'},eventDuration:{marginLeft:20,fontSize:12,color:C.faint},noteStrip:{flexDirection:'row',gap:14,flexWrap:'wrap'},miniNote:{borderWidth:1,borderColor:C.line,borderRadius:9,padding:14,minHeight:130,flex:1,minWidth:260},miniTime:{flexDirection:'row',alignItems:'center',gap:9},miniTimeText:{fontSize:12,color:'#8393B3'},miniTitle:{fontSize:13,color:C.ink,fontWeight:'700',marginTop:12},miniBody:{fontSize:13,color:C.ink,lineHeight:20,marginTop:3},noteTag:{alignSelf:'flex-start',marginTop:12},noteActions:{flexDirection:'row',gap:12,marginTop:14},smallAction:{height:42,minWidth:90,borderRadius:9,borderWidth:1,borderColor:C.line,backgroundColor:C.white,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:10,paddingHorizontal:18},smallActionText:{fontSize:14,color:C.ink,fontWeight:'600'},
  todoLayout:{flexDirection:'row',gap:16,alignItems:'flex-start',flexWrap:'wrap'},todoMain:{flex:1,minWidth:620},todoSide:{width:290,gap:14},filterBar:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap',marginBottom:22},tabs:{flexDirection:'row',alignItems:'center',gap:5},filters:{flexDirection:'row',alignItems:'center',gap:8},filter:{height:37,borderRadius:8,paddingHorizontal:14,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:C.line,backgroundColor:C.white},filterActive:{backgroundColor:C.blueSoft,borderColor:'transparent'},filterText:{fontSize:13.5,color:C.ink},filterTextActive:{color:C.blue,fontWeight:'700'},search:{height:37,width:155,borderWidth:1,borderColor:C.line,borderRadius:8,flexDirection:'row',alignItems:'center',gap:8,paddingHorizontal:12},searchText:{fontSize:13.5,color:C.faint},moreButton:{height:37,width:37,borderWidth:1,borderColor:C.line,borderRadius:8,alignItems:'center',justifyContent:'center'},groupTitle:{fontSize:16,color:C.ink,fontWeight:'700',marginBottom:7},countBadge:{color:C.blue,backgroundColor:C.blueSoft,fontSize:12},groupDivider:{height:1,backgroundColor:C.line,marginVertical:18},mutedText:{color:C.muted,fontSize:12.5,lineHeight:19},overviewRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:10},smallLegend:{gap:8,width:110},distRows:{gap:10,marginTop:16},progressLabel:{flexDirection:'row',alignItems:'flex-end',justifyContent:'space-between',marginTop:18},bigMetric:{fontSize:30,fontWeight:'800',color:C.ink},bar:{height:9,borderRadius:9,backgroundColor:'#E7ECF5',overflow:'hidden',marginTop:12},barFill:{height:9,backgroundColor:C.blue,borderRadius:9},calendarHeading:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginVertical:14},calendarMonth:{fontSize:14,fontWeight:'700',color:C.ink},miniCalendarGrid:{flexDirection:'row',flexWrap:'wrap'},miniDay:{width:'14.285%',height:28,alignItems:'center',justifyContent:'center',borderRadius:20},miniDayActive:{backgroundColor:C.blue},miniDayText:{fontSize:12,color:C.ink},miniDayActiveText:{color:C.white,fontWeight:'700'},weekText:{color:C.muted},
  noteToolbar:{flexDirection:'row',alignItems:'center',gap:12,flexWrap:'wrap'},noteSearch:{flex:1,minWidth:300,height:52},notesFilter:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},viewToggle:{flexDirection:'row',alignItems:'center',gap:16},masonry:{flexDirection:'row',flexWrap:'wrap',gap:16,alignItems:'flex-start'},noteCard:{width:'31.9%',minWidth:300,minHeight:230},noteCardTop:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},noteType:{flexDirection:'row',alignItems:'center',gap:8},noteTypeText:{fontSize:13,color:C.muted,fontWeight:'600'},noteTitle:{fontSize:18,fontWeight:'700',color:C.ink,marginTop:20},noteBody:{fontSize:14.5,lineHeight:24,color:C.ink,marginTop:18},noteBottom:{marginTop:'auto',paddingTop:18,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},noteTagPill:{alignSelf:'flex-start',fontSize:12,color:C.purple,backgroundColor:C.purpleSoft,borderRadius:6,paddingHorizontal:9,paddingVertical:5,overflow:'hidden'},noteTagGreen:{color:C.green,backgroundColor:C.greenSoft},noteImage:{width:'100%',height:220,borderRadius:10,marginTop:16},audioBar:{height:52,borderRadius:12,backgroundColor:C.blueSoft,flexDirection:'row',alignItems:'center',gap:10,paddingHorizontal:12,marginTop:18},play:{width:31,height:31,borderRadius:31,backgroundColor:'#DCE8FF',alignItems:'center',justifyContent:'center'},playText:{fontSize:13,color:C.blue},wave:{flex:1,color:C.muted,letterSpacing:1},
  calendarToolbar:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:16,flexWrap:'wrap'},toolbarLeft:{flexDirection:'row',alignItems:'center',gap:10},calendarTitle:{fontSize:15,color:C.ink,fontWeight:'600'},segment:{height:39,flexDirection:'row',borderColor:C.line,borderWidth:1,borderRadius:9,overflow:'hidden'},segmentText:{width:66,textAlign:'center',paddingVertical:10,fontSize:13,color:C.ink},segmentActive:{backgroundColor:C.blueSoft,color:C.blue,fontWeight:'700'},calendarLayout:{flexDirection:'row',gap:14,alignItems:'flex-start'},weekCalendar:{flex:1,padding:0,overflow:'hidden',minWidth:700},weekHeader:{height:74,flexDirection:'row',borderBottomColor:C.line,borderBottomWidth:1},timeColumn:{width:'8.5%'},weekHeaderCell:{width:'13.07%',alignItems:'center',justifyContent:'center',borderLeftColor:C.line,borderLeftWidth:1},weekHeaderText:{fontSize:13,color:C.ink,textAlign:'center',lineHeight:22},selectedDateText:{color:C.blue,fontWeight:'800'},allDayRow:{height:45,borderBottomColor:C.line,borderBottomWidth:1,position:'relative'},timeLabel:{position:'absolute',left:15,top:13,fontSize:12,color:C.muted},allDayEvent:{position:'absolute',top:8,paddingHorizontal:8,paddingVertical:5,borderRadius:4,fontSize:11,color:C.green,backgroundColor:C.greenSoft,overflow:'hidden'},timeGrid:{height:720,position:'relative',overflow:'hidden'},hourLine:{position:'absolute',left:0,right:0,height:1,backgroundColor:C.line},hourText:{position:'absolute',left:13,top:5,fontSize:11,color:C.muted},calendarEvent:{position:'absolute',width:'12.2%',borderRadius:8,padding:9,zIndex:2},calendarEventTime:{fontSize:11,marginBottom:4},calendarEventTitle:{fontSize:12.5,color:C.ink,fontWeight:'600'},calendarEventDuration:{fontSize:10.5,color:C.muted,marginTop:4},nowLine:{position:'absolute',left:'8.5%',right:'13%',top:302,height:1.5,backgroundColor:C.red,zIndex:4},nowDot:{position:'absolute',left:-5,top:-4,width:9,height:9,borderRadius:9,backgroundColor:C.red},dayPanel:{width:305},dayAgenda:{minHeight:61,borderBottomColor:C.line,borderBottomWidth:1,flexDirection:'row',alignItems:'flex-start',gap:11,paddingTop:13},agendaTime:{fontSize:12,color:C.muted,width:45},agendaTitle:{fontSize:13.5,color:C.ink,fontWeight:'600',marginBottom:3},sideTask:{height:48,borderBottomColor:C.line,borderBottomWidth:1,flexDirection:'row',alignItems:'center',gap:10},sideTaskText:{fontSize:12.5,color:C.ink,flex:1},
  reviewToolbar:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:16,flexWrap:'wrap'},reviewTabs:{flexDirection:'row',borderWidth:1,borderColor:C.line,borderRadius:9,overflow:'hidden'},exportButton:{height:39,flexDirection:'row',alignItems:'center',gap:8,paddingHorizontal:16,borderWidth:1,borderColor:C.line,borderRadius:9,backgroundColor:C.white},metricGrid:{flexDirection:'row',gap:14,flexWrap:'wrap'},metricCard:{flex:1,minWidth:210,height:120,flexDirection:'row',alignItems:'center',gap:18},metricIcon:{width:56,height:56,borderRadius:56,alignItems:'center',justifyContent:'center'},metricIconText:{fontSize:28,fontWeight:'700'},metricValue:{fontSize:27,fontWeight:'800',color:C.ink},metricLabel:{fontSize:13.5,color:C.muted,marginTop:1},metricTrend:{fontSize:12.5,marginTop:3},reviewColumns:{flexDirection:'row',gap:16,alignItems:'flex-start',flexWrap:'wrap'},reviewLeft:{flex:1,gap:16,minWidth:430},reviewRight:{flex:1.08,gap:16,minWidth:430},reviewInput:{height:116,borderWidth:1,borderColor:'#DCE3EE',borderRadius:7,marginTop:13,padding:14,fontSize:13.5,color:C.ink,textAlignVertical:'top'},counter:{fontSize:11,color:C.muted,textAlign:'right',marginTop:-21,marginRight:11},priorityInput:{height:34,flexDirection:'row',alignItems:'center',gap:10,marginTop:5},lineInput:{height:31,borderWidth:1,borderColor:'#DCE3EE',borderRadius:5,flex:1,paddingHorizontal:8},tinyCheck:{width:15,height:15,borderWidth:1,borderColor:'#C8D3E5',borderRadius:3},chart:{marginTop:10},chartLabels:{flexDirection:'row',justifyContent:'space-around',paddingLeft:28},distribution:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:45},distLegend:{width:210,gap:8},tagCloud:{flexDirection:'row',gap:12,flexWrap:'wrap',marginTop:18},reviewFooter:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  toast:{position:'absolute',bottom:28,left:'50%',transform:[{translateX:-100}],width:200,height:44,borderRadius:22,backgroundColor:'rgba(23,32,51,.94)',alignItems:'center',justifyContent:'center',zIndex:20},toastText:{color:C.white,fontSize:13,fontWeight:'600'},
});
