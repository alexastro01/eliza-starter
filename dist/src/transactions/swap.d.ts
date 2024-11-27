import { Connection, PublicKey } from '@solana/web3.js';
export declare function swapToken(connection: Connection, walletPublicKey: PublicKey, privateKeyBytes: Uint8Array, inputTokenCA: string, outputTokenCA: string, amount: number, slippageBps?: number): Promise<string>;
