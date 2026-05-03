interface Props {
  className?: string;
  label?: string;
}

export function LiveIndicator({ className = "", label = "Live" }: Props) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-risk-low/30 bg-risk-low/5 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-risk-low ${className}`}>
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-risk-low opacity-50" />
        <span className="relative inline-flex size-1.5 rounded-full bg-risk-low" />
      </span>
      {label}
    </span>
  );
}
