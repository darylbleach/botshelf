"use client";

import { useEffect } from "react";

export function ConfirmPurchase({ sessionId }: { sessionId: string }) {
  useEffect(() => {
    void fetch("/api/purchases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
  }, [sessionId]);

  return null;
}
