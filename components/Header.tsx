"use client";

import Link from "next/link";
import { useAuth, SignInButton, SignUpButton, UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Menu, X, ShoppingCart, Search } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
// import { trackEvent } from "@/lib/analytics";

export function Header() {
  const { isSignedIn } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // const handleNavigation = (destination: string) => {
  //   trackEvent("navigation_click", { destination });
  // };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <header className="fixed top-0 w-full bg-background/80 backdrop-blur-md z-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center py-4 md:space-x-10">
          {/* Logo */}
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <Link href="/" className="flex items-center space-x-2" 
            // onClick={() => handleNavigation("home")}
            >
              <ShoppingCart className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">AI Market</span>
            </Link>
          </div>

          {/* Mobile Menu Button & Controls */}
          <div className="-mr-2 -my-2 md:hidden flex items-center gap-2">
            <ThemeToggle />
            {isSignedIn && (
              <div className="flex items-center gap-2">
                <OrganizationSwitcher 
                  afterCreateOrganizationUrl="/dashboard"
                  afterLeaveOrganizationUrl="/dashboard"
                  afterSelectOrganizationUrl="/dashboard"
                />
                <UserButton afterSignOutUrl="/" />
              </div>
            )}
            <Button
              variant="ghost"
              aria-label="Toggle Mobile Menu"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-10">
            {['browse', 'blog', 'organization'].map((item) => (
              <Link
                key={item}
                href={`/${item}`}
                className="text-base font-medium text-foreground/60 hover:text-foreground"
                // onClick={() => handleNavigation(item)}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Link>
            ))}
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0 space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border rounded-full bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            {isSignedIn ? (
              <div className="flex items-center gap-4">
                {/* <OrganizationSwitcher 
                  afterCreateOrganizationUrl="/dashboard"
                  afterLeaveOrganizationUrl="/select-org"
                  afterSelectOrganizationUrl="/dashboard"
                /> */}
                <UserButton />
                <ThemeToggle />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <SignInButton>
                  <Button variant="ghost">Sign In</Button>
                </SignInButton>
                <SignUpButton>
                  <Button>Get Started</Button>
                </SignUpButton>
                <ThemeToggle />
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {['browse', 'blog', 'about'].map((item) => (
                <Link
                  key={item}
                  href={`/${item}`}
                  className="block px-3 py-2 text-base font-medium text-foreground/60 hover:text-foreground hover:bg-muted"
                  onClick={() => {
                    // handleNavigation(item);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </Link>
              ))}
              {!isSignedIn && (
                <>
                  <SignInButton>
                    <Button
                      variant="ghost"
                      className="w-full justify-start px-3 py-2"
                    >
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton>
                    <Button className="w-full justify-start px-3 py-2">
                      Get Started
                    </Button>
                  </SignUpButton>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
