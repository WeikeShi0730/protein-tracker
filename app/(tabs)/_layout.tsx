import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { FoodsProvider } from '@/contexts/FoodsContext';
import { C } from '@/constants/ClaudeTheme';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      <Text style={styles.tabEmoji}>{emoji}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <ProfileProvider>
      <FoodsProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: C.accent,
          tabBarInactiveTintColor: C.textMuted,
          tabBarStyle: {
            backgroundColor: C.bgElevated,
            borderTopWidth: 1,
            borderTopColor: C.border,
            paddingTop: 6,
            paddingBottom: 12,
            height: 72,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
            letterSpacing: 0.2,
            marginTop: 2,
          },
          headerShown: true,
          headerStyle: {
            backgroundColor: C.bgElevated,
            borderBottomWidth: 1,
            borderBottomColor: C.border,
          } as any,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 17,
            color: C.textPrimary,
          },
          headerShadowVisible: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Protein Tracker',
            tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Today" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="foods"
          options={{
            title: 'Foods',
            tabBarIcon: ({ focused }) => <TabIcon emoji="🥗" label="Foods" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Me',
            tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Me" focused={focused} />,
          }}
        />
      </Tabs>
      </FoodsProvider>
    </ProfileProvider>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 32,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconFocused: {
    backgroundColor: C.accentLight,
  },
  tabEmoji: { fontSize: 18 },
});
