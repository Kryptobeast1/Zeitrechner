import fs from 'fs';
import path from 'path';

const API_KEY = 'f8cf921d7b304c45a6c117b1e8e2fa1e';
const HOST = 'zeit-rechner.com';
const SITEMAP_PATH = path.join(process.cwd(), 'dist', 'sitemap.xml');

async function submitIndexNow() {
  try {
    // 1. Verify sitemap exists
    if (!fs.existsSync(SITEMAP_PATH)) {
      console.error(`[IndexNow] Sitemap not found at: ${SITEMAP_PATH}`);
      return;
    }

    // 2. Extract URLs from sitemap
    const sitemapContent = fs.readFileSync(SITEMAP_PATH, 'utf-8');
    const urlMatches = sitemapContent.match(/<loc>(https?:\/\/[^<]+)<\/loc>/g) || [];
    const urls = urlMatches.map(m => m.replace(/<\/?loc>/g, '').trim());

    if (urls.length === 0) {
      console.log('[IndexNow] No URLs found in sitemap to submit.');
      return;
    }

    console.log(`[IndexNow] Submitting ${urls.length} URLs to IndexNow...`);

    // 3. Post to IndexNow API
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        host: HOST,
        key: API_KEY,
        keyLocation: `https://${HOST}/${API_KEY}.txt`,
        urlList: urls
      })
    });

    if (response.ok) {
      console.log('[IndexNow] Successfully submitted URLs to IndexNow API!');
    } else {
      const text = await response.text();
      console.error(`[IndexNow] Submission failed with status ${response.status}: ${text}`);
    }
  } catch (error) {
    console.error('[IndexNow] Error submitting to IndexNow:', error);
  }
}

submitIndexNow();
