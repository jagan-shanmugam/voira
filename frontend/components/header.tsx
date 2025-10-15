"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/demo", label: "Demo" },
    { href: "/onboard", label: "Onboard" },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-background/80 border-separator1 fixed top-0 right-0 left-0 z-50 border-b backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="flex items-center gap-2">
              {/* <div className="from-primary to-primary-hover flex size-8 items-center justify-center rounded-lg bg-gradient-to-br">
                <span className="text-primary-foreground text-xl font-bold">V</span>
              </div> */}
              <span className="text-fg0 text-xl font-bold uppercase">VELLI</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-fg2 hover:text-fg0 hover:bg-bg2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    isActive && "text-fg0 bg-bg2"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="text-fg0 hover:bg-bg2 rounded-lg p-2 transition-colors md:hidden"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <List size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="border-separator1 border-t py-4 md:hidden">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "text-fg2 hover:text-fg0 hover:bg-bg2 block rounded-lg px-4 py-3 text-base font-medium transition-colors",
                    isActive && "text-fg0 bg-bg2"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
