import type { APIRoute } from 'astro';

const siteUrl = (import.meta.env.SITE_URL ?? import.meta.env.SITE ?? 'https://the-choice-protocol.teampoza.dev').replace(/\/$/, '');

export const GET: APIRoute = () => {
  return new Response(
    [
      'User-agent: *',
      'Allow: /',
      'Allow: /recomendaciones/anime',
      'Allow: /recomendaciones/peliculas',
      'Disallow: /api/',
      '',
      `Sitemap: ${siteUrl}/sitemap-index.xml`,
      '',
    ].join('\n'),
    {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    }
  );
};
