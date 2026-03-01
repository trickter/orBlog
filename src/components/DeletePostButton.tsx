"use client";

import { DeleteButton } from "@/components/DeleteButton";

interface DeletePostButtonProps {
  postId: string;
  session: string | null;
  onDelete: (id: string, session: string | null) => Promise<void>;
}

export function DeletePostButton({ postId, session, onDelete }: DeletePostButtonProps) {
  return (
    <DeleteButton onDelete={() => onDelete(postId, session)} />
  );
}
