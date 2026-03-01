"use client";

import { useState } from "react";

interface DeleteButtonProps {
  onDelete: () => void;
}

export function DeleteButton({ onDelete }: DeleteButtonProps) {
  const [confirming, setConfirming] = useState(false);

  const handleClick = () => {
    if (confirming) {
      onDelete();
    } else {
      setConfirming(true);
      // Auto-reset after 3 seconds
      setTimeout(() => setConfirming(false), 3000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-red-600 hover:text-red-700"
    >
      {confirming ? "Confirm?" : "Delete"}
    </button>
  );
}
