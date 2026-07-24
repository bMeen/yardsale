import { Bell, Home, Plus, Tag, User } from "lucide-react";

export const NAVIGATIONS = [
  { id: "home" , icon: Home, label: "Home", href: 'discover' },
  { id: "auctions" , icon: Tag, label: "Auctions", href: 'auctions' },
  { id: "create", icon: Plus, label: "", href: 'auctions/create' },
  { id: "activity" , icon: Bell, label: "Activity", href: 'activity' },
  { id: "profile", icon: User, label: "Profile", href: 'profile' },
];