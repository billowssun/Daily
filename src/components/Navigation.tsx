import { LogOut, PenLine, Search, ShieldCheck } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, shadow } from '../theme';
import type { TabKey } from '../types';

type NavigationProps = {
  activeTab: TabKey;
  layout: 'tabs' | 'sidebar';
  onChange: (tab: TabKey) => void;
  onCenterPress: () => void;
  isAdmin: boolean;
  profileName: string;
  onSignOut: () => void;
};

const primaryTabs: { key: TabKey; label: string }[] = [
  { key: 'home', label: '今天' },
  { key: 'todo', label: '计划' },
  { key: 'calendar', label: '日历' },
  { key: 'finance', label: '财务' },
  { key: 'overview', label: '回顾' },
];

export function Navigation({ activeTab, isAdmin, layout, onChange, onCenterPress, onSignOut, profileName }: NavigationProps) {
  if (layout === 'sidebar') {
    return (
      <View style={styles.header}>
        <Pressable accessibilityRole="button" style={styles.brand} onPress={() => onChange('home')}>
          <Text style={styles.brandName}>日序</Text>
          <Text style={styles.brandTagline}>顺其自然，日有所序</Text>
        </Pressable>

        <View accessibilityRole="tablist" style={styles.desktopTabs}>
          {primaryTabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                style={styles.desktopTab}
                onPress={() => onChange(tab.key)}
              >
                <Text style={[styles.desktopLabel, active && styles.desktopLabelActive]}>{tab.label}</Text>
                {active ? <View style={styles.activeLine} /> : null}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.headerActions}>
          <Pressable accessibilityLabel="搜索" accessibilityRole="button" style={styles.iconButton}>
            <Search color={colors.text} size={21} strokeWidth={1.7} />
          </Pressable>
          <Pressable accessibilityRole="button" style={({ pressed }) => [styles.recordButton, pressed && styles.pressed]} onPress={onCenterPress}>
            <PenLine color={colors.white} size={17} strokeWidth={1.8} />
            <Text style={styles.recordText}>快速记录</Text>
            <Text style={styles.shortcut}>⌘ K</Text>
          </Pressable>
          {isAdmin ? (
            <Pressable accessibilityLabel="用户管理" style={styles.adminButton} onPress={() => onChange('admin')}>
              <ShieldCheck color={activeTab === 'admin' ? colors.green700 : colors.textMuted} size={18} />
            </Pressable>
          ) : null}
          <View style={styles.account}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{profileName.slice(0, 1).toUpperCase()}</Text></View>
            <Text numberOfLines={1} style={styles.profileName}>{profileName}</Text>
          </View>
          <Pressable accessibilityLabel="退出登录" style={styles.signOut} onPress={onSignOut}>
            <LogOut color={colors.textSoft} size={17} />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mobileBar}>
      {primaryTabs.map((tab) => {
        const active = activeTab === tab.key;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={styles.mobileTab}
            onPress={() => onChange(tab.key)}
          >
            <Text style={[styles.mobileLabel, active && styles.mobileLabelActive]}>{tab.label}</Text>
            {active ? <View style={styles.mobileDot} /> : null}
          </Pressable>
        );
      })}
      <Pressable accessibilityLabel="快速记录" accessibilityRole="button" style={styles.mobileRecord} onPress={onCenterPress}>
        <PenLine color={colors.white} size={20} />
      </Pressable>
      {isAdmin ? (
        <Pressable accessibilityLabel="用户管理" style={styles.mobileAdmin} onPress={() => onChange('admin')}>
          <ShieldCheck color={colors.green700} size={18} />
        </Pressable>
      ) : null}
      <Pressable accessibilityLabel="退出登录" style={styles.mobileSignOut} onPress={onSignOut}>
        <LogOut color={colors.textMuted} size={17} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
    height: 72,
    justifyContent: 'space-between',
    paddingHorizontal: 34,
    width: '100%',
  },
  brand: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: 16,
    minWidth: 270,
  },
  brandName: {
    color: '#18342F',
    fontFamily: 'serif',
    fontSize: 27,
    fontWeight: '700',
    letterSpacing: 1,
  },
  brandTagline: {
    color: colors.textSoft,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  desktopTabs: {
    alignItems: 'stretch',
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: 34,
  },
  desktopTab: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    position: 'relative',
  },
  desktopLabel: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '500',
  },
  desktopLabelActive: {
    color: colors.text,
    fontWeight: '700',
  },
  activeLine: {
    backgroundColor: colors.green700,
    borderRadius: 2,
    bottom: 0,
    height: 3,
    position: 'absolute',
    width: 34,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'flex-end',
    minWidth: 270,
  },
  iconButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  recordButton: {
    ...shadow.float,
    alignItems: 'center',
    backgroundColor: colors.green700,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 9,
    height: 42,
    paddingHorizontal: 16,
  },
  recordText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  shortcut: {
    color: '#CDE0DC',
    fontSize: 10,
    marginLeft: 4,
  },
  adminButton: { alignItems: 'center', height: 38, justifyContent: 'center', width: 34 },
  account: { alignItems: 'center', flexDirection: 'row', gap: 8, maxWidth: 130 },
  avatar: { alignItems: 'center', backgroundColor: colors.softGreen, borderRadius: 18, height: 36, justifyContent: 'center', width: 36 },
  avatarText: { color: colors.green800, fontSize: 13, fontWeight: '800' },
  profileName: { color: colors.text, flexShrink: 1, fontSize: 11, fontWeight: '700' },
  signOut: { alignItems: 'center', height: 36, justifyContent: 'center', width: 28 },
  pressed: { opacity: 0.82 },
  mobileBar: {
    ...shadow.soft,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    height: 76,
    left: 0,
    paddingBottom: 10,
    paddingHorizontal: 8,
    position: 'absolute',
    right: 0,
    zIndex: 20,
  },
  mobileTab: {
    alignItems: 'center',
    flex: 1,
    gap: 7,
    justifyContent: 'center',
    minHeight: 54,
  },
  mobileLabel: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '600',
  },
  mobileLabelActive: {
    color: colors.green800,
  },
  mobileDot: {
    backgroundColor: colors.green700,
    borderRadius: 2,
    height: 3,
    width: 18,
  },
  mobileRecord: {
    ...shadow.float,
    alignItems: 'center',
    backgroundColor: colors.green700,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    position: 'absolute',
    right: 18,
    top: -58,
    width: 48,
  },
  mobileAdmin: { alignItems: 'center', backgroundColor: colors.softGreen, borderRadius: 18, height: 36, justifyContent: 'center', position: 'absolute', right: 18, top: 8, width: 36 },
  mobileSignOut: { alignItems: 'center', backgroundColor: colors.card, borderColor: colors.line, borderRadius: 18, borderWidth: 1, height: 36, justifyContent: 'center', left: 18, position: 'absolute', top: -58, width: 36 },
});
