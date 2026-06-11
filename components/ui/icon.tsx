import {
  Building2,
  Camera,
  Coffee,
  Fish,
  Gem,
  Landmark,
  MapPin,
  Moon,
  PiggyBank,
  Salad,
  Sandwich,
  Scale,
  ScrollText,
  ShieldCheck,
  ShoppingBag,
  Sprout,
  TrainFront,
  Trees,
  Utensils,
  UtensilsCrossed,
  Wallet,
  Waves,
  Wine,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * Explicit name → component map for the icons referenced by lib/constants.
 * Keeping it explicit (rather than indexing the whole library) preserves
 * tree-shaking and keeps the icon set intentional.
 */
const ICONS: Record<string, LucideIcon> = {
  Building2,
  Camera,
  Coffee,
  Fish,
  Gem,
  Landmark,
  MapPin,
  Moon,
  PiggyBank,
  Salad,
  Sandwich,
  Scale,
  ScrollText,
  ShieldCheck,
  ShoppingBag,
  Sprout,
  TrainFront,
  Trees,
  Utensils,
  UtensilsCrossed,
  Wallet,
  Waves,
  Wine,
  Zap,
};

export function Icon({
  name,
  className,
}: {
  name?: string;
  className?: string;
}) {
  if (!name) return null;
  const Cmp = ICONS[name];
  if (!Cmp) return null;
  return <Cmp className={className} />;
}
