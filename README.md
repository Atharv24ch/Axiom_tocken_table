# Token Discovery - Axiom Trade Pulse

A high-performance token trading interface built with Next.js 14, featuring real-time price updates, advanced sorting, virtualized rendering, and an intuitive trading modal. **Styled to match Axiom's dark trading interface.**

## 🚀 Features

- **Axiom-Inspired Dark Theme**: Professional trading interface with dark background, subtle borders, and blue accents
- **Tab Navigation**: New Pairs, Final Stretch, and Migrated token categories
- **Real-time Price Updates**: Mock WebSocket integration simulating live market data
- **Advanced Sorting**: Multi-column sorting with URL persistence (market cap, price, volume, liquidity, 24h change, creation date)
- **Virtualized Table**: Efficient rendering of large datasets using `react-virtuoso`
- **Search & Filters**: Instant search by token name/symbol with debouncing
- **Trading Modal**: Interactive buy/sell interface with double-click activation
- **Responsive Design**: Optimized for desktop and mobile viewports
- **Atomic Design Pattern**: Scalable component architecture (atoms → molecules → organisms)
- **Type-Safe**: Full TypeScript coverage with strict mode
- **State Management**: Redux Toolkit + React Query for optimal data handling
- **SSR Compatible**: Proper server-side rendering with client hydration

## 📦 Tech Stack

### Core Framework
- **Next.js 14.0.1** - React framework with App Router
- **React 19.0.0** - UI library with Server Components
- **TypeScript 5.x** - Static type checking

### Styling
- **Tailwind CSS 4.x** - Utility-first CSS framework
- **@tailwindcss/postcss** - PostCSS integration
- **class-variance-authority** - Variant styling utilities
- **tailwind-merge** - Conflicting class resolution

### State Management
- **Redux Toolkit 2.10.1** - Predictable state container
- **React Query 5.90.7** - Server state management (@tanstack/react-query)

### UI Components
- **Radix UI** - Unstyled, accessible primitives (Dialog, Popover, Tooltip, Select)
- **shadcn/ui 3.5.0** - Beautiful component system
- **lucide-react 0.553.0** - Icon library
- **react-virtuoso 4.14.1** - Virtualized list rendering

### Testing
- **Playwright 1.56.1** - End-to-end testing
- **Vitest** - Unit testing (configured)

### Development
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Geist Font** - Vercel's typeface

## 🛠️ Installation

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm/bun
- Git

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd token-trading-table
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Configure environment variables**
```bash
cp env.example .env.local
```

Edit `.env.local` with your settings:
```env
NEXT_PUBLIC_API_BASE_URL=https://api.coingecko.com/api/v3
NEXT_PUBLIC_ENABLE_WEBSOCKET=true
NEXT_PUBLIC_ENABLE_MOCK_DATA=true
NEXT_PUBLIC_WS_URL=wss://your-websocket-server.com
```

4. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server on `localhost:3000` |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint on codebase |
| `npm run test` | Run unit tests with Vitest |
| `npm run test:e2e` | Run end-to-end tests with Playwright |

## 🏗️ Project Structure

```
token-trading-table/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── page.tsx           # Homepage (TokenTable)
│   │   └── globals.css        # Global styles
│   │
│   ├── components/            # React components (Atomic Design)
│   │   ├── atoms/            # Basic building blocks
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Icon.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Label.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── Text.tsx
│   │   │
│   │   ├── molecules/        # Composite components
│   │   │   ├── FilterChip.tsx
│   │   │   ├── PriceDisplay.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── SkeletonRow.tsx
│   │   │   └── SortButton.tsx
│   │   │
│   │   ├── organisms/        # Complex components
│   │   │   ├── TableHeader.tsx
│   │   │   ├── TokenTable.tsx
│   │   │   ├── TokenTableRow.tsx
│   │   │   └── TradingModal.tsx
│   │   │
│   │   ├── providers/        # Context providers
│   │   │   └── AppProviders.tsx
│   │   │
│   │   └── ui/               # shadcn/ui components
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── popover.tsx
│   │       └── tooltip.tsx
│   │
│   ├── hooks/                # Custom React hooks
│   │   ├── useDebounce.ts    # Debounce input values
│   │   ├── useInfiniteScroll.ts  # Infinite scroll detection
│   │   ├── useMockPriceUpdates.ts  # Mock WebSocket integration
│   │   ├── useSortTable.ts   # Table sorting logic
│   │   ├── useTokens.ts      # Token data fetching
│   │   └── useWebSocket.ts   # WebSocket connection
│   │
│   ├── lib/                  # Utilities and clients
│   │   ├── api-client.ts     # CoinGecko API wrapper
│   │   ├── mock-ws.ts        # Mock WebSocket service
│   │   └── utils.ts          # Helper functions
│   │
│   ├── store/                # Redux store
│   │   ├── index.ts          # Store configuration
│   │   ├── hooks.ts          # Typed Redux hooks
│   │   └── slices/
│   │       ├── tokensSlice.ts  # Token state
│   │       └── uiSlice.ts      # UI state
│   │
│   ├── types/                # TypeScript definitions
│   │   ├── api.ts            # API response types
│   │   └── token.ts          # Token data types
│   │
│   └── constants/            # App constants
│       └── index.ts          # Feature flags, API URLs
│
├── tests/                    # Test suites
│   ├── e2e/                  # Playwright E2E tests
│   │   └── token-table.spec.ts
│   └── unit/                 # Vitest unit tests
│
├── public/                   # Static assets
├── .env.local                # Environment variables (gitignored)
├── env.example               # Environment template
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
├── playwright.config.ts      # Playwright configuration
└── package.json              # Dependencies and scripts
```

## 🎨 Component Architecture

### Atomic Design Pattern

**Atoms** (Basic UI elements)
- `Button`, `Input`, `Badge`, `Spinner`, `Label`, `Text`, `Icon`

**Molecules** (Simple composites)
- `SearchBar`: Debounced search input with clear button
- `PriceDisplay`: Formatted price with trend indicators
- `SortButton`: Column header with sort direction
- `FilterChip`: Removable filter tag
- `SkeletonRow`: Loading placeholder

**Organisms** (Complex features)
- `TokenTable`: Main table with virtualization, search, sort, filters
- `TokenTableRow`: Individual token row with interaction handlers
- `TableHeader`: Sortable column headers with tooltips
- `TradingModal`: Buy/sell interface with form validation

## 🔌 API Integration

### CoinGecko API
- Endpoint: `/coins/markets`
- Fetches top 100 tokens by market cap
- Refetches every 30 seconds
- Includes: price, volume, market cap, price change percentages

### Mock WebSocket
- Simulates real-time price updates
- Random ±1-5% price changes every 2-5 seconds
- Integrates with Redux to update token prices
- Enabled via `NEXT_PUBLIC_ENABLE_MOCK_DATA=true`

## 🧪 Testing

### E2E Tests (Playwright)
```bash
npm run test:e2e
```

Tests include:
- Homepage renders correctly
- Token table loads and displays data
- Search functionality works
- Sort functionality persists in URL
- Trading modal opens on double-click

### Unit Tests (Vitest)
```bash
npm run test
```

Test coverage includes:
- Hook logic (`useSortTable`, `useDebounce`)
- Utility functions (`formatNumber`, `formatCurrency`)
- Redux slices (actions, reducers)

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Build for production
```bash
npm run build
npm run start
```

### Environment Variables
Ensure these are set in your production environment:
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_WS_URL` (if using real WebSocket)
- `NEXT_PUBLIC_ENABLE_WEBSOCKET`
- `NEXT_PUBLIC_ENABLE_MOCK_DATA`

## 🐛 Troubleshooting

### Hydration Errors
If you see hydration mismatches, ensure:
- URL params are read client-side only (check `useSortTable`)
- No `localStorage`/`window` access during SSR
- Consistent data between server and client renders

### WebSocket Connection Issues
- Check `NEXT_PUBLIC_WS_URL` is correct
- Verify WebSocket server is running
- Enable mock data for development: `NEXT_PUBLIC_ENABLE_MOCK_DATA=true`

### Build Errors
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

## 📝 Development Guidelines

### Code Style
- Use TypeScript strict mode
- Follow Atomic Design pattern
- Prefer composition over inheritance
- Write self-documenting code with clear naming

### Component Guidelines
- Keep components small and focused
- Use custom hooks for logic extraction
- Leverage Radix UI for accessibility
- Implement proper loading and error states

### State Management
- Use Redux for global app state
- Use React Query for server state
- Keep component state local when possible
- Avoid prop drilling with context/providers

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'Add your feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - Component system
- [Radix UI](https://www.radix-ui.com/) - Accessible primitives
- [CoinGecko](https://www.coingecko.com/) - Crypto market data
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework

---

Built with ❤️ for Axiom Trade Pulse

## 🖼️ Screenshots

Below are a couple of screenshots taken from the running app (included in the `screenshots/` directory):

- Trending view

	![Trending view](screenshots/trending-view.png)

- Surge view

	![Surge view](screenshots/surge-view.png)
