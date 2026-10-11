// Regras do formulário de card (spec §2.2 RF02, microcopy §5 e design T8).

export interface CardFormValues {
  title: string;
  description: string;
}

export const TITLE_MAX = 120;
export const DESCRIPTION_MAX = 1000;

export function validateCard({ title, description }: CardFormValues) {
  const errors: Partial<Record<keyof CardFormValues, string>> = {};
  if (title.trim().length === 0) errors.title = 'Informe um título para o card.';
  else if (title.trim().length > TITLE_MAX)
    errors.title = `O título pode ter no máximo ${TITLE_MAX} caracteres.`;
  if (description.trim().length > DESCRIPTION_MAX)
    errors.description = `Use até ${DESCRIPTION_MAX} caracteres.`;
  return errors;
}
