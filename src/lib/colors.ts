// Very muted, calm colors for cozy campfire theme
export const USER_COLORS = [
  '#a08070',  // Dusty clay
  '#b09882',  // Faded wheat
  '#7a6858',  // Warm umber
  '#988678',  // Taupe
  '#908080',  // Warm gray
  '#708878',  // Faded sage
  '#607878',  // Muted slate
  '#707888',  // Dusty steel
  '#807080',  // Muted mauve
  '#907070',  // Faded rose
  '#787868',  // Moss
  '#a09078',  // Sand
] as const

export function assignUserColor(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }

  const colorIndex = Math.abs(hash) % USER_COLORS.length
  return USER_COLORS[colorIndex]
}

export function generateUserId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}
