import { StudioClient } from "@/components/studio-client";

export const dynamic = "force-dynamic";

export default async function StudioPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <StudioClient />
    </div>
  );
}
