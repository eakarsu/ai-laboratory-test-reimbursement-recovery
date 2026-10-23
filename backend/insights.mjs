// Deterministic insights, search/filter and export helpers over own records. No provider call.
export function filterRecords(rows, { q = "", status = "", risk = "" } = {}) {
  const needle = String(q).trim().toLowerCase();
  return rows.filter(r => {
    if (status && r.status !== status) return false;
    if (risk && r.risk !== risk) return false;
    if (!needle) return true;
    const hay = [r.reference, r.title, r.status, r.owner, r.risk, JSON.stringify(r.payload ?? {})].join(" ").toLowerCase();
    return hay.includes(needle);
  });
}
function esc(v) { const s = v == null ? "" : v instanceof Date ? v.toISOString() : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
export function recordsToCsv(rows) {
  const cols = ["id","feature_id","reference","title","status","owner","risk","due_date","amount"];
  return [cols.join(","), ...rows.map(r => cols.map(c => esc(c === "due_date" && r[c] ? String(r[c]).slice(0,10) : r[c])).join(","))].join("\n");
}
export function displayValue(v) { return v === null || v === undefined || v === "" ? "(empty)" : String(v); }
const DONE = new Set(["closed","done","complete","completed","approved","paid"]);
export function buildInsights(rows, featureTitle = "Capability", now = new Date()) {
  const total = rows.length;
  const open = rows.filter(r => !DONE.has(String(r.status ?? "").toLowerCase())).length;
  const highRisk = rows.filter(r => ["High","Critical"].includes(String(r.risk))).length;
  const overdue = rows.filter(r => !DONE.has(String(r.status ?? "").toLowerCase()) && r.due_date && new Date(r.due_date).getTime() < now.getTime()).length;
  const amount = rows.reduce((a,r) => a + (Number.isFinite(Number(r.amount)) ? Number(r.amount) : 0), 0);
  const emptyTitles = rows.filter(r => !r.title).length;
  const features = [
    { id: "status-overview", title: `${featureTitle} — status overview`, summary: `Status mix for ${total} record(s).`, sections: [{label:"Total records",value:total},{label:"Open records",value:open},{label:"High/Critical risk",value:highRisk}] },
    { id: "due-risk-watch", title: `${featureTitle} — due & risk watch`, summary: "Open records past their due date.", sections: [{label:"Overdue open records",value:overdue},{label:"Open records",value:open},{label:"Total records",value:total}] },
    { id: "value-completeness", title: `${featureTitle} — value & completeness`, summary: "Amounts and empty values are shown, never hidden.", sections: [{label:"Total amount",value:amount},{label:"Records with empty title",value:emptyTitles},{label:"Total records",value:total}] },
  ];
  return { aiGenerated: false, source: "deterministic-fallback", label: "Deterministic fallback (not AI-generated)", generatedAt: now.toISOString(), features };
}
