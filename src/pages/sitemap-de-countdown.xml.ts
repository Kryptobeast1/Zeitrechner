import { urlset } from '../lib/sitemapXml';
import { deCountdownPaths } from '../lib/sitemapUrls';
export async function GET() { return urlset(deCountdownPaths()); }
