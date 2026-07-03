import { PenLine } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { tabs } from '../data/mock';
import { colors, shadow } from '../theme';
import type { TabKey } from '../types';

type NavigationProps = {
  activeTab: TabKey;
  layout: 'tabs' | 'sidebar';
  onChange: (tab: TabKey) => void;
  onCenterPress: () => void;
};

export function Navigation({ activeTab, layout, onChange, onCenterPress }: NavigationProps) {
  if (layout === 'sidebar') {
    return (
      <View style={styles.sidebar}>
        <Text style={styles.sidebarBrand}>日序</Text>
        <Text style={styles.sidebarCaption}>随记 → 待办 → 日历</Text>
        <View style={styles.sidebarItems}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;

            return (
              <Pressable
                key={tab.key}
                style={[styles.sidebarItem, active && styles.sidebarItemActive]}
                onPress={() => onChange(tab.key)}
              >
                <Icon size={20} color={active ? colors.white : colors.green700} />
                <Text style={[styles.sidebarLabel, active && styles.sidebarLabelActive]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable style={styles.sidebarCreate} onPress={onCenterPress}>
          <PenLine size={20} color={colors.white} />
          <Text style={styles.sidebarCreateText}>快速记录</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.key;

        return (
          <Pressable key={tab.key} style={styles.tabItem} onPress={() => onChange(tab.key)}>
            <Icon size={22} color={active ? colors.green700 : colors.textSoft} />
            <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    paddingHorizontal: 24,
    paddingVertical: 36,
    width: 230,
  },
  sidebarBrand: {
    color: colors.green800,
    fontSize: 34,
    fontWeight: '800',
  },
  sidebarCaption: {
    color: colors.textSoft,
    fontSize: 13,
    marginTop: 4,
  },
  sidebarItems: {
    gap: 8,
    marginTop: 34,
  },
  sidebarItem: {
    alignItems: 'center',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 16,
  },
  sidebarItemActive: {
    backgroundColor: colors.green600,
  },
  sidebarLabel: {
    color: colors.green800,
    fontSize: 15,
    fontWeight: '700',
  },
  sidebarLabelActive: {
    color: colors.white,
  },
  sidebarCreate: {
    ...shadow.float,
    alignItems: 'center',
    backgroundColor: colors.green700,
    borderRadius: 22,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    marginTop: 'auto',
    minHeight: 52,
  },
  sidebarCreateText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  tabBar: {
    ...shadow.tab,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    bottom: 0,
    flexDirection: 'row',
    height: 88,
    justifyContent: 'space-around',
    left: 0,
    paddingBottom: 18,
    paddingHorizontal: 10,
    position: 'absolute',
    right: 0,
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
    gap: 5,
  },
  tabLabel: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: colors.green700,
  },
});
