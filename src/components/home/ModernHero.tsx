import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AnimatedWrapper from "@/components/ui/animated-wrapper";
import { ArrowRight, ShoppingBag, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { BRAND_NAME } from "@/lib/constants";
import { Product } from "@/integrations/supabase/types.service";
import { Skeleton } from "@/components/ui/skeleton";

interface ModernHeroProps {
  products?: Product[];
}

const ModernHero: React.FC<ModernHeroProps> = ({ products = [] }) => {
  const [gridIndex, setGridIndex] = useState(0);
  const hasProducts = products.length > 0;

  const gridProducts = useMemo(() => {
    if (!hasProducts) return [] as Product[];
    const items: Product[] = [];
    for (let i = 0; i < Math.min(4, products.length); i++) {
      items.push(products[(gridIndex + i) % products.length]);
    }
    return items;
  }, [hasProducts, products, gridIndex]);

  useEffect(() => {
    if (!hasProducts || products.length <= 4) return;
    const id = setInterval(() => {
      setGridIndex((prev) => (prev + 4) % products.length);
    }, 5000);
    return () => clearInterval(id);
  }, [hasProducts, products.length]);

  return (
    <section className="relative overflow-hidden border-b border-border/10">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        {/* Soft gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />

        {/* Glow orbs */}
        <div className="absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute bottom-[-8rem] right-[-8rem] w-[24rem] h-[24rem] rounded-full bg-emerald-500/10 blur-[120px]" />

        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(var(--primary-rgb, 236,72,153),0.25) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />

        {/* Aurora ribbons */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] opacity-30 pointer-events-none">
          <div className="absolute inset-0 rounded-full blur-3xl" style={{
            background: "conic-gradient(from 90deg at 50% 50%, rgba(236,72,153,.15), rgba(16,185,129,.12), rgba(59,130,246,.12), rgba(236,72,153,.15))",
            animation: "spin-slow 28s linear infinite"
          }} />
        </div>
      </div>

      <div className="container mx-auto px-4 pt-24 pb-16 md:pt-28 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Copy */}
          <AnimatedWrapper animation="fade-in" className="lg:col-span-7">
            <div className="max-w-3xl">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs tracking-widest font-semibold mb-4 uppercase">
                New arrivals every week
              </span>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6">
              Made to Be Noticed
                {/* <span className="block bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                  Discover more.
                </span> */}
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mb-8">
                Curated picks, fast delivery, and easy returns. Find favorites you’ll actually use without the hassle.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button className="h-12 px-6 rounded-full" size="lg" asChild>
                  <Link to="/shop" className="flex items-center">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Shop now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button className="h-12 px-6 rounded-full" variant="outline" size="lg" asChild>
                  <Link to="/categories">Explore categories</Link>
                </Button>
              </div>

              {/* Social proof stats */}
              <div className="mt-6 grid grid-cols-3 gap-3 max-w-md">
                <div className="rounded-xl border border-border/40 bg-background/70 backdrop-blur-sm px-3 py-2 text-center">
                  <div className="text-xl font-extrabold">2k+</div>
                  <div className="text-[11px] text-muted-foreground">5-star reviews</div>
                </div>
                <div className="rounded-xl border border-border/40 bg-background/70 backdrop-blur-sm px-3 py-2 text-center">
                  <div className="text-xl font-extrabold">48h</div>
                  <div className="text-[11px] text-muted-foreground">avg delivery</div>
                </div>
                <div className="rounded-xl border border-border/40 bg-background/70 backdrop-blur-sm px-3 py-2 text-center">
                  <div className="text-xl font-extrabold">7-day</div>
                  <div className="text-[11px] text-muted-foreground">easy returns</div>
                </div>
              </div>

              {/* Marquee trust bar */}
              <div className="mt-6 overflow-hidden border border-border/40 rounded-full bg-background/70 backdrop-blur-sm">
                <div className="whitespace-nowrap py-2 px-4 text-xs sm:text-sm text-muted-foreground marquee">
                  <span className="mx-4">Fast delivery</span>
                  <span className="mx-4">Secure checkout</span>
                  <span className="mx-4">24/7 support</span>
                  <span className="mx-4">New arrivals weekly</span>
                  <span className="mx-4">Trusted by shoppers</span>
                  <span className="mx-4">Fast delivery</span>
                  <span className="mx-4">Secure checkout</span>
                  <span className="mx-4">24/7 support</span>
                  <span className="mx-4">New arrivals weekly</span>
                  <span className="mx-4">Trusted by shoppers</span>
                </div>
              </div>

              {/* Trust indicators */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <Truck className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-tight">Fast delivery</p>
                    <p className="text-xs text-muted-foreground">Reliable and tracked</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-tight">Secure checkout</p>
                    <p className="text-xs text-muted-foreground">Encrypted payments</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-tight">Premium support</p>
                    <p className="text-xs text-muted-foreground">We’re here to help</p>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedWrapper>

          {/* Visuals */}
          <AnimatedWrapper animation="scale-in" delay="150" className="lg:col-span-5">
            <div className="relative max-w-xl mx-auto">
              {/* Dynamic product blocks or skeletons */}
              {products.length === 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {[0,1,2,3].map((idx) => (
                    <div
                      key={idx}
                      className={`relative overflow-hidden rounded-2xl border border-border/40 ${idx % 3 === 0 ? "aspect-[4/5]" : "aspect-square"}`}
                    >
                      <Skeleton className="w-full h-full" />
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <Skeleton className="h-5 w-10 rounded-full" />
                        <Skeleton className="h-5 w-14 rounded-full" />
                      </div>
                      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 transition-opacity duration-500">
                  {(gridProducts).map((p, idx) => {
                    const cleanId = p?.id ? p.id.replace('new-', '').replace('featured-', '') : '';
                    return (
                    <Link
                      to={`/product/${cleanId}`}
                      key={p.id}
                      className={`group relative overflow-hidden rounded-2xl border border-border/40 shadow-sm ${idx % 3 === 0 ? "aspect-[4/5]" : "aspect-square"}`}
                    >
                      {/* Glow ring on hover */}
                      <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(120px_80px_at_50%_120%,rgba(236,72,153,0.25),transparent)]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <img
                        src={Array.isArray(p.images) && p.images.length ? (p.images[0] as string) : "/collab-collection.jpg"}
                        onError={(e) => { (e.target as HTMLImageElement).src = "/collab-collection.jpg"; }}
                        alt={p.name}
                        className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-[1.08] group-hover:-rotate-[0.5deg]"
                      />

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        {(p.is_new || idx === 0) && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-primary text-primary-foreground shadow">
                            New
                          </span>
                        )}
                        {(p.original_price || idx === 1) && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-emerald-500 text-white shadow">
                            {p.original_price ? `${Math.round(((p.original_price - (p.price as number)) / p.original_price) * 100)}% off` : "Deal"}
                          </span>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-white text-xs sm:text-sm font-semibold truncate">
                            {p.name}
                          </p>
                          <span className="inline-flex items-center text-[10px] sm:text-xs text-white/90">
                            View
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  )})}
                </div>
              )}

              {/* Floating accent */}
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl border border-primary/30 bg-primary/10" />
            </div>
          </AnimatedWrapper>
        </div>
      </div>

      {/* Local styles for marquee and slow spin */}
      <style>
        {`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee {
          display: inline-block;
          min-width: 200%;
          animation: marquee 18s linear infinite;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        `}
      </style>
    </section>
  );
};

export default ModernHero;


