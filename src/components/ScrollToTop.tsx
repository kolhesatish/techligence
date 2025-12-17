import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

const ScrollToTop = () => {
  const [isAtTop, setIsAtTop] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Scroll to top when route changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  useEffect(() => {
    const toggleVisibility = () => {
      // Consider "at top" if within the first 100px
      const SCROLL_THRESHOLD = 100;
      if (window.pageYOffset > SCROLL_THRESHOLD) {
        setIsAtTop(false);
      } else {
        setIsAtTop(true);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    // Initial check
    toggleVisibility();
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const handleScroll = () => {
    if (isAtTop) {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <Button
      onClick={handleScroll}
      onKeyDown={(e) => e.key === "Enter" && handleScroll()}
      size="icon"
      title={isAtTop ? "Scroll to Bottom" : "Back to Top"}
      className={cn(
        "fixed bottom-28 right-6 z-50 rounded-full shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none",
        "opacity-100 translate-y-0"
      )}
      aria-label={isAtTop ? "Scroll to bottom" : "Scroll back to top"}
    >
      {isAtTop ? (
        <ArrowDown className="h-5 w-5" />
      ) : (
        <ArrowUp className="h-5 w-5" />
      )}
    </Button>
  );
};

export default ScrollToTop;

