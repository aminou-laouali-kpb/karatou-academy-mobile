import en from '../locales/en.json';
import fr from '../locales/fr.json';
import ha from '../locales/ha.json';

type Tree = { [key: string]: string | Tree };

/** Liste « a.b.c » de toutes les clés feuilles. */
function flatten(tree: Tree, prefix = ''): string[] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'string' ? [path] : flatten(value, path);
  });
}

/** Placeholders {{x}} d'une chaîne, triés. */
function placeholders(value: string) {
  return (value.match(/\{\{\s*\w+\s*\}\}/g) ?? []).map((p) => p.replace(/\s/g, '')).sort();
}

function get(tree: Tree, path: string): string {
  return path
    .split('.')
    .reduce<Tree | string>((node, k) => (node as Tree)[k] as Tree | string, tree) as string;
}

const locales = { fr, en, ha } as Record<string, Tree>;
const reference = flatten(fr as Tree).sort();

describe('parité des traductions (CLAUDE.md, règle 4)', () => {
  it.each(['en', 'ha'])('%s a exactement les mêmes clés que fr', (lang) => {
    expect(flatten(locales[lang]!).sort()).toEqual(reference);
  });

  it.each(['fr', 'en', 'ha'])('%s n’a aucune chaîne vide', (lang) => {
    const empty = flatten(locales[lang]!).filter((k) => get(locales[lang]!, k).trim() === '');
    expect(empty).toEqual([]);
  });

  it.each(['en', 'ha'])('%s garde les mêmes placeholders que fr', (lang) => {
    const mismatched = reference.filter(
      (k) => placeholders(get(locales[lang]!, k)).join() !== placeholders(get(fr as Tree, k)).join(),
    );
    expect(mismatched).toEqual([]);
  });
});
