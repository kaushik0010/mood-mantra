interface StatusDisplayProps {
  status: string;
}

export function StatusDisplay({ status }: StatusDisplayProps) {
  return (
    <p className="mb-8 text-slate-400 font-mono text-sm tracking-widest uppercase animate-pulse">
      {status}
    </p>
  );
}