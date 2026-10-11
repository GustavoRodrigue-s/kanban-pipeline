# Etapa 2 — Seletores e persistência (requisitos)

> Só requisitos. O desenho, a implementação e os testes são seus.
> Spec de origem: §2.2 (RF04, RF05), §3 (RNF08), §7.1, §7.4 e §9.2.

## Seletores (`src/features/board/selectors.ts`)

Hoje o arquivo tem **stubs** que devolvem valores vazios — por isso o quadro aparece vazio
mesmo depois do `boardSlice` pronto.

### Requisitos

1. **Lista da coluna**: os cards de uma coluna, na ordem do estado.
2. **Lista filtrada**: só os cards cujo `title` **ou** `description` contêm o termo de busca,
   **ignorando acentos e maiúsculas** ("foco" encontra "Fóco" e "FOCO"). Espaços nas pontas
   do termo não contam. Sem termo, é igual à lista da coluna.
3. **Contadores por coluna**: total (ignora a busca) e filtrado.
4. **Está filtrando?**: verdadeiro quando há termo (ignorando espaços).
5. **Card por id**: o card ou `undefined`.
6. **Memoização** (RNF08): com o mesmo estado, os seletores derivados devolvem **a mesma
   referência** — senão todos os cards re-renderizam a cada ação. Atenção às três colunas
   chamando o mesmo seletor com argumentos diferentes.
7. O seletor não deve normalizar o mesmo texto do card a cada chamada se nada mudou (bônus).

### Contrato que a UI usa hoje

Se mudar uma assinatura, ajuste estes pontos de chamada:

| Seletor (stub atual)                                               | Usado em                                                            |
| ------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `selectFilteredColumnCards(state, columnId): Card[]`               | `Board.tsx` (3×), `BoardUiContext.tsx` (card seguinte após excluir) |
| `selectColumnCards(state, columnId): Card[]`                       | `BoardUiContext.tsx` ("Mover para" → fim da coluna)                 |
| `selectColumnCounts(state): Record<ColumnId, { total; filtered }>` | `Board.tsx`, `FlowBar.tsx`, `StageSelector.tsx`                     |
| `selectIsFiltering(state): boolean`                                | `Board.tsx`                                                         |
| `selectCardById(state, id): Card \| undefined`                     | `Card.tsx`, `Board.tsx`, `CardFormModal.tsx`, `BoardUiContext.tsx`  |

### Testes esperados (spec §9.2 / §9.3)

- T-10: filtro ignora acentos e caixa.
- Contadores com e sem busca.
- Memoização: mesma referência se o estado não mudou.

## Persistência (`src/store/persistence.ts` + `listenerMiddleware`)

### Requisitos

1. Chave do `localStorage`: **`kanban:v1`**.
2. Formato versionado: `{ "version": 1, "data": BoardState }`.
3. **Escrita** disparada por mudanças no quadro, com **throttle de ~300 ms**, via
   `listenerMiddleware` do RTK (ou `store.subscribe`).
4. **Só o quadro** é persistido. O termo de busca **não** (RF04).
5. **Hidratação defensiva** ao iniciar: JSON inválido, versão desconhecida, formato inesperado
   ou `localStorage` indisponível/lançando erro (modo privado, cota) → começa com o quadro
   vazio, faz `console.warn` e **não quebra** a aplicação.
6. Erro ao **gravar** (cota cheia) também não pode quebrar o app.
7. A hidratação usa a action `boardHydrated` (Etapa 1) ou o `preloadedState` do `setupStore`.
8. Componentes não sabem que o `localStorage` existe (§7.1).

### Testes esperados

- Salva, hidrata, JSON inválido, versão desconhecida, `localStorage` lançando erro (§9.2).
- T-08: o estado sobrevive a um "reload" (re-render com o mesmo `localStorage`).
- T-11: dado corrompido → quadro vazio, sem crash.
