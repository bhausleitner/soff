import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowLeftFromLine,
  ArrowRightFromLine,
  ArrowUp,
  Bell,
  BookUser,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Circle,
  CircuitBoardIcon,
  ClipboardPaste,
  ClipboardPlus,
  Clock,
  CloudDownload,
  Command,
  CreditCard,
  Download,
  File,
  FileText,
  FilePlus2,
  Fingerprint,
  HardDriveUpload,
  HelpCircle,
  History,
  Image,
  Laptop,
  LayoutDashboardIcon,
  ListRestart,
  Loader2,
  LoaderCircle,
  LogIn,
  LogOut,
  type LucideIcon,
  type LucideProps,
  Mail,
  MapPin,
  Maximize2,
  MessageCircleMore,
  MessageSquare,
  Moon,
  MoreVertical,
  Package,
  PackagePlus,
  PanelRightOpen,
  Pencil,
  Phone,
  Pizza,
  Plus,
  Receipt,
  RefreshCw,
  RotateCw,
  Scale,
  Settings,
  SunMedium,
  Sparkles,
  Trash2,
  Upload,
  User,
  User2Icon,
  UserX2Icon,
  Video,
  FileImage,
  Mic,
  Paperclip,
  PlusCircle,
  SendHorizontal,
  ThumbsUp,
  X,
  ZoomIn,
  ZoomOut
} from "lucide-react";

export type Icon = LucideIcon;

export const Icons = {
  add: Plus,
  arrowRight: ArrowRight,
  arrowDown: ArrowDown,
  arrowUp: ArrowUp,
  billing: CreditCard,
  check: Check,
  checkcheck: CheckCheck,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  circle: Circle,
  close: X,
  clock: Clock,
  cloudDownload: CloudDownload,
  dashboard: LayoutDashboardIcon,
  download: Download,
  edit: Pencil,
  ellipsis: MoreVertical,
  employee: UserX2Icon,
  fileImage: FileImage,
  fingerprint: Fingerprint,
  fullPage: Maximize2,
  help: HelpCircle,
  history: History,
  kanban: CircuitBoardIcon,
  laptop: Laptop,
  loaderCircle: LoaderCircle,
  login: LogIn,
  logo: Command,
  logout: LogOut,
  mail: Mail,
  mapPin: MapPin,
  media: Image,
  messageCircleMore: MessageCircleMore,
  messageSquare: MessageSquare,
  mic: Mic,
  moon: Moon,
  notifications: Bell,
  odoo: HardDriveUpload,
  product: Package,
  packagePlus: PackagePlus,
  panelRightOpen: PanelRightOpen,
  page: File,
  paperClip: Paperclip,
  phone: Phone,
  pizza: Pizza,
  plusCircle: PlusCircle,
  fileText: FileText,
  profile: User2Icon,
  quotes: Receipt,
  createQuote: FilePlus2,
  rfq: ClipboardPaste,
  rfqNew: ClipboardPlus,
  refresh: RotateCw,
  rescan: ListRestart,
  scale: Scale,
  sendHorizontal: SendHorizontal,
  sidebarCollapse: ArrowLeftFromLine,
  sidebarExpand: ArrowRightFromLine,
  settings: Settings,
  sparkles: Sparkles,
  spinner: Loader2,
  sun: SunMedium,
  suppliers: BookUser,
  sync: RefreshCw,
  thumbsUp: ThumbsUp,
  trash: Trash2,
  upload: Upload,
  user: User,
  video: Video,
  warning: AlertTriangle,
  zoomIn: ZoomIn,
  zoomOut: ZoomOut,
  gitHub: ({ ...props }: LucideProps) => (
    <svg
      aria-hidden="true"
      focusable="false"
      data-prefix="fab"
      data-icon="github"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 496 512"
      {...props}
    >
      <path
        fill="currentColor"
        d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 .3-6.2 2.3zm44.2-1.7c-2.9 .7-4.9 2.6-4.6 4.9 .3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3 .7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3 .3 2.9 2.3 3.9 1.6 1 3.6 .7 4.3-.7 .7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3 .7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3 .7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"
      ></path>
    </svg>
  ),
  odooLogo: ({ ...props }: LucideProps) => (
    <svg
      aria-hidden="true"
      focusable="false"
      data-prefix="fab"
      data-icon="github"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 496 512"
      {...props}
    >
      <path
        d="M178.827 6.02073C71.285 33.3742 0 122.868 0 230.498C0.307263 310.477 36.257 377.374 103.24 422.27C128.436 439.217 167.151 455.272 183.743 455.272C188.967 455.57 194.498 456.759 195.419 458.245C197.57 462.111 275.615 461.813 278.073 457.948C279.302 456.164 283.604 454.975 288.213 455.272C315.559 455.867 369.33 429.108 402.822 397.889C494.079 313.45 499.61 168.061 414.805 76.4857C382.543 41.6992 341.369 17.9136 293.744 6.02073C261.481 -2.00693 210.475 -2.00693 178.827 6.02073ZM268.855 99.3794C310.028 110.083 343.213 136.545 361.341 174.007C386.844 225.443 375.476 288.178 333.688 328.911C279.302 381.537 190.81 381.537 136.425 328.911C81.732 275.691 81.1175 189.468 135.196 136.545C170.531 101.758 222.766 87.1893 268.855 99.3794Z"
        fill="#9C5789"
      />
    </svg>
  )
};
