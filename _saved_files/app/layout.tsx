import type React from "react"
import type { Metadata } from "next"
import { Press_Start_2P } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import AnimatedLogo from "@/components/animated-logo"
import PlayerCount from "@/components/player-count"
import { PageProvider } from "@/contexts/page-context"
import { WalletContextProvider } from "@/contexts/wallet-context"

const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "TiledTogether ($TILED) - 8-bit Crypto Game",
  description: "Join the TiledTogether community and play our 8-bit game on Solana blockchain",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={pixelFont.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <WalletContextProvider>
            <PageProvider>
              <AnimatedLogo />
              <PlayerCount />
              {children}
            </PageProvider>
          </WalletContextProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
