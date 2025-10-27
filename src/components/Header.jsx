import { FileText } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full py-6">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
              Clean Data Smith
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 -mt-0.5">
              Convert, analyze, and tidy your data quickly
            </p>
          </div>
        </div>
        <a
          href="#"
          className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <span>Docs</span>
        </a>
      </div>
    </header>
  );
}
