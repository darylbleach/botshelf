export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
        Check your inbox
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-[clamp(1.85rem,6vw,2.5rem)] font-bold tracking-tight">
        Magic link sent
      </h1>
      <p className="mt-3 text-[var(--fg-muted)]">
        {email ? (
          <>
            We sent a sign-in link to <span className="text-white">{email}</span>.
            Open it on this device to continue.
          </>
        ) : (
          <>We sent a sign-in link to your email. Open it to continue.</>
        )}
      </p>
      <p className="mt-4 text-sm text-[var(--fg-dim)]">
        Not in your inbox? Check Junk / Spam, then mark it as Not junk so future BotShelf
        sign-in emails land correctly.
      </p>
    </div>
  );
}
