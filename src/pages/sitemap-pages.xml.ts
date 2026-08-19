import { urlset } from '../lib/sitemapXml';
import { pagePaths } from '../lib/sitemapUrls';
export async function GET() { return urlset(pagePaths()); }
