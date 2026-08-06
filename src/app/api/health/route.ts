export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return Response.json({ ok: true, timestamp: new Date().toISOString() });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
