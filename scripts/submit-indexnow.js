import { allPageUrls } from './lib/sitemap-page-urls.mjs';

const API_KEY = 'f8cf921d7b304c45a6c117b1e8e2fa1e';
const HOST = 'zeit-rechner.com';

// IndexNow accepts up to 10,000 URLs per request.
const MAX_PER_REQUEST = 10000;

async function submitIndexNow() {
  try {
    let urls;
    try {
      urls = allPageUrls();
    } catch (e) {
      console.error(`[IndexNow] ${e.message}`);
      return;
    }

    if (urls.length === 0) {
      console.log('[IndexNow] No page URLs found to submit.');
      return;
    }

    console.log(`[IndexNow] Submitting ${urls.length} page URLs to IndexNow...`);

    for (let i = 0; i < urls.length; i += MAX_PER_REQUEST) {
      const batch = urls.slice(i, i + MAX_PER_REQUEST);
      const response = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          host: HOST,
          key: API_KEY,
          keyLocation: `https://${HOST}/${API_KEY}.txt`,
          urlList: batch,
        }),
      });

      if (response.ok) {
        console.log(`[IndexNow] Batch ${Math.floor(i / MAX_PER_REQUEST) + 1}: submitted ${batch.length} URLs (HTTP ${response.status}).`);
      } else {
        const text = await response.text();
        console.error(`[IndexNow] Batch failed with status ${response.status}: ${text}`);
      }
    }

    console.log('[IndexNow] Done.');
  } catch (error) {
    console.error('[IndexNow] Error submitting to IndexNow:', error);
  }
}

submitIndexNow();
