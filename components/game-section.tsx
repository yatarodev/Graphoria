"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

const GameSection = () => {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setAnimate(true)
        }
      },
      { threshold: 0.1 },
    )

    const section = document.getElementById("game")
    if (section) {
      observer.observe(section)
    }

    return () => {
      if (section) {
        observer.unobserve(section)
      }
    }
  }, [])

  return (
    <section id="game" className="py-16 relative">
      {/* Removed vaporwave-grid */}
      <div className="absolute inset-0 bg-black bg-opacity-70"></div>

      <div className="container mx-auto relative z-10">
        <h2 className="text-3xl font-bold text-center mb-12 neon-text-primary">THE GAME</h2>

        <div
          className={`transition-all duration-500 ${animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/2">
              <h3 className="text-2xl font-bold mb-4 neon-text-primary">CONQUER THE WORLD</h3>
              <div className="mb-6 whitespace-pre-line led-text">
                TiledTogether is a multiplayer conquest game where players compete to control territory. Claim tiles,
                build your army, and expand your empire by conquering adjacent territories. Each tile you control
                generates troops over time, allowing you to grow your forces and dominate the map!
              </div>
              <Link href="/game" className="pixel-button neon-button-primary inline-block">
                PLAY NOW
              </Link>
            </div>

            <div className="md:w-1/2">
              <div className="pixel-border p-2 bg-black neon-box">
                <Image src="/game-map.jpeg" alt="Game Map" width={500} height={300} className="w-full h-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default GameSection
