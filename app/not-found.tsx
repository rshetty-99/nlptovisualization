import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-violet-50 dark:bg-violet-900">
      <h1 className="text-4xl font-bold mb-4 text-violet-800 dark:text-violet-200">404 - Page Not Found</h1>
      <p className="text-xl mb-8 text-violet-600 dark:text-violet-400">Oops! The page you're looking for doesn't exist.</p>
      <Link href="/">
        <Button className="bg-violet-600 text-white hover:bg-violet-700">
          Go back home
        </Button>
      </Link>
    </div>
  )
}

