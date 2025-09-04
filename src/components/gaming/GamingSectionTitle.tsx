import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import clsx from 'clsx';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// AnimatedTitle Component
const AnimatedTitle = ({ title, containerClass }: {
  title: string;
  containerClass?: string;
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const titleAnimation = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "100 bottom",
          end: "center bottom",
          toggleActions: "play none none reverse",
        },
      });

      titleAnimation.to(
        ".animated-word",
        {
          opacity: 1,
          transform: "translate3d(0, 0, 0) rotateY(0deg) rotateX(0deg)",
          ease: "power2.inOut",
          stagger: 0.02,
        },
        0
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className={clsx("animated-title", containerClass)}>
      {title.split("<br />").map((line, index) => (
        <div
          key={index}
          className="flex-center max-w-full flex-wrap gap-2 px-10 md:gap-3"
        >
          {line.split(" ").map((word, idx) => (
            <span
              key={idx}
              className="animated-word"
              dangerouslySetInnerHTML={{ __html: word }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

// SectionTitle Component
const GamingSectionTitle = ({ subtitle, title, containerClass }: {
  subtitle: string;
  title: string;
  containerClass?: string;
}) => {
  return (
    <div className={clsx("flex flex-col items-center", containerClass)}>
      <p className="font-general text-sm uppercase md:text-[10px] mb-5 text-blue_gaming-50">
        {subtitle}
      </p>
      <AnimatedTitle
        title={title}
        containerClass="text-center"
      />
    </div>
  );
};

export default GamingSectionTitle;
