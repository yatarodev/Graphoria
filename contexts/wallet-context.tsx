"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { ConnectionProvider, WalletProvider, useWallet } from "@solana/wallet-adapter-react"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import { clusterApiUrl } from "@solana/web3.js"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"

// Import wallet adapter CSS
import "@solana/wallet-adapter-react-ui/styles.css"

// Define the wallet context type
interface WalletContextType {
  connected: boolean
  connecting: boolean
  disconnecting: boolean
  publicKey: string | null
  connectWallet: () => void
  disconnectWallet: () => void
  isLoading: boolean
  error: string | null
}

// Create the wallet context
const WalletContext = createContext<WalletContextType>({
  connected: false,
  connecting: false,
  disconnecting: false,
  publicKey: null,
  connectWallet: () => {},
  disconnectWallet: () => {},
  isLoading: false,
  error: null,
})

// Custom hook to use the wallet context
export const useWalletContext = () => useContext(WalletContext)

// Inner provider that uses the Solana wallet adapter hooks
function WalletContextInnerProvider({ children }: { children: ReactNode }) {
  const { connected, connecting, disconnecting, publicKey, select, disconnect, wallet, wallets } = useWallet()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Connect to wallet
  const connectWallet = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // If we have wallets, select the first one (usually Phantom)
      if (wallets.length > 0 && !wallet) {
        select(wallets[0].adapter.name)
      }
    } catch (err) {
      console.error("Failed to connect wallet:", err)
      setError("Failed to connect wallet. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Disconnect wallet
  const disconnectWallet = async () => {
    try {
      setIsLoading(true)
      setError(null)
      await disconnect()
    } catch (err) {
      console.error("Failed to disconnect wallet:", err)
      setError("Failed to disconnect wallet. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <WalletContext.Provider
      value={{
        connected,
        connecting,
        disconnecting,
        publicKey: publicKey ? publicKey.toString() : null,
        connectWallet,
        disconnectWallet,
        isLoading,
        error,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

// Main wallet provider that sets up the Solana connection and wallet adapters
export function WalletContextProvider({ children }: { children: ReactNode }) {
  // Set up network and endpoint
  const network = WalletAdapterNetwork.Mainnet
  const endpoint = clusterApiUrl(network)

  // Initialize wallet adapters - keeping only the most reliable ones
  const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()]

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletContextInnerProvider>{children}</WalletContextInnerProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
