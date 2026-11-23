import { useNetInfo } from '@react-native-community/netinfo';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { Alert } from 'react-native';

import DownloadsScreen from '../../../../app/downloads';
import i18n from '@/i18n';
import { IntroVideo } from '@/features/catalog/components/IntroVideo';

import { DownloadButton } from '../components/DownloadButton';
import { useDownloads } from '../store';

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {},
}));
jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn(), canGoBack: () => true } }));
jest.mock('react-native-safe-area-context', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return { SafeAreaView: View, useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) };
});
jest.mock('react-native-youtube-iframe', () => () => null);
jest.mock('@/features/catalog/api', () => ({ useCatalog: () => ({ data: { modules: [] } }) }));
jest.mock('@/features/lesson/api', () => ({
  lessonQueryKey: (id: string, lang: string) => ['lesson', id, lang],
  lessonQueryOptions: (id: string, lang: string) => ({
    queryKey: ['lesson', id, lang],
    queryFn: async () => ({ bodyLang: lang, body: { title: `${id} ${lang}` } }),
  }),
}));

const module = {
  slug: 'ia',
  title: 'Les bases de l’IA',
  emoji: '🤖',
  lessons: [{ id: 'l1', title: 'L1', description: '', duration: '5 min' }],
};

function wrap(ui: ReactNode, qc = new QueryClient()) {
  return <QueryClientProvider client={qc}>{ui}</QueryClientProvider>;
}

beforeAll(() => i18n.changeLanguage('fr'));
beforeEach(() => useDownloads.setState({ modules: {}, videosWifiOnly: false }));

describe('DownloadButton', () => {
  it('télécharge le module à la demande puis propose de gérer', async () => {
    await render(wrap(<DownloadButton module={module} />));
    expect(screen.getByText(/1 leçon en français, anglais et haoussa/)).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Télécharger le module' }));
    await waitFor(() =>
      expect(screen.getByText('Module téléchargé : disponible hors ligne')).toBeOnTheScreen(),
    );
    expect(useDownloads.getState().modules.ia?.lessonIds).toEqual(['l1']);
    expect(screen.getByRole('button', { name: 'Gérer les téléchargements' })).toBeOnTheScreen();
  });
});

describe('Écran Téléchargements', () => {
  it('état vide', async () => {
    await render(wrap(<DownloadsScreen />));
    expect(screen.getByText('Aucun module téléchargé')).toBeOnTheScreen();
  });

  it('liste un module, sa taille, et le supprime après confirmation', async () => {
    const qc = new QueryClient();
    qc.setQueryData(['lesson', 'l1', 'fr'], {});
    qc.setQueryData(['lesson', 'l1', 'en'], {});
    qc.setQueryData(['lesson', 'l1', 'ha'], {});
    useDownloads
      .getState()
      .save({ ...module, lessonIds: ['l1'], bytes: 1_500_000, downloadedAt: Date.UTC(2026, 10, 23) });
    const alert = jest
      .spyOn(Alert, 'alert')
      .mockImplementation((_t, _m, buttons) => buttons?.[1]?.onPress?.());
    await render(wrap(<DownloadsScreen />, qc));
    expect(screen.getByText(/≈ 1,5 Mo/)).toBeOnTheScreen();
    expect(screen.getByText('Espace utilisé : 1,5 Mo')).toBeOnTheScreen();
    expect(screen.queryByText('Certaines leçons ne sont plus sur le téléphone.')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Supprimer le module « Les bases de l’IA »' }));
    expect(alert).toHaveBeenCalled();
    expect(useDownloads.getState().modules.ia).toBeUndefined();
    expect(qc.getQueryData(['lesson', 'l1', 'fr'])).toBeUndefined();
  });

  it('signale un module dont le cache a disparu', async () => {
    useDownloads.getState().save({ ...module, lessonIds: ['l1'], bytes: 10, downloadedAt: 0 });
    await render(wrap(<DownloadsScreen />));
    expect(screen.getByText('Certaines leçons ne sont plus sur le téléphone.')).toBeOnTheScreen();
  });

  it('bascule « Vidéos en Wi-Fi uniquement »', async () => {
    await render(wrap(<DownloadsScreen />));
    await fireEvent(screen.getByTestId('wifi-only'), 'valueChange', true);
    expect(useDownloads.getState().videosWifiOnly).toBe(true);
  });
});

describe('IntroVideo et le réglage Wi-Fi', () => {
  const url = 'https://www.youtube.com/embed/OlHLuouQCP8';

  it('se lance sur données mobiles sans le réglage', async () => {
    await render(<IntroVideo url={url} videoLang="fr" userLang="fr" />);
    expect(screen.getByRole('button', { name: "Lire la vidéo d'introduction" })).toBeEnabled();
  });

  it('bloquée sur données mobiles avec le réglage, permise en Wi-Fi', async () => {
    useDownloads.setState({ videosWifiOnly: true });
    const { rerender } = await render(<IntroVideo url={url} videoLang="fr" userLang="fr" />);
    expect(screen.getByRole('button', { name: "Lire la vidéo d'introduction" })).toBeDisabled();
    expect(screen.getByText(/Vidéos en Wi-Fi uniquement : connecte-toi au Wi-Fi/)).toBeOnTheScreen();
    jest.mocked(useNetInfo).mockReturnValue({ type: 'wifi' } as ReturnType<typeof useNetInfo>);
    await rerender(<IntroVideo url={url} videoLang="fr" userLang="fr" />);
    expect(screen.getByRole('button', { name: "Lire la vidéo d'introduction" })).toBeEnabled();
  });
});
