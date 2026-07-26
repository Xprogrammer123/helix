import { DashboardHome } from "@/components/DashboardHome";
import { ProOverviewBanner } from "@/components/dashboard/TunnelPassword";
import { getPublicRelayUrl } from "@/lib/relay";

export default function DashboardPage() {
  return (
    <>
      <ProOverviewBanner />
      <DashboardHome publicBase={getPublicRelayUrl()} />
    </>
  );
}
