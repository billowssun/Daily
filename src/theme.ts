import { Platform } from 'react-native';

export const colors = {
  background: '#F7F8F1',
  card: '#FFFFFB',
  cardBorder: '#ECEFE4',
  white: '#FFFFFF',
  text: '#1F2923',
  textMuted: '#6F7971',
  textSoft: '#9AA39B',
  green800: '#2F503A',
  green700: '#416E4C',
  green600: '#5F9569',
  sage500: '#91B78D',
  sage300: '#C8D9C4',
  softGreen: '#F2F6EC',
  line: '#E7EBE1',
  lineDark: '#B9C2B8',
  cyan600: '#69A9CF',
  violet500: '#8A82C7',
  gold500: '#D9B66E',
  clay200: '#E8D5C3',
  clay300: '#D6B99D',
  avatarBg: '#F6EFE7',
  toast: 'rgba(238, 245, 231, 0.96)',
  backdrop: 'rgba(30, 42, 34, 0.22)',
};

export const radius = {
  card: 8,
  control: 8,
};

export const shadow = {
  soft: Platform.select({
    ios: {
      shadowColor: '#496052',
      shadowOpacity: 0.08,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
    },
    android: {
      elevation: 3,
    },
    default: {},
  }),
  float: Platform.select({
    ios: {
      shadowColor: '#416E4C',
      shadowOpacity: 0.24,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
    },
    android: {
      elevation: 8,
    },
    default: {},
  }),
  tab: Platform.select({
    ios: {
      shadowColor: '#1B2A20',
      shadowOpacity: 0.1,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: -8 },
    },
    android: {
      elevation: 12,
    },
    default: {},
  }),
};
