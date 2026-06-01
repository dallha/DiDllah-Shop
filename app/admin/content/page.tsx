'use client';

import { useState } from 'react';

export default function ContentAdminPage() {
  const [activeTab, setActiveTab] = useState('articles');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion du Contenu</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Gérez les articles du journal, le catalogue maison, et le contenu du site
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
        {['articles', 'catalogue', 'storytelling', 'assurance'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-2 font-medium transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-brand-600 text-brand-600 dark:text-brand-400'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
            }`}
          >
            {tab === 'articles' && 'Articles'}
            {tab === 'catalogue' && 'Catalogue Maison'}
            {tab === 'storytelling' && 'Storytelling'}
            {tab === 'assurance' && 'Réassurance'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        {activeTab === 'articles' && (
          <div>
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Gestion des Articles
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-400">
              <p>✓ Lister/créer/éditer/supprimer des articles</p>
              <p>✓ Gérer le statut (draft/published)</p>
              <p>✓ Personnaliser les métadonnées SEO</p>
              <p className="text-sm text-gray-500 mt-4">
                Interface détaillée à implémenter dans la prochaine itération
              </p>
            </div>
          </div>
        )}

        {activeTab === 'catalogue' && (
          <div>
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Catalogue Maison
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-400">
              <p>✓ Importer produits (CSV/XLSX/JSON)</p>
              <p>✓ Prévisualiser avant import</p>
              <p>✓ Détecter et fusionner les doublons</p>
              <p>✓ Exporter le catalogue</p>
              <p className="text-sm text-gray-500 mt-4">
                Interface détaillée à implémenter dans la prochaine itération
              </p>
            </div>
          </div>
        )}

        {activeTab === 'storytelling' && (
          <div>
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Section Storytelling
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Gérez les textes et images de la section storytelling du site
            </p>
          </div>
        )}

        {activeTab === 'assurance' && (
          <div>
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Section Réassurance
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Gérez les éléments de confiance (certifications, garanties, etc.)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
