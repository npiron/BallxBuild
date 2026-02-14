/**
 * Image path helper — generates a conventional path from entity type + name.
 */
export function getImagePath(entityType: string, name: string): string {
  const safeName = name
    .toLowerCase()
    .replace(/ /g, '_')
    .replace(/'/g, '')
    .replace(/[()]/g, '')
  const prefix = entityType === 'biomes' && !safeName.startsWith('the_') ? 'the_' : ''
  return `img/${entityType}/${prefix}${safeName}.png`
}

/**
 * Extract status effects from a ball's status_effect field.
 */
export function getStatusEffects(
  ballName: string,
  ballsByName: Record<string, { status_effect?: string }>,
): string[] {
  const ball = ballsByName[ballName]
  if (!ball?.status_effect) return []
  return ball.status_effect
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
}

/**
 * Get a human-readable status label.
 */
export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    owned: 'Possédé',
    ready: 'Prêt!',
    partial: 'Partiel',
    missing: 'Manquant',
    pickup: 'À trouver',
  }
  return map[status] || status
}
