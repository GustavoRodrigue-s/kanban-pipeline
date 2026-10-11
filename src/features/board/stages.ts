import type { ColumnId } from './types';

export interface StageMeta {
  id: ColumnId;
  num: string;
  name: string;
  /** Rótulo em minúsculas usado na barra de fluxo ("5 a fazer"). */
  legend: string;
}

export const STAGES: readonly StageMeta[] = [
  { id: 'todo', num: '01', name: 'A fazer', legend: 'a fazer' },
  { id: 'doing', num: '02', name: 'Fazendo', legend: 'fazendo' },
  { id: 'done', num: '03', name: 'Concluído', legend: 'concluídos' },
];

export const STAGE_BY_ID = Object.fromEntries(STAGES.map((s) => [s.id, s])) as Record<
  ColumnId,
  StageMeta
>;

/** "01 A fazer" */
export const stageLabel = (id: ColumnId) => `${STAGE_BY_ID[id].num} ${STAGE_BY_ID[id].name}`;
