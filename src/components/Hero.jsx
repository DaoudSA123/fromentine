'use client'

export default function Hero() {
  return (
    <section className="relative bg-black text-white min-h-[60vh] flex items-center justify-center">
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span className="text-yellow-400">Fromentine</span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-300">
          Delicious Food, Fresh Groceries, and More
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#order"
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            aria-label="Start ordering"
          >
            Order Now
          </a>
          <a
            href="#promotions"
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-3 rounded-lg font-semibold transition-colors"
            aria-label="View promotions"
          >
            View Promotions
          </a>
        </div>
      </div>
    </section>
  )
}


