import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Link } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { C, R } from '@/constants/ClaudeTheme';

export default function LoginScreen() {
  const { signIn, signInWithOAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);

  async function handleLogin() {
    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (e: any) {
      setError(e.message ?? 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: 'google' | 'apple') {
    setError(null);
    setOauthLoading(provider);
    try {
      await signInWithOAuth(provider);
    } catch (e: any) {
      setError(e.message ?? `${provider} sign-in failed.`);
      setOauthLoading(null);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>

        {/* Brand mark */}
        <Animated.View entering={FadeInDown.delay(0).duration(400)} style={styles.brandWrap}>
          <View style={styles.brandOrb} />
          <Text style={styles.brandName}>Protein Tracker</Text>
          <Text style={styles.brandTagline}>Your daily nutrition companion</Text>
        </Animated.View>

        {/* Form card */}
        <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.card}>
          <Text style={styles.cardTitle}>Welcome back</Text>

          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={C.textPlaceholder}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={C.textPlaceholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />

          <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity style={styles.forgotRow}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          </Link>

          <TouchableOpacity
            style={[styles.primaryBtn, (loading || !!oauthLoading) && styles.disabled]}
            onPress={handleLogin}
            disabled={loading || !!oauthLoading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.primaryBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* OAuth */}
        <Animated.View entering={FadeInDown.delay(160).duration(400)} style={styles.oauthWrap}>
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[styles.oauthBtn, !!oauthLoading && styles.disabled]}
            onPress={() => handleOAuth('google')}
            disabled={loading || !!oauthLoading}
            activeOpacity={0.7}
          >
            {oauthLoading === 'google' ? (
              <ActivityIndicator color={C.textPrimary} size="small" />
            ) : (
              <Text style={styles.oauthBtnText}>Continue with Google</Text>
            )}
          </TouchableOpacity>

          {Platform.OS !== 'android' && (
            <TouchableOpacity
              style={[styles.oauthBtn, styles.appleBtn, !!oauthLoading && styles.disabled]}
              onPress={() => handleOAuth('apple')}
              disabled={loading || !!oauthLoading}
              activeOpacity={0.7}
            >
              {oauthLoading === 'apple' ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={[styles.oauthBtnText, styles.appleBtnText]}>Continue with Apple</Text>
              )}
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Sign up link */}
        <Animated.View entering={FadeInDown.delay(240).duration(400)}>
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity style={styles.linkRow}>
              <Text style={styles.linkText}>
                Don't have an account?{' '}
                <Text style={styles.linkAccent}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </Link>
        </Animated.View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },

  // Brand
  brandWrap: { alignItems: 'center', marginBottom: 32 },
  brandOrb: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: C.accent,
    marginBottom: 14,
    shadowColor: C.accent,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  brandName: { fontSize: 24, fontWeight: '700', color: C.textPrimary, marginBottom: 4 },
  brandTagline: { fontSize: 14, color: C.textSecondary },

  // Card
  card: {
    backgroundColor: C.bgElevated,
    borderRadius: R.lg,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.shadowColor,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: C.textPrimary, marginBottom: 16 },

  errorBanner: {
    backgroundColor: C.errorBg,
    borderRadius: R.sm,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EFBDB7',
  },
  errorText: { color: C.error, fontSize: 13, textAlign: 'center' },

  label: { fontSize: 12, fontWeight: '600', color: C.textSecondary, marginBottom: 6, letterSpacing: 0.3 },
  input: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.sm,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 15,
    color: C.textPrimary,
    backgroundColor: C.bgSubtle,
    marginBottom: 14,
  },

  primaryBtn: {
    backgroundColor: C.accent,
    borderRadius: R.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    minHeight: 48,
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '600', letterSpacing: 0.2 },

  // OAuth
  oauthWrap: { marginBottom: 20 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 14 },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.border },
  dividerText: { color: C.textMuted, fontSize: 12, marginHorizontal: 12, fontWeight: '500' },

  oauthBtn: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.md,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: C.bgElevated,
    minHeight: 46,
    justifyContent: 'center',
  },
  oauthBtnText: { fontSize: 14, fontWeight: '600', color: C.textPrimary },
  appleBtn: { backgroundColor: C.textPrimary, borderColor: C.textPrimary },
  appleBtnText: { color: '#fff' },

  linkRow: { alignItems: 'center', paddingVertical: 4 },
  linkText: { color: C.textSecondary, fontSize: 14 },
  linkAccent: { fontWeight: '700', color: C.accent },

  disabled: { opacity: 0.5 },

  forgotRow: { alignSelf: 'flex-end', paddingVertical: 4, marginBottom: 8 },
  forgotText: { fontSize: 13, color: C.accent, fontWeight: '500' },
});
