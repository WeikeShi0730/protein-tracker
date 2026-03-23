import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { C, R } from '@/constants/ClaudeTheme';

interface Props {
  selectedDate: string; // YYYY-MM-DD
  onSelect: (date: string) => void;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function DatePickerCalendar({ selectedDate, onSelect }: Props) {
  const today = new Date();
  const todayStr = today.toLocaleDateString('en-CA');

  const initParts = selectedDate.split('-').map(Number);
  const [viewYear, setViewYear] = useState(initParts[0] || today.getFullYear());
  const [viewMonth, setViewMonth] = useState(
    initParts.length >= 2 ? initParts[1] - 1 : today.getMonth()
  );

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const allCells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (allCells.length % 7 !== 0) allCells.push(null);
  const rows: (number | null)[][] = [];
  for (let i = 0; i < allCells.length; i += 7) rows.push(allCells.slice(i, i + 7));

  const isCurrentMonth =
    viewYear === today.getFullYear() && viewMonth === today.getMonth();

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (isCurrentMonth) return;
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  return (
    <View style={styles.container}>
      {/* Month navigation */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.navBtn} onPress={prevMonth} activeOpacity={0.7}>
          <Text style={styles.navText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{MONTHS[viewMonth]} {viewYear}</Text>
        <TouchableOpacity
          style={[styles.navBtn, isCurrentMonth && styles.navBtnDisabled]}
          onPress={nextMonth}
          disabled={isCurrentMonth}
          activeOpacity={0.7}
        >
          <Text style={[styles.navText, isCurrentMonth && styles.navTextFaded]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Weekday headers */}
      <View style={styles.weekRow}>
        {DAYS.map(d => (
          <View key={d} style={styles.weekCell}>
            <Text style={styles.weekLabel}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Day grid */}
      <View style={styles.gridPad}>
        {rows.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((day, ci) => {
              if (!day) return <View key={ci} style={styles.cell} />;
              const ds = toDateStr(viewYear, viewMonth, day);
              const isFuture = ds > todayStr;
              const isSelected = ds === selectedDate;
              const isToday = ds === todayStr;
              return (
                <TouchableOpacity
                  key={ci}
                  style={styles.cell}
                  onPress={() => !isFuture && onSelect(ds)}
                  disabled={isFuture}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.dayCircle,
                    isSelected && styles.dayCircleSelected,
                    isToday && !isSelected && styles.dayCircleToday,
                  ]}>
                    <Text style={[
                      styles.dayText,
                      isSelected && styles.dayTextSelected,
                      isToday && !isSelected && styles.dayTextToday,
                      isFuture && styles.dayTextFuture,
                    ]}>
                      {day}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.bgElevated,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 18,
    overflow: 'hidden',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: C.bgSubtle,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  navBtn: {
    width: 26,
    height: 26,
    borderRadius: R.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.bgElevated,
    borderWidth: 1,
    borderColor: C.border,
  },
  navBtnDisabled: { opacity: 0.3 },
  navText: { fontSize: 18, color: C.textPrimary, lineHeight: 22, marginTop: -1 },
  navTextFaded: { color: C.textMuted },
  monthLabel: { fontSize: 13, fontWeight: '700', color: C.textPrimary, letterSpacing: 0.2 },

  weekRow: {
    flexDirection: 'row',
    paddingTop: 7,
    paddingBottom: 4,
    paddingHorizontal: 6,
  },
  weekCell: { flex: 1, alignItems: 'center' },
  weekLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: C.textMuted,
    letterSpacing: 0.5,
  },

  gridPad: { paddingHorizontal: 6, paddingBottom: 7 },
  row: { flexDirection: 'row', marginBottom: 1 },
  cell: { flex: 1, alignItems: 'center', paddingVertical: 2 },

  dayCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleSelected: {
    backgroundColor: C.accent,
  },
  dayCircleToday: {
    borderWidth: 1.5,
    borderColor: C.accent,
    backgroundColor: C.accentLight,
  },

  dayText: { fontSize: 12, fontWeight: '500', color: C.textPrimary },
  dayTextSelected: { color: '#fff', fontWeight: '700' },
  dayTextToday: { color: C.accent, fontWeight: '700' },
  dayTextFuture: { color: C.textMuted, opacity: 0.4 },
});
