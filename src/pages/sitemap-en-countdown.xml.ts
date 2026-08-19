import { urlset } from '../lib/sitemapXml';
import { enCountdownPaths } from '../lib/sitemapUrls';
export async function GET() { return urlset(enCountdownPaths()); }
