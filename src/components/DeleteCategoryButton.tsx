"use client";

import { deleteCategoryFromClient } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { DeleteButton as ConfirmDeleteButton } from "@/components/DeleteButton";

interface DeleteButtonProps {
  id: string;
}

export function DeleteButton({ id }: DeleteButtonProps) {
  const router = useRouter();

  const handleDelete = async () => {
    try {
      await deleteCategoryFromClient(id);
      router.refresh();
    } catch {
      alert("Failed to delete category");
    }
  };

  return (
    <ConfirmDeleteButton
      onDelete={handleDelete}
      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
      idleLabel="Delete"
      confirmLabel="Confirm?"
    />
  );
}
