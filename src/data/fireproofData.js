// 耐火処理工法 出典：日東化成工業「プラシールNF-12HM・NF-11TF ケーブル貫通部防火措置工法 総合カタログ」
// ※スイッチボックス・コンセントボックス貫通の工法（PS060WL-1159、0869等）は占積率が
// 「天井裏貫通部／PF管内／鋼製ボックス内」の3段階に分かれ単純な1数値で表せないため未収録（別途カタログ確認）
export const FIREPROOF_DATA = [
  // ---- 防火区画（国土交通大臣認定工法）／プラシールNF-12HM ----
  { category: "防火区画", putty: "NF-12HM", wall: "中空壁（45分準耐火）", methodNo: "PS045WL-0880", opening: "φ110mm以下",
    cableMax: "600V 導体断面積100mm²以下", conduitNote: "PF-36・CD-36 合計2本以下（CD管は1本まで）", limit: 43.2 },
  { category: "防火区画", putty: "NF-12HM", wall: "中空壁（鋼製電線管）", methodNo: "PS060WL-0575", opening: "φ123.4mm以下",
    cableMax: "600V 導体断面積200mm²以下", conduitNote: "鋼製電線管φ113.4mm以下、PF-28・CD-36合計1本以下", limit: 33.4 },
  { category: "防火区画", putty: "NF-12HM", wall: "中空壁（45分準耐火・鋼製電線管）", methodNo: "PS045WL-0880", opening: "φ123.4mm以下",
    cableMax: "600V 導体断面積200mm²以下", conduitNote: "鋼製電線管φ113.4mm以下、PF-36以下合計1本以下", limit: 35.8 },
  { category: "防火区画", putty: "NF-12HM", wall: "片壁", methodNo: "PS060WL-0898", opening: "φ110mm以下",
    cableMax: "600V 導体断面積100mm²以下", conduitNote: "PF-36・CD-36 合計2本以下（CD管は1本まで）", limit: 43.2 },
  // PS060WL-1161：旧・中空壁の番号だったが工法統合（→1316）に伴い番号が空き、
  // 日東化成工業の現行工法一覧ではALC・コンクリート壁（壁厚60mm以上）に再割当されている（2026年7月時点、公式サイトで確認）
  { category: "防火区画", putty: "NF-12HM", wall: "ALC・コンクリート壁（60mm以上）", methodNo: "PS060WL-1161", opening: "φ160mm以下 または 160×160mm以下",
    cableMax: "6600V 導体断面積325mm²以下", conduitNote: "PF-54・CD-54 本数制限なし", limit: 62.2 },
  { category: "防火区画", putty: "NF-12HM", wall: "ALC・コンクリート壁（75mm以上）", methodNo: "PS060WL-1158", opening: "φ216mm以下",
    cableMax: "6600V 導体断面積325mm²以下", conduitNote: "PF-54・CD-54・VE54・FEP-50以下 本数制限なし", limit: 50.6 },
  { category: "防火区画", putty: "NF-12HM", wall: "ALC・コンクリート壁（鋼製電線管）", methodNo: "PS060WL-0575", opening: "φ123.4mm以下",
    cableMax: "600V 導体断面積200mm²以下", conduitNote: "鋼製電線管φ113.4mm以下、PF-28・CD-36合計1本以下", limit: 33.4 },
  { category: "防火区画", putty: "NF-12HM", wall: "コンクリート床", methodNo: "PS060FL-1160", opening: "φ216mm以下",
    cableMax: "6600V 導体断面積325mm²以下", conduitNote: "PF-54・CD-54・VE54・FEP-50以下 本数制限なし", limit: 50.6 },
  { category: "防火区画", putty: "NF-12HM", wall: "ALC・コンクリート床", methodNo: "PS060FL-0585", opening: "φ210mm以下",
    cableMax: "600V 導体断面積325mm²以下", conduitNote: "PF-36・CD-42 合計4本以下", limit: 42.6 },
  { category: "防火区画", putty: "NF-12HM", wall: "ALC・コンクリート床（鋼製電線管）", methodNo: "PS060FL-0585", opening: "φ150mm以下",
    cableMax: "600V 導体断面積200mm²以下", conduitNote: "鋼製電線管φ113.4mm以下、PF-28・CD-36合計1本以下", limit: 33.4 },

  // ---- 防火区画（国土交通大臣認定工法）／プラシールNF-11TF ----
  { category: "防火区画", putty: "NF-11TF", wall: "中空壁", methodNo: "PS060WL-0574", opening: "φ110mm以下",
    cableMax: "600V 導体断面積100mm²以下", conduitNote: "PF-28・CD-36 合計2本以下", limit: 40.6 },
  { category: "防火区画", putty: "NF-11TF", wall: "中空壁（鋼製電線管）", methodNo: "PS060WL-0574", opening: "φ123.4mm以下",
    cableMax: "600V 導体断面積200mm²以下", conduitNote: "鋼製電線管φ113.4mm以下、PF-28・CD-36合計1本以下", limit: 33.4 },
  { category: "防火区画", putty: "NF-11TF", wall: "ALC・コンクリート壁", methodNo: "PS060WL-0583", opening: "φ210mm以下",
    cableMax: "600V 導体断面積325mm²以下", conduitNote: "PF-36・CD-42 合計4本以下", limit: 42.6 },
  { category: "防火区画", putty: "NF-11TF", wall: "ALC・コンクリート壁（鋼製電線管）", methodNo: "PS060WL-0574", opening: "φ123.4mm以下",
    cableMax: "600V 導体断面積200mm²以下", conduitNote: "鋼製電線管φ113.4mm以下、PF-28・CD-36合計1本以下", limit: 33.4 },
  { category: "防火区画", putty: "NF-11TF", wall: "ALC・コンクリート床", methodNo: "PS060FL-0584", opening: "φ210mm以下",
    cableMax: "600V 導体断面積325mm²以下", conduitNote: "PF-36・CD-42 合計4本以下", limit: 42.6 },
  { category: "防火区画", putty: "NF-11TF", wall: "ALC・コンクリート床（鋼製電線管）", methodNo: "PS060FL-0584", opening: "φ150mm以下",
    cableMax: "600V 導体断面積200mm²以下", conduitNote: "鋼製電線管φ113.4mm以下、PF-28・CD-36合計1本以下", limit: 33.4 },

  // ---- 共住区画（(一財)日本消防設備安全センター評定工法）／プラシールNF-12HM ----
  { category: "共住区画", putty: "NF-12HM", wall: "住戸内引き込み線", methodNo: "KK24-013号 WS-8工法", opening: "φ210mm以下",
    cableMax: "600V 導体断面積60mm²以下", conduitNote: "PF-36・CD-42 合計4本以下", limit: 28.2 },
  { category: "共住区画", putty: "NF-12HM", wall: "電気室等幹線", methodNo: "KK24-011号 WS-6工法", opening: "φ210mm以下",
    cableMax: "600V 導体断面積250mm²以下", conduitNote: "合成樹脂製電線管は不可／CV・CVTはNF-18(S)被覆が必要（100mm²以下は各1条のみ被覆不要）", limit: 25.3 },

  // ---- 共住区画（(一財)日本消防設備安全センター評定工法）／プラシールNF-11TF ----
  { category: "共住区画", putty: "NF-11TF", wall: "住戸内引き込み線", methodNo: "KK24-012号 WS-7工法", opening: "φ210mm以下",
    cableMax: "600V 導体断面積60mm²以下", conduitNote: "PF-36・CD-42 合計4本以下", limit: 28.2 },
  { category: "共住区画", putty: "NF-11TF", wall: "電気室等幹線", methodNo: "KK24-010号 WS-5工法", opening: "φ210mm以下",
    cableMax: "600V 導体断面積250mm²以下", conduitNote: "合成樹脂製電線管は不可／CV・CVTはNF-18(S)被覆が必要（100mm²以下は各1条のみ被覆不要）", limit: 25.3 },
];
