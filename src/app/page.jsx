import Hero from '@/components/Hero'
import OrderSection from '@/components/OrderSection'
import GroceriesSection from '@/components/GroceriesSection'
import PromotionsSection from '@/components/PromotionsSection'
import ContactSection from '@/components/ContactSection'
import DrinksPromoSection from '@/components/DrinksPromoSection'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <OrderSection />
      <GroceriesSection />
      <PromotionsSection />
      <DrinksPromoSection />
      <ContactSection />
    </main>
  )
}


