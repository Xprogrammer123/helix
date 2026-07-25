import { TunnelDetail } from "@/components/TunnelDetail";
import { getPublicRelayUrl } from "@/lib/relay";

export default async function TunnelPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const decoded = decodeURIComponent(name);

  return (
    <TunnelDetail name={decoded} publicBase={getPublicRelayUrl()} />
  );
}
