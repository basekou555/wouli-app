
import React, { useEffect } from 'react';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import Features from '../components/Features';
import EventCreation from '../components/EventCreation';
import Memories from '../components/Memories';
import Footer from '../components/Footer';

const Index = () => {
  useEffect(() => {
    // Animate elements when they enter the viewport
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-up');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.feature-card').forEach((el) => {
      observer.observe(el);
    });
    
    return () => {
      observer.disconnect();
    };
  }, []);
  
  return (
    <Layout>
      <Hero />
      <Features />
      <EventCreation />
      <Memories />
      <Footer />
    </Layout>
  );
};

export default Index;
