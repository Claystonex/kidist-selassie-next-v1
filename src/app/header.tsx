"use client"

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { UserButton, useUser } from "@clerk/nextjs";
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faChevronDown, faBook } from '@fortawesome/free-solid-svg-icons';
import LanguageToggle from './_components/LanguageToggle';
import TranslatableText from './_components/TranslatableText';
import { useTranslation } from './_contexts/TranslationContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [interactOpen, setInteractOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileInteractOpen, setMobileInteractOpen] = useState(false);
  const { language, setLanguage } = useTranslation();
  const { user } = useUser();
  
  // Close mobile menu when window gets resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen]);

  return (
    <nav className="relative border-b bg-[#086c47]">
      <div className="container mx-auto flex justify-between h-20 items-center px-2 md:px-4 font-montserrat max-w-7xl">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0">
          <Image src="/assets/lion-of-judah-2.jpg" alt="Kidist Selassie Youth International Network" width={100} height={100} className='w-16 h-10 mr-3 md:mr-4' />
          <Link href="/" className="flex items-center">
            <span className="text-xl text-white lg:block hidden font-bold whitespace-nowrap mr-8">
              <TranslatableText>Kidist Selassie Youth International Network</TranslatableText>
            </span>
            <span className="text-sm text-white lg:hidden leading-tight truncate max-w-[120px] sm:max-w-[200px] md:max-w-[250px]">
              <TranslatableText>Kidist Selassie</TranslatableText>
            </span>
          </Link>
        </div>

        {/* Hamburger Menu Button (Mobile) */}
        <button 
          className="lg:hidden z-50 text-white hover:text-[#ffb43c] ml-auto text-2xl"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} className="h-6 w-6" />
        </button>

        {/* Mobile Menu - Fullscreen Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 bg-[#086c47] z-40 flex flex-col items-center justify-center">
            <div className="absolute top-6 right-6">
              <button
                className="text-white hover:text-[#ffb43c] text-3xl"
                onClick={() => setIsMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faTimes} className="h-8 w-8" />
              </button>
            </div>
            <div className="flex flex-col items-center justify-center space-y-6 w-full px-4 text-center">
            {/* Mobile Services Item */}
            <div className="w-full">
              <div className="text-2xl font-montserrat text-white flex items-center justify-center w-full py-3 cursor-pointer hover:text-[#ffb43c]" 
                   onClick={() => setMobileServicesOpen(!mobileServicesOpen)}>
                <span className="mr-2"><TranslatableText>Services</TranslatableText></span>
                <FontAwesomeIcon icon={faChevronDown} className={`h-5 w-5 transition-transform duration-200 ${mobileServicesOpen ? 'rotate-180' : ''}`} />
              </div>
              <div className={`flex flex-col items-center space-y-4 overflow-hidden transition-all duration-300 ${mobileServicesOpen ? 'max-h-96 py-4' : 'max-h-0'}`}>
                <MobileNavLink href="/questions" onClick={() => setIsMenuOpen(false)}><TranslatableText>Questions</TranslatableText></MobileNavLink>
                <MobileNavLink href="/mentorship" onClick={() => setIsMenuOpen(false)}><TranslatableText>Mentorship</TranslatableText></MobileNavLink>
                <MobileNavLink href="/bootcamp" onClick={() => setIsMenuOpen(false)}><TranslatableText>Bootcamps</TranslatableText></MobileNavLink>
              </div>
            </div>
            
            {/* Mobile Interact Dropdown */}
            <div className="w-full">
              <div className="text-2xl font-montserrat text-white flex items-center justify-center w-full py-3 cursor-pointer hover:text-[#ffb43c]" 
                   onClick={() => setMobileInteractOpen(!mobileInteractOpen)}>
                <span className="mr-2"><TranslatableText>Interact</TranslatableText></span>
                <FontAwesomeIcon icon={faChevronDown} className={`h-5 w-5 transition-transform duration-200 ${mobileInteractOpen ? 'rotate-180' : ''}`} />
              </div>
              <div className={`flex flex-col items-center space-y-4 overflow-hidden transition-all duration-300 ${mobileInteractOpen ? 'max-h-96 py-4' : 'max-h-0'}`}>
                <MobileNavLink href="/forum" onClick={() => setIsMenuOpen(false)}><TranslatableText>Forum</TranslatableText></MobileNavLink>
                <MobileNavLink href="/prayer" onClick={() => setIsMenuOpen(false)}><TranslatableText>Prayer Requests</TranslatableText></MobileNavLink>
                <MobileNavLink href="/miracles" onClick={() => setIsMenuOpen(false)}><TranslatableText>Miracles</TranslatableText></MobileNavLink>
              </div>
            </div>
            
            <MobileNavLink href="/gallery" onClick={() => setIsMenuOpen(false)}><TranslatableText>Gallery</TranslatableText></MobileNavLink>
            <a 
              href="https://v0-bible-chapter-tracker.vercel.app/" 
              onClick={() => setIsMenuOpen(false)}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-[#ffb43c] text-lg py-2 block w-full transition-colors"
            >
              <div className="flex items-center">
                <span><TranslatableText>Bible Tracker</TranslatableText></span>
                <FontAwesomeIcon icon={faBook} className="ml-2 h-4 w-4 animate-pulse" />
              </div>
            </a>
            <MobileNavLink href="/teachings" onClick={() => setIsMenuOpen(false)}><TranslatableText>Teachings</TranslatableText></MobileNavLink>
            <MobileNavLink href="/donate" onClick={() => setIsMenuOpen(false)}><TranslatableText>Donate</TranslatableText></MobileNavLink>
            <div className="pt-8">
              {user ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <Button variant="outline" asChild className="w-full max-w-sm bg-[#edcf08] hover:bg-[#e6a037] py-6">
                  <Link href="/sign-in" className="text-xl text-red-600 font-bold">
                    <TranslatableText>Join</TranslatableText>
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
        {/* Flex spacer for desktop only */}
        <div className="hidden lg:block flex-grow"></div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center justify-end space-x-8 lg:space-x-10 flex-grow">
          {/* Services Dropdown */}
          <div className="relative group">
            <div 
              className="flex items-center cursor-pointer space-x-0.5"
              onMouseOver={() => {
                setServicesOpen(true);
                setInteractOpen(false);
              }}
            >
              <span className="text-sm font-montserrat text-white transition-colors group-hover:text-[#ffb43c]"><TranslatableText>Services</TranslatableText></span>
              <FontAwesomeIcon 
                icon={faChevronDown} 
                className="h-3 w-3 text-white group-hover:text-[#ffb43c] transition-transform duration-200"
                style={{ transform: servicesOpen ? 'rotate(180deg)' : 'rotate(0)' }} 
              />
            </div>
            <div 
              className={`absolute left-0 top-6 pt-2 w-48 z-50 ${servicesOpen ? 'block' : 'hidden'}`}
              onMouseLeave={() => setServicesOpen(false)}
            >
              {/* This empty div creates a seamless hover area between trigger and menu */}
              <div className="absolute h-2 w-full top-[-8px]"></div>
              <div className="bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  <DropdownNavLink href="/questions"><TranslatableText>Questions</TranslatableText></DropdownNavLink>
                  <DropdownNavLink href="/mentorship"><TranslatableText>Mentorship</TranslatableText></DropdownNavLink>
                  <DropdownNavLink href="/bootcamp"><TranslatableText>Bootcamps</TranslatableText></DropdownNavLink>
                </div>
              </div>
            </div>
          </div>
          
          {/* Interact Dropdown */}
          <div className="relative group">
            <div 
              className="flex items-center cursor-pointer space-x-0.5"
              onMouseOver={() => {
                setInteractOpen(true);
                setServicesOpen(false);
              }}
            >
              <span className="text-sm font-montserrat text-white transition-colors group-hover:text-[#ffb43c]"><TranslatableText>Interact</TranslatableText></span>
              <FontAwesomeIcon 
                icon={faChevronDown} 
                className="h-3 w-3 text-white group-hover:text-[#ffb43c] transition-transform duration-200"
                style={{ transform: interactOpen ? 'rotate(180deg)' : 'rotate(0)' }} 
              />
            </div>
            <div 
              className={`absolute left-0 top-6 pt-2 w-48 z-50 ${interactOpen ? 'block' : 'hidden'}`}
              onMouseLeave={() => setInteractOpen(false)}
            >
              {/* This empty div creates a seamless hover area between trigger and menu */}
              <div className="absolute h-2 w-full top-[-8px]"></div>
              <div className="bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  <DropdownNavLink href="/forum"><TranslatableText>Forum</TranslatableText></DropdownNavLink>
                  <DropdownNavLink href="/prayer"><TranslatableText>Prayer Requests</TranslatableText></DropdownNavLink>
                  <DropdownNavLink href="/miracles"><TranslatableText>Miracles</TranslatableText></DropdownNavLink>
                </div>
              </div>
            </div>
          </div>
          
          <div 
            onMouseOver={() => {
              setServicesOpen(false);
              setInteractOpen(false);
            }}
          >
            <NavLink href="/gallery"><TranslatableText>Gallery</TranslatableText></NavLink>
          </div>
          
          <div 
            className="group"
            onMouseOver={() => {
              setServicesOpen(false);
              setInteractOpen(false);
            }}
          >
            <a 
              href="https://v0-bible-chapter-tracker.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm font-montserrat text-white hover:text-[#ffb43c] transition-colors px-3 py-2 rounded-md"
            >
              <span className="flex items-center space-x-0.5">
                <span><TranslatableText>Bible Tracker</TranslatableText></span>
                <FontAwesomeIcon 
                  icon={faBook} 
                  className="h-3 w-3 transform group-hover:scale-125 transition-transform duration-300 group-hover:text-[#ffb43c]"
                />
              </span>
            </a>
          </div>
          
          <div 
            onMouseOver={() => {
              setServicesOpen(false);
              setInteractOpen(false);
            }}
          >
            <NavLink href="/teachings"><TranslatableText>Teachings</TranslatableText></NavLink>
          </div>
          <div 
            onMouseOver={() => {
              setServicesOpen(false);
              setInteractOpen(false);
            }}
          >
            <NavLink href="/donate"><TranslatableText>Donate</TranslatableText></NavLink>
          </div>
        </div>

        {/* Auth Button and Language Toggle */}
        <div className="hidden lg:flex items-center space-x-3 ml-2">
          <LanguageToggle />
          
          {user ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <Button variant="outline" asChild className="bg-[#edcf08] hover:bg-[#e6a037] border-none px-6 w-32">
              <Link href="/sign-in" className="text-red-600 ">
                <TranslatableText className='text-2xl font-bold'>Join</TranslatableText>
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="text-sm font-montserrat text-white transition-colors hover:text-[#ffb43c]"
    >
      {children}
    </Link>
  );
}

function DropdownNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 hover:text-[#086c47]"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link 
      href={href} 
      className="text-2xl font-montserrat text-white transition-transform hover:text-[#ffb43c] py-4 block text-center focus:outline-none focus:text-[#ffb43c] active:scale-95"
      onClick={onClick}
    >
      {children}
    </Link>
  );
}