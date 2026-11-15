type AccountEmail = { to: string; url: string; kind: 'Verification' | 'Reset' };

export async function sendAccountEmail({ to, url, kind }: AccountEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[Kid dev only] ${kind} link for ${to}: ${url}`);
      return;
    }
    throw new Error('Account email transport is not configured');
  }
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from, to: [to], subject: kind === 'Reset' ? 'Reset your Kid password' : 'Verify your Kid email',
      text: `${kind === 'Reset' ? 'Reset your password' : 'Verify your email'}: ${url}`
    }),
    signal: AbortSignal.timeout(10_000)
  });
  if (!response.ok) throw new Error('Account email delivery failed');
}
