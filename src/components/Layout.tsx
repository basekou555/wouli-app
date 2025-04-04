
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  name: string;
  path: string;
}

const navItems: NavItem[] = [
  { name: 'Accueil', path: '/' },
  { name: 'Fonctionnalités', path: '/#features' },
  { name: 'Comment ça marche', path: '/#how-it-works' },
  { name: 'Pour qui', path: '/#for-who' },
];

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);
  
  return (
    <div className="relative min-h-screen flex flex-col">
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'py-3 bg-white/80 backdrop-blur-md shadow-sm' : 'py-5 bg-transparent'
        }`}
      >
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gradient">Wouli</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <a 
                  key={item.name}
                  href={item.path}
                  className="nav-link text-sm font-medium"
                >
                  {item.name}
                </a>
              ))}
              <a
                href="#get-started"
                className="ml-2 px-5 py-2 instagram-button"
              >
                Démarrer
              </a>
            </nav>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-md text-gray-600" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              <div className="w-6 flex flex-col items-end space-y-1.5">
                <span className={`block h-0.5 bg-gray-800 transition-all duration-300 ${mobileMenuOpen ? 'w-6 translate-y-2 rotate-45' : 'w-6'}`}></span>
                <span className={`block h-0.5 bg-gray-800 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : 'w-4'}`}></span>
                <span className={`block h-0.5 bg-gray-800 transition-all duration-300 ${mobileMenuOpen ? 'w-6 -translate-y-2 -rotate-45' : 'w-6'}`}></span>
              </div>
            </button>
          </div>
        </div>
      </header>
      
      {/* Mobile Navigation */}
      <div className={`fixed inset-0 z-40 bg-white transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full pt-16 px-6">
          <div className="py-6 space-y-4">
            {navItems.map((item) => (
              <a 
                key={item.name}
                href={item.path}
                className="block py-3 text-lg font-medium text-gray-800 border-b border-gray-100"
              >
                {item.name}
              </a>
            ))}
            <a
              href="#get-started"
              className="mt-4 block w-full text-center px-5 py-3 instagram-button"
            >
              Démarrer
            </a>
          </div>
        </div>
      </div>
      
      <main className="flex-grow pt-16">
        {children}
      </main>
      
      <footer className="bg-gray-50 py-12 border-t border-gray-200">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <span className="text-2xl font-bold text-gradient">Wouli</span>
              <p className="mt-4 text-gray-800 max-w-xs">
                Révolutionner l'organisation et le souvenir des sorties entre amis.
              </p>
              <div className="mt-6 flex space-x-4">
                <a href="#" className="h-10 w-10 rounded-full instagram-gradient flex items-center justify-center text-white">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Liens</h3>
              <ul className="mt-4 space-y-3">
                {navItems.map((item) => (
                  <li key={item.name}>
                    <a href={item.path} className="text-base text-gray-800 hover:text-purple-500">
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Contact</h3>
              <p className="mt-4 text-gray-800">
                Une question ? Contactez-nous à <a href="mailto:hello@wouli.app" className="text-purple-600 hover:underline">hello@wouli.app</a>
              </p>
              <div className="mt-6">
                <a
                  href="#get-started"
                  className="instagram-button inline-block"
                >
                  Démarrer maintenant
                </a>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Wouli App. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
