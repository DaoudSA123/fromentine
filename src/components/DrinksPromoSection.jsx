'use client'

export default function DrinksPromoSection() {
  // TODO: Update this URL with the actual drinks website URL
  const DRINKS_URL = 'https://drinks.example.com'

  return (
    <section id="drinks" className="py-16 bg-orange-500 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-4">Special Drinks Promotion</h2>
        <p className="text-xl mb-8 opacity-90">
          Check out our exclusive drinks selection and special offers!
        </p>
        <a
          href={DRINKS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-4 rounded-lg font-bold text-lg transition-colors"
          aria-label="Visit drinks promotion website"
        >
          View Drinks Menu →
        </a>
      </div>
    </section>
  )
}


