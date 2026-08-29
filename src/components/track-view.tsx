"use client";

import { useEffect } from "react";

export function TrackView({ templateId }: { templateId: string }) {
  useEffect(() => {
    void fetch(`/api/templates/${templateId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authorId: "viewer", trackView: true }),
    });
  }, [templateId]);
  return null;
}
