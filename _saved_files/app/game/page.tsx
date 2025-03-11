"use client"

import { useState, useEffect } from "react"
import GameBoard from "@/components/game/game-board"

export default function GamePage() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">Loading Game...</h1>
          <div className="animate-pulse">Please wait</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <GameBoard />
      {/* No Back to Home button here */}
    </div>
  )
}
