import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import { useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import {
  Avatar,
  Button,
  Card,
  Chip,
  ProgressBar,
  SegmentedProgressBar,
  Sheet,
  Text,
} from '@/components/ui';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-3">
      <Text variant="eyebrow">{title}</Text>
      {children}
    </View>
  );
}

/** Galerie du kit UI (QA visuelle, dev uniquement). */
export default function UiGallery() {
  const { t } = useTranslation();
  const [chip, setChip] = useState<'all' | 'ai' | 'digital'>('all');
  const [loading, setLoading] = useState(false);
  const sheetRef = useRef<BottomSheetModal>(null);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <Stack.Screen options={{ headerShown: true, title: t('dev.title'), headerBackButtonDisplayMode: 'minimal' }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerClassName="gap-8 p-5 pb-16">
        <LanguageSwitcher />

        <Section title={t('dev.typography')}>
          <Text variant="display">{t('welcome.title')}</Text>
          <Text variant="h1">{t('dev.cardTitle')}</Text>
          <Text variant="h2">{t('dev.cardTitle')}</Text>
          <Text variant="h3">{t('dev.cardTitle')}</Text>
          <Text variant="body-lg">{t('dev.sampleText')}</Text>
          <Text variant="body">{t('dev.sampleText')}</Text>
          <Text variant="label">{t('dev.sampleText')}</Text>
          <Text variant="meta">{t('dev.sampleText')}</Text>
          <Text variant="mono">KA-2026-7F3Q-91XD</Text>
        </Section>

        <Section title={t('dev.buttons')}>
          <Button
            label={t('dev.primary')}
            loading={loading}
            onPress={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1200);
            }}
          />
          <Button label={t('dev.secondary')} variant="secondary" />
          <Button label={t('dev.gold')} variant="gold" />
          <Button label={t('dev.ghost')} variant="ghost" />
          <Button label={t('dev.disabled')} disabled />
        </Section>

        <Section title={t('dev.chips')}>
          <View className="flex-row flex-wrap gap-2">
            <Chip label={t('dev.chipAll')} selected={chip === 'all'} onPress={() => setChip('all')} />
            <Chip label={t('dev.chipAi')} selected={chip === 'ai'} onPress={() => setChip('ai')} />
            <Chip label={t('dev.chipDigital')} selected={chip === 'digital'} onPress={() => setChip('digital')} />
          </View>
        </Section>

        <Section title={t('dev.cards')}>
          <Card className="gap-2">
            <Text variant="h3">{t('dev.cardTitle')}</Text>
            <Text variant="meta">{t('dev.cardBody')}</Text>
            <ProgressBar value={0.58} accessibilityLabel={t('dev.progress')} />
          </Card>
        </Section>

        <Section title={t('dev.progress')}>
          <SegmentedProgressBar total={8} completed={3} accessibilityLabel={t('dev.progress')} />
          <ProgressBar value={0.3} tone="gold" />
          <ProgressBar value={0.75} tone="emerald" />
          <ProgressBar value={1} tone="orange" />
        </Section>

        <Section title={t('dev.avatars')}>
          <View className="flex-row items-center gap-3">
            <Avatar name="Aïcha Moussa" size={56} ring="gold" />
            <Avatar name="Ibrahim Sani" ring="blue" />
            <Avatar name="Fatouma" size={36} />
          </View>
        </Section>

        <Section title={t('dev.sheet')}>
          <Button label={t('dev.openSheet')} variant="secondary" onPress={() => sheetRef.current?.present()} />
        </Section>
      </ScrollView>

      <Sheet ref={sheetRef} tone="success">
        <Text variant="h2" className="text-emerald-700">
          {t('dev.sheetTitle')}
        </Text>
        <Text variant="body">{t('dev.sheetBody')}</Text>
        <Button label={t('common.continue')} onPress={() => sheetRef.current?.dismiss()} />
      </Sheet>
    </SafeAreaView>
  );
}
