// 参考値：支持間隔（8種）
export const SUPPORT_INTERVAL_DATA = [
  { name: "金属管（電線管）", horizontal: "2.0m以下", vertical: "2.0m以下", note: "プルボックス等の端部より0.3m以内で支持" },
  { name: "合成樹脂管（PF・VE管）", horizontal: "1.5m以下", vertical: "1.5m以下", note: "管相互・ボックス接続部付近も支持" },
  { name: "CD管（コンクリート埋設）", horizontal: "—", vertical: "—", note: "埋設施工のため支持金物は原則不要" },
  { name: "金属可とう電線管（2種）", horizontal: "1.0m以下", vertical: "1.0m以下", note: "屈曲部の直近も支持" },
  { name: "ケーブル（一般・平形）", horizontal: "2.0m以下", vertical: "2.0m以下", note: "垂直は6m以下まで緩和される場合あり" },
  { name: "ケーブルラック", horizontal: "2.0m以下", vertical: "2.0m以下", note: "水平部は等間隔、屈曲部直近も支持" },
  { name: "がいし引き配線", horizontal: "2.0m以下", vertical: "2.0m以下", note: "電線相互の接近距離にも注意" },
  { name: "ライティングダクト", horizontal: "2.0m以下", vertical: "—", note: "端部・接続部より0.3m以内で支持" },
];
