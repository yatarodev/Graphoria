"use client"

import { useEffect, useState, useRef } from "react"
import { Gamepad, Coins, Users, Brain } from "lucide-react"

const features = [
  {
    title: "PLAY-TO-EARN",
    description:
      "Place tiles, complete strategic patterns, and earn $TILED tokens as you play. The more territory you control, the greater your rewards.",
    icon: Gamepad,
    color: "text-primary",
  },
  {
    title: "COMMUNITY GOVERNANCE",
    description:
      "Token holders vote on game features, special events, and the future direction of the TiledTogether ecosystem. Your voice shapes our world.",
    icon: Users,
    color: "text-secondary",
  },
  {
    title: "SOLANA POWERED",
    description:
      "Built on Solana for lightning-fast transactions, minimal fees, and seamless gameplay. Experience the power of blockchain gaming without the friction.",
    icon: Coins,
    color: "text-accent",
  },
  {
    title: "EVER-EVOLVING",
    description:
      "AI opponents analyze your playstyle, form opinions about your strategy, and pursue their own agendas. Each match creates unique rivalries and potential alliances based on your history.",
    icon: Brain,
    color: "text-primary",
  },
]

const FeatureCards = () => {
  const [visibleCards, setVisibleCards] = useState<number[]>([])
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const timer = setTimeout(() => {
            const interval = setInterval(() => {
              setVisibleCards((prev) => {
                if (prev.length >= features.length) {
                  clearInterval(interval)
                  return prev
                }
                return [...prev, prev.length]
              })
            }, 200)

            return () => clearInterval(interval)
          }, 300)

          return () => clearTimeout(timer)
        }
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const styleElement = document.createElement("style")
    styleElement.innerHTML = styles
    document.head.appendChild(styleElement)

    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  return (
    <section id="features" className="py-16 relative" ref={sectionRef}>
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 neon-text-primary">GAME FEATURES</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`pixel-card neon-box transition-all duration-500 ${
                visibleCards.includes(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
              }`}
            >
              <div className={`${feature.color} mb-4 icon-hover-animation`}>
                <feature.icon size={40} className="neon-icon" />
              </div>
              <h3 className="text-xl font-bold mb-3 neon-text-primary">{feature.title}</h3>
              <p className="text-sm leading-relaxed led-text">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const styles = `
  @keyframes iconHover {
    0% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-8px);
    }
    100% {
      transform: translateY(0);
    }
  }

  .icon-hover-animation {
    animation: iconHover 3s ease-in-out infinite;
    display: inline-block;
  }
`

export default FeatureCards
