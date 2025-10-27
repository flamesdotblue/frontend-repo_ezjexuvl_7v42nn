import { useMemo, useRef, useState } from "react";
import { Upload, Download, Copy, BarChart3, List, Trash2 } from "lucide-react";

function parseLogLine(line) {
  // Try to parse common formats: ISO, yyyy-mm-dd hh:mm:ss, level and message
  const patterns = [
    /^(?<ts>\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)\s+(?<level>TRACE|DEBUG|INFO|WARN|WARNING|ERROR|FATAL)[:\- ]\s*(?<msg>.*)$/i,
    /^(?<ts>\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2})\s+\[(?<level>TRACE|DEBUG|INFO|WARN|WARNING|ERROR|FATAL)\]\s*(?<msg>.*)$/i,
    /^\[(?<ts>\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\]\s+(?<level>TRACE|DEBUG|INFO|WARN|WARNING|ERROR|FATAL)\s*[:\-]?\s*(?<msg>.*)$/i,
    /^(?<level>TRACE|DEBUG|INFO|WARN|WARNING|ERROR|FATAL)[:\- ]\s*(?<msg>.*)$/i,
  ];
  for (const p of patterns) {
    const m = line.match(p);
    if (m) {
      const ts = m.groups?.ts || "";
      const level = (m.groups?.level || "").toUpperCase().replace("WARNING", "WARN");
      const msg = m.groups?.msg ?? line;
      return { timestamp: ts, level, message: msg };
    }
  }
  return { timestamp: "", level: "", message: line };
}

function toCSV(rows) {
  const headers = ["timestamp", "level", "message"];
  const out = [headers, ...rows.map((r) => headers.map((h) => r[h] ?? ""))]
    .map((r) =>
      r
        .map((v) => {
          const s = v == null ? "" : String(v);
          if (s.includes('"') || s.includes(",") || s.includes("\n")) {
            return '"' + s.replaceAll('"', '""') + '"';
          }
          return s;
        })
        .join(",")
    )
    .join("\n");
  return out;
}

function download(filename, content, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function LogAnalyzer() {
  const [input, setInput] = useState("");
  const [rows, setRows] = useState([]);
  const fileRef = useRef(null);

  const stats = useMemo(() => {
    const counts = rows.reduce(
      (acc, r) => {
        const lvl = r.level || "OTHER";
        acc[lvl] = (acc[lvl] || 0) + 1;
        acc.TOTAL += 1;
        return acc;
      },
      { TOTAL: 0 }
    );
    return counts;
  }, [rows]);

  const onAnalyze = () => {
    const lines = input.split(/\r?\n/).filter((l) => l.trim().length);
    const parsed = lines.map(parseLogLine);
    setRows(parsed);
  };

  const onClear = () => {
    setInput("");
    setRows([]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const onCopy = async () => {
    if (!rows.length) return;
    await navigator.clipboard.writeText(JSON.stringify(rows, null, 2));
  };

  const onDownloadCSV = () => {
    if (!rows.length) return;
    download("logs.csv", toCSV(rows), "text/csv");
  };

  const onFile = async (file) => {
    const text = await file.text();
    setInput(text);
  };

  const levels = ["ERROR", "WARN", "INFO", "DEBUG", "TRACE", "OTHER"]; 

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 ml-auto">
          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white text-sm text-gray-700 cursor-pointer hover:bg-gray-50">
            <Upload className="h-4 w-4" />
            <span>Upload log</span>
            <input
              ref={fileRef}
              type="file"
              accept={".log,.txt"}
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
            />
          </label>
          <button
            onClick={onClear}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white text-sm text-gray-700 hover:bg-gray-50"
          >
            <Trash2 className="h-4 w-4" /> Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <List className="h-4 w-4 text-blue-600" /> Log Input
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your logs here or upload a .log file"
            className="w-full h-64 rounded-lg border bg-white p-3 font-mono text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-green-600" /> Summary
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={onCopy}
                disabled={!rows.length}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <Copy className="h-4 w-4" /> Copy JSON
              </button>
              <button
                onClick={onDownloadCSV}
                disabled={!rows.length}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <Download className="h-4 w-4" /> Download CSV
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {levels.map((lvl) => (
              <div key={lvl} className="rounded-lg border bg-gray-50 p-3">
                <div className="text-xs text-gray-500">{lvl}</div>
                <div className="text-lg font-semibold text-gray-900">
                  {stats[lvl] || 0}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Parsed entries: <span className="font-semibold text-gray-800">{rows.length}</span>
        </div>
        <button
          onClick={onAnalyze}
          disabled={!input.trim().length}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow hover:bg-blue-700 disabled:opacity-50"
        >
          Analyze
        </button>
      </div>

      {rows.length > 0 && (
        <div className="overflow-auto rounded-lg border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {rows.map((r, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap font-mono text-xs text-gray-700">{r.timestamp}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-800">{r.level}</td>
                  <td className="px-3 py-2 text-sm text-gray-800">{r.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
