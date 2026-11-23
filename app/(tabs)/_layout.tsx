import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';

import { colors, fontFamily } from '@/theme/tokens';

type IconName = ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, [IconName, IconName]> = {
  home: ['home-outline', 'home'],
  learn: ['book-outline', 'book'],
  league: ['trophy-outline', 'trophy'],
  profile: ['person-outline', 'person'],
};

/** 4 onglets (fiche §4) : Accueil · Apprendre · Ligue · Profil. */
export default function TabsLayout() {
  const { t } = useTranslation();
  return (
    <>
      <StatusBar style="dark" />
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.blue[500],
          tabBarInactiveTintColor: colors.gray[500],
          tabBarLabelStyle: { fontFamily: fontFamily['body-medium'], fontSize: 12 },
          tabBarIcon: ({ focused, color, size }) => {
            const [outline, filled] = TAB_ICONS[route.name] ?? ['ellipse-outline', 'ellipse'];
            return <Ionicons name={focused ? filled : outline} size={size} color={String(color)} />;
          },
        })}
      >
        <Tabs.Screen name="home" options={{ title: t('tabs.home') }} />
        <Tabs.Screen name="learn" options={{ title: t('tabs.learn') }} />
        <Tabs.Screen name="league" options={{ title: t('tabs.league') }} />
        <Tabs.Screen name="profile" options={{ title: t('tabs.profile') }} />
      </Tabs>
    </>
  );
}
