import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';

/** TanStack Query suit la connexion réelle : pas de requête en mode avion, reprise au retour du réseau. */
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) =>
    setOnline(state.isConnected !== false && state.isInternetReachable !== false),
  ),
);

/** Vrai quand l'appareil est hors ligne (bandeau, états « hors ligne »). */
export function useIsOffline(): boolean {
  return !useSyncExternalStore(
    (onChange) => onlineManager.subscribe(onChange),
    () => onlineManager.isOnline(),
  );
}
