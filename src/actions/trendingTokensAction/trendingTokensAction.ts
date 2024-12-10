import {
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
    type Action,
} from "@ai16z/eliza";
import { getTrendingTokens } from "../../tokensData/getTrendingTokens";

export const trendingTokensAction: Action = {
    name: "GET_TRENDING_TOKENS",
    similes: [
        "TRENDING_TOKENS",
    ],
    validate: async (_runtime: IAgentRuntime, _message: Memory) => {
        return true;
    },
    description:
        "Get the trending cryptocurrency tokens when a user asks about trending or popular tokens",
    handler: async (
        _runtime: IAgentRuntime,
        _message: Memory,
        _state: State,
        _options: { [key: string]: unknown; },
        _callback: HandlerCallback
    ): Promise<boolean> => {
        _callback({
            text: "Fetching trending tokens data..."
        });

        try {
            const trendingTokens = await getTrendingTokens();

            if (trendingTokens.length === 0) {
                _callback({
                    text: "Sorry, I couldn't fetch trending tokens data at the moment. Please try again later.",
                });
                return true;
            }

            _callback({
                text: ` Here are the trending tokens:\n\n${trendingTokens.join('\n\n')}`
            });

        } catch (error) {
            _callback({
                text: "Sorry, there was an error fetching trending tokens data. Please try again later.",
            });
        }

        return true;
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "What tokens are trending right now?" },
            },
            {
                user: "{{user2}}",
                content: { text: "I'll check the trending tokens for you", action: "GET_TRENDING_TOKENS" },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "Show me the popular tokens" },
            },
            {
                user: "{{user2}}",
                content: { text: "Let me fetch the trending tokens", action: "GET_TRENDING_TOKENS" },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "Which cryptocurrencies are hot right now?" },
            },
            {
                user: "{{user2}}",
                content: { text: "I'll get you the list of trending tokens", action: "GET_TRENDING_TOKENS" },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "What are the top performing tokens?" },
            },
            {
                user: "{{user2}}",
                content: { text: "I'll show you the trending tokens", action: "GET_TRENDING_TOKENS" },
            },
        ],
    ] as ActionExample[][],
} as Action; 