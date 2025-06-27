
interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  tags: string[];
  created_at: string;
}

export interface SmartCollection {
  id: string;
  title: string;
  bookmarks: Bookmark[];
  timeRange: {
    start: string;
    end: string;
  };
  confidence: number;
  type: 'temporal' | 'domain' | 'keyword';
  keywords: string[];
}

export class TemporalClustering {
  private static stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'how', 'what', 'when', 'where', 'why', 'which', 'who', 'this', 'that', 'these', 'those',
    'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must'
  ]);

  private static timeWindowHours = 4;
  private static minClusterSize = 3;

  public static generateSmartCollections(bookmarks: Bookmark[]): SmartCollection[] {
    const collections: SmartCollection[] = [];
    
    // Sort bookmarks by creation time
    const sortedBookmarks = [...bookmarks].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // Group by time windows
    const temporalClusters = this.createTemporalClusters(sortedBookmarks);
    
    // Process each cluster
    temporalClusters.forEach((cluster, index) => {
      if (cluster.length >= this.minClusterSize) {
        const collection = this.createSmartCollection(cluster, `temporal-${index}`);
        if (collection) {
          collections.push(collection);
        }
      }
    });

    // Sort collections by confidence score
    return collections.sort((a, b) => b.confidence - a.confidence);
  }

  private static createTemporalClusters(bookmarks: Bookmark[]): Bookmark[][] {
    const clusters: Bookmark[][] = [];
    let currentCluster: Bookmark[] = [];

    for (let i = 0; i < bookmarks.length; i++) {
      const bookmark = bookmarks[i];
      const bookmarkTime = new Date(bookmark.created_at).getTime();

      if (currentCluster.length === 0) {
        currentCluster = [bookmark];
      } else {
        const lastBookmarkTime = new Date(currentCluster[currentCluster.length - 1].created_at).getTime();
        const timeDiffHours = (bookmarkTime - lastBookmarkTime) / (1000 * 60 * 60);

        if (timeDiffHours <= this.timeWindowHours) {
          currentCluster.push(bookmark);
        } else {
          if (currentCluster.length >= this.minClusterSize) {
            clusters.push([...currentCluster]);
          }
          currentCluster = [bookmark];
        }
      }
    }

    // Don't forget the last cluster
    if (currentCluster.length >= this.minClusterSize) {
      clusters.push(currentCluster);
    }

    return clusters;
  }

  private static createSmartCollection(bookmarks: Bookmark[], id: string): SmartCollection | null {
    const keywords = this.extractKeywords(bookmarks);
    const domains = this.extractDomains(bookmarks);
    const title = this.generateCollectionTitle(keywords, domains, bookmarks);
    const confidence = this.calculateConfidence(keywords, domains, bookmarks);

    if (confidence < 0.3) {
      return null; // Skip low-confidence collections
    }

    const times = bookmarks.map(b => new Date(b.created_at).getTime());
    const timeRange = {
      start: bookmarks[0].created_at,
      end: bookmarks[bookmarks.length - 1].created_at
    };

    return {
      id,
      title,
      bookmarks,
      timeRange,
      confidence,
      type: this.determineCollectionType(keywords, domains),
      keywords: keywords.slice(0, 5) // Top 5 keywords
    };
  }

  private static extractKeywords(bookmarks: Bookmark[]): string[] {
    const wordCount: Record<string, number> = {};

    bookmarks.forEach(bookmark => {
      const text = `${bookmark.title} ${bookmark.description || ''} ${bookmark.tags.join(' ')}`;
      const words = text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2 && !this.stopWords.has(word));

      words.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1;
      });
    });

    return Object.entries(wordCount)
      .filter(([_, count]) => count >= 2)
      .sort(([_, a], [__, b]) => b - a)
      .map(([word]) => word);
  }

  private static extractDomains(bookmarks: Bookmark[]): string[] {
    const domainCount: Record<string, number> = {};

    bookmarks.forEach(bookmark => {
      try {
        const domain = new URL(bookmark.url).hostname.replace('www.', '');
        domainCount[domain] = (domainCount[domain] || 0) + 1;
      } catch {
        // Skip invalid URLs
      }
    });

    return Object.entries(domainCount)
      .filter(([_, count]) => count >= 2)
      .sort(([_, a], [__, b]) => b - a)
      .map(([domain]) => domain);
  }

  private static generateCollectionTitle(keywords: string[], domains: string[], bookmarks: Bookmark[]): string {
    // Check for programming/development patterns
    const devKeywords = ['react', 'javascript', 'python', 'tutorial', 'code', 'programming', 'development', 'api', 'github'];
    const hasDevKeywords = keywords.some(k => devKeywords.includes(k.toLowerCase()));
    
    if (hasDevKeywords) {
      const mainTech = keywords.find(k => ['react', 'javascript', 'python', 'vue', 'angular'].includes(k.toLowerCase()));
      return mainTech ? `${mainTech.charAt(0).toUpperCase() + mainTech.slice(1)} Development Session` : 'Development Research';
    }

    // Check for travel patterns
    const travelKeywords = ['travel', 'hotel', 'flight', 'vacation', 'trip', 'booking', 'airbnb'];
    const hasTravelKeywords = keywords.some(k => travelKeywords.includes(k.toLowerCase()));
    
    if (hasTravelKeywords) {
      const location = keywords.find(k => k.length > 4 && !travelKeywords.includes(k.toLowerCase()));
      return location ? `Travel Planning - ${location.charAt(0).toUpperCase() + location.slice(1)}` : 'Travel Research';
    }

    // Check for shopping patterns
    const shoppingDomains = ['amazon', 'ebay', 'etsy', 'shopify', 'aliexpress'];
    const hasShoppingDomains = domains.some(d => shoppingDomains.some(sd => d.includes(sd)));
    
    if (hasShoppingDomains) {
      return 'Shopping Research';
    }

    // Check for learning/education patterns
    const learningDomains = ['youtube', 'coursera', 'udemy', 'khan', 'edx'];
    const hasLearningDomains = domains.some(d => learningDomains.some(ld => d.includes(ld)));
    
    if (hasLearningDomains || keywords.includes('tutorial') || keywords.includes('course')) {
      const topic = keywords.find(k => !['tutorial', 'course', 'learn', 'how'].includes(k.toLowerCase()));
      return topic ? `Learning ${topic.charAt(0).toUpperCase() + topic.slice(1)}` : 'Learning Session';
    }

    // Check for single domain dominance
    if (domains.length > 0 && domains[0]) {
      const domainCount = bookmarks.filter(b => {
        try {
          return new URL(b.url).hostname.includes(domains[0]);
        } catch {
          return false;
        }
      }).length;
      
      if (domainCount >= bookmarks.length * 0.6) {
        const domainName = domains[0].split('.')[0];
        return `${domainName.charAt(0).toUpperCase() + domainName.slice(1)} Session`;
      }
    }

    // Default to top keywords
    if (keywords.length > 0) {
      const mainKeyword = keywords[0].charAt(0).toUpperCase() + keywords[0].slice(1);
      return `${mainKeyword} Research`;
    }

    return 'Research Session';
  }

  private static calculateConfidence(keywords: string[], domains: string[], bookmarks: Bookmark[]): number {
    let confidence = 0;

    // Higher confidence for more shared keywords
    const keywordScore = Math.min(keywords.length / 3, 1) * 0.4;
    
    // Higher confidence for domain clustering
    const domainScore = domains.length > 0 ? Math.min(domains.length / 2, 1) * 0.3 : 0;
    
    // Higher confidence for closer time grouping
    const times = bookmarks.map(b => new Date(b.created_at).getTime());
    const timeSpan = (Math.max(...times) - Math.min(...times)) / (1000 * 60 * 60); // hours
    const timeScore = Math.max(0, (6 - timeSpan) / 6) * 0.3;

    confidence = keywordScore + domainScore + timeScore;
    
    return Math.min(confidence, 1);
  }

  private static determineCollectionType(keywords: string[], domains: string[]): 'temporal' | 'domain' | 'keyword' {
    if (domains.length > 0 && domains.length >= keywords.length) {
      return 'domain';
    }
    if (keywords.length > 2) {
      return 'keyword';
    }
    return 'temporal';
  }
}
