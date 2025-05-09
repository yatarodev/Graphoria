import Link from "next/link"
import { Twitter, Github } from "lucide-react"

const Footer = () => {
  return (
    <footer className="border-t-4 border-primary py-12 mt-16 neon-border">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 neon-text-primary">$TILED</h3>
            <p className="text-sm mb-4 led-text">The community-driven 8-bit game built on Solana blockchain.</p>
            <div className="flex space-x-4">
              <Link href="https://x.com/tiledtogether" target="_blank" className="hover:text-primary transition-colors">
                <Twitter size={20} className="neon-icon" />
              </Link>
              <Link href="https://github.com/yatarodev/tiled-together" className="hover:text-primary transition-colors">
                <Github size={20} className="neon-icon" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4 neon-text-secondary">Token</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-primary transition-colors led-text">
                  Buy $TILED
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors led-text">
                  DEXSCREENER
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 text-center text-sm">
          <p className="led-text">© 2025 TiledTogether. All rights reserved.</p>
          <p className="mt-2 text-xs led-text">
            $TILED is not affiliated with Solana Foundation. This is a community project.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
