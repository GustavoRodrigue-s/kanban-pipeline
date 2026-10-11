import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

type Announce = (message: string) => void;

const AnnouncerContext = createContext<Announce>(() => {});

/**
 * Região viva única (aria-live="polite") para resultado da busca, toasts e
 * "Mover para". Os anúncios do arrastar e soltar ficam com o @dnd-kit.
 */
export function LiveAnnouncerProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState({ text: '', key: 0 });
  const announce = useCallback<Announce>(
    (text) => setMessage((prev) => ({ text, key: prev.key + 1 })),
    [],
  );

  return (
    <AnnouncerContext.Provider value={announce}>
      {children}
      <div role="status" aria-live="polite" aria-atomic="true" className="visually-hidden">
        {/* Trocar a key recria o nó e força o leitor a repetir mensagens iguais. */}
        <span key={message.key}>{message.text}</span>
      </div>
    </AnnouncerContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAnnounce = () => useContext(AnnouncerContext);
