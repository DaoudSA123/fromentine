import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@/lib/supabase'

export async function POST(request) {
  try {
    // Validate Stripe keys first
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      )
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET is not set')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    // Initialize Stripe inside the function to avoid build-time errors
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    let event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const orderId = session.metadata?.orderId

        if (!orderId) {
          console.error('Order ID not found in session metadata')
          break
        }

        // Update order status to RECEIVED (payment confirmed)
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            status: 'RECEIVED',
            // You can also store payment info if needed
            // payment_intent_id: session.payment_intent,
            // payment_status: 'paid',
          })
          .eq('id', parseInt(orderId))

        if (updateError) {
          console.error('Error updating order status:', updateError)
        } else {
          console.log(`Order ${orderId} payment confirmed and status updated`)
        }
        break
      }

      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object
        const orderId = session.metadata?.orderId

        if (orderId) {
          const { error: updateError } = await supabase
            .from('orders')
            .update({ status: 'RECEIVED' })
            .eq('id', parseInt(orderId))

          if (updateError) {
            console.error('Error updating order status:', updateError)
          }
        }
        break
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object
        const orderId = session.metadata?.orderId

        if (orderId) {
          // Update order status to indicate payment failed
          const { error: updateError } = await supabase
            .from('orders')
            .update({ status: 'PAYMENT_FAILED' })
            .eq('id', parseInt(orderId))

          if (updateError) {
            console.error('Error updating order status:', updateError)
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed', details: error.message },
      { status: 500 }
    )
  }
}

// Note: In Next.js App Router, we need to get raw body
// The body is already text() in the handler above








