// ステンレス鋼ボルト A2-50 の許容耐力(kN)　出典：建築設備耐震設計・施工指針2014年版の計算式（有効断面積×降伏点）による算出値
export const ANCHOR_BOLT_DATA = [
  { size: "M10", Ta: 12.10, Qa: 7.00, sca: 0.580 },
  { size: "M12", Ta: 17.70, Qa: 10.20, sca: 0.843 },
  { size: "M16", Ta: 32.90, Qa: 19.00, sca: 1.570 },
  { size: "M20", Ta: 51.40, Qa: 29.60, sca: 2.450 },
];

// ステンレス鋼ボルトA2-50の短期許容応力度（建築設備耐震設計・施工指針2014年版「ステンレス鋼ボルトの検討式」準拠）
export const BOLT_FT_SHORT = 210; // N/mm²（許容引張応力度 Sσy）
export const BOLT_FS_SHORT = 121.2; // N/mm²（許容せん断応力度 Sfs）
