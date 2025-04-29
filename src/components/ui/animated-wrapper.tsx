
import React from "react";
import { cn } from "@/lib/utils";

type AnimationType = "fade-in" | "scale-in" | "slide-in" | "apple-fade-in" | "apple-scale-in" | "apple-slide-in" | "none" | "fade-up";
type DelayType = "none" | "0" | "100" | "150" | "200" | "300" | "400" | "500" | "600" | "700" | "1000";

interface AnimatedWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  animation?: AnimationType;
  delay?: DelayType;
  className?: string;
}

const AnimatedWrapper: React.FC<AnimatedWrapperProps> = ({
  children,
  animation = "fade-in",
  delay = "none",
  className,
  ...props
}) => {
  const getAnimationClass = () => {
    if (animation === "none") return "";
    return `animate-${animation}`;
  };

  const getDelayClass = () => {
    if (delay === "none") return "";
    return `delay-${delay}`;
  };

  return (
    <div 
      className={cn(
        getAnimationClass(),
        getDelayClass(),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default AnimatedWrapper;
