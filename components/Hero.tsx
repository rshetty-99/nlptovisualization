'use client'

import { Button } from './ui/button'
import { useUser, useClerk } from '@clerk/nextjs'
import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function Hero() {
  const { isSignedIn } = useUser()
  const { openSignIn } = useClerk()
  const router = useRouter()

  const handleGetStarted = () => {
    if (isSignedIn) {
      router.push('/converter')
    } else {
      openSignIn({
        redirectUrl: '/converter',
      })
    }
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-violet-50 to-violet-100">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-violet-800">
              Transform Text to SQL with Ease
            </h1>
            <p className="mx-auto max-w-[700px] text-violet-700 text-sm sm:text-base md:text-lg lg:text-xl">
              Harness the power of AI to convert natural language into precise SQL queries. Boost your productivity and simplify database interactions.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <Button onClick={handleGetStarted} size="lg" className="bg-violet-600 text-white hover:bg-violet-700">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" className="text-violet-600 border-violet-600 hover:bg-violet-100">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

