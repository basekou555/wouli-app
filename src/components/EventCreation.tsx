
import React from 'react';

const steps = [
  {
    number: 1,
    title: "Infos essentielles",
    description: "Entrez le nom, la date et l'heure de votre sortie en quelques clics.",
  },
  {
    number: 2,
    title: "Lieu & Paramètres",
    description: "Choisissez le lieu et définissez les paramètres de confidentialité.",
  },
  {
    number: 3,
    title: "Invitations",
    description: "Invitez vos amis via l'app ou par un lien de partage.",
  },
];

const EventCreation = () => {
  return (
    <section id="how-it-works" className="py-20">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="w-full lg:w-1/2 order-2 lg:order-1">
            <div className="relative max-w-md mx-auto">
              {/* Step cards */}
              {steps.map((step, index) => (
                <div 
                  key={index}
                  className={`relative z-10 glass-card rounded-xl p-6 mb-6 ${
                    index === 0 ? 'animate-fade-up' : ''
                  }`}
                  style={{ 
                    animationDelay: `${index * 200}ms`,
                    transform: `translateY(${index * 10}px)`
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-wouli-blue text-white flex items-center justify-center font-bold">
                      {step.number}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-wouli-gray-900 mb-1">{step.title}</h3>
                      <p className="text-wouli-gray-700">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Background decorations */}
              <div className="absolute top-10 left-3 bottom-10 w-1 bg-gradient-to-b from-wouli-blue via-wouli-blue to-wouli-blue/20 z-0"></div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-100 rounded-full blur-xl opacity-70"></div>
              <div className="absolute -top-6 -left-6 w-20 h-20 bg-blue-50 rounded-full blur-lg"></div>
            </div>
          </div>
          
          <div className="w-full lg:w-1/2 order-1 lg:order-2 stagger-animation">
            <span className="inline-block px-3 py-1 mb-4 text-sm font-medium rounded-full bg-blue-50 text-wouli-blue">
              Simple et rapide
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-wouli-gray-900 mb-4">
              Créez un événement en moins de 30 secondes
            </h2>
            <p className="text-lg text-wouli-gray-700 mb-6">
              Nous avons conçu Wouli pour éliminer toute friction dans l'organisation de vos sorties. Trois étapes simples et vous êtes prêt à inviter vos amis.
            </p>
            <p className="text-wouli-gray-700 mb-8">
              Plus besoin de jongler entre différentes applications. Wouli centralise tout le processus et vous permet de vous concentrer sur l'essentiel : passer du bon temps avec vos amis.
            </p>
            <a
              href="#get-started"
              className="px-7 py-3 bg-wouli-blue text-white rounded-full font-medium transition-all hover:bg-blue-600 active:scale-95 inline-flex items-center"
            >
              <span>Essayer maintenant</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventCreation;
