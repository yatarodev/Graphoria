"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Terminal from "@/components/terminal"
import Hero from "@/components/hero"
import FeatureCards from "@/components/feature-cards"
import GameSection from "@/components/game-section"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import ContractAddress from "@/components/contract-address"
import CallToAction from "@/components/call-to-action"

export default function Home() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Simulate loading time for terminal animation
    const timer = setTimeout(() => {
      setLoading(false)
    }, 6000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <main className="min-h-screen bg-black text-green-400 pixel-font">
      {loading ? (
        <Terminal onComplete={() => setLoading(false)} />
      ) : (
        <div className="pixel-container">
          <Navbar />
          <Hero />
          <ContractAddress />
          <FeatureCards />
          <GameSection />
          <CallToAction />
          <Footer />
        </div>
      )}
    </main>
  )
}
