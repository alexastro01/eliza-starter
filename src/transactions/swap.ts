import { Connection, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { getMint } from "@solana/spl-token";
import bs58 from 'bs58';

// Add transaction sender utility
async function transactionSenderAndConfirmationWaiter({
    connection,
    serializedTransaction,
    blockhashWithExpiryBlockHeight,
}: {
    connection: Connection;
    serializedTransaction: Buffer;
    blockhashWithExpiryBlockHeight: {
        blockhash: string;
        lastValidBlockHeight: number;
    };
}) {
    let done = false;
    let confirmationStrategy: any;
    const signaturePromise = (async () => {
        const signature = await connection.sendRawTransaction(serializedTransaction, {
            skipPreflight: true,
        });
        return signature;
    })();

    try {
        const signature = await signaturePromise;
        console.log('Transaction sent:', signature);

        confirmationStrategy = {
            signature,
            blockhash: blockhashWithExpiryBlockHeight.blockhash,
            lastValidBlockHeight: blockhashWithExpiryBlockHeight.lastValidBlockHeight,
        };

        const confirmation = await connection.confirmTransaction(confirmationStrategy);
        done = true;
        
        return await connection.getTransaction(signature, {
            maxSupportedTransactionVersion: 0,
        });
    } catch (e) {
        console.error('Error in transaction:', e);
        throw e;
    }
}

async function getTokenDecimals(connection: Connection, mintAddress: string): Promise<number> {
  const mint = await getMint(connection, new PublicKey(mintAddress));
  return mint.decimals;
}

export async function swapToken(
    connection: Connection,
    walletPublicKey: PublicKey,
    privateKeyBytes: Uint8Array,
    inputTokenCA: string,
    outputTokenCA: string,
    amount: number,
    slippageBps: number = 300,
): Promise<string> {
    console.log('\n=== Swap Request Details ===');
    console.log(`💰 Original Input: ${amount} ${inputTokenCA}`);

    // Get token decimals and adjust amount
    const decimals = await getTokenDecimals(connection, inputTokenCA);
    const adjustedAmount = Math.floor(amount * 10 ** decimals);
    
    console.log('\n=== Amount Calculations ===');
    console.log(`🔢 Token Decimals: ${decimals}`);
    console.log(`📊 Calculation: ${amount} × (10 ^ ${decimals}) = ${adjustedAmount}`);
    console.log(`🔍 For 0.01 SOL, this should be: 0.01 × (10^9) = 10,000,000 lamports`);

    // 1. Get Quote
    console.log('\n=== Attempting to get quote ===');
    console.log(`Input Token: ${inputTokenCA}`);
    console.log(`Output Token: ${outputTokenCA}`);
    console.log(`Amount: ${adjustedAmount}`);

    const quoteUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${inputTokenCA}&outputMint=${outputTokenCA}&amount=${adjustedAmount}&slippageBps=${slippageBps}`;
    console.log(`Quote URL: ${quoteUrl}`);

    const quoteResponse = await (await fetch(quoteUrl)).json();

    // Add error checking for quote response
    if (!quoteResponse || quoteResponse.error) {
        console.error('Quote Error:', quoteResponse.error || 'Invalid quote response');
        throw new Error('Failed to get quote: ' + (quoteResponse.error || 'Invalid response'));
    }

    console.log('\n=== Quote Response ===');
    console.log('Raw quote response:', JSON.stringify(quoteResponse, null, 2));
    console.log(`📥 Input: ${quoteResponse.inAmount / (10 ** decimals)} ${inputTokenCA}`);
    const outDecimals = await getTokenDecimals(connection, outputTokenCA);
    console.log(`📤 Output: ${quoteResponse.outAmount / (10 ** outDecimals)} ${outputTokenCA}`);
    console.log(`📊 Price Impact: ${quoteResponse.priceImpactPct}%`);

    // 2. Get swap transaction
    const swapObj = await (await fetch('https://quote-api.jup.ag/v6/swap', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            quoteResponse,
            userPublicKey: walletPublicKey.toString(),
            wrapAndUnwrapSol: true,
            dynamicComputeUnitLimit: true,
            prioritizationFeeLamports: {
                priorityLevelWithMaxLamports: {
                    maxLamports: 10000000,
                    priorityLevel: "veryHigh"
                }
            },
            dynamicSlippage: { maxBps: 300 }
        })
    })).json();

    // 3. Deserialize and sign
    console.log('\n=== Executing Swap ===');
    console.log('1️⃣ Deserializing transaction...');
    const swapTransactionBuf = Buffer.from(swapObj.swapTransaction, 'base64');
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

    console.log('2️⃣ Signing transaction...');
    transaction.sign([{
        publicKey: walletPublicKey,
        secretKey: privateKeyBytes
    }]);

    // 4. Simulate first
    console.log('3️⃣ Simulating transaction...');
    const { value: simulatedResponse } = await connection.simulateTransaction(transaction, {
        replaceRecentBlockhash: true,
        commitment: 'processed'
    });

    if (simulatedResponse.err) {
        console.error('Simulation Error:', simulatedResponse.err);
        console.log('Logs:', simulatedResponse.logs);
        throw new Error(`Simulation failed: ${simulatedResponse.err}`);
    }

    // 5. Send and confirm
    console.log('4️⃣ Sending transaction...');
    const serializedTransaction = Buffer.from(transaction.serialize());
    const blockhash = transaction.message.recentBlockhash;

    const txResponse = await transactionSenderAndConfirmationWaiter({
        connection,
        serializedTransaction,
        blockhashWithExpiryBlockHeight: {
            blockhash,
            lastValidBlockHeight: swapObj.lastValidBlockHeight,
        },
    });


    const signature = bs58.encode(transaction.signatures[0]);
    console.log('✅ Swap executed successfully!');
    console.log(`🔗 Transaction: https://solscan.io/tx/${signature}`);

    return signature;
}