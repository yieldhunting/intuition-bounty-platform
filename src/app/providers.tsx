'use client'

  import { RainbowKitProvider, getDefaultConfig } from
  '@rainbow-me/rainbowkit'
  import { WagmiProvider } from 'wagmi'
  import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
  import { Chain } from 'viem'

  // Correct Intuition testnet configuration
  const intuitionTestnet: Chain = {
    id: 13579,
    name: 'Intuition Testnet',
    nativeCurrency: { name: 'tTRUST', symbol: 'tTRUST', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://testnet.rpc.intuition.systems/http'] },
      public: { http: ['https://testnet.rpc.intuition.systems/http'] },
    },
    blockExplorers: {
      default: { name: 'Intuition Explorer', url:
  'https://explorer-testnet.intuition.systems' },
    },
    testnet: true,
  }

  const config = getDefaultConfig({
    appName: 'Intuition Bounty Board',
    projectId: 'bounty-board-demo',
    chains: [intuitionTestnet],
  })

  const queryClient = new QueryClient()

  export function Providers({ children }: { children: React.ReactNode }) {
    return (
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    )
  }
