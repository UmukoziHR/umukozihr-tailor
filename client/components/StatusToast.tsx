interface StatusToastProps {
  status: string | null;
  runId: string | null;
}

export default function StatusToast({ status, runId }: StatusToastProps) {
  if (!status) return null;

  const statusConfig = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳' },
    processing: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '⚙️' },
    completed: { bg: 'bg-green-100', text: 'text-green-800', icon: '✅' },
    failed: { bg: 'bg-red-100', text: 'text-red-800', icon: '❌' }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${config.bg} ${config.text}`}>
      <div className="flex items-center">
        <span className="text-2xl mr-3">{config.icon}</span>
        <div>
          <p className="font-semibold">Generation {status}</p>
          {runId && <p className="text-sm">Run ID: {runId.slice(0, 8)}...</p>}
        </div>
      </div>
    </div>
  );
}