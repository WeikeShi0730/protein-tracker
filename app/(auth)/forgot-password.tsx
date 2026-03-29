import { useState } from 'react';
import {
  View,
  Text,
  Image,
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

export default function ForgotPasswordScreen() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSend() {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (e: any) {
      setError(e.message ?? 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Animated.View entering={FadeInDown.delay(0).duration(400)} style={styles.brandWrap}>
          <View style={styles.brandLogoWrap}>
            <Image source={require('@/assets/images/logo.png')} style={styles.brandLogo} />
          </View>
          <Text style={styles.brandName}>Protein Shake</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.card}>
          {sent ? (
            <>
              <Text style={styles.cardTitle}>Check your email</Text>
              <Text style={styles.bodyText}>
                We sent a password reset link to{' '}
                <Text style={styles.emailHighlight}>{email}</Text>. Click the link
                to set a new password.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.cardTitle}>Reset password</Text>
              <Text style={styles.bodyText}>
                Enter your email and we'll send you a link to reset your password.
              </Text>

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
                autoFocus
              />

              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.disabled]}
                onPress={handleSend}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.primaryBtnText}>Send Reset Link</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(160).duration(400)}>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity style={styles.linkRow}>
              <Text style={styles.linkText}>
                Back to <Text style={styles.linkAccent}>Sign In</Text>
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

  brandWrap: { alignItems: 'center', marginBottom: 32 },
  brandLogoWrap: {
    width: 80,
    height: 80,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: C.accent,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  brandLogo: {
    width: 80,
    height: 80,
  },
  brandName: { fontSize: 24, fontWeight: '700', color: C.textPrimary, marginBottom: 4 },

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
  cardTitle: { fontSize: 18, fontWeight: '700', color: C.textPrimary, marginBottom: 10 },
  bodyText: { fontSize: 14, color: C.textSecondary, lineHeight: 20, marginBottom: 16 },
  emailHighlight: { fontWeight: '600', color: C.textPrimary },

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

  linkRow: { alignItems: 'center', paddingVertical: 4 },
  linkText: { color: C.textSecondary, fontSize: 14 },
  linkAccent: { fontWeight: '700', color: C.accent },

  disabled: { opacity: 0.5 },
});
