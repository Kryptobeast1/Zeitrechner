export default async function handler(request, response) {
  const API_KEY = 'f8cf921d7b304c45a6c117b1e8e2fa1e';
  const HOST = 'zeit-rechner.com';

  try {
    // 1. Fetch sitemap to extract URLs
    const sitemapUrl = `https://${HOST}/sitemap.xml`;
    const sitemapResponse = await fetch(sitemapUrl);
    
    if (!sitemapResponse.ok) {
      return response.status(500).json({ 
        success: false, 
        error: `Failed to fetch sitemap from ${sitemapUrl}` 
      });
    }

    const sitemapContent = await sitemapResponse.text();
    const urlMatches = sitemapContent.match(/<loc>(https?:\/\/[^<]+)<\/loc>/g) || [];
    const urls = urlMatches.map(m => m.replace(/<\/?loc>/g, '').trim());

    if (urls.length === 0) {
      return response.status(200).json({ 
        success: true, 
        message: 'No URLs found in sitemap.' 
      });
    }

    // 2. Submit to IndexNow API
    const indexNowResponse = await fetch('https://api.indexnow.org/indexnow', {
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

    if (indexNowResponse.ok) {
      return response.status(200).json({
        success: true,
        message: `Successfully submitted ${urls.length} URLs to IndexNow.`
      });
    } else {
      const errorText = await indexNowResponse.text();
      return response.status(indexNowResponse.status).json({
        success: false,
        error: errorText
      });
    }
  } catch (error) {
    return response.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
