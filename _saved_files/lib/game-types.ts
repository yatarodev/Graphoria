export interface TileData {
  id: string
  x: number
  y: number
  width: number
  height: number
  ownerId: string | null
  color: string
  troops: number
  visible: boolean
}

export interface Player {
  id: string
  name: string
  color: string
  ownedTiles: string[]
  troops: number
  isAI?: boolean
}

export interface CombatData {
  attackingTile: TileData
  defendingTile: TileData
  attackingPlayer: Player
  defendingPlayer: Player | null
  attackingTroops: number
  defendingTroops: number
  logs: string[]
  result: "attacker" | "defender" | null
}
