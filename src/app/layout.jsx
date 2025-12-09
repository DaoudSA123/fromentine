import './globals.css'
import Navigation from '@/components/Navigation'

export const metadata = {
  title: 'Fromentine Restaurant',
  description: 'Order delicious food, groceries, and more from Fromentine',
  icons: {
    icon: '/images/fromentineLogo.png',
    apple: '/images/fromentineLogo.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navigation />
        {children}
      </body>
    </html>
  )
}


