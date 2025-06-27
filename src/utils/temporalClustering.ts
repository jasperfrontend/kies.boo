interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  favicon_url?: string;
  tags: string[];
  is_favorite: boolean;
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
  type: 'temporal' | 'domain' | 'keyword' | 'tag';
  keywords: string[];
}

export class TemporalClustering {
  private static stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'how', 'what', 'when', 'where', 'why', 'which', 'who', 'this', 'that', 'these', 'those',
    'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must'
  ]);

  private static timeWindowHours = 6; // Increased to allow more flexibility
  private static minClusterSize = 3;
  private static minContentSimilarity = 0.4; // Minimum similarity score required

  public static generateSmartCollections(bookmarks: Bookmark[]): SmartCollection[] {
    const collections: SmartCollection[] = [];
    
    // Sort bookmarks by creation time
    const sortedBookmarks = [...bookmarks].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // Group by time windows first
    const temporalClusters = this.createTemporalClusters(sortedBookmarks);
    
    // Process each cluster and apply content similarity filtering
    temporalClusters.forEach((cluster, index) => {
      if (cluster.length >= this.minClusterSize) {
        // Filter cluster by content similarity
        const filteredClusters = this.filterByContentSimilarity(cluster);
        
        filteredClusters.forEach((filteredCluster, subIndex) => {
          if (filteredCluster.length >= this.minClusterSize) {
            const collection = this.createSmartCollection(
              filteredCluster, 
              `collection-${index}-${subIndex}`
            );
            if (collection) {
              collections.push(collection);
            }
          }
        });
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

  private static filterByContentSimilarity(cluster: Bookmark[]): Bookmark[][] {
    const filteredClusters: Bookmark[][] = [];
    const used = new Set<string>();

    for (let i = 0; i < cluster.length; i++) {
      if (used.has(cluster[i].id)) continue;

      const similarGroup: Bookmark[] = [cluster[i]];
      used.add(cluster[i].id);

      for (let j = i + 1; j < cluster.length; j++) {
        if (used.has(cluster[j].id)) continue;

        const similarity = this.calculateSimilarity(cluster[i], cluster[j]);
        if (similarity >= this.minContentSimilarity) {
          similarGroup.push(cluster[j]);
          used.add(cluster[j].id);
        }
      }

      // Only keep groups that have meaningful similarity
      if (similarGroup.length >= this.minClusterSize) {
        filteredClusters.push(similarGroup);
      }
    }

    return filteredClusters;
  }

  private static calculateSimilarity(bookmark1: Bookmark, bookmark2: Bookmark): number {
    let similarity = 0;

    // Tag similarity (highest weight - 50%)
    const tagSimilarity = this.calculateTagSimilarity(bookmark1.tags, bookmark2.tags);
    similarity += tagSimilarity * 0.5;

    // Domain similarity (20%)
    const domainSimilarity = this.calculateDomainSimilarity(bookmark1.url, bookmark2.url);
    similarity += domainSimilarity * 0.2;

    // Keyword similarity from titles and descriptions (20%)
    const keywordSimilarity = this.calculateKeywordSimilarity(bookmark1, bookmark2);
    similarity += keywordSimilarity * 0.2;

    // URL path similarity (10%)
    const urlSimilarity = this.calculateUrlSimilarity(bookmark1.url, bookmark2.url);
    similarity += urlSimilarity * 0.1;

    return Math.min(similarity, 1);
  }

  private static calculateTagSimilarity(tags1: string[], tags2: string[]): number {
    if (tags1.length === 0 && tags2.length === 0) return 0;
    if (tags1.length === 0 || tags2.length === 0) return 0;

    const set1 = new Set(tags1.map(tag => tag.toLowerCase()));
    const set2 = new Set(tags2.map(tag => tag.toLowerCase()));
    
    const intersection = new Set([...set1].filter(tag => set2.has(tag)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }

  private static calculateDomainSimilarity(url1: string, url2: string): number {
    try {
      const domain1 = new URL(url1).hostname.replace('www.', '');
      const domain2 = new URL(url2).hostname.replace('www.', '');
      return domain1 === domain2 ? 1 : 0;
    } catch {
      return 0;
    }
  }

  private static calculateKeywordSimilarity(bookmark1: Bookmark, bookmark2: Bookmark): number {
    const text1 = `${bookmark1.title} ${bookmark1.description || ''}`.toLowerCase();
    const text2 = `${bookmark2.title} ${bookmark2.description || ''}`.toLowerCase();
    
    const words1 = new Set(text1.replace(/[^\w\s]/g, ' ').split(/\s+/)
      .filter(word => word.length > 2 && !this.stopWords.has(word)));
    const words2 = new Set(text2.replace(/[^\w\s]/g, ' ').split(/\s+/)
      .filter(word => word.length > 2 && !this.stopWords.has(word)));

    if (words1.size === 0 && words2.size === 0) return 0;
    if (words1.size === 0 || words2.size === 0) return 0;

    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  private static calculateUrlSimilarity(url1: string, url2: string): number {
    try {
      const path1 = new URL(url1).pathname.split('/').filter(p => p.length > 0);
      const path2 = new URL(url2).pathname.split('/').filter(p => p.length > 0);
      
      if (path1.length === 0 && path2.length === 0) return 1;
      if (path1.length === 0 || path2.length === 0) return 0;

      const commonSegments = Math.min(path1.length, path2.length);
      let matches = 0;
      
      for (let i = 0; i < commonSegments; i++) {
        if (path1[i] === path2[i]) matches++;
      }
      
      return matches / Math.max(path1.length, path2.length);
    } catch {
      return 0;
    }
  }

  private static createSmartCollection(bookmarks: Bookmark[], id: string): SmartCollection | null {
    const keywords = this.extractKeywords(bookmarks);
    const domains = this.extractDomains(bookmarks);
    const tags = this.extractCommonTags(bookmarks);
    const title = this.generateCollectionTitle(keywords, domains, tags, bookmarks);
    const confidence = this.calculateConfidence(keywords, domains, tags, bookmarks);

    // Increased minimum confidence threshold
    if (confidence < 0.5) {
      return null;
    }

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
      type: this.determineCollectionType(keywords, domains, tags),
      keywords: keywords.slice(0, 5)
    };
  }

  private static extractCommonTags(bookmarks: Bookmark[]): string[] {
    const tagCount: Record<string, number> = {};

    bookmarks.forEach(bookmark => {
      bookmark.tags.forEach(tag => {
        const lowerTag = tag.toLowerCase();
        tagCount[lowerTag] = (tagCount[lowerTag] || 0) + 1;
      });
    });

    return Object.entries(tagCount)
      .filter(([_, count]) => count >= 2) // Tag must appear in at least 2 bookmarks
      .sort(([_, a], [__, b]) => b - a)
      .map(([tag]) => tag);
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

  private static generateCollectionTitle(keywords: string[], domains: string[], tags: string[], bookmarks: Bookmark[]): string {
    // Prioritize common tags for title generation
    if (tags.length > 0) {
      const mainTag = tags[0].charAt(0).toUpperCase() + tags[0].slice(1);
      
      // Check for travel patterns in tags
      if (tags.some(tag => ['travel', 'trip', 'vacation', 'tourism'].includes(tag.toLowerCase()))) {
        const location = tags.find(tag => 
          !['travel', 'trip', 'vacation', 'tourism', 'planning', 'research'].includes(tag.toLowerCase())
        );
        return location ? `Travel Planning - ${location.charAt(0).toUpperCase() + location.slice(1)}` : 'Travel Research';
      }
      
      // Check for development patterns in tags
      if (tags.some(tag => ['programming', 'development', 'coding', 'tutorial', 'react', 'javascript', 'python'].includes(tag.toLowerCase()))) {
        const techTag = tags.find(tag => ['react', 'javascript', 'python', 'vue', 'angular', 'node'].includes(tag.toLowerCase()));
        return techTag ? `${techTag.charAt(0).toUpperCase() + techTag.slice(1)} Development` : 'Development Research';
      }
      
      return `${mainTag} Collection`;
    }

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

  private static calculateConfidence(keywords: string[], domains: string[], tags: string[], bookmarks: Bookmark[]): number {
    let confidence = 0;

    // Tag similarity is now the highest contributor (40%)
    const tagScore = tags.length > 0 ? Math.min(tags.length / 2, 1) * 0.4 : 0;
    
    // Keyword similarity (25%)
    const keywordScore = Math.min(keywords.length / 3, 1) * 0.25;
    
    // Domain clustering (20%)
    const domainScore = domains.length > 0 ? Math.min(domains.length / 2, 1) * 0.2 : 0;
    
    // Time clustering (15% - reduced importance)
    const times = bookmarks.map(b => new Date(b.created_at).getTime());
    const timeSpan = (Math.max(...times) - Math.min(...times)) / (1000 * 60 * 60); // hours
    const timeScore = Math.max(0, (8 - timeSpan) / 8) * 0.15;

    confidence = tagScore + keywordScore + domainScore + timeScore;
    
    return Math.min(confidence, 1);
  }

  private static determineCollectionType(keywords: string[], domains: string[], tags: string[]): 'temporal' | 'domain' | 'keyword' | 'tag' {
    if (tags.length > 0) {
      return 'tag';
    }
    if (domains.length > 0 && domains.length >= keywords.length) {
      return 'domain';
    }
    if (keywords.length > 2) {
      return 'keyword';
    }
    return 'temporal';
  }
}
