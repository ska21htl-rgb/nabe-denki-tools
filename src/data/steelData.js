// 鋼材種別ごとの基準強度F（鋼構造許容応力度設計規準）。SS400はft=fb=156.7/235, fs=90.45/135.68（N/mm²）
export const MATERIAL_GRADES = [
  { grade: "SS400", label: "SS400（一般構造用圧延鋼材・JIS G 3101、既定値）", F: 235 },
  { grade: "SM490", label: "SM490（溶接構造用圧延鋼材・JIS G 3106、高強度）", F: 325 },
];

export const STEEL_E = 205000; // N/mm²（ヤング係数、鋼材共通）

export const lambdaP = (F) => Math.PI * Math.sqrt(STEEL_E / (0.6 * F)); // Λ（限界細長比）
export const steelFt = (F) => ({ long: F / 1.5, short: F }); // 許容引張・曲げ応力度
export const steelFs = (F) => ({ long: F / (1.5 * Math.sqrt(3)), short: F / Math.sqrt(3) }); // 許容せん断応力度

// 許容圧縮応力度fc（座屈を考慮、λ=細長比）
export const steelFc = (lambda, F) => {
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
