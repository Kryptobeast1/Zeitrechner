import { urlset } from '../lib/sitemapXml';
import { enHoursPaths } from '../lib/sitemapUrls';
export async function GET() { return urlset(enHoursPaths()); }
