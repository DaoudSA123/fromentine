import { createServerClient } from '@/lib/supabase'
import { verifyAdminAuth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

const ALLOWED_STATUSES = [
  'RECEIVED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'COMPLETED',
  'CANCELLED',
]

export async function PATCH(request, { params }) {
  try {
    const resolvedParams = await params
    const { id } = resolvedParams
    const body = await request.json()
    const { status, cancel_reason } = body

    if (!id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + ALLOWED_STATUSES.join(', ') },
        { status: 400 }
      )
    }

    // Verify admin authentication
    const authResult = await verifyAdminAuth(request)
    if (authResult.error) {
      return authResult.error
    }

    const supabase = createServerClient()

    // Check current order status - prevent cancelling completed orders
    const { data: currentOrder } = await supabase
      .from('orders')
      .select('status')
      .eq('id', id)
      .single()

    if (!currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (status === 'CANCELLED' && currentOrder.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot cancel a completed order' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData = { status }
    if (status === 'CANCELLED' && cancel_reason) {
      // Store cancel reason if provided (you may need to add this column to your orders table)
      // For now, we'll just log it. You can add a cancel_reason column if needed.
      logger.log(`Order ${id} cancelled. Reason: ${cancel_reason}`)
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Error updating order status:', error)
      return NextResponse.json(
        { error: 'Failed to update order status', details: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(
      {
        message: 'Order status updated successfully',
        order: data,
      },
      { status: 200 }
    )
  } catch (error) {
    logger.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

