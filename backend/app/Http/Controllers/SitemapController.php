<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /**
     * GET /sitemap.xml — XML sitemap of public pages and active products.
     *
     * The frontend origin is configurable via the FRONTEND_URL env var; the
     * Laravel app itself usually serves /api but the sitemap must use the
     * canonical SPA host that is actually crawled.
     */
    public function __invoke(): Response
    {
        $base = rtrim(config('app.frontend_url', config('app.url')), '/');

        $staticPaths = [
            ['loc' => "{$base}/",          'priority' => '1.0', 'changefreq' => 'daily'],
            ['loc' => "{$base}/products",  'priority' => '0.9', 'changefreq' => 'daily'],
        ];

        // Pull active products in chunks so the sitemap scales beyond memory.
        $urls = collect($staticPaths);

        Product::query()
            ->where('is_active', true)
            ->orderBy('id')
            ->select(['slug', 'updated_at'])
            ->chunk(500, function ($chunk) use (&$urls, $base) {
                foreach ($chunk as $p) {
                    $urls->push([
                        'loc'        => "{$base}/products/".$p->slug,
                        'lastmod'    => optional($p->updated_at)->toAtomString(),
                        'priority'   => '0.7',
                        'changefreq' => 'weekly',
                    ]);
                }
            });

        $xml  = '<?xml version="1.0" encoding="UTF-8"?>'."\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";
        foreach ($urls as $u) {
            $xml .= "  <url>\n";
            $xml .= '    <loc>'.htmlspecialchars($u['loc'], ENT_XML1).'</loc>'."\n";
            if (! empty($u['lastmod'])) {
                $xml .= '    <lastmod>'.$u['lastmod'].'</lastmod>'."\n";
            }
            if (! empty($u['changefreq'])) {
                $xml .= '    <changefreq>'.$u['changefreq'].'</changefreq>'."\n";
            }
            if (! empty($u['priority'])) {
                $xml .= '    <priority>'.$u['priority'].'</priority>'."\n";
            }
            $xml .= "  </url>\n";
        }
        $xml .= '</urlset>'."\n";

        return response($xml, 200, [
            'Content-Type'  => 'application/xml; charset=UTF-8',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }
}
