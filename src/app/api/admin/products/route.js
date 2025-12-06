import { createServerClient } from '@/lib/supabase'
import { verifyAdminAuth } from '@/lib/auth'
import { NextResponse } from 'next/server'

// GET - List all products with optional filtering
export async function GET(request) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request)
    if (authResult.error) {
      return authResult.error
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const isGrocery = searchParams.get('is_grocery')

    const supabase = createServerClient()
    let query = supabase
      .from('products')
      .select('*')
      .order('name')

    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }
    
    if (isGrocery === 'true') {
      query = query.eq('category', 'groceries')
    } else if (isGrocery === 'false') {
      query = query.neq('category', 'groceries')
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json(
        { error: 'Failed to fetch products', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ products: data || [] }, { status: 200 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Create new product
export async function POST(request) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request)
    if (authResult.error) {
      return authResult.error
    }

    const body = await request.json()
    const { name, description, price_cents, category, image_url, inventory_count } = body

    // Validate required fields
    if (!name || !price_cents || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: name, price_cents, and category are required' },
        { status: 400 }
      )
    }

    // Validate price
    const price = parseInt(price_cents)
    if (isNaN(price) || price <= 0) {
      return NextResponse.json(
        { error: 'price_cents must be a positive integer' },
        { status: 400 }
      )
    }

    // Validate inventory_count if provided
    let inventory = null
    if (inventory_count !== undefined && inventory_count !== null) {
      inventory = parseInt(inventory_count)
      if (isNaN(inventory) || inventory < 0) {
        return NextResponse.json(
          { error: 'inventory_count must be a non-negative integer' },
          { status: 400 }
        )
      }
    }

    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('products')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        price_cents: price,
        category: category.trim(),
        image_url: image_url?.trim() || null,
        inventory_count: inventory,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating product:', error)
      return NextResponse.json(
        { error: 'Failed to create product', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: 'Product created successfully',
        product: data,
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

