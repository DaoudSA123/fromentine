'use client'

export default function ProductCard({ product, onAddToCart }) {
  const priceDollars = (product.price_cents / 100).toFixed(2)

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      {product.image_url && (
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-black mb-2">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-gray-600 mb-3">{product.description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-orange-500">
            ${priceDollars}
          </span>
          <button
            onClick={() => onAddToCart(product)}
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold transition-colors"
            aria-label={`Add ${product.name} to cart`}
          >
            Add to Cart
          </button>
        </div>
        {product.inventory_count !== undefined && (
          <p className="text-xs text-gray-500 mt-2">
            {product.inventory_count > 0
              ? `${product.inventory_count} in stock`
              : 'Out of stock'}
          </p>
        )}
      </div>
    </div>
  )
}


