import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/')
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
      <h1 className="mb-8 text-4xl font-bold">Dashboard</h1>
      <p className="text-xl">Welcome to your dashboard!</p>
    </div>
  )
}

