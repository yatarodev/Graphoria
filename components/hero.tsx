"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"

const Hero = () => {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    setAnimate(true)
  }, [])

  return (
    <section className="py-12 md:py-20 relative overflow-hidden">
      {/* Removed vaporwave-grid */}
      <div className="absolute inset-0 bg-black bg-opacity-70"></div>

      <div className="container mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div
            className={`md:w-1/2 transition-all duration-1000 ${animate ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}`}
          >
            <h1 className="text-3xl md:text-5xl font-bold mb-6 neon-text-primary">
              TILED<span className="neon-text-secondary">TOGETHER</span>
            </h1>
            <p className="text-lg mb-8 leading-relaxed led-text">
              Join the 8-bit revolution on Solana. $TILED is more than a token - it's a community-driven game where
              players build, trade, and earn together.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/game" className="pixel-button neon-button-primary">
                PLAY GAME
              </Link>
              <Link
                href="#"
                className="pixel-button neon-button-secondary"
                style={{
                  backgroundColor: "#FFD700",
                  color: "black",
                  boxShadow:
                    "0 0 5px rgba(255, 215, 0, 0.7), 0 0 10px rgba(255, 215, 0, 0.4), inset 0 0 2px rgba(255, 215, 0, 0.3)",
                }}
              >
                BUY $TILED
              </Link>
            </div>
          </div>

          <div
            className={`md:w-1/2 transition-all duration-1000 ${animate ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`}
          >
            <div className="pixel-border p-2 bg-black relative neon-box">
              <div className="aspect-square w-full relative">
                <Image
                  src="/tree-of-life.png"
                  alt="Tree of Life"
                  width={400}
                  height={400}
                  className="w-full h-auto pixelated"
                />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black opacity-30"></div>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground px-4 py-2 pixel-border neon-badge">
                <span className="text-xl font-bold">$TILED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
