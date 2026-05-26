import { formatPrice, getProductById, products, type Product } from '@/lib/data';
import ProductDetailClient from '@/components/ProductDetailClient';

// Pré-génère les routes pour les produits par défaut.
// Les produits créés via l'admin sont rendus dynamiquement (dynamicParams = true par défaut).
export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
}

type Params = { id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) {
    // Produit dynamique (créé en admin) — titre générique, le client mettra à jour
    return { title: 'Produit — DiDallah Shop' };
  }
  return {
    title: `${product.name} — DiDallah Shop`,
    description: product.short,
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  // Cherche dans les produits statiques (data.ts).
  // Peut être null si le produit a été créé dans l'admin — le client cherchera dans le store.
  const product = getProductById(id);

  return <ProductDetailClient id={id} fallbackProduct={product ?? null} />;
}
