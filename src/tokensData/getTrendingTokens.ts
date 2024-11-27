import { Codex } from "@codex-data/sdk";

const sdk = new Codex(process.env.CODEX_API_KEY);

function formatPercentage(value: number): string {
  return value ? `${(value * 100).toFixed(2)}%` : '0%';
}

function formatLargeNumber(num: number): string {
  if (num >= 1e9) {
    return `${(num / 1e9).toFixed(2)} Billion`;
  } else if (num >= 1e6) {
    return `${(num / 1e6).toFixed(2)} Million`;
  } else if (num >= 1e3) {
    return `${(num / 1e3).toFixed(2)} Thousand`;
  }
  return num.toFixed(2);
}

export async function getTrendingTokens(limit: number = 10, networkFilter: number[] = [1399811149], resolution: string = "1D") {
  try {
    const response = await sdk.queries.listTopTokens({
        limit,
        networkFilter,
        resolution,
    });

    const trendingTokensInfo = [];

    response.listTopTokens.forEach((token: any) => {
      if (!token.isScam) {
        const tokenInfo = [
          "\n🔹 Token Details:",
          `🔑 Address: ${token.address}`,
          `🔑 Name: ${token.name}`,
          `🔑 Symbol: ${token.symbol}`,
          `💰 Price: $${token.price.toFixed(6)}`,
          `📈 Price Change (1h): ${formatPercentage(token.priceChange1)}`,
          `📈 Price Change (4h): ${formatPercentage(token.priceChange4)}`,
          `📈 Price Change (12h): ${formatPercentage(token.priceChange12)}`,
          `📈 Price Change (24h): ${formatPercentage(token.priceChange24)}`,
          `📊 Volume: $${formatLargeNumber(parseFloat(token.volume))}`,
          `💰 Market Cap: $${formatLargeNumber(parseFloat(token.marketCap))}`
        ];

        // Still log to console for CLI users
        tokenInfo.forEach(line => console.log(line));
        
        // Add to our array
        trendingTokensInfo.push(tokenInfo.join('\n'));
      }
    });

    return trendingTokensInfo;

  } catch (error) {
    console.log("\n❌ Error Fetching Trending Tokens:");
    console.error(`   ${error.message}`);
    throw error;
  }
}

// Example usage:
// getTrendingTokens()
//   .then(() => console.log("Trending tokens fetched successfully"))
//   .catch(error => console.error(error));
