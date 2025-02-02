"use client"

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { UserButton, useUser } from "@clerk/nextjs";
import Image from 'next/image';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useUser();

  return (
    <nav className="relative border-b bg-[#086c47]">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 font-montserrat max-w-7xl">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 min-w-0">
          <Image src="/assets/lion-of-judah-2.jpg" alt="Kidist Selassie Youth International Network" width={100} height={100} className='w-16 h-10 mr-4' />
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl text-white lg:block hidden font-bold whitespace-nowrap">
              Kidist Selassie Youth International Network
            </span>
            <span className="text-sm text-white lg:hidden leading-tight truncate max-w-[200px] md:max-w-[300px]">
              Kidist Selassie Youth International Network
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
            <MobileNavLink href="/prayer" onClick={() => setIsMenuOpen(false)}>Prayer Requests</MobileNavLink>
            <MobileNavLink href="/mentorship" onClick={() => setIsMenuOpen(false)}>Mentorship</MobileNavLink>
            <MobileNavLink href="/bootcamp" onClick={() => setIsMenuOpen(false)}>Bootcamps</MobileNavLink>
            <MobileNavLink href="/questions" onClick={() => setIsMenuOpen(false)}>Questions</MobileNavLink>
            <MobileNavLink href="/miracles" onClick={() => setIsMenuOpen(false)}>Miracles</MobileNavLink>
            <div className="pt-4">
              {user ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <Button variant="outline" asChild className="w-full bg-[#ffb43c] hover:bg-[#e6a037]">
                  <Link href="/sign-in" className="text-white">
                    Join
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-4">
          <NavLink href="/prayer">Prayer Requests</NavLink>
          <NavLink href="/mentorship">Mentorship</NavLink>
          <NavLink href="/bootcamp">Bootcamps</NavLink>
          <NavLink href="/questions">Questions</NavLink>
          <NavLink href="/miracles">Miracles</NavLink>
        </div>

        {/* Auth Button */}
        <div className="hidden lg:flex items-center space-x-4 pl-4">
          {user ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <Button variant="outline" asChild className="bg-[#edcf08] hover:bg-[#e6a037] border-none">
              <Link href="/sign-in" className="text-white">
                Join
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