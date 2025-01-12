import { Card, CardContent } from '@/components/ui/card'

export function Testimonials() {
  return (
    <section id="testimonials" className="py-16 bg-violet-50 dark:bg-violet-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-violet-800 dark:text-violet-200">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <TestimonialCard
            quote="SQLConvert has revolutionized how I interact with databases. It's like having a SQL expert at my fingertips!"
            author="Jane Doe"
            role="Data Analyst"
          />
          <TestimonialCard
            quote="The AI-powered conversion is incredibly accurate. It's saved me countless hours of writing complex queries."
            author="John Smith"
            role="Software Engineer"
          />
          <TestimonialCard
            quote="As a non-technical founder, SQLConvert has been a game-changer for our data-driven decision making."
            author="Emily Johnson"
            role="Startup Founder"
          />
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({ quote, author, role }: { quote: string; author: string; role: string }) {
  return (
    <Card className="bg-white dark:bg-violet-800">
      <CardContent className="p-6">
        <p className="text-violet-600 dark:text-violet-300 mb-4">"{quote}"</p>
        <div className="font-semibold text-violet-700 dark:text-violet-200">{author}</div>
        <div className="text-sm text-violet-500 dark:text-violet-400">{role}</div>
      </CardContent>
    </Card>
  )
}

