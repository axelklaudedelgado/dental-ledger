import { useEffect, useRef, useState } from "react";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const OverflowTooltip = ({ text, maxWidth = 200 }) => {
  const textRef = useRef(null);
  const [isOverflown, setIsOverflown] = useState(false);


  const checkOverflow = () => {
    const el = textRef.current;
    if (el) {
      setIsOverflown(el.scrollWidth > el.clientWidth);
    }
  };

  useEffect(() => {
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, []);

  return (
    <TooltipProvider>
      <Tooltip delayDuration={100} open={isOverflown ? undefined : false}>
        <TooltipTrigger asChild>
          <span ref={textRef} className="block truncate" style={{ maxWidth }}>
            {text}
          </span>
        </TooltipTrigger>
        <TooltipContent>{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default OverflowTooltip;
