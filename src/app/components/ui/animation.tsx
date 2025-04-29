import { cn } from "@/lib/utils";

interface AnimatedContainerProps {
  children: React.ReactNode;
  className?: string;
  animation?: "fade-in" | "scale-in" | "slide-in";
}

export function AnimatedContainer({
  children,
  className,
  animation = "fade-in"
}: AnimatedContainerProps) {
  const animations = {
    "fade-in": "opacity-0 animate-in fade-in duration-300",
    "scale-in": "opacity-0 scale-95 animate-in fade-in zoom-in-95 duration-200",
    "slide-in": "opacity-0 -translate-y-2 animate-in fade-in slide-in-from-top-2 duration-300"
  };

  return (
    <div className={cn(animations[animation], className)}>
      {children}
    </div>
  );
}