"use client"

import { useState, useEffect } from "react"
import { usePageContext } from "@/contexts/page-context"

const PlayerCount = () => {
  const [playerCount, setPlayerCount] = useState(getRandomPlayerCount())
  const { currentPage } = usePageContext()

  function getRandomPlayerCount() {
    return Math.floor(Math.random() * (200 - 100 + 1)) + 100
  }

  function getSmallVariation() {
    // Generate a small random variation between -10 and +10
    return Math.floor(Math.random() * 21) - 10
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setPlayerCount((prevCount) => {
        // Calculate new count with small variation, keeping within 100-200 range
        let newCount = prevCount + getSmallVariation()

        // Ensure count stays within bounds
        if (newCount < 100) newCount = 100 + Math.floor(Math.random() * 10)
        if (newCount > 200) newCount = 200 - Math.floor(Math.random() * 10)

        return newCount
      })
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [])

  // Don't render if we're on the home page (it will be in the navbar)
  if (currentPage === "home") {
    return null
  }

  // Position based on current page
  const positionClass = currentPage === "game" ? "fixed bottom-4 left-24 z-40" : "fixed top-24 left-4 z-40"

  return (
    <div
      className={`${positionClass} flex items-center px-3 py-1 bg-black bg-opacity-70 rounded border border-primary`}
    >
      <span className="player-orb"></span>
      <span className="text-sm font-bold">
        <span className="text-secondary">{playerCount}</span> ONLINE
      </span>
    </div>
  )
}

export default PlayerCount
