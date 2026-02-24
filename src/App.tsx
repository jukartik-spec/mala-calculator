import { useState } from 'react';
import { MalaProvider } from './context/MalaContext';
import { ItemSettings } from './components/ItemSettings';
import { PatternBuilder } from './components/PatternBuilder';
import { Calculator } from './components/Calculator';
import { MalaFinder } from './components/MalaFinder';

type Tab = 'calculator' | 'settings' | 'finder';

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>('calculator');

  return (
    <MalaProvider>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <svg className="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="3" r="2" fill="currentColor" />
                  <circle cx="5" cy="6" r="1.5" fill="currentColor" />
                  <circle cx="19" cy="6" r="1.5" fill="currentColor" />
                  <circle cx="3" cy="12" r="1.5" fill="currentColor" />
                  <circle cx="21" cy="12" r="1.5" fill="currentColor" />
                  <circle cx="5" cy="18" r="1.5" fill="currentColor" />
                  <circle cx="19" cy="18" r="1.5" fill="currentColor" />
                  <circle cx="12" cy="21" r="2" fill="currentColor" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Mala Calculator</h1>
                <p className="text-amber-100 text-xs md:text-sm">Professional mala pattern builder & calculator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('calculator')}
                className={`px-4 md:px-6 py-3 md:py-4 font-medium transition-colors relative ${
                  activeTab === 'calculator'
                    ? 'text-amber-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="hidden sm:inline">Pattern & Calculator</span>
                  <span className="sm:hidden">Calculator</span>
                </span>
                {activeTab === 'calculator' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('finder')}
                className={`px-4 md:px-6 py-3 md:py-4 font-medium transition-colors relative ${
                  activeTab === 'finder'
                    ? 'text-amber-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="hidden sm:inline">Mala Finder</span>
                  <span className="sm:hidden">Finder</span>
                </span>
                {activeTab === 'finder' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 md:px-6 py-3 md:py-4 font-medium transition-colors relative ${
                  activeTab === 'settings'
                    ? 'text-amber-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="hidden sm:inline">Item Settings</span>
                  <span className="sm:hidden">Settings</span>
                </span>
                {activeTab === 'settings' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <PatternBuilder />
                <Calculator />
              </div>
            </div>
          )}
          {activeTab === 'finder' && (
            <MalaFinder onSwitchTab={(tab) => setActiveTab(tab as Tab)} />
          )}
          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto">
              <ItemSettings />
            </div>
          )}
        </main>

        {/* Quick Help */}
        <section className="max-w-7xl mx-auto px-4 pb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Guide</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Item Types</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-amber-700" />
                    <strong>Bead</strong> - Regular beads (Rudraksha, Tulsi, etc.)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-500 border border-yellow-600" />
                    <strong>Mani</strong> - Gold balls with ball gauge & wire gauge
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-4 h-2 rounded-t-full bg-orange-400 border border-orange-500" />
                    <strong>Cap</strong> - Half round caps (placed on BOTH sides of bead)
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">How to Use</h3>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Go to <strong>Settings</strong> to configure item measurements</li>
                  <li>Build pattern by adding items in sequence</li>
                  <li>Set gap settings (uniform gap between all items)</li>
                  <li>Set repeat count (e.g., 108, 54, 27)</li>
                  <li>View calculations for length, weight, cost</li>
                </ol>
              </div>
            </div>
            
            {/* Cap behavior note */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
              <strong className="text-blue-800">Cap Behavior:</strong>
              <span className="text-blue-700"> When you add a Cap in the pattern, it automatically represents caps on BOTH sides of the adjacent bead. So "1 Cap + 1 Bead" becomes: Cap → Bead → Cap in the actual mala.</span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-800 text-gray-400 py-4">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm">
            <p>Mala Calculator - Professional mala design & calculation tool</p>
          </div>
        </footer>
      </div>
    </MalaProvider>
  );
}
