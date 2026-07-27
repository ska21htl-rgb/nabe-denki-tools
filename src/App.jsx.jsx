import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import {
  Search, Calculator, ChevronLeft, Ruler, Layers, CircleDot, Link2, Flame,
  Zap, Grid3x3, Boxes, PieChart, Plug, AlertTriangle, Plus, Trash2,
  ShieldCheck, Printer, FileText, ArrowLeft
} from "lucide-react";

/* ============================== 共通データ ============================== */

// 参考値：配管外径 (mm) ※要メーカー確認
const CONDUIT_DATA = {
  E管: { E19: 19.1, E25: 25.4, E31: 31.8, E39: 38.1, E51: 50.8, E63: 63.5, E75: 76.2 },
  G管: { G16: 21.0, G22: 26.5, G28: 33.3, G36: 41.9, G42: 47.8, G54: 59.6, G70: 75.2, G82: 87.9 },
  PF管: { PF16: 21, PF22: 28, PF28: 36, PF36: 44, PF42: 52, PF54: 65, PF70: 81, PF82: 92 },
  CD管: { CD16: 19, CD22: 26, CD28: 34, CD36: 42, CD42: 48, CD54: 61, CD70: 77, CD82: 87 },
};

// 参考値：内径 = 外径 - 肉厚*2 の簡易推定（占積率計算用）。実際は規格表で確認。
const conduitInnerDiameter = (outer) => Math.max(outer - 3.0, 1);

// 参考値：支持間隔（8種）
const SUPPORT_INTERVAL_DATA = [
  { name: "金属管（電線管）", horizontal: "2.0m以下", vertical: "2.0m以下", note: "プルボックス等の端部より0.3m以内で支持" },
  { name: "合成樹脂管（PF・VE管）", horizontal: "1.5m以下", vertical: "1.5m以下", note: "管相互・ボックス接続部付近も支持" },
  { name: "CD管（コンクリート埋設）", horizontal: "—", vertical: "—", note: "埋設施工のため支持金物は原則不要" },
  { name: "金属可とう電線管（2種）", horizontal: "1.0m以下", vertical: "1.0m以下", note: "屈曲部の直近も支持" },
  { name: "ケーブル（一般・平形）", horizontal: "2.0m以下", vertical: "2.0m以下", note: "垂直は6m以下まで緩和される場合あり" },
  { name: "ケーブルラック", horizontal: "2.0m以下", vertical: "2.0m以下", note: "水平部は等間隔、屈曲部直近も支持" },
  { name: "がいし引き配線", horizontal: "2.0m以下", vertical: "2.0m以下", note: "電線相互の接近距離にも注意" },
  { name: "ライティングダクト", horizontal: "2.0m以下", vertical: "—", note: "端部・接続部より0.3m以内で支持" },
];

// タップ下穴径（一般的なメートルねじ・並目）
const TAP_HOLE_DATA = {
  M4: 3.3, M5: 4.2, M6: 5.0, M8: 6.8, M10: 8.5, M12: 10.2,
};

// 配管ノックアウト（下穴）径 参考値 ※要メーカー確認
const PIPE_HOLE_DATA = {
  E管: { E19: 25, E25: 32, E31: 38, E39: 44, E51: 56 },
  PF管: { PF16: 22, PF22: 29, PF28: 37, PF36: 45 },
  G管: { G16: 22, G22: 28, G28: 35, G36: 43 },
  プリカ: { PE16: 22, PE22: 28, PE28: 36 },
};

// 接続材（差込・T型コネクタ）選定：芯線サイズ範囲 → 適合サイズ 参考値
const CONNECTOR_DATA = [
  { range: "1.6mm 単線 〜 2.0mm 単線", size: "小（1.6-2.0用）" },
  { range: "2.0mm 単線 〜 2.6mm 単線", size: "中（2.0-2.6用）" },
  { range: "2.6mm 単線 〜 5.5mm² より線", size: "大（2.6-5.5用）" },
  { range: "5.5mm² 〜 8mm² より線", size: "特大（5.5-8用）" },
];

// 電線の外径 参考値 ※ケーブル種別・メーカーにより差異あり、必ずカタログで確認
// 電線の外径・断面寸法 参考値 ※ケーブル種別・メーカーにより差異あり、必ずカタログで確認
// 丸形は数値(mm)、平形(VVF等)は {w, h}（幅mm×厚さmm）で指定
const WIRE_DATA = {
  // JIS C 3342:2012 表7(2心)・表8(3心)の実測値（出典：ハマネツ技術資料）
  VVF: {
    "1.6-2C": { w: 6.2, h: 9.4 },
    "1.6-3C": { w: 6.2, h: 13.0 },
    "2.0-2C": { w: 6.6, h: 10.5 },
    "2.0-3C": { w: 6.6, h: 14.0 },
    "2.6-2C": { w: 7.6, h: 12.5 },
  },
  // メーカー資料では「VVFと同サイズ・同仕上外径」と説明されているためVVFと同値を採用（要個別カタログ確認）
  "EM-EEF": {
    "1.6-2C": { w: 6.2, h: 9.4 },
    "1.6-3C": { w: 6.2, h: 13.0 },
    "2.0-2C": { w: 6.6, h: 10.5 },
    "2.0-3C": { w: 6.6, h: 14.0 },
    "2.6-2C": { w: 7.6, h: 12.5 },
  },
  ICT: { "0.5-1P": 4.0, "0.5-2P": 4.5, "0.65-1P": 4.2, "0.65-2P": 4.8 },
  // 出典：施工管理の教科書「HPケーブルとは」掲載の仕上外径表
  HP: {
    "0.9-2C": { w: 3.7, h: 5.4 },
    "0.9-3C": { w: 3.7, h: 7.1 },
    "1.2-2C": { w: 4.0, h: 6.0 },
    "1.2-3C": { w: 4.0, h: 8.0 },
  },
  IV: { "1.6mm": 2.8, "2.0mm": 3.4, "2.6mm": 4.0, "5.5sq": 5.0, "8sq": 5.6 },
  "EM-IV": { "1.6mm": 2.8, "2.0mm": 3.4, "2.6mm": 4.0, "5.5sq": 5.0, "8sq": 5.6 },
  // 出典：伸興電線 AE製品仕様（電材ストア等）の仕上外径。EM-AEは同社EM品も同径のため同値を採用（要個別確認）
  AE: {
    "0.65-2C": { w: 2.3, h: 3.3 },
    "1.2-2C": { w: 3.0, h: 4.8 },
    "1.2-3C": { w: 3.1, h: 6.5 },
  },
  "EM-AE": {
    "0.65-2C": { w: 2.3, h: 3.3 },
    "1.2-2C": { w: 3.0, h: 4.8 },
    "1.2-3C": { w: 3.1, h: 6.5 },
  },
  "S-5C-FB": { "同軸1本": 7.4 },
  "S-7C-FB": { "同軸1本": 10.3 },
  "EM-S-5C-FB": { "同軸1本": 7.4 },
  "EM-S-7C-FB": { "同軸1本": 10.3 },
  "UTP0.5-4P(cat5e)": { "4P": 5.5 },
  "UTP0.5-4P(cat6)": { "4P": 6.0 },
  "UTP0.5-4P(cat6A)": { "4P": 7.8 },
  "EM-UTP0.5-4P(cat5e)": { "4P": 5.3 },
  "EM-UTP0.5-4P(cat6)": { "4P": 5.8 },
  "EM-UTP0.5-4P(cat6A)": { "4P": 7.6 },
};

// 電線1本の断面積(mm²)。丸形はπ(d/2)²、平形は幅×厚さ
const wireArea = (val) => (typeof val === "object" ? val.w * val.h : Math.PI * Math.pow(val / 2, 2));
// 外径の表示文字列。丸形は「Xmm」、平形は「W×Hmm」
const wireOuterLabel = (val) => (typeof val === "object" ? `${val.w}×${val.h}mm` : `${val}mm`);

// 耐火処理工法 参考パターン ※実際の工法名・認定はメーカーカタログで確認
const FIREPROOF_DATA = [
  { wall: "RC造", location: "壁貫通", method: "耐火モルタル充填工法" },
  { wall: "RC造", location: "床貫通", method: "耐火プレート＋モルタル工法" },
  { wall: "ALC造", location: "壁貫通", method: "耐火パテ工法" },
  { wall: "軽量鉄骨造（LGS）", location: "壁貫通", method: "耐火スリーブ＋耐火材工法" },
  { wall: "軽量鉄骨造（LGS）", location: "床貫通", method: "耐火プレート工法" },
  { wall: "木造", location: "壁貫通", method: "耐火パテ＋不燃材工法" },
];

const STANDARD_SIZES_MM2 = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];

// 等辺山形鋼（Lアングル）標準断面性能 出典：JIS G 3192（等辺山形鋼の標準断面寸法・断面積・単位質量・断面特性）
// ※形状寸法の規格。材質はSS400（一般構造用圧延鋼材、JIS G 3101）を想定して以降の応力度計算を行う
// A: 断面積(cm2), W: 単位質量(kg/m), Z: 断面係数 Zx=Zy(cm3)　出典：JIS G 3192規格値
const ANGLE_STEEL_DATA = [
  { size: "40×40×3", A: 2.336, W: 1.83, Z: 1.21, iv: 0.790 },
  { size: "40×40×5", A: 3.755, W: 2.95, Z: 1.91, iv: 0.774 },
  { size: "45×45×4", A: 3.492, W: 2.74, Z: 2.00, iv: 0.880 },
  { size: "45×45×5", A: 4.302, W: 3.38, Z: 2.46, iv: 0.874 },
  { size: "50×50×4", A: 3.892, W: 3.06, Z: 2.49, iv: 0.983 },
  { size: "50×50×5", A: 4.802, W: 3.77, Z: 3.08, iv: 0.976 },
  { size: "50×50×6", A: 5.644, W: 4.43, Z: 3.55, iv: 0.963 },
  { size: "60×60×4", A: 4.692, W: 3.68, Z: 3.66, iv: 1.19 },
  { size: "60×60×5", A: 5.802, W: 4.55, Z: 4.52, iv: 1.18 },
  { size: "65×65×5", A: 6.367, W: 5.00, Z: 5.35, iv: 1.28 },
  { size: "65×65×6", A: 7.527, W: 5.91, Z: 6.26, iv: 1.27 },
  { size: "65×65×8", A: 9.761, W: 7.66, Z: 7.96, iv: 1.25 },
  { size: "70×70×6", A: 8.127, W: 6.38, Z: 7.33, iv: 1.37 },
  { size: "75×75×6", A: 8.727, W: 6.85, Z: 8.47, iv: 1.48 },
  { size: "75×75×9", A: 12.69, W: 9.96, Z: 12.1, iv: 1.45 },
  { size: "75×75×12", A: 16.56, W: 13.0, Z: 15.7, iv: 1.44 },
  { size: "80×80×6", A: 9.327, W: 7.32, Z: 9.70, iv: 1.58 },
  { size: "90×90×6", A: 10.55, W: 8.28, Z: 12.3, iv: 1.78 },
  { size: "90×90×7", A: 12.22, W: 9.59, Z: 14.2, iv: 1.77 },
  { size: "90×90×10", A: 17.00, W: 13.3, Z: 19.5, iv: 1.74 },
  { size: "90×90×13", A: 21.71, W: 17.0, Z: 24.8, iv: 1.73 },
  { size: "100×100×7", A: 13.62, W: 10.7, Z: 17.7, iv: 1.98 },
  { size: "100×100×10", A: 19.00, W: 14.9, Z: 24.4, iv: 1.95 },
  { size: "100×100×13", A: 24.31, W: 19.1, Z: 31.1, iv: 1.94 },
  { size: "120×120×8", A: 18.76, W: 14.7, Z: 29.5, iv: 2.38 },
  { size: "130×130×9", A: 22.74, W: 17.9, Z: 38.7, iv: 2.57 },
  { size: "130×130×12", A: 29.76, W: 23.4, Z: 49.9, iv: 2.54 },
  { size: "130×130×15", A: 36.75, W: 28.8, Z: 61.5, iv: 2.53 },
  { size: "150×150×12", A: 34.77, W: 27.3, Z: 68.1, iv: 2.96 },
  { size: "150×150×15", A: 42.74, W: 33.6, Z: 82.6, iv: 2.92 },
  { size: "150×150×19", A: 53.38, W: 41.9, Z: 103, iv: 2.91 },
  { size: "175×175×12", A: 40.52, W: 31.8, Z: 91.8, iv: 3.44 },
  { size: "175×175×15", A: 50.21, W: 39.4, Z: 114, iv: 3.42 },
  { size: "200×200×15", A: 57.75, W: 45.3, Z: 150, iv: 3.93 },
  { size: "200×200×20", A: 76.00, W: 59.3, Z: 197, iv: 3.90 },
  { size: "200×200×25", A: 93.75, W: 73.6, Z: 242, iv: 3.88 },
];

// 鋼材種別ごとの基準強度F（鋼構造許容応力度設計規準）。SS400はft=fb=156.7/235, fs=90.45/135.68（N/mm²）
const MATERIAL_GRADES = [
  { grade: "SS400", label: "SS400（一般構造用圧延鋼材・JIS G 3101、既定値）", F: 235 },
  { grade: "SM490", label: "SM490（溶接構造用圧延鋼材・JIS G 3106、高強度）", F: 325 },
];
const STEEL_E = 205000; // N/mm²（ヤング係数、鋼材共通）
const lambdaP = (F) => Math.PI * Math.sqrt(STEEL_E / (0.6 * F)); // Λ（限界細長比）
const steelFt = (F) => ({ long: F / 1.5, short: F }); // 許容引張・曲げ応力度
const steelFs = (F) => ({ long: F / (1.5 * Math.sqrt(3)), short: F / Math.sqrt(3) }); // 許容せん断応力度
// 許容圧縮応力度fc（座屈を考慮、λ=細長比）
const steelFc = (lambda, F) => {
  const Lp = lambdaP(F);
  const r = lambda / Lp;
  let fcLong;
  if (lambda <= Lp) {
    const nu = 1.5 + 0.375 * r * r;
    fcLong = ((1 - 0.4 * r * r) * F) / nu;
  } else {
    fcLong = (0.277 * F) / (r * r);
  }
  return { long: fcLong, short: fcLong * 1.5 };
};

// ステンレス鋼ボルト A2-50 の許容耐力(kN)　出典：建築設備耐震設計・施工指針2014年版の計算式（有効断面積×降伏点）による算出値
const ANCHOR_BOLT_DATA = [
  { size: "M10", Ta: 12.10, Qa: 7.00, sca: 0.580 },
  { size: "M12", Ta: 17.70, Qa: 10.20, sca: 0.843 },
  { size: "M16", Ta: 32.90, Qa: 19.00, sca: 1.570 },
  { size: "M20", Ta: 51.40, Qa: 29.60, sca: 2.450 },
];
// ステンレス鋼ボルトA2-50の短期許容応力度（建築設備耐震設計・施工指針2014年版「ステンレス鋼ボルトの検討式」準拠）
const BOLT_FT_SHORT = 210; // N/mm²（許容引張応力度 Sσy）
const BOLT_FS_SHORT = 121.2; // N/mm²（許容せん断応力度 Sfs）

// 設備機器の設計用標準震度 Kh（出典：建築設備耐震設計・施工指針2014年版、日本建築センター。
// 建築設備耐震設計・施工指針2014年版の設計用標準震度に基づく）
const SEISMIC_KH = {
  S: { top: 2.0, mid: 1.5, low: 1.0 },
  A: { top: 1.5, mid: 1.0, low: 0.6 },
  B: { top: 1.0, mid: 0.6, low: 0.4 },
};
const FLOOR_LABEL = { top: "上層階・屋上・塔屋", mid: "中間階", low: "地階・1階" };
const CLASS_LABEL = { S: "耐震クラスS（特に重要な設備）", A: "耐震クラスA（重要設備）", B: "耐震クラスB（一般設備）" };
// ケーブルラック固有の耐震支持間隔（建築設備耐震設計・施工指針2014年版 指針表6.2-1相当。B種はA種と同値と仮定）
const CABLE_RACK_SEISMIC_INTERVAL = {
  S: { top: 6, mid: 8, low: 8 },
  A: { top: 8, mid: 8, low: 12 },
  B: { top: 8, mid: 8, low: 12 },
};
const recommendedInterval = (cls, floor) => CABLE_RACK_SEISMIC_INTERVAL[cls][floor];



/* ============================== UI 部品 ============================== */

function Field({ label, children }) {
  return (
    <label className="block mb-4">
      <span className="block text-sm font-medium text-slate-300 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2.5 text-slate-100 text-base focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500 focus:border-blue-500";
const selectCls = inputCls + " appearance-none";

function ResultCard({ children, accent = "blue" }) {
  const ring = accent === "amber" ? "border-amber-500/40 bg-amber-500/10" : "border-blue-500/40 bg-blue-500/10";
  return <div className={`rounded-xl border ${ring} p-4 mt-2`}>{children}</div>;
}

function ResultRow({ label, value, unit }) {
  return (
    <div className="flex items-baseline justify-between py-1.5 border-b border-white/5 last:border-b-0">
      <span className="text-sm text-slate-300">{label}</span>
      <span className="text-lg font-bold text-slate-50 tabular-nums">
        {value}
        {unit && <span className="text-sm font-normal text-slate-400 ml-1">{unit}</span>}
      </span>
    </div>
  );
}

function RefBadge({ text = "参考値・要確認" }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-400/10 border border-amber-400/30 rounded-full px-2 py-0.5">
      <AlertTriangle size={12} /> {text}
    </span>
  );
}

/* ============================== 検索系ツール ============================== */

function PipeDiameterTool() {
  const types = Object.keys(CONDUIT_DATA);
  const [type, setType] = useState(types[0]);
  const sizes = Object.keys(CONDUIT_DATA[type]);
  const [size, setSize] = useState(sizes[0]);
  const currentSizes = Object.keys(CONDUIT_DATA[type]);
  const outer = CONDUIT_DATA[type][currentSizes.includes(size) ? size : currentSizes[0]];

  return (
    <div>
      <Field label="配管の種類">
        <select className={selectCls} value={type} onChange={(e) => { setType(e.target.value); setSize(Object.keys(CONDUIT_DATA[e.target.value])[0]); }}>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </Field>
      <Field label="呼び径">
        <select className={selectCls} value={size} onChange={(e) => setSize(e.target.value)}>
          {currentSizes.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
      <ResultCard>
        <ResultRow label="外径" value={outer} unit="mm" />
        <ResultRow label="参考内径" value={conduitInnerDiameter(outer).toFixed(1)} unit="mm" />
      </ResultCard>
      <div className="mt-3"><RefBadge /></div>
    </div>
  );
}

function SupportIntervalTool() {
  const [idx, setIdx] = useState(0);
  const item = SUPPORT_INTERVAL_DATA[idx];
  return (
    <div>
      <Field label="電材の種類">
        <select className={selectCls} value={idx} onChange={(e) => setIdx(Number(e.target.value))}>
          {SUPPORT_INTERVAL_DATA.map((d, i) => <option key={d.name} value={i}>{d.name}</option>)}
        </select>
      </Field>
      <ResultCard>
        <ResultRow label="水平部の支持間隔" value={item.horizontal} />
        <ResultRow label="垂直部の支持間隔" value={item.vertical} />
      </ResultCard>
      <p className="text-sm text-slate-400 mt-3">{item.note}</p>
      <div className="mt-3"><RefBadge /></div>
    </div>
  );
}

function PilotHoleTool() {
  const [mode, setMode] = useState("tap");
  const tapKeys = Object.keys(TAP_HOLE_DATA);
  const [tap, setTap] = useState(tapKeys[0]);

  const pipeTypes = Object.keys(PIPE_HOLE_DATA);
  const [pipeType, setPipeType] = useState(pipeTypes[0]);
  const pipeSizes = Object.keys(PIPE_HOLE_DATA[pipeType]);
  const [pipeSize, setPipeSize] = useState(pipeSizes[0]);
  const curPipeSizes = Object.keys(PIPE_HOLE_DATA[pipeType]);
  const hole = PIPE_HOLE_DATA[pipeType][curPipeSizes.includes(pipeSize) ? pipeSize : curPipeSizes[0]];

  return (
    <div>
      <Field label="検索モード">
        <select className={selectCls} value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="tap">タップ下穴径</option>
          <option value="pipe">配管・コネクタ下穴径</option>
        </select>
      </Field>

      {mode === "tap" ? (
        <>
          <Field label="タップサイズ">
            <select className={selectCls} value={tap} onChange={(e) => setTap(e.target.value)}>
              {tapKeys.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <ResultCard>
            <ResultRow label="下穴径" value={TAP_HOLE_DATA[tap]} unit="mm" />
          </ResultCard>
        </>
      ) : (
        <>
          <Field label="配管の種類">
            <select className={selectCls} value={pipeType} onChange={(e) => { setPipeType(e.target.value); setPipeSize(Object.keys(PIPE_HOLE_DATA[e.target.value])[0]); }}>
              {pipeTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="呼び径">
            <select className={selectCls} value={pipeSize} onChange={(e) => setPipeSize(e.target.value)}>
              {curPipeSizes.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <ResultCard>
            <ResultRow label="下穴径" value={hole} unit="mm" />
          </ResultCard>
        </>
      )}
      <div className="mt-3"><RefBadge /></div>
    </div>
  );
}

function ConnectorTool() {
  const [idx, setIdx] = useState(0);
  return (
    <div>
      <Field label="ケーブルの太さ">
        <select className={selectCls} value={idx} onChange={(e) => setIdx(Number(e.target.value))}>
          {CONNECTOR_DATA.map((d, i) => <option key={d.range} value={i}>{d.range}</option>)}
        </select>
      </Field>
      <ResultCard>
        <ResultRow label="適合接続材サイズ" value={CONNECTOR_DATA[idx].size} />
      </ResultCard>
      <div className="mt-3"><RefBadge /></div>
    </div>
  );
}

function FireproofTool() {
  const walls = [...new Set(FIREPROOF_DATA.map((d) => d.wall))];
  const [wall, setWall] = useState(walls[0]);
  const locs = FIREPROOF_DATA.filter((d) => d.wall === wall).map((d) => d.location);
  const [loc, setLoc] = useState(locs[0]);
  const curLocs = FIREPROOF_DATA.filter((d) => d.wall === wall).map((d) => d.location);
  const match = FIREPROOF_DATA.find((d) => d.wall === wall && d.location === (curLocs.includes(loc) ? loc : curLocs[0]));

  return (
    <div>
      <Field label="壁・床の種類">
        <select className={selectCls} value={wall} onChange={(e) => { setWall(e.target.value); setLoc(FIREPROOF_DATA.filter((d) => d.wall === e.target.value)[0].location); }}>
          {walls.map((w) => <option key={w} value={w}>{w}</option>)}
        </select>
      </Field>
      <Field label="施工箇所">
        <select className={selectCls} value={loc} onChange={(e) => setLoc(e.target.value)}>
          {curLocs.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </Field>
      <ResultCard>
        <ResultRow label="該当工法" value={match?.method ?? "—"} />
      </ResultCard>
      <p className="text-sm text-slate-400 mt-3">工法名・認定条件は日東化成／フィブロック等の最新カタログで必ず確認してください。</p>
      <div className="mt-3"><RefBadge text="サンプルデータ・要カタログ確認" /></div>
    </div>
  );
}

/* ============================== 計算系ツール ============================== */

function PipeTakeoffTool() {
  const [length, setLength] = useState(20);
  const [bends, setBends] = useState(2);
  const [boxes, setBoxes] = useState(2);
  const pieceLen = 3.66;

  const pieces = Math.max(1, Math.ceil(Number(length) / pieceLen));
  const couplings = Math.max(0, pieces - 1) + Number(bends) * 2;
  const normalBends = Number(bends);

  return (
    <div>
      <Field label="配管ルート延長 (m)">
        <input type="number" min="0" className={inputCls} value={length} onChange={(e) => setLength(e.target.value)} />
      </Field>
      <Field label="ベンド（曲がり）箇所数">
        <input type="number" min="0" className={inputCls} value={bends} onChange={(e) => setBends(e.target.value)} />
      </Field>
      <Field label="ボックス数">
        <input type="number" min="0" className={inputCls} value={boxes} onChange={(e) => setBoxes(e.target.value)} />
      </Field>
      <ResultCard accent="amber">
        <ResultRow label="配管本数（3.66m/本）" value={pieces} unit="本" />
        <ResultRow label="カップリング" value={couplings} unit="個" />
        <ResultRow label="ノーマルベンド" value={normalBends} unit="個" />
        <ResultRow label="アウトレットボックス" value={boxes} unit="個" />
      </ResultCard>
      <p className="text-xs text-slate-400 mt-3">簡易概算です。実際の材料拾いは施工図・現場条件で確認してください。</p>
    </div>
  );
}

function CableRackTool() {
  const [length, setLength] = useState(30);
  const [unitLen, setUnitLen] = useState(2);
  const [interval, setInterval_] = useState(2);

  const straight = Math.max(1, Math.ceil(Number(length) / Number(unitLen || 1)));
  const supports = Math.max(1, Math.ceil(Number(length) / Number(interval || 1)) + 1);

  return (
    <div>
      <Field label="ルート延長 (m)">
        <input type="number" min="0" className={inputCls} value={length} onChange={(e) => setLength(e.target.value)} />
      </Field>
      <Field label="ラック1本の長さ (m)">
        <select className={selectCls} value={unitLen} onChange={(e) => setUnitLen(e.target.value)}>
          <option value={2}>2m</option>
          <option value={3}>3m</option>
        </select>
      </Field>
      <Field label="支持間隔 (m)">
        <input type="number" min="0.5" step="0.5" className={inputCls} value={interval} onChange={(e) => setInterval_(e.target.value)} />
      </Field>
      <ResultCard accent="amber">
        <ResultRow label="直状ラック" value={straight} unit="本" />
        <ResultRow label="支持金物" value={supports} unit="箇所" />
        <ResultRow label="ブラケット" value={supports} unit="個" />
      </ResultCard>
      <p className="text-xs text-slate-400 mt-3">直線区間の概算です。曲がり・分岐材は別途加算してください。</p>
    </div>
  );
}

function PartitionPrepTool() {
  const [length, setLength] = useState(15);
  const [outlets, setOutlets] = useState(4);
  const pieceLen = 3.66;
  const pieces = Math.max(1, Math.ceil(Number(length) / pieceLen));
  const couplings = Math.max(0, pieces - 1);

  return (
    <div>
      <Field label="配管延長 (m)">
        <input type="number" min="0" className={inputCls} value={length} onChange={(e) => setLength(e.target.value)} />
      </Field>
      <Field label="器具（コンセント・SW等）の数">
        <input type="number" min="0" className={inputCls} value={outlets} onChange={(e) => setOutlets(e.target.value)} />
      </Field>
      <ResultCard accent="amber">
        <ResultRow label="スイッチボックス" value={outlets} unit="個" />
        <ResultRow label="配管本数" value={pieces} unit="本" />
        <ResultRow label="カップリング" value={couplings} unit="個" />
      </ResultCard>
    </div>
  );
}

function OccupancyTool() {
  const [mode, setMode] = useState(32);
  const pipeTypes = Object.keys(CONDUIT_DATA);
  const [pipeType, setPipeType] = useState(pipeTypes[0]);
  const [pipeSize, setPipeSize] = useState(Object.keys(CONDUIT_DATA[pipeTypes[0]])[0]);
  const wireTypes = Object.keys(WIRE_DATA);
  const [cables, setCables] = useState([{ wireType: "VVF", spec: Object.keys(WIRE_DATA.VVF)[0], count: 3 }]);

  const curSizes = Object.keys(CONDUIT_DATA[pipeType]);
  const outer = CONDUIT_DATA[pipeType][curSizes.includes(pipeSize) ? pipeSize : curSizes[0]];
  const conduitInner = conduitInnerDiameter(outer);

  const updateCable = (i, key, val) => {
    const next = [...cables];
    next[i] = { ...next[i], [key]: val };
    if (key === "wireType") next[i].spec = Object.keys(WIRE_DATA[val])[0];
    setCables(next);
  };
  const addCable = () => setCables([...cables, { wireType: "VVF", spec: Object.keys(WIRE_DATA.VVF)[0], count: 1 }]);
  const removeCable = (i) => setCables(cables.filter((_, idx) => idx !== i));

  const cableArea = cables.reduce((sum, c) => {
    const val = WIRE_DATA[c.wireType]?.[c.spec];
    return sum + (val !== undefined ? wireArea(val) : 0) * Number(c.count || 0);
  }, 0);
  const conduitArea = Math.PI * Math.pow(Number(conduitInner) / 2, 2);
  const rate = conduitArea > 0 ? (cableArea / conduitArea) * 100 : 0;
  const limit = mode === "free" ? 100 : Number(mode);
  const ok = rate <= limit;

  // 同じ配管種類の中で、占積率が規定内に収まる最小サイズを提案
  const recommended = (() => {
    for (const [size, o] of Object.entries(CONDUIT_DATA[pipeType])) {
      const inner = conduitInnerDiameter(o);
      const area = Math.PI * Math.pow(inner / 2, 2);
      const r = area > 0 ? (cableArea / area) * 100 : Infinity;
      if (r <= limit) return { size, outer: o, rate: r };
    }
    return null;
  })();

  return (
    <div>
      <Field label="判定モード">
        <select className={selectCls} value={mode} onChange={(e) => setMode(e.target.value === "free" ? "free" : Number(e.target.value))}>
          <option value={32}>32%（同一管に3本以上の場合等）</option>
          <option value={48}>48%（電線相互のみ収める場合等）</option>
          <option value="free">制限なし</option>
        </select>
      </Field>

      <span className="block text-sm font-medium text-slate-300 mb-1.5">配管内径</span>
      <div className="grid grid-cols-2 gap-3 mb-1">
        <label className="block">
          <span className="block text-xs text-slate-400 mb-1">配管種類</span>
          <select
            className={selectCls}
            value={pipeType}
            onChange={(e) => { setPipeType(e.target.value); setPipeSize(Object.keys(CONDUIT_DATA[e.target.value])[0]); }}
          >
            {pipeTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="block text-xs text-slate-400 mb-1">径</span>
          <select className={selectCls} value={pipeSize} onChange={(e) => setPipeSize(e.target.value)}>
            {curSizes.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        参考内径：<span className="font-semibold text-slate-200">{conduitInner.toFixed(1)}mm</span>（外径{outer}mmより推定）
      </p>

      <div className="mb-2">
        <span className="block text-sm font-medium text-slate-300 mb-1.5">収める電線</span>
        <div className="flex gap-2 mb-1 px-0.5">
          <span className="text-xs text-slate-400" style={{ flex: "0 0 40%" }}>線種</span>
          <span className="text-xs text-slate-400" style={{ flex: "0 0 40%" }}>芯数</span>
          <span className="text-xs text-slate-400" style={{ flex: "0 0 20%" }}>本数</span>
          <span className="w-9 shrink-0" />
        </div>
        {cables.map((c, i) => {
          const specs = Object.keys(WIRE_DATA[c.wireType]);
          const curSpec = specs.includes(c.spec) ? c.spec : specs[0];
          const wireVal = WIRE_DATA[c.wireType][curSpec];
          return (
            <div key={i} className="mb-3">
              <div className="flex gap-2 items-center">
                <select
                  className={`${selectCls} min-w-0`}
                  style={{ flex: "0 0 40%" }}
                  value={c.wireType}
                  onChange={(e) => updateCable(i, "wireType", e.target.value)}
                >
                  {wireTypes.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
                <select
                  className={`${selectCls} min-w-0`}
                  style={{ flex: "0 0 40%" }}
                  value={curSpec}
                  onChange={(e) => updateCable(i, "spec", e.target.value)}
                >
                  {specs.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <input
                  type="number"
                  min="0"
                  max="99"
                  className={`${inputCls} min-w-0 px-2 text-center`}
                  style={{ flex: "0 0 20%" }}
                  value={c.count}
                  onChange={(e) => updateCable(i, "count", e.target.value)}
                />
                <button onClick={() => removeCable(i)} className="p-2.5 rounded-lg bg-slate-800 border border-slate-600 text-slate-400 hover:text-red-400 shrink-0 w-9" aria-label="削除">
                  <Trash2 size={18} />
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                参考外径：<span className="font-semibold text-slate-200">{wireOuterLabel(wireVal)}</span>
                <span className="mx-1.5 text-slate-600">|</span>
                断面積：<span className="font-semibold text-slate-200">{wireArea(wireVal).toFixed(2)}mm²</span>
              </p>
            </div>
          );
        })}
        <button onClick={addCable} className="flex items-center gap-1.5 text-sm font-medium text-blue-400 mt-1">
          <Plus size={16} /> 電線を追加
        </button>
      </div>

      <ResultCard accent={ok ? "blue" : "amber"}>
        <ResultRow label="占積率" value={rate.toFixed(1)} unit="%" />
        <ResultRow label="判定" value={ok ? "OK（規定内）" : "NG（超過）"} />
      </ResultCard>

      <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 mt-3">
        <span className="block text-sm font-medium text-slate-300 mb-1.5">推奨配管サイズ（{pipeType}内）</span>
        {recommended ? (
          <p className="text-lg font-bold text-slate-50">
            {recommended.size}
            <span className="text-sm font-normal text-slate-400 ml-2">
              占積率 {recommended.rate.toFixed(1)}%・外径{recommended.outer}mm
            </span>
          </p>
        ) : (
          <p className="text-sm text-amber-300">{pipeType}の既存サイズでは規定を満たせません。配管種類を変えるか、電線本数を見直してください。</p>
        )}
      </div>
    </div>
  );
}

function WiringCalcTool() {
  const [phase, setPhase] = useState("single");
  const [voltage, setVoltage] = useState(100);
  const [current, setCurrent] = useState(15);
  const [distance, setDistance] = useState(20);
  const [dropPct, setDropPct] = useState(2);

  const k = phase === "single" ? 35.6 : 30.8;
  const e = (Number(voltage) * Number(dropPct)) / 100;
  const rawArea = e > 0 ? (k * Number(distance) * Number(current)) / (1000 * e) : 0;
  const standardArea = STANDARD_SIZES_MM2.find((s) => s >= rawArea) ?? STANDARD_SIZES_MM2[STANDARD_SIZES_MM2.length - 1];
  const actualDropV = (k * Number(distance) * Number(current)) / (1000 * standardArea);
  const actualDropPct = (actualDropV / Number(voltage)) * 100;

  return (
    <div>
      <Field label="配線方式">
        <select className={selectCls} value={phase} onChange={(e) => setPhase(e.target.value)}>
          <option value="single">単相2線式</option>
          <option value="three">三相3線式</option>
        </select>
      </Field>
      <Field label="回路電圧 (V)">
        <input type="number" className={inputCls} value={voltage} onChange={(e) => setVoltage(e.target.value)} />
      </Field>
      <Field label="負荷電流 (A)">
        <input type="number" className={inputCls} value={current} onChange={(e) => setCurrent(e.target.value)} />
      </Field>
      <Field label="こう長 (m・片道)">
        <input type="number" className={inputCls} value={distance} onChange={(e) => setDistance(e.target.value)} />
      </Field>
      <Field label="許容電圧降下 (%)">
        <input type="number" step="0.5" className={inputCls} value={dropPct} onChange={(e) => setDropPct(e.target.value)} />
      </Field>

      <ResultCard accent="amber">
        <ResultRow label="必要最小断面積（計算値）" value={rawArea.toFixed(2)} unit="mm²" />
        <ResultRow label="採用サイズ（標準）" value={standardArea} unit="mm²" />
        <ResultRow label="採用時の電圧降下" value={actualDropV.toFixed(2)} unit={`V（${actualDropPct.toFixed(2)}%）`} />
      </ResultCard>
      <p className="text-xs text-slate-400 mt-3">内線規程の簡易電圧降下式（銅線）による概算です。許容電流・アース線・ボンド線サイズは別途規格表で確認してください。</p>
    </div>
  );
}

function RackSeismicTool() {
  const [cls, setCls] = useState("A");
  const [floor, setFloor] = useState("mid");
  const [rackWeight, setRackWeight] = useState(5);
  const [cableWeight, setCableWeight] = useState(10);
  const [selfSpan, setSelfSpan] = useState(2.0); // 自重支持間隔（常時荷重用。内線規程準拠でケーブルラックは2.0m以下）
  const [seismicSpan, setSeismicSpan] = useState(recommendedInterval("A", "mid")); // 耐震支持間隔
  const [khOverride, setKhOverride] = useState(""); // 現場条件により任意入力可
  const [bracketType, setBracketType] = useState("custom"); // "custom"=自作架台 / "product"=既製品ブラケット
  const [allowable, setAllowable] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [author, setAuthor] = useState("");
  const [docDate, setDocDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [angleSize, setAngleSize] = useState("50×50×6");
  const [materialGrade, setMaterialGrade] = useState("SS400");
  const [angleCount, setAngleCount] = useState(2); // 吊り材の本数（1ブラケットあたり）
  const [dropLength, setDropLength] = useState(300); // スラブからガセットプレートまでの腕の長さ(mm)
  const [structModel, setStructModel] = useState("frame"); // "frame"=上下固定(反曲点法) / "cantilever"=片持ち
  const [boltSize, setBoltSize] = useState("M12");
  const [boltsPerLeg, setBoltsPerLeg] = useState(2);
  const [boltSpacing, setBoltSpacing] = useState(150); // アンカーボルト間隔(mm)＝引張力の腕
  const [plateBc, setPlateBc] = useState(100); // 圧縮側の負担幅(mm)
  const [plateL, setPlateL] = useState(40); // 圧縮側の片持ち長さ(mm)
  const [plateEdge, setPlateEdge] = useState(20); // 引張側：縁端からボルト中心までの長さℓ(mm)

  const khTable = SEISMIC_KH[cls][floor];
  const kh = khOverride !== "" ? Number(khOverride) : khTable;
  const kv = kh / 2;
  const unitWeight = Number(rackWeight) + Number(cableWeight); // kgf/m
  const wSelf = unitWeight * Number(selfSpan || 0); // kgf（自重支持点の常時荷重）
  const wSeismic = unitWeight * Number(seismicSpan || 0); // kgf（耐震支持点の負担質量）
  const fh = kh * wSeismic; // kgf
  const fv = kv * wSeismic; // kgf
  const recommended = recommendedInterval(cls, floor);
  const judgement = bracketType === "product" && allowable !== "" ? (fh <= Number(allowable) ? "OK" : "NG") : null;

  const applyRecommended = () => setSeismicSpan(recommended);
  const selectedAngle = ANGLE_STEEL_DATA.find((a) => a.size === angleSize) ?? ANGLE_STEEL_DATA[0];

  // --- アングル耐荷重（簡易モデル） -------------------------------
  // モデル：スラブから吊り下げたLアングル（吊り材）の下端は、溝形鋼＋ガセットプレートで
  // もう一方の吊り材と一体につながっている（上下とも回転拘束）フレーム構造を想定。
  // 「frame」モデルでは反曲点法により中央で曲げが反転するとみなし M=FH×L/2 とする。
  // 「cantilever」モデルは下端自由（力のみ作用）として M=FH×L とする。
  const G = 9.80665; // kgf→N 換算
  const count = Math.max(1, Number(angleCount) || 1);
  const nAxial_kgf = (wSeismic + fv) / count; // 1本あたりの軸力（自重+鉛直地震力の負担分）
  const modelFactor = structModel === "frame" ? 0.5 : 1.0;
  const fhPerLeg_kgf = fh / count;
  const mBend_kgfmm = fhPerLeg_kgf * Number(dropLength || 0) * modelFactor; // 1本あたりの曲げモーメント
  const nAxial_N = nAxial_kgf * G;
  const mBend_Nmm = mBend_kgfmm * G;
  const A_mm2 = selectedAngle.A * 100;
  const Z_mm3 = selectedAngle.Z * 1000;
  const iv_mm = selectedAngle.iv * 10;
  const selectedMaterial = MATERIAL_GRADES.find((m) => m.grade === materialGrade) ?? MATERIAL_GRADES[0];
  const matF = selectedMaterial.F;
  const ft = steelFt(matF);
  const lambda = iv_mm > 0 ? Number(dropLength || 0) / iv_mm : 0;
  const fc = steelFc(lambda, matF);
  const sigmaB = mBend_Nmm / Z_mm3; // N/mm²
  const sigmaC = nAxial_N / A_mm2; // N/mm²
  const angleRatio = sigmaB / ft.short + sigmaC / fc.short; // 短期・組合せ検定値
  const angleJudge = angleRatio <= 1.0 ? "OK" : "NG";

  // --- アンカーボルト（取付部）の許容耐力 --------------------------------
  // 曲げモーメントをボルト間隔で除した力の対（偶力）として引張力Tを、水平力をボルト本数で除してせん断力Qを簡易算定。
  const anchorData = ANCHOR_BOLT_DATA.find((b) => b.size === boltSize) ?? ANCHOR_BOLT_DATA[1];
  const boltsN = Math.max(1, Number(boltsPerLeg) || 1);
  const Q_perBolt_kgf = fhPerLeg_kgf / boltsN;
  const T_perBolt_kgf = Number(boltSpacing || 0) > 0 ? mBend_kgfmm / Number(boltSpacing) : 0;
  const Q_perBolt_kN = (Q_perBolt_kgf * G) / 1000;
  const T_perBolt_kN = (T_perBolt_kgf * G) / 1000;
  const qRatio = Q_perBolt_kN / anchorData.Qa;
  const tRatio = T_perBolt_kN / anchorData.Ta;
  // 引張・せん断同時作用時の許容引張応力度 fts = 1.4ft - 1.6τ（ft超は不可）
  const boltA_mm2 = anchorData.sca * 100;
  const tau = (Q_perBolt_kN * 1000) / boltA_mm2; // N/mm²
  const sigmaT = (T_perBolt_kN * 1000) / boltA_mm2; // N/mm²
  const fts = Math.min(BOLT_FT_SHORT, 1.4 * BOLT_FT_SHORT - 1.6 * tau);
  const ftsRatio = sigmaT / Math.min(BOLT_FT_SHORT, fts);
  const anchorJudge = qRatio <= 1.0 && tRatio <= 1.0 && ftsRatio <= 1.0 ? "OK" : "NG";

  // --- 取付部板厚の検討（アングルのフランジ／ガセットプレートのボルト周り局所曲げ） -------
  // 出典：建築設備耐震設計・施工指針2014年版／鋼構造許容応力度設計規準（架台取付部板厚の検討式）
  const angleParts = selectedAngle.size.split("×").map(Number); // [D, D, t]
  const plateD = angleParts[0]; // 鋼材の幅(mm)
  const plateT = angleParts[2]; // 板厚(mm)＝アングルの厚み
  const boltPhi = Number(boltSize.replace("M", "")); // ボルト径(mm)
  // 面外曲げの許容応力度 fb1（指針準拠：F/1.3、短期は長期の1.5倍）
  const fb1Long = matF / 1.3;
  const fb1Short = fb1Long * 1.5;
  // 圧縮側：分布圧力による片持ちモデル（C=T_perBoltを圧縮側力の目安として使用）
  const plateA_mm2 = Number(plateBc || 1) * plateD;
  const sigmaC_plate = (T_perBolt_kN * 1000) / plateA_mm2; // N/mm²
  const mComp_Nmm = (sigmaC_plate * Number(plateL || 0) * Number(plateL || 0)) / 2;
  const zComp = (plateT * plateT) / 6; // mm²（単位幅あたり）
  const sigmaBComp = mComp_Nmm / zComp; // N/mm²
  // 引張側：集中荷重による片持ちモデル
  const btWidth = 2 * Number(plateEdge || 0) + (boltPhi + 2);
  const mTens_Nmm = T_perBolt_kN * 1000 * Number(plateEdge || 0);
  const zTens = (btWidth * plateT * plateT) / 6; // mm³
  const sigmaBTens = mTens_Nmm / zTens; // N/mm²
  const plateCompRatio = sigmaBComp / fb1Short;
  const plateTensRatio = sigmaBTens / fb1Short;
  const plateJudge = plateCompRatio <= 1.0 && plateTensRatio <= 1.0 ? "OK" : "NG";

  if (showReport) {
    return (
      <div>
        <button
          onClick={() => setShowReport(false)}
          className="no-print flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white mb-4"
        >
          <ArrowLeft size={16} /> 簡易計算に戻る
        </button>

        <style>{`@media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
        }`}</style>

        <div className="bg-white text-slate-900 rounded-lg p-8 max-w-2xl mx-auto shadow-lg" id="report-area">
          <h1 className="text-xl font-bold text-center mb-1">ケーブルラック耐震支持計算書</h1>
          <p className="text-center text-xs text-slate-500 mb-6">建築設備耐震設計・施工指針 準拠（簡易計算）</p>

          <table className="w-full text-sm mb-6 border-collapse">
            <tbody>
              <tr className="border-b border-slate-300">
                <td className="py-1.5 pr-3 text-slate-500 w-28">工事名</td>
                <td className="py-1.5">
                  <input
                    className="no-print w-full border border-slate-300 rounded px-2 py-1"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="（工事名を入力）"
                  />
                  <span className="hidden print:inline">{projectName || "－"}</span>
                </td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="py-1.5 pr-3 text-slate-500">作成者</td>
                <td className="py-1.5">
                  <input
                    className="no-print w-full border border-slate-300 rounded px-2 py-1"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="（作成者名を入力）"
                  />
                  <span className="hidden print:inline">{author || "－"}</span>
                </td>
              </tr>
              <tr>
                <td className="py-1.5 pr-3 text-slate-500">作成日</td>
                <td className="py-1.5">
                  <input
                    type="date"
                    className="no-print border border-slate-300 rounded px-2 py-1"
                    value={docDate}
                    onChange={(e) => setDocDate(e.target.value)}
                  />
                  <span className="hidden print:inline">{docDate}</span>
                </td>
              </tr>
            </tbody>
          </table>

          <h2 className="font-bold text-sm border-b-2 border-slate-800 pb-1 mb-2">1. 計算条件</h2>
          <table className="w-full text-sm mb-5">
            <tbody>
              <tr className="border-b border-slate-200"><td className="py-1 text-slate-500 w-40">耐震クラス</td><td className="py-1">{CLASS_LABEL[cls]}</td></tr>
              <tr className="border-b border-slate-200"><td className="py-1 text-slate-500">設置場所</td><td className="py-1">{FLOOR_LABEL[floor]}</td></tr>
              <tr className="border-b border-slate-200"><td className="py-1 text-slate-500">ラック自重</td><td className="py-1">{rackWeight} kg/m</td></tr>
              <tr className="border-b border-slate-200"><td className="py-1 text-slate-500">積載ケーブル質量</td><td className="py-1">{cableWeight} kg/m</td></tr>
              <tr className="border-b border-slate-200"><td className="py-1 text-slate-500">自重支持間隔</td><td className="py-1">{selfSpan} m（常時荷重の計算に使用）</td></tr>
              <tr><td className="py-1 text-slate-500">耐震支持間隔</td><td className="py-1">{seismicSpan} m（支持間隔：{recommended}m以内）</td></tr>
            </tbody>
          </table>

          <h2 className="font-bold text-sm border-b-2 border-slate-800 pb-1 mb-2">2. 設計用震度</h2>
          <table className="w-full text-sm mb-5">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="py-1 text-slate-500 w-40">水平震度 Kh</td>
                <td className="py-1">
                  {kh.toFixed(2)}
                  <span className="text-xs text-slate-500 ml-2">
                    （{khOverride !== "" ? "現場条件により入力" : "指針の基準表による値"}）
                  </span>
                </td>
              </tr>
              <tr><td className="py-1 text-slate-500">鉛直震度 Kv（＝Kh/2）</td><td className="py-1">{kv.toFixed(2)}</td></tr>
            </tbody>
          </table>

          <h2 className="font-bold text-sm border-b-2 border-slate-800 pb-1 mb-2">3. 計算過程</h2>
          <table className="w-full text-sm mb-5 font-mono text-[13px]">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="py-1 text-slate-500 w-52 font-sans">常時荷重（自重支持点）</td>
                <td className="py-1">W長期 = (自重+積載)×自重支持間隔 = ({rackWeight}+{cableWeight})×{selfSpan} = {wSelf.toFixed(1)} kgf</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1 text-slate-500 font-sans">支持点負担質量（耐震支持点）W</td>
                <td className="py-1">W = (自重+積載)×耐震支持間隔 = ({rackWeight}+{cableWeight})×{seismicSpan} = {wSeismic.toFixed(1)} kgf</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1 text-slate-500 font-sans">水平地震力 FH</td>
                <td className="py-1">FH = Kh×W = {kh.toFixed(2)}×{wSeismic.toFixed(1)} = {fh.toFixed(1)} kgf</td>
              </tr>
              <tr>
                <td className="py-1 text-slate-500 font-sans">鉛直地震力 FV</td>
                <td className="py-1">FV = Kv×W = {kv.toFixed(2)}×{wSeismic.toFixed(1)} = {fv.toFixed(1)} kgf</td>
              </tr>
            </tbody>
          </table>

          {bracketType === "product" ? (
            <>
              <h2 className="font-bold text-sm border-b-2 border-slate-800 pb-1 mb-2">4. 判定（既製品ブラケット）</h2>
              {allowable !== "" ? (
                <p className="text-sm mb-6">
                  耐震支持材の許容耐力 {allowable} kgf ≧ 水平地震力 {fh.toFixed(1)} kgf のため、
                  <span className={`font-bold ml-1 ${judgement === "OK" ? "text-blue-700" : "text-red-600"}`}>
                    判定：{judgement}
                  </span>
                </p>
              ) : (
                <p className="text-sm text-slate-500 mb-6">※許容耐力が未入力のため判定は省略しています。</p>
              )}
            </>
          ) : (
            <>
          <h2 className="font-bold text-sm border-b-2 border-slate-800 pb-1 mb-2">5. 吊り材（Lアングル）の検討</h2>
          <p className="text-xs text-slate-500 mb-2">
            構成：スラブから吊り材（Lアングル）を下ろし、下端をガセットプレート・溝形鋼等でラックに固定。
            支持モデル：{structModel === "frame" ? "上下固定（反曲点法、M=FH×L/2）" : "片持ち（下端自由、M=FH×L）"}
          </p>
          <p className="text-sm font-mono bg-slate-100 border border-slate-300 rounded px-3 py-2 mb-2">
            判定式：σb / fb ＋ σc / fc ≦ 1.0
            <span className="block text-[11px] text-slate-500 font-sans mt-1">
              出典：鋼構造許容応力度設計規準（日本建築学会）6章 組合せ応力 6.1　圧縮力と曲げモーメント
            </span>
          </p>
          <table className="w-full text-sm mb-2">
            <tbody>
              <tr className="border-b border-slate-200"><td className="py-1 text-slate-500 w-52">使用形鋼</td><td className="py-1">等辺山形鋼 L-{selectedAngle.size}（{materialGrade}）　{angleCount}本</td></tr>
              <tr className="border-b border-slate-200"><td className="py-1 text-slate-500">腕の長さ L</td><td className="py-1">{dropLength} mm</td></tr>
              <tr className="border-b border-slate-200"><td className="py-1 text-slate-500">断面積 A／断面係数 Z</td><td className="py-1">{selectedAngle.A} cm² ／ {selectedAngle.Z} cm³</td></tr>
              <tr><td className="py-1 text-slate-500">細長比 λ（＝L/iv）</td><td className="py-1">{lambda.toFixed(1)}（Λ={lambdaP(matF).toFixed(1)}）</td></tr>
            </tbody>
          </table>
          <table className="w-full text-sm mb-2 font-mono text-[13px]">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="py-1 text-slate-500 w-52 font-sans">1本あたり軸力・曲げモーメント</td>
                <td className="py-1">N = (W+FV)/{angleCount} = {nAxial_kgf.toFixed(1)} kgf　　M = (FH/{angleCount})×L×{modelFactor} = {mBend_kgfmm.toFixed(0)} kgf・mm</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1 text-slate-500 font-sans">曲げ・圧縮応力度</td>
                <td className="py-1">σb = M/Z = {sigmaB.toFixed(1)} N/mm²　　σc = N/A = {sigmaC.toFixed(1)} N/mm²</td>
              </tr>
              <tr>
                <td className="py-1 text-slate-500 font-sans">許容応力度（短期・{materialGrade}）</td>
                <td className="py-1">fb = {ft.short} N/mm²　　fc（座屈考慮）= {fc.short.toFixed(1)} N/mm²</td>
              </tr>
            </tbody>
          </table>
          <p className="text-sm mb-6">
            検定値　σb/fb ＋ σc/fc = {angleRatio.toFixed(3)}　
            <span className={`font-bold ml-1 ${angleJudge === "OK" ? "text-blue-700" : "text-red-600"}`}>判定：{angleJudge}（≦1.0でOK）</span>
          </p>

          <h2 className="font-bold text-sm border-b-2 border-slate-800 pb-1 mb-2">6. アンカーボルトの検討</h2>
          <p className="text-sm font-mono bg-slate-100 border border-slate-300 rounded px-3 py-2 mb-2">
            判定式：T ≦ Ta　　Q ≦ Qa　　σt ≦ min(ft, fts)　　fts＝1.4ft－1.6τ（fts≦ft）
            <span className="block text-[11px] text-slate-500 font-sans mt-1">
              出典：建築設備耐震設計・施工指針2014年版「ｃ）ステンレス鋼ボルトの検討式」
            </span>
          </p>
          <table className="w-full text-sm mb-2">
            <tbody>
              <tr className="border-b border-slate-200"><td className="py-1 text-slate-500 w-52">ボルト仕様</td><td className="py-1">ステンレス鋼ボルト A2-50　{boltSize}　{boltsPerLeg}本（1脚あたり）</td></tr>
              <tr><td className="py-1 text-slate-500">ボルト間隔</td><td className="py-1">{boltSpacing} mm</td></tr>
            </tbody>
          </table>
          <table className="w-full text-sm mb-2 font-mono text-[13px]">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="py-1 text-slate-500 w-52 font-sans">1本あたり作用力</td>
                <td className="py-1">Q = (FH/{angleCount})/{boltsPerLeg} = {Q_perBolt_kN.toFixed(2)} kN　　T = M/ボルト間隔 = {T_perBolt_kN.toFixed(2)} kN</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1 text-slate-500 font-sans">許容耐力（短期・{boltSize}）</td>
                <td className="py-1">Qa = {anchorData.Qa} kN　　Ta = {anchorData.Ta} kN</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1 text-slate-500 font-sans">応力度（有効断面積{anchorData.sca}cm²）</td>
                <td className="py-1">τ = Q/A = {tau.toFixed(1)} N/mm²　　σt = T/A = {sigmaT.toFixed(1)} N/mm²</td>
              </tr>
              <tr>
                <td className="py-1 text-slate-500 font-sans">同時作用時の許容引張応力度</td>
                <td className="py-1">fts = 1.4×{BOLT_FT_SHORT} － 1.6×{tau.toFixed(1)} = {fts.toFixed(1)} N/mm²</td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-slate-500 mb-2">
            ※曲げモーメントをボルト間隔で除した偶力としてTを、水平力をボルト本数で除してQを簡易算定しています。
          </p>
          <p className="text-sm mb-6">
            検定値　Q/Qa = {qRatio.toFixed(3)}　T/Ta = {tRatio.toFixed(3)}　σt/fts = {ftsRatio.toFixed(3)}　
            <span className={`font-bold ml-1 ${anchorJudge === "OK" ? "text-blue-700" : "text-red-600"}`}>判定：{anchorJudge}（すべて≦1.0でOK）</span>
          </p>

          <h2 className="font-bold text-sm border-b-2 border-slate-800 pb-1 mb-2">7. 取付部板厚の検討（アングル脚部＝フランジの局所曲げ）</h2>
          <p className="text-xs text-slate-500 mb-2">
            対象：L-{selectedAngle.size}の脚（フランジ）厚み t={plateT}mm。アンカーボルトの引張り・圧縮力による局所曲げの検討です。
          </p>
          <p className="text-sm font-mono bg-slate-100 border border-slate-300 rounded px-3 py-2 mb-2">
            判定式：σb ＝ M／Z ≦ fb1
            <span className="block text-[11px] text-slate-500 font-sans mt-1">
              出典：建築設備耐震設計・施工指針2014年版／鋼構造許容応力度設計規準（架台取付部板厚の検討式）
            </span>
          </p>
          <table className="w-full text-sm mb-2">
            <tbody>
              <tr className="border-b border-slate-200"><td className="py-1 text-slate-500 w-52">板厚 t（アングルより）</td><td className="py-1">{plateT} mm</td></tr>
              <tr className="border-b border-slate-200"><td className="py-1 text-slate-500">圧縮側：負担幅Bc／片持ち長さL</td><td className="py-1">{plateBc} mm ／ {plateL} mm</td></tr>
              <tr><td className="py-1 text-slate-500">引張側：縁端長さℓ／ボルト径φ</td><td className="py-1">{plateEdge} mm ／ {boltPhi} mm</td></tr>
            </tbody>
          </table>
          <table className="w-full text-sm mb-2 font-mono text-[13px]">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="py-1 text-slate-500 w-52 font-sans">圧縮側（分布圧力・片持ち）</td>
                <td className="py-1">σc=C/(Bc×D)={sigmaC_plate.toFixed(2)}N/mm²　M=σc×L²/2　σb={sigmaBComp.toFixed(1)}N/mm²</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1 text-slate-500 font-sans">引張側（集中荷重・片持ち）</td>
                <td className="py-1">Bt=2ℓ+(φ+2)={btWidth.toFixed(0)}mm　M=T×ℓ　σb={sigmaBTens.toFixed(1)}N/mm²</td>
              </tr>
              <tr>
                <td className="py-1 text-slate-500 font-sans">許容面外曲げ応力度（短期）</td>
                <td className="py-1">fb1 = F/1.3×1.5 = {fb1Short.toFixed(1)} N/mm²</td>
              </tr>
            </tbody>
          </table>
          <p className="text-sm mb-6">
            検定値　圧縮側 σb/fb1 = {plateCompRatio.toFixed(3)}　引張側 σb/fb1 = {plateTensRatio.toFixed(3)}　
            <span className={`font-bold ml-1 ${plateJudge === "OK" ? "text-blue-700" : "text-red-600"}`}>判定：{plateJudge}（両方≦1.0でOK）</span>
          </p>
            </>
          )}

          {bracketType === "custom" && (
            <div style={{ pageBreakBefore: "always", breakBefore: "page" }} className="pt-2">
              <h2 className="font-bold text-sm border-b-2 border-slate-800 pb-1 mb-2">別紙：使用数値の出典</h2>
              <table className="w-full text-sm mb-6">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="py-1.5 text-slate-500 w-56 align-top">Lアングル断面性能<br />（A・Z・iv）</td>
                    <td className="py-1.5">JIS G 3192「熱間圧延等辺山形鋼」標準断面寸法・断面性能表</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-slate-500 align-top">アンカーボルト許容耐力<br />（Ta・Qa、A2-50）</td>
                    <td className="py-1.5">
                      材質等級「A2-50」はJIS B 1054（ステンレス鋼製ボルト・ナットの機械的性質、ISO 3506準拠）による区分。
                      Ta・Qaの数値はJIS表の直接記載値ではなく、「有効断面積×降伏点（短期σy=210N/mm²）」の計算式（建築設備耐震設計・施工指針2014年版準拠）による算出値です。
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-slate-500 align-top">取付部板厚の検討式<br />（σb=M/Z、fb1）</td>
                    <td className="py-1.5">
                      建築設備耐震設計・施工指針2014年版／鋼構造許容応力度設計規準（架台取付部板厚の検討式）。fb1（許容面外曲げ応力度）はF/1.3（長期）を基準とする値です。
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <p className="text-[11px] text-slate-500 border-t border-slate-300 pt-3">
            {bracketType === "product"
              ? "※既製品ブラケットのカタログ許容耐力との比較のみです。取付部の詳細な検討はメーカー資料に基づき別途確認してください。"
              : "※吊り材・アンカーボルト・取付部板厚の検定は簡易モデルによるものです（fts式含む）。3次元架構の応力解析は含まれていません。"}
          </p>

          <button
            onClick={() => window.print()}
            className="no-print mt-6 flex items-center gap-2 mx-auto bg-slate-800 text-white text-sm font-semibold rounded-lg px-4 py-2.5 hover:bg-slate-700"
          >
            <Printer size={16} /> 印刷・PDFで保存
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Field label="耐震クラス">
        <select className={selectCls} value={cls} onChange={(e) => setCls(e.target.value)}>
          <option value="S">S種（特に重要な設備）</option>
          <option value="A">A種（重要設備）</option>
          <option value="B">B種（一般設備）</option>
        </select>
      </Field>
      <Field label="設置場所">
        <select className={selectCls} value={floor} onChange={(e) => setFloor(e.target.value)}>
          <option value="top">上層階・屋上・塔屋</option>
          <option value="mid">中間階</option>
          <option value="low">地階・1階</option>
        </select>
      </Field>

      <Field label="水平震度 Kh（現場条件に応じて任意入力可）">
        <div className="flex gap-2">
          <input
            type="number"
            step="0.1"
            className={inputCls}
            value={khOverride === "" ? kh : khOverride}
            onChange={(e) => setKhOverride(e.target.value)}
            placeholder={String(khTable)}
          />
          <button
            onClick={() => setKhOverride("")}
            disabled={khOverride === ""}
            className="shrink-0 px-3 rounded-lg bg-slate-800 border border-slate-600 text-xs font-medium text-slate-300 hover:text-white disabled:opacity-40"
          >
            表の値（{khTable}）に戻す
          </button>
        </div>
        {khOverride !== "" && Number(khOverride) !== khTable && (
          <p className="text-xs text-amber-300 mt-1.5">表の基準値（{khTable}）と異なる値を使用しています。</p>
        )}
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="ラック自重 (kg/m)">
          <input type="number" step="0.5" className={inputCls} value={rackWeight} onChange={(e) => setRackWeight(e.target.value)} />
        </Field>
        <Field label="積載ケーブル質量 (kg/m)">
          <input type="number" step="0.5" className={inputCls} value={cableWeight} onChange={(e) => setCableWeight(e.target.value)} />
        </Field>
      </div>

      <Field label="自重支持間隔 (m)">
        <input type="number" step="0.5" className={inputCls} value={selfSpan} onChange={(e) => setSelfSpan(e.target.value)} />
        <p className="text-xs text-slate-500 mt-1">常時荷重の計算に使う間隔。内線規程準拠でケーブルラックの支持間隔は2.0m以下です。耐震支持間隔とは別の値です。</p>
      </Field>

      <Field label="耐震支持間隔 (m)">
        <div className="flex gap-2">
          <input type="number" step="0.5" className={inputCls} value={seismicSpan} onChange={(e) => setSeismicSpan(e.target.value)} />
          <button onClick={applyRecommended} className="shrink-0 px-3 rounded-lg bg-slate-800 border border-slate-600 text-xs font-medium text-slate-300 hover:text-white">
            推奨値（{recommended}m）
          </button>
        </div>
      </Field>

      <Field label="耐震支持材の種類">
        <select className={selectCls} value={bracketType} onChange={(e) => setBracketType(e.target.value)}>
          <option value="custom">自作架台（アングル＋アンカーボルトで計算）</option>
          <option value="product">既製品ブラケット（カタログの許容耐力を入力）</option>
        </select>
      </Field>

      {bracketType === "product" && (
        <Field label="耐震支持材の許容耐力 (kgf)">
          <input type="number" className={inputCls} value={allowable} onChange={(e) => setAllowable(e.target.value)} placeholder="カタログ記載の許容耐力を入力" />
        </Field>
      )}

      {bracketType === "custom" && (
        <>
      <Field label="鋼材種別">
        <select className={selectCls} value={materialGrade} onChange={(e) => setMaterialGrade(e.target.value)}>
          {MATERIAL_GRADES.map((m) => <option key={m.grade} value={m.grade}>{m.label}</option>)}
        </select>
        <p className="text-xs text-slate-500 mt-1">
          既定値はSS400（山形鋼・ガセットプレート等）です。
        </p>
      </Field>

      <Field label="使用予定のLアングルサイズ">
        <select className={selectCls} value={angleSize} onChange={(e) => setAngleSize(e.target.value)}>
          {ANGLE_STEEL_DATA.map((a) => <option key={a.size} value={a.size}>{a.size}</option>)}
        </select>
      </Field>

      <Field label="支持構造の想定">
        <select className={selectCls} value={structModel} onChange={(e) => setStructModel(e.target.value)}>
          <option value="frame">上下固定（フレーム、下端は溝形鋼等で他方の吊り材と一体）</option>
          <option value="cantilever">片持ち（下端自由）</option>
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="吊り材の本数（1ブラケット）">
          <input type="number" min="1" className={inputCls} value={angleCount} onChange={(e) => setAngleCount(e.target.value)} />
        </Field>
        <Field label="腕の長さ L (mm)">
          <input type="number" step="10" className={inputCls} value={dropLength} onChange={(e) => setDropLength(e.target.value)} />
        </Field>
      </div>
      <p className="text-xs text-slate-500 -mt-3 mb-4">
        構成：スラブから吊り材（Lアングル）を下ろし、下端をガセットプレート・溝形鋼等でラックに固定。Lはスラブ〜下端接続部の垂直距離です。
        「上下固定」では反曲点法によりM=FH×L/2、「片持ち」ではM=FH×Lとして計算します。
      </p>

      <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 mb-4">
        <span className="block text-sm font-medium text-slate-300 mb-2">L-{selectedAngle.size}　断面性能（JIS G 3192・材質{materialGrade}）</span>
        <ResultRow label="断面積 A" value={selectedAngle.A} unit="cm²" />
        <ResultRow label="断面係数 Zx＝Zy" value={selectedAngle.Z} unit="cm³" />
        <ResultRow label="弱軸回転半径 iv" value={selectedAngle.iv} unit="cm" />
        <ResultRow label="細長比 λ（＝L/iv）" value={lambda.toFixed(1)} />
      </div>

      <div className={`rounded-xl border p-4 mb-4 ${angleJudge === "OK" ? "border-blue-500/40 bg-blue-500/10" : "border-red-500/40 bg-red-500/10"}`}>
        <span className="block text-sm font-medium text-slate-300 mb-2">アングル耐荷重検定（簡易、短期・{materialGrade}）</span>
        <div className="rounded-lg bg-slate-900/60 border border-slate-700 px-3 py-2 mb-3 font-mono text-sm text-slate-200">
          σb / fb ＋ σc / fc ≦ 1.0
          <div className="text-[11px] text-slate-500 font-sans mt-1">
            出典：鋼構造許容応力度設計規準（日本建築学会）6章 組合せ応力 6.1　圧縮力と曲げモーメント
          </div>
        </div>
        <ResultRow label="1本あたり軸力 N" value={nAxial_kgf.toFixed(1)} unit="kgf" />
        <ResultRow label="1本あたり曲げモーメント M" value={mBend_kgfmm.toFixed(0)} unit="kgf・mm" />
        <ResultRow label="曲げ応力度 σb" value={sigmaB.toFixed(1)} unit="N/mm²" />
        <ResultRow label="許容曲げ応力度 fb" value={ft.short} unit="N/mm²" />
        <ResultRow label="圧縮応力度 σc" value={sigmaC.toFixed(1)} unit="N/mm²" />
        <ResultRow label="許容圧縮応力度 fc（座屈考慮）" value={fc.short.toFixed(1)} unit="N/mm²" />
        <ResultRow label="検定値 σb/fb＋σc/fc" value={angleRatio.toFixed(3)} />
        <ResultRow label="判定（≦1.0でOK）" value={angleJudge} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="アンカーボルト径">
          <select className={selectCls} value={boltSize} onChange={(e) => setBoltSize(e.target.value)}>
            {ANCHOR_BOLT_DATA.map((b) => <option key={b.size} value={b.size}>{b.size}</option>)}
          </select>
        </Field>
        <Field label="本数（1脚あたり）">
          <input type="number" min="1" className={inputCls} value={boltsPerLeg} onChange={(e) => setBoltsPerLeg(e.target.value)} />
        </Field>
        <Field label="ボルト間隔 (mm)">
          <input type="number" step="10" className={inputCls} value={boltSpacing} onChange={(e) => setBoltSpacing(e.target.value)} />
        </Field>
      </div>

      <div className={`rounded-xl border p-4 mb-4 ${anchorJudge === "OK" ? "border-blue-500/40 bg-blue-500/10" : "border-red-500/40 bg-red-500/10"}`}>
        <span className="block text-sm font-medium text-slate-300 mb-2">アンカーボルト耐力検定（ステンレス A2-50・短期）</span>
        <div className="rounded-lg bg-slate-900/60 border border-slate-700 px-3 py-2 mb-3 font-mono text-sm text-slate-200">
          T ≦ Ta　　Q ≦ Qa　　σt ≦ min(ft, fts)
          <div className="text-[11px] text-slate-500 font-sans mt-1">
            fts＝1.4ft－1.6τ（fts≦ft）　出典：建築設備耐震設計・施工指針2014年版「ｃ）ステンレス鋼ボルトの検討式」
          </div>
        </div>
        <ResultRow label="1本あたりせん断力 Q" value={Q_perBolt_kN.toFixed(2)} unit="kN" />
        <ResultRow label={`許容せん断力 Qa（${boltSize}）`} value={anchorData.Qa} unit="kN" />
        <ResultRow label="1本あたり引張力 T（偶力）" value={T_perBolt_kN.toFixed(2)} unit="kN" />
        <ResultRow label={`許容引張力 Ta（${boltSize}）`} value={anchorData.Ta} unit="kN" />
        <ResultRow label="検定値 Q/Qa , T/Ta" value={`${qRatio.toFixed(3)} , ${tRatio.toFixed(3)}`} />
        <ResultRow label="せん断応力度 τ" value={tau.toFixed(1)} unit="N/mm²" />
        <ResultRow label="引張応力度 σt" value={sigmaT.toFixed(1)} unit="N/mm²" />
        <ResultRow label="同時作用時の許容引張応力度 fts" value={fts.toFixed(1)} unit="N/mm²" />
        <ResultRow label="検定値 σt/fts" value={ftsRatio.toFixed(3)} />
        <ResultRow label="判定（すべて≦1.0でOK）" value={anchorJudge} />
        <p className="text-xs text-slate-400 mt-2">
          曲げモーメントをボルト間隔で除した偶力としてTを、水平力をボルト本数で除してQを簡易算定。引張とせん断の同時作用による低減（fts式）を含めて判定しています。
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="圧縮側 負担幅 Bc (mm)">
          <input type="number" step="5" className={inputCls} value={plateBc} onChange={(e) => setPlateBc(e.target.value)} />
        </Field>
        <Field label="圧縮側 片持ち長さ L (mm)">
          <input type="number" step="5" className={inputCls} value={plateL} onChange={(e) => setPlateL(e.target.value)} />
        </Field>
        <Field label="引張側 縁端長さ ℓ (mm)">
          <input type="number" step="5" className={inputCls} value={plateEdge} onChange={(e) => setPlateEdge(e.target.value)} />
        </Field>
      </div>

      <div className={`rounded-xl border p-4 mb-4 ${plateJudge === "OK" ? "border-blue-500/40 bg-blue-500/10" : "border-red-500/40 bg-red-500/10"}`}>
        <span className="block text-sm font-medium text-slate-300 mb-1">
          取付部板厚の検討（アングル脚部＝フランジの局所曲げ）
        </span>
        <p className="text-xs text-slate-400 mb-3">
          対象は選択中のL-{selectedAngle.size}の<b className="text-slate-200">「{plateT}」の部分（脚の厚みt＝{plateT}mm）</b>です。
          スラブにボルト留めするアングルの脚（フランジ）が、ボルトの引張り・圧縮力で局所的にめくれるように曲がらないかを見ています。
        </p>

        <svg viewBox="0 0 320 190" className="w-full max-w-xs mx-auto mb-3">
          <rect x="20" y="10" width="280" height="18" fill="#475569" />
          <text x="160" y="23" textAnchor="middle" fontSize="10" fill="#e2e8f0">スラブ</text>

          <rect x="90" y="28" width="140" height="12" fill="#f59e0b" opacity="0.85" />
          <text x="20" y="37" fontSize="9" fill="#fbbf24" textAnchor="start">t（板厚）</text>
          <line x1="55" y1="34" x2="88" y2="34" stroke="#fbbf24" strokeWidth="1" />

          <line x1="160" y1="10" x2="160" y2="40" stroke="#94a3b8" strokeWidth="3" />
          <circle cx="160" cy="12" r="4" fill="#94a3b8" />
          <text x="230" y="20" fontSize="9" fill="#94a3b8">アンカーボルト</text>
          <line x1="200" y1="18" x2="164" y2="18" stroke="#94a3b8" strokeWidth="1" />

          <rect x="148" y="40" width="16" height="95" fill="#64748b" />
          <text x="230" y="90" fontSize="9" fill="#94a3b8">吊り材（アングル本体）</text>
          <line x1="228" y1="86" x2="166" y2="80" stroke="#94a3b8" strokeWidth="1" />

          <text x="90" y="185" fontSize="8" fill="#64748b">フランジ（アングルの脚）＝ここの局所曲げを検討</text>
        </svg>

        <p className="text-[11px] text-slate-500 text-center mb-1">フランジを上から見た図（平面図・ボルト直列2点の場合の例）</p>
        <svg viewBox="0 0 280 170" className="w-full max-w-xs mx-auto mb-3">
          {/* 固定端（アングル本体側） */}
          <line x1="40" y1="15" x2="40" y2="135" stroke="#e2e8f0" strokeWidth="3" />
          <text x="20" y="80" fontSize="9" fill="#e2e8f0" textAnchor="middle" transform="rotate(-90 20 80)">固定端（アングル本体）</text>

          {/* フランジ板（平面） */}
          <rect x="40" y="15" width="180" height="120" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.85" />

          {/* ボルト穴×2（固定端から見て手前・奥に直列） */}
          <circle cx="90" cy="75" r="6" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
          <circle cx="170" cy="75" r="6" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
          <text x="130" y="95" fontSize="8" fill="#94a3b8" textAnchor="middle">ボルト×2（直列）</text>

          {/* ℓ1：固定端〜手前ボルト */}
          <line x1="40" y1="30" x2="90" y2="30" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2,2" />
          <text x="65" y="25" fontSize="8" fill="#38bdf8" textAnchor="middle">ℓ1</text>

          {/* ℓ2：固定端〜奥ボルト（こちらを検討に採用＝安全側） */}
          <line x1="40" y1="45" x2="170" y2="45" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="105" y="40" fontSize="9" fill="#38bdf8" textAnchor="middle">ℓ2（＝ℓ、こちらを採用）</text>

          {/* L：固定端〜プレート外縁（圧縮側 片持ち長さ） */}
          <line x1="40" y1="150" x2="220" y2="150" stroke="#fbbf24" strokeWidth="1" />
          <line x1="40" y1="145" x2="40" y2="155" stroke="#fbbf24" strokeWidth="1" />
          <line x1="220" y1="145" x2="220" y2="155" stroke="#fbbf24" strokeWidth="1" />
          <text x="130" y="165" fontSize="9" fill="#fbbf24" textAnchor="middle">L（圧縮側 片持ち長さ）</text>

          {/* Bc：プレート全幅（直列の場合は幅を分けない） */}
          <line x1="235" y1="15" x2="235" y2="135" stroke="#a78bfa" strokeWidth="1" />
          <line x1="230" y1="15" x2="240" y2="15" stroke="#a78bfa" strokeWidth="1" />
          <line x1="230" y1="135" x2="240" y2="135" stroke="#a78bfa" strokeWidth="1" />
          <text x="255" y="78" fontSize="9" fill="#a78bfa" textAnchor="middle" transform="rotate(-90 255 78)">Bc（全幅）</text>
        </svg>
        <p className="text-[11px] text-slate-500 mb-3">
          <b className="text-slate-300">直列（縦に2穴）の場合</b>：横方向には1本しかないため Bc＝フランジ全幅を入力してください（幅を分けません）。
          ℓは手前・奥のボルトで値が異なりますが、固定端から遠い方（ℓ2）の方が曲げの腕が長く厳しい条件になるため、
          <b className="text-slate-300">ℓ2（奥のボルト）の値を安全側として採用</b>してください。
        </p>

        <div className="rounded-lg bg-slate-900/60 border border-slate-700 px-3 py-2 mb-3 font-mono text-sm text-slate-200">
          σb = M / Z ≦ fb1
          <div className="text-[11px] text-slate-500 font-sans mt-1">
            出典：建築設備耐震設計・施工指針2014年版／鋼構造許容応力度設計規準（架台取付部板厚の検討式）
          </div>
        </div>
        <ResultRow label="板厚 t（アングルより）" value={plateT} unit="mm" />
        <ResultRow label="許容面外曲げ応力度 fb1（短期）" value={fb1Short.toFixed(1)} unit="N/mm²" />
        <ResultRow label="圧縮側 曲げ応力度 σb" value={sigmaBComp.toFixed(1)} unit="N/mm²" />
        <ResultRow label="圧縮側 検定値 σb/fb1" value={plateCompRatio.toFixed(3)} />
        <ResultRow label="引張側 曲げ応力度 σb" value={sigmaBTens.toFixed(1)} unit="N/mm²" />
        <ResultRow label="引張側 検定値 σb/fb1" value={plateTensRatio.toFixed(3)} />
        <ResultRow label="判定（両方≦1.0でOK）" value={plateJudge} />
        <p className="text-xs text-slate-400 mt-2">
          圧縮側は分布圧力による片持ちモデル、引張側はボルト位置の集中荷重による片持ちモデルで簡易算定しています。
        </p>
      </div>
        </>
      )}

      <ResultCard accent="amber">
        <ResultRow label="水平震度 Kh" value={kh.toFixed(2)} />
        <ResultRow label="鉛直震度 Kv" value={kv.toFixed(2)} />
        <ResultRow label="常時荷重（自重支持点）" value={wSelf.toFixed(1)} unit="kgf" />
        <ResultRow label="支持点負担質量（耐震支持点）W" value={wSeismic.toFixed(1)} unit="kgf" />
        <ResultRow label="水平地震力 FH" value={fh.toFixed(1)} unit="kgf" />
        <ResultRow label="鉛直地震力 FV" value={fv.toFixed(1)} unit="kgf" />
        {judgement && <ResultRow label="判定" value={judgement} />}
      </ResultCard>

      <button
        onClick={() => setShowReport(true)}
        className="mt-4 flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold rounded-lg px-4 py-2.5 hover:bg-blue-500"
      >
        <FileText size={16} /> 計算書を表示・印刷
      </button>

      <p className="text-xs text-slate-400 mt-3">
        Kh表・耐震支持間隔・許容応力度式は建築設備耐震設計・施工指針2014年版／鋼構造許容応力度設計規準に基づいています。吊り材は片持ち／上下固定（フレーム）から選べる簡易モデルで、
        アンカーボルトの耐力（fts式含む）・取付部板厚も検定に含めています。3次元架構の応力解析は含みません。
      </p>
    </div>
  );
}

/* ============================== ツール定義 ============================== */

const TOOLS = {
  search: [
    { id: "pipe-diameter", name: "配管外径検索", desc: "配管の種類とサイズから外径をすぐ確認", icon: Ruler, Comp: PipeDiameterTool },
    { id: "support-interval", name: "電材支持間隔検索", desc: "8種類の電材の支持間隔を即表示", icon: Layers, Comp: SupportIntervalTool },
    { id: "pilot-hole", name: "下穴径検索", desc: "タップ・配管コネクタの下穴サイズ", icon: CircleDot, Comp: PilotHoleTool },
    { id: "connector", name: "接続材選定ツール", desc: "ケーブルサイズから適合接続材を表示", icon: Link2, Comp: ConnectorTool },
    { id: "fireproof", name: "耐火処理工法検索", desc: "壁種・施工箇所から該当工法を検索", icon: Flame, Comp: FireproofTool },
  ],
  calc: [
    { id: "pipe-takeoff", name: "金属管拾い出しツール", desc: "距離とサイズから必要材料を算出", icon: Zap, Comp: PipeTakeoffTool },
    { id: "cable-rack", name: "ケーブルラック材料計算", desc: "ルートと支持間隔から必要材料を算出", icon: Grid3x3, Comp: CableRackTool },
    { id: "partition", name: "間仕切り仕込み材計算", desc: "配管長と器具数から仕込み材を算出", icon: Boxes, Comp: PartitionPrepTool },
    { id: "occupancy", name: "占積率計算ツール", desc: "配管に入るケーブル本数を判定", icon: PieChart, Comp: OccupancyTool },
    { id: "wiring", name: "電気配線計算ツール", desc: "電圧降下・幹線サイズをまとめて計算", icon: Plug, Comp: WiringCalcTool },
    { id: "rack-seismic", name: "ラック耐震支持計算", desc: "耐震クラス・設置階から地震力を判定し計算書を作成", icon: ShieldCheck, Comp: RackSeismicTool },
  ],
};

/* ============================== メインアプリ（2ペインUI） ============================== */

const MIN_LEFT = 220;
const MAX_LEFT = 520;

export default function App() {
  const [category, setCategory] = useState("search"); // "search" | "calc"
  const [toolId, setToolId] = useState(TOOLS.search[0].id);
  const [navOpen, setNavOpen] = useState(false); // モバイル用：左ペインの開閉
  const [leftWidth, setLeftWidth] = useState(288);
  const containerRef = React.useRef(null);
  const draggingRef = React.useRef(false);

  const switchCategory = (cat) => {
    setCategory(cat);
    setToolId(TOOLS[cat][0].id);
  };

  const startDrag = (e) => {
    e.preventDefault();
    draggingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  React.useEffect(() => {
    const onMove = (e) => {
      if (!draggingRef.current || !containerRef.current) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const rect = containerRef.current.getBoundingClientRect();
      const next = clientX - rect.left;
      setLeftWidth(Math.min(MAX_LEFT, Math.max(MIN_LEFT, next)));
    };
    const onUp = () => {
      draggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  const currentTool = useMemo(() => TOOLS[category].find((t) => t.id === toolId), [category, toolId]);

  const accent = category === "calc" ? "amber" : "blue";
  const accentText = accent === "amber" ? "text-amber-400" : "text-blue-400";
  const accentBg = accent === "amber" ? "bg-amber-500" : "bg-blue-500";
  const activeBg = accent === "amber" ? "bg-amber-500/15" : "bg-blue-500/15";

  return (
    <div className="h-screen w-full bg-slate-900 text-slate-100 flex flex-col" style={{ fontFamily: "'Hiragino Sans','Noto Sans JP',system-ui,sans-serif" }}>
      {/* 上部バー（モバイルのみ：左ペイン開閉） */}
      <div className="no-print md:hidden flex items-center gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900">
        <button onClick={() => setNavOpen((v) => !v)} className="p-1.5 -ml-1.5 rounded-lg text-slate-300" aria-label="メニュー">
          <Layers size={20} />
        </button>
        <span className="font-bold text-[15px] flex items-center gap-1.5"><img src="data:image/png;base64,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" alt="logo" className="w-5 h-5 object-contain" />電気工事ツール</span>
      </div>

      <div ref={containerRef} className="flex flex-1 min-h-0 gap-0 p-3 bg-slate-950">
        {/* ===== 左ペイン（独立ウインドウ） ===== */}
        <aside
          style={{ width: navOpen ? undefined : leftWidth }}
          className={`
            no-print
            ${navOpen ? "flex" : "hidden"} md:flex
            flex-col shrink-0 rounded-xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/30
            overflow-hidden
            absolute md:static inset-3 z-20 md:z-auto
          `}
        >
          <div className="hidden md:flex items-center gap-2 px-4 py-4 border-b border-slate-800">
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAgsUlEQVR4nOVdebhcRZX/Vb8AWdgS9s0EBNQQIGwJiygCMogOMAIiDKgoyugoiozfqDCfgoiOygDjgjoCDiiIfjgOhCggGAz7agQkEBOWBMIek5D9vf7NH3VO17n16nbf7r73pV/mfF9/t++9datOna1Ondoc1lEg6QDYH8yV8oN57sy9fVcHQOecfbbOgGudpPdBmF1DqM9A2QyLyiCA+rogFMNSAIx21+AZUU+kGQ1gEwATAYwCsAuAbeCZtx6ALeQ5ASwCsBhe2x2AVwA8IfdPAFjqnHs1B48+GIEg6YaTYAwrASBZA1BzzvVHzzeCZ/TuAPYGsBeAbRGY3A2sBrAcwF8BzAMwG8ADAGY55+Yn8BsBoD8llL0IPS8AqmUJpk8GcAiAwwBMBrB9ThZ1DG7zFaxPkPeuLyff5QAeAzATwK0AHrJWgqR+19NNRc8KgGiTc84NmGf7ATgGwHvhmZ75BIHZKQewY1TkWjf3avotvAbgHgD/A2C6c+5Fg3cfelQQek4AhPFQE0pyOwDHAzgJwNQoeT8Ck2s2m+inkGJcCvqje3X+4p6CCl0tKv91ADcDuBLAbaYuIwAMSP0qF4aYlinoGQFIMH5fAB8HcCK8M6fQj8EEt9ofvysbVDjycACyQvYwgB8DuNY5twQIgtALFmGtC4B2r9TUkzwIwBcAHA3TrcNgLa/Lrw+D67EcwLPwTttL8J78ywjtdkojtHs3Ct6ZrAGYBO9I7gHvVG6d+E6tkO2GqjBYnJ8F8D0A/+WcWyx17bNN3NqAtSoAJEeocyft+5cBHGuSDCBL2DymvwDgQQD3AngEwOOxh14CrpsA2BnAFAAHwDdHu0bJUtZJLZNahWcBfBfAD51zy7RLO1x6DaUAyZpUHCTHk7yM5AA91En2MwsDiWePkvwGyYOFOXnljIh+tQK/+JtBiiLP9yb5JZJ3RvhpHerRszXm/kmSJ9n8qqN4D4GtKMnPkHzFECVmckzEZ0leRHIqQzdL81LG9VH8iZLxdraMxPvdSH6R5J9a1CEWhN+S3MOWUTbuPQG2ciQnk/yDIYIlSIpod5E8lT7gY/NUhlfelMXMiQTCmec1koeRvJbksqiOtk7Wqi2ntyRKnyI9leEDtkIkz5IK5xFlwNxPI/muKC8142vdgbWgwhA925nkxSQXR8IdC7vCH0nuJt8mm55hB0oUkluR/N+cisdm8WaSbzd5OA6RprcLglv864uEfkcRhCU5gm7rv5jkh0zew7dJMMw/iL79JgdrvRWER0gea76vcRibwxh/EYSrTX1TTZ/CpSTXk++GFw1EcpX5p5iKxRXW+2X0beAo+aY2rCU/AkbNA8kjST5utD/PGvye5ObyzfDoJQjz++T/N6UisckbYLACM0hOMt8PL2lHiGIWSWdoM4bkd5pYA72fR/Kt8k1vCwGznv5FUoHYo1drMEDyHIZ4QKlOT5l5tShH67te0TKZbRYOIznHMN3SSoXgBZJTJH1vCgGDA1QjeWWLCj1N8jDz3bA090abJ5P8cDt1YbaZHEvy50YxUgqzjOR7JX1vCQGN50vyVxGzY+bfSnIr+a7UigylIDE4aFPpg1lv6QSHyBp80dArbjJVGI6WtL0hBMy2+VcJoqsN8tap+YEhXG9UoAMwmrsXfddumtx35L9E1uADJJfmCEGd5AqS+1s81ioYhqpDk8f8b0u6YWvygQzzjyK5SOp2qGViCXlPJrnQaH1sCRYyWJy15zQbhM/LYb4i/2+anj0YzCkKRtg/YpjxKLsIUong2FCy0nS3HCHQ/wtIbi9ph16hGMz+BwQh6/BZzT9bK7aOMP+0SNg/L89Lq58Rgkk5QqC0/SPJkd0IYKcIatdnEsmVHNzPVwTPl3SFu0i9CJHma/0G6MO2W8o7F33TVX0jIXhRyrU0VgH8kU1fOTB09TZi6L+mpPMiRWyYM18Z8THDBCX+T+VdJe1wJAQvc3DUUPE4vUo88pC6PmK4/X+1ph2uzGe2d3O2EfQ6Q1O3n01XER5qfY5kaFptU9tPb4UnSbrq/AFDkDMSzFcrcD/J0axoYkaVwBCVtMy/MGK+Xh/gEPVojBB8vAndH6JvaqvxByhj8PRj3EuZDfGqD/AyyTdL+mEX0wcGMf8SQ3CtqxL8E5JmSNpeBsv7gyZCcKGkKZf2EVFuiwq1yLzPIjvU0K3kR/X8T6lT3LUlyZcos5OKllkWbiTXJ/lwxAO1TAP0k2vLFQJDlI8mpE//f0/SDGI+g+OY90u+L60CxeqYYn5eOPvSvLo2yduOlTSjR+NdIh/FbyL9rCprhVUY7jPC0n1TYBDbgj7mbbt8Wuhs5vRHS0GiREjhU5D5ZHAA95S0Q97MMTQFn0vgqf8/VhS/lsyhLF4QqT8Tfu67Sr4u2DjEOTdT08p3TpZLrw/gF/ALLOKVMHYBpl3E6QC8COBk59yaVjh2AzQLU0wd18AvIbcwIHjOdM69g2St1Vx+Q7sp8ItCViMsT6sj0E8XpTh42q6S/xc4526O6QpZLEvyNgCHGtx0McqLAN4GYCnQxeYWxiTtRD8caYcqVft/IGlTpl+1anpCm4rAropHRxVoXT87CHOplLk6Bxet7yl59U3kr9772Tl5dlR/iqWlDxdrIE75olbgm5q2GwIpA/87ylybgRdJbs78NkuJe7qkXymEbPVbJelPLkrsDupmzb4yP2X2tb6kD8tuqN8XKEPzv87Uq1XdV8t1Fo3vkMhbaWsn3pChmXqD5HbstKvKoP1vMwyJtf+fLTKpPOQ6kYMnhzQDZcR3m+XfKViisDXz7btvtYsPfd9cI6YDydzTZV3WrCwGZ3ET+hlDNkqoeVzcLr62AJXeK6JMVRCeoO+S5M7R1+dChLnyfREhsEGlpAZ0ChZfhplLeWZfoU6vBIUnfTAI2FsM7dqp+3HyfS7zGKzA2dG3agWWktyW7VoBBu3fgd6U2PCnFnKCpG3axhgkfxZ934rglLK3le+7FgLDlPVJXiNlNNN8fV8neYvNo0BZWu8Tu6x3bnkMVmBDks8xbQW+ZPGJIS/zmniOnwIwBsFb1c0QZgH4Nb0nXHR58+8KpoMpawyAPVvgWggE1zrJkQCmwW84YXs0zXBxAH7IsFNYO3CgolAgrfYqHgWwkC16GsKjmnPuDQCXINANgicBfJLkGAADhZSIwTxuSPJ5prX/NElTxBNWrduR3gm0+bXSPJL8StGyCuAwhn6uPdna7NNo0zySo9hGc8TgwD0Q0a5Inf+9DfpqOZtwsC+gZX4wzk/rkZJmDeYcA78pgvYtVfsXwGu/g2x30gxE6xz8uvinEPq8LT+V6/5y7Wj9PIPmj4HX/MPgNT/u56dAy7zKObcCvv/dEneGreK2ge+PA8Ush6a5XbNq9YGxAosBXI6sFdA8Pir/69F3SeRVW25idlpXxxrJ0B5+P8qrGaiVeJWy/p9t+gHMav4fJL8imq/l6yTM8Ta/AuWqA32k5NVO+7+IYTVQOwtONF6zyuCuvzXMiSnEAQbVlh0AvAthixPd4WIlgKuEEe1opErbHXItwkgtYyyAt6TwbVpgqMtoeM0/BMU1HwiWb7pz7ln6aFzROiue+yk6BcsDgEedc6+yRftvQdLVnHPz4DenUtqplR4B4P0RboNvzP3R8Hvl6P43mtkM59zTUlgh5ERYlAD3wO/T04fiRKkhNANF29885rfjR2hZP27jGwWlzUFRXs1A6fEHuXbq9F4e3Ws+J7BVs21MZjzkq9eOI3MMXZb7Ja92giK/kDxahjVNHUaTvD3KpygobhrrKNz0MOtE61y+Ik6vlnlw0brmlLsxs3MImzYDdscL1ZqtETTOmv+/AbhFnneys5Wa0BlyX8SCKH770A8qtRp80TqMAnAjfDPWruZb3K50zq1u83sVlp0RBsBaCZBub/cSgD9FOBQr1A+89clWdDeZPGwz8B553hAua2b0/zsAjEYw/8rsGdI2FfKEE6DfqIdb1CsmgPEAxkslk99FzJ8GP0q2Bu0zXwX+DQA/k2ctmWGshOJ3gPwvoiya//3OuaVd0Fi7qdP1ProeKdcGTilivjsn8+mSeacROa3kwwCWIDC3yHfrIThUqUEn29WbDs/8dhw+Cxr0utE59wIL7uVnGKbXKW2Uqd/cqdm18a0F3Y72bgDLEHwta0k3MV3zDDEHRLtS5r8f3gLY3TDbAtVe59zL8Js1omBeSpx4m1j/MjB/Y3jmH4LOzH4DVSnzR+a+HajT+0iKbxFLp2P5hfv/Kb9E6FBzzi1EtinROm0Bv/llAy91mDT0uz38vvowHzkAcwA8TR/g6GZDQyXGTK1HgW+0olMYebGinXX6OMHN8M1XN8zXiRWzAMyU+sb7BjeAg5d1WTruiED8ZqBpFqANxWjSRCiNtcut6ZRue2sWNrEiuSeADZCN/QPAPUKIbqdAKTK3ReU2A8VxdwBb6aEMQuwBkmPhxxn2R3fMt/hdJeXqaGdq3p5zzlHxiXCdCmAkwi6nzRhqabyyi/Y/hrvlGtM4E5uIBWBv+9LAfSUgBITKPgi/o3aReIAdGJosz9YTzd8Mfq/+spjfB++Jf8851++cW+Wcqyd+mWlW9r9033YHsFDyWoNizYD2/7sd9VQaPwY/tSz2A3aXpr4O81AroO2Dmn/V+FlRuo7A+AGL4J1Bi3Az0D2CjxDNWy2a/1sA+6B75gOhuXsWwDH0w7hHktyHfiBrR5IT5LcN/ahiXL9+59yAc+5c59y2ACYA2A3Bn0jVtQ/e4t7VJE1hME30AqmLrRsAvBnAOOWFEk0/2inOD/4snXllICeg0jcDwOEoLlQ1AK8K4lsDuAHenJXBfM0f8N77r6J3sR+wEsBrJJfKvRK4H8CT8GcOjQbwe+fctSRvB3AGQmRTQe/nAXiqBB/LIxOaxyfhN7RW/Ch4bQ/gVQDORpDG0Q+8kNkhxcfyCuoQOR0oOTiKgOWBRvG+Lt+NJflg9K5M0KiZLrToFBbRT4XbmH5KWLywkwz4X25pUwKNdfDtkqgcjeg2FvDYrdjHALB78apmzpXEZc3MVQmfBa8pzeIBqt1fd86dQ9/m/w7lmf0U6NTsPmSbyPhXT/x0CvtT8Kb/SXhLtTOy7bAtC2jPKW4H/hzdK5130AdWAN4KQMOtdgBnoUnbNRg/YAmA++VxKtCiDL7QOXcu/RDpTfAmuirm54FL/GrRT4+jmwfgCHgTezuAdyKce2BBfaxVCB572YdHLDL4W2h09a0AbGAQs7AQ5UPcV41BY9cXiuaPhQ/vTsXQM78IaPxgAbxfMx++d6JxiZRpV0v4BIDnyFLPG9S8H0c4YCM+OwlAlpCb52T2VElIWbBDn7a3AQRiXibM3xDA9fDMXwk5ly8n3zwTakPYZZtZJfAyAP/gnHuaftewVkEppcFd0qVtVq9OIbYoWvc99P0I83BihJhCFatyVEL/AuB5eK/UHrj0GIAvkBwH39XTuPqgrtdaBm0uVwM43jn3IMmfwB9rl1peZkHpfnuTNIWgifXQ5WcxDzfUP1Y6Y83Q+yVaTjdIZjIOQ5fLSd4FfzKYnc06S87TIYCvwbeTI+EPbdoW3lm15/htAH+y2NYANjb467ut5f2AvC/DCijz+wG83zn3O5LfAfAxtB6IUqu3DKH977j7l2C+3r8Ev05wB2T5F8piWL/27ajLoJMYDpT3XXdRmJ2Vql0Vu9uITl5YRr/72Lhuy5QyNia5JcnDGTZ46gZ0osVqkkdJGTtF75qBdsdmyreVLYUn+ReDl5Z7j5ZbxJlapXl1i0w0sGKHQLUdBbxWjQZwHYDFJG25L8M7pa8B+DC8T6CaTqRxpPQ4lpA8FcGH6JTodnDlWOfcdGHgRINDq7zjOZKN0OxQQxEBiMcLSgEzxv4UfNdpZ2S7oET2wEgA2BThqLbznXOz2GK8nmEp2AQAH8Rgp7MdIEIP5VRh/ijnnG7fWnTKu9J0hsl3rYCV1Lx2ZHRVhQvz1mBwO2hnI8fBl1VynWLSNgMNr/4TfJxDRzrbRheB+Wc5566hbz5Xy/t9C+KjFmIRgIfk2Vo7M9AKQKwVKgBbybXs7pPN849N3sfBF43Q6ZlCudojml8nuQWAT6Bz7bfM/4pz7hJKt01i7qPgI3+2TnnQGBF1zi1imENQGjCE9zcDsGUCr0Z5Ngz7tzgfuXYyraooKDHuRCBwK2LY6U01eAbnEV3H1j+I0AvoRJAt889nOPFUcdkVvnfSTvv/e7lW4QBqHTeFX1cRQ6Ppt4XroE9MoLKDEw0wI19/RRhxLDI/APDDmtsLgwcxVYRigH5twFkoxpwU6MTS8yLmW1z2RbEJoBaHGeZZVRDjo2U9I1cXD02mID4ft1QwTlzR/rBOCxsJYC95llzjKMJxPML0rHYFQIM5lzjnvkpz/LuiL9fkfMUEqAA8D78CGM0c2BJga2Sn9ik8I9eabQIWIT2HbbsKEYQpr52ImOJ8cJM0dWkiPoPOtEyZf71z7ixlvrbXxr9w8KOTQDEHEADulZ5DVbuMqaBPQHZqv8IKm1CRmoPQP7YSs41cC3uqTdrkFDTmxKG4H9CYKJrCjWEd32Hw5tnGGYqARvKmAThFGDUQO2tyvwXC6FrR9l+FvQrH2kJqgg9gZnhZAVgKHzoEsgKwC9ucqdKOV2vynQsvhFp+M1BC70ZyrJ3nHsGni+JhQAdwpsHH91fKNK+8MZK9EELTzRhqeyDa66m6+7dLdK/NQWMmU01ntTq/y8QCfYFQme0hXYmqQpbiWNVRfF6cVmQcQvdLp7j3wZvm3eGXQrWj/cr8mwCc4JxbRX+0XWpvoHgibSuclaZzAcwGMsJfNqjJj6f41+DrOFtx0gopgZ6IkK3DS7fNqEpoZ2asVvKA6BsdGfs0vBkvSmRl/i0QzSd5JoALABwnaVKBs6IOoOJxl/ObPFYyp4Fhg86Yb3aASCeKDNLoh6N7RXqyyagKaBAHPrJWdPk4EASAoqEDJLdBe2FfZf6jAE4S5p8G4FLB7TT6WcADDGsCBiQSqGPrRa3jba2TdAU2NrElgjIrPWc7597QAFQ8LfwRZPuqyvCDonRlgzZDzyDEI4r6AXuRXF+6U9r1+xT8sG+RwI86ns/AT+h4neRJAK5A2L52ZwCHSt59Js8JCPPrWgmAdiG7Hv5tATY2AQQaKD1VycPSMIPMX+DNQ9wTmEJyPZH60q2AISzgrYDG/ZuB4j4eYQeRfgn8nIZigR+dffQMgCOcc3NJngi/KjieG3m6XG2+eyAwthlY+s5jdtOMskHzfXv0XPl2n01XAzITNf8GbwWALAEmwK92aXxTAdgQqcb9W4EuYd8baAjSh+FjF60CP5b5hzvn5gjzr5H3Ov6gzdGRJN8klsYuAbe454EKwExx/Mpa/pUB0zSNhJ+SBmQX+a5GsABBAExCILuoUIMINfg+NVC9H3Af/EyZosvHAXHE6DeROBODI1+psvrgI3LvFs3/AALzYb5XGowC8JEon72jtHmgtNUNNqrSfi1nT4RZQJaOswHMT3brGRZsHGRmkNjZK3fI+ypnr2hX7t6o7DxQHB8X5+x9Bb7TGTurGI5g3YXZ42/yypkr2qWzjOxCmjzQd8vpndNSdj3NoZ/OsvqqlLnGXOsMp7cmB4PsBg4LEGapqARNJbmjBF2qEgLNt+g6+QbOYlLPLZBeNfo459y99IL/PPxgVF55OtCzE4B3yzf7ANgMxawNADzinNPdP6uyALrHwzFyr3jp9H/dOiYzHOxThomaK+DX2qsjpgTbAMCx8XclQxwqbVVOH3zM/hySE+Gbgryun23SjnPOTRNNcM655fCRP4195OFGAGeIH6ALaVuNlmqdNMhVVTBNBWt3+SkdtBl4EcADkjxdR2NCjhLTEe8S9jArPCqNYSLDpiRfa2Fe1bz9Ur5JnWNozXC/vDta0utkWG369pe0RdYqvofkzILp9f2RtrwKaKe8+0ZEBzX/P2lZPgMDRtPvE2wroG3ngazwsEQGP+AWKTevPVe8JtHPyM3bg9ieY3yq5L2eKc8e5vRoizLbBbv75zhL4wro5ui3tIvPJtC6qABmIpAZTZZmYISYxF/K47q5OngTWOUkhlRvJAbtmdzhnHsMwOeQHvbUtCMAnOucu5o+ntE4h0hjEOIVX9ekTAsskAbI+iivs6L2n2FXkb+DD1opfbS3Mx+Bns1jFgwauAezc9xVw5bQnyNQSVPAYJIPjLTIgkr3gfTL2pcybQHiQ6xbnWyyK8Neu2WAlv/VZuWXSLObpLx4f+f2TjoxBJmZk+Gg7kSJldFmaAz99udktp3Vs/LulXTnRLjFxP9aEVxNne+M6twNKN7vlLxLbzYZDpCawsGnuOueBG+zdSySqToUJ0TEUC1bRL/SptTjXGyl5PqbiJkWl2Poj6JZyMGbL+iO4BdofVrhaep8elROp6BW5BV2uNt5h7SyyloneaNNVzRTdYz0wKPUIQSN4+ErqJQy40xTGTI0SXMEv09E78nA/Gs1ryKEZ7AAW5BczOIHW+SB4nSD5Ful9u/DwTua6P8jLE3byVyZ8EnJyFqBAfpzbbZnBb6AYcZuTB+P+iF5P49Z4VTmTye5gRKojXJVm5p1KYuCfvtZS8+S6aT4TovoozR7kGZru3YzVyswKkFoLejKCivn6LX3KUPQOskFwlgN+8bM/y39mEDbJtcQ9L1RPTsBpdc+Nu8S6aO4HpHAtdFMdlW2KeTknELqJA/qqpD8stUCXS7lrZDrOfL8AWYDPKQwnx1aJQahH01yvuTZyUpitVjz6VcNldr+MxwOPYLknyI8lUcPdkqHuCA1IQ9GBWiBfxail3NadShbBeAfTXmv0e/Db3cYU+bfyqD5HVfalFvkQMk8UBr9WvKqSjk+F5Wn/+sk31FK2QxW4J2Jwgr1szssV/2ACfT7BZChS6dnEa+U6yMMnnZX/oip71Smt3YrAkqXpierdoifblU7nt5ZTZ0bfL2tSxmFKlH0sEXrEOqZt/uWWigyJvlhKWMz+qNs1zC0+c+S3K7MshlMbGxei4LSpb3+d0G85H8cKldhXUa/q2l5zjlDM7AV/Ri4DTjodTZ98KZ9jzO/XDV1VzOY0+sYJP45kjvL8zIFT8v9VymnnWZA6fFXBn+kbHp8PoGX/v+ypCm322kk76Qmhf9M0pSyophZr3wSya3pJ1ZUxnzJT5ufnRgOuywKSoufSh6lmH9DiwMYrG48ieVRVuCPWSRUAq9tIgSfljSlLysn+S0p42mSu1icKiir6KhkDJpORx67xs/gMpaDeyc62jlAUqfGVbPmkKFXMK4JIv0M/c+uhcCUuRV9CPpFhtOvKtsw0gj7R6R+qxg2WuqP/sf3KxisU7dOaY1eo0eSnJEQRlW88yzelQGzvQLthllTVKf3TieWgZBhxAVSxv72eVXA7Cbab7A9eEIY1y3znan/lRHDrSDcIUJSjelPIKZIfVkQsMexqkV4gcEL7ohZhgljSb7OxCHIVQKD6T2P/rzDu+knrN5HH4i6V57dSfIh+X8/yX+R7zo2xcx6/Bfl0LkudH4TK5yplYegCsHPm0jm890IgSHAWWzjxPIyYUg0KlGmoe9FCfra5vYwSVfVXgNNkazRd/1mJJAsSwg2ILmH/B/aSgYcGucE0XTrmtx3E4lMMT8+8FrpvFaUwiKrJnJzhskbqUGJ59mlT9ANUYcLWOEh+Z2EUtn79mb5VIi0mumJLYTgVZqJiWzDtLaTdriCtW4cfNKHglqC7+s3PUGbSAgWJoTARg3VbA2t09LDwGDyN2QY58hj/m8kbW8wX8FUYiLD6dW2EjZ8fJERml47/GHIgNn2fhLDtPQ8s/8bep+otHB7qVBACHSQhPRHuzdCuf/frAGzJv8U+tgJmbWcuiM5Sf6YkdPZkxAJQSuJfoXkyfG36zKI9qr1G0vyCkOX1Ixe0p9D0BiUW7s1KACmghsx20W0gypW0n9Bcgf5prJVR2sTaMy93B9NP2KotMijzdmSvrfa/FZghGAkycsSUq33WtlXKBMo9PthIe0tIMH4N4vAK+RZx0Ukj5dvhhfzFSwD6WcXr8iptJX4mSQPt3kMR4uQYPymJM9naOtTiziUDg+Q3E2+q3Kz7uqB2Zj2VJKPFSAASf6aMvBj8hrR61YhFlj6jSTOIvlMjsDH9z9imEi67vhEDM7hRlJJhZQ1sIJxI8m/Z9aaDN3IVwEQpo+IcNxCGP90VFfb1ttzfF6g36OokefaqU2FEGnGsQxz/mPtT2nJIyQ/S/JNUZ4N4g+VQDCMgwyySCQnk7yYoRucYrxdsk6Sv6KZ19grgl0JMNskbCzEslPN4wmYsUVYQh8QOZnklon8db58XxlCYZjdyDeRZkf6089ui3CNcY8ZP49ZrV93TH4rYNYaTGFY3qSCEFsAuwZA4XWSN5D8DP36uKTDxLDKqN1fUnjo593tS/IL9OsRljELrTR+Gcmv00xlzyuralirpkYqXdNDE+i3b/kSAHX+dJ8i3eTIPgMG7wU0B34fnIfg9z2eA+A559xqdAgiVOPhD9feA34Ltr3hN2KwoBsvxLjqBhWAP/DqCgAXO+fmSP5NTz2rGnqiraG0o7p3Hf2cwk/Bn8KtoGcZxBs263auKfNZh98IciH8Ue5r4AVjEQYf8ab3myFsALUr/HkJE5DeeEo3qmwloMsB/BzAfzjnZksd+wDUK95tpSX0hAAoxNpA8mAAZwA4Gn7XciBolRLd1qGO7BG0ZXrSzfLOE8T5AK4G8FOr8QBY4VbxbUFPCYBCTCSS4+HP/jkRwH5RctVC+2tkFf3ahVb56r5J1jqsgN+P5xoANzjnFqfq1CvQkwKgoI5iZBWmADgK/oTuvTDYNA8AjT0BU8xrCwW52oOqY4YD/gSOe+D3V7xRtV3wHQFv6nuK8Qo9LQAK4iPUorOHQT/N7GAAh8Jbhh2bZKNCVMQSqNDkNSH98Efe3g3gVvhDIJ6P8HXogTa+FQwLAbDQRBhGwTttkxG89fHwBzp2evztSgBvwB/zMh/egXwY/kyDuZa5ihd6WNtTMOwEQEG6kKqlTHWl6PcLGAe/fbyefvZWZE/SiGEu/N7BawA8DmCZc25RIp2NZfS8pufBsBWAGCKBAErURI1XIHQVCS90w5LpFtYZAUiBEYrYEWxWb5rrOsPoPPg/X9Cfgu9qdoYAAAAASUVORK5CYII=" alt="logo" className="w-7 h-7 object-contain shrink-0" />
            <div>
              <div className="font-bold text-[15px] leading-tight">電気工事ツール</div>
              <div className="text-[11px] text-slate-400">現場向けツール集</div>
            </div>
          </div>

          {/* カテゴリタブ */}
          <div className="p-3">
            <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-800 p-1">
              <button
                onClick={() => switchCategory("search")}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-colors ${
                  category === "search" ? "bg-blue-500 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Search size={15} /> 検索系
              </button>
              <button
                onClick={() => switchCategory("calc")}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-colors ${
                  category === "calc" ? "bg-amber-500 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Calculator size={15} /> 計算系
              </button>
            </div>
          </div>

          {/* ツール一覧 */}
          <nav className="flex-1 overflow-y-auto px-3 pb-3">
            <div className="flex flex-col gap-1">
              {TOOLS[category].map((t) => {
                const Icon = t.icon;
                const active = t.id === toolId;
                return (
                  <button
                    key={t.id}
                    onClick={() => { setToolId(t.id); setNavOpen(false); }}
                    className={`flex items-center gap-2.5 text-left rounded-lg px-3 py-2.5 transition-colors ${
                      active ? `${activeBg} ${accentText}` : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <Icon size={17} className="shrink-0" />
                    <span className="text-sm font-medium truncate">{t.name}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="p-3 border-t border-slate-800">
            <div className="flex gap-2 text-[11px] text-amber-300/80 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-2">
              <AlertTriangle size={13} className="shrink-0 mt-px" />
              <span>数値は参考値です。施工前に必ず規格・仕様をご確認ください。</span>
            </div>
          </div>
        </aside>

        {/* モバイル用オーバーレイ */}
        {navOpen && (
          <button
            className="md:hidden fixed inset-0 bg-black/50 z-10"
            onClick={() => setNavOpen(false)}
            aria-label="閉じる"
          />
        )}

        {/* ===== ドラッグで幅変更できるハンドル（PC/タブレットのみ） ===== */}
        <div
          onMouseDown={startDrag}
          onTouchStart={startDrag}
          className="no-print hidden md:flex w-3 shrink-0 cursor-col-resize items-center justify-center group"
          role="separator"
          aria-orientation="vertical"
          aria-label="ペイン幅を調整"
        >
          <div className="w-1 h-12 rounded-full bg-slate-700 group-hover:bg-blue-500 group-active:bg-blue-400 transition-colors" />
        </div>

        {/* ===== 右ペイン（独立ウインドウ・独立スクロール） ===== */}
        <main className="flex-1 min-w-0 rounded-xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/30 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-6">
            {currentTool && (
              <>
                <div className="flex items-center gap-2.5 mb-1">
                  <span className={`w-2 h-2 rounded-full ${accentBg}`} />
                  <span className="text-xs font-medium text-slate-400">{category === "search" ? "検索系" : "計算系"}</span>
                </div>
                <h2 className="text-xl font-bold mb-1">{currentTool.name}</h2>
                <p className="text-sm text-slate-400 mb-6">{currentTool.desc}</p>
                <currentTool.Comp />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
