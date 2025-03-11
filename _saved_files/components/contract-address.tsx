"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"

const ContractAddress = () => {
  const [copied, setCopied] = useState(false)

  // Placeholder contract address - replace with actual address later
  const contractAddress = "0x1234...5678"

  const copyToClipboard = () => {
    navigator.clipboard.writeText(contractAddress)
    setCopied(true)

    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <div className="flex justify-center my-12">
      <div className="bg-black bg-opacity-80 border-2 border-primary rounded-lg px-4 py-3 flex items-center space-x-2 max-w-md neon-box pulse-glow">
        <span className="text-primary font-bold mr-2">CA:</span>
        <span className="text-secondary truncate">{contractAddress}</span>
        <button
          onClick={copyToClipboard}
          className="ml-2 p-1.5 bg-primary bg-opacity-20 rounded hover:bg-opacity-40 transition-all"
          title="Copy contract address"
        >
          {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} className="text-primary" />}
        </button>
      </div>
    </div>
  )
}

export default ContractAddress
