import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Team = () => {
  useEffect(() => {
    // Scroll effect for navbar
    const handleScroll = () => {
      const navbar = document.getElementById('navbar');
      const navLinks = navbar?.querySelectorAll('.nav-link');
      if (window.scrollY > 50) {
        navbar.style.background = "#fff";
        navLinks?.forEach(link => link.style.color = "#2a4365");
      } else {
        navbar.style.background = "transparent";
        navLinks?.forEach(link => link.style.color = "#0b0b0b");
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-12 md:py-20 max-w-7xl mt-16">
        <div className="mb-12 md:mb-16">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">WHO WE ARE</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            TEAM <br /> Local Konnect
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-16">
          <div className="text-lg text-gray-700">
            <p className="mb-4">
              LOCAL KONNECT STARTED AS A SIMPLE IDEA TO HELP FAMILY AND FRIENDS FIND TRUSTED LOCAL SERVICES.
            </p>
          </div>
          <div className="text-lg text-gray-700">
            <p className="mb-4">
              We began by building a small tool to book everyday services like salons, deliveries, and repairs — but we quickly realized the challenge people face in finding reliable service providers nearby. That insight fueled our growth.
            </p>
            <p>
              So we transformed Local Konnect into a smart, intuitive platform — where anyone can discover, book, and trust local services with just a few taps. We make local living easier by connecting real people with real services, while letting providers take full control of their business.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-900">Aadil Bhati</h3>
              <p className="text-sm text-gray-600">Founder & CEO</p>
              <a 
                href="https://www.linkedin.com/in/aadilbhatibkn/" 
                className="text-blue-500 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
              <p className="mt-2 text-sm text-gray-700">
                Local Konnect is founded by Aadil Bhati, with a vision to digitally transform the local economy of tier-2 and tier-3 cities starting from Bikaner.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-900">Pinky Boora</h3>
              <p className="text-sm text-gray-600">HR Head</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-900">Abhay Mishra</h3>
              <p className="text-sm text-gray-600">Chief Technical Officer</p>
            </div>
          </div>

          <div className="bg-green-200 rounded-lg shadow-md flex flex-col justify-between p-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <svg className="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                <svg className="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6.216 16.592c-.086.292-.255.54-.486.735-.23.195-.506.33-.799.397-.293.067-.597.078-.891.033-.294-.045-.578-.146-.837-.297-.259-.15-.49-.356-.68-.598-.19-.241-.345-.53-.46-.85-.115-.32-.19-.67-.216-1.028-.026-.358-.026-.72.001-1.077.027-.357.086-.704.177-1.03.09-.327.21-.637.36-.92.15-.283.328-.54.53-.76.202-.22.43-.41.67-.56.24-.15.49-.27.75-.36.26-.09.52-.15.79-.18.27-.03.54-.03.81-.001.27.027.53.086.79.177.26.09.51.21.74.36.23.15.44.34.63.56.19.22.36.48.51.76.15.283.27.593.36.92.09.326.15.673.177 1.03.026.357.026.719.001 1.077-.026.358-.101.708-.216 1.028-.115.32-.27.609-.46.85-.19.242-.421.448-.68.598-.259.151-.543.252-.837.297-.294.045-.598.034-.891-.033z"/>
                </svg>
              </div>
              <p className="text-sm font-medium mb-4">
                "You miss 100% of the shots you don't take. -Wayne Gretzky" <br /> -Michael Scott
              </p>
            </div>
            <div className="mt-auto">
              <h3 className="font-semibold text-lg text-gray-900">"The only way to do great work is to love what you do." - Steve Jobs</h3>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-900">Muhammed Altamush</h3>
              <p className="text-sm text-gray-600">Business Development Manager</p>
              <a 
                href="https://www.linkedin.com/in/muhammed-altamush-ab6649241/" 
                className="text-blue-500 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-900">Samar Bhati</h3>
              <p className="text-sm text-gray-600">Web Developer</p>
              <a 
                href="https://www.linkedin.com/in/samar-bhati-4aa2a7298/" 
                className="text-blue-500 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Team;
