'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function USerQuestion() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Record<string, string>[]>([])

  const handleQuery = async () => {
    try {
      const response = await fetch(`/api/query?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Query failed:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <div className="flex flex-col justify-center">
          <Label htmlFor="query" className="text-foreground mb-2">Search Query</Label>
          <Textarea
            id="query"
            // type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your query"
            className="bg-white/20 dark:bg-white/10 backdrop-blur-md border-2 border-accent/20 rounded-full focus:border-accent placeholder:text-foreground/50 text-black dark:text-white h-20 px-6"
          />
        </div>
      </div>
      <Button 
        onClick={handleQuery}
        className="bg-accent hover:bg-accent/90 text-black dark:text-white rounded-full px-8 font-semibold h-12"
      >
        Search
      </Button>
      {results.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2 text-foreground">Results:</h2>
          <pre className="bg-white/10 backdrop-blur-md p-4 rounded-xl border-2 border-accent/20 overflow-auto max-h-60 text-black dark:text-white">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

