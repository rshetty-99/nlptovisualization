'use client'

import { useState, useEffect, useRef, useOptimistic } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mic, MicOff } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { redirect, notFound } from 'next/navigation'
import { LLMProvider } from '@/services/llm/llmService'
import { LangraphAgent } from '@/services/agent/langraphAgent'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from "@/hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DataVisualization } from '@/components/DataVisualization'
import { SkeletonLoader } from '@/components/SkeletonLoader'

export default function ConverterPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState<any[] | null>(null)
  const [suggestedChartType, setSuggestedChartType] = useState<'line' | 'bar' | 'pie'>('bar')
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedModel, setSelectedModel] = useState<LLMProvider>(LLMProvider.Ollama)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const { isSignedIn, isLoaded } = useUser()
  const { toast } = useToast()
  const agentRef = useRef<LangraphAgent | null>(null)

  const [optimisticOutput, setOptimisticOutput] = useOptimistic(
    output,
    (state, newOutput: any[] | null) => newOutput
  )

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      redirect('/')
    }
    agentRef.current = new LangraphAgent(selectedModel, getModelName(selectedModel))
  }, [isSignedIn, isLoaded, selectedModel])

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('')
        setInput(transcript)
      }
    }
  }, [])

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
    } else {
      recognitionRef.current?.start()
    }
    setIsListening(!isListening)
  }

  const handleProcess = async () => {
    setIsProcessing(true)
    setOptimisticOutput([{ processing: 'Processing your query...' }])
    try {
      const result = await agentRef.current?.process(input)
      if (result?.error) {
        throw new Error(result.error)
      }
      if (!result?.result || result.result.length === 0) {
        throw new Error("No results found")
      }
      setOutput(result?.result)
      setOptimisticOutput(result?.result)
      setSuggestedChartType(result?.suggestedChartType || 'bar')
      toast({
        title: "Query Processed",
        description: "Your query has been successfully processed.",
      })
    } catch (error) {
      console.error('Error processing query:', error)
      setOutput(null)
      setOptimisticOutput(null)
      if (error instanceof Error && error.message === "No results found") {
        notFound()
      } else {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive",
        })
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const getModelName = (provider: LLMProvider): string => {
    switch (provider) {
      case LLMProvider.OpenAI:
        return 'gpt-3.5-turbo'
      case LLMProvider.Anthropic:
        return 'claude-2'
      case LLMProvider.Ollama:
        return 'llama2'
      default:
        return 'llama2'
    }
  }

  if (!isLoaded || !isSignedIn) {
    return null // or a loading spinner
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
      <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-violet-900">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl md:text-4xl text-center text-violet-800 dark:text-violet-200">Text to SQL Server Converter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type or speak your query here..."
              className="flex-grow border-violet-300 focus:border-violet-500 focus:ring-violet-500"
            />
            <Button onClick={toggleListening} variant="outline" className="w-full sm:w-auto text-violet-600 border-violet-600 hover:bg-violet-100 dark:text-violet-300 dark:border-violet-300 dark:hover:bg-violet-800">
              {isListening ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
              {isListening ? 'Stop' : 'Start'} Listening
            </Button>
          </div>
          <div className="mb-4">
            <Select value={selectedModel} onValueChange={(value) => setSelectedModel(value as LLMProvider)}>
              <SelectTrigger className="border-violet-300 focus:border-violet-500 focus:ring-violet-500">
                <SelectValue placeholder="Select LLM Model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={LLMProvider.Ollama}>Ollama (Default)</SelectItem>
                <SelectItem value={LLMProvider.OpenAI}>OpenAI</SelectItem>
                <SelectItem value={LLMProvider.Anthropic}>Anthropic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleProcess} disabled={isProcessing} className="w-full mb-4 bg-violet-600 text-white hover:bg-violet-700">
            {isProcessing ? 'Processing...' : 'Process Query'}
          </Button>
          <div className="bg-violet-50 dark:bg-violet-800 p-4 rounded-md min-h-[100px] overflow-auto">
            {isProcessing ? (
              <SkeletonLoader />
            ) : optimisticOutput ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(optimisticOutput[0]).map((key) => (
                      <TableHead key={key} className="text-violet-700 dark:text-violet-300">{key}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {optimisticOutput.map((row, index) => (
                    <TableRow key={index}>
                      {Object.values(row).map((value: any, cellIndex) => (
                        <TableCell key={cellIndex} className="text-violet-600 dark:text-violet-400">
                          {Array.isArray(value) ? JSON.stringify(value) : String(value)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="font-mono text-sm sm:text-base break-words text-violet-600 dark:text-violet-400">Query results will appear here</p>
            )}
          </div>
        </CardContent>
      </Card>
      {optimisticOutput && !isProcessing && (
        <div className="mt-8">
          {isProcessing ? (
            <SkeletonLoader />
          ) : (
            <DataVisualization data={optimisticOutput} suggestedChartType={suggestedChartType} />
          )}
        </div>
      )}
    </div>
  )
}

