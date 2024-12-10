import {
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
    type Action,
} from "@ai16z/eliza";
import { Connection, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import { swapToken } from '../../transactions/swap';

export const swapAction: Action = {
    name: "SWAP_TOKENS",
    similes: [
        "SWAP",
        "EXCHANGE_TOKENS",
    ],
    validate: async (_runtime: IAgentRuntime, message: Memory) => {
        return message.content.text.toLowerCase().includes('swap');
    },
    description:
        "Swap one token for another on Solana",
    handler: async (
        _runtime: IAgentRuntime,
        message: Memory,
        _state: State,
        _options: { [key: string]: unknown; },
        _callback: HandlerCallback
    ): Promise<boolean> => {
        // Token address mapping
        const tokenAddresses = {
            "sol": "So11111111111111111111111111111111111111112",
            "usdc": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            "luce": "CBdCxKo9QavR9hfShgpEBG3zekorAeD7W1jfq2o3pump",
            "$1": "GHichsGq8aPnqJyz6Jp1ASTK4PNLpB5KrD6XrfDjpump",
            "wif": "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm"
        };

        try {
            const text = message.content.text.toLowerCase();
            const parts = text.split(' ');
            const amountIndex = parts.findIndex(p => !isNaN(parseFloat(p)));
            
            if (amountIndex === -1) {
                _callback({
                    text: "Please specify an amount to swap."
                });
                return true;
            }

            const amount = parseFloat(parts[amountIndex]);
            const fromToken = parts[amountIndex + 1];
            const toToken = parts[parts.length - 1];

            // Get addresses
            let fromTokenAddress = tokenAddresses[fromToken] || fromToken;
            let toTokenAddress = tokenAddresses[toToken] || toToken;

            // Validate addresses
            try {
                if (fromTokenAddress !== "sol") {
                    new PublicKey(fromTokenAddress);
                }
                new PublicKey(toTokenAddress);

                _callback({
                    text: `
💱 Processing Swap Request:
🪙 From Token: ${fromToken.toUpperCase()}
📤 Amount: ${amount}
📥 To Token: ${toToken.toUpperCase()}
                    `
                });

                const HELIUS_RPC = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;
                const connection = new Connection(HELIUS_RPC, {
                    commitment: 'confirmed',
                    confirmTransactionInitialTimeout: 60000,
                });
                
                const walletPublicKey = new PublicKey(process.env.WALLET_PUBLIC_KEY);
                const privateKeyBytes = bs58.decode(process.env.WALLET_PRIVATE_KEY);

                const txid = await swapToken(
                    connection,
                    walletPublicKey,
                    privateKeyBytes,
                    fromTokenAddress,
                    toTokenAddress,
                    amount,
                    100  // 1% slippage
                );

                _callback({
                    text: `
✅ Swap completed successfully!
🔗 Transaction ID: ${txid}
View on Solscan: https://solscan.io/tx/${txid}
                    `
                });

            } catch (error) {
                _callback({
                    text: `❌ Invalid token address format. Please use a valid Solana token address or one of the supported tokens: ${Object.keys(tokenAddresses).join(', ')}`
                });
                return true;
            }

        } catch (error) {
            console.error("Swap error:", error);
            _callback({
                text: "❌ Sorry, there was an error processing the swap. Please try again later."
            });
        }

        return true;
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "Swap 1 SOL to USDC" },
            },
            {
                user: "{{user2}}",
                content: { text: "I'll help you swap your tokens", action: "SWAP_TOKENS" },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "Exchange 0.5 USDC for SOL" },
            },
            {
                user: "{{user2}}",
                content: { text: "I'll process the token swap for you", action: "SWAP_TOKENS" },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "Can you swap 2 WIF to USDC?" },
            },
            {
                user: "{{user2}}",
                content: { text: "I'll execute the swap transaction", action: "SWAP_TOKENS" },
            },
        ],
    ] as ActionExample[][],
} as Action;
