export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="2" y="2" width="28" height="28" rx="8" fill="currentColor" />
      <circle cx="12" cy="14" r="2.5" fill="var(--background)" />
      <circle cx="20" cy="14" r="2.5" fill="var(--background)" />
      <path
        d="M11 20c1.5 1.5 3.5 2.5 5 2.5s3.5-1 5-2.5"
        stroke="var(--background)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
