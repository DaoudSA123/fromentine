import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function PATCH(request, { params }) {
  try {
    const resolvedParams = await params
    const { id } = resolvedParams
    const body = await request.json()
    const { inventory_count } = body

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    if (inventory_count === undefined || inventory_count === null) {
      return NextResponse.json(
        { error: 'inventory_count is required' },
        { status: 400 }
      )
    }

    const count = parseInt(inventory_count)
    if (isNaN(count) || count < 0) {
      return NextResponse.json(
        { error: 'inventory_count must be a non-negative integer' },
        { status: 400 }
      )
    }

    // TODO: Add authentication check here
    // Verify that the user is an admin via Supabase Auth
    // For now, this endpoint is protected by service_role key usage

    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('products')
      .update({ inventory_count: count })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating inventory:', error)
      return NextResponse.json(
        { error: 'Failed to update inventory', details: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(
      {
        message: 'Inventory updated successfully',
        product: data,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

