import { Platform } from 'react-native';

export const colors = {
  background: '#F7F5F0',
  surface: '#FCFBF8',
  card: '#FFFFFF',
  cardBorder: '#E3E4DF',
  white: '#FFFFFF',
  text: '#202825',
  textMuted: '#68716E',
  textSoft: '#9AA19F',
  green900: '#174B45',
  green800: '#245B54',
  green700: '#2F766E',
  green600: '#3B8A80',
  green200: '#CFE0DC',
  sage500: '#789C91',
  sage300: '#CFE0DC',
  gold500: '#D8992F',
  cyan600: '#4A7C91',
  violet500: '#8075A6',
  clay200: '#E9DDD0',
  clay300: '#CBB49E',
  avatarBg: '#F5F1E8',
  softGreen: '#EAF2F0',
  softBlue: '#EAF2F2',
  line: '#E3E4DF',
  lineDark: '#CBD0CC',
  red: '#E6524A',
  redSoft: '#FFF0EE',
  amber: '#D8992F',
  amberSoft: '#FFF6E5',
  blue: '#4A7C91',
  violet: '#8075A6',
  toast: 'rgba(28, 75, 69, 0.96)',
  backdrop: 'rgba(25, 35, 32, 0.25)',
};

export const radius = {
  small: 8,
  control: 10,
  card: 14,
  panel: 18,
};

export const shadow = {
  soft: Platform.select({
    ios: {
      shadowColor: '#203A35',
      shadowOpacity: 0.07,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 8 },
    },
    android: { elevation: 2 },
    default: { boxShadow: '0 10px 30px rgba(31, 49, 44, 0.06)' } as never,
  }),
  float: Platform.select({
    ios: {
      shadowColor: '#174B45',
      shadowOpacity: 0.18,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
    },
    android: { elevation: 7 },
    default: { boxShadow: '0 12px 28px rgba(23, 75, 69, 0.18)' } as never,
  }),
  tab: Platform.select({
    ios: {
      shadowColor: '#203A35',
      shadowOpacity: 0.08,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: -7 },
    },
    android: { elevation: 6 },
    default: { boxShadow: '0 -8px 24px rgba(31, 49, 44, 0.06)' } as never,
  }),
};
