'use client';

import { useState } from 'react';
import { SalesChart } from '@/components/analytics/SalesChart';
import { OrdersChart } from '@/components/analytics/OrdersChart';
import { KPICard } from '@/components/analytics/KPICard';

// Mock data - In production, this would come from your database
const salesData = [
  { date: '25 mai', revenue: 1250, orders: 8 },
  { date: '26 mai', revenue: 1890, orders: 12 },
  { date: '27 mai', revenue: 950, orders: 5 },
  { date: '28 mai', revenue: 2100, orders: 15 },
  { date: '29 mai', revenue: 1800, orders: 10 },
  { date: '30 mai', revenue: 2400, orders: 18 },
  { date: '31 mai', revenue: 2200, orders: 16 },
];

const ordersData = [
  { status: 'En attente', count: 5 },
  { status: 'En cours', count: 12 },
  { status: 'Livré', count: 48 },
  { status: 'Annulé', count: 2 },
];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<'7d' | '14d' | '30d'>('30d');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Statistiques de vente et performance boutique
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex gap-2">
          {(['7d', '14d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                dateRange === range
                  ? 'bg-brand-600 text-white'
                  : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              {range === '7d' && '7 jours'}
              {range === '14d' && '14 jours'}
              {range === '30d' && '30 jours'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Revenus totaux"
          value="12 350 €"
          trend={{ value: 15, isPositive: true }}
        />
        <KPICard
          title="Nombre de commandes"
          value="84"
          trend={{ value: 8, isPositive: true }}
        />
        <KPICard
          title="Panier moyen"
          value="147 €"
          trend={{ value: 5, isPositive: true }}
        />
        <KPICard
          title="Taux conversion"
          value="3.2%"
          trend={{ value: 2, isPositive: true }}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sales Chart */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 font-semibold text-gray-900 dark:text-white">Revenus</h2>
          <SalesChart data={salesData} />
        </div>

        {/* Orders Chart */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 font-semibold text-gray-900 dark:text-white">Statut des commandes</h2>
          <OrdersChart data={ordersData} />
        </div>
      </div>

      {/* Top Products Table */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-4 font-semibold text-gray-900 dark:text-white">Produits best-sellers</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Produit
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Quantité vendue
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Revenus
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Parfum Rose Absolue', qty: 24, revenue: '2 880 €' },
                { name: 'Soin Visage Premium', qty: 18, revenue: '1 620 €' },
                { name: 'Essence Oud Noir', qty: 15, revenue: '2 250 €' },
                { name: 'Huile Cheveux Botanique', qty: 12, revenue: '840 €' },
                { name: 'Boubou Wax Edition', qty: 8, revenue: '1 440 €' },
              ].map((product, idx) => (
                <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{product.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{product.qty}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-brand-600 dark:text-brand-400">
                    {product.revenue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
