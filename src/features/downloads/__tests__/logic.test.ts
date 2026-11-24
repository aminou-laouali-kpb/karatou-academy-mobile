import { formatSize, jsonBytes, videoAccess } from '../logic';

describe('jsonBytes', () => {
  it('compte les octets UTF-8 du JSON', () => {
    expect(jsonBytes('a')).toBe(3); // "a"
    expect(jsonBytes('é')).toBe(4); // 2 octets + guillemets
    expect(jsonBytes('ƙ')).toBe(4); // lettre hausa
    expect(jsonBytes('€')).toBe(5);
    expect(jsonBytes('😀')).toBe(6);
    expect(jsonBytes(undefined)).toBe(0);
    expect(jsonBytes({ a: 1 })).toBe(7);
  });
});

describe('formatSize', () => {
  const units = { kb: 'ko', mb: 'Mo' };
  it('affiche ko ou Mo selon la taille', () => {
    expect(formatSize(0, 'fr', units)).toBe('1 ko');
    expect(formatSize(84_400, 'fr', units)).toBe('84 ko');
    expect(formatSize(1_234_567, 'fr', units)).toBe('1,2 Mo');
    expect(formatSize(1_234_567, 'en', { kb: 'KB', mb: 'MB' })).toBe('1.2 MB');
  });
});

describe('videoAccess', () => {
  it('bloque hors ligne', () => {
    expect(videoAccess({ offline: true, wifiOnly: false, connectionType: 'wifi' })).toBe('offline');
  });
  it('sans le réglage, tout réseau convient', () => {
    expect(videoAccess({ offline: false, wifiOnly: false, connectionType: 'cellular' })).toBe('ok');
  });
  it('avec le réglage, seulement Wi-Fi ou Ethernet', () => {
    expect(videoAccess({ offline: false, wifiOnly: true, connectionType: 'wifi' })).toBe('ok');
    expect(videoAccess({ offline: false, wifiOnly: true, connectionType: 'ethernet' })).toBe('ok');
    expect(videoAccess({ offline: false, wifiOnly: true, connectionType: 'cellular' })).toBe('wifiOnly');
    expect(videoAccess({ offline: false, wifiOnly: true, connectionType: 'unknown' })).toBe('wifiOnly');
    expect(videoAccess({ offline: false, wifiOnly: true, connectionType: null })).toBe('wifiOnly');
  });
});
