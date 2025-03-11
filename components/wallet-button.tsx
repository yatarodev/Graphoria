"use client"

import { useState } from "react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { useWalletContext } from "@/contexts/wallet-context"
import { Wallet, LogOut, Loader2 } from "lucide-react"

export default function WalletButton() {
  const { connected, connecting, disconnecting, publicKey, disconnectWallet, isLoading, error } = useWalletContext()
  const { setVisible } = useWalletModal()
  const [showTooltip, setShowTooltip] = useState(false)

  // Format the public key for display (first 4 and last 4 characters)
  const formatPublicKey = (key: string) => {
    return `${key.slice(0, 4)}...${key.slice(-4)}`
  }

  // Handle connect click
  const handleConnectClick = () => {
    setVisible(true)
  }

  // Handle disconnect click
  const handleDisconnectClick = () => {
    disconnectWallet()
  }

  // Show error tooltip
  const handleErrorHover = () => {
    setShowTooltip(true)
  }

  // Hide error tooltip
  const handleErrorLeave = () => {
    setShowTooltip(false)
  }

  return (
    <div className="relative">
      {!connected ? (
        <button
          onClick={handleConnectClick}
          disabled={connecting || isLoading}
          className="pixel-button neon-button-primary flex items-center space-x-2"
        >
          {connecting || isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>CONNECTING...</span>
            </>
          ) : (
            <>
              <Wallet size={16} />
              <span>CONNECT WALLET</span>
            </>
          )}
        </button>
      ) : (
        <div className="flex items-center space-x-2">
          <div className="bg-black bg-opacity-70 px-3 py-2 rounded border border-primary text-sm">
            <div className="flex items-center space-x-2">
              <Wallet size={16} className="text-primary" />
              <span className="text-primary">{formatPublicKey(publicKey || "")}</span>
            </div>
          </div>
          <button
            onClick={handleDisconnectClick}
            disabled={disconnecting || isLoading}
            className="pixel-button bg-destructive text-destructive-foreground flex items-center p-2"
            title="Disconnect wallet"
          >
            {disconnecting || isLoading ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
          </button>
        </div>
      )}

      {error && (
        <div className="relative" onMouseEnter={handleErrorHover} onMouseLeave={handleErrorLeave}>
          <div className="absolute right-0 mt-2 w-4 h-4 bg-destructive rounded-full flex items-center justify-center text-xs text-white cursor-help">
            !
          </div>
          {showTooltip && (
            <div className="absolute right-0 mt-6 w-64 p-2 bg-black border border-destructive rounded text-xs z-50">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
