import { DashboardHome } from "@/components/DashboardHome";
import { getPublicRelayUrl } from "@/lib/relay";

export default function DashboardPage() {
  return <DashboardHome publicBase={getPublicRelayUrl()} />;
}
