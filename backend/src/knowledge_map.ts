
export interface SourceInfo {
    domain: string;
    name: string;
    trustScore: number;
    isFlagged: boolean;
    category: 'Mainstream' | 'Alternative' | 'Satire' | 'Propaganda' | 'Social' | 'Unknown';
}

export const KNOWLEDGE_MAP: Record<string, SourceInfo> = {
    'nytimes.com': { domain: 'nytimes.com', name: 'The New York Times', trustScore: 95, isFlagged: false, category: 'Mainstream' },
    'reuters.com': { domain: 'reuters.com', name: 'Reuters', trustScore: 98, isFlagged: false, category: 'Mainstream' },
    'apnews.com': { domain: 'apnews.com', name: 'Associated Press', trustScore: 98, isFlagged: false, category: 'Mainstream' },
    'bbc.com': { domain: 'bbc.com', name: 'BBC News', trustScore: 94, isFlagged: false, category: 'Mainstream' },
    'theguardian.com': { domain: 'theguardian.com', name: 'The Guardian', trustScore: 92, isFlagged: false, category: 'Mainstream' },
    'npr.org': { domain: 'npr.org', name: 'NPR', trustScore: 93, isFlagged: false, category: 'Mainstream' },
    'wsj.com': { domain: 'wsj.com', name: 'Wall Street Journal', trustScore: 94, isFlagged: false, category: 'Mainstream' },
    'aljazeera.com': { domain: 'aljazeera.com', name: 'Al Jazeera', trustScore: 88, isFlagged: false, category: 'Mainstream' },
    'foxnews.com': { domain: 'foxnews.com', name: 'Fox News', trustScore: 70, isFlagged: false, category: 'Mainstream' },
    'cnn.com': { domain: 'cnn.com', name: 'CNN', trustScore: 75, isFlagged: false, category: 'Mainstream' },
    
    // Flagged or Satire
    'theonion.com': { domain: 'theonion.com', name: 'The Onion', trustScore: 10, isFlagged: true, category: 'Satire' },
    'worldnewsdailyreport.com': { domain: 'worldnewsdailyreport.com', name: 'World News Daily Report', trustScore: 5, isFlagged: true, category: 'Satire' },
    'infowars.com': { domain: 'infowars.com', name: 'InfoWars', trustScore: 15, isFlagged: true, category: 'Propaganda' },
    'breitbart.com': { domain: 'breitbart.com', name: 'Breitbart', trustScore: 40, isFlagged: true, category: 'Propaganda' },
    'rt.com': { domain: 'rt.com', name: 'RT (Russia Today)', trustScore: 35, isFlagged: true, category: 'Propaganda' },
    'yournewswire.com': { domain: 'yournewswire.com', name: 'YourNewsWire', trustScore: 10, isFlagged: true, category: 'Propaganda' },
    'naturalnews.com': { domain: 'naturalnews.com', name: 'Natural News', trustScore: 20, isFlagged: true, category: 'Propaganda' },
};

export const getSourceInfo = (url: string): SourceInfo => {
    try {
        const domain = new URL(url).hostname.replace('www.', '');
        return KNOWLEDGE_MAP[domain] || { domain, name: domain, trustScore: 50, isFlagged: false, category: 'Unknown' };
    } catch {
        // If not a URL, might be just a domain name or a string
        const domain = url.toLowerCase().replace('www.', '');
        return KNOWLEDGE_MAP[domain] || { domain, name: url, trustScore: 50, isFlagged: false, category: 'Unknown' };
    }
};
