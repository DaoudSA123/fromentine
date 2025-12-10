import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@/lib/supabase'
import { logger } from '@/lib/logger'

export async function POST(request) {
  try {
    // Validate Stripe key first
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      )
    }

    // Initialize Stripe inside the function to avoid build-time errors
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    const body = await request.json()
    const {
      locationId,
      customerName,
      customerPhone,
      customerAddress,
      addressData,
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

    // Sanitize inputs
    const sanitizedName = customerName.trim().substring(0, 255)
    const sanitizedPhone = customerPhone.trim().substring(0, 50)
    let sanitizedAddress = null
    if (orderType === 'delivery') {
      if (addressData?.formatted_address) {
        sanitizedAddress = addressData.formatted_address.trim().substring(0, 500)
      } else if (customerAddress) {
        sanitizedAddress = customerAddress.trim().substring(0, 500)
      }
    }

    // Create order in database first (with PENDING_PAYMENT status)
    const supabase = createServerClient()
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        location_id: locationId,
        customer_name: sanitizedName,
        customer_phone: sanitizedPhone,
        customer_address: sanitizedAddress,
        type: orderType,
        total_cents: parseInt(totalCents),
        status: 'PENDING_PAYMENT', // Order is pending until payment is confirmed
      })
      .select()
      .single()

    if (orderError) {
      logger.error('Error creating order:', orderError)
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
      logger.error('Error creating order items:', itemsError)
      // Delete the order if items failed
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json(
        { error: 'Failed to create order items', details: itemsError.message },
        { status: 500 }
      )
    }

    // Prepare line items for Stripe
    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: item.size ? `Size: ${item.size}` : undefined,
        },
        unit_amount: item.price_cents, // Stripe expects amount in cents
      },
      quantity: item.quantity,
    }))

    // Get base URL for success/cancel URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   (request.headers.get('origin') || 'http://localhost:3000')

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${baseUrl}/track/${order.id}?payment=success`,
      cancel_url: `${baseUrl}/order?payment=cancelled`,
      customer_email: undefined, // You can add email field to form if needed
      metadata: {
        orderId: order.id.toString(),
        customerName: sanitizedName,
        customerPhone: sanitizedPhone,
        orderType: orderType,
      },
      // Shipping address collection if delivery
      ...(orderType === 'delivery' && sanitizedAddress && {
        shipping_address_collection: {
          allowed_countries: ['US'], // Adjust based on your service area
        },
      }),
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      orderId: order.id,
    })
  } catch (error) {
    logger.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: error.message },
      { status: 500 }
    )
  }
}

