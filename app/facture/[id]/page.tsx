/**
 * Page publique /facture/[id]
 * Accessible par le client après commande.
 * Affiche la facture et propose impression / PDF.
 */
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import FactureClient from './FactureClient';

type Order = {
  id: string;
  client_name: string;
  client_phone?: string;
  products: string;
  total: number;
  status: string;
  notes?: string;
  created_at: string;
};

async function getOrder(id: string): Promise<Order | null> {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const supabase = createClient(url, key);
  const { data } = await supabase
    .from('orders')
    .select('id,client_name,client_phone,products,total,status,notes,created_at')
    .eq('id', id)
    .single();

  return (data as Order) ?? null;
}

type Params = { id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) return { title: 'Facture introuvable — DiDallah Shop' };
  return {
    title: `Facture — ${order.client_name} · DiDallah Shop`,
    robots: 'noindex',
  };
}

export default async function FacturePage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  return <FactureClient order={order} />;
}
