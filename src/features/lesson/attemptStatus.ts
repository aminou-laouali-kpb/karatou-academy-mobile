import { PermanentError } from '@/lib/offlineQueue';

/**
 * Statut renvoyé par la RPC → l'élément quitte la file ou attend.
 * `failed` (quiz < 70 %) est une tentative enregistrée : elle quitte la file.
 */
export function checkAttemptStatus(status: string | undefined) {
  switch (status) {
    case 'completed':
    case 'replayed':
    case 'failed':
      return;
    case 'rate_limited':
      // Passager : on réessaiera plus tard avec la même clé d'idempotence.
      throw new Error('karatou_record_lesson_attempt: rate_limited');
    default:
      // mismatch (contenu périmé), quiz_required, réponse inattendue : rien ne
      // sera accepté en renvoyant la même tentative.
      throw new PermanentError(`karatou_record_lesson_attempt: ${status ?? 'no status'}`);
  }
}
