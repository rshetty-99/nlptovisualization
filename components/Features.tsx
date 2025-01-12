import { Database, Code, BarChart4 } from 'lucide-react'

export function Features() {
  return (
    <section id="features" className="py-16 bg-white dark:bg-violet-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-violet-800 dark:text-violet-200">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Database className="h-10 w-10 text-violet-600" />}
            title="Multi-Database Support"
            description="Convert natural language to SQL for various database systems including PostgreSQL, MySQL, and SQL Server."
          />
          <FeatureCard
            icon={<Code className="h-10 w-10 text-violet-600" />}
            title="AI-Powered Conversion"
            description="Leverage advanced AI models to accurately translate your queries into precise SQL statements."
          />
          <FeatureCard
            icon={<BarChart4 className="h-10 w-10 text-violet-600" />}
            title="Data Visualization"
            description="Automatically generate charts and graphs from your query results for instant insights."
          />
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-violet-50 dark:bg-violet-800 rounded-lg shadow-md">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-violet-700 dark:text-violet-300">{title}</h3>
      <p className="text-violet-600 dark:text-violet-400">{description}</p>
    </div>
  )
}

