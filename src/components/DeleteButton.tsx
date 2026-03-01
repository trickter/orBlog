'use client';

import { useState } from 'react';

interface DeleteButtonProps {
  onDelete: () => void | Promise<void>;
  idleLabel?: string;
  confirmLabel?: string;
  className?: string;
}

export function DeleteButton({
  onDelete,
  idleLabel = 'Delete',
  confirmLabel = 'Confirm?',
  className = 'text-red-600 hover:text-red-700',
}: DeleteButtonProps) {
  const [confirming, setConfirming] = useState(false);

  const handleClick = () => {
    if (confirming) {
      void onDelete();
    } else {
      setConfirming(true);
      // Auto-reset after 3 seconds
      setTimeout(() => setConfirming(false), 3000);
    }
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      {confirming ? confirmLabel : idleLabel}
    </button>
  );
}
