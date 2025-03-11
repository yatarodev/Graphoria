"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePageContext } from "@/contexts/page-context"

const AnimatedLogo = () => {
  const [isHovering, setIsHovering] = useState(false)
  const [sparkles, setSparkles] = useState<{ id: number; left: number; top: number }[]>([])
  const { currentPage } = usePageContext()

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

  // Don't render if we're on the home page (it will be in the navbar)
  if (currentPage === "home") {
    return null
  }

  // Position based on current page
  const positionClass = currentPage === "game" ? "fixed bottom-4 left-4 z-50" : "fixed top-4 left-4 z-50"

  return (
    <div className={positionClass}>
      <Link href="/">
        <div
          className="relative w-16 h-16 hover-jiggle float-animation"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <Image src="/tile-logo.png" alt="$TILE Logo" width={64} height={64} className="pixelated" />

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
    </div>
  )
}

export default AnimatedLogo
