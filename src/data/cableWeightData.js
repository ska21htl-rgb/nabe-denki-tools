// 【自動生成ファイル】直接編集しないこと
// 生成元：src/data-source/cableWeightData.csv （編集はこちらのCSVで行う）
// 再生成：node scripts/gen-data.js
// ラック重量計算ツール専用の1mあたりケーブル重量。線種(type)×心数(cores)×sqで管理。
// STANDARD_WIRE_SIZES（電気配線計算ツール用）とは別データ：重量は心数で大きく変わるため統合していない。
// weightKgPerMが空欄の行は未確認データ。想像値は入れないこと。
export const CABLE_WEIGHT_DATA = [
  { type: "CVT", cores: 3, sq: 8, weightKgPerM: 0.39 }, // フジクラ・ダイヤケーブル(カタログ値)
  { type: "CVT", cores: 3, sq: 14, weightKgPerM: 0.56 }, // フジクラ・ダイヤケーブル(カタログ値)
  { type: "CVT", cores: 3, sq: 22, weightKgPerM: 0.82 }, // フジクラ・ダイヤケーブル(カタログ値)
  { type: "CVT", cores: 3, sq: 38, weightKgPerM: 1.3 }, // フジクラ・ダイヤケーブル(カタログ値)
  { type: "CVT", cores: 3, sq: 60, weightKgPerM: 1.99 }, // フジクラ・ダイヤケーブル(カタログ値)
  { type: "CVT", cores: 3, sq: 100, weightKgPerM: 3.19 }, // フジクラ・ダイヤケーブル(カタログ値)
  { type: "CVT", cores: 3, sq: 150, weightKgPerM: 4.54 }, // フジクラ・ダイヤケーブル(カタログ値)
  { type: "CVT", cores: 3, sq: 200, weightKgPerM: 6.06 }, // フジクラ・ダイヤケーブル(カタログ値)
  { type: "CVT", cores: 3, sq: 250, weightKgPerM: 7.42 }, // フジクラ・ダイヤケーブル(カタログ値)
  { type: "CVT", cores: 3, sq: 325, weightKgPerM: 9.45 }, // フジクラ・ダイヤケーブル(カタログ値)
  { type: "CVT", cores: 3, sq: 400, weightKgPerM: 12.57 }, // フジクラ・ダイヤケーブル(カタログ値)
  { type: "CVT", cores: 3, sq: 500, weightKgPerM: 14.72 }, // フジクラ・ダイヤケーブル(カタログ値)
  { type: "CV", cores: 1, sq: 2, weightKgPerM: 0.055 }, // JIS C 3605（600V CV 単心）カタログ p.13 概算質量より算出
  { type: "CV", cores: 1, sq: 3.5, weightKgPerM: 0.075 }, // JIS C 3605（600V CV 単心）カタログ p.13 概算質量より算出
  { type: "CV", cores: 1, sq: 5.5, weightKgPerM: 0.105 }, // JIS C 3605（600V CV 単心）カタログ p.13 概算質量より算出
  { type: "CV", cores: 1, sq: 8, weightKgPerM: 0.13 }, // JIS C 3605（600V CV 単心）カタログ p.13 概算質量より算出
  { type: "CV", cores: 1, sq: 14, weightKgPerM: 0.185 }, // JIS C 3605（600V CV 単心）カタログ p.13 概算質量より算出
  { type: "CV", cores: 1, sq: 22, weightKgPerM: 0.27 }, // JIS C 3605（600V CV 単心）カタログ p.13 概算質量より算出
  { type: "CV", cores: 1, sq: 38, weightKgPerM: 0.425 }, // JIS C 3605（600V CV 単心）カタログ p.13 概算質量より算出
  { type: "CV", cores: 1, sq: 60, weightKgPerM: 0.65 }, // JIS C 3605（600V CV 単心）カタログ p.13 概算質量より算出
  { type: "CV", cores: 1, sq: 100, weightKgPerM: 1.05 }, // JIS C 3605（600V CV 単心）カタログ p.13 概算質量より算出
  { type: "CV", cores: 1, sq: 150, weightKgPerM: 1.53 }, // JIS C 3605（600V CV 単心）カタログ p.13 概算質量より算出
  { type: "CV", cores: 1, sq: 200, weightKgPerM: 2.02 }, // JIS C 3605（600V CV 単心）カタログ p.13 概算質量より算出
  { type: "CV", cores: 1, sq: 250, weightKgPerM: 2.48 }, // JIS C 3605（600V CV 単心）カタログ p.13 概算質量より算出
  { type: "CV", cores: 1, sq: 325, weightKgPerM: 3.19 }, // JIS C 3605（600V CV 単心）カタログ p.13 概算質量より算出
  { type: "CV", cores: 1, sq: 400, weightKgPerM: 4.11 }, // JIS C 3605（600V CV 単心）カタログ p.13 概算質量より算出
  { type: "CV", cores: 1, sq: 500, weightKgPerM: 5.14 }, // JIS C 3605（600V CV 単心）カタログ p.13 概算質量より算出
  { type: "CV", cores: 1, sq: 600, weightKgPerM: 6.11 }, // JIS C 3605（600V CV 単心）カタログ p.13 概算質量より算出
  { type: "CV", cores: 2, sq: 2, weightKgPerM: 0.11 }, // JIS C 3605（600V CV 2心）カタログ p.13 概算質量より算出
  { type: "CV", cores: 2, sq: 3.5, weightKgPerM: 0.155 }, // JIS C 3605（600V CV 2心）カタログ p.13 概算質量より算出
  { type: "CV", cores: 2, sq: 5.5, weightKgPerM: 0.22 }, // JIS C 3605（600V CV 2心）カタログ p.13 概算質量より算出
  { type: "CV", cores: 2, sq: 8, weightKgPerM: 0.275 }, // JIS C 3605（600V CV 2心）カタログ p.13 概算質量より算出
  { type: "CV", cores: 2, sq: 14, weightKgPerM: 0.395 }, // JIS C 3605（600V CV 2心）カタログ p.13 概算質量より算出
  { type: "CV", cores: 2, sq: 22, weightKgPerM: 0.595 }, // JIS C 3605（600V CV 2心）カタログ p.13 概算質量より算出
  { type: "CV", cores: 2, sq: 38, weightKgPerM: 0.95 }, // JIS C 3605（600V CV 2心）カタログ p.13 概算質量より算出
  { type: "CV", cores: 2, sq: 60, weightKgPerM: 1.48 }, // JIS C 3605（600V CV 2心）カタログ p.13 概算質量より算出
  { type: "CV", cores: 2, sq: 100, weightKgPerM: 2.42 }, // JIS C 3605（600V CV 2心）カタログ p.13 概算質量より算出
  { type: "CV", cores: 2, sq: 150, weightKgPerM: 3.45 }, // JIS C 3605（600V CV 2心）カタログ p.13 概算質量より算出
  { type: "CV", cores: 2, sq: 200, weightKgPerM: 4.59 }, // JIS C 3605（600V CV 2心）カタログ p.13 概算質量より算出
  { type: "CV", cores: 2, sq: 250, weightKgPerM: 5.59 }, // JIS C 3605（600V CV 2心）カタログ p.13 概算質量より算出
  { type: "CV", cores: 2, sq: 325, weightKgPerM: 7.18 }, // JIS C 3605（600V CV 2心）カタログ p.13 概算質量より算出
  { type: "CV", cores: 3, sq: 2, weightKgPerM: 0.135 }, // JIS C 3605（600V CV 3心）カタログ p.14 概算質量より算出
  { type: "CV", cores: 3, sq: 3.5, weightKgPerM: 0.19 }, // JIS C 3605（600V CV 3心）カタログ p.14 概算質量より算出
  { type: "CV", cores: 3, sq: 5.5, weightKgPerM: 0.275 }, // JIS C 3605（600V CV 3心）カタログ p.14 概算質量より算出
  { type: "CV", cores: 3, sq: 8, weightKgPerM: 0.355 }, // JIS C 3605（600V CV 3心）カタログ p.14 概算質量より算出
  { type: "CV", cores: 3, sq: 14, weightKgPerM: 0.53 }, // JIS C 3605（600V CV 3心）カタログ p.14 概算質量より算出
  { type: "CV", cores: 3, sq: 22, weightKgPerM: 0.805 }, // JIS C 3605（600V CV 3心）カタログ p.14 概算質量より算出
  { type: "CV", cores: 3, sq: 38, weightKgPerM: 1.31 }, // JIS C 3605（600V CV 3心）カタログ p.14 概算質量より算出
  { type: "CV", cores: 3, sq: 60, weightKgPerM: 2.05 }, // JIS C 3605（600V CV 3心）カタログ p.14 概算質量より算出
  { type: "CV", cores: 3, sq: 100, weightKgPerM: 3.36 }, // JIS C 3605（600V CV 3心）カタログ p.14 概算質量より算出
  { type: "CV", cores: 3, sq: 150, weightKgPerM: 4.93 }, // JIS C 3605（600V CV 3心）カタログ p.14 概算質量より算出
  { type: "CV", cores: 3, sq: 200, weightKgPerM: 6.55 }, // JIS C 3605（600V CV 3心）カタログ p.14 概算質量より算出
  { type: "CV", cores: 3, sq: 250, weightKgPerM: 8.02 }, // JIS C 3605（600V CV 3心）カタログ p.14 概算質量より算出
  { type: "CV", cores: 3, sq: 325, weightKgPerM: 10.26 }, // JIS C 3605（600V CV 3心）カタログ p.14 概算質量より算出
  { type: "CV", cores: 4, sq: 2, weightKgPerM: 0.165 }, // JIS C 3605（600V CV 4心）カタログ p.14 概算質量より算出
  { type: "CV", cores: 4, sq: 3.5, weightKgPerM: 0.235 }, // JIS C 3605（600V CV 4心）カタログ p.14 概算質量より算出
  { type: "CV", cores: 4, sq: 5.5, weightKgPerM: 0.35 }, // JIS C 3605（600V CV 4心）カタログ p.14 概算質量より算出
  { type: "CV", cores: 4, sq: 8, weightKgPerM: 0.45 }, // JIS C 3605（600V CV 4心）カタログ p.14 概算質量より算出
  { type: "CV", cores: 4, sq: 14, weightKgPerM: 0.68 }, // JIS C 3605（600V CV 4心）カタログ p.14 概算質量より算出
  { type: "CV", cores: 4, sq: 22, weightKgPerM: 1.05 }, // JIS C 3605（600V CV 4心）カタログ p.14 概算質量より算出
  { type: "CV", cores: 4, sq: 38, weightKgPerM: 1.71 }, // JIS C 3605（600V CV 4心）カタログ p.14 概算質量より算出
  { type: "CV", cores: 4, sq: 60, weightKgPerM: 2.68 }, // JIS C 3605（600V CV 4心）カタログ p.14 概算質量より算出
  { type: "CV", cores: 4, sq: 100, weightKgPerM: 4.41 }, // JIS C 3605（600V CV 4心）カタログ p.14 概算質量より算出
  { type: "CV", cores: 4, sq: 150, weightKgPerM: 6.47 }, // JIS C 3605（600V CV 4心）カタログ p.14 概算質量より算出
];

// 表示ラベル：CVTは3心が標準的な意味を持つため心数を省略（例「CVT 14sq」）、
// それ以外は心数を明記する（例「CV14sq-3C」）
export const cableWeightLabel = (item) =>
  item.type === "CVT" ? `CVT ${item.sq}sq` : `${item.type}${item.sq}sq-${item.cores}C`;
