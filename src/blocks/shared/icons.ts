// Icon tokens for the block system
// Single source of truth for all icon utilities

import {
  // System icons
  XMarkIcon,
  Cog6ToothIcon,
  BellIcon,
  QuestionMarkCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  
  // Navigation icons
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  HomeIcon,
  Bars3Icon,
  MagnifyingGlassIcon,
  
  // Status icons
  ClockIcon,
  CheckIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  LockClosedIcon,
  LockOpenIcon,
  
  // Content icons
  DocumentIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  FolderIcon,
  ArchiveBoxIcon,
  PlusIcon,
  MinusIcon,
  PencilIcon,
  TrashIcon,
  
  // Communication icons
  ChatBubbleLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  ShareIcon,
  HeartIcon,
  StarIcon,
  
  // Business icons
  BuildingOfficeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CalendarIcon,
  ClipboardDocumentIcon,
  
  // User icons
  UserIcon,
  UsersIcon,
  UserCircleIcon,
  UserPlusIcon,
  
  // Actions icons
  PlayIcon,
  PauseIcon,
  StopIcon,
  ForwardIcon,
  BackwardIcon,
  ArrowPathIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  
  // Layout icons
  Squares2X2Icon,
  ListBulletIcon,
  TableCellsIcon,
  RectangleStackIcon,
  
  // Technology icons
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  WifiIcon,
  SignalIcon,
  
  // Special icons
  SparklesIcon,
  FireIcon,
  BoltIcon,
  SunIcon,
  MoonIcon,
  
} from '@heroicons/react/24/outline';

// ============================================
// ICON TOKENS
// ============================================

export const icons = {
  system: {
    close: XMarkIcon,
    settings: Cog6ToothIcon,
    notifications: BellIcon,
    help: QuestionMarkCircleIcon,
    info: InformationCircleIcon,
    warning: ExclamationTriangleIcon,
    success: CheckCircleIcon,
    error: XCircleIcon,
    show: EyeIcon,
    hide: EyeSlashIcon,
  },
  navigation: {
    chevronLeft: ChevronLeftIcon,
    chevronRight: ChevronRightIcon,
    chevronUp: ChevronUpIcon,
    chevronDown: ChevronDownIcon,
    arrowLeft: ArrowLeftIcon,
    arrowRight: ArrowRightIcon,
    arrowUp: ArrowUpIcon,
    arrowDown: ArrowDownIcon,
    home: HomeIcon,
    menu: Bars3Icon,
    search: MagnifyingGlassIcon,
  },
  status: {
    pending: ClockIcon,
    complete: CheckIcon,
    alert: ExclamationCircleIcon,
    verified: ShieldCheckIcon,
    unverified: ShieldExclamationIcon,
    locked: LockClosedIcon,
    unlocked: LockOpenIcon,
  },
  content: {
    document: DocumentIcon,
    image: PhotoIcon,
    video: VideoCameraIcon,
    audio: MusicalNoteIcon,
    folder: FolderIcon,
    archive: ArchiveBoxIcon,
    add: PlusIcon,
    remove: MinusIcon,
    edit: PencilIcon,
    delete: TrashIcon,
  },
  communication: {
    chat: ChatBubbleLeftIcon,
    email: EnvelopeIcon,
    phone: PhoneIcon,
    share: ShareIcon,
    like: HeartIcon,
    favorite: StarIcon,
  },
  business: {
    office: BuildingOfficeIcon,
    team: UserGroupIcon,
    money: CurrencyDollarIcon,
    analytics: ChartBarIcon,
    calendar: CalendarIcon,
    clipboard: ClipboardDocumentIcon,
  },
  user: {
    profile: UserIcon,
    group: UsersIcon,
    avatar: UserCircleIcon,
    addUser: UserPlusIcon,
  },
  actions: {
    play: PlayIcon,
    pause: PauseIcon,
    stop: StopIcon,
    forward: ForwardIcon,
    backward: BackwardIcon,
    refresh: ArrowPathIcon,
    upload: CloudArrowUpIcon,
    download: CloudArrowDownIcon,
  },
  layout: {
    grid: Squares2X2Icon,
    list: ListBulletIcon,
    table: TableCellsIcon,
    stack: RectangleStackIcon,
  },
  technology: {
    desktop: ComputerDesktopIcon,
    mobile: DevicePhoneMobileIcon,
    web: GlobeAltIcon,
    wifi: WifiIcon,
    signal: SignalIcon,
  },
  special: {
    magic: SparklesIcon,
    fire: FireIcon,
    lightning: BoltIcon,
    sun: SunIcon,
    moon: MoonIcon,
  },
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

// Helper function to get icon by dot-path
export const getIcon = (path: IconTokenPath) => {
  const [category, name] = path.split('.') as [keyof typeof icons, string];
  return icons[category]?.[name as keyof typeof icons[typeof category]];
};

// Helper function to get all icons in a category
export const getIconCategory = (category: keyof typeof icons) => {
  return icons[category];
};

// Helper function to get all available icon paths
export const getAllIconPaths = (): IconTokenPath[] => {
  const paths: IconTokenPath[] = [];
  Object.keys(icons).forEach(category => {
    Object.keys(icons[category as keyof typeof icons]).forEach(name => {
      paths.push(`${category}.${name}` as IconTokenPath);
    });
  });
  return paths;
};

// ============================================
// TYPE EXPORTS
// ============================================

// Create union type for all valid icon dot-paths
type IconCategoryKeys = keyof typeof icons;
type IconNameKeys<T extends IconCategoryKeys> = keyof typeof icons[T];

export type IconTokenPath = {
  [K in IconCategoryKeys]: `${K}.${IconNameKeys<K> & string}`;
}[IconCategoryKeys];

// Individual category types
export type SystemIconToken = keyof typeof icons.system;
export type NavigationIconToken = keyof typeof icons.navigation;
export type StatusIconToken = keyof typeof icons.status;
export type ContentIconToken = keyof typeof icons.content;
export type CommunicationIconToken = keyof typeof icons.communication;
export type BusinessIconToken = keyof typeof icons.business;
export type UserIconToken = keyof typeof icons.user;
export type ActionsIconToken = keyof typeof icons.actions;
export type LayoutIconToken = keyof typeof icons.layout;
export type TechnologyIconToken = keyof typeof icons.technology;
export type SpecialIconToken = keyof typeof icons.special;

// Category type
export type IconCategoryToken = keyof typeof icons; 