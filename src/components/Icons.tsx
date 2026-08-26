import {
  Activity,
  Baby,
  Bandage,
  Bone,
  Brain,
  Ear,
  Eye,
  Flower2,
  HeartPulse,
  Microscope,
  PersonStanding,
  Pill,
  ScanHeart,
  Sparkles,
  Stethoscope,
  Syringe,
  type LucideIcon,
} from "lucide-react";
import type { ReactElement, SVGProps } from "react";

export function ToothIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={props.width ?? 24}
      height={props.height ?? 24}
      className={props.className}
    >
      <path d="M12 5.5C10.5 4 7.6 3.6 5.8 4.4 4 5.2 3.3 7 3.6 9c.3 2 1.1 3.2 1.6 5 .4 1.6.6 3.4.8 5 .1 1.2.9 2 2 2 1.1 0 1.9-.8 2.1-2l.5-3.4c.1-.8.9-1.4 1.4-1.4s1.3.6 1.4 1.4l.5 3.4c.2 1.2 1 2 2.1 2 1.1 0 1.9-.8 2-2 .2-1.6.4-3.4.8-5 .5-1.8 1.3-3 1.6-5 .3-2-.4-3.8-2.2-4.6-1.8-.8-4.7-.4-6.2 1.1z" />
    </svg>
  );
}

type IconComponent = (props: { className?: string; size?: number }) => ReactElement;

function wrap(Icon: LucideIcon): IconComponent {
  const Wrapped = ({ className, size = 24 }: { className?: string; size?: number }) => (
    <Icon className={className} size={size} strokeWidth={1.8} />
  );
  Wrapped.displayName = `DeptIcon(${Icon.displayName ?? "icon"})`;
  return Wrapped;
}

const ToothWrapped: IconComponent = ({ className, size = 24 }) => (
  <ToothIcon className={className} width={size} height={size} />
);

export const DEPARTMENT_ICONS: Record<string, IconComponent> = {
  stethoscope: wrap(Stethoscope),
  heart: wrap(HeartPulse),
  baby: wrap(Baby),
  bone: wrap(Bone),
  flower: wrap(Flower2),
  tooth: ToothWrapped,
  sparkles: wrap(Sparkles),
  ear: wrap(Ear),
  brain: wrap(Brain),
  eye: wrap(Eye),
  activity: wrap(Activity),
  syringe: wrap(Syringe),
  pill: wrap(Pill),
  microscope: wrap(Microscope),
  bandage: wrap(Bandage),
  personstanding: wrap(PersonStanding),
  scaneheart: wrap(ScanHeart),
};

export const ICON_OPTIONS = Object.keys(DEPARTMENT_ICONS);

export function DepartmentIcon({
  name,
  className,
  size = 24,
}: {
  name: string;
  className?: string;
  size?: number;
}) {
  const Icon = DEPARTMENT_ICONS[name] ?? DEPARTMENT_ICONS.activity;
  return <Icon className={className} size={size} />;
}

export function LighthouseIcon({
  className,
  size = 24,
  strokeWidth = 1.8,
}: {
  className?: string;
  size?: number;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
    >
      <path d="M8.5 21l1.1-12h4.8l1.1 12" />
      <path d="M6 21h12" />
      <path d="M9.6 9L12 4.5 14.4 9" />
      <path d="M4.5 6.5l4 1.5" />
      <path d="M19.5 6.5l-4 1.5" />
      <path d="M12 12.5v.01" />
      <path d="M11.4 16h1.2" />
    </svg>
  );
}

export function FacebookIcon({
  className,
  size = 24,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      <path d="M13.6 21v-7.1h2.4l.4-2.9h-2.8V9.1c0-.84.26-1.42 1.6-1.42h1.24V5.1c-.6-.07-1.34-.11-2.04-.11-2.33 0-3.84 1.42-3.84 3.94V11H8.14v2.9h2.42V21a10 10 0 0 0 3.04 0z" />
    </svg>
  );
}
