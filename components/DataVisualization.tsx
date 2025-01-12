import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart, LineChart, PieChart, ResponsiveContainer, Bar, XAxis, YAxis, Tooltip, Legend, Line, Pie, Cell } from 'recharts'
import { SkeletonLoader } from './SkeletonLoader'

interface DataVisualizationProps {
  data: any[]
  suggestedChartType: 'line' | 'bar' | 'pie'
}

const COLORS = ['#8b5cf6', '#6d28d9', '#5b21b6', '#4c1d95', '#7c3aed']

export function DataVisualization({ data, suggestedChartType }: DataVisualizationProps) {
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>(suggestedChartType)
  const [isLoading, setIsLoading] = useState(false)

  const renderChart = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 500) // Simulate loading

    if (isLoading) {
      return <SkeletonLoader />
    }

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(data[0]).filter(key => key !== 'name').map((key, index) => (
                <Line key={key} type="monotone" dataKey={key} stroke={COLORS[index % COLORS.length]} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(data[0]).filter(key => key !== 'name').map((key, index) => (
                <Bar key={key} dataKey={key} fill={COLORS[index % COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={150}
                fill="#8884d8"
                dataKey={Object.keys(data[0])[1]}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )
    }
  }

  return (
    <Card className="w-full bg-white dark:bg-violet-900">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold text-violet-800 dark:text-violet-200">Data Visualization</CardTitle>
        <Select value={chartType} onValueChange={(value: 'line' | 'bar' | 'pie') => setChartType(value)}>
          <SelectTrigger className="w-[180px] border-violet-300 focus:border-violet-500 focus:ring-violet-500">
            <SelectValue placeholder="Select chart type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="line">Line Chart</SelectItem>
            <SelectItem value="bar">Bar Chart</SelectItem>
            <SelectItem value="pie">Pie Chart</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  )
}

