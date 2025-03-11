"use client"

import { useState, useEffect } from "react"
import type { TileData } from "@/lib/game-types"

interface TileProps {
  tile: TileData
  isSelected: boolean
  isTargeted: boolean
  onClick: () => void
}

const Tile = ({ tile, isSelected, isTargeted, onClick }: TileProps) => {
  const [hover, setHover] = useState(false)
  const [pulseAnimation, setPulseAnimation] = useState(false)

  // Pulse animation when troops are added
  useEffect(() => {
    setPulseAnimation(true)
    const timer = setTimeout(() => setPulseAnimation(false), 500)
    return () => clearTimeout(timer)
  }, [tile.troops])

  const tileStyle = {
    left: `${tile.x}px`,
    top: `${tile.y}px`,
    width: `${tile.width}px`,
    height: `${tile.height}px`,
    backgroundColor: tile.visible ? `${tile.color}${hover ? "80" : "40"}` : "transparent",
    border: isSelected
      ? "2px solid white"
      : isTargeted
        ? "2px dashed red"
        : tile.visible
          ? `1px solid ${tile.color}`
          : "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    transform: `scale(${pulseAnimation ? 1.1 : 1})`,
  }

  return (
    <div
      className="absolute flex items-center justify-center"
      style={tileStyle}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {tile.visible && (
        <div className="relative">
          <div className="absolute -top-3 -right-3 bg-black text-white text-xs px-1 rounded-full">{tile.troops}</div>
        </div>
      )}
    </div>
  )
}

export default Tile
