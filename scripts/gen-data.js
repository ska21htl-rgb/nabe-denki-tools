// CSV(src/data-source/*.csv) → JS(src/data/*.js) 自動生成スクリプト
// 目的：非エンジニアでもExcelでCSVを開いて上書き保存するだけでデータを更新できるようにする
// 現状の対応データ：WIRE_DATA（電線の外径・断面寸法）のみ（プロトタイプ）
//
// 実行方法： node scripts/gen-data.js
// npm run build のたびに自動で走らせたい場合は package.json の scripts に
//   "prebuild": "node scripts/gen-data.js"
// を追加する（このプロトタイプでは未追加。動作確認後に有効化する）

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ---- 簡易CSVパーサー（ダブルクォート・カンマ・改行を含むセルに対応） ----
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  // 改行コードを統一
  const s = text.replace(/\r\n/g, "\n");
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field); field = "";
    } else if (c === "\n") {
      row.push(field); field = "";
      rows.push(row); row = [];
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.length > 1 || r[0] !== "");
}

function csvToObjects(text) {
  const rows = parseCSV(text);
  const header = rows[0];
  return rows.slice(1).map((r) => {
    const obj = {};
    header.forEach((h, i) => { obj[h.trim()] = (r[i] ?? "").trim(); });
    return obj;
  });
}

// ---- WIRE_DATA 生成 ----
function genWireData() {
  const csvPath = path.join(ROOT, "src/data-source/wireData.csv");
  const outPath = path.join(ROOT, "src/data/wireData.js");
  const records = csvToObjects(readFileSync(csvPath, "utf-8"));

  // wireType単位でグルーピングし、出典コメントも先頭のspecの値から拾う
  const wireTypes = []; // 出現順を保持
  const bySpec = {}; // wireType -> { spec: value }
  const sourceByType = {}; // wireType -> source文字列（最初に見つかったもの）

  for (const rec of records) {
    const { wireType, spec, w, h, source } = rec;
    if (!wireType || !spec) continue;
    if (!bySpec[wireType]) { bySpec[wireType] = {}; wireTypes.push(wireType); }
    // w列に値があれば平形{w,h}、なければ丸形（h列の数値のみ）
    const isFlat = w !== "" && w !== undefined;
    bySpec[wireType][spec] = isFlat ? { w: Number(w), h: Number(h) } : Number(h);
    if (source && !sourceByType[wireType]) sourceByType[wireType] = source;
  }

  const lines = [];
  lines.push("// 【自動生成ファイル】直接編集しないこと");
  lines.push("// 生成元：src/data-source/wireData.csv （編集はこちらのCSVで行う）");
  lines.push("// 再生成：node scripts/gen-data.js");
  lines.push("// 電線の外径・断面寸法 参考値 ※ケーブル種別・メーカーにより差異あり、必ずカタログで確認");
  lines.push("// 丸形は数値(mm)、平形(VVF等)は {w, h}（幅mm×厚さmm）で指定");
  lines.push("export const WIRE_DATA = {");
  for (const wt of wireTypes) {
    if (sourceByType[wt]) lines.push(`  // ${sourceByType[wt]}`);
    lines.push(`  ${JSON.stringify(wt)}: {`);
    for (const [spec, val] of Object.entries(bySpec[wt])) {
      const valStr = typeof val === "object" ? `{ w: ${val.w}, h: ${val.h} }` : String(val);
      lines.push(`    ${JSON.stringify(spec)}: ${valStr},`);
    }
    lines.push("  },");
  }
  lines.push("};");
  lines.push("");
  lines.push("// 電線1本の断面積(mm²)。丸形はπ(d/2)²、平形は幅×厚さ");
  lines.push('export const wireArea = (val) => (typeof val === "object" ? val.w * val.h : Math.PI * Math.pow(val / 2, 2));');
  lines.push("// 外径の表示文字列。丸形は「Xmm」、平形は「W×Hmm」");
  lines.push('export const wireOuterLabel = (val) => (typeof val === "object" ? `${val.w}×${val.h}mm` : `${val}mm`);');
  lines.push("");

  writeFileSync(outPath, lines.join("\n"), "utf-8");
  console.log(`✓ ${path.relative(ROOT, outPath)} を生成しました（${records.length}行 / ${wireTypes.length}線種）`);
}

genWireData();
