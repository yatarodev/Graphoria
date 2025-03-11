"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"

interface TerminalProps {
  onComplete: () => void
}

const Terminal: React.FC<TerminalProps> = ({ onComplete }) => {
  const [text, setText] = useState<string[]>([])
  const [cursor, setCursor] = useState(true)
  const [isTyping, setIsTyping] = useState(true)
  const terminalRef = useRef<HTMLDivElement>(null)
  const loadingDurationRef = useRef<number>(Math.floor(Math.random() * 3000) + 10000) // 10-13 seconds
  const currentLineRef = useRef<number>(0)
  const currentCharRef = useRef<number>(0)
  const currentTextRef = useRef<string>("")
  const allCommandsCompletedRef = useRef<boolean>(false)

  const commands = [
    "INITIALIZING SYSTEM...",
    "LOADING KERNEL...",
    "MOUNTING FILESYSTEM...",
    "CONNECTING TO SOLANA NETWORK...",
    "LOADING $TILED TOKEN DATA...",
    "INITIALIZING GAME ENGINE...",
    "LOADING PIXEL ASSETS...",
    "SYSTEM READY!",
  ]

  const bugs = [
    { text: "ERR0R: MEMORY CORRUPTION DETECTED... FIXING", line: 2 },
    { text: "WARNING: UNSTABLE CONNECTION... REROUTING", line: 3 },
    { text: "UNEXPECTED TOKEN AT LINE 42... BYPASSING", line: 5 },
  ]

  const typeCommand = useCallback(() => {
    if (currentLineRef.current >= commands.length) {
      setIsTyping(false)
      allCommandsCompletedRef.current = true
      return
    }

    const command = commands[currentLineRef.current]

    if (currentCharRef.current < command.length) {
      currentTextRef.current += command[currentCharRef.current]
      setText((prev) => {
        const newText = [...prev]
        newText[currentLineRef.current] = currentTextRef.current
        return newText
      })
      currentCharRef.current++
    } else {
      // Check if we should show a bug
      const bug = bugs.find((b) => b.line === currentLineRef.current)
      if (bug && Math.random() > 0.5) {
        setTimeout(() => {
          setText((prev) => {
            const newText = [...prev]
            newText.splice(currentLineRef.current + 1, 0, bug.text)
            return newText
          })

          // Add glitch effect
          if (terminalRef.current) {
            terminalRef.current.classList.add("glitch")
            setTimeout(() => {
              if (terminalRef.current) {
                terminalRef.current.classList.remove("glitch")
              }
            }, 300)
          }

          setTimeout(() => {
            setText((prev) => {
              const newText = [...prev]
              newText.splice(currentLineRef.current + 1, 1, bug.text + " [FIXED]")
              return newText
            })
          }, 1500)
        }, 300)
      }

      currentLineRef.current++
      currentCharRef.current = 0
      currentTextRef.current = ""
    }
  }, [commands, bugs])

  // Initialize typing
  useEffect(() => {
    let commandInterval: NodeJS.Timeout | null = null

    if (isTyping) {
      commandInterval = setInterval(typeCommand, 50)
    }

    return () => {
      if (commandInterval) {
        clearInterval(commandInterval)
      }
    }
  }, [isTyping, typeCommand])

  // Handle completion after all commands are displayed
  useEffect(() => {
    if (allCommandsCompletedRef.current) {
      // Wait for a minimum time after all commands are displayed
      const minDisplayTime = 2000 // 2 seconds to read the final messages

      // Calculate remaining time to meet the minimum loading duration
      const elapsedTime = Math.min(loadingDurationRef.current, 8000) // Estimate time spent typing
      const remainingTime = Math.max(minDisplayTime, loadingDurationRef.current - elapsedTime)

      const timer = setTimeout(() => {
        onComplete()
      }, remainingTime)

      return () => clearTimeout(timer)
    }
  }, [isTyping, onComplete])

  // Blink cursor
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursor((prev) => !prev)
    }, 500)

    return () => clearInterval(cursorInterval)
  }, [])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black p-4 z-50">
      <div className="scanline absolute inset-0"></div>
      {/* Removed vaporwave-grid */}
      <div
        ref={terminalRef}
        className="w-full max-w-3xl h-96 bg-black border-2 border-primary p-4 overflow-auto relative z-10 neon-glow"
      >
        {text.map((line, index) => (
          <div key={index} className="mb-2">
            <span className="text-primary retro-text">$&gt; </span>
            <span className="retro-text">{line}</span>
          </div>
        ))}
        <div className="inline-block">
          <span className="text-primary retro-text">$&gt; </span>
          {cursor && <span className="blink retro-text">█</span>}
        </div>
      </div>
    </div>
  )
}

export default Terminal
