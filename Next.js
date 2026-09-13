// app/page.tsx
import { prisma } from '@/lib/prisma'
import ListingCard from '@/components/ListingCard'
import SearchBar from '@/components/SearchBar'

export default async function Home() {
  const listings = await prisma.listing.findMany({
    where: { status: 'active' },
    include: { seller: true, category: true },
    orderBy: { createdAt: 'desc' },
    take: 20
  })

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 
                          rounded-2xl p-8 text-white mb-8">
        <h1 className="text-4xl font-bold mb-4">
          Achetez et vendez vos téléphones en toute confiance
        </h1>
        <SearchBar />
      </section>

      {/* Catégories rapides */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        {['iPhone', 'Samsung', 'Xiaomi', 'Huawei', 'Google', 'Accessoires'].map(c => (
          <a key={c} href={`/search?brand=${c}`} 
             className="bg-white p-4 rounded-xl shadow hover:shadow-lg 
                        text-center font-medium transition">
            {c}
          </a>
        ))}
      </div>

      {/* Annonces */}
      <h2 className="text-2xl font-bold mb-4">Annonces récentes</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {listings.map(listing => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </main>
  )
}
