import { createServerClient } from '@/lib/supabase'
import { verifyAdminAuth } from '@/lib/auth'
import { NextResponse } from 'next/server'

// PATCH - Update product
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

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    // Build update object with only provided fields
    const updates = {}
    
    if (body.name !== undefined) {
      updates.name = body.name.trim()
    }
    if (body.description !== undefined) {
      updates.description = body.description?.trim() || null
    }
    if (body.price_cents !== undefined) {
      const price = parseInt(body.price_cents)
      if (isNaN(price) || price <= 0) {
        return NextResponse.json(
          { error: 'price_cents must be a positive integer' },
          { status: 400 }
        )
      }
      updates.price_cents = price
    }
    if (body.category !== undefined) {
      updates.category = body.category.trim()
    }
    if (body.image_url !== undefined) {
      updates.image_url = body.image_url?.trim() || null
    }
    if (body.inventory_count !== undefined) {
      if (body.inventory_count === null) {
        updates.inventory_count = null
      } else {
        const inventory = parseInt(body.inventory_count)
        if (isNaN(inventory) || inventory < 0) {
          return NextResponse.json(
            { error: 'inventory_count must be a non-negative integer or null' },
            { status: 400 }
          )
        }
        updates.inventory_count = inventory
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating product:', error)
      return NextResponse.json(
        { error: 'Failed to update product', details: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(
      {
        message: 'Product updated successfully',
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

// DELETE - Delete product
export async function DELETE(request, { params }) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request)
    if (authResult.error) {
      return authResult.error
    }

    const resolvedParams = await params
    const { id } = resolvedParams

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Check if product exists
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Optional: Check if product is used in any orders
    // For now, we'll allow deletion (hard delete)
    // You can uncomment below to prevent deletion if product is in orders:
    /*
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('id')
      .eq('product_id', id)
      .limit(1)

    if (orderItems && orderItems.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product that has been ordered' },
        { status: 400 }
      )
    }
    */

    // Delete the product
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting product:', error)
      return NextResponse.json(
        { error: 'Failed to delete product', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Product deleted successfully' },
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

