import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, ShoppingCart, User, Search, Sun, Moon, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import ProfileButton from "@/components/auth/ProfileButton";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/context/ThemeContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  const { cartItemsCount } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const { theme, setTheme, resolvedTheme } = useTheme();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
    }
  };

  return (
    <div className="sticky top-0 z-50 w-full px-1 sm:px-4">
      {/* Background overlay */}
      <div className="absolute inset-x-0 -top-2 sm:-top-4 h-16 sm:h-20 bg-gradient-to-b from-background via-background/80 to-transparent backdrop-blur-sm" />
      
      <div className="container mx-auto relative pt-0 md:pt-3">
        <div className="rounded-full border border-border/40 bg-gradient-to-r from-background/80 via-background/90 to-background/80 backdrop-blur-2xl shadow-lg shadow-background/5 relative overflow-hidden">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10 opacity-50 bg-gradient-pos animate-gradient" />
          
          <div className="px-2 sm:px-4 py-2 sm:py-2.5 relative">
            <div className="flex items-center justify-between">
              {/* Mobile menu */}
              <Sheet>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon" className="hover:bg-accent rounded-full">
                    <Menu className="h-[18px] w-[18px]" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full max-w-xs p-0 bg-background/98 backdrop-blur-2xl border-r border-border/40">
                  <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-border/40">
                      <Link to="/" className="flex items-center space-x-2 mb-6">
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary/90 to-primary/70">
                          Glass
                          <span className="text-foreground">(Brand)</span>
                        </span>
                      </Link>
                      {/* Mobile Search */}
                      <form onSubmit={handleSearch} className="relative">
                        <Input
                          type="search"
                          placeholder="Search products..."
                          className="w-full rounded-full bg-accent/50 border-accent focus-visible:ring-accent"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Button 
                          type="submit" 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-0 top-0 hover:bg-accent rounded-full"
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>

                    {/* Profile Card for Mobile */}
                    {isAuthenticated && user && (
                      <div className="px-4 py-3 border-b border-border/40">
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <Link to="/profile">
                            <Button variant="outline" className="w-full text-xs h-8" size="sm">
                              View Profile
                            </Button>
                          </Link>
                          <Link to="/orders">
                            <Button variant="outline" className="w-full text-xs h-8" size="sm">
                              My Orders
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}

                    <nav className="flex-1 overflow-y-auto">
                      <div className="px-2 py-4 space-y-1">
                        <Link to="/" className="flex items-center px-2 py-3 text-sm font-medium hover:bg-accent rounded-lg transition-colors">
                          Home
                        </Link>
                        <Link to="/shop" className="flex items-center px-2 py-3 text-sm font-medium hover:bg-accent rounded-lg transition-colors">
                          Shop
                        </Link>
                        <Link to="/categories" className="flex items-center px-2 py-3 text-sm font-medium hover:bg-accent rounded-lg transition-colors">
                          Categories
                        </Link>
                        <Link to="/deals" className="flex items-center px-2 py-3 text-sm font-medium hover:bg-accent rounded-lg transition-colors">
                          Deals
                        </Link>
                        {!isAuthenticated && (
                          <>
                            <Link to="/signin" className="flex items-center px-2 py-3 text-sm font-medium hover:bg-accent rounded-lg transition-colors">
                              Sign In
                            </Link>
                            <Link to="/signup" className="flex items-center px-2 py-3 text-sm font-medium hover:bg-accent rounded-lg transition-colors">
                              Sign Up
                            </Link>
                          </>
                        )}
                      </div>
                    </nav>

                    {/* Enhanced Theme Toggle */}
                    <div className="p-4 border-t border-border/40">
                      <div className="rounded-lg border border-border/40 p-1 mb-2">
                        <div className="grid grid-cols-3 gap-1">
                          <Button
                            variant={theme === 'light' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setTheme('light')}
                            className="w-full h-8 px-0"
                          >
                            <Sun className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={theme === 'dark' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setTheme('dark')}
                            className="w-full h-8 px-0"
                          >
                            <Moon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={theme === 'system' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setTheme('system')}
                            className="w-full h-8 px-0"
                          >
                            <Laptop className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Logo */}
              <Link to="/" className="flex items-center space-x-2">
                <span className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary/90 to-primary/70">
                (Brand)
                </span>
              </Link>

              {/* Desktop navigation */}
              <nav className="hidden md:flex items-center space-x-1">
                <Link to="/" className="px-3 py-1.5 text-sm font-medium hover:bg-accent rounded-full transition-colors">
                  Home
                </Link>
                <Link to="/shop" className="px-3 py-1.5 text-sm font-medium hover:bg-accent rounded-full transition-colors">
                  Shop
                </Link>
                <Link to="/categories" className="px-3 py-1.5 text-sm font-medium hover:bg-accent rounded-full transition-colors">
                  Categories
                </Link>
                <Link to="/deals" className="px-3 py-1.5 text-sm font-medium hover:bg-accent rounded-full transition-colors">
                  Deals
                </Link>
              </nav>

              {/* Desktop Search and Actions */}
              <div className="hidden md:flex items-center space-x-2">
                <form onSubmit={handleSearch} className="relative hidden lg:block w-64">
                  <Input
                    type="search"
                    placeholder="Search products..."
                    className="pl-9 h-9 rounded-full bg-muted/50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </form>
                
                <ThemeToggle />
                
                {isAuthenticated ? (
                  <ProfileButton user={user} />
                ) : (
                  <Button variant="ghost" size="sm" asChild className="hidden sm:flex ml-1">
                    <Link to="/signin">Sign In</Link>
                  </Button>
                )}
                
                <Button variant="ghost" size="icon" asChild className="relative">
                  <Link to="/cart">
                    <ShoppingCart className="h-5 w-5" />
                    {cartItemsCount > 0 && (
                      <Badge 
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
                        variant="default"
                      >
                        {cartItemsCount}
                      </Badge>
                    )}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
