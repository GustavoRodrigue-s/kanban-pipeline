import { useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Button, IconButton } from '@/components/Button';
import { CloseIcon, TrashIcon } from '@/components/Icons';
import { Modal } from '@/components/Modal';
import { TextField } from '@/components/TextField';
import fieldStyles from '@/components/TextField.module.css';
import { useAppSelector } from '@/store/hooks';
import { selectCardById } from './selectors';
import { STAGE_BY_ID } from './stages';
import type { Card } from './types';
import { DESCRIPTION_MAX, TITLE_MAX, validateCard, type CardFormValues } from './cardValidation';
import styles from './CardFormModal.module.css';

export type FormDialog =
  { kind: 'create'; session: number } | { kind: 'edit'; id: string; session: number };

interface CardFormModalProps {
  dialog: FormDialog | null;
  onClose: () => void;
  onSubmit: (values: CardFormValues) => void;
  onDelete: (id: string) => void;
}

/** T6/T7/T8 — "Novo card" e "Editar card". */
export function CardFormModal({ dialog, onClose, onSubmit, onDelete }: CardFormModalProps) {
  // Mantém o último conteúdo durante a animação de saída.
  const [shown, setShown] = useState(dialog);
  if (dialog && dialog !== shown) setShown(dialog);

  const editId = shown?.kind === 'edit' ? shown.id : '';
  const liveCard = useAppSelector((state) => selectCardById(state, editId));
  // Durante a saída o card pode já ter sido excluído: usa o último conhecido.
  const [lastCard, setLastCard] = useState(liveCard);
  if (liveCard && liveCard !== lastCard) setLastCard(liveCard);
  const card = liveCard ?? (lastCard?.id === editId ? lastCard : undefined);
  const headingId = useId();
  const titleRef = useRef<HTMLInputElement>(null);

  const isEdit = shown?.kind === 'edit';
  const ready = shown !== null && (!isEdit || card !== undefined);

  return (
    <Modal
      open={dialog !== null && ready}
      onClose={onClose}
      labelledBy={headingId}
      initialFocusRef={titleRef}
    >
      {ready && (
        <CardForm
          key={shown.session}
          headingId={headingId}
          titleRef={titleRef}
          card={isEdit ? card : undefined}
          onCancel={onClose}
          onSubmit={onSubmit}
          onDelete={onDelete}
        />
      )}
    </Modal>
  );
}

interface CardFormProps {
  headingId: string;
  titleRef: React.RefObject<HTMLInputElement | null>;
  card: Card | undefined;
  onCancel: () => void;
  onSubmit: (values: CardFormValues) => void;
  onDelete: (id: string) => void;
}

function CardForm({ headingId, titleRef, card, onCancel, onSubmit, onDelete }: CardFormProps) {
  const [title, setTitle] = useState(card?.title ?? '');
  const [description, setDescription] = useState(card?.description ?? '');
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const fieldId = useId();

  const errors = submitted ? validateCard({ title, description }) : {};
  const stage = card ? STAGE_BY_ID[card.columnId] : null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    const found = validateCard({ title, description });
    if (found.title) titleRef.current?.focus();
    else if (found.description) descriptionRef.current?.focus();
    else onSubmit({ title, description });
  };

  // Ctrl/Cmd + Enter salva a partir da descrição.
  const handleDescriptionKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  return (
    <form ref={formRef} className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.header}>
        <h2 id={headingId} className={styles.heading}>
          {card ? 'Editar card' : 'Novo card'}
        </h2>
        <IconButton label="Fechar" className={styles.close} onClick={onCancel}>
          <CloseIcon size={18} />
        </IconButton>
      </div>

      {stage && (
        <p className={styles.stage}>
          <span
            className={styles.stageRing}
            style={{ borderColor: `var(--color-stage-${stage.id})` }}
            aria-hidden="true"
          />
          <span className={styles.stageNum}>{stage.num}</span> {stage.name}
        </p>
      )}

      <TextField
        id={`${fieldId}-titulo`}
        ref={titleRef}
        label={
          <>
            Título<span aria-hidden="true">*</span>
          </>
        }
        required
        value={title}
        onValueChange={setTitle}
        limit={TITLE_MAX}
        error={errors.title}
      />

      <TextField
        id={`${fieldId}-descricao`}
        ref={descriptionRef}
        multiline
        label={
          <>
            Descrição <span className={fieldStyles.optional}>(opcional)</span>
          </>
        }
        value={description}
        onValueChange={setDescription}
        limit={DESCRIPTION_MAX}
        error={errors.description}
        onKeyDown={handleDescriptionKeyDown}
      />

      <div className={styles.footer}>
        {card && (
          <Button variant="danger-ghost" icon={<TrashIcon />} onClick={() => onDelete(card.id)}>
            Excluir
          </Button>
        )}
        <span className={styles.spacer} />
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="primary" type="submit">
          Salvar
        </Button>
      </div>
    </form>
  );
}
