import { Search, ShieldCheck, UserCheck, UserRound, UserX } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

import type { Profile, UserRole } from '../auth';
import { supabase } from '../lib/supabase';
import { colors, shadow } from '../theme';

export function AdminWorkspace({ currentUserId }: { currentUserId: string }) {
  const { width } = useWindowDimensions();
  const compact = width < 760;
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const load = async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) setMessage(error.message);
    else setProfiles((data as Profile[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return profiles.filter((profile) => !needle || `${profile.display_name} ${profile.email}`.toLowerCase().includes(needle));
  }, [profiles, query]);

  const updateProfile = async (id: string, patch: { role?: UserRole; disabled?: boolean }) => {
    if (!supabase || id === currentUserId && patch.disabled) return;
    setMessage('');
    const { error } = await supabase.from('profiles').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) setMessage(error.message);
    else setProfiles((items) => items.map((item) => item.id === id ? { ...item, ...patch } : item));
  };

  const activeCount = profiles.filter((item) => !item.disabled).length;
  const adminCount = profiles.filter((item) => item.role === 'admin').length;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={[styles.page, compact && styles.pageCompact]} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, compact && styles.headerCompact]}>
        <View>
          <Text style={styles.eyebrow}>系统控制台</Text>
          <Text style={styles.title}>用户与权限</Text>
          <Text style={styles.subtitle}>管理账号状态和管理员权限。用户的日程与财务内容保持私有。</Text>
        </View>
        <View style={styles.adminBadge}><ShieldCheck color={colors.green700} size={17} /><Text style={styles.adminBadgeText}>管理员视图</Text></View>
      </View>

      <View style={styles.metrics}>
        <Metric icon={UserRound} label="全部用户" value={profiles.length} />
        <Metric icon={UserCheck} label="正常使用" value={activeCount} />
        <Metric icon={ShieldCheck} label="管理员" value={adminCount} />
        <Metric icon={UserX} label="已暂停" value={profiles.length - activeCount} />
      </View>

      <View style={styles.panel}>
        <View style={[styles.toolbar, compact && styles.toolbarCompact]}>
          <View><Text style={styles.panelTitle}>账号列表</Text><Text style={styles.panelSubtitle}>首位注册用户自动成为管理员</Text></View>
          <View style={styles.search}><Search color={colors.textSoft} size={17} /><TextInput value={query} onChangeText={setQuery} placeholder="搜索姓名或邮箱" placeholderTextColor={colors.textSoft} style={styles.searchInput} /></View>
        </View>
        {message ? <Text style={styles.message}>{message}</Text> : null}
        {loading ? <ActivityIndicator color={colors.green700} style={styles.loader} /> : filtered.map((profile) => (
          <View key={profile.id} style={[styles.userRow, compact && styles.userRowCompact]}>
            <View style={styles.userIdentity}>
              <View style={[styles.userAvatar, profile.disabled && styles.userAvatarDisabled]}><Text style={styles.userAvatarText}>{(profile.display_name || profile.email).slice(0, 1).toUpperCase()}</Text></View>
              <View style={styles.userCopy}><Text style={styles.userName}>{profile.display_name || '未命名用户'}{profile.id === currentUserId ? '（你）' : ''}</Text><Text style={styles.userEmail}>{profile.email}</Text></View>
            </View>
            <Text style={styles.joined}>加入于 {new Date(profile.created_at).toLocaleDateString('zh-CN')}</Text>
            <View style={styles.actions}>
              <Pressable
                disabled={profile.id === currentUserId}
                style={[styles.roleButton, profile.role === 'admin' && styles.roleButtonActive, profile.id === currentUserId && styles.actionDisabled]}
                onPress={() => void updateProfile(profile.id, { role: profile.role === 'admin' ? 'user' : 'admin' })}
              >
                <Text style={[styles.roleText, profile.role === 'admin' && styles.roleTextActive]}>{profile.role === 'admin' ? '管理员' : '设为管理员'}</Text>
              </Pressable>
              <Pressable
                disabled={profile.id === currentUserId}
                style={[styles.statusButton, profile.disabled && styles.resumeButton, profile.id === currentUserId && styles.actionDisabled]}
                onPress={() => void updateProfile(profile.id, { disabled: !profile.disabled })}
              >
                <Text style={[styles.statusText, profile.disabled && styles.resumeText]}>{profile.disabled ? '恢复' : '暂停'}</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof UserRound; label: string; value: number }) {
  return <View style={styles.metric}><View style={styles.metricIcon}><Icon color={colors.green700} size={19} /></View><View><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View></View>;
}

const styles = StyleSheet.create({
  scroll: { backgroundColor: colors.background, flex: 1 },
  page: { alignSelf: 'center', gap: 18, maxWidth: 1340, padding: 34, paddingBottom: 80, width: '100%' },
  pageCompact: { padding: 18, paddingBottom: 110 },
  header: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between' },
  headerCompact: { alignItems: 'flex-start', flexDirection: 'column', gap: 14 },
  eyebrow: { color: colors.green700, fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },
  title: { color: colors.text, fontFamily: 'serif', fontSize: 30, fontWeight: '700', marginTop: 7 },
  subtitle: { color: colors.textMuted, fontSize: 11, marginTop: 8 },
  adminBadge: { alignItems: 'center', backgroundColor: colors.softGreen, borderRadius: 10, flexDirection: 'row', gap: 8, paddingHorizontal: 13, paddingVertical: 10 },
  adminBadgeText: { color: colors.green800, fontSize: 10, fontWeight: '800' },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metric: { ...shadow.soft, alignItems: 'center', backgroundColor: colors.card, borderColor: colors.line, borderRadius: 14, borderWidth: 1, flex: 1, flexDirection: 'row', gap: 12, minWidth: 170, padding: 17 },
  metricIcon: { alignItems: 'center', backgroundColor: colors.softGreen, borderRadius: 11, height: 40, justifyContent: 'center', width: 40 },
  metricValue: { color: colors.text, fontSize: 20, fontWeight: '800' },
  metricLabel: { color: colors.textSoft, fontSize: 9, marginTop: 3 },
  panel: { ...shadow.soft, backgroundColor: colors.card, borderColor: colors.line, borderRadius: 16, borderWidth: 1, padding: 20 },
  toolbar: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  toolbarCompact: { alignItems: 'stretch', flexDirection: 'column', gap: 14 },
  panelTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  panelSubtitle: { color: colors.textSoft, fontSize: 9, marginTop: 4 },
  search: { alignItems: 'center', backgroundColor: '#FBFBF9', borderColor: colors.line, borderRadius: 9, borderWidth: 1, flexDirection: 'row', gap: 8, minHeight: 40, paddingHorizontal: 12, width: 250 },
  searchInput: { color: colors.text, flex: 1, fontSize: 11, outlineStyle: 'none' } as never,
  message: { color: colors.red, fontSize: 10, marginVertical: 10 },
  loader: { marginVertical: 50 },
  userRow: { alignItems: 'center', borderTopColor: colors.line, borderTopWidth: 1, flexDirection: 'row', gap: 20, minHeight: 78, paddingVertical: 10 },
  userRowCompact: { alignItems: 'flex-start', flexDirection: 'column', gap: 10 },
  userIdentity: { alignItems: 'center', flex: 1.2, flexDirection: 'row', gap: 11, minWidth: 220 },
  userAvatar: { alignItems: 'center', backgroundColor: colors.softGreen, borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  userAvatarDisabled: { opacity: 0.45 },
  userAvatarText: { color: colors.green800, fontSize: 13, fontWeight: '800' },
  userCopy: { flex: 1 },
  userName: { color: colors.text, fontSize: 12, fontWeight: '800' },
  userEmail: { color: colors.textSoft, fontSize: 9, marginTop: 4 },
  joined: { color: colors.textSoft, flex: 0.7, fontSize: 9 },
  actions: { flexDirection: 'row', gap: 8 },
  roleButton: { borderColor: colors.line, borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  roleButtonActive: { backgroundColor: colors.softGreen, borderColor: colors.green200 },
  roleText: { color: colors.textMuted, fontSize: 9, fontWeight: '700' },
  roleTextActive: { color: colors.green800 },
  statusButton: { backgroundColor: colors.redSoft, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  resumeButton: { backgroundColor: colors.softGreen },
  statusText: { color: colors.red, fontSize: 9, fontWeight: '800' },
  resumeText: { color: colors.green800 },
  actionDisabled: { opacity: 0.35 },
});
