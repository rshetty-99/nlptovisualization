'use client'

import { useClerk } from "@clerk/nextjs"
import { useEffect } from "react"

export default function SSOCallback() {
  const { handleRedirectCallback } = useClerk()

  useEffect(() => {
    handleRedirectCallback()
  }, [handleRedirectCallback])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Processing SSO callback...</p>
    </div>
  )
}

