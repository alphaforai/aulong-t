"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useInviteCodeStore } from "@/lib/store";

/** 从地址栏 ?inviteCode= 同步到全局 store */
export function InviteCodeFromUrlSync() {
  const searchParams = useSearchParams();
  const inviteFromUrl = searchParams.get("inviteCode");

  useEffect(() => {
    if (inviteFromUrl == null) return;
    const code = String(inviteFromUrl).trim();
    if (!code) return;
    useInviteCodeStore.getState().setInviteCode(code);
  }, [inviteFromUrl]);

  return null;
}
