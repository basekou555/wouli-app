
import React from 'react';

const Memories = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-wouli-gray-50 overflow-hidden">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="w-full lg:w-1/2 stagger-animation">
            <span className="inline-block px-3 py-1 mb-4 text-sm font-medium rounded-full bg-blue-50 text-wouli-blue">
              Souvenirs inoubliables
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-wouli-gray-900 mb-4">
              Immortalisez vos moments partagés
            </h2>
            <p className="text-lg text-wouli-gray-700 mb-6">
              Chaque événement sur Wouli devient automatiquement un album collaboratif où tous les participants peuvent partager photos et vidéos.
            </p>
            <p className="text-wouli-gray-700 mb-8">
              Notre fonctionnalité d'aftermovie transforme automatiquement vos médias en un film souvenir que vous pouvez partager et revivre à tout moment.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#get-started"
                className="px-7 py-3 bg-wouli-blue text-white rounded-full font-medium transition-all hover:bg-blue-600 active:scale-95"
              >
                Découvrir
              </a>
              <a
                href="#for-who"
                className="px-7 py-3 bg-white text-wouli-gray-800 border border-wouli-gray-200 rounded-full font-medium transition-all hover:bg-wouli-gray-50 active:scale-95"
              >
                En savoir plus
              </a>
            </div>
          </div>
          
          <div className="w-full lg:w-1/2 relative">
            <div className="relative mx-auto max-w-md">
              {/* Album gallery mockup */}
              <div className="bg-white rounded-2xl shadow-xl p-4 animate-float">
                <div className="mb-4 flex justify-between items-center">
                  <div>
                    <div className="text-lg font-bold text-wouli-gray-900">Dîner d'anniversaire</div>
                    <div className="text-sm text-wouli-gray-500">12 photos · 3 vidéos</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-wouli-blue">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                {/* Gallery grid */}
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                    <div 
                      key={i} 
                      className={`relative rounded-lg overflow-hidden ${i === 1 ? 'col-span-2 row-span-2' : ''}`}
                      style={{ 
                        aspectRatio: i === 1 ? '2/2' : '1/1',
                        backgroundColor: `hsl(${210 + i * 15}, ${50 + i * 3}%, ${70 - i * 3}%)` 
                      }}
                    >
                      {i === 3 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-wouli-blue" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Aftermovie banner */}
                <div className="mt-4 bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl p-4 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-lg font-bold mb-1">Aftermovie disponible</div>
                      <div className="text-sm text-blue-100">Généré automatiquement · 45 secondes</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-blue-100 rounded-full blur-xl opacity-70"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-50 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Memories;
