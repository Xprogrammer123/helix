"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { UpgradeTrigger, UserProfile } from "@/lib/relay";
import { UpgradeModal } from "@/components/dashboard/UpgradeModal";

type PlanContextValue = {
  user: UserProfile | null;
  isPro: boolean;
  refreshUser: () => Promise<void>;
  openUpgrade: (trigger?: UpgradeTrigger) => void;
};

const PlanContext = createContext<PlanContextValue | null>(null);

export function PlanProvider({
  initialUser,
  children,
}: {
  initialUser: UserProfile | null;
  children: ReactNode;
}) {
  const [user, setUser] = useState<UserProfile | null>(initialUser);
  const [modalTrigger, setModalTrigger] = useState<UpgradeTrigger | null>(null);

  const refreshUser = useCallback(async () => {
    const res = await fetch("/api/me");
    if (res.ok) setUser((await res.json()) as UserProfile);
  }, []);

  const openUpgrade = useCallback((trigger: UpgradeTrigger = "general") => {
    setModalTrigger(trigger);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isPro: user?.isPro ?? false,
      refreshUser,
      openUpgrade,
    }),
    [user, refreshUser, openUpgrade]
  );

  return (
    <PlanContext.Provider value={value}>
      {children}
      <UpgradeModal
        open={modalTrigger !== null}
        trigger={modalTrigger ?? "general"}
        onClose={() => setModalTrigger(null)}
      />
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used within PlanProvider");
  return ctx;
}
