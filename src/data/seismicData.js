// 設備機器の設計用標準震度 Kh（出典：建築設備耐震設計・施工指針2014年版、日本建築センター）
export const SEISMIC_KH = {
  S: { top: 2.0, mid: 1.5, low: 1.0 },
  A: { top: 1.5, mid: 1.0, low: 0.6 },
  B: { top: 1.0, mid: 0.6, low: 0.4 },
};

export const FLOOR_LABEL = { top: "上層階・屋上・塔屋", mid: "中間階", low: "地階・1階" };
export const CLASS_LABEL = {
  S: "耐震クラスS（特に重要な設備）",
  A: "耐震クラスA（重要設備）",
  B: "耐震クラスB（一般設備）",
};

// ケーブルラック固有の耐震支持間隔（建築設備耐震設計・施工指針2014年版 指針表6.2-1相当。B種はA種と同値と仮定）
export const CABLE_RACK_SEISMIC_INTERVAL = {
  S: { top: 6, mid: 8, low: 8 },
  A: { top: 8, mid: 8, low: 12 },
  B: { top: 8, mid: 8, low: 12 },
};

export const recommendedInterval = (cls, floor) => CABLE_RACK_SEISMIC_INTERVAL[cls][floor];
