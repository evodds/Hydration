const rows = [
  { date: "2025-01-01", sent: "4", drank: "3", completion: "75%" },
  { date: "2025-01-02", sent: "4", drank: "4", completion: "100%" },
  { date: "2025-01-03", sent: "4", drank: "2", completion: "50%" },
  { date: "2025-01-04", sent: "3", drank: "2", completion: "67%" },
];

export default function History() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">History & stats</h1>
        <p className="text-sm text-slate-600">
          Future view of how often you followed your hydration pings.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-100 text-xs text-slate-500">
          Weekly completion chart (placeholder)
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs text-slate-600 sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-500">
                <th className="pb-2 pr-4">Date</th>
                <th className="pb-2 pr-4">Pings sent</th>
                <th className="pb-2 pr-4">Marked as ‘drank’</th>
                <th className="pb-2 pr-4">Completion %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, idx) => (
                <tr key={row.date} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="py-2 pr-4">{row.date}</td>
                  <td className="py-2 pr-4">{row.sent}</td>
                  <td className="py-2 pr-4">{row.drank}</td>
                  <td className="py-2 pr-4">{row.completion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
