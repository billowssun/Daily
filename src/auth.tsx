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
  recovering: boolean;
  session: Session | null;
  user: User | null;
  refreshProfile: () => Promise<void>;
  finishRecovery: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recovering, setRecovering] = useState(false);
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
    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (event === 'PASSWORD_RECOVERY') setRecovering(true);
      if (!nextSession) setProfile(null);
      else setTimeout(() => void refreshProfile(), 0);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      profile,
      recovering,
      session,
      user: session?.user ?? null,
      refreshProfile,
      finishRecovery: () => setRecovering(false),
      signOut: async () => {
        await supabase?.auth.signOut();
        setProfile(null);
      },
    }),
    [loading, profile, recovering, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { loading, profile, recovering, session, signOut } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isSupabaseConfigured) return <SetupScreen />;
  if (!session) return <AuthScreen />;
  if (recovering) return <PasswordRecoveryScreen />;
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
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [messageKind, setMessageKind] = useState<'error' | 'info'>('error');
  const [verificationPending, setVerificationPending] = useState(false);

  const feedback = (value: string, kind: 'error' | 'info' = 'error') => {
    setMessage(value);
    setMessageKind(kind);
  };

  const submit = async () => {
    if (!supabase || !email.trim() || (mode !== 'forgot' && password.length < 6)) {
      feedback(mode === 'forgot' ? '请输入有效邮箱。' : '请输入有效邮箱，密码至少 6 位。');
      return;
    }
    setBusy(true);
    setMessage('');
    setVerificationPending(false);
    if (mode === 'forgot') {
      const redirectTo = typeof window === 'undefined' ? undefined : window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
      feedback(error ? readableAuthError(error.message) : '重置邮件已发送，请检查收件箱和垃圾邮件。', error ? 'error' : 'info');
    } else if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        feedback(readableAuthError(error.message));
        if (error.message === 'Email not confirmed' || error.message === 'Invalid login credentials') {
          setVerificationPending(true);
        }
      }
    } else {
      const emailRedirectTo = typeof window === 'undefined' ? undefined : window.location.origin;
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { display_name: displayName.trim() || email.split('@')[0] },
          emailRedirectTo,
        },
      });
      if (error) feedback(readableAuthError(error.message));
      else if (!data.session) {
        feedback('账号已创建。请先打开验证邮件完成确认，再返回登录；也请检查垃圾邮件。', 'info');
        setVerificationPending(true);
      }
    }
    setBusy(false);
  };

  const resendVerification = async () => {
    if (!supabase || !email.trim()) {
      feedback('请先填写注册邮箱。');
      return;
    }
    setBusy(true);
    const emailRedirectTo = typeof window === 'undefined' ? undefined : window.location.origin;
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: { emailRedirectTo },
    });
    setBusy(false);
    feedback(
      error ? readableAuthError(error.message) : '验证邮件已重新发送，请检查收件箱和垃圾邮件。',
      error ? 'error' : 'info',
    );
  };

  const changeMode = (nextMode: 'login' | 'signup' | 'forgot') => {
    setMode(nextMode);
    setMessage('');
    setVerificationPending(false);
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
          <Text style={styles.kicker}>{mode === 'login' ? '欢迎回来' : mode === 'signup' ? '创建个人空间' : '账号恢复'}</Text>
          <Text style={styles.title}>{mode === 'login' ? '登录日序' : mode === 'signup' ? '注册日序' : '重置密码'}</Text>
          <Text style={styles.subtitle}>{mode === 'login' ? '继续整理今天，也照看长期的生活。' : mode === 'signup' ? '首位注册用户将成为系统管理员。' : '输入注册邮箱，我们会发送安全重置链接。'}</Text>
          {mode === 'signup' ? (
            <AuthField icon={UserRound} placeholder="你的称呼" value={displayName} onChangeText={setDisplayName} />
          ) : null}
          <AuthField icon={Mail} placeholder="邮箱地址" value={email} onChangeText={setEmail} />
          {mode !== 'forgot' ? <AuthField icon={LockKeyhole} placeholder="密码（至少 6 位）" value={password} onChangeText={setPassword} secure /> : null}
          {message ? <Text style={[styles.message, messageKind === 'info' && styles.infoMessage]}>{message}</Text> : null}
          <Pressable disabled={busy} style={[styles.primaryButton, busy && styles.disabled]} onPress={() => void submit()}>
            {busy ? <ActivityIndicator color={colors.white} /> : <Text style={styles.primaryButtonText}>{mode === 'login' ? '登录' : mode === 'signup' ? '创建账号' : '发送重置邮件'}</Text>}
          </Pressable>
          {verificationPending ? (
            <Pressable disabled={busy} style={styles.resendButton} onPress={() => void resendVerification()}>
              <Text style={styles.resendText}>重新发送验证邮件</Text>
            </Pressable>
          ) : null}
          {mode === 'login' ? (
            <Pressable style={styles.forgotButton} onPress={() => changeMode('forgot')}>
              <Text style={styles.forgotText}>忘记密码？</Text>
            </Pressable>
          ) : null}
          <Pressable style={styles.switchButton} onPress={() => changeMode(mode === 'login' ? 'signup' : 'login')}>
            <Text style={styles.switchText}>{mode === 'login' ? '还没有账号？创建一个' : '返回登录'}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function readableAuthError(message: string) {
  const translations: Record<string, string> = {
    'Email not confirmed': '邮箱已注册，但尚未完成验证。请打开验证邮件后再登录。',
    'Invalid login credentials': '邮箱或密码不正确；如果刚注册，请先完成邮箱验证。',
    'User already registered': '该邮箱已经注册，请直接登录或重置密码。',
    'Password should be at least 6 characters.': '密码至少需要 6 位。',
    'Email rate limit exceeded': '验证邮件发送过于频繁，请稍后再试。',
  };
  return translations[message] ?? message;
}

function PasswordRecoveryScreen() {
  const { finishRecovery, signOut } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const submit = async () => {
    if (!supabase || password.length < 6 || password !== confirmation) {
      setMessage(password !== confirmation ? '两次输入的密码不一致。' : '新密码至少 6 位。');
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) setMessage(error.message);
    else {
      finishRecovery();
      await signOut();
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.authCard}>
        <View style={styles.brandMark}><LockKeyhole color={colors.green700} size={24} /></View>
        <Text style={styles.kicker}>安全验证已通过</Text>
        <Text style={styles.title}>设置新密码</Text>
        <Text style={styles.subtitle}>更新后请使用新密码重新登录。</Text>
        <AuthField icon={LockKeyhole} placeholder="新密码（至少 6 位）" value={password} onChangeText={setPassword} secure />
        <AuthField icon={LockKeyhole} placeholder="再次输入新密码" value={confirmation} onChangeText={setConfirmation} secure />
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <Pressable disabled={busy} style={[styles.primaryButton, busy && styles.disabled]} onPress={() => void submit()}>
          {busy ? <ActivityIndicator color={colors.white} /> : <Text style={styles.primaryButtonText}>更新密码</Text>}
        </Pressable>
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
  infoMessage: { color: colors.green700 },
  primaryButton: { alignItems: 'center', backgroundColor: colors.green700, borderRadius: 10, justifyContent: 'center', marginTop: 5, minHeight: 48 },
  primaryButtonText: { color: colors.white, fontSize: 13, fontWeight: '800' },
  disabled: { opacity: 0.65 },
  switchButton: { alignItems: 'center', marginTop: 20 },
  switchText: { color: colors.green700, fontSize: 11, fontWeight: '700' },
  forgotButton: { alignItems: 'flex-end', marginTop: 12 },
  forgotText: { color: colors.textMuted, fontSize: 10, fontWeight: '700' },
  resendButton: { alignItems: 'center', borderColor: colors.green200, borderRadius: 9, borderWidth: 1, justifyContent: 'center', marginTop: 10, minHeight: 42 },
  resendText: { color: colors.green700, fontSize: 10, fontWeight: '800' },
  secondaryButton: { alignItems: 'center', borderColor: colors.line, borderRadius: 10, borderWidth: 1, justifyContent: 'center', minHeight: 44 },
  secondaryButtonText: { color: colors.text, fontSize: 12, fontWeight: '700' },
  loading: { color: colors.textMuted, fontSize: 12, marginTop: 14 },
});
