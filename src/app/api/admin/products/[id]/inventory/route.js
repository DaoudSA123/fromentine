import { createServerClient } from '@/lib/supabase'
import { verifyAdminAuth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export async function PATCH(request, { params }) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request)
    if (authResult.error) {
      return authResult.error
    }

    const resolvedParams = await params
    const { id } = resolvedParams
    const body = await request.json()
    const { inventory_count, is_out_of_stock } = body

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const supabase = createServerClient()

    // First, get the product to check its category
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('category, inventory_count')
      .eq('id', id)
      .single()

    if (fetchError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const isGrocery = product.category === 'groceries'
    let newInventoryCount = null

    // Handle different rules based on category
    if (isGrocery) {
      // Groceries: numeric value OR "Out of Stock" (checkbox overrides number)
      if (is_out_of_stock === true) {
        newInventoryCount = 0
      } else if (inventory_count !== undefined && inventory_count !== null) {
        const count = parseInt(inventory_count)
        if (isNaN(count) || count < 0) {
          return NextResponse.json(
            { error: 'inventory_count must be a non-negative integer' },
            { status: 400 }
          )
        }
        newInventoryCount = count
      } else {
        return NextResponse.json(
          { error: 'Either inventory_count or is_out_of_stock must be provided for groceries' },
          { status: 400 }
        )
      }
    } else {
      // Non-groceries: only "Out of Stock" toggle
      if (is_out_of_stock === true) {
        newInventoryCount = 0
      } else if (is_out_of_stock === false) {
        // Set to null to indicate "in stock" (no count tracked)
        newInventoryCount = null
      } else {
        return NextResponse.json(
          { error: 'is_out_of_stock (boolean) is required for non-grocery items' },
          { status: 400 }
        )
      }
    }

    // Update the product
    const { data, error } = await supabase
      .from('products')
      .update({ inventory_count: newInventoryCount })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Error updating inventory:', error)
      return NextResponse.json(
        { error: 'Failed to update inventory', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: 'Inventory updated successfully',
        product: data,
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

