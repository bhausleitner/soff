import type { Icons } from "~/components/icons";

export interface NavItem {
  title: string;
  href: string;
  icon: keyof typeof Icons;
  label: string;
  disabled?: boolean;
}
