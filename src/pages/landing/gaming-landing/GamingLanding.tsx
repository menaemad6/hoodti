import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useWindowScroll } from 'react-use';
import { TiLocationArrow } from 'react-icons/ti';

import { Link } from 'react-router-dom';
import { User, Shield, LayoutDashboard, Menu, Home, Store, TagIcon } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '@/context/AuthContext';
import { useRoleAccess } from '@/hooks/use-role-access';
import ProfileButton from '@/components/auth/ProfileButton';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button as UIButton } from '@/components/ui/button';

import Footer from '@/components/layout/Footer';
import './GamingLanding.css';
import { useCurrentTenant } from '@/context/TenantContext';
// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Button Component
const Button = ({ id, title, rightIcon, leftIcon, containerClass }: {
  id?: string;
  title: string;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  containerClass?: string;
}) => {
  return (
    <button
      id={id}
      className={clsx(
        "group relative z-10 w-fit cursor-pointer overflow-hidden rounded-full bg-violet_gaming-50 px-7 py-3 text-black",
        containerClass
      )}
    >
      {leftIcon}
      <span className="relative inline-flex overflow-hidden font-general text-xs uppercase">
        <div className="translate-y-0 skew-y-0 transition duration-500 group-hover:translate-y-[-160%] group-hover:skew-y-12">
          {title}
        </div>
        <div className="absolute translate-y-[164%] skew-y-12 transition duration-500 group-hover:translate-y-0 group-hover:skew-y-0">
          {title}
        </div>
      </span>
      {rightIcon}
    </button>
  );
};

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

// VideoPreview Component
const VideoPreview = ({ children }: { children: React.ReactNode }) => {
  const [isHovering, setIsHovering] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = ({ clientX, clientY, currentTarget }: React.MouseEvent<HTMLElement>) => {
    const rect = currentTarget.getBoundingClientRect();
    const xOffset = clientX - (rect.left + rect.width / 2);
    const yOffset = clientY - (rect.top + rect.height / 2);

    if (isHovering) {
      gsap.to(sectionRef.current, {
        x: xOffset,
        y: yOffset,
        rotationY: xOffset / 2,
        rotationX: -yOffset / 2,
        transformPerspective: 500,
        duration: 1,
        ease: "power1.out",
      });

      gsap.to(contentRef.current, {
        x: -xOffset,
        y: -yOffset,
        duration: 1,
        ease: "power1.out",
      });
    }
  };

  useEffect(() => {
    if (!isHovering) {
      gsap.to(sectionRef.current, {
        x: 0,
        y: 0,
        rotationY: 0,
        rotationX: 0,
        duration: 1,
        ease: "power1.out",
      });

      gsap.to(contentRef.current, {
        x: 0,
        y: 0,
        duration: 1,
        ease: "power1.out",
      });
    }
  }, [isHovering]);

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="absolute z-50 size-full overflow-hidden rounded-lg"
      style={{ perspective: "500px" }}
    >
      <div
        ref={contentRef}
        className="origin-center rounded-lg"
        style={{ transformStyle: "preserve-3d" }}
      >
        {children}
      </div>
    </section>
  );
};

// Navbar Component
const Navbar = () => {
  const navContainerRef = useRef<HTMLDivElement>(null);
  const { y: currentScrollY } = useWindowScroll();
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Authentication hooks
  const { isAuthenticated, user } = useAuth();
  const { isAdmin, isSuperAdmin } = useRoleAccess();

  const navItems = ["Games", "Categories", "Story", "About", "Contact"];
  const currentTenant = useCurrentTenant();

  useEffect(() => {
    if (currentScrollY === 0) {
      setIsNavVisible(true);
      navContainerRef.current?.classList.remove("floating-nav");
    } else if (currentScrollY > lastScrollY) {
      setIsNavVisible(false);
      navContainerRef.current?.classList.add("floating-nav");
    } else if (currentScrollY < lastScrollY) {
      setIsNavVisible(true);
      navContainerRef.current?.classList.add("floating-nav");
    }
    setLastScrollY(currentScrollY);
  }, [currentScrollY, lastScrollY]);

  useEffect(() => {
    gsap.to(navContainerRef.current, {
      y: isNavVisible ? 0 : -100,
      opacity: isNavVisible ? 1 : 0,
      duration: 0.2,
    });
  }, [isNavVisible]);

  return (
    <div
      ref={navContainerRef}
      className="fixed inset-x-0 top-4 z-50 h-16 border-none transition-all duration-700 sm:inset-x-6"
    >
      <header className="absolute top-1/2 w-full -translate-y-1/2">
        <nav className="flex size-full items-center justify-between p-4">
          <div className="flex items-center gap-7">
            <Link to="/">
              <img src="/gaming-assets/img/gamezoo-logo-erased.png" alt="logo" className="w-20" />
            </Link>
            <Link to="/shop">
            <Button
              id="product-button"
              title="Games"
              rightIcon={<TiLocationArrow />}
              containerClass="bg-blue_gaming-50 md:flex hidden items-center justify-center gap-1"
            />
            </Link>
          </div>

          <div className="flex h-full items-center gap-4">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <UIButton variant="ghost" size="icon" className="hover:bg-primary/10 dark:hover:bg-primary/20 rounded-full">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </UIButton>
              </SheetTrigger>
              <SheetContent side="left" className="w-full max-w-xs p-0 bg-black/98 backdrop-blur-2xl border-r border-blue_gaming-50/40">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-blue_gaming-50/40">
                    <Link to="/" className="flex items-center space-x-2 mb-6">
                      <img src="/gaming-assets/img/logo.png" alt="logo" className="w-8" />
                      <span className="text-xl font-bold text-blue_gaming-50">{currentTenant.name}</span>
                    </Link>
                  </div>

                  <nav className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-4">
                      {/* Main Navigation */}
                      {navItems.map((item, index) => (
                        <a
                          key={index}
                          href={`#${item.toLowerCase()}`}
                          className="block text-blue_gaming-50 hover:text-yellow_gaming-300 transition-colors"
                        >
                          {item}
                        </a>
                      ))}
                      
                      {/* Additional Links */}
                      <Link to="/shop" className="block text-blue_gaming-50 hover:text-yellow_gaming-300 transition-colors">
                        Shop
                      </Link>
                      
                      {isAuthenticated && (
                        <Link to="/account" className="block text-blue_gaming-50 hover:text-yellow_gaming-300 transition-colors">
                          Account
                        </Link>
                      )}
                      
                      {/* Admin Links */}
                      {(isAdmin || isSuperAdmin) && (
                        <>
                          <div className="border-t border-blue_gaming-50/20 pt-4 mt-4">
                            <p className="text-xs text-blue_gaming-50/60 uppercase tracking-wider mb-2">Admin</p>
                            <Link to="/admin" className="block text-blue_gaming-50 hover:text-green_gaming-50 transition-colors">
                              Dashboard
                            </Link>
                            {isSuperAdmin && (
                              <Link to="/admin/users" className="block text-blue_gaming-50 hover:text-purple_gaming-50 transition-colors">
                                User Management
                              </Link>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </nav>

                  {/* Authentication Section */}
                  <div className="p-4 border-t border-blue_gaming-50/40">
                    {isAuthenticated ? (
                      <div className="space-y-2">
                        <p className="text-sm text-blue_gaming-50/80">Signed in as:</p>
                        <p className="text-sm font-medium text-blue_gaming-50 truncate">
                          {user?.user_metadata?.name || "User"}
                        </p>
                        <ProfileButton />
                      </div>
                    ) : (
                      <Link to="/signin">
                        <UIButton className="w-full bg-yellow_gaming-300 text-black hover:bg-yellow_gaming-200">
                          <User className="w-4 h-4 mr-2" />
                          Sign In
                        </UIButton>
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item, index) => (
                <a
                  key={index}
                  href={`#${item.toLowerCase()}`}
                  className="nav-hover-btn"
                >
                  {item}
                </a>
              ))}
              
              {/* Additional Navigation Links */}
              <Link to="/shop" className="nav-hover-btn">
                Shop
              </Link>
              
              {isAuthenticated && (
                <Link to="/account" className="nav-hover-btn">
                  Account
                </Link>
              )}
            </div>

            {/* Admin Dashboard Link for Admin/SuperAdmin */}
            {(isAdmin || isSuperAdmin) && (
              <Link to="/admin" className="hidden md:flex">
                <Button
                  title="Dashboard"
                  leftIcon={<LayoutDashboard className="w-4 h-4" />}
                  containerClass="bg-yellow_gaming-300 flex items-center justify-center gap-1"
                />
              </Link>
            )}

            {/* User Management Link for SuperAdmin */}
            {isSuperAdmin && (
              <Link to="/admin/users" className="hidden md:flex">
                <Button
                  title="Users"
                  leftIcon={<Shield className="w-4 h-4" />}
                  containerClass="bg-yellow_gaming-300 flex items-center justify-center gap-1"
                />
              </Link>
            )}

            {/* Authentication Section */}
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <ProfileButton />
              ) : (
                <Link to="/signin">
                  <Button
                    title="Sign In"
                    leftIcon={<User className="w-4 h-4" />}
                    containerClass="bg-yellow_gaming-300 flex items-center justify-center gap-1"
                  />
                </Link>
              )}
            </div>


          </div>
        </nav>
      </header>
    </div>
  );
};

// Hero Component
const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [hasClicked, setHasClicked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadedVideos, setLoadedVideos] = useState(0);
  const totalVideos = 4;
  const nextVdRef = useRef<HTMLVideoElement>(null);

  const handleVideoLoad = () => {
    setLoadedVideos((prev) => prev + 1);
  };

  useEffect(() => {
    if (loadedVideos === totalVideos - 1) {
      setLoading(false);
    }
  }, [loadedVideos]);

  const handleMiniVdClick = () => {
    setHasClicked(true);
    setCurrentIndex((prevIndex) => (prevIndex % totalVideos) + 1);
  };

  useGSAP(
    () => {
      if (hasClicked) {
        gsap.set("#next-video", { visibility: "visible" });
        gsap.to("#next-video", {
          transformOrigin: "center center",
          scale: 1,
          width: "100%",
          height: "100%",
          duration: 1,
          ease: "power1.inOut",
          onStart: () => {
            nextVdRef.current?.play();
          },
        });
        gsap.from("#current-video", {
          transformOrigin: "center center",
          scale: 0,
          duration: 1.5,
          ease: "power1.inOut",
        });
      }
    },
    {
      dependencies: [currentIndex],
      revertOnUpdate: true,
    }
  );

  useGSAP(() => {
    gsap.set("#video-frame", {
      clipPath: "polygon(14% 0, 72% 0, 88% 90%, 0 95%)",
      borderRadius: "0% 0% 40% 10%",
    });
    gsap.from("#video-frame", {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      borderRadius: "0% 0% 0% 0%",
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: "#video-frame",
        start: "center center",
        end: "bottom center",
        scrub: true,
      },
    });
  });

  const getVideoSrc = (index: number) => `/gaming-assets/videos/hero-${index}.mp4`;

  return (
    <div className="relative h-dvh w-screen overflow-x-hidden">
      {loading && (
        <div className="flex-center absolute z-[100] h-dvh w-screen overflow-hidden bg-violet_gaming-50">
          <div className="three-body">
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
          </div>
        </div>
      )}

      <div
        id="video-frame"
        className="relative z-10 h-dvh w-screen overflow-hidden rounded-lg bg-blue_gaming-75"
      >
        <div>
          <div className="mask-clip-path absolute-center absolute z-50 size-64 cursor-pointer overflow-hidden rounded-lg">
            <VideoPreview>
              <div
                onClick={handleMiniVdClick}
                className="origin-center scale-50 opacity-0 transition-all duration-500 ease-in hover:scale-100 hover:opacity-100"
              >
                <video
                  ref={nextVdRef}
                  src={getVideoSrc((currentIndex % totalVideos) + 1)}
                  loop
                  muted
                  id="current-video"
                  className="size-64 origin-center scale-150 object-cover object-center"
                  onLoadedData={handleVideoLoad}
                />
              </div>
            </VideoPreview>
          </div>

          <video
            ref={nextVdRef}
            src={getVideoSrc(currentIndex)}
            loop
            muted
            id="next-video"
            className="absolute-center invisible absolute z-20 size-64 object-cover object-center"
            onLoadedData={handleVideoLoad}
          />
          <video
            src={getVideoSrc(
              currentIndex === totalVideos - 1 ? 1 : currentIndex
            )}
            autoPlay
            loop
            muted
            className="absolute left-0 top-0 size-full object-cover object-center"
            onLoadedData={handleVideoLoad}
          />
        </div>

        <h1 className="special-font hero-heading absolute bottom-5 right-5 z-40 text-blue_gaming-75">
          BO<b>A</b>RD
        </h1>

        <div className="absolute left-0 top-0 z-40 size-full">
          <div className="mt-24 px-5 sm:px-10">
            <h1 className="special-font hero-heading text-blue_gaming-100">
              disc<b>o</b>ver
            </h1>

            <p className="mb-5 max-w-64 font-robert-regular text-blue_gaming-100">
              Enter the Board Game Universe <br /> Unleash Your Strategy
            </p>

            <Link to="/shop">
            <Button
              id="watch-trailer"
              title="Explore Games"
              leftIcon={<TiLocationArrow />}
              containerClass="bg-yellow_gaming-300 flex-center gap-1"
              />
              </Link>
          </div>
        </div>
      </div>

      <h1 className="special-font hero-heading absolute bottom-5 right-5 text-black">
        BO<b>A</b>RD
      </h1>
    </div>
  );
};

// About Component
const About = () => {
  const currentTenant = useCurrentTenant();
  useGSAP(() => {
    const clipAnimation = gsap.timeline({
      scrollTrigger: {
        trigger: "#clip",
        start: "center center",
        end: "+=800 center",
        scrub: 0.5,
        pin: true,
        pinSpacing: true,
      },
    });

    clipAnimation.to(".mask-clip-path", {
      width: "100vw",
      height: "100vh",
      borderRadius: 0,
    });
  });

  return (
    <div id="about" className="min-h-screen w-screen">
      <div className="relative mb-8 mt-36 flex flex-col items-center gap-5">
        <p className="font-general text-sm uppercase md:text-[10px] text-black">
          Welcome to {currentTenant.name}
        </p>

        <AnimatedTitle
          title="Disc<b>o</b>ver the world's <br /> finest board game <b>c</b>ollection"
          containerClass="mt-5 !text-black text-center"
        />

        <div className="text-black mt-8 text-center font-circular-web text-lg max-w-96 mx-auto md:max-w-[34rem]">
          <p>The Ultimate Board Gaming Experience begins—your strategy awaits</p>
          <p className="text-gray-500">
            GameZoo unites every board game enthusiast with premium tabletop games, 
            strategy classics, and family favorites into a unified gaming community
          </p>
        </div>
      </div>

      <div className="h-dvh w-screen" id="clip">
        <div className="mask-clip-path about-image">
          <img
            src="/gaming-assets/img/gamezoo-about.webp"
            alt="Background"
            className="absolute left-0 top-0 size-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

// Features Component
const BentoTilt = ({ children, className = "" }: {
  children: React.ReactNode;
  className?: string;
}) => {
  const [transformStyle, setTransformStyle] = useState("");
  const itemRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!itemRef.current) return;

    const { left, top, width, height } = itemRef.current.getBoundingClientRect();
    const relativeX = (event.clientX - left) / width;
    const relativeY = (event.clientY - top) / height;
    const tiltX = (relativeY - 0.5) * 5;
    const tiltY = (relativeX - 0.5) * -5;
    const newTransform = `perspective(700px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(.95, .95, .95)`;
    setTransformStyle(newTransform);
  };

  const handleMouseLeave = () => {
    setTransformStyle("");
  };

  return (
    <div
      ref={itemRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform: transformStyle }}
    >
      {children}
    </div>
  );
};

const BentoCard = ({ src, title, description, isComingSoon }: {
  src: string;
  title: React.ReactNode;
  description?: string;
  isComingSoon?: boolean;
}) => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [hoverOpacity, setHoverOpacity] = useState(0);
  const hoverButtonRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!hoverButtonRef.current) return;
    const rect = hoverButtonRef.current.getBoundingClientRect();
    setCursorPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => setHoverOpacity(1);
  const handleMouseLeave = () => setHoverOpacity(0);

  return (
    <div className="relative size-full">
      <video
        src={src}
        loop
        muted
        autoPlay
        className="absolute left-0 top-0 size-full object-cover object-center"
      />
      <div className="relative z-10 flex size-full flex-col justify-between p-5 text-blue_gaming-50">
        <div>
          <h1 className="bento-title special-font">{title}</h1>
          {description && (
            <p className="mt-3 max-w-64 text-xs md:text-base">{description}</p>
          )}
        </div>

        {isComingSoon && (
          <div
            ref={hoverButtonRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="border-hsla relative flex w-fit cursor-pointer items-center gap-1 overflow-hidden rounded-full bg-black px-5 py-2 text-xs uppercase text-white/20"
          >
            <div
              className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
              style={{
                opacity: hoverOpacity,
                background: `radial-gradient(100px circle at ${cursorPosition.x}px ${cursorPosition.y}px, #656fe288, #00000026)`,
              }}
            />
            <TiLocationArrow className="relative z-20" />
            <p className="relative z-20">coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Features = () => (
  <section className="bg-black pb-52">
    <div className="container mx-auto px-3 md:px-10">
      <div className="px-5 py-32">
        <p className="font-circular-web text-lg text-blue_gaming-50">
          Into the Board Game Universe
        </p>
        <p className="max-w-md font-circular-web text-lg text-blue_gaming-50 opacity-50">
          Immerse yourself in a rich and ever-expanding collection where premium
          tabletop games, strategy classics, and family favorites converge into 
          the ultimate board gaming experience.
        </p>
      </div>

      <BentoTilt className="border-hsla relative mb-7 h-96 w-full overflow-hidden rounded-md md:h-[65vh]">
        <BentoCard
          src="/gaming-assets/videos/feature-1.mp4"
          title={<>strat<b>e</b>gy</>}
          description="Premium strategy board games that challenge your mind and reward tactical thinking."
          isComingSoon
        />
      </BentoTilt>

      <div className="grid h-[135vh] w-full grid-cols-2 grid-rows-3 gap-7">
        <BentoTilt className="bento-tilt_1 row-span-1 md:col-span-1 md:row-span-2">
          <BentoCard
            src="/gaming-assets/videos/feature-2.mp4"
            title={<>fam<b>i</b>ly</>}
            description="Fun and engaging family board games that bring everyone together for memorable moments."
            isComingSoon
          />
        </BentoTilt>

        <BentoTilt className="bento-tilt_1 row-span-1 ms-32 md:col-span-1 md:ms-0">
          <BentoCard
            src="/gaming-assets/videos/feature-3.mp4"
            title={<>puzz<b>l</b>e</>}
            description="Mind-bending puzzle games and brain teasers that challenge your problem-solving skills."
            isComingSoon
          />
        </BentoTilt>

        <BentoTilt className="bento-tilt_1 me-14 md:col-span-1 md:me-0">
          <BentoCard
            src="/gaming-assets/videos/feature-4.mp4"
            title={<>r<b>p</b>g</>}
            description="Immersive role-playing games and adventure board games that tell epic stories."
            isComingSoon
          />
        </BentoTilt>

        <BentoTilt className="bento-tilt_2">
          <Link to="/shop" className="flex size-full flex-col justify-between bg-violet_gaming-300 p-5 hover:bg-violet_gaming-200 transition-colors">
            <h1 className="bento-title special-font max-w-64 text-black">
              V<b>i</b>ew A<b>l</b>l
            </h1>
            <TiLocationArrow className="m-5 scale-[5] self-end" />
          </Link>
        </BentoTilt>

        <BentoTilt className="bento-tilt_2">
          <video
            src="/gaming-assets/videos/feature-5.mp4"
            loop
            muted
            autoPlay
            className="size-full object-cover object-center"
          />
        </BentoTilt>
      </div>
    </div>
  </section>
);

// Story Component
const Story = () => {
  const frameRef = useRef<HTMLImageElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    const { clientX, clientY } = e;
    const element = frameRef.current;

    if (!element) return;

    const rect = element.getBoundingClientRect();
    const xPos = clientX - rect.left;
    const yPos = clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((yPos - centerY) / centerY) * -10;
    const rotateY = ((xPos - centerX) / centerX) * 10;

    gsap.to(element, {
      duration: 0.3,
      rotateX,
      rotateY,
      transformPerspective: 500,
      ease: "power1.inOut",
    });
  };

  const handleMouseLeave = () => {
    const element = frameRef.current;
    if (element) {
      gsap.to(element, {
        duration: 0.3,
        rotateX: 0,
        rotateY: 0,
        ease: "power1.inOut",
      });
    }
  };

  return (
    <div id="story" className="min-h-dvh w-screen bg-black text-blue_gaming-50">
      <div className="flex size-full flex-col items-center py-10 pb-24">
        <p className="font-general text-sm uppercase md:text-[10px]">
          the board game universe
        </p>

        <div className="relative size-full">
          <AnimatedTitle
            title="the st<b>o</b>ry of <br /> tabletop ad<b>v</b>entures"
            containerClass="mt-5 pointer-events-none mix-blend-difference relative z-10"
          />

          <div className="story-img-container">
            <div className="story-img-mask">
              <div className="story-img-content">
                <img
                  ref={frameRef}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  onMouseUp={handleMouseLeave}
                  onMouseEnter={handleMouseLeave}
                  src="/gaming-assets/img/entrance.webp"
                  alt="entrance.webp"
                  className="object-contain"
                />
              </div>
            </div>

            <svg className="invisible absolute size-0" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="flt_tag">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
                  <feColorMatrix
                    in="blur"
                    mode="matrix"
                    values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
                    result="flt_tag"
                  />
                  <feComposite in="SourceGraphic" in2="flt_tag" operator="atop" />
                </filter>
              </defs>
            </svg>
          </div>
        </div>

        <div className="-mt-80 flex w-full justify-center md:-mt-64 md:me-44 md:justify-end">
          <div className="flex h-full w-fit flex-col items-center md:items-start">
            <p className="mt-3 max-w-sm text-center font-circular-web text-violet_gaming-50 md:text-start">
              Where board game worlds converge, lies GameZoo and the boundless collection.
              Discover premium tabletop experiences and shape your gaming journey amidst 
              infinite strategic possibilities.
            </p>

            <Button
              id="realm-btn"
              title="explore collection"
              containerClass="mt-5"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Contact Component
const ImageClipBox = ({ src, clipClass }: {
  src: string;
  clipClass: string;
}) => (
  <div className={clipClass}>
    <img src={src} />
  </div>
);

const CTA = () => {
  const currentTenant = useCurrentTenant();
  return (
    <div id="contact" className="my-20 min-h-96 w-screen px-10">
      <div className="relative rounded-lg bg-black py-24 text-blue_gaming-50 sm:overflow-hidden">
        <div className="absolute -left-20 top-0 hidden h-full w-72 overflow-hidden sm:block lg:left-20 lg:w-96">
          <ImageClipBox
            src="/gaming-assets/img/contact-1.webp"
            clipClass="contact-clip-path-1"
          />
          <ImageClipBox
            src="/gaming-assets/img/contact-2.webp"
            clipClass="contact-clip-path-2 lg:translate-y-40 translate-y-60"
          />
        </div>

        <div className="absolute -top-40 left-20 w-60 sm:top-1/2 md:left-auto md:right-10 lg:top-20 lg:w-80">
          <ImageClipBox
            src="/gaming-assets/img/swordman-partial.webp"
            clipClass="absolute md:scale-125"
          />
          <ImageClipBox
            src="/gaming-assets/img/swordman.webp"
            clipClass="sword-man-clip-path md:scale-125"
          />
        </div>

        <div className="flex flex-col items-center text-center">
          <p className="mb-10 font-general text-[10px] uppercase">
            Join {currentTenant.name}
          </p>

          <AnimatedTitle
            title="let&#39;s b<b>u</b>ild the <br /> new era of <br /> b<b>o</b>ard g<b>a</b>ming t<b>o</b>gether."
            containerClass="special-font !md:text-[6.2rem] w-full font-zentry !text-5xl !font-black !leading-[.9]"
          />

          <Link to="/shop">
          <Button title="Shop Board Games" containerClass="mt-10 cursor-pointer bg-creamy_gaming-100" />
          </Link>
        </div>
      </div>
    </div>
  );
};



// Main GamingLanding Component
const GamingLanding = () => {
  return (
    <main className="relative min-h-screen w-screen overflow-x-hidden bg-creamy_gaming-100">
      <Navbar />
      <Hero />
      <About />
      <Features />
      <Story />
      <CTA />
      <Footer bgColor="black" />
    </main>
  );
};

export default GamingLanding;
