# CoinMarketCap API Setup

## Why CoinMarketCap?
We switched from CoinGecko to CoinMarketCap because:
- ✅ Free tier with 10,000 API calls/month (333 calls/day)
- ✅ More reliable than CoinGecko's free tier
- ✅ Accurate token prices and market data
- ✅ No rate limiting issues on free tier
- ✅ Better data quality than DexScreener

## Get Your Free API Key

1. **Sign up at CoinMarketCap:**
   - Go to: https://pro.coinmarketcap.com/signup
   - Create a free account

2. **Get your API key:**
   - After signing up, go to: https://pro.coinmarketcap.com/account
   - Copy your API key from the dashboard

3. **Add to your project:**
   - Open `.env.local` in the project root
   - Replace the line:
     ```
     NEXT_PUBLIC_COINMARKETCAP_API_KEY=
     ```
   - With your actual key:
     ```
     NEXT_PUBLIC_COINMARKETCAP_API_KEY=your-api-key-here
     ```

4. **Restart the dev server:**
   ```bash
   npm run dev
   ```

## Free Tier Limits
- **10,000 calls/month** (about 333 per day)
- **1 call per second** rate limit
- **100 cryptocurrencies** per request

This is more than enough for development and even production use with proper caching!

## Alternative: Use Mock Data
If you don't want to sign up, the app will automatically use mock data with Bitcoin, Ethereum, and Solana prices. Just leave the API key empty.
