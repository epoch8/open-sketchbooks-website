// lib/navigation/types.ts

export type IconName =
  | "github"; // 👉 расширяешь по мере роста

export type NavItemVariant =
  | "default"
  | "cta"
  | "icon";

export interface NavItem {
  label?: string;
  href: string;
  icon?: IconName;
  variant?: NavItemVariant;
  external?: boolean;
  description?: string;
  enabled?: boolean;
}