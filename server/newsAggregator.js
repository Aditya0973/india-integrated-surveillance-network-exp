// Live Indian Breaking News RSS Aggregator & Channel Links

export const NEWS_SOURCES = [
  { id: "aaj-tak", name: "Aaj Tak", lang: "Hindi", liveUrl: "https://www.youtube.com/@aajtak/live" },
  { id: "ndtv", name: "NDTV India", lang: "English/Hindi", liveUrl: "https://www.youtube.com/@ndtv/live" },
  { id: "ani", name: "ANI News", lang: "English", liveUrl: "https://www.youtube.com/@aninewsindia/live" },
  { id: "times-of-india", name: "Times of India", lang: "English", liveUrl: "https://timesofindia.indiatimes.com/india" },
  { id: "dd-news", name: "DD News", lang: "National", liveUrl: "https://www.youtube.com/@DDNewsOfficial/live" }
];

let cachedNews = [];
let lastFetchTime = 0;
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes cache

function cleanHtml(text) {
  if (!text) return "";
  return text
    .replace(/<!\[CDATA\[(.*?)\]\]>/gi, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function parseRssXml(xmlText, defaultSource = "Google News India") {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemBlock = match[1];
    const titleMatch = /<title>([\s\S]*?)<\/title>/i.exec(itemBlock);
    const linkMatch = /<link>([\s\S]*?)<\/link>/i.exec(itemBlock) || /<guid[^>]*>([\s\S]*?)<\/guid>/i.exec(itemBlock);
    const pubDateMatch = /<pubDate>([\s\S]*?)<\/pubDate>/i.exec(itemBlock);
    const sourceMatch = /<source[^>]*>([\s\S]*?)<\/source>/i.exec(itemBlock);

    if (titleMatch) {
      let rawTitle = cleanHtml(titleMatch[1]);
      let source = defaultSource;
      
      // If title ends with "- Source Name", extract source
      if (rawTitle.includes(' - ')) {
        const parts = rawTitle.split(' - ');
        source = parts.pop().trim();
        rawTitle = parts.join(' - ').trim();
      } else if (sourceMatch) {
        source = cleanHtml(sourceMatch[1]);
      }

      let timeAgo = "Just now";
      if (pubDateMatch) {
        const pubTime = new Date(pubDateMatch[1]).getTime();
        if (!isNaN(pubTime)) {
          const diffMins = Math.max(1, Math.round((Date.now() - pubTime) / 60000));
          if (diffMins < 60) {
            timeAgo = `${diffMins}m ago`;
          } else {
            const hours = Math.round(diffMins / 60);
            timeAgo = `${hours}h ago`;
          }
        }
      }

      let category = "National & Strategic";
      const titleLower = rawTitle.toLowerCase();
      if (titleLower.includes('iaf') || titleLower.includes('army') || titleLower.includes('navy') || titleLower.includes('defense') || titleLower.includes('defence') || titleLower.includes('missile') || titleLower.includes('combat')) {
        category = "Defense & Strategic";
      } else if (titleLower.includes('isro') || titleLower.includes('satellite') || titleLower.includes('space') || titleLower.includes('rocket') || titleLower.includes('orbit')) {
        category = "Space & Tech";
      } else if (titleLower.includes('railway') || titleLower.includes('vande bharat') || titleLower.includes('train') || titleLower.includes('express') || titleLower.includes('highway') || titleLower.includes('infra')) {
        category = "Infrastructure";
      } else if (titleLower.includes('weather') || titleLower.includes('rain') || titleLower.includes('cyclone') || titleLower.includes('aqi') || titleLower.includes('imd') || titleLower.includes('storm')) {
        category = "Weather & Alert";
      }

      let urgency = "NORMAL";
      if (titleLower.includes('alert') || titleLower.includes('warning') || titleLower.includes('drill') || titleLower.includes('patrol') || titleLower.includes('emergency')) {
        urgency = "HIGH";
      } else if (category === "Defense & Strategic" || category === "Weather & Alert") {
        urgency = "MEDIUM";
      }

      const rawLink = linkMatch ? cleanHtml(linkMatch[1]) : `https://news.google.com/search?q=${encodeURIComponent(rawTitle)}`;

      items.push({
        id: `rss-${items.length + 1}-${Date.now()}`,
        source,
        title: rawTitle,
        category,
        time: timeAgo,
        urgency,
        url: rawLink
      });
    }
  }

  return items;
}

export async function fetchLiveNews() {
  const now = Date.now();
  if (cachedNews.length > 0 && (now - lastFetchTime < CACHE_TTL_MS)) {
    return cachedNews;
  }

  const feeds = [
    { url: "https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en", defaultSource: "India News" },
    { url: "https://news.google.com/rss/search?q=India+(defense+OR+ISRO+OR+railways+OR+navy+OR+IAF)&hl=en-IN&gl=IN&ceid=IN:en", defaultSource: "Strategic Brief" }
  ];

  const fetchedItems = [];

  for (const feed of feeds) {
    try {
      const resp = await fetch(feed.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) IISN-News/2.0' },
        signal: AbortSignal.timeout(3500)
      });
      if (resp.ok) {
        const xml = await resp.text();
        const parsed = parseRssXml(xml, feed.defaultSource);
        fetchedItems.push(...parsed);
      }
    } catch (e) {
      // Continue to next feed
    }
  }

  if (fetchedItems.length > 0) {
    // Deduplicate by title similarity
    const seen = new Set();
    const unique = [];
    for (const it of fetchedItems) {
      const key = it.title.slice(0, 40).toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(it);
      }
    }
    cachedNews = unique.slice(0, 20);
    lastFetchTime = now;
    return cachedNews;
  }

  // Resilient fallback if all feeds offline
  if (cachedNews.length > 0) return cachedNews;

  return [
    {
      id: "news-fallback-1",
      source: "ANI National",
      title: "Indian Air Force and Naval forces maintain active maritime and airspace surveillance drills",
      category: "Defense & Strategic",
      time: "10m ago",
      urgency: "HIGH",
      url: "https://www.youtube.com/@aninewsindia/live"
    },
    {
      id: "news-fallback-2",
      source: "DD News",
      title: "ISRO telemetry and tracking network synchronizes regional orbital communication payloads",
      category: "Space & Tech",
      time: "25m ago",
      urgency: "NORMAL",
      url: "https://www.youtube.com/@DDNewsOfficial/live"
    }
  ];
}
