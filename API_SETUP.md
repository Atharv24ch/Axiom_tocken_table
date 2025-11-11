# Solana Token Data APIs

## Recommended API: Birdeye (Primary)

**Birdeye** is the best option for Solana token data with comprehensive metrics.

### Features:
- ✅ Solana-specific data
- ✅ Real-time price updates
- ✅ Volume, liquidity, market cap
- ✅ Price charts data
- ✅ Token holder counts
- ✅ Free tier: 100-500 calls/day

### Setup:
1. Go to [https://birdeye.so/](https://birdeye.so/)
2. Sign up for a free account
3. Navigate to [API Keys](https://docs.birdeye.so/docs/authentication-api-keys)
4. Generate your API key
5. Add to `.env.local`:
   ```
   NEXT_PUBLIC_BIRDEYE_API_KEY=your_key_here
   ```

### API Endpoints Used:
- `GET /defi/tokenlist` - Top tokens by 24h volume

---

## Fallback API: DexScreener (No Key Required)

If Birdeye API key is not provided, the app automatically falls back to **DexScreener**.

### Features:
- ✅ No API key required
- ✅ Free unlimited requests
- ✅ Solana DEX data
- ✅ Real-time prices from DEX pools
- ⚠️ Limited to DEX-traded tokens only

### Endpoints Used:
- `GET https://api.dexscreener.com/latest/dex/search?q=SOL`

---

## Alternative APIs (Not Currently Used)

### 1. Jupiter Aggregator API
- **Pros**: Best Solana swap data, real-time prices
- **Cons**: Limited to swappable tokens
- **Free**: Yes, no key required
- **URL**: https://price.jup.ag/v4/

### 2. Helius API
- **Pros**: Comprehensive Solana RPC + token data
- **Cons**: Complex setup, requires RPC endpoint
- **Free Tier**: 100,000 requests/month
- **URL**: https://helius.dev/

### 3. Solscan API
- **Pros**: Good for on-chain data
- **Cons**: Rate limited without paid plan
- **Free**: Limited
- **URL**: https://public-api.solscan.io/

---

## Current Implementation

The app uses a **waterfall approach**:

1. **Try Birdeye** (if API key exists)
   - Best data quality
   - Most metrics
   
2. **Fallback to DexScreener** (if Birdeye fails or no key)
   - Always available
   - Good enough for basic trading view
   
3. **Mock Data** (if all APIs fail)
   - Ensures app always loads
   - Shows sample SOL token

---

## Rate Limits

| API | Free Tier | Rate Limit |
|-----|-----------|------------|
| **Birdeye** | 100-500 calls/day | ~5 req/min |
| **DexScreener** | Unlimited | No official limit |
| **Jupiter** | Unlimited | Fair use |

---

## Recommendations

### For Development:
- Use **DexScreener** (no setup needed)
- Good enough for UI development

### For Production:
- Get **Birdeye API key** (free)
- Better data quality
- More metrics for advanced features
- DexScreener as automatic fallback

---

## Testing the APIs

To test if your API key works:

```bash
# Test Birdeye
curl -X GET "https://public-api.birdeye.so/defi/tokenlist?sort_by=v24hUSD&sort_type=desc&offset=0&limit=10" \
  -H "X-API-KEY: your_key_here"

# Test DexScreener (no key needed)
curl "https://api.dexscreener.com/latest/dex/search?q=SOL"
```

---

## Data Format

Both APIs are transformed to this unified format:

```typescript
interface TokenMarketResponse {
  id: string;                           // Token address
  symbol: string;                       // e.g., "SOL"
  name: string;                         // e.g., "Solana"
  image: string;                        // Logo URL
  current_price: number;                // USD price
  market_cap: number;                   // Market cap in USD
  market_cap_rank: number;              // Rank by volume
  total_volume: number;                 // 24h volume USD
  price_change_percentage_24h: number;  // 24h % change
  // ... other fields
}
```

This ensures the frontend works regardless of which API is active.
