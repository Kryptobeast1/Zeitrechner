export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://zeit-rechner.com/sitemap.xml

# Disallow internal/admin paths
Disallow: /api/`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
