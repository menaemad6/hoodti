import React from "react";
import { useCurrentTenant } from "@/context/TenantContext";

interface BrandLoaderProps {
  fullscreen?: boolean;
  size?: number; // pixel size for the spinner diameter
  logoSrc?: string;
}

const BrandLoader: React.FC<BrandLoaderProps> = ({
  fullscreen = true,
  size = 96,
  logoSrc = "/hoodti-logo.jpg",
}) => {
  const tenant = useCurrentTenant();
  const effectiveLogo = tenant?.logo || logoSrc;
  const containerClasses = fullscreen
    ? "fixed inset-0 z-[1000] flex items-center justify-center bg-background/80 backdrop-blur-sm"
    : "inline-flex items-center justify-center";

  const ringSize = size;
  const logoSize = Math.round(size * 0.5);

  return (
    <div className={containerClasses} role="status" aria-label="Loading">
      <div
        className="relative"
        style={{ width: ringSize, height: ringSize }}
      >
        {/* Outer subtle ring */}
        <div
          className="absolute inset-0 rounded-full border-2 border-border/40"
          aria-hidden
        />

        {/* Animated primary arc */}
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"
          style={{ animationDuration: "900ms" }}
          aria-hidden
        />

        {/* Secondary counter-rotating arc */}
        <div
          className="absolute inset-2 rounded-full border-4 border-transparent border-b-primary/60 animate-spin"
          style={{ animationDuration: "1400ms", animationDirection: "reverse" as const }}
          aria-hidden
        />

        {/* Center logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={effectiveLogo}
            alt="Brand logo"
            width={logoSize}
            height={logoSize}
            className="rounded-xl shadow-sm object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default BrandLoader;


