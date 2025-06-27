
import { supabase } from '@/integrations/supabase/client';

const popularWebsites = [
  { url: 'https://google.com', title: 'Google', description: 'Search engine' },
  { url: 'https://youtube.com', title: 'YouTube', description: 'Video sharing platform' },
  { url: 'https://facebook.com', title: 'Facebook', description: 'Social networking service' },
  { url: 'https://twitter.com', title: 'Twitter', description: 'Social media platform' },
  { url: 'https://instagram.com', title: 'Instagram', description: 'Photo and video sharing' },
  { url: 'https://baidu.com', title: 'Baidu', description: 'Chinese search engine' },
  { url: 'https://wikipedia.org', title: 'Wikipedia', description: 'Free encyclopedia' },
  { url: 'https://yandex.ru', title: 'Yandex', description: 'Russian search engine' },
  { url: 'https://yahoo.com', title: 'Yahoo', description: 'Web services provider' },
  { url: 'https://whatsapp.com', title: 'WhatsApp', description: 'Messaging application' },
  { url: 'https://amazon.com', title: 'Amazon', description: 'E-commerce platform' },
  { url: 'https://tiktok.com', title: 'TikTok', description: 'Short-form video hosting' },
  { url: 'https://live.com', title: 'Microsoft Live', description: 'Microsoft web services' },
  { url: 'https://reddit.com', title: 'Reddit', description: 'Social news aggregation' },
  { url: 'https://zoom.us', title: 'Zoom', description: 'Video conferencing' },
  { url: 'https://discord.com', title: 'Discord', description: 'VoIP and instant messaging' },
  { url: 'https://linkedin.com', title: 'LinkedIn', description: 'Professional networking' },
  { url: 'https://netflix.com', title: 'Netflix', description: 'Streaming service' },
  { url: 'https://twitch.tv', title: 'Twitch', description: 'Live streaming platform' },
  { url: 'https://pinterest.com', title: 'Pinterest', description: 'Image sharing and discovery' },
  { url: 'https://microsoft.com', title: 'Microsoft', description: 'Technology corporation' },
  { url: 'https://office.com', title: 'Microsoft Office', description: 'Office suite' },
  { url: 'https://bing.com', title: 'Bing', description: 'Microsoft search engine' },
  { url: 'https://duckduckgo.com', title: 'DuckDuckGo', description: 'Privacy-focused search' },
  { url: 'https://ebay.com', title: 'eBay', description: 'Online auction platform' },
  { url: 'https://dropbox.com', title: 'Dropbox', description: 'Cloud storage service' },
  { url: 'https://apple.com', title: 'Apple', description: 'Technology company' },
  { url: 'https://github.com', title: 'GitHub', description: 'Code repository hosting' },
  { url: 'https://stackoverflow.com', title: 'Stack Overflow', description: 'Programming Q&A' },
  { url: 'https://medium.com', title: 'Medium', description: 'Publishing platform' },
  { url: 'https://paypal.com', title: 'PayPal', description: 'Online payment system' },
  { url: 'https://shopify.com', title: 'Shopify', description: 'E-commerce platform' },
  { url: 'https://wordpress.com', title: 'WordPress', description: 'Website creation platform' },
  { url: 'https://adobe.com', title: 'Adobe', description: 'Digital media software' },
  { url: 'https://salesforce.com', title: 'Salesforce', description: 'CRM platform' },
  { url: 'https://imgur.com', title: 'Imgur', description: 'Image hosting service' },
  { url: 'https://quora.com', title: 'Quora', description: 'Question-and-answer website' },
  { url: 'https://spotify.com', title: 'Spotify', description: 'Music streaming service' },
  { url: 'https://soundcloud.com', title: 'SoundCloud', description: 'Audio distribution platform' },
  { url: 'https://vimeo.com', title: 'Vimeo', description: 'Video hosting service' },
  { url: 'https://tumblr.com', title: 'Tumblr', description: 'Microblogging platform' },
  { url: 'https://flickr.com', title: 'Flickr', description: 'Image and video hosting' },
  { url: 'https://dailymotion.com', title: 'Dailymotion', description: 'Video sharing website' },
  { url: 'https://bitly.com', title: 'Bitly', description: 'URL shortening service' },
  { url: 'https://canva.com', title: 'Canva', description: 'Graphic design platform' },
  { url: 'https://mailchimp.com', title: 'Mailchimp', description: 'Email marketing service' },
  { url: 'https://trello.com', title: 'Trello', description: 'Project management tool' },
  { url: 'https://slack.com', title: 'Slack', description: 'Business communication platform' },
  { url: 'https://notion.so', title: 'Notion', description: 'Productivity and note-taking' },
  { url: 'https://figma.com', title: 'Figma', description: 'Design collaboration tool' },
  { url: 'https://airtable.com', title: 'Airtable', description: 'Cloud collaboration service' },
  { url: 'https://hubspot.com', title: 'HubSpot', description: 'CRM and marketing platform' },
  { url: 'https://zendesk.com', title: 'Zendesk', description: 'Customer service platform' },
  { url: 'https://atlassian.com', title: 'Atlassian', description: 'Software development tools' },
  { url: 'https://gitlab.com', title: 'GitLab', description: 'DevOps platform' },
  { url: 'https://bitbucket.org', title: 'Bitbucket', description: 'Git repository management' },
  { url: 'https://codepen.io', title: 'CodePen', description: 'Social development environment' },
  { url: 'https://dev.to', title: 'DEV Community', description: 'Programming community' },
  { url: 'https://hashnode.com', title: 'Hashnode', description: 'Blogging platform for developers' },
  { url: 'https://producthunt.com', title: 'Product Hunt', description: 'Product discovery platform' },
  { url: 'https://dribbble.com', title: 'Dribbble', description: 'Design community' },
  { url: 'https://behance.net', title: 'Behance', description: 'Creative portfolio platform' },
  { url: 'https://unsplash.com', title: 'Unsplash', description: 'Stock photography' },
  { url: 'https://pexels.com', title: 'Pexels', description: 'Free stock photos' },
  { url: 'https://shutterstock.com', title: 'Shutterstock', description: 'Stock media provider' },
  { url: 'https://coursera.org', title: 'Coursera', description: 'Online learning platform' },
  { url: 'https://udemy.com', title: 'Udemy', description: 'Online course marketplace' },
  { url: 'https://khanacademy.org', title: 'Khan Academy', description: 'Free online education' },
  { url: 'https://duolingo.com', title: 'Duolingo', description: 'Language learning platform' },
  { url: 'https://codecademy.com', title: 'Codecademy', description: 'Interactive coding platform' },
  { url: 'https://freecodecamp.org', title: 'freeCodeCamp', description: 'Learn to code for free' },
  { url: 'https://w3schools.com', title: 'W3Schools', description: 'Web development tutorials' },
  { url: 'https://mdn.mozilla.org', title: 'MDN Web Docs', description: 'Web technology documentation' },
  { url: 'https://css-tricks.com', title: 'CSS-Tricks', description: 'Web design and development' },
  { url: 'https://smashingmagazine.com', title: 'Smashing Magazine', description: 'Web design publication' },
  { url: 'https://aliexpress.com', title: 'AliExpress', description: 'Online retail service' },
  { url: 'https://wish.com', title: 'Wish', description: 'E-commerce platform' },
  { url: 'https://etsy.com', title: 'Etsy', description: 'Handmade and vintage items' },
  { url: 'https://booking.com', title: 'Booking.com', description: 'Travel booking website' },
  { url: 'https://airbnb.com', title: 'Airbnb', description: 'Vacation rental platform' },
  { url: 'https://tripadvisor.com', title: 'TripAdvisor', description: 'Travel guidance platform' },
  { url: 'https://expedia.com', title: 'Expedia', description: 'Travel booking website' },
  { url: 'https://skyscanner.com', title: 'Skyscanner', description: 'Flight comparison website' },
  { url: 'https://uber.com', title: 'Uber', description: 'Transportation platform' },
  { url: 'https://lyft.com', title: 'Lyft', description: 'Transportation network' },
  { url: 'https://doordash.com', title: 'DoorDash', description: 'Food delivery platform' },
  { url: 'https://grubhub.com', title: 'Grubhub', description: 'Food ordering and delivery' },
  { url: 'https://ubereats.com', title: 'Uber Eats', description: 'Food delivery service' },
  { url: 'https://yelp.com', title: 'Yelp', description: 'Business directory and reviews' },
  { url: 'https://foursquare.com', title: 'Foursquare', description: 'Location-based social network' },
  { url: 'https://glassdoor.com', title: 'Glassdoor', description: 'Job and company reviews' },
  { url: 'https://indeed.com', title: 'Indeed', description: 'Job search website' },
  { url: 'https://monster.com', title: 'Monster', description: 'Employment website' },
  { url: 'https://ziprecruiter.com', title: 'ZipRecruiter', description: 'Online employment marketplace' },
  { url: 'https://coinbase.com', title: 'Coinbase', description: 'Cryptocurrency exchange' },
  { url: 'https://binance.com', title: 'Binance', description: 'Cryptocurrency exchange' },
  { url: 'https://kraken.com', title: 'Kraken', description: 'Cryptocurrency exchange' },
  { url: 'https://robinhood.com', title: 'Robinhood', description: 'Commission-free trading' },
  { url: 'https://webull.com', title: 'Webull', description: 'Investment platform' },
  { url: 'https://mint.com', title: 'Mint', description: 'Personal finance management' },
  { url: 'https://creditkarma.com', title: 'Credit Karma', description: 'Free credit monitoring' },
  { url: 'https://nerdwallet.com', title: 'NerdWallet', description: 'Personal finance guidance' },
  { url: 'https://weather.com', title: 'Weather.com', description: 'Weather forecasting service' },
  { url: 'https://accuweather.com', title: 'AccuWeather', description: 'Weather forecasting service' },
  { url: 'https://cnn.com', title: 'CNN', description: 'News network' },
  { url: 'https://bbc.com', title: 'BBC', description: 'British broadcasting corporation' },
  { url: 'https://nytimes.com', title: 'The New York Times', description: 'Newspaper' },
  { url: 'https://theguardian.com', title: 'The Guardian', description: 'British daily newspaper' }
];

const tags = [
  'productivity', 'social', 'entertainment', 'education', 'technology', 
  'business', 'design', 'development', 'news', 'finance', 'travel', 
  'shopping', 'communication', 'streaming', 'search', 'cloud', 'tools'
];

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomTags(): string[] {
  const tagCount = Math.floor(Math.random() * 4) + 1; // 1-4 tags
  return getRandomElements(tags, tagCount);
}

export async function seedRandomBookmarks(userId: string) {
  console.log('Starting to seed 100 random bookmarks...');
  
  try {
    // Create 100 random bookmarks
    const bookmarksToInsert = [];
    
    for (let i = 0; i < 100; i++) {
      const randomSite = popularWebsites[Math.floor(Math.random() * popularWebsites.length)];
      const randomTags = getRandomTags();
      const isFavorite = Math.random() < 0.2; // 20% chance to be favorite
      
      bookmarksToInsert.push({
        user_id: userId,
        title: randomSite.title,
        url: randomSite.url,
        description: randomSite.description,
        tags: randomTags,
        is_favorite: isFavorite,
        favicon_url: `${new URL(randomSite.url).origin}/favicon.ico`
      });
    }
    
    // Insert bookmarks in batches of 10 to avoid potential limits
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < bookmarksToInsert.length; i += batchSize) {
      batches.push(bookmarksToInsert.slice(i, i + batchSize));
    }
    
    let totalInserted = 0;
    
    for (const batch of batches) {
      const { data, error } = await supabase
        .from('bookmarks')
        .insert(batch);
      
      if (error) {
        console.error('Error inserting batch:', error);
        throw error;
      }
      
      totalInserted += batch.length;
      console.log(`Inserted ${totalInserted}/100 bookmarks...`);
    }
    
    console.log('Successfully seeded 100 random bookmarks!');
    return { success: true, count: totalInserted };
    
  } catch (error) {
    console.error('Error seeding bookmarks:', error);
    return { success: false, error };
  }
}
