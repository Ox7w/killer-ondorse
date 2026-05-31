export const ALLOWED_DOMAIN = (
  import.meta.env.VITE_ALLOWED_DOMAIN || 'ondorse.co'
).toLowerCase()

export const ADMIN_EMAIL = (
  import.meta.env.VITE_ADMIN_EMAIL || 'mohammad@ondorse.co'
).toLowerCase()

// Un seul jeu global, réinitialisable par l'admin.
export const GAME_ID = 'current'

export function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return email.toLowerCase().endsWith('@' + ALLOWED_DOMAIN)
}

export function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && email.toLowerCase() === ADMIN_EMAIL
}
