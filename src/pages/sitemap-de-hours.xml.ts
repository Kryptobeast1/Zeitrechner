import { urlset } from '../lib/sitemapXml';
import { deHoursPaths } from '../lib/sitemapUrls';
export async function GET() { return urlset(deHoursPaths()); }
