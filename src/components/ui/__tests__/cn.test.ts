import { cn } from '../cn';

describe('cn', () => {
  it('ignore les valeurs vides', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b');
  });

  it('laisse le className passé écraser la couleur par défaut', () => {
    expect(cn('font-heading text-h1 text-gray-900', 'text-white')).toBe('font-heading text-h1 text-white');
  });

  it('ne confond pas une taille de police du thème avec une couleur', () => {
    expect(cn('text-body text-gray-900', 'text-blue-100')).toBe('text-body text-blue-100');
    expect(cn('text-body', 'text-h2')).toBe('text-h2');
  });

  it('remplace une famille de police du thème', () => {
    expect(cn('font-body', 'font-body-bold')).toBe('font-body-bold');
  });
});
