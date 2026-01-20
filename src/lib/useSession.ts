'use client'

import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

const SESSION_KEY = 'kya_session_id'

export function useSession() {
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    // Check for existing session
    let id = localStorage.getItem(SESSION_KEY)

    if (!id) {
      // Generate new session ID
      id = uuidv4()
      localStorage.setItem(SESSION_KEY, id)
    }

    setSessionId(id)
  }, [])

  return sessionId
}
