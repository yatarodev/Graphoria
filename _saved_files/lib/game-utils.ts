import { v4 as uuidv4 } from "uuid"
import type { TileData } from "./game-types"

export function generateTileGrid(rows: number, cols: number, boardWidth: number, boardHeight: number): TileData[] {
  const tiles: TileData[] = []
  const tileWidth = boardWidth / cols
  const tileHeight = boardHeight / rows

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      tiles.push({
        id: uuidv4(),
        x: col * tileWidth,
        y: row * tileHeight,
        width: tileWidth,
        height: tileHeight,
        ownerId: null,
        color: "#ffffff",
        troops: 0,
        visible: false,
      })
    }
  }

  return tiles
}

export function getAdjacentTiles(tile: TileData, allTiles: TileData[]): TileData[] {
  const tileSize = tile.width // Assuming square tiles
  const adjacentTiles: TileData[] = []

  // Check all tiles to find adjacent ones
  allTiles.forEach((otherTile) => {
    if (otherTile.id === tile.id) return

    // Calculate the center points of both tiles
    const tileCenter = {
      x: tile.x + tile.width / 2,
      y: tile.y + tile.height / 2,
    }

    const otherCenter = {
      x: otherTile.x + otherTile.width / 2,
      y: otherTile.y + otherTile.height / 2,
    }

    // Calculate the distance between centers
    const dx = Math.abs(tileCenter.x - otherCenter.x)
    const dy = Math.abs(tileCenter.y - otherCenter.y)

    // If the tiles are adjacent (allowing for a small margin of error)
    if ((dx <= tileSize * 1.1 && dy < tileSize * 0.5) || (dy <= tileSize * 1.1 && dx < tileSize * 0.5)) {
      adjacentTiles.push(otherTile)
    }
  })

  return adjacentTiles
}
