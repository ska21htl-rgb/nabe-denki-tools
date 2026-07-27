// 電線の公称断面積 標準サイズ 出典：JIS C 3307（IV電線）/ 内線規程（IV・HIV・CV等の共通シリーズ）
// ※IEC 60228（欧州規格）の断面積シリーズとは異なるので注意
// 現場慣用の単位「sq」（スケア）で保持。小サイズ（2/3.5/5.5sq）はFケーブル/VVFの導体径(mm)表記も併記
export const STANDARD_WIRE_SIZES = [
  { sq: 0.9 },
  { sq: 1.25 },
  { sq: 2, mmPhi: 1.6 },
  { sq: 3.5, mmPhi: 2.0 },
  { sq: 5.5, mmPhi: 2.6 },
  { sq: 8 },
  { sq: 14 },
  { sq: 22 },
  { sq: 38 },
  { sq: 60 },
  { sq: 100 },
  { sq: 150 },
  { sq: 200 },
  { sq: 250 },
  { sq: 325 },
  { sq: 400 },
  { sq: 500 },
];

// 表示ラベル生成：小サイズは「2sq（1.6mm）」、それ以外は「14sq」の形式
export const wireSizeLabel = (item) => (item.mmPhi ? `${item.sq}sq（${item.mmPhi}mm）` : `${item.sq}sq`);
