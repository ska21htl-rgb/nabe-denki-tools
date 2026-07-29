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
  // Excelで「CSV UTF-8」として保存するとファイル先頭にBOM(\uFEFF)が付くため、あれば取り除く
  const clean = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const rows = parseCSV(clean);
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

// ---- STANDARD_WIRE_SIZES 生成（電気配線計算ツール／幹線サイズ用） ----
function genStandardWireSizes() {
  const csvPath = path.join(ROOT, "src/data-source/standardWireSizes.csv");
  const outPath = path.join(ROOT, "src/data/wiringCalcData.js");
  const records = csvToObjects(readFileSync(csvPath, "utf-8"));

  const lines = [];
  lines.push("// 【自動生成ファイル】直接編集しないこと");
  lines.push("// 生成元：src/data-source/standardWireSizes.csv （編集はこちらのCSVで行う）");
  lines.push("// 再生成：node scripts/gen-data.js");
  lines.push("// 電線の公称断面積 標準サイズ 出典：JIS C 3307（IV電線）/ 内線規程（IV・HIV・CV等の共通シリーズ）");
  lines.push("// ※IEC 60228（欧州規格）の断面積シリーズとは異なるので注意");
  lines.push("// 現場慣用の単位「sq」（スケア）で保持。小サイズ（2/3.5/5.5sq）はFケーブル/VVFの導体径(mm)表記も併記");
  lines.push("// weightKgPerM：1mあたりの電線重量(kg/m)。未確認の値は空欄（=undefined）のまま。想像値は入れないこと");
  lines.push("export const STANDARD_WIRE_SIZES = [");
  for (const rec of records) {
    const { sq, mmPhi, weightKgPerM, source } = rec;
    if (!sq) continue;
    const fields = [`sq: ${Number(sq)}`];
    if (mmPhi) fields.push(`mmPhi: ${Number(mmPhi)}`);
    if (weightKgPerM) fields.push(`weightKgPerM: ${Number(weightKgPerM)}`);
    const comment = source ? ` // ${source}` : "";
    lines.push(`  { ${fields.join(", ")} },${comment}`);
  }
  lines.push("];");
  lines.push("");
  lines.push('// 表示ラベル生成：小サイズは「2sq（1.6mm）」、それ以外は「14sq」の形式');
  lines.push('export const wireSizeLabel = (item) => (item.mmPhi ? `${item.sq}sq（${item.mmPhi}mm）` : `${item.sq}sq`);');
  lines.push("");

  writeFileSync(outPath, lines.join("\n"), "utf-8");
  console.log(`✓ ${path.relative(ROOT, outPath)} を生成しました（${records.length}行）`);
}

// ---- RACK_DATA 生成（ケーブルラック本体重量／ラック重量計算ツール用） ----
function genRackData() {
  const csvPath = path.join(ROOT, "src/data-source/rackData.csv");
  const outPath = path.join(ROOT, "src/data/rackData.js");
  const records = csvToObjects(readFileSync(csvPath, "utf-8"));

  const lines = [];
  lines.push("// 【自動生成ファイル】直接編集しないこと");
  lines.push("// 生成元：src/data-source/rackData.csv （編集はこちらのCSVで行う）");
  lines.push("// 再生成：node scripts/gen-data.js");
  lines.push("// ケーブルラック本体の1mあたり重量。カタログの「単品質量(kg)」は定尺(lengthM)ごとの値なので");
  lines.push("// weightKgPerM = massKg / lengthM で算出（元の質量・定尺はそのまま保持し、追跡可能にしている）");
  lines.push("export const RACK_DATA = [");
  for (const rec of records) {
    const { type, series, seriesLabel, partNo, width, lengthM, massKg, source } = rec;
    if (!partNo) continue;
    const weightKgPerM = Number(massKg) / Number(lengthM);
    lines.push(`  { type: ${JSON.stringify(type)}, series: ${JSON.stringify(series)}, seriesLabel: ${JSON.stringify(seriesLabel)}, partNo: ${JSON.stringify(partNo)}, width: ${Number(width)}, lengthM: ${Number(lengthM)}, massKg: ${Number(massKg)}, weightKgPerM: ${weightKgPerM.toFixed(3)} }, // ${source}`);
  }
  lines.push("];");
  lines.push("");

  writeFileSync(outPath, lines.join("\n"), "utf-8");
  console.log(`✓ ${path.relative(ROOT, outPath)} を生成しました（${records.length}行）`);
}

genWireData();
genStandardWireSizes();
genRackData();
