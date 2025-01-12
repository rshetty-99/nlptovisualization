import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { Features } from '@/components/Features'
import { Testimonials } from '@/components/Testimonials'
import { CTA } from '@/components/CTA'
import { Footer } from '@/components/Footer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900 dark:to-violet-950">
      <Header />
      <main>
        <Hero />
        <Features />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}

