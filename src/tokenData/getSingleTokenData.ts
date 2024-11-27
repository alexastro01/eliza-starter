import { Codex } from "@codex-data/sdk";

const sdk = new Codex(process.env.CODEX_API_KEY);

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

export async function getSingleTokenData(address: string, networkId: number = 1399811149) {
  console.log("\n📊 Fetching Token Data:");
  console.log(`🔍 Address: ${address}`);
  console.log(`🌐 Network ID: ${networkId}`);

  try {
    const tokenInfo = await sdk.queries.token({
      input: {
        address,
        networkId,
      },
    });

    const tokenPrice = await sdk.queries.getTokenPrices({
        inputs: {
            address: address,
            networkId: networkId,
        }
    })


    console.log("\n✅ Token Data Retrieved Successfully!");
    console.log("📝 Token Details:");
    console.log(`🔑 Symbol: ${tokenInfo.token.info.symbol}`);
    console.log(`🔑 Name: ${tokenInfo.token.info.name}`);
    console.log(`💰 Price: ${tokenPrice.getTokenPrices[0].priceUsd}`);
    console.log(`💰 Marketcap: $${formatLargeNumber(tokenPrice.getTokenPrices[0].priceUsd * Number(tokenInfo.token.info.totalSupply))}`);
    console.log(`📘 Telegram: ${tokenInfo.token.socialLinks.telegram}`);
    console.log(`🐦 Twitter: ${tokenInfo.token.socialLinks.twitter}`);

  
    // console.log(`💰 Price: ${tokenPrice.getTokenPrices}`);
    console.log("Full data token price")
    console.log(tokenPrice.getTokenPrices[0].priceUsd)
    return tokenInfo;
  } catch (error) {
    console.log("\n❌ Error Fetching Token Data:");
    console.error(`   ${error.message}`);
    throw error;
  }
}

// Example usage:
// getSingleTokenData("CBdCxKo9QavR9hfShgpEBG3zekorAeD7W1jfq2o3pump")
//   .then(data => console.log(data))
//   .catch(error => console.error(error));
