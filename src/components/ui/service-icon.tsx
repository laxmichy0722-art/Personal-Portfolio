import {
  Code2,
  Gauge,
  Gem,
  Globe,
  LayoutDashboard,
  Palette,
  ShoppingCart,
  Wrench,
} from "lucide-react";

import type { Service } from "@/types/content";

/**
 * Maps the `icon` field on a `Service` to a Lucide component.
 *
 * Keeping the mapping in one place means the data files stay serialisable and
 * adding a service icon is a single-line change here.
 */
const serviceIcons = {
  palette: Palette,
  gem: Gem,
  "layout-dashboard": LayoutDashboard,
  globe: Globe,
  "code-2": Code2,
  "shopping-cart": ShoppingCart,
  gauge: Gauge,
  wrench: Wrench,
} as const satisfies Record<Service["icon"], typeof Palette>;

export interface ServiceIconProps {
  name: Service["icon"];
  className?: string;
  /** Stroke width override; defaults to Lucide's 2. */
  strokeWidth?: number;
}

export function ServiceIcon({
  name,
  className,
  strokeWidth = 1.75,
}: ServiceIconProps) {
  const Icon = serviceIcons[name];
  return (
    <Icon
      aria-hidden="true"
      className={className}
      strokeWidth={strokeWidth}
      focusable="false"
    />
  );
}