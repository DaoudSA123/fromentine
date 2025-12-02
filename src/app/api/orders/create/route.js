import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      locationId,
      customerName,
      customerPhone,
      customerAddress,
      orderType,
      items,
      totalCents,
    } = body

    // Validate required fields
    if (
      !locationId ||
      !customerName ||
      !customerPhone ||
      !orderType ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !totalCents
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate order type
    if (!['pickup', 'delivery'].includes(orderType)) {
      return NextResponse.json(
        { error: 'Invalid order type' },
        { status: 400 }
      )
    }

    // Validate delivery address if needed
    if (orderType === 'delivery' && !customerAddress) {
      return NextResponse.json(
        { error: 'Delivery address required for delivery orders' },
        { status: 400 }
      )
    }

    // Sanitize inputs
    const sanitizedName = customerName.trim().substring(0, 255)
    const sanitizedPhone = customerPhone.trim().substring(0, 50)
    const sanitizedAddress = customerAddress
      ? customerAddress.trim().substring(0, 500)
      : null

    // Create order using service_role (server-side only)
    const supabase = createServerClient()

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        location_id: locationId,
        customer_name: sanitizedName,
        customer_phone: sanitizedPhone,
        customer_address: sanitizedAddress,
        type: orderType,
        total_cents: parseInt(totalCents),
        status: 'RECEIVED',
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return NextResponse.json(
        { error: 'Failed to create order', details: orderError.message },
        { status: 500 }
      )
    }

    // Insert order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      qty: parseInt(item.quantity),
      price_cents: parseInt(item.price_cents),
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      // Try to delete the order if items failed
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json(
        { error: 'Failed to create order items', details: itemsError.message },
        { status: 500 }
      )
    }

    // TODO: Integrate payment processing here (Stripe/Payments)
    // After payment confirmation, update order status or create payment record

    return NextResponse.json(
      {
        orderId: order.id,
        message: 'Order created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}


