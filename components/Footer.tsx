import Link from 'next/link'
import { Database } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-violet-800 text-violet-200 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Database className="h-6 w-6 mr-2" />
            <span className="text-xl font-bold">SQLConvert</span>
          </div>
          <nav className="flex flex-wrap justify-center md:justify-end gap-4">
            <Link href="/#features" className="hover:text-white">Features</Link>
            <Link href="/#testimonials" className="hover:text-white">Testimonials</Link>
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms of Service</Link>
          </nav>
        </div>
        <div className="mt-8 text-center text-violet-400 text-sm">
          © {new Date().getFullYear()} SQLConvert. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

