import React, { useRef, useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface CarouselProps {
  children: React.ReactNode;
  className?: string;
  itemWidth?: string; // Tailwind width class (e.g. "w-64") or fixed width
  dataHook?: string;
}

export const Carousel: React.FC<CarouselProps> = ({ children, className = "", dataHook }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeft(scrollLeft > 10);
    // Tolerance of 10px for rounding errors
    setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [children]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const { clientWidth } = scrollRef.current;
    // Scroll by ~80% of the visible area
    const offset = direction === "left" ? -clientWidth * 0.8 : clientWidth * 0.8;
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <div className={`relative group ${className}`} data-hook={dataHook}>
      {/* Left Button */}
      <div
        className={`absolute left-0 top-0 bottom-0 z-20 flex items-center justify-center w-12 bg-gradient-to-r from-gray-50 dark:from-slate-900 to-transparent transition-opacity duration-300 ${showLeft ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <button
          onClick={() => scroll("left")}
          className="w-10 h-10 bg-white/90 dark:bg-black/60 hover:bg-white dark:hover:bg-black/80 text-gray-900 dark:text-white rounded-full shadow-lg flex items-center justify-center transform -translate-x-2 group-hover:translate-x-0 transition-all"
          aria-label="Scroll left"
          data-hook={dataHook ? `${dataHook}-prev-btn` : "carousel-prev-btn"}
        >
          <FaChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Scroll Container */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex overflow-x-auto gap-4 pb-4 px-1 no-scrollbar snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        data-hook={dataHook ? `${dataHook}-scroll-container` : "carousel-scroll-container"}
      >
        {React.Children.map(children, (child) => (
          <div className="snap-start shrink-0">{child}</div>
        ))}
      </div>

      {/* Right Button */}
      <div
        className={`absolute right-0 top-0 bottom-0 z-20 flex items-center justify-center w-12 bg-gradient-to-l from-gray-50 dark:from-slate-900 to-transparent transition-opacity duration-300 ${showRight ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <button
          onClick={() => scroll("right")}
          className="w-10 h-10 bg-white/90 dark:bg-black/60 hover:bg-white dark:hover:bg-black/80 text-gray-900 dark:text-white rounded-full shadow-lg flex items-center justify-center transform translate-x-2 group-hover:translate-x-0 transition-all"
          aria-label="Scroll right"
          data-hook={dataHook ? `${dataHook}-next-btn` : "carousel-next-btn"}
        >
          <FaChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
