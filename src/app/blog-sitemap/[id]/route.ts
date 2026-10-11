type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const { id: rawId } = await params;
  if (!/^\d+$/.test(rawId) || Number(rawId) < 1 || Number(rawId) > 100) {
    return new Response("Not found", { status: 404 });
  }

  return new Response("Generated article sitemaps are temporarily disabled pending editorial review.", {
    status: 410,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400"
    }
  });
}
