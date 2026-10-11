import { Fragment, type ReactNode } from 'react';

const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

/**
 * Realça as ocorrências de `query` em `text` ignorando acentos e caixa
 * ("foco" realça "Foco" e "fóco"), preservando o texto original.
 */
export function highlight(text: string, query: string, markClass?: string): ReactNode {
  const needle = fold(query.trim());
  if (!needle) return text;

  // Texto "dobrado" + mapa de cada caractere dobrado para o índice original.
  let folded = '';
  const map: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const f = fold(text[i] ?? '');
    for (let k = 0; k < f.length; k++) map.push(i);
    folded += f;
  }

  const parts: ReactNode[] = [];
  let cursor = 0;
  let from = folded.indexOf(needle);
  while (from !== -1) {
    const start = map[from] ?? 0;
    const end = (map[from + needle.length - 1] ?? start) + 1;
    if (start > cursor) parts.push(text.slice(cursor, start));
    parts.push(
      <mark key={start} className={markClass}>
        {text.slice(start, end)}
      </mark>,
    );
    cursor = end;
    from = folded.indexOf(needle, from + needle.length);
  }
  if (parts.length === 0) return text;
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts.map((p, i) => <Fragment key={i}>{p}</Fragment>);
}
