import { Wrench, Scissors, Zap, GraduationCap, Paintbrush, Car, Home, Sparkles } from "lucide-react";

export interface ServiceCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const serviceCategories: ServiceCategory[] = [
  {
    id: "electrician",
    name: "كهربائي",
    icon: Zap,
    description: "تمديدات كهربائية وصيانة",
  },
  {
    id: "plumber",
    name: "سباك",
    icon: Wrench,
    description: "أعمال السباكة والصيانة",
  },
  {
    id: "barber",
    name: "حلاق",
    icon: Scissors,
    description: "قص شعر وحلاقة",
  },
  {
    id: "tutor",
    name: "دروس خصوصية",
    icon: GraduationCap,
    description: "تعليم ودروس خاصة",
  },
  {
    id: "painter",
    name: "دهان",
    icon: Paintbrush,
    description: "أعمال الدهان والطلاء",
  },
  {
    id: "mechanic",
    name: "ميكانيكي",
    icon: Car,
    description: "صيانة السيارات",
  },
  {
    id: "cleaning",
    name: "تنظيف",
    icon: Sparkles,
    description: "خدمات التنظيف المنزلي",
  },
  {
    id: "maintenance",
    name: "صيانة منزلية",
    icon: Home,
    description: "صيانة عامة للمنزل",
  },
];
