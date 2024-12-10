// src/actions/scrapeTwitterAction/scrapeTwitterAction.ts
import { Scraper } from "@the-convocation/twitter-scraper";
import {
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
    type Action,
} from "@ai16z/eliza";
import { Cookie } from "tough-cookie";

export const scrapeTwitterAction: Action = {
    name: "SCRAPE_TWITTER_POSTS",
    similes: [
        "SCRAPE_TWITTER",
    ],
    validate: async (_runtime: IAgentRuntime, _message: Memory) => {
        return true;
    },
    description:
        "Scrape Twitter posts from a specific URL.",
    handler: async (
        _runtime: IAgentRuntime,
        _message: Memory,
        _state: State,
        _options: { [key: string]: unknown; },
        _callback: HandlerCallback
    ): Promise<boolean> => {
        // Extract search term from message
        const searchTerm = _message.content?.text?.replace(/scrape twitter|for posts about|about|posts/gi, '').trim();
         
        

        console.log(`[Twitter Scraper] Search term: "${searchTerm}"`);

        if (!searchTerm) {
            console.log('[Twitter Scraper] No search term provided');
            _callback({
                text: "Please provide a search term for Twitter scraping.",
            });
            return true;
        }

        _callback({
            text: `Scraping Twitter posts about "${searchTerm}"...`
        });

        try {
            console.log('[Twitter Scraper] Initializing scraper...');
            const scraper = new Scraper();
            
            let authenticated = false;
            
            // Try cookie authentication first
            if (process.env.TWITTER_AUTH_TOKEN && process.env.TWITTER_CT0) {
                try {
                    console.log('[Twitter Scraper] Attempting cookie authentication...');
                    const cookies = [
                        new Cookie({
                            key: "auth_token",
                            value: process.env.TWITTER_AUTH_TOKEN,
                            domain: ".twitter.com"
                        }),
                        new Cookie({
                            key: "ct0",
                            value: process.env.TWITTER_CT0,
                            domain: ".twitter.com"
                        })
                    ];
                    
                    if (process.env.TWITTER_GUEST_ID) {
                        cookies.push(new Cookie({
                            key: "guest_id",
                            value: process.env.TWITTER_GUEST_ID,
                            domain: ".twitter.com"
                        }));
                    }
                    
                    await scraper.setCookies(cookies);
                    
                    // Verify authentication worked
                    authenticated = true;
                    console.log('[Twitter Scraper] Cookie authentication successful');
                } catch (cookieError) {
                    console.error('[Twitter Scraper] Cookie authentication failed:', cookieError);
                }
            } else {
                console.log('[Twitter Scraper] No cookie credentials found, skipping cookie auth');
            }

            // If cookies failed, try username/password login
            if (!authenticated) {
                if (!process.env.TWITTER_USERNAME || !process.env.TWITTER_PASSWORD) {
                    throw new Error('[Twitter Scraper] No authentication methods available - both cookies and login credentials are missing');
                }
                
                try {
                    console.log('[Twitter Scraper] Attempting username/password login...');
                    await scraper.login(process.env.TWITTER_USERNAME, process.env.TWITTER_PASSWORD);
                    authenticated = true;
                    console.log('[Twitter Scraper] Login authentication successful');
                } catch (loginError) {
                    console.error('[Twitter Scraper] Login authentication failed:', loginError);
                    throw loginError;
                }
            }

            if (!authenticated) {
                throw new Error('[Twitter Scraper] All authentication methods failed');
            }

            const tweets = [];
            const maxTweets = 5;

            console.log(`[Twitter Scraper] Starting search for: ${searchTerm}`);
            const searchIterator = scraper.searchTweets(searchTerm, maxTweets);
            
            // Collect up to 5 tweets
            for await (const tweet of searchIterator) {
                tweets.push(tweet.text);
                if (tweets.length >= 5) break;
            }

            if (tweets.length === 0) {
                _callback({
                    text: "No tweets found at the moment. Please try again later.",
                });
                return true;
            }

            // Format tweets with emojis and line breaks
            const formattedTweets = tweets.map((tweet, index) => {
                const emojis = ['🔥', '💫', '⭐', '🚀', '💎'];
                return `${emojis[index % emojis.length]} Tweet ${index + 1}:\n${tweet}`;
            });

            _callback({
                text: `Here are some recent tweets:\n\n${formattedTweets.join('\n\n')}`
            });

        } catch (error) {
            console.error('[Twitter Scraper] Error:', error);
            _callback({
                text: `Sorry, there was an error scraping Twitter posts: ${error.message}. Please try again later.`,
            });
        }

        return true;
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "Scrape Twitter for posts about jail" },
            },
            {
                user: "{{user2}}",
                content: { text: "I'll scrape the Twitter posts for you", action: "SCRAPE_TWITTER_POSTS" },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "Can you find recent tweets about Bitcoin?" },
            },
            {
                user: "{{user2}}",
                content: { text: "I'll search Twitter for posts about Bitcoin", action: "SCRAPE_TWITTER_POSTS" },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "What are people saying on Twitter about NFTs?" },
            },
            {
                user: "{{user2}}",
                content: { text: "Let me check Twitter for posts about NFTs", action: "SCRAPE_TWITTER_POSTS" },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "Search Twitter for Solana mentions" },
            },
            {
                user: "{{user2}}",
                content: { text: "I'll gather some recent tweets about Solana", action: "SCRAPE_TWITTER_POSTS" },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "Show me recent tweets about climate change" },
            },
            {
                user: "{{user2}}",
                content: { text: "I'll find some recent tweets about climate change", action: "SCRAPE_TWITTER_POSTS" },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "Get tweets about breaking news" },
            },
            {
                user: "{{user2}}",
                content: { text: "I'll search Twitter for breaking news posts", action: "SCRAPE_TWITTER_POSTS" },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "What's trending on Twitter right now?" },
            },
            {
                user: "{{user2}}",
                content: { text: "I'll scrape Twitter for trending topics", action: "SCRAPE_TWITTER_POSTS" },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "Find tweets about artificial intelligence" },
            },
            {
                user: "{{user2}}",
                content: { text: "I'll gather recent tweets about AI", action: "SCRAPE_TWITTER_POSTS" },
            },
        ],
    ] as ActionExample[][],
} as Action;