import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, phone, message } = body

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Sanitize inputs
    const sanitizedName = name.trim().substring(0, 255)
    const sanitizedEmail = email.trim().toLowerCase().substring(0, 255)
    const sanitizedPhone = phone ? phone.trim().substring(0, 50) : null
    const sanitizedMessage = message.trim().substring(0, 2000)

    // Insert contact using service_role (server-side only)
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('catering_contacts')
      .insert({
        name: sanitizedName,
        email: sanitizedEmail,
        phone: sanitizedPhone,
        message: sanitizedMessage,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating contact:', error)
      return NextResponse.json(
        { error: 'Failed to submit contact form', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: 'Contact form submitted successfully',
        id: data.id,
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






