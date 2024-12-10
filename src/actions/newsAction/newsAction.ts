import {
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
    type Action,
} from "@ai16z/eliza";

export const newsAction: Action = {
    name: "GET_NEWS",
    similes: [
        "NEWS",
    ],
    validate: async (_runtime: IAgentRuntime, _message: Memory) => {
        return true;
    },
    description:
        "Get the latest news if a user asks for it",
    handler: async (
        _runtime: IAgentRuntime,
        _message: Memory,
        _state: State,
        _options: { [key: string]: unknown; },
        _callback: HandlerCallback

    ): Promise<boolean> => {

        _callback({
            text: "Fetching the latest crypto news..."
        })


        async function getCurrentNews(searchTerm: string) {
            try {
                console.log('👨‍💻 dev: Fetching news for search term:', searchTerm);
                const news = await fetch(`https://newsapi.org/v2/everything?q=${searchTerm}&from=2024-12-08&sortBy=publishedAt&apiKey=${process.env.NEWS_API_KEY}`)
                const data = await news.json()
                console.log('👨‍💻 dev: Successfully fetched news articles');
                return data
            } catch (error) {
                console.error('👨‍💻 dev: Error fetching news:', error);
                throw error;
            }
        }


        const news = await getCurrentNews("Crypto");

        if (news.length === 0) {
            _callback({
                text: "Sorry, I couldn't fetch the latest crypto news at the moment. Please try again later.",
            });
            return true;
        }

        _callback({
            text: `📰 Here are the latest crypto news articles:

1️⃣ ${news.articles[0].title}
📝 ${news.articles[0].description}
🔗 Read more: ${news.articles[0].url}

2️⃣ ${news.articles[1].title}
📝 ${news.articles[1].description}
🔗 Read more: ${news.articles[1].url}

3️⃣ ${news.articles[2].title}
📝 ${news.articles[2].description}
🔗 Read more: ${news.articles[2].url}

4️⃣ ${news.articles[3].title}
📝 ${news.articles[3].description}
🔗 Read more: ${news.articles[3].url}

5️⃣ ${news.articles[4].title}
📝 ${news.articles[4].description}
🔗 Read more: ${news.articles[4].url}`
        });

        return true;
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "What's the latest crypto news?" },
            },
            {
                user: "{{user2}}",
                content: { text: "Let me fetch that for you", action: "GET_NEWS" },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: {
                    text: "Can you tell me what's happening in crypto today?",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll get you the latest updates",
                    action: "GET_NEWS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Any big news in the crypto world?",

                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Let me check the latest headlines",
                    action: "GET_NEWS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "Update me on crypto news" },
            },
            {
                user: "{{user2}}",
                content: { text: "I'll pull up the recent news", action: "GET_NEWS" },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: { text: "What's happening in the markets?" },
            },
            {
                user: "{{user2}}",
                content: { text: "Let me get you the latest market news", action: "GET_NEWS" },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: { text: "Got any news updates?" },
            },
            {
                user: "{{user2}}",
                content: { text: "Sure, I'll fetch the latest news", action: "GET_NEWS" },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: { text: "What's new in crypto?" },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Let me check the latest headlines for you",
                    action: "GET_NEWS",
                },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: {
                    text: "Fill me in on the latest crypto news",

                },
            },
            {
                user: "{{user2}}",
                content: { text: "I'll get that information for you", action: "GET_NEWS" },
            },
        ],
    ] as ActionExample[][],
} as Action;