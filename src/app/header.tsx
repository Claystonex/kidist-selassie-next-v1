"use client"

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { UserButton, useUser } from "@clerk/nextjs";
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faChevronDown, faBook, faGamepad } from '@fortawesome/free-solid-svg-icons';
import LanguageToggle from './_components/LanguageToggle';
import TranslatableText from './_components/TranslatableText';
import { useTranslation } from './_contexts/TranslationContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [interactOpen, setInteractOpen] = useState(false);
  const [bibleOpen, setBibleOpen] = useState(false);
  const [gamesOpen, setGamesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileInteractOpen, setMobileInteractOpen] = useState(false);
  const [mobileBibleOpen, setMobileBibleOpen] = useState(false);
  const [mobileGamesOpen, setMobileGamesOpen] = useState(false);
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

  // Only show flag, logo, and join button if not signed in
  if (!user) {
    return (
      <nav className="relative border-b bg-[#086c47]">
        <div className="container mx-auto flex justify-between h-20 items-center px-2 md:px-4 font-montserrat max-w-full lg:max-w-7xl">
          {/* Flag (if you have a flag image, add it here) */}
          {/* <img src="/assets/your-flag.png" alt="Flag" className="w-8 h-8 mr-2" /> */}

          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <img 
              src="/assets/lion-of-judah-2.jpg" 
              alt="Kidist Selassie Youth International Network" 
              className='w-14 h-9 mr-1 object-contain' 
              fetchPriority="high"
              loading="eager"
            />
            <Link href="/" className="flex items-center">
              <span className="text-base text-white xl:block hidden font-bold whitespace-nowrap mr-2">
                <TranslatableText>Kidist Selassie Youth International Network</TranslatableText>
              </span>
              <span className="text-base text-white hidden lg:block xl:hidden font-bold whitespace-nowrap mr-2">
                <TranslatableText>Kidist Selassie</TranslatableText>
              </span>
              <span className="text-sm text-white lg:hidden leading-tight truncate max-w-[100px] sm:max-w-[150px]">
                <TranslatableText>Kidist Selassie</TranslatableText>
              </span>
            </Link>
          </div>

          {/* Join Button */}
          <Button variant="outline" asChild className="bg-[#edcf08] hover:bg-[#e6a037] border-none text-center flex items-center justify-center min-w-[80px] h-10">
            <Link href="/sign-up" className="text-[#086c47] px-4">
              <TranslatableText className='text-lg font-bold'>Join</TranslatableText>
            </Link>
          </Button>
        </div>
      </nav>
    );
  }

  // Full header for signed-in users
  return (
    <nav className="relative border-b bg-[#086c47]">
      <div className="container mx-auto flex justify-between h-20 items-center px-2 md:px-4 font-montserrat max-w-full lg:max-w-7xl">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0">
          <img 
            src="/assets/lion-of-judah-2.jpg" 
            alt="Kidist Selassie Youth International Network" 
            className='w-14 h-9 mr-1 object-contain' 
            fetchPriority="high"
            loading="eager"
          />
          <Link href="/" className="flex items-center">
            <span className="text-base text-white xl:block hidden font-bold whitespace-nowrap mr-2">
              <TranslatableText>Kidist Selassie Youth International Network</TranslatableText>
            </span>
            <span className="text-base text-white hidden lg:block xl:hidden font-bold whitespace-nowrap mr-2">
              <TranslatableText>Kidist Selassie</TranslatableText>
            </span>
            <span className="text-sm text-white lg:hidden leading-tight truncate max-w-[100px] sm:max-w-[150px]">
              <TranslatableText>Kidist Selassie</TranslatableText>
            </span>
          </Link>
        </div>



        {/* Hamburger Menu Button (Mobile) - Only visible when menu is closed */}
        {!isMenuOpen && (
          <button 
            className="lg:hidden z-50 text-white hover:text-[#edcf08] ml-auto text-2xl transition-colors duration-300"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
          >
            <FontAwesomeIcon icon={faBars} className="h-6 w-6" />
          </button>
        )}

        {/* Mobile Menu - Fullscreen Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 bg-gradient-to-b from-[#086c47] to-[#064d32] z-40 flex flex-col items-center justify-start pt-24 overflow-y-auto">
            {/* Close button with a more elegant design */}
            <div className="absolute top-6 right-6">
              <button
                className="text-white hover:text-[#edcf08] text-3xl transition-all duration-300 transform hover:rotate-90"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close menu"
              >
                <FontAwesomeIcon icon={faTimes} className="h-8 w-8 drop-shadow-lg" />
              </button>
            </div>
            
            {/* Mobile menu logo at top */}
            <div className="mb-10">
              <Image src="/assets/lion-of-judah-2.jpg" alt="Kidist Selassie" width={80} height={50} className='w-20 h-12 mb-4 mx-auto' />
              <h2 className="text-[#edcf08] text-xl font-bold mb-1"><TranslatableText>Kidist Selassie</TranslatableText></h2>
              <div className="h-1 w-16 bg-[#edcf08] mx-auto rounded-full mb-2"></div>
            </div>
            
            <div className="flex flex-col items-center justify-center space-y-5 w-full max-w-md px-6 text-center">
            {/* Mobile Services Item - enhanced styling */}
            <div className="w-full">
              <div 
                className="text-xl font-montserrat text-white flex items-center justify-center w-full py-4 cursor-pointer hover:text-[#edcf08] transition-colors duration-300 border-b border-[#0a8055] relative" 
                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
              >
                <span className="mr-3 font-semibold tracking-wide"><TranslatableText>Services</TranslatableText></span>
                <FontAwesomeIcon 
                  icon={faChevronDown} 
                  className={`h-4 w-4 transition-transform duration-300 ${mobileServicesOpen ? 'rotate-180 text-[#edcf08]' : ''}`} 
                />
              </div>
              <div 
                className={`flex flex-col items-center overflow-hidden transition-all duration-500 ease-in-out bg-[#065539] rounded-b-lg ${mobileServicesOpen ? 'max-h-96 py-4 mb-4 shadow-inner' : 'max-h-0'}`}
              >
                {/* Mobile Services submenu */}
                {mobileServicesOpen && (
                  <div className="bg-[#064d32] rounded-lg p-4 mt-2 w-full">
                    <MobileNavLink href="/questions" onClick={() => setIsMenuOpen(false)}><TranslatableText>Questions</TranslatableText></MobileNavLink>
                    <MobileNavLink href="/mentorship" onClick={() => setIsMenuOpen(false)}><TranslatableText>Mentorship</TranslatableText></MobileNavLink>
                    <MobileNavLink href="/bootcamps" onClick={() => setIsMenuOpen(false)}><TranslatableText>Bootcamps</TranslatableText></MobileNavLink>
                  </div>
                )}
              </div>
            </div>
            
            {/* Mobile Interact Dropdown - enhanced styling */}
            <div className="w-full">
              <div 
                className="text-xl font-montserrat text-white flex items-center justify-center w-full py-4 cursor-pointer hover:text-[#edcf08] transition-colors duration-300 border-b border-[#0a8055] relative" 
                onClick={() => setMobileInteractOpen(!mobileInteractOpen)}
              >
                <span className="mr-3 font-semibold tracking-wide"><TranslatableText>Interact</TranslatableText></span>
                <FontAwesomeIcon 
                  icon={faChevronDown} 
                  className={`h-4 w-4 transition-transform duration-300 ${mobileInteractOpen ? 'rotate-180 text-[#edcf08]' : ''}`} 
                />
              </div>
              <div 
                className={`flex flex-col items-center overflow-hidden transition-all duration-500 ease-in-out bg-[#065539] rounded-b-lg ${mobileInteractOpen ? 'max-h-96 py-4 mb-4 shadow-inner' : 'max-h-0'}`}
              >
                <div className="rounded-b-lg shadow-xl overflow-hidden">  
                  <div className="bg-white py-1">
                    {/* Mobile Interact Dropdown Items */}
                    <div className="block px-4 py-2 text-gray-800 text-center" onClick={() => setIsMenuOpen(false)}>  
                      <Link href="/forum" className="block">Forum</Link>
                    </div>
                    <div className="block px-4 py-2 text-gray-800 text-center" onClick={() => setIsMenuOpen(false)}>  
                      <Link href="/prayer" className="block">Prayer Requests</Link>
                    </div>
                    <div className="block px-4 py-2 text-gray-800 text-center" onClick={() => setIsMenuOpen(false)}>  
                      <Link href="/miracles" className="block">Miracles</Link>
                    </div>
                    <div className="block px-4 py-2 text-gray-800 text-center" onClick={() => setIsMenuOpen(false)}>  
                      <Link href="/contact" className="block">Contact Us</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Regular menu items with improved styling */}
            <div className="w-full border-b border-[#0a8055]">
              <MobileNavLink href="/gallery" onClick={() => setIsMenuOpen(false)}><TranslatableText>Gallery</TranslatableText></MobileNavLink>
            </div>
            
            {/* Mobile Bible Section */}
            <div className="w-full">
              <button
                className="text-lg font-montserrat text-white hover:text-[#edcf08] py-4 flex justify-center items-center w-full transition-colors duration-300 font-semibold tracking-wide focus:outline-none focus:text-[#edcf08]" 
                onClick={() => setMobileBibleOpen(!mobileBibleOpen)}
              >
                <span className="flex items-center justify-center">
                  <TranslatableText>Bible</TranslatableText>
                  <FontAwesomeIcon 
                    icon={faBook} 
                    className="ml-2 h-4 w-4 text-[#edcf08]"
                  />
                  <FontAwesomeIcon 
                    icon={faChevronDown} 
                    className={`ml-2 h-3 w-3 transition-transform duration-300 ${mobileBibleOpen ? 'rotate-180' : ''}`}
                  />
                </span>
              </button>
              
              {/* Mobile Bible menu */}
              <div className={`${mobileBibleOpen ? 'max-h-96' : 'max-h-0'} overflow-hidden transition-all duration-500 ease-in-out bg-green-800`}>
                <MobileNavLink href="/bible" onClick={() => setIsMenuOpen(false)}>
                  <span className="flex items-center">
                    <FontAwesomeIcon icon={faBook} className="mr-2" />
                    <TranslatableText>Read Bible</TranslatableText>
                  </span>
                </MobileNavLink>
                <MobileNavLink href="/bible/record" onClick={() => setIsMenuOpen(false)}>
                  <span className="flex items-center">
                    <FontAwesomeIcon icon={faBook} className="mr-2" />
                    <TranslatableText>Record Bible</TranslatableText>
                  </span>
                </MobileNavLink>
                <MobileNavLink href="/bible/listen" onClick={() => setIsMenuOpen(false)}>
                  <span className="flex items-center">
                    <FontAwesomeIcon icon={faBook} className="mr-2" />
                    <TranslatableText>Listen to Bible</TranslatableText>
                  </span>
                </MobileNavLink>
                <MobileNavLink href="/bible-tracker" onClick={() => setIsMenuOpen(false)}>
                  <span className="flex items-center">
                    <FontAwesomeIcon icon={faBook} className="mr-2" />
                    <TranslatableText>Bible Tracker</TranslatableText>
                  </span>
                </MobileNavLink>
              </div>
            </div>
            
            {/* Mobile Games Section */}
            <div className="w-full">
              <button
                className="text-lg font-montserrat text-white hover:text-[#edcf08] py-4 flex justify-center items-center w-full transition-colors duration-300 font-semibold tracking-wide focus:outline-none focus:text-[#edcf08] active:scale-95"
                onClick={() => setMobileGamesOpen(!mobileGamesOpen)}
              >
                <span className="flex items-center justify-center">
                  <TranslatableText>Games</TranslatableText>
                  <FontAwesomeIcon 
                    icon={faGamepad} 
                    className="ml-2 h-4 w-4 text-[#edcf08]"
                  />
                  <FontAwesomeIcon 
                    icon={faChevronDown} 
                    className={`ml-2 h-3 w-3 transition-transform duration-300 ${mobileGamesOpen ? 'rotate-180' : ''}`}
                  />
                </span>
              </button>
              
              {/* Mobile Games menu */}
              <div className={`${mobileGamesOpen ? 'max-h-96' : 'max-h-0'} overflow-hidden transition-all duration-500 ease-in-out bg-green-800`}>
                <MobileNavLink href="/games/chess" onClick={() => setIsMenuOpen(false)}>
                  <span className="flex items-center">
                    <FontAwesomeIcon icon={faGamepad} className="mr-2" />
                    <TranslatableText>Chess</TranslatableText>
                  </span>
                </MobileNavLink>
              </div>
            </div>
            
            <div className="w-full border-b border-[#0a8055]">
              <MobileNavLink href="/teachings" onClick={() => setIsMenuOpen(false)}><TranslatableText>Teachings</TranslatableText></MobileNavLink>
            </div>
            
            <div className="w-full border-b border-[#0a8055]">
              <MobileNavLink href="/donate" onClick={() => setIsMenuOpen(false)}><TranslatableText>Donate</TranslatableText></MobileNavLink>
            </div>
            {/* User profile or sign-in button with improved styling */}
            <div className="pt-10 pb-6 w-full max-w-xs">
              {user ? (
                <div className="flex flex-col items-center">
                  <p className="text-white mb-2 text-sm"><TranslatableText>Your Account</TranslatableText></p>
                  <UserButton afterSignOutUrl="/sign-in" />
                </div>
              ) : (
                <Button variant="outline" asChild className="w-full bg-[#edcf08] hover:bg-[#ffba00] transition-colors duration-300 py-6 shadow-lg rounded-lg">
                  <Link href="/sign-up" className="text-xl text-[#086c47] font-bold tracking-wide">
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
        <div className="hidden lg:flex items-center justify-end space-x-4 xl:space-x-6 flex-grow">
          {/* Services Dropdown */}
          <div className="relative group">
            <div 
              className="flex items-center cursor-pointer space-x-0.5"
              onMouseOver={() => {
                setServicesOpen(true);
                setInteractOpen(false);
                setGamesOpen(false);
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
              <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg overflow-hidden transform opacity-0 -translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto z-50 transition-all duration-300 origin-top-left">
                <div className="py-2">
                  <DropdownNavLink href="/questions"><TranslatableText>Questions</TranslatableText></DropdownNavLink>
                  <DropdownNavLink href="/mentorship"><TranslatableText>Mentorship</TranslatableText></DropdownNavLink>
                  <DropdownNavLink href="/bootcamps"><TranslatableText>Bootcamps</TranslatableText></DropdownNavLink>
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
                setGamesOpen(false);
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
                  <DropdownNavLink href="/contact"><TranslatableText>Contact Us</TranslatableText></DropdownNavLink>
                </div>
              </div>
            </div>
          </div>
          
          <div 
            onMouseOver={() => {
              setServicesOpen(false);
              setInteractOpen(false);
            }}
            className="whitespace-nowrap"
          >
            <NavLink href="/gallery"><TranslatableText>Gallery</TranslatableText></NavLink>
          </div>

          {/* Added Forum link to main navigation as requested */}
          <div 
            onMouseOver={() => {
              setServicesOpen(false);
              setInteractOpen(false);
            }}
            className="whitespace-nowrap"
          >
            <NavLink href="/forum"><TranslatableText>Forum</TranslatableText></NavLink>
          </div>
          
          {/* Bible Dropdown */}
          <div
            className="relative group whitespace-nowrap"
            onMouseOver={() => {
              setServicesOpen(false);
              setInteractOpen(false);
            }}
          >
            <button
              className="text-sm font-montserrat text-white hover:text-[#ffb43c] transition-colors px-2 py-2 rounded-md"
              aria-expanded={interactOpen}
              aria-haspopup="true"
            >
              <span className="flex items-center">
                <span className="mr-1"><TranslatableText>Bible</TranslatableText></span>
                <FontAwesomeIcon
                  icon={faBook}
                  className="h-3 w-3 transform group-hover:scale-125 transition-transform duration-300 group-hover:text-[#ffb43c]"
                />
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="ml-1 h-3 w-3 transition-transform duration-300 group-hover:text-[#ffb43c] group-hover:rotate-180"
                />
              </span>
            </button>
            
            {/* Bible dropdown menu */}
            <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg overflow-hidden transform opacity-0 -translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto z-50 transition-all duration-300 origin-top-left">
              <div className="py-2">
                <DropdownNavLink href="/bible"><TranslatableText>Read Bible</TranslatableText></DropdownNavLink>
                <DropdownNavLink href="https://v0-bible-chapter-tracker.vercel.app/" target="_blank" rel="noopener noreferrer"><TranslatableText>Track Bible Reading</TranslatableText></DropdownNavLink>
              </div>
            </div>
          </div>
          
          {/* Games Dropdown */}
          <div
            className="relative group whitespace-nowrap"
            onMouseOver={() => {
              setServicesOpen(false);
              setInteractOpen(false);
              setGamesOpen(true);
            }}
            onMouseLeave={() => setGamesOpen(false)}
          >
            <button 
              className="text-sm font-montserrat text-white hover:text-[#ffb43c] transition-colors px-2 py-2 rounded-md"
              aria-expanded={gamesOpen}
              aria-haspopup="true"
            >
              <span className="flex items-center">
                <span className="mr-1"><TranslatableText>Games</TranslatableText></span>
                <FontAwesomeIcon
                  icon={faGamepad}
                  className="h-3 w-3 transform group-hover:scale-125 transition-transform duration-300 group-hover:text-[#ffb43c]"
                />
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="ml-1 h-3 w-3 transition-transform duration-300 group-hover:text-[#ffb43c] group-hover:rotate-180"
                />
              </span>
            </button>
            
            {/* Games dropdown menu */}
            <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg overflow-hidden transform opacity-0 -translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto z-50 transition-all duration-300 origin-top-left">
              <div className="py-2">
                <DropdownNavLink href="/chess"><TranslatableText>Chess - Play Friends</TranslatableText></DropdownNavLink>
                <DropdownNavLink href="/games/chess"><TranslatableText>Chess - Play Computer</TranslatableText></DropdownNavLink>
                <div className="border-t border-gray-200 my-2"></div>
                <DropdownNavLink href="/games/dice/multiplayer"><TranslatableText>Dice - Play Friends</TranslatableText></DropdownNavLink>
                <DropdownNavLink href="/games/dice/computer"><TranslatableText>Dice - Play Computer</TranslatableText></DropdownNavLink>
              </div>
            </div>
          </div>

          <div 
            onMouseOver={() => {
              setServicesOpen(false);
              setInteractOpen(false);
              setBibleOpen(false);
              setGamesOpen(false);
            }}
            className="whitespace-nowrap"
          >
            <NavLink href="/teachings"><TranslatableText>Teachings</TranslatableText></NavLink>
          </div>
          <div 
            onMouseOver={() => {
              setServicesOpen(false);
              setInteractOpen(false);
            }}
            className="whitespace-nowrap"
          >
            <NavLink href="/donate"><TranslatableText>Donate</TranslatableText></NavLink>
          </div>
        </div>

        {/* Auth Button and Language Toggle */}
        <div className="hidden lg:flex items-center ml-2">
          <div className="mr-4">
            <LanguageToggle />
          </div>
          
          {user ? (
            <UserButton afterSignOutUrl="/sign-in" />
          ) : (
            <Button variant="outline" asChild className="bg-[#edcf08] hover:bg-[#e6a037] border-none text-center flex items-center justify-center min-w-[80px] h-10">
              <Link href="/sign-up" className="text-[#086c47] px-4">
                <TranslatableText className='text-lg font-bold'>Join</TranslatableText>
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
      className="text-sm lg:text-xs xl:text-sm font-montserrat text-white transition-colors hover:text-[#ffb43c] px-1 xl:px-2"
    >
      {children}
    </Link>
  );
}

function DropdownNavLink({ href, children, target, rel }: { href: string; children: React.ReactNode; target?: string; rel?: string }) {
  return (
    <Link 
      href={href} 
      className="block px-3 py-2 text-xs lg:text-sm text-gray-800 hover:bg-gray-100 hover:text-[#086c47] whitespace-nowrap"
      target={target}
      rel={rel}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link 
      href={href} 
      className="text-lg font-montserrat text-white hover:text-[#edcf08] py-4 flex justify-center items-center w-full transition-colors duration-300 font-semibold tracking-wide focus:outline-none focus:text-[#edcf08] active:scale-95"
      onClick={onClick}
    >
      {children}
    </Link>
  );
}