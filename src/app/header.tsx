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

  return (
    <nav className="relative border-b bg-[#086c47]">
      <div className="container mx-auto flex h-20 items-center justify-between px-2 md:px-4 font-montserrat max-w-7xl">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 min-w-0">
          <Image src="/assets/lion-of-judah-2.jpg" alt="Kidist Selassie Youth International Network" width={100} height={100} className='w-16 h-10 mr-4' />
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl text-white lg:block hidden font-bold whitespace-nowrap">
              <TranslatableText>Kidist Selassie Youth International Network</TranslatableText>
            </span>
            <span className="text-sm text-white lg:hidden leading-tight truncate max-w-[200px] md:max-w-[300px]">
              <TranslatableText>Kidist Selassie Youth International Network</TranslatableText>
            </span>
          </Link>
        </div>

        {/* Hamburger Menu Button (Mobile) */}
        <button 
          className="lg:hidden z-50 text-white hover:text-[#ffb43c]"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} className="h-6 w-6" />
        </button>

        {/* Mobile Menu */}
        <div className={`
          md:hidden fixed top-0 right-0 h-full w-64 bg-[#086c47] shadow-lg transform transition-transform duration-300 ease-in-out
          ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
          flex flex-col items-start pt-20 px-6 z-40
        `}> 
          <div className="flex flex-col space-y-6 w-full">
            {/* Mobile Services Dropdown */}
            <div className="w-full">
              <div className="text-lg font-montserrat text-white flex items-center justify-between w-full py-2 cursor-pointer hover:text-[#ffb43c]" 
                   onClick={() => setMobileServicesOpen(!mobileServicesOpen)}>
                <span><TranslatableText>Services</TranslatableText></span>
                <FontAwesomeIcon icon={faChevronDown} className={`h-4 w-4 transition-transform duration-200 ${mobileServicesOpen ? 'rotate-180' : ''}`} />
              </div>
              {mobileServicesOpen && (
                <div className="pl-4 flex flex-col space-y-2 py-2">
                  <MobileNavLink href="/questions" onClick={() => setIsMenuOpen(false)}><TranslatableText>Questions</TranslatableText></MobileNavLink>
                  <MobileNavLink href="/mentorship" onClick={() => setIsMenuOpen(false)}><TranslatableText>Mentorship</TranslatableText></MobileNavLink>
                  <MobileNavLink href="/bootcamp" onClick={() => setIsMenuOpen(false)}><TranslatableText>Bootcamps</TranslatableText></MobileNavLink>
                </div>
              )}
            </div>
            
            {/* Mobile Interact Dropdown */}
            <div className="w-full">
              <div className="text-lg font-montserrat text-white flex items-center justify-between w-full py-2 cursor-pointer hover:text-[#ffb43c]" 
                   onClick={() => setMobileInteractOpen(!mobileInteractOpen)}>
                <span><TranslatableText>Interact</TranslatableText></span>
                <FontAwesomeIcon icon={faChevronDown} className={`h-4 w-4 transition-transform duration-200 ${mobileInteractOpen ? 'rotate-180' : ''}`} />
              </div>
              {mobileInteractOpen && (
                <div className="pl-4 flex flex-col space-y-2 py-2">
                  <MobileNavLink href="/forum" onClick={() => setIsMenuOpen(false)}><TranslatableText>Forum</TranslatableText></MobileNavLink>
                  <MobileNavLink href="/prayer" onClick={() => setIsMenuOpen(false)}><TranslatableText>Prayer Requests</TranslatableText></MobileNavLink>
                  <MobileNavLink href="/miracles" onClick={() => setIsMenuOpen(false)}><TranslatableText>Miracles</TranslatableText></MobileNavLink>
                </div>
              )}
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
            <div className="pt-4">
              {user ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <Button variant="outline" asChild className="w-full bg-[#ffb43c] hover:bg-[#e6a037]">
                  <Link href="/sign-in" className="text-white">
                    <TranslatableText>Join</TranslatableText>
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-4">
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
            <Button variant="outline" asChild className="bg-[#edcf08] hover:bg-[#e6a037] border-none">
              <Link href="/sign-in" className="text-white">
                <TranslatableText>Join</TranslatableText>
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
      className="text-lg font-montserrat text-white transition-colors hover:text-[#ffb43c] w-full text-left py-2"
      onClick={onClick}
    >
      {children}
    </Link>
  );
}