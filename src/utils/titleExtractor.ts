
interface TitleExtractionResult {
  title: string;
  source: 'pattern' | 'api' | 'fallback';
}

export class TitleExtractor {
  private static patterns = [
    // YouTube patterns
    {
      regex: /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
      handler: (url: string, match: RegExpMatchArray) => {
        const videoId = match[1];
        return `YouTube Video (${videoId})`;
      }
    },
    // Stack Overflow patterns
    {
      regex: /stackoverflow\.com\/questions\/(\d+)\/([^/?]+)/,
      handler: (url: string, match: RegExpMatchArray) => {
        const title = match[2].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return title;
      }
    },
    // GitHub patterns
    {
      regex: /github\.com\/([^/]+)\/([^/?]+)/,
      handler: (url: string, match: RegExpMatchArray) => {
        return `${match[1]}/${match[2]} - GitHub`;
      }
    },
    // Reddit patterns
    {
      regex: /reddit\.com\/r\/([^/]+)\/comments\/[^/]+\/([^/?]+)/,
      handler: (url: string, match: RegExpMatchArray) => {
        const title = match[2].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return `${title} - r/${match[1]}`;
      }
    },
    // Medium patterns
    {
      regex: /medium\.com\/.*\/([^/?]+)-[a-f0-9]+$/,
      handler: (url: string, match: RegExpMatchArray) => {
        return match[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
    },
    // Twitter/X patterns
    {
      regex: /(?:twitter\.com|x\.com)\/([^/]+)\/status\/(\d+)/,
      handler: (url: string, match: RegExpMatchArray) => {
        return `Tweet by @${match[1]}`;
      }
    },
    // LinkedIn patterns
    {
      regex: /linkedin\.com\/.*\/([^/?]+)/,
      handler: (url: string, match: RegExpMatchArray) => {
        const title = match[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return `${title} - LinkedIn`;
      }
    },
    // Dev.to patterns
    {
      regex: /dev\.to\/([^/]+)\/([^/?]+)/,
      handler: (url: string, match: RegExpMatchArray) => {
        const title = match[2].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return title;
      }
    },
    // Hacker News patterns
    {
      regex: /news\.ycombinator\.com\/item\?id=(\d+)/,
      handler: (url: string, match: RegExpMatchArray) => {
        return `Hacker News Discussion (${match[1]})`;
      }
    }
  ];

  public static async extractTitle(url: string): Promise<TitleExtractionResult> {
    try {
      const normalizedUrl = this.normalizeUrl(url);
      
      // First try pattern matching for known sites
      const patternResult = this.tryPatternMatching(normalizedUrl);
      if (patternResult) {
        return { title: patternResult, source: 'pattern' };
      }

      // Try a simple, reliable title extraction API that doesn't require CORS
      const apiResult = await this.tryTitleApi(normalizedUrl);
      if (apiResult) {
        return { title: apiResult, source: 'api' };
      }

      // Fallback to smart domain-based title
      const fallbackTitle = this.generateSmartFallback(normalizedUrl);
      return { title: fallbackTitle, source: 'fallback' };

    } catch (error) {
      console.log('Title extraction failed:', error);
      const fallbackTitle = this.generateSmartFallback(url);
      return { title: fallbackTitle, source: 'fallback' };
    }
  }

  private static normalizeUrl(url: string): string {
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    return normalizedUrl;
  }

  private static tryPatternMatching(url: string): string | null {
    for (const pattern of this.patterns) {
      const match = url.match(pattern.regex);
      if (match) {
        return pattern.handler(url, match);
      }
    }
    return null;
  }

  private static async tryTitleApi(url: string): Promise<string | null> {
    try {
      // Using a different approach - try to use a title extraction service that doesn't have CORS issues
      const response = await fetch(`https://jsonlink.io/api/extract?url=${encodeURIComponent(url)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.title && data.title.trim()) {
          let title = data.title.trim();
          // Clean up common title suffixes
          title = title.replace(/ - YouTube$/, '');
          title = title.replace(/ \| [^|]+$/, '');
          title = title.replace(/ :: [^:]+$/, '');
          if (title.length > 100) {
            title = title.substring(0, 100) + '...';
          }
          return title;
        }
      }
    } catch (error) {
      console.log('Title API failed:', error);
    }
    return null;
  }

  private static generateSmartFallback(url: string): string {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.replace('www.', '');
      const pathname = urlObj.pathname;

      // Handle special cases for better fallback titles
      if (hostname.includes('youtube.com')) {
        const videoIdMatch = url.match(/[?&]v=([^&]+)/);
        if (videoIdMatch) {
          return `YouTube Video (${videoIdMatch[1]})`;
        }
        return 'YouTube Video';
      }

      if (hostname.includes('stackoverflow.com')) {
        const parts = pathname.split('/').filter(Boolean);
        if (parts.length >= 3 && parts[0] === 'questions') {
          const titlePart = parts[2].replace(/-/g, ' ');
          const words = titlePart.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          );
          return words.join(' ') + ' - Stack Overflow';
        }
        return 'Stack Overflow Question';
      }

      if (hostname.includes('github.com')) {
        const parts = pathname.split('/').filter(Boolean);
        if (parts.length >= 2) {
          return `${parts[0]}/${parts[1]} - GitHub`;
        }
        return 'GitHub Repository';
      }

      // Generic fallback: capitalize domain name
      const domainParts = hostname.split('.');
      const mainDomain = domainParts[domainParts.length - 2] || hostname;
      return mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1);

    } catch (error) {
      return 'Bookmark';
    }
  }
}
