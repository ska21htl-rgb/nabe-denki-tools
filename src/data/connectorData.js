// 接続材（差込・T型コネクタ）選定：芯線サイズ範囲 → 適合サイズ 参考値
export const CONNECTOR_DATA = [
  { range: "1.6mm 単線 〜 2.0mm 単線", size: "小（1.6-2.0用）" },
  { range: "2.0mm 単線 〜 2.6mm 単線", size: "中（2.0-2.6用）" },
  { range: "2.6mm 単線 〜 5.5mm² より線", size: "大（2.6-5.5用）" },
  { range: "5.5mm² 〜 8mm² より線", size: "特大（5.5-8用）" },
];
