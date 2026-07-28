import type { Session, User } from '@supabase/supabase-js';
import { LockKeyhole, Mail, ShieldCheck, UserRound } from 'lucide-react-native';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { isSupabaseConfigured, supabase } from './lib/supabase';
import { colors, shadow } from './theme';

export type UserRole = 'admin' | 'user';

export type Profile = {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  disabled: boolean;
  created_at: string;
  updated_at: string;
};

type AuthContextValue = {
  loading: boolean;
  profile: Profile | null;
  session: Session | null;
  user: User | null;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!supabase) return;
    const { data: auth } = await supabase.auth.getSession();
    const nextSession = auth.session;
    setSession(nextSession);
    if (!nextSession?.user) {
      setProfile(null);
      return;
    }
    const { data } = await supabase.from('profiles').select('*').eq('id', nextSession.user.id).single();
    setProfile((data as Profile | null) ?? null);
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    void refreshProfile().finally(() => setLoading(false));
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) setProfile(null);
      else setTimeout(() => void refreshProfile(), 0);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      profile,
      session,
      user: session?.user ?? null,
      refreshProfile,
      signOut: async () => {
        await supabase?.auth.signOut();
        setProfile(null);
      },
    }),
    [loading, profile, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { loading, profile, session, signOut } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isSupabaseConfigured) return <SetupScreen />;
  if (!session) return <AuthScreen />;
  if (!profile) return <LoadingScreen label="正在准备你的个人空间…" />;
  if (profile.disabled) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.authCard}>
          <View style={styles.brandMark}><LockKeyhole color={colors.green700} size={24} /></View>
          <Text style={styles.title}>账号已暂停</Text>
          <Text style={styles.subtitle}>管理员已暂停此账号。你的数据仍安全保留，请联系管理员恢复使用。</Text>
          <Pressable style={styles.secondaryButton} onPress={() => void signOut()}>
            <Text style={styles.secondaryButtonText}>退出账号</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }
  return <>{children}</>;
}

function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const submit = async () => {
    if (!supabase || !email.trim() || password.length < 6) {
      setMessage('请输入有效邮箱，密码至少 6 位。');
      return;
    }
    setBusy(true);
    setMessage('');
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) setMessage(error.message === 'Invalid login credentials' ? '邮箱或密码不正确。' : error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { display_name: displayName.trim() || email.split('@')[0] } },
      });
      if (error) setMessage(error.message);
      else if (!data.session) setMessage('注册成功，请查收验证邮件后登录。');
    }
    setBusy(false);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.authLayout}>
        <View style={styles.intro}>
          <Text style={styles.wordmark}>日序</Text>
          <Text style={styles.introTitle}>把日常与财务，{'\n'}安放在同一个秩序里。</Text>
          <Text style={styles.introCopy}>每个账号拥有独立加密会话和专属云端数据。换设备登录，日程、随记、账户余额会自动同步。</Text>
          <View style={styles.trustRow}>
            <ShieldCheck color="#CFE2DD" size={18} />
            <Text style={styles.trustText}>Supabase PostgreSQL · 行级权限隔离</Text>
          </View>
        </View>

        <View style={styles.authCard}>
          <Text style={styles.kicker}>{mode === 'login' ? '欢迎回来' : '创建个人空间'}</Text>
          <Text style={styles.title}>{mode === 'login' ? '登录日序' : '注册日序'}</Text>
          <Text style={styles.subtitle}>{mode === 'login' ? '继续整理今天，也照看长期的生活。' : '首位注册用户将成为系统管理员。'}</Text>
          {mode === 'signup' ? (
            <AuthField icon={UserRound} placeholder="你的称呼" value={displayName} onChangeText={setDisplayName} />
          ) : null}
          <AuthField icon={Mail} placeholder="邮箱地址" value={email} onChangeText={setEmail} />
          <AuthField icon={LockKeyhole} placeholder="密码（至少 6 位）" value={password} onChangeText={setPassword} secure />
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <Pressable disabled={busy} style={[styles.primaryButton, busy && styles.disabled]} onPress={() => void submit()}>
            {busy ? <ActivityIndicator color={colors.white} /> : <Text style={styles.primaryButtonText}>{mode === 'login' ? '登录' : '创建账号'}</Text>}
          </Pressable>
          <Pressable style={styles.switchButton} onPress={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(''); }}>
            <Text style={styles.switchText}>{mode === 'login' ? '还没有账号？创建一个' : '已有账号？返回登录'}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function AuthField({ icon: Icon, secure, ...props }: {
  icon: typeof Mail;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  secure?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Icon color={colors.textSoft} size={18} />
      <TextInput
        {...props}
        autoCapitalize="none"
        secureTextEntry={secure}
        style={styles.input}
        placeholderTextColor={colors.textSoft}
      />
    </View>
  );
}

function LoadingScreen({ label = '正在载入日序…' }: { label?: string }) {
  return <SafeAreaView style={styles.screen}><ActivityIndicator color={colors.green700} /><Text style={styles.loading}>{label}</Text></SafeAreaView>;
}

function SetupScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.authCard}>
        <Text style={styles.kicker}>需要连接数据库</Text>
        <Text style={styles.title}>日序云端尚未配置</Text>
        <Text style={styles.subtitle}>请配置 EXPO_PUBLIC_SUPABASE_URL 和 EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY 后重新构建。</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { alignItems: 'center', backgroundColor: colors.background, flex: 1, justifyContent: 'center', padding: 24 },
  authLayout: { alignItems: 'stretch', flexDirection: 'row', flexWrap: 'wrap', gap: 38, justifyContent: 'center', maxWidth: 1040, width: '100%' },
  intro: { backgroundColor: colors.green800, borderRadius: 24, flex: 1.05, justifyContent: 'center', maxWidth: 520, minWidth: 300, padding: 42 },
  wordmark: { color: '#DCEBE7', fontFamily: 'serif', fontSize: 21, fontWeight: '700', letterSpacing: 3 },
  introTitle: { color: colors.white, fontFamily: 'serif', fontSize: 38, fontWeight: '700', lineHeight: 54, marginTop: 38 },
  introCopy: { color: '#BFD5CF', fontSize: 14, lineHeight: 26, marginTop: 24, maxWidth: 390 },
  trustRow: { alignItems: 'center', flexDirection: 'row', gap: 9, marginTop: 42 },
  trustText: { color: '#CFE2DD', fontSize: 11 },
  authCard: { ...shadow.float, alignSelf: 'center', backgroundColor: colors.card, borderColor: colors.line, borderRadius: 20, borderWidth: 1, maxWidth: 430, padding: 38, width: '100%' },
  brandMark: { alignItems: 'center', backgroundColor: colors.softGreen, borderRadius: 14, height: 52, justifyContent: 'center', marginBottom: 22, width: 52 },
  kicker: { color: colors.green700, fontSize: 11, fontWeight: '800', letterSpacing: 1.4 },
  title: { color: colors.text, fontFamily: 'serif', fontSize: 28, fontWeight: '700', marginTop: 9 },
  subtitle: { color: colors.textMuted, fontSize: 12, lineHeight: 21, marginBottom: 26, marginTop: 10 },
  field: { alignItems: 'center', backgroundColor: '#FBFBF9', borderColor: colors.line, borderRadius: 10, borderWidth: 1, flexDirection: 'row', gap: 10, marginBottom: 12, minHeight: 48, paddingHorizontal: 14 },
  input: { color: colors.text, flex: 1, fontSize: 13, outlineStyle: 'none' } as never,
  message: { color: colors.red, fontSize: 11, lineHeight: 18, marginBottom: 10 },
  primaryButton: { alignItems: 'center', backgroundColor: colors.green700, borderRadius: 10, justifyContent: 'center', marginTop: 5, minHeight: 48 },
  primaryButtonText: { color: colors.white, fontSize: 13, fontWeight: '800' },
  disabled: { opacity: 0.65 },
  switchButton: { alignItems: 'center', marginTop: 20 },
  switchText: { color: colors.green700, fontSize: 11, fontWeight: '700' },
  secondaryButton: { alignItems: 'center', borderColor: colors.line, borderRadius: 10, borderWidth: 1, justifyContent: 'center', minHeight: 44 },
  secondaryButtonText: { color: colors.text, fontSize: 12, fontWeight: '700' },
  loading: { color: colors.textMuted, fontSize: 12, marginTop: 14 },
});
