interface AudioDebugProps {
  audioBlob: Blob | null;
}

export function AudioDebug({ audioBlob }: AudioDebugProps) {
  if (!audioBlob) return null;

  return (
    <div className="mt-8 p-4 border border-slate-800 rounded bg-slate-900/50">
      <p className="text-xs text-slate-500 mb-2">Debug: Audio Captured ({audioBlob.size} bytes)</p>
      <audio controls src={URL.createObjectURL(audioBlob)} className="h-8 w-64" />
    </div>
  );
}