import { headers } from 'next/headers'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

export async function verifyAdminAuth(): Promise<boolean> {
  const headersList = await headers()
  const authHeader = headersList.get('authorization')

  if (!authHeader) {
    return false
  }

  // Basic auth: "Basic base64(username:password)"
  if (authHeader.startsWith('Basic ')) {
    const base64Credentials = authHeader.slice(6)
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8')
    const [, password] = credentials.split(':')
    return password === ADMIN_PASSWORD
  }

  // Simple token auth: "Bearer password"
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    return token === ADMIN_PASSWORD
  }

  return false
}

export function getAuthHeader(): { 'WWW-Authenticate': string } {
  return { 'WWW-Authenticate': 'Basic realm="Admin Area"' }
}
