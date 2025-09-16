import {
  ArrowRight,
  Check,
  ChevronsUpDown,
  Circle,
  Copy,
  Plus,
  PlusCircle,
  Search,
  Settings,
  Share2,
  Sun,
  Trash,
  User,
  ShoppingCart,
  Menu,
  Filter,
  ChevronDown,
  ChevronUp,
  Car,
  Box,
  Truck,
  X,
  Eye,
  EyeOff,
  Aperture,
  Zap,
  Gift,
  Loader2,
  HelpCircle, // Explicitly kept as it's used
  Wrench, // Assuming this is for Suspension, if not, needs specific icon
} from 'lucide-react';

const IconsCollection = {
  arrowRight: ArrowRight,
  check: Check,
  chevronDown: ChevronsUpDown,
  circle: Circle,
  close: X,
  copy: Copy,
  dark: Sun,
  light: Sun,
  loader: Loader2,
  plus: Plus,
  plusCircle: PlusCircle,
  search: Search,
  settings: Settings,
  share: Share2,
  spinner: Loader2,
  trash: Trash,
  user: User,
  shoppingCart: ShoppingCart,
  menu: Menu,
  filter: Filter,
  chevronDownRadix: ChevronDown,
  chevronUpRadix: ChevronUp,
  car: Car, // For Engine category
  suspension: Wrench, // Changed from Zap to Wrench for Suspension
  brakes: Circle, // For Brakes category
  electrical: Zap, // For Electrical category
  body: Box, // For Body category
  accessories: Gift, // For Accessories category
  truck: Truck, // For delivery/store benefits
  eye: Eye,
  eyeOff: EyeOff,
  aperture: Aperture,
  zap: Zap, // General purpose 'power' or 'electrical'
  help: HelpCircle, 
  gift: Gift, // Added gift as it was used as Icons.accessories
};

export {IconsCollection as Icons};
