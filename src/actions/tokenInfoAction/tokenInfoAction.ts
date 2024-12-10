import {
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
    type Action,
} from "@ai16z/eliza";
import { getSingleTokenData } from "../../tokenData/getSingleTokenData";

export const tokenInfoAction: Action = {
    name: "GET_TOKEN_INFO",
    similes: [
        "TOKEN_INFO",
        "GET_TOKEN_DETAILS",
    ],
    validate: async (_runtime: IAgentRuntime, message: Memory) => {
        // Check if the message contains a token address
        return message.content.text.includes("token") || message.content.text.includes("info");
    },
    description:
        "Get detailed information about a specific token using its address",
    handler: async (
        _runtime: IAgentRuntime,
        message: Memory,
        _state: State,
        _options: { [key: string]: unknown; },
        _callback: HandlerCallback
    ): Promise<boolean> => {
        _callback({
            text: "Fetching token information..."
        });

        try {
            // Extract token address from the message
            const words = message.content.text.split(' ');
            const address = words[words.findIndex(word => word.toLowerCase() === 'info') + 1];

            if (!address) {
                _callback({
                    text: "Please provide a token address to get information about.",
                });
                return true;
            }

            const tokenInfo = await getSingleTokenData(address);

            if (!tokenInfo || !tokenInfo.token) {
                _callback({
                    text: "Sorry, I couldn't find information for this token. Please verify the address and try again.",
                });
                return true;
            }

            const formattedMessage = `Here's the token information:\n` +
                `Symbol: ${tokenInfo.token.info.symbol}\n` +
                `Name: ${tokenInfo.token.info.name}\n` +
                `Telegram: ${tokenInfo.token.socialLinks.telegram}\n` +
                `Twitter: ${tokenInfo.token.socialLinks.twitter}`;

            _callback({
                text: formattedMessage
            });

        } catch (error) {
            console.error("Error fetching token info:", error);
            _callback({
                text: "Sorry, there was an error fetching the token information. Please try again later.",
            });
        }

        return true;
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "Get info for token address EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" },
            },
            {
                user: "{{user2}}",
                content: { text: "I'll fetch the token information for you", action: "GET_TOKEN_INFO" },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "What are the details of token EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v?" },
            },
            {
                user: "{{user2}}",
                content: { text: "Let me get that token information", action: "GET_TOKEN_INFO" },
            },
        ],
    ] as ActionExample[][],
} as Action;