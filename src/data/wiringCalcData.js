// 【自動生成ファイル】直接編集しないこと
// 生成元：src/data-source/standardWireSizes.csv （編集はこちらのCSVで行う）
// 再生成：node scripts/gen-data.js
// 電線の公称断面積 標準サイズ 出典：JIS C 3307（IV電線）/ 内線規程（IV・HIV・CV等の共通シリーズ）
// ※IEC 60228（欧州規格）の断面積シリーズとは異なるので注意
// 現場慣用の単位「sq」（スケア）で保持。小サイズ（2/3.5/5.5sq）はFケーブル/VVFの導体径(mm)表記も併記
// weightKgPerM：1mあたりの電線重量(kg/m)。未確認の値は空欄（=undefined）のまま。想像値は入れないこと
export const STANDARD_WIRE_SIZES = [
  { sq: 0.9 },
  { sq: 1.25 },
  { sq: 2, mmPhi: 1.6 },
  { sq: 3.5, mmPhi: 2 },
  { sq: 5.5, mmPhi: 2.6 },
  { sq: 8, weightKgPerM: 0.39 }, // 出典：フジクラ・ダイヤケーブル(カタログ値)
  { sq: 14, weightKgPerM: 0.56 }, // 出典：フジクラ・ダイヤケーブル(カタログ値)
  { sq: 22, weightKgPerM: 0.82 }, // 出典：フジクラ・ダイヤケーブル(カタログ値)
  { sq: 38, weightKgPerM: 1.3 }, // 出典：フジクラ・ダイヤケーブル(カタログ値)
  { sq: 60, weightKgPerM: 1.99 }, // 出典：フジクラ・ダイヤケーブル(カタログ値)
  { sq: 100, weightKgPerM: 3.19 }, // 出典：フジクラ・ダイヤケーブル(カタログ値)
  { sq: 150, weightKgPerM: 4.54 }, // 出典：フジクラ・ダイヤケーブル(カタログ値)
  { sq: 200, weightKgPerM: 6.06 }, // 出典：フジクラ・ダイヤケーブル(カタログ値)
  { sq: 250, weightKgPerM: 7.42 }, // 出典：フジクラ・ダイヤケーブル(カタログ値)
  { sq: 325, weightKgPerM: 9.45 }, // 出典：フジクラ・ダイヤケーブル(カタログ値)
  { sq: 400, weightKgPerM: 12.57 }, // 出典：フジクラ・ダイヤケーブル(カタログ値)
  { sq: 500, weightKgPerM: 14.72 }, // 出典：フジクラ・ダイヤケーブル(カタログ値)
];

// 表示ラベル生成：小サイズは「2sq（1.6mm）」、それ以外は「14sq」の形式
export const wireSizeLabel = (item) => (item.mmPhi ? `${item.sq}sq（${item.mmPhi}mm）` : `${item.sq}sq`);
