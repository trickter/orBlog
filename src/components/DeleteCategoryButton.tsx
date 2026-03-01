"use client";

import { deleteCategoryFromClient } from "@/lib/actions";
import { useRouter } from "next/navigation";

interface DeleteButtonProps {
  id: string;
}

export function DeleteButton({ id }: DeleteButtonProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      await deleteCategoryFromClient(id);
      router.refresh();
    } catch (error) {
      alert("Failed to delete category");
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
    >
      Delete
    </button>
  );
}
