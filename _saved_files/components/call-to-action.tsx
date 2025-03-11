import Link from "next/link"

const CallToAction = () => {
  return (
    <section className="py-16 relative">
      <div className="absolute inset-0 bg-black bg-opacity-70"></div>

      <div className="container mx-auto relative z-10">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-6 neon-text-primary">READY TO JOIN THE CONQUEST?</h3>
          <Link href="/game" className="pixel-button neon-button-primary inline-block text-lg px-8 py-3">
            PLAY NOW
          </Link>
        </div>
      </div>
    </section>
  )
}

export default CallToAction
