"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import type { Socket } from "socket.io-client"
import { v4 as uuidv4 } from "uuid"
import Tile from "./tile"
import CombatModal from "./combat-modal"
import { generateTileGrid, getAdjacentTiles } from "@/lib/game-utils"
import type { TileData, Player, CombatData } from "@/lib/game-types"

const GameBoard = () => {
  const [tiles, setTiles] = useState<TileData[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [selectedTile, setSelectedTile] = useState<TileData | null>(null)
  const [targetTile, setTargetTile] = useState<TileData | null>(null)
  const [showCombat, setShowCombat] = useState(false)
  const [combatData, setCombatData] = useState<CombatData | null>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [loading, setLoading] = useState(true)
  const socketRef = useRef<Socket | null>(null)
  const playerIdRef = useRef<string>(
    typeof window !== "undefined" ? localStorage.getItem("playerId") || uuidv4() : uuidv4(),
  )
  const router = useRouter()

  // Map panning state
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const mapContainerRef = useRef<HTMLDivElement>(null)

  // Initialize game
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Save player ID to localStorage
      const playerId = playerIdRef.current
      localStorage.setItem("playerId", playerId)

      // Generate initial tile grid
      const initialTiles = generateTileGrid(10, 10, 800, 800)
      setTiles(initialTiles)
      setLoading(false)

      // Setup mock multiplayer with simulated players
      const mockPlayers: Player[] = [
        {
          id: playerId,
          name: "You",
          color: "#00BFFF", // Cyan
          ownedTiles: [],
          troops: 10,
        },
        {
          id: "ai-1",
          name: "RedKnight",
          color: "#FF4500", // Red-orange
          ownedTiles: [],
          troops: 10,
          isAI: true,
        },
        {
          id: "ai-2",
          name: "GoldRush",
          color: "#FFD700", // Gold
          ownedTiles: [],
          troops: 10,
          isAI: true,
        },
        {
          id: "ai-3",
          name: "PurpleDragon",
          color: "#9370DB", // Medium purple
          ownedTiles: [],
          troops: 10,
          isAI: true,
        },
        {
          id: "ai-4",
          name: "GreenGuardian",
          color: "#32CD32", // Lime green
          ownedTiles: [],
          troops: 10,
          isAI: true,
        },
        {
          id: "ai-5",
          name: "PinkPhoenix",
          color: "#FF69B4", // Hot pink
          ownedTiles: [],
          troops: 10,
          isAI: true,
        },
      ]
      setPlayers(mockPlayers)
      setCurrentPlayer(mockPlayers[0])

      // In a real implementation, we would connect to a WebSocket server here
      // For now, we'll simulate multiplayer with local state and timeouts
      // socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001")
    }

    return () => {
      // Clean up socket connection
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  // AI player turns
  useEffect(() => {
    if (!gameStarted || !currentPlayer?.isAI) return

    const aiTakeTurn = setTimeout(() => {
      const aiPlayer = currentPlayer

      // AI logic for claiming a tile or attacking
      if (aiPlayer.ownedTiles.length === 0) {
        // Claim a random unclaimed tile
        const unclaimedTiles = tiles.filter((tile) => !tile.ownerId)
        if (unclaimedTiles.length > 0) {
          const randomTile = unclaimedTiles[Math.floor(Math.random() * unclaimedTiles.length)]
          claimTile(randomTile.id, aiPlayer.id)
        }
      } else {
        // Either reinforce a tile or attack
        const decision = Math.random()

        if (decision < 0.7 && aiPlayer.troops > 0) {
          // Attack logic
          const ownedTile = aiPlayer.ownedTiles[Math.floor(Math.random() * aiPlayer.ownedTiles.length)]
          const tileObj = tiles.find((t) => t.id === ownedTile)

          if (tileObj) {
            const adjacentTiles = getAdjacentTiles(tileObj, tiles)
            const attackableTiles = adjacentTiles.filter((t) => t.ownerId !== aiPlayer.id)

            if (attackableTiles.length > 0) {
              const targetTile = attackableTiles[Math.floor(Math.random() * attackableTiles.length)]
              const troopsToAttack = Math.min(Math.floor(Math.random() * 5) + 1, tileObj.troops)

              if (troopsToAttack > 0) {
                attackTile(tileObj, targetTile, troopsToAttack)
              }
            }
          }
        } else if (aiPlayer.troops > 0) {
          // Reinforce a random owned tile
          const tileToReinforce = aiPlayer.ownedTiles[Math.floor(Math.random() * aiPlayer.ownedTiles.length)]
          const tileObj = tiles.find((t) => t.id === tileToReinforce)

          if (tileObj) {
            const troopsToAdd = Math.min(Math.floor(Math.random() * 3) + 1, aiPlayer.troops)
            reinforceTile(tileObj.id, troopsToAdd)
          }
        }
      }

      // End AI turn
      nextTurn()
    }, 2000)

    return () => clearTimeout(aiTakeTurn)
  }, [currentPlayer, gameStarted, tiles])

  // Generate troops for each player every 30 seconds
  useEffect(() => {
    if (!gameStarted) return

    const troopInterval = setInterval(() => {
      setPlayers((prevPlayers) => {
        return prevPlayers.map((player) => {
          // Each owned tile generates 1 troop every 30 seconds
          const newTroops = player.ownedTiles.length
          return {
            ...player,
            troops: player.troops + newTroops,
          }
        })
      })
    }, 30000)

    return () => clearInterval(troopInterval)
  }, [gameStarted])

  // Map dragging handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (showCombat) return // Don't allow dragging during combat

      setIsDragging(true)
      setDragStart({ x: e.clientX - mapPosition.x, y: e.clientY - mapPosition.y })
    },
    [mapPosition, showCombat],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return

      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y

      setMapPosition({ x: newX, y: newY })
    },
    [isDragging, dragStart],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Add touch events for mobile
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (showCombat) return // Don't allow dragging during combat

      setIsDragging(true)
      setDragStart({
        x: e.touches[0].clientX - mapPosition.x,
        y: e.touches[0].clientY - mapPosition.y,
      })
    },
    [mapPosition, showCombat],
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return

      const newX = e.touches[0].clientX - dragStart.x
      const newY = e.touches[0].clientY - dragStart.y

      setMapPosition({ x: newX, y: newY })
    },
    [isDragging, dragStart],
  )

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Add event listeners to document for mouse events outside the component
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener("mouseup", handleGlobalMouseUp)
    document.addEventListener("touchend", handleGlobalMouseUp)

    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp)
      document.removeEventListener("touchend", handleGlobalMouseUp)
    }
  }, [])

  const startGame = () => {
    setGameStarted(true)
  }

  const claimTile = (tileId: string, playerId: string) => {
    // Find the player
    const player = players.find((p) => p.id === playerId)
    if (!player || player.ownedTiles.length > 0 || player.troops < 5) return

    // Update tiles
    setTiles((prevTiles) => {
      return prevTiles.map((tile) => {
        if (tile.id === tileId && !tile.ownerId) {
          return {
            ...tile,
            ownerId: playerId,
            color: player.color,
            troops: 5,
            visible: true,
          }
        }
        return tile
      })
    })

    // Update player
    setPlayers((prevPlayers) => {
      return prevPlayers.map((p) => {
        if (p.id === playerId) {
          return {
            ...p,
            ownedTiles: [...p.ownedTiles, tileId],
            troops: p.troops - 5, // Initial claim costs 5 troops
          }
        }
        return p
      })
    })

    // Update current player if needed
    if (currentPlayer?.id === playerId) {
      setCurrentPlayer((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          ownedTiles: [...prev.ownedTiles, tileId],
          troops: prev.troops - 5,
        }
      })
    }

    if (!gameStarted) {
      startGame()
    }
  }

  const reinforceTile = (tileId: string, troopCount: number) => {
    if (!currentPlayer || currentPlayer.troops < troopCount) return

    // Update tile
    setTiles((prevTiles) => {
      return prevTiles.map((tile) => {
        if (tile.id === tileId && tile.ownerId === currentPlayer.id) {
          return {
            ...tile,
            troops: tile.troops + troopCount,
          }
        }
        return tile
      })
    })

    // Update player
    setPlayers((prevPlayers) => {
      return prevPlayers.map((p) => {
        if (p.id === currentPlayer.id) {
          return {
            ...p,
            troops: p.troops - troopCount,
          }
        }
        return p
      })
    })

    // Update current player
    setCurrentPlayer((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        troops: prev.troops - troopCount,
      }
    })
  }

  const attackTile = (fromTile: TileData, toTile: TileData, troopCount: number) => {
    if (!currentPlayer || fromTile.ownerId !== currentPlayer.id || fromTile.troops <= troopCount) return

    // Check if tiles are adjacent
    const adjacentTiles = getAdjacentTiles(fromTile, tiles)
    if (!adjacentTiles.some((t) => t.id === toTile.id)) return

    // Setup combat data
    const attackingPlayer = players.find((p) => p.id === fromTile.ownerId)
    const defendingPlayer = players.find((p) => p.id === toTile.ownerId)

    if (!attackingPlayer) return

    const combat: CombatData = {
      attackingTile: fromTile,
      defendingTile: toTile,
      attackingPlayer,
      defendingPlayer,
      attackingTroops: troopCount,
      defendingTroops: toTile.troops,
      logs: [
        `${attackingPlayer.name} is attacking ${defendingPlayer ? defendingPlayer.name : "unclaimed territory"} with ${troopCount} troops!`,
      ],
      result: null,
    }

    setCombatData(combat)
    setShowCombat(true)

    // Update attacking tile
    setTiles((prevTiles) => {
      return prevTiles.map((tile) => {
        if (tile.id === fromTile.id) {
          return {
            ...tile,
            troops: tile.troops - troopCount,
          }
        }
        return tile
      })
    })
  }

  const resolveCombat = (combat: CombatData, won: boolean) => {
    if (!combat.attackingPlayer || !combat.attackingTile) return

    // Update tiles based on combat result
    setTiles((prevTiles) => {
      return prevTiles.map((tile) => {
        if (tile.id === combat.defendingTile.id && won) {
          // Attacker won, change ownership
          return {
            ...tile,
            ownerId: combat.attackingPlayer.id,
            color: combat.attackingPlayer.color,
            troops: Math.floor(combat.attackingTroops / 2), // Half of attacking troops occupy the tile
            visible: true,
          }
        } else if (tile.id === combat.defendingTile.id && !won) {
          // Defender won, reduce troops
          const remainingTroops = Math.max(1, Math.floor(combat.defendingTroops / 2))
          return {
            ...tile,
            troops: remainingTroops,
          }
        }
        return tile
      })
    })

    // Update players
    setPlayers((prevPlayers) => {
      return prevPlayers.map((player) => {
        if (player.id === combat.attackingPlayer.id && won && combat.defendingTile.ownerId) {
          // Attacker won and took over a tile
          return {
            ...player,
            ownedTiles: [...player.ownedTiles, combat.defendingTile.id],
          }
        } else if (player.id === combat.defendingTile.ownerId && won) {
          // Defender lost a tile
          return {
            ...player,
            ownedTiles: player.ownedTiles.filter((id) => id !== combat.defendingTile.id),
          }
        }
        return player
      })
    })

    // Update current player if needed
    if (currentPlayer?.id === combat.attackingPlayer.id && won) {
      setCurrentPlayer((prev) => {
        if (!prev) return prev
        if (!combat.defendingTile.ownerId) {
          // Claimed an unclaimed tile
          return {
            ...prev,
            ownedTiles: [...prev.ownedTiles, combat.defendingTile.id],
          }
        }
        return prev
      })
    }

    setShowCombat(false)
    setCombatData(null)
  }

  const handleTileClick = (tile: TileData) => {
    if (!currentPlayer || currentPlayer.isAI) return

    // If no tile is selected yet
    if (!selectedTile) {
      // If the tile belongs to the current player
      if (tile.ownerId === currentPlayer.id) {
        setSelectedTile(tile)
      } else if (!tile.ownerId && currentPlayer.ownedTiles.length === 0 && currentPlayer.troops >= 5) {
        // First tile claim
        claimTile(tile.id, currentPlayer.id)
      }
    } else {
      // A tile is already selected
      if (tile.id === selectedTile.id) {
        // Deselect the tile
        setSelectedTile(null)
      } else if (tile.ownerId === currentPlayer.id) {
        // Selected another owned tile
        setSelectedTile(tile)
      } else {
        // Selected a potential target tile
        setTargetTile(tile)

        // Check if tiles are adjacent
        const adjacentTiles = getAdjacentTiles(selectedTile, tiles)
        if (adjacentTiles.some((t) => t.id === tile.id)) {
          // Valid target for attack
          if (selectedTile.troops > 1) {
            // Can attack with at least 1 troop (leaving 1 behind)
            const maxTroops = selectedTile.troops - 1
            const troopsToAttack = Math.min(5, maxTroops)
            attackTile(selectedTile, tile, troopsToAttack)
          }
        }

        setSelectedTile(null)
      }
    }
  }

  const handleReinforce = (amount: number) => {
    if (!selectedTile || !currentPlayer || currentPlayer.troops < amount) return
    reinforceTile(selectedTile.id, amount)
  }

  const nextTurn = () => {
    // Find the next player
    const currentIndex = players.findIndex((p) => p.id === currentPlayer?.id)
    const nextIndex = (currentIndex + 1) % players.length
    setCurrentPlayer(players[nextIndex])
    setSelectedTile(null)
    setTargetTile(null)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading game...</div>
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Game map with drag functionality */}
      <div
        className="relative w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
        ref={mapContainerRef}
      >
        <div
          className="absolute"
          style={{
            transform: `translate(${mapPosition.x}px, ${mapPosition.y}px)`,
            width: "1600px", // Larger than viewport to allow scrolling
            height: "1600px", // Larger than viewport to allow scrolling
            left: "calc(50% - 800px)",
            top: "calc(50% - 800px)",
          }}
        >
          <Image
            src="/pixel-island-map.jpeg"
            alt="Game Map"
            width={1600}
            height={1600}
            className="object-contain pixelated"
            priority
          />

          {/* Tile grid */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-[800px] h-[800px]">
              {tiles.map((tile) => (
                <Tile
                  key={tile.id}
                  tile={tile}
                  isSelected={selectedTile?.id === tile.id}
                  isTargeted={targetTile?.id === tile.id}
                  onClick={() => handleTileClick(tile)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Game UI */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
        {/* Player info */}
        <div className="bg-black bg-opacity-70 p-4 rounded-lg">
          <h3 className="text-primary font-bold mb-2">Players</h3>
          <div className="space-y-2">
            {players.map((player) => (
              <div
                key={player.id}
                className={`flex items-center ${currentPlayer?.id === player.id ? "border-l-4 pl-2" : "pl-3"}`}
                style={{ borderColor: player.color }}
              >
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: player.color }}></div>
                <span className="text-sm">{player.name}</span>
                <span className="text-xs ml-2 text-gray-400">
                  ({player.ownedTiles.length} tiles, {player.troops} troops)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Current player actions */}
        <div className="bg-black bg-opacity-70 p-4 rounded-lg">
          <h3 className="text-primary font-bold mb-2">
            {currentPlayer?.isAI ? `${currentPlayer.name}'s Turn` : "Your Turn"}
          </h3>

          {!currentPlayer?.isAI && (
            <div className="space-y-2">
              <p className="text-sm">Troops: {currentPlayer?.troops || 0}</p>

              {selectedTile && selectedTile.ownerId === currentPlayer?.id && (
                <div>
                  <p className="text-xs mb-1">Selected: {selectedTile.troops} troops</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleReinforce(1)}
                      disabled={!currentPlayer || currentPlayer.troops < 1}
                      className="px-2 py-1 text-xs bg-primary text-black rounded disabled:opacity-50"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => handleReinforce(5)}
                      disabled={!currentPlayer || currentPlayer.troops < 5}
                      className="px-2 py-1 text-xs bg-primary text-black rounded disabled:opacity-50"
                    >
                      +5
                    </button>
                  </div>
                </div>
              )}

              <button onClick={nextTurn} className="w-full px-3 py-1 text-sm bg-secondary text-black rounded mt-2">
                End Turn
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Combat modal */}
      {showCombat && combatData && <CombatModal combat={combatData} onComplete={resolveCombat} />}

      {/* Game instructions */}
      {!gameStarted && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
          <div className="bg-black border-4 border-primary p-6 max-w-md text-center">
            <h2 className="text-2xl font-bold text-primary mb-4">TiledTogether Conquest</h2>
            <p className="mb-4">Claim territories, build your army, and conquer the map!</p>
            <ul className="text-left text-sm mb-6 space-y-2">
              <li>• Click an empty tile to claim your first territory</li>
              <li>• Each territory generates troops over time</li>
              <li>• Select your territory and then an adjacent tile to attack</li>
              <li>• Conquer territories to expand your empire</li>
              <li>• Drag the map to explore the world</li>
            </ul>
            <button onClick={() => startGame()} className="pixel-button bg-secondary text-black">
              START GAME
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default GameBoard
