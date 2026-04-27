import logoUrl from "@/assets/logo.png";

export function Logo({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src={logoUrl}
      alt="Golden Spoon"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size }}
    />
  );
}
