// Campfire layout calculations for positioning users around the fire

export interface UserPosition {
  x: number
  y: number
  angle: number
  isRightSide: boolean
}

/**
 * Calculate positions for users around the campfire in an oval arrangement
 * @param userCount Number of users to position
 * @param containerWidth Width of the campfire container
 * @param containerHeight Height of the campfire container
 * @returns Array of positions for each user
 */
export function calculateCampfirePositions(
  userCount: number,
  containerWidth: number,
  containerHeight: number
): UserPosition[] {
  if (userCount === 0) return []

  const positions: UserPosition[] = []

  // Center of the campfire area - matches the campfire flame position
  const centerX = containerWidth / 2
  const centerY = containerHeight * 0.5

  // Oval parameters - large enough to keep users clear of the fire
  // but small enough to stay within the container (with 40px padding)
  const radiusX = Math.min(containerWidth * 0.38, 220)
  const radiusY = Math.min(containerHeight * 0.35, 140)
  const padding = 40

  for (let i = 0; i < userCount; i++) {
    // Calculate angle for even distribution around the oval
    const angle = (i / userCount) * 2 * Math.PI - Math.PI / 2 // Start from top (-90 degrees)

    // Calculate position on the oval, clamped to container bounds
    const x = centerX + Math.cos(angle) * radiusX
    const rawY = centerY + Math.sin(angle) * radiusY
    const y = Math.max(padding, Math.min(containerHeight - padding, rawY))

    // Determine if user is on right side (for speech bubble direction)
    const isRightSide = x >= centerX

    positions.push({
      x,
      y,
      angle,
      isRightSide
    })
  }

  return positions
}

/**
 * Get speech bubble direction and position based on user position
 */
export function getSpeechBubblePosition(position: UserPosition): {
  direction: 'left' | 'right'
  x: number
  y: number
} {
  return {
    direction: position.isRightSide ? 'right' : 'left',
    x: position.x + (position.isRightSide ? 40 : -40), // 40px offset from user icon
    y: position.y - 50, // 50px above user icon
  }
}