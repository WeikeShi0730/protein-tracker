import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { C } from '@/constants/ClaudeTheme';

interface Props {
  consumed: number;
  goal: number;
  label: string;
  unit: string;
  color: string;
}

export default function GoalsProgressBar({ consumed, goal, label, unit, color }: Props) {
  const pct = goal > 0 ? Math.min(consumed / goal, 1) : 0;
  const barColor = pct >= 1 ? C.error : pct >= 0.85 ? C.warning : color;

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(pct, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [pct]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%` as any,
    backgroundColor: barColor,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.values}>
          {Math.round(consumed)}{unit} / {Math.round(goal)}{unit}
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 13, fontWeight: '600', color: C.textPrimary, letterSpacing: 0.1 },
  values: { fontSize: 12, color: C.textSecondary, fontWeight: '500' },
  track: {
    height: 6,
    backgroundColor: C.border,
    borderRadius: 100,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 100,
  },
});
