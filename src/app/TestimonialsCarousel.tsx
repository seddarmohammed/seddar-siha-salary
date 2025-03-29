"use client";

import { useEffect, useRef, useState } from "react";

const testimonials = [
  {
    id: 1,
    title: " اخر تحديث ",
    text: "29 رمضان 1446 الموافق 29 مارس 2025",
    color: "blue",
  },
  {
    id: 2,
    title: "عيد فطر مبارك  ",
    text: "تقبل الله طاعاتكم وأعمالكم  كل عام وأنتم درع الأمة وساهرين على سلامتنا. شكراً لتفانيكم وتضحياتكم . أعاده الله عليكم بالصحة والسلامة لكم ولأسركم 🌙⭐",
    color: "green",
  },
  {
    id: 3,
    title: " تعويض المنطقة ",
    text: "نعمل على تحيين المنصة لتعم كل الأسلاك والرتب و تشمل مخنلف المؤسسات الصحية عبر ربوع الوطن ، نرجو من مسيري مكاتب الاجور عبر ولايات الجنوب والهضاب التواصل معنا من اجل ادراج هذا التعويض في القريب العاجل",
    color: "blue",
  },
];

export function TestimonialsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout>();
  const isDragging = useRef(false);
  const testimonialsWithClone = [...testimonials, testimonials[0]];

  const handleMouseEnter = () => {
    clearInterval(timerRef.current);
  };

  const handleMouseLeave = () => {
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonialsWithClone.length);
    }, 5000);
  };

  useEffect(() => {
    const autoScroll = () => {
      setActiveIndex((prev) => (prev + 1) % testimonialsWithClone.length);
    };

    timerRef.current = setInterval(autoScroll, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testimonialsWithClone.length]);

  useEffect(() => {
    if (!containerRef.current || activeIndex >= testimonialsWithClone.length)
      return;

    // Reset to first item without animation when reaching clone
    if (activeIndex === testimonialsWithClone.length - 1) {
      const container = containerRef.current;
      const scrollLeft = container.scrollLeft;

      // Instant scroll to clone position
      container.scrollTo({
        left: scrollLeft,
        behavior: "auto",
      });

      // Schedule reset after animation would normally complete
      setTimeout(() => {
        setActiveIndex(0);
        container.scrollTo({
          left: 0,
          behavior: "auto",
        });
      }, 50);
    }
  }, [activeIndex, testimonialsWithClone.length]);

  useEffect(() => {
    if (!containerRef.current || isDragging.current) return;

    const container = containerRef.current;
    const element = container.children[activeIndex] as HTMLElement;
    const containerWidth = container.offsetWidth;
    const elementWidth = element.offsetWidth;
    const scrollLeft = element.offsetLeft - (containerWidth - elementWidth) / 2;

    container.scrollTo({
      left: scrollLeft,
      behavior: "smooth",
    });
  }, [activeIndex]);

  // Touch/mouse handlers for manual control
  const handleDragStart = () => {
    isDragging.current = true;
    clearInterval(timerRef.current);
  };

  const handleDragEnd = () => {
    isDragging.current = false;
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonialsWithClone.length);
    }, 5000);
  };

  return (
    <div
      className="mt-4 md:mt-6"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Scrollbar hidden wrapper */}
      <div className="overflow-hidden px-4 relative">
        <div
          ref={containerRef}
          className="flex overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 scrollbar-hidden"
          style={{
            scrollSnapType: "x mandatory",
            scrollPadding: "0 16px",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none", // Firefox
            msOverflowStyle: "none", // IE/Edge
          }}
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchEnd={handleDragEnd}
        >
          {testimonialsWithClone.map((testimonial, index) => (
            <div
              key={index}
              className="w-[85vw] min-w-[85vw] sm:w-[70vw] sm:min-w-[70vw] md:w-[60vw] md:min-w-[60vw] snap-center p-2 sm:p-4"
            >
              <div
                className={`bg-white rounded-lg shadow-lg p-4 sm:p-6 border-l-4 border-${testimonial.color}-500 h-full`}
              >
                <div className="mb-4 sm:mb-5">
                  <h3
                    className={`text-${testimonial.color}-600 font-bold text-lg sm:text-xl mb-2 text-right`}
                  >
                    {testimonial.title}
                  </h3>
                  <p className="text-gray-600 text-right text-sm sm:text-base leading-relaxed">
                    {testimonial.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center gap-2 mt-4 mb-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${
              activeIndex % testimonials.length === index
                ? "bg-primary"
                : "bg-gray-300"
            }`}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}
