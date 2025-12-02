import TrackOrder from '@/components/TrackOrder'

export default async function TrackOrderPage({ params }) {
  // In Next.js 14+, params might be a Promise
  const resolvedParams = await params
  return (
    <main className="min-h-screen py-8 bg-white">
      <TrackOrder orderId={resolvedParams.orderId} />
    </main>
  )
}

