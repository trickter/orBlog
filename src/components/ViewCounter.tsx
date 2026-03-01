"use client";

import { incrementViewCount } from "@/lib/actions";
import { useEffect } from "react";

interface ViewCounterProps {
  postId: string;
}

export function ViewCounter({ postId }: ViewCounterProps) {
  useEffect(() => {
    // Only increment on actual page view, not prefetch
    incrementViewCount(postId);
  }, [postId]);

  return null;
}
