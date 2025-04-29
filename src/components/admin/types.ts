
import { UserRole } from "@/context/AuthContext";
import { LucideIcon } from "lucide-react";

export interface MenuItem {
  name: string;
  icon: LucideIcon;
  path: string;
  badge?: number;
}

export interface ProfileData {
  id?: string;
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
  role?: UserRole;
}

export interface SearchResultItem {
  id: string;
  type: 'product' | 'order' | 'customer';
  title: string;
  subtitle?: string;
  image?: string;
  metadata?: Record<string, any>;
}

export type ActivityType = 'order' | 'user' | 'product' | 'support';

export interface Activity {
  id: number;
  type: ActivityType;
  description: string;
  time: string;
}
