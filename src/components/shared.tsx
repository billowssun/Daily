import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadow } from '../theme';

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <View style={[styles.card, styles.empty]}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
  );
}

export const sharedStyles = StyleSheet.create({
  page: {
    gap: 14,
    paddingBottom: 126,
    paddingHorizontal: 20,
    paddingTop: 42,
  },
  pageDesktop: {
    gap: 18,
    paddingBottom: 48,
    paddingHorizontal: 32,
    paddingTop: 36,
  },
  pageHeader: {
    gap: 6,
  },
  eyebrow: {
    color: colors.green700,
    fontSize: 13,
    fontWeight: '800',
  },
  title: {
    color: colors.green800,
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    ...shadow.soft,
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderRadius: radius.card,
    borderWidth: 1,
    padding: 16,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.green600,
    borderRadius: 18,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: 14,
  },
  buttonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  ghostButton: {
    alignItems: 'center',
    backgroundColor: colors.softGreen,
    borderColor: colors.cardBorder,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 12,
  },
  ghostText: {
    color: colors.green700,
    fontSize: 13,
    fontWeight: '800',
  },
  dangerText: {
    color: '#B85C5C',
    fontSize: 13,
    fontWeight: '800',
  },
});

const styles = StyleSheet.create({
  card: sharedStyles.card,
  empty: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 34,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  emptyBody: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
});
