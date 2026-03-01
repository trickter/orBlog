"use client";

import { useState } from "react";

interface DeletePostButtonProps {
  postId: string;
  session: string | null;
  onDelete: (id: string, session: string | null) => Promise<void>;
}

export function DeletePostButton({ postId, session, onDelete }: DeletePostButtonProps) {
  const [confirming, setConfirming] = useState(false);

  const handleClick = () => {
    if (confirming) {
      onDelete(postId, session);
    } else {
      setConfirming(true);
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
