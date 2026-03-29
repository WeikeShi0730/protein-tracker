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

function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: 'Weak', color: '#EF4444' };
  if (score === 2) return { score, label: 'Fair', color: '#F59E0B' };
  if (score === 3) return { score, label: 'Good', color: '#84CC16' };
  return { score, label: 'Strong', color: '#10B981' };
}

export default function SignupScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = getStrength(password);

  async function handleSignup() {
    if (!email || !password || !confirm) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (strength.score < 3) {
      setError('Password is too weak. Use 8+ characters with uppercase and a number.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signUp(email.trim(), password);
      setSuccess(true);
    } catch (e: any) {
      setError(e.message ?? 'Sign up failed.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <View style={styles.successContainer}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.successCard}>
          <View style={styles.successIconWrap}>
            <Text style={styles.successIcon}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Check your email</Text>
          <Text style={styles.successMessage}>
            We sent a confirmation link to{'\n'}
            <Text style={styles.successEmail}>{email}</Text>
            {'\n\n'}Click it to activate your account, then sign in.
          </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Back to Sign In</Text>
            </TouchableOpacity>
          </Link>
        </Animated.View>
      </View>
    );
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
          <Text style={styles.brandName}>Create Account</Text>
          <Text style={styles.brandTagline}>Start tracking your nutrition</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.card}>
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
            placeholder="Min. 8 characters"
            placeholderTextColor={C.textPlaceholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {password.length > 0 && (
            <View style={styles.strengthWrap}>
              <View style={styles.strengthBars}>
                {[1, 2, 3, 4].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.strengthBar,
                      { backgroundColor: i <= strength.score ? strength.color : C.border },
                    ]}
                  />
                ))}
              </View>
              <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
            </View>
          )}

          {password.length > 0 && (
            <View style={styles.criteriaRow}>
              <Text style={[styles.criterion, password.length >= 8 && styles.criterionMet]}>
                8+ chars
              </Text>
              <Text style={[styles.criterion, /[A-Z]/.test(password) && styles.criterionMet]}>
                Uppercase
              </Text>
              <Text style={[styles.criterion, /[0-9]/.test(password) && styles.criterionMet]}>
                Number
              </Text>
              <Text style={[styles.criterion, /[^A-Za-z0-9]/.test(password) && styles.criterionMet]}>
                Symbol
              </Text>
            </View>
          )}

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Re-enter password"
            placeholderTextColor={C.textPlaceholder}
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.disabled]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.primaryBtnText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(160).duration(400)}>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity style={styles.linkRow}>
              <Text style={styles.linkText}>
                Already have an account?{' '}
                <Text style={styles.linkAccent}>Sign in</Text>
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

  brandWrap: { alignItems: 'center', marginBottom: 28 },
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
  brandTagline: { fontSize: 14, color: C.textSecondary },

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

  // Success state
  successContainer: { flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center', padding: 28 },
  successCard: {
    backgroundColor: C.bgElevated,
    borderRadius: R.lg,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    width: '100%',
    maxWidth: 380,
  },
  successIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: C.successBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#B7DFD0',
  },
  successIcon: { fontSize: 26, color: C.success },
  successTitle: { fontSize: 20, fontWeight: '700', color: C.textPrimary, marginBottom: 12 },
  successMessage: { fontSize: 14, color: C.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  successEmail: { fontWeight: '600', color: C.textPrimary },

  disabled: { opacity: 0.5 },

  strengthWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: -8,
    marginBottom: 10,
  },
  strengthBars: { flex: 1, flexDirection: 'row', gap: 4 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 12, fontWeight: '600', minWidth: 44 },

  criteriaRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  criterion: { fontSize: 11, color: C.textMuted, fontWeight: '500' },
  criterionMet: { color: '#10B981', fontWeight: '600' },
});
