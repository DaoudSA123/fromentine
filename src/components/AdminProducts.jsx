'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, X, Save, Loader2, Package, ShoppingBag } from 'lucide-react'
import { authenticatedFetch } from '@/lib/api'

// Product Row Component for inventory management
function ProductRow({ product, index, isGrocery, isOutOfStock, onEdit, onDelete, onInventoryUpdate, deletingId }) {
  const [localInventory, setLocalInventory] = useState(
    product.inventory_count?.toString() || ''
  )
  const [localOutOfStock, setLocalOutOfStock] = useState(isOutOfStock)

  // Sync with product updates
  useEffect(() => {
    setLocalInventory(product.inventory_count?.toString() || '')
    // Only mark as out of stock if inventory_count is explicitly 0
    // For non-groceries: null means in stock, 0 means out of stock
    // For groceries: 0 means out of stock
    // Use strict check: must be exactly 0, not null or undefined
    setLocalOutOfStock(product.inventory_count !== null && product.inventory_count !== undefined && product.inventory_count === 0)
  }, [product.inventory_count])

  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="hover:bg-white/5 transition-colors"
    >
      <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
        {product.name}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
        {product.category === 'groceries' 
          ? 'Groceries' 
          : product.category 
            ? product.category.charAt(0).toUpperCase() + product.category.slice(1).toLowerCase()
            : product.category}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
        ${((product.price_cents || 0) / 100).toFixed(2)}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm">
        {isGrocery ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              value={localInventory}
              onChange={(e) => {
                setLocalInventory(e.target.value)
                if (e.target.value !== '' && !localOutOfStock) {
                  onInventoryUpdate(
                    product.id,
                    true,
                    e.target.value,
                    false
                  )
                }
              }}
              onBlur={(e) => {
                if (e.target.value === '') {
                  setLocalInventory(product.inventory_count?.toString() || '')
                } else if (!localOutOfStock) {
                  onInventoryUpdate(
                    product.id,
                    true,
                    e.target.value,
                    localOutOfStock
                  )
                }
              }}
              disabled={localOutOfStock}
              className="w-20 px-2 py-1 glass rounded text-gray-900 text-sm focus:ring-2 focus:ring-yellow-500 focus:outline-none disabled:opacity-50"
            />
            <label className="flex items-center gap-1 text-gray-900 cursor-pointer">
              <input
                type="checkbox"
                checked={localOutOfStock}
                onChange={(e) => {
                  setLocalOutOfStock(e.target.checked)
                  onInventoryUpdate(
                    product.id,
                    true,
                    e.target.checked ? 0 : (localInventory || product.inventory_count || 0),
                    e.target.checked
                  )
                }}
                className="w-4 h-4 accent-yellow-500"
              />
              <span className="text-xs">Out</span>
            </label>
          </div>
        ) : (
          <label className="flex items-center gap-2 text-white cursor-pointer">
            <input
              type="checkbox"
              checked={localOutOfStock}
              onChange={(e) => {
                setLocalOutOfStock(e.target.checked)
                onInventoryUpdate(
                  product.id,
                  false,
                  null,
                  e.target.checked
                )
              }}
              className="w-4 h-4 accent-yellow-500"
            />
            <span className="text-xs">
              {localOutOfStock ? 'Out of Stock' : 'In Stock'}
            </span>
          </label>
        )}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm">
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onEdit(product)}
            className="text-yellow-500 hover:text-yellow-400 transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(product.id)}
            disabled={deletingId === product.id}
            className="text-red-500 hover:text-red-400 transition-colors disabled:opacity-50"
            title="Delete"
          >
            {deletingId === product.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </motion.button>
        </div>
      </td>
    </motion.tr>
  )
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all') // 'all' or category name
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_cents: '',
    category: '',
    image_url: '',
    inventory_count: null,
    is_out_of_stock: false,
    newCategory: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    try {
      setLoading(true)
      const response = await authenticatedFetch('/api/admin/products')
      
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }

      const { products: productsData } = await response.json()
      setProducts(productsData || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  // Get all unique categories from products
  // Always include 'groceries' even if no products exist yet
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))]
    // Ensure 'groceries' is always included
    if (!uniqueCategories.includes('groceries')) {
      uniqueCategories.push('groceries')
    }
    return uniqueCategories.sort()
  }, [products])

  // Get product count for each category
  const getCategoryCount = (category) => {
    if (category === 'all') return products.length
    return products.filter(p => p.category === category).length
  }

  // Filter products based on active tab and search
  const filteredProducts = products.filter((product) => {
    const matchesTab = activeTab === 'all' || product.category === activeTab
    
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesTab && matchesSearch
  })

  function resetForm() {
    setFormData({
      name: '',
      description: '',
      price_cents: '',
      category: '',
      image_url: '',
      inventory_count: null,
      is_out_of_stock: false,
      newCategory: '',
    })
    setEditingProduct(null)
    setShowAddForm(false)
    setError(null)
  }

  function handleEdit(product) {
    setEditingProduct(product)
    // Only mark as out of stock if inventory_count is explicitly 0
    // For non-groceries: null means in stock, 0 means out of stock
    // Use strict check: must be exactly 0, not null or undefined
    const isOutOfStock = product.inventory_count !== null && product.inventory_count !== undefined && product.inventory_count === 0
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price_cents: product.price_cents ? (product.price_cents / 100).toFixed(2) : '',
      category: product.category || '',
      image_url: product.image_url || '',
      inventory_count: product.inventory_count,
      is_out_of_stock: isOutOfStock,
      newCategory: '',
    })
    setShowAddForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const priceCents = Math.round(parseFloat(formData.price_cents) * 100)
      
      if (isNaN(priceCents) || priceCents <= 0) {
        throw new Error('Price must be greater than 0')
      }

      const isGrocery = formData.category === 'groceries'
      let inventoryCount = null

      if (isGrocery) {
        // Groceries: use inventory_count if provided, or 0 if out of stock
        if (formData.is_out_of_stock) {
          inventoryCount = 0
        } else if (formData.inventory_count !== null && formData.inventory_count !== '') {
          inventoryCount = parseInt(formData.inventory_count)
          if (isNaN(inventoryCount) || inventoryCount < 0) {
            throw new Error('Inventory count must be a non-negative number')
          }
        }
      } else {
        // Non-groceries: 0 if out of stock, null otherwise
        inventoryCount = formData.is_out_of_stock ? 0 : null
      }

      // Handle new category creation
      let categoryValue = formData.category.trim()
      if (categoryValue === '__new__' && formData.newCategory) {
        categoryValue = formData.newCategory.trim()
      }
      
      if (!categoryValue) {
        throw new Error('Category is required')
      }

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price_cents: priceCents,
        category: categoryValue,
        image_url: formData.image_url.trim() || null,
        inventory_count: inventoryCount,
      }

      let response
      if (editingProduct) {
        // Update existing product
        response = await authenticatedFetch(`/api/admin/products/${editingProduct.id}`, {
          method: 'PATCH',
          body: JSON.stringify(productData),
        })
      } else {
        // Create new product
        response = await authenticatedFetch('/api/admin/products', {
          method: 'POST',
          body: JSON.stringify(productData),
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save product')
      }

      // Optimistic update
      const { product } = await response.json()
      
      if (editingProduct) {
        setProducts(products.map(p => p.id === product.id ? product : p))
      } else {
        setProducts([...products, product])
      }

      resetForm()
    } catch (error) {
      console.error('Error saving product:', error)
      setError(error.message || 'Failed to save product')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(productId) {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return
    }

    setDeletingId(productId)
    try {
      // Optimistic update
      const productToDelete = products.find(p => p.id === productId)
      setProducts(products.filter(p => p.id !== productId))

      const response = await authenticatedFetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        // Revert on error
        setProducts([...products, productToDelete])
        throw new Error('Failed to delete product')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert(error.message || 'Failed to delete product')
      // Refresh to get correct state
      fetchProducts()
    } finally {
      setDeletingId(null)
    }
  }

  async function handleInventoryUpdate(productId, isGrocery, inventoryCount, isOutOfStock) {
    try {
      const updateData = isGrocery
        ? {
            inventory_count: isOutOfStock ? 0 : (inventoryCount !== null ? parseInt(inventoryCount) : null),
            is_out_of_stock: isOutOfStock,
          }
        : {
            is_out_of_stock: isOutOfStock,
          }

      // Optimistic update
      const product = products.find(p => p.id === productId)
      const updatedProduct = {
        ...product,
        inventory_count: isOutOfStock ? 0 : (isGrocery ? (inventoryCount !== null ? parseInt(inventoryCount) : null) : null),
      }
      setProducts(products.map(p => p.id === productId ? updatedProduct : p))

      const response = await authenticatedFetch(`/api/admin/products/${productId}/inventory`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        // Revert on error
        setProducts(products.map(p => p.id === productId ? product : p))
        throw new Error('Failed to update inventory')
      }

      const { product: updated } = await response.json()
      setProducts(products.map(p => p.id === productId ? updated : p))
    } catch (error) {
      console.error('Error updating inventory:', error)
      alert(error.message || 'Failed to update inventory')
      fetchProducts() // Refresh to get correct state
    }
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-20"
      >
        <Loader2 className="w-8 h-8 animate-spin text-gray-700 mx-auto mb-4" />
        <p className="text-gray-700 text-lg">Loading products...</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with tabs and add button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Product Management</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              resetForm()
              setShowAddForm(true)
            }}
            className="glass-button bg-yellow-500 hover:bg-orange-400 active:bg-orange-400 text-white hover:text-black active:text-black px-6 py-2 font-semibold transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </motion.button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-yellow-500 text-black shadow-md'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
          >
            All ({products.length})
          </button>
          {categories.map((category) => {
            const count = getCategoryCount(category)
            const isGroceries = category.toLowerCase() === 'groceries'
            // Capitalize category name for display
            const displayName = isGroceries 
              ? 'Groceries' 
              : category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
            return (
              <button
                key={category}
                onClick={() => setActiveTab(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  activeTab === category
                    ? 'bg-yellow-500 text-black shadow-md'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                {isGroceries ? (
                  <ShoppingBag className="w-4 h-4" />
                ) : (
                  <Package className="w-4 h-4" />
                )}
                {displayName} ({count})
              </button>
            )
          })}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 glass rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
        />
      </motion.div>

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) resetForm()
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-panel max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-900 hover:text-gray-700 transition-colors bg-white/20 hover:bg-white/30 p-2 rounded-lg"
                  aria-label="Close"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 glass rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                    placeholder="Product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-2 glass rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none resize-none"
                    placeholder="Product description (optional)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.price_cents}
                      onChange={(e) => setFormData({ ...formData, price_cents: e.target.value })}
                      required
                      className="w-full px-4 py-2 glass rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                      className="w-full px-4 py-2 glass rounded-lg text-gray-900 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                    >
                      <option value="">Select a category</option>
                      {/* Include groceries (capitalized) */}
                      <option value="groceries">Groceries</option>
                      {/* Include all other existing categories */}
                      {categories
                        .filter(cat => cat.toLowerCase() !== 'groceries')
                        .map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      {/* Option to add new category */}
                      <option value="__new__">+ Add New Category</option>
                    </select>
                    {/* Show input field if "Add New Category" is selected */}
                    {formData.category === '__new__' && (
                      <input
                        type="text"
                        value={formData.newCategory || ''}
                        onChange={(e) => {
                          setFormData({ 
                            ...formData, 
                            newCategory: e.target.value
                          })
                        }}
                        placeholder="Enter new category name"
                        className="w-full mt-2 px-4 py-2 glass rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                        autoFocus
                        required
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-2 glass rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Stock Management - Category Specific */}
                {formData.category === 'groceries' ? (
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Stock Management
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <input
                          type="number"
                          min="0"
                          value={formData.inventory_count || ''}
                          onChange={(e) => setFormData({ ...formData, inventory_count: e.target.value })}
                          disabled={formData.is_out_of_stock}
                          className="w-full px-4 py-2 glass rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none disabled:opacity-50"
                          placeholder="Stock quantity"
                        />
                      </div>
                      <label className="flex items-center gap-2 text-gray-900 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.is_out_of_stock}
                          onChange={(e) => setFormData({ ...formData, is_out_of_stock: e.target.checked })}
                          className="w-5 h-5 accent-yellow-500"
                        />
                        <span>Out of Stock</span>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Stock Status
                    </label>
                    <label className="flex items-center gap-2 text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_out_of_stock}
                        onChange={(e) => setFormData({ ...formData, is_out_of_stock: e.target.checked })}
                        className="w-5 h-5 accent-yellow-500"
                      />
                      <span>Out of Stock</span>
                    </label>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={{ scale: submitting ? 1 : 1.02 }}
                    whileTap={{ scale: submitting ? 1 : 0.98 }}
                    className="w-full glass-button bg-yellow-500 hover:bg-orange-400 active:bg-orange-400 text-white hover:text-black active:text-black py-3 font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {editingProduct ? 'Update Product' : 'Create Product'}
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel"
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          {activeTab === 'all' 
            ? 'All Products' 
            : activeTab.toLowerCase() === 'groceries' 
              ? 'Groceries' 
              : activeTab.charAt(0).toUpperCase() + activeTab.slice(1).toLowerCase()}
          {` (${filteredProducts.length})`}
        </h3>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product, index) => {
                  const isGrocery = product.category === 'groceries'
                  // For non-groceries: only out of stock if inventory_count is explicitly 0 (null means in stock)
                  // For groceries: out of stock if inventory_count is 0
                  // Use strict check: must be exactly 0, not null or undefined
                  const isOutOfStock = product.inventory_count !== null && product.inventory_count !== undefined && product.inventory_count === 0

                  return (
                    <ProductRow
                      key={product.id}
                      product={product}
                      index={index}
                      isGrocery={isGrocery}
                      isOutOfStock={isOutOfStock}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onInventoryUpdate={handleInventoryUpdate}
                      deletingId={deletingId}
                    />
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}

