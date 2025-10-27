import { useMemo, useRef, useState } from "react";
import { Upload, Download, Copy, Trash2, ArrowLeftRight } from "lucide-react";

function parseCSV(text) {
  // Basic CSV parser that handles quoted fields and commas
  const rows = [];
  let current = [];
  let field = "";
  let inQuotes = false;

  const pushField = () => {
    current.push(field);
    field = "";
  };

  const pushRow = () => {
    rows.push(current);
    current = [];
  };

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (c === '"' && next === '"') {
        field += '"';
        i++; // skip escaped quote
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        pushField();
      } else if (c === "\n") {
        pushField();
        pushRow();
      } else if (c === "\r") {
        // ignore
      } else {
        field += c;
      }
    }
  }
  // flush last field/row
  pushField();
  pushRow();

  // Remove trailing empty last row if present
  if (rows.length && rows[rows.length - 1].every((x) => x === "")) {
    rows.pop();
  }
  return rows;
}

function toCSV(rows) {
  return rows
    .map((r) =>
      r
        .map((v) => {
          const s = v == null ? "" : String(v);
          if (s.includes("\"") || s.includes(",") || s.includes("\n")) {
            return '"' + s.replaceAll('"', '""') + '"';
          }
          return s;
        })
        .join(",")
    )
    .join("\n");
}

function csvToJson(csvText) {
  const rows = parseCSV(csvText);
  if (!rows.length) return [];
  const headers = rows[0];
  return rows.slice(1).map((r) => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h || `col_${i + 1}`] = r[i] ?? "";
    });
    return obj;
  });
}

function jsonToCsv(jsonText) {
  let arr;
  try {
    const parsed = JSON.parse(jsonText || "[]");
    arr = Array.isArray(parsed) ? parsed : [parsed];
  } catch (e) {
    throw new Error("Invalid JSON");
  }
  if (!arr.length) return "";
  const headers = Array.from(
    arr.reduce((set, obj) => {
      Object.keys(obj || {}).forEach((k) => set.add(k));
      return set;
    }, new Set())
  );
  const rows = [headers, ...arr.map((obj) => headers.map((h) => obj?.[h] ?? ""))];
  return toCSV(rows);
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

export default function CsvJsonTool() {
  const [mode, setMode] = useState("csv2json");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const fileRef = useRef(null);

  const canConvert = useMemo(() => input.trim().length > 0, [input]);

  const onConvert = () => {
    try {
      if (mode === "csv2json") {
        const data = csvToJson(input);
        setOutput(JSON.stringify(data, null, 2));
      } else {
        const csv = jsonToCsv(input);
        setOutput(csv);
      }
    } catch (e) {
      setOutput(`Error: ${e.message}`);
    }
  };

  const onClear = () => {
    setInput("");
    setOutput("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const onCopy = async () => {
    await navigator.clipboard.writeText(output);
  };

  const onDownload = () => {
    if (!output) return;
    if (mode === "csv2json") {
      download("data.json", output, "application/json");
    } else {
      download("data.csv", output, "text/csv");
    }
  };

  const onFile = async (file) => {
    const text = await file.text();
    setInput(text);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center rounded-lg border bg-white p-1">
          <button
            className={`px-3 py-1.5 text-sm rounded-md ${
              mode === "csv2json" ? "bg-blue-600 text-white" : "text-gray-700"
            }`}
            onClick={() => setMode("csv2json")}
          >
            CSV → JSON
          </button>
          <button
            className={`px-3 py-1.5 text-sm rounded-md ${
              mode === "json2csv" ? "bg-blue-600 text-white" : "text-gray-700"
            }`}
            onClick={() => setMode("json2csv")}
          >
            JSON → CSV
          </button>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white text-sm text-gray-700 cursor-pointer hover:bg-gray-50">
            <Upload className="h-4 w-4" />
            <span>Upload</span>
            <input
              ref={fileRef}
              type="file"
              accept={mode === "csv2json" ? ".csv,.txt" : ".json,.txt"}
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
            <ArrowLeftRight className="h-4 w-4 text-blue-600" /> Input
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "csv2json"
                ? "Paste CSV here or upload a .csv file"
                : "Paste JSON array/objects here or upload a .json file"
            }
            className="w-full h-64 rounded-lg border bg-white p-3 font-mono text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4 text-green-600" /> Output
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={onCopy}
                disabled={!output}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <Copy className="h-4 w-4" /> Copy
              </button>
              <button
                onClick={onDownload}
                disabled={!output}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <Download className="h-4 w-4" /> Download
              </button>
            </div>
          </div>
          <textarea
            readOnly
            value={output}
            className="w-full h-64 rounded-lg border bg-gray-50 p-3 font-mono text-sm text-gray-800"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onConvert}
          disabled={!canConvert}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow hover:bg-blue-700 disabled:opacity-50"
        >
          Convert
        </button>
      </div>
    </div>
  );
}
