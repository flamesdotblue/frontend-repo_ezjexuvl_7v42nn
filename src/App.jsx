import { useState } from "react";
import Header from "./components/Header";
import ToolTabs from "./components/ToolTabs";
import CsvJsonTool from "./components/CsvJsonTool";
import LogAnalyzer from "./components/LogAnalyzer";

function App() {
  const [active, setActive] = useState("csvjson");

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 pb-16">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Tools</h2>
              <ToolTabs value={active} onChange={setActive} />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              {active === "csvjson" && <CsvJsonTool />}
              {active === "loganalyzer" && <LogAnalyzer />}
            </div>
          </div>
        </section>

        <section className="mt-6 text-center text-xs text-gray-500">
          Built for quick, private, in-browser conversions. No data leaves your device.
        </section>
      </main>
    </div>
  );
}

export default App;
