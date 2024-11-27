import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

export async function getWalletBalance(): Promise<number> {
    // Check if wallet public key is available
    if (!process.env.WALLET_PUBLIC_KEY) {
        throw new Error('WALLET_PUBLIC_KEY environment variable is not set');
    }

    try {
        // Initialize connection to Solana network (using mainnet by default)
        const connection = new Connection(
            process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
            'confirmed'
        );

        // Create PublicKey instance from the wallet address
        const publicKey = new PublicKey(process.env.WALLET_PUBLIC_KEY);

        // Get balance in lamports
        const balanceInLamports = await connection.getBalance(publicKey);

        // Convert lamports to SOL
        const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;

        return balanceInSOL;
    } catch (error) {
        throw new Error(`Failed to get wallet balance: ${error.message}`);
    }
}


