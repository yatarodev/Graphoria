"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { usePageContext } from "@/contexts/page-context"
import WalletButton from "./wallet-button"

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [sparkles, setSparkles] = useState<{ id: number; left: number; top: number }[]>([])
  const [playerCount, setPlayerCount] = useState(getRandomPlayerCount())
  const { currentPage } = usePageContext()

  function getRandomPlayerCount() {
    return Math.floor(Math.random() * (200 - 100 + 1)) + 100
  }

  function getSmallVariation() {
    // Generate a small random variation between -10 and +10
    return Math.floor(Math.random() * 21) - 10
  }

  // Create sparkle effect on hover
  useEffect(() => {
    if (!isHovering) return

    const interval = setInterval(() => {
      const newSparkle = {
        id: Date.now(),
        left: Math.random() * 100,
        top: Math.random() * 100,
      }

      setSparkles((prev) => [...prev, newSparkle])

      // Remove sparkle after animation
      setTimeout(() => {
        setSparkles((prev) => prev.filter((sparkle) => sparkle.id !== newSparkle.id))
      }, 700)
    }, 150)

    return () => clearInterval(interval)
  }, [isHovering])

  // Update player count
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

  return (
    <nav className="border-b-4 border-primary py-4 mb-8 neon-border-bottom">
      <div className="container mx-auto">
        <div className="flex flex-col items-center mb-2">
          <span className="text-xl font-bold neon-text-secondary">$TILE</span>
        </div>
        <div className="flex justify-between items-center">
          {currentPage === "home" ? (
            <div className="flex items-center space-x-4">
              <Link href="/">
                <div
                  className="relative w-12 h-12 hover-jiggle float-animation"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  <Image src="/tile-logo.png" alt="$TILE Logo" width={48} height={48} className="pixelated" />

                  {/* Sparkles */}
                  {sparkles.map((sparkle) => (
                    <div
                      key={sparkle.id}
                      className="absolute w-2 h-2 bg-yellow-300 rounded-full sparkle-animation"
                      style={{
                        left: `${sparkle.left}%`,
                        top: `${sparkle.top}%`,
                      }}
                    />
                  ))}
                </div>
              </Link>

              {/* Player count in navbar */}
              <div className="flex items-center px-3 py-1 bg-black bg-opacity-70 rounded border border-primary neon-border-subtle">
                <span className="player-orb"></span>
                <span className="text-sm font-bold">
                  <span className="neon-text-secondary">{playerCount}</span> ONLINE
                </span>
              </div>
            </div>
          ) : (
            <div className="w-16 h-12"></div>
          )}

          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="https://dexscreener.com/solana/tile"
              target="_blank"
              className="hover:text-primary transition-colors led-text"
            >
              DEXSCREENER
            </Link>
            <Link
              href="https://arena.colosseum.org/projects/explore/tiled-together"
              target="_blank"
              className="hover:text-primary transition-colors led-text"
            >
              COLOSSEUM
            </Link>
            <WalletButton />
            <Link href="/game" className="pixel-button neon-button-primary">
              PLAY NOW
            </Link>
          </div>

          <button className="md:hidden text-primary" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} className="neon-icon" /> : <Menu size={24} className="neon-icon" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 bg-black bg-opacity-90 p-4 rounded border border-primary">
            <div className="flex flex-col space-y-4">
              <Link
                href="https://dexscreener.com/solana/tile"
                target="_blank"
                className="hover:text-primary transition-colors led-text"
              >
                DEXSCREENER
              </Link>
              <Link
                href="https://arena.colosseum.org/projects/explore/tiled-together"
                target="_blank"
                className="hover:text-primary transition-colors led-text"
              >
                COLOSSEUM
              </Link>
              <WalletButton />
              <Link href="/game" className="pixel-button neon-button-primary text-center">
                PLAY NOW
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
