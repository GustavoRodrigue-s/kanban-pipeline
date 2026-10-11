import { useId, useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { TrashIcon } from '@/components/Icons';
import { Modal } from '@/components/Modal';
import styles from './ConfirmDeleteDialog.module.css';

export interface ConfirmDialog {
  kind: 'confirm';
  id: string;
  title: string;
  session: number;
}

interface ConfirmDeleteDialogProps {
  dialog: ConfirmDialog | null;
  onClose: () => void;
  onConfirm: () => void;
}

/** T9 — confirmação de exclusão (alertdialog, foco inicial em Cancelar). */
export function ConfirmDeleteDialog({ dialog, onClose, onConfirm }: ConfirmDeleteDialogProps) {
  const [shown, setShown] = useState(dialog);
  if (dialog && dialog !== shown) setShown(dialog);

  const headingId = useId();
  const textId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <Modal
      open={dialog !== null}
      onClose={onClose}
      role="alertdialog"
      variant="confirm"
      labelledBy={headingId}
      describedBy={textId}
      initialFocusRef={cancelRef}
    >
      <div className={styles.icon} aria-hidden="true">
        <TrashIcon size={18} />
      </div>
      <h2 id={headingId} className={styles.heading}>
        Excluir &apos;{shown?.title}&apos;?
      </h2>
      <p id={textId} className={styles.text}>
        O card sai do quadro. Você pode desfazer logo em seguida.
      </p>
      <div className={styles.actions}>
        <Button ref={cancelRef} variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="danger" icon={<TrashIcon />} onClick={onConfirm}>
          Excluir card
        </Button>
      </div>
    </Modal>
  );
}
