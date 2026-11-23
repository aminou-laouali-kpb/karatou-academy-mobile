import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Avatar, Button, Card, Text } from '@/components/ui';
import { countryLabel } from '@/features/auth/countries';
import { webAdminPath } from '@/features/auth/roles';
import { signOut } from '@/features/auth/service';
import { useAuth } from '@/features/auth/store';
import { useProfile } from '@/features/profile/api';
import { isLanguage } from '@/i18n';
import { env } from '@/lib/env';
import { colors } from '@/theme/tokens';

/** E12 Profil, version S2 : identité, langue, rôle, compte. Stats et badges au sprint S6. */
export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const role = useAuth((s) => s.role);
  const email = useAuth((s) => s.session?.user.email);
  const { data: profile, isLoading, isError, refetch } = useProfile();
  const lang = isLanguage(i18n.language) ? i18n.language : 'fr';
  const adminPath = webAdminPath(role);
  const name = profile?.full_name || t('profile.noName');

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView contentContainerClassName="gap-6 px-5 pb-10 pt-4">
        <Text variant="h1">{t('profile.title')}</Text>

        {isLoading ? (
          <ActivityIndicator color={colors.blue[500]} />
        ) : isError ? (
          <Card className="gap-3">
            <Text variant="body">{t('common.error')}</Text>
            <Button variant="secondary" label={t('common.retry')} onPress={() => void refetch()} />
          </Card>
        ) : (
          <View className="flex-row items-center gap-4">
            <Avatar name={name} uri={profile?.avatar_url ?? undefined} size={64} />
            <View className="flex-1 gap-0.5">
              <Text variant="h2">{name}</Text>
              {profile?.country ? (
                <Text variant="body" className="text-gray-500">
                  {countryLabel(profile.country, lang, t('auth.fields.otherCountry'))}
                </Text>
              ) : null}
              {email ? <Text variant="meta">{email}</Text> : null}
            </View>
          </View>
        )}

        {adminPath && (
          <Card className="gap-3 border-blue-500 bg-blue-50">
            <Text variant="h3">{t(`profile.role.${role as 'platform_admin' | 'enterprise_admin'}`)}</Text>
            <Text variant="body" className="text-gray-700">
              {t('profile.admin.body')}
            </Text>
            <Button
              variant="secondary"
              label={t('profile.admin.open')}
              onPress={() => void WebBrowser.openBrowserAsync(`${env.webAppUrl}${adminPath}`)}
            />
          </Card>
        )}

        <View className="gap-2">
          <Text variant="eyebrow">{t('language.label')}</Text>
          <LanguageSwitcher />
        </View>

        <View className="gap-3">
          <Button
            variant="secondary"
            label={t('profile.edit')}
            onPress={() => router.push('/settings/profile')}
          />
          <Button variant="secondary" label={t('profile.signOut')} onPress={() => void signOut()} />
          <Button
            variant="ghost"
            label={t('profile.deleteAccount')}
            className="mt-4"
            onPress={() => router.push('/settings/delete-account')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
