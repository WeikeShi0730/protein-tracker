import { View, Text, StyleSheet } from 'react-native';

interface Props {
  consumed: number;
  goal: number;
  label: string;
  unit: string;
  color: string;
}

export default function GoalsProgressBar({ consumed, goal, label, unit, color }: Props) {
  const pct = goal > 0 ? Math.min(consumed / goal, 1) : 0;
  const barColor = pct >= 1 ? '#dc2626' : pct >= 0.85 ? '#f59e0b' : color;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.values}>
          {Math.round(consumed)}{unit} / {Math.round(goal)}{unit}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.round(pct * 100)}%` as any, backgroundColor: barColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { fontSize: 14, fontWeight: '600', color: '#111' },
  values: { fontSize: 13, color: '#555' },
  track: {
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 5,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 5,
  },
});
