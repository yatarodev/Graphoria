"use client"

import { useState, useEffect, useRef } from "react"
import type { CombatData } from "@/lib/game-types"

interface CombatModalProps {
  combat: CombatData
  onComplete: (combat: CombatData, won: boolean) => void
}

const CombatModal = ({ combat, onComplete }: CombatModalProps) => {
  const [logs, setLogs] = useState<string[]>(combat.logs)
  const [combatInProgress, setCombatInProgress] = useState(true)
  const [attackerWon, setAttackerWon] = useState(false)
  const [attackingTroops, setAttackingTroops] = useState(combat.attackingTroops)
  const [defendingTroops, setDefendingTroops] = useState(combat.defendingTroops)
  const [round, setRound] = useState(1)
  const [showOkButton, setShowOkButton] = useState(false)
  const [autoCloseTimer, setAutoCloseTimer] = useState(10)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Combat simulation
  useEffect(() => {
    if (!combatInProgress) return

    const combatRound = setTimeout(() => {
      // Calculate combat odds based on troop numbers
      const attackerStrength = attackingTroops * (Math.random() * 0.5 + 0.75) // 0.75-1.25 multiplier
      const defenderStrength = defendingTroops * (Math.random() * 0.5 + 0.75) // 0.75-1.25 multiplier

      const attackerAdvantage = attackerStrength > defenderStrength

      // Generate combat narrative
      const narratives = generateCombatNarrative(
        combat.attackingPlayer?.name || "Attacker",
        combat.defendingPlayer?.name || "Defender",
        attackerAdvantage,
        round,
      )

      setLogs((prev) => [...prev, narratives.log])

      // Update troop counts
      let newAttackingTroops = attackingTroops
      let newDefendingTroops = defendingTroops

      if (attackerAdvantage) {
        // Attacker wins the round
        const losses = Math.max(1, Math.floor(defendingTroops * 0.3))
        newDefendingTroops = Math.max(0, defendingTroops - losses)

        // Attacker also takes some losses
        const attackerLosses = Math.max(1, Math.floor(attackingTroops * 0.1))
        newAttackingTroops = Math.max(0, attackingTroops - attackerLosses)
      } else {
        // Defender wins the round
        const losses = Math.max(1, Math.floor(attackingTroops * 0.3))
        newAttackingTroops = Math.max(0, attackingTroops - losses)

        // Defender also takes some losses
        const defenderLosses = Math.max(1, Math.floor(defendingTroops * 0.1))
        newDefendingTroops = Math.max(0, defendingTroops - defenderLosses)
      }

      setAttackingTroops(newAttackingTroops)
      setDefendingTroops(newDefendingTroops)

      // Check if combat is over
      if (newAttackingTroops === 0 || newDefendingTroops === 0) {
        const winner = newDefendingTroops === 0 ? "attacker" : "defender"
        const finalLog =
          winner === "attacker"
            ? `${combat.attackingPlayer?.name || "Attacker"} has conquered the territory!`
            : `${combat.defendingPlayer?.name || "Defender"} has successfully defended the territory!`

        setLogs((prev) => [...prev, finalLog])
        setCombatInProgress(false)
        setAttackerWon(winner === "attacker")
        setShowOkButton(true)

        // Start auto-close timer
        timerRef.current = setInterval(() => {
          setAutoCloseTimer((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current as NodeJS.Timeout)
              onComplete(combat, winner === "attacker")
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        setRound((prev) => prev + 1)
      }
    }, 1500)

    return () => clearTimeout(combatRound)
  }, [combatInProgress, attackingTroops, defendingTroops, round, combat, onComplete])

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const handleOkClick = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    onComplete(combat, attackerWon)
  }

  const generateCombatNarrative = (
    attackerName: string,
    defenderName: string,
    attackerAdvantage: boolean,
    round: number,
  ) => {
    const attackPhrases = [
      `${attackerName} launches a fierce assault!`,
      `${attackerName}'s troops charge forward with battle cries!`,
      `${attackerName} coordinates a tactical strike!`,
      `${attackerName}'s forces unleash a barrage of attacks!`,
      `${attackerName} sends in elite units for a precision attack!`,
    ]

    const defensePhrases = [
      `${defenderName} holds the line with determination!`,
      `${defenderName}'s troops form a defensive wall!`,
      `${defenderName} counters with a surprise flanking maneuver!`,
      `${defenderName}'s archers rain down arrows on the attackers!`,
      `${defenderName} uses the terrain to their advantage!`,
    ]

    const attackerWinPhrases = [
      `${attackerName}'s strategy is working! ${defenderName}'s forces are falling back!`,
      `${defenderName}'s defenses are crumbling under the pressure!`,
      `${attackerName} breaks through a weak point in the defense!`,
      `${defenderName} suffers heavy losses in this exchange!`,
      `${attackerName}'s troops gain significant ground!`,
    ]

    const defenderWinPhrases = [
      `${defenderName} repels the attack with minimal losses!`,
      `${attackerName}'s troops retreat in disarray!`,
      `${defenderName}'s counterattack is devastating!`,
      `${attackerName}'s formation breaks under pressure!`,
      `${defenderName} turns the tide with a brilliant maneuver!`,
    ]

    // Select random phrases based on the round and outcome
    const attackIndex = (round + 0) % attackPhrases.length
    const defenseIndex = (round + 2) % defensePhrases.length
    const resultIndex = (round + 1) % 5

    let log = ""

    if (round % 2 === 1) {
      log = attackPhrases[attackIndex]
      if (attackerAdvantage) {
        log += " " + attackerWinPhrases[resultIndex]
      } else {
        log += " " + defenderWinPhrases[resultIndex]
      }
    } else {
      log = defensePhrases[defenseIndex]
      if (attackerAdvantage) {
        log += " " + attackerWinPhrases[resultIndex]
      } else {
        log += " " + defenderWinPhrases[resultIndex]
      }
    }

    return { log }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="bg-black border-4 border-primary p-4 max-w-md w-full max-h-[80vh] flex flex-col neon-box">
        {/* Centered COMBAT title */}
        <div className="text-center mb-4">
          <h3 className="text-2xl font-bold neon-text-primary">COMBAT</h3>

          {/* Player names with VS in the middle */}
          <div className="flex justify-center items-center mt-2">
            <div className="text-center flex-1">
              <div className="text-sm">{combat.attackingPlayer?.name || "Attacker"}</div>
              <div className="text-xl font-bold" style={{ color: combat.attackingPlayer?.color }}>
                {attackingTroops}
              </div>
            </div>

            <div className="text-xl px-4">vs</div>

            <div className="text-center flex-1">
              <div className="text-sm">{combat.defendingPlayer?.name || "Defender"}</div>
              <div className="text-xl font-bold" style={{ color: combat.defendingPlayer?.color || "#ffffff" }}>
                {defendingTroops}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto terminal-text p-2 border border-primary mb-4 min-h-[200px] max-h-[300px] neon-border-subtle">
          {logs.map((log, index) => (
            <div key={index} className="mb-2 text-sm">
              <span className="text-primary">$&gt; </span>
              {log}
            </div>
          ))}
        </div>

        {showOkButton && (
          <button onClick={handleOkClick} className="pixel-button neon-button-primary w-full">
            OK ({autoCloseTimer}s)
          </button>
        )}
      </div>
    </div>
  )
}

export default CombatModal
