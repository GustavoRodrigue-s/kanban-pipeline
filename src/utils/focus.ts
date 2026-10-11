/**
 * Move o foco para um elemento depois do render (e depois que modais fecharem e
 * devolverem o foco ao gatilho). Tenta de novo por alguns ciclos se o elemento
 * ainda não existir ou não puder receber foco (ex.: fundo ainda `inert`).
 * Usa setTimeout (e não requestAnimationFrame, que pausa em abas em segundo plano).
 */
export function focusLater(selector: string, attempts = 10) {
  setTimeout(() => {
    const el = document.querySelector<HTMLElement>(selector);
    el?.focus();
    if (el && document.activeElement === el) return;
    if (attempts > 1) focusLater(selector, attempts - 1);
  }, 16);
}

export const focusCard = (id: string) => focusLater(`[data-card-id="${id}"]`);

/** Botão "Adicionar card" visível (cabeçalho no desktop, rodapé no mobile). */
export const focusAddButton = () => focusLater('[data-add-card]');

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const getFocusable = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.hasAttribute('inert') && el.getAttribute('aria-hidden') !== 'true',
  );
