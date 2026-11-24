import { PermanentError } from '@/lib/offlineQueue';

import { checkAttemptStatus } from '../attemptStatus';

describe('checkAttemptStatus', () => {
  it('retire de la file toute tentative enregistrée, même un quiz raté', () => {
    for (const status of ['completed', 'replayed', 'failed'])
      expect(() => checkAttemptStatus(status)).not.toThrow();
  });

  it('réessaie plus tard après un refus pour excès d’envois', () => {
    let error: unknown;
    try {
      checkAttemptStatus('rate_limited');
    } catch (thrown) {
      error = thrown;
    }
    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(PermanentError);
  });

  it('abandonne une tentative que le serveur n’acceptera jamais', () => {
    for (const status of ['mismatch', 'quiz_required', undefined])
      expect(() => checkAttemptStatus(status)).toThrow(PermanentError);
  });
});
