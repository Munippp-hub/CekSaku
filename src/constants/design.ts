import { Platform, type TextStyle, type ViewStyle } from 'react-native';

/**
 * Design tokens for CekSaku | Montrack.
 * Baseline values come from PRD section 24.2 (Design Token Awal).
 */
export const Palette = {
  primary: '#1684C7',
  primaryPressed: '#1272AE',
  deep: '#0869AA',
  onboarding: '#0B76BB',
  onboardingDeep: '#075C93',
  lightBlue: '#E9F6FD',
  surface: '#FFFFFF',
  page: '#F5F7F9',
  textPrimary: '#173042',
  textSecondary: '#6E7D87',
  border: '#E5EAEE',
  success: '#4DB26A',
  successSoft: '#EAF7EE',
  warning: '#EF6A4A',
  warningSoft: '#FFF0EC',
  navInactive: '#A9B8C2',
  white: '#FFFFFF',
  overlay: 'rgba(11, 42, 61, 0.45)',
} as const;

export const Radius = {
  input: 13,
  card: 18,
  large: 22,
  pill: 999,
  sm: 10,
} as const;

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const Typography = {
  display: { fontSize: 26, lineHeight: 32, fontWeight: '700' },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  heading: { fontSize: 16, lineHeight: 22, fontWeight: '600' },
  subheading: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  body: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  bodyStrong: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  small: { fontSize: 12, lineHeight: 17, fontWeight: '400' },
  caption: { fontSize: 11, lineHeight: 15, fontWeight: '500' },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
  button: { fontSize: 14, lineHeight: 18, fontWeight: '600' },
  amount: { fontSize: 30, lineHeight: 36, fontWeight: '700' },
  amountSmall: { fontSize: 15, lineHeight: 20, fontWeight: '700' },
} satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof Typography;

const softShadow = Platform.select<ViewStyle>({
  web: { boxShadow: '0px 6px 18px rgba(23, 48, 66, 0.06)' },
  default: {
    shadowColor: '#173042',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});

const floatingShadow = Platform.select<ViewStyle>({
  web: { boxShadow: '0px 10px 26px rgba(23, 48, 66, 0.1)' },
  default: {
    shadowColor: '#173042',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
});

export const Shadows = {
  card: softShadow,
  floating: floatingShadow,
} as const;

export const Layout = {
  pagePadding: 20,
  maxContentWidth: 520,
  navHeight: 68,
  buttonHeight: 48,
} as const;

export const WeekDayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
export type WeekDayKey = (typeof WeekDayKeys)[number];

export const AvatarColors = ['#1684C7', '#4DB26A', '#EF6A4A', '#9B51E0', '#0869AA'] as const;

export const CategoryColors = [
  '#F2994A',
  '#2D9CDB',
  '#BB6BD9',
  '#EB5757',
  '#27AE60',
  '#2F80ED',
  '#F2C94C',
  '#56CCF2',
  '#828282',
  '#4DB26A',
] as const;
