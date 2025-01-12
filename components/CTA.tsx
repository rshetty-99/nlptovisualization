import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function CTA() {
  return (
    <section id="cta" className="py-16 bg-violet-600 dark:bg-violet-800">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4 text-white">Ready to Simplify Your Database Queries?</h2>
        <p className="mb-8 text-violet-100 max-w-2xl mx-auto">
          Join thousands of developers and data analysts who are already using SQLConvert to boost their productivity.
        </p>
        <Button size="lg" className="bg-white text-violet-600 hover:bg-violet-100">
          Get Started Now <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </section>
  )
}

