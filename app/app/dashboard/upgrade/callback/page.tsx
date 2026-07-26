import { Suspense } from "react";
import UpgradeCallbackClient from "./callback-client";

export default function UpgradeCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <span className="size-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </div>
      }
    >
      <UpgradeCallbackClient />
    </Suspense>
  );
}
