
import React from 'react';

const Hero = () => {
  return (
    <section className="relative overflow-hidden pt-24 pb-20 lg:pt-32 lg:pb-28">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-b from-blue-100/30 to-transparent rounded-full blur-3xl transform translate-x-1/4 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-2/3 h-1/3 bg-gradient-to-t from-blue-50/40 to-transparent rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/3"></div>
      </div>
      
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-6">
          <div className="w-full lg:w-1/2 stagger-animation">
            <span className="inline-block px-3 py-1 mb-4 text-sm font-medium rounded-full bg-blue-50 text-wouli-blue">
              Sortez ensemble simplement
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-wouli-gray-900 mb-4">
              Organisez vos sorties en <span className="text-gradient">30 secondes</span>
            </h1>
            <p className="text-xl text-wouli-gray-800 mb-8 max-w-2xl">
              Wouli révolutionne l'organisation de vos sorties entre amis. Créez, partagez et immortalisez vos moments ensemble.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#get-started"
                className="px-7 py-3 bg-wouli-blue text-white rounded-full font-medium transition-all hover:bg-blue-600 active:scale-95 shadow-sm"
              >
                Créer un événement
              </a>
              <a
                href="#how-it-works"
                className="px-7 py-3 bg-white text-wouli-gray-800 border border-wouli-gray-200 rounded-full font-medium transition-all hover:bg-wouli-gray-50 active:scale-95"
              >
                Comment ça marche
              </a>
            </div>
            <div className="mt-10 flex items-center space-x-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-wouli-gray-200 border-2 border-white overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
                  </div>
                ))}
              </div>
              <div className="text-sm text-wouli-gray-800">
                <span className="font-semibold">+1000</span> personnes utilisent Wouli
              </div>
            </div>
          </div>
          
          <div className="w-full lg:w-1/2 animate-float">
            <div className="relative mx-auto max-w-md">
              {/* Phone mockup */}
              <div className="relative rounded-[32px] p-2 bg-wouli-gray-900 shadow-xl">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-7 bg-wouli-gray-900 rounded-b-xl"></div>
                <div className="rounded-[28px] overflow-hidden bg-wouli-gray-50 aspect-[9/19]">
                  {/* App screenshot */}
                  <div className="h-full flex flex-col">
                    {/* App header */}
                    <div className="p-4 bg-white shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-wouli-blue">Wouli</span>
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* App content */}
                    <div className="flex-1 p-4 overflow-hidden">
                      <div className="mb-6">
                        <div className="w-2/3 h-6 bg-wouli-gray-200 rounded-md mb-2"></div>
                        <div className="w-1/2 h-4 bg-wouli-gray-100 rounded-md"></div>
                      </div>
                      
                      {/* Event card */}
                      <div className="rounded-xl overflow-hidden shadow-sm border border-wouli-gray-200 bg-white mb-4">
                        <div className="h-32 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                        <div className="p-4">
                          <div className="w-3/4 h-5 bg-wouli-gray-800 rounded-md mb-2"></div>
                          <div className="w-1/2 h-4 bg-wouli-gray-200 rounded-md mb-3"></div>
                          <div className="flex justify-between items-center">
                            <div className="flex -space-x-2">
                              {[1, 2, 3].map((i) => (
                                <div key={i} className="w-6 h-6 rounded-full bg-wouli-gray-200 border border-white"></div>
                              ))}
                            </div>
                            <div className="w-20 h-8 rounded-full bg-wouli-blue"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Event card */}
                      <div className="rounded-xl overflow-hidden shadow-sm border border-wouli-gray-200 bg-white">
                        <div className="h-32 bg-gradient-to-r from-purple-400 to-purple-600"></div>
                        <div className="p-4">
                          <div className="w-3/4 h-5 bg-wouli-gray-800 rounded-md mb-2"></div>
                          <div className="w-1/2 h-4 bg-wouli-gray-200 rounded-md mb-3"></div>
                          <div className="flex justify-between items-center">
                            <div className="flex -space-x-2">
                              {[1, 2].map((i) => (
                                <div key={i} className="w-6 h-6 rounded-full bg-wouli-gray-200 border border-white"></div>
                              ))}
                            </div>
                            <div className="w-20 h-8 rounded-full bg-wouli-blue"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* App nav */}
                    <div className="p-4 bg-white border-t border-wouli-gray-200">
                      <div className="flex justify-between">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="w-10 h-10 rounded-full bg-wouli-gray-100 flex items-center justify-center">
                            <div className={`w-5 h-5 rounded-md ${i === 1 ? 'bg-wouli-blue' : 'bg-wouli-gray-300'}`}></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-100 rounded-full blur-xl opacity-70"></div>
              <div className="absolute -top-6 -left-6 w-20 h-20 bg-blue-50 rounded-full blur-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
