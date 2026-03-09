import { useState, useCallback, useMemo } from "react";

// === DATA ===
const BLOCK = {
  cd: "E000000028",
  name: "重力式二層ろ過器(ポンプ移送)",
  rev: "7.00",
  status: "作成中",
  lastUpdate: "2023/11/02",
};

const LIST_TYPE_COLORS = {
  L201: { bg: "#EEF2FF", border: "#6366F1", text: "#4338CA", label: "製缶" },
  L002: { bg: "#EFF6FF", border: "#3B82F6", text: "#1D4ED8", label: "ポンプ" },
  L136: { bg: "#F0FDF4", border: "#22C55E", text: "#15803D", label: "ろ材" },
  L083: { bg: "#F0FDFA", border: "#14B8A6", text: "#0F766E", label: "ストレーナー" },
  L121: { bg: "#FFFBEB", border: "#F59E0B", text: "#B45309", label: "流量計" },
  L122: { bg: "#FFFBEB", border: "#F59E0B", text: "#B45309", label: "圧力計" },
  L151: { bg: "#FEF2F2", border: "#EF4444", text: "#B91C1C", label: "自動弁" },
  L152: { bg: "#FFF7ED", border: "#F97316", text: "#C2410C", label: "手動弁" },
  L831: { bg: "#FAF5FF", border: "#A855F7", text: "#7E22CE", label: "計装品" },
};

const TANK_STEPS = [
  "φ1200",
  "φ1400",
  "φ1600",
  "φ1800",
  "φ2000",
  "φ2200",
  "φ2400",
  "φ2600",
  "φ2800",
  "φ3000",
  "φ3200",
  "φ3400",
  "φ3600",
  "φ3800",
  "φ4000",
  "φ4500",
  "φ5000",
  "φ5500",
  "φ6000",
  "φ6500",
  "φ7000",
];

const PIPE_MAP = {
  φ1200: "65A",
  φ1400: "80A",
  φ1600: "100A",
  φ1800: "100A",
  φ2000: "125A",
  φ2200: "125A",
  φ2400: "125A",
  φ2600: "150A",
  φ2800: "150A",
  φ3000: "150A",
  φ3200: "150A",
  φ3400: "150A",
  φ3600: "200A",
  φ3800: "200A",
  φ4000: "200A",
  φ4500: "200A",
  φ5000: "250A",
  φ5500: "250A",
  φ6000: "300A",
  φ6500: "300A",
  φ7000: "300A",
};

const ITEMS = [
  {
    cd: "0100",
    name: "重力式二層ろ過器",
    kiki: "T-GFP01",
    lt: "L201",
    main: true,
    group: "構造物",
    maker: "栗田工業",
    model: "SS400",
    exclude: false,
  },
  {
    cd: "0200",
    name: "梯子・手摺・踊場",
    kiki: "",
    lt: "L201",
    main: false,
    group: "構造物",
    maker: "",
    model: "",
    exclude: false,
  },
  {
    cd: "0210",
    name: "共通歩廊・階段",
    kiki: "",
    lt: "L201",
    main: false,
    group: "構造物",
    maker: "",
    model: "",
    exclude: false,
  },
  {
    cd: "0220",
    name: "ろ過ポンプ",
    kiki: "P-GFP01",
    lt: "L002",
    main: false,
    group: "回転機",
    maker: "酉島製作所",
    model: "横型渦巻",
    exclude: false,
  },
  {
    cd: "0300",
    name: "アンスラサイト",
    kiki: "",
    lt: "L136",
    main: false,
    group: "ろ材",
    maker: "",
    model: "",
    exclude: false,
  },
  {
    cd: "0400",
    name: "砂",
    kiki: "",
    lt: "L136",
    main: false,
    group: "ろ材",
    maker: "",
    model: "",
    exclude: false,
  },
  {
    cd: "0500",
    name: "砂利1",
    kiki: "",
    lt: "L136",
    main: false,
    group: "ろ材",
    maker: "",
    model: "",
    exclude: false,
  },
  {
    cd: "0600",
    name: "BFストレーナー",
    kiki: "",
    lt: "L083",
    main: false,
    group: "内蔵品",
    maker: "",
    model: "",
    exclude: false,
  },
  {
    cd: "0700",
    name: "GFストレーナー",
    kiki: "",
    lt: "L083",
    main: false,
    group: "内蔵品",
    maker: "",
    model: "",
    exclude: false,
  },
  {
    cd: "0800",
    name: "逆洗水入口流量計",
    kiki: "FI-GFP01",
    lt: "L121",
    main: false,
    group: "計装品",
    maker: "",
    model: "",
    exclude: false,
  },
  {
    cd: "0850",
    name: "ポンプ出口圧力計",
    kiki: "PI-GFP01",
    lt: "L122",
    main: false,
    group: "計装品",
    maker: "",
    model: "",
    exclude: false,
  },
  {
    cd: "0900",
    name: "原水入口自動弁",
    kiki: "FV-GFP01",
    lt: "L151",
    main: false,
    group: "自動弁",
    maker: "巴",
    model: "700Z-7E(C)",
    exclude: false,
  },
  {
    cd: "1000",
    name: "逆洗水入口自動弁",
    kiki: "FV-GFP02",
    lt: "L151",
    main: false,
    group: "自動弁",
    maker: "巴",
    model: "700Z-7E(C)",
    exclude: false,
  },
  {
    cd: "1100",
    name: "逆洗排水出口自動弁",
    kiki: "FV-GFP03",
    lt: "L151",
    main: false,
    group: "自動弁",
    maker: "巴",
    model: "700Z-7E(C)",
    exclude: false,
  },
  {
    cd: "1200",
    name: "洗浄排水水抜自動弁",
    kiki: "FV-GFP04",
    lt: "L151",
    main: false,
    group: "自動弁",
    maker: "巴",
    model: "700Z-7E(C)",
    exclude: false,
  },
  {
    cd: "1330",
    name: "処理水出口自動弁",
    kiki: "FV-GFP05",
    lt: "L151",
    main: false,
    group: "自動弁",
    maker: "巴",
    model: "700Z-7E(C)",
    exclude: false,
  },
  {
    cd: "5000",
    name: "原水入口サンプリング弁",
    kiki: "V-GFP01",
    lt: "L152",
    main: false,
    group: "手動弁",
    maker: "",
    model: "",
    exclude: false,
  },
  {
    cd: "5100",
    name: "処理水出口サンプリング弁",
    kiki: "V-GFP02",
    lt: "L152",
    main: false,
    group: "手動弁",
    maker: "",
    model: "",
    exclude: false,
  },
  {
    cd: "5500",
    name: "ドレン弁",
    kiki: "V-GFP04",
    lt: "L152",
    main: false,
    group: "手動弁",
    maker: "",
    model: "",
    exclude: false,
  },
  {
    cd: "5800",
    name: "ポンプ出口逆止弁",
    kiki: "V-GFP14",
    lt: "L152",
    main: false,
    group: "手動弁",
    maker: "",
    model: "",
    exclude: false,
  },
  {
    cd: "8000",
    name: "差圧発信機",
    kiki: "",
    lt: "L831",
    main: false,
    group: "計装品",
    maker: "",
    model: "",
    exclude: true,
  },
  {
    cd: "8100",
    name: "液面計",
    kiki: "LICA-GFP01",
    lt: "L831",
    main: false,
    group: "計装品",
    maker: "ノーケン",
    model: "XPS10XG",
    exclude: false,
  },
  {
    cd: "8200",
    name: "処理水出口調節弁",
    kiki: "FCV-GFP01",
    lt: "L831",
    main: false,
    group: "計装品",
    maker: "巴",
    model: "508V-7G",
    exclude: false,
  },
  {
    cd: "8300",
    name: "処理水流量計",
    kiki: "FIC-GFP01",
    lt: "L831",
    main: false,
    group: "計装品",
    maker: "",
    model: "",
    exclude: false,
  },
  {
    cd: "8400",
    name: "ポンプ入口圧力スイッチ",
    kiki: "PS-GFP01",
    lt: "L831",
    main: false,
    group: "計装品",
    maker: "",
    model: "",
    exclude: false,
  },
];

// Schematic node positions for the flow diagram
const SCHEMATIC_NODES = [
  { cd: "0100", x: 50, y: 42, w: 14, h: 20, shape: "rect" },
  { cd: "0220", x: 14, y: 50, w: 8, h: 8, shape: "circle" },
  { cd: "0800", x: 30, y: 22, w: 6, h: 6, shape: "diamond" },
  { cd: "0850", x: 22, y: 60, w: 5, h: 5, shape: "diamond" },
  { cd: "0900", x: 30, y: 42, w: 5, h: 5, shape: "valve" },
  { cd: "1000", x: 50, y: 14, w: 5, h: 5, shape: "valve" },
  { cd: "1100", x: 72, y: 14, w: 5, h: 5, shape: "valve" },
  { cd: "1330", x: 72, y: 42, w: 5, h: 5, shape: "valve" },
  { cd: "5000", x: 22, y: 35, w: 4, h: 4, shape: "small" },
  { cd: "5100", x: 82, y: 35, w: 4, h: 4, shape: "small" },
  { cd: "8100", x: 64, y: 55, w: 5, h: 5, shape: "diamond" },
  { cd: "8200", x: 82, y: 50, w: 5, h: 5, shape: "valve" },
  { cd: "8300", x: 88, y: 42, w: 5, h: 5, shape: "diamond" },
  { cd: "8400", x: 8, y: 42, w: 5, h: 5, shape: "diamond" },
  { cd: "0600", x: 44, y: 58, w: 6, h: 4, shape: "rect" },
  { cd: "0700", x: 56, y: 58, w: 6, h: 4, shape: "rect" },
  { cd: "0300", x: 46, y: 45, w: 4, h: 6, shape: "fill" },
  { cd: "0400", x: 54, y: 45, w: 4, h: 6, shape: "fill" },
];

const SCHEMATIC_PIPES = [
  { from: [8, 45], to: [14, 50] },
  {
    from: [18, 50],
    to: [22, 50],
    points: [
      [22, 50],
      [22, 42],
      [30, 42],
    ],
  },
  { from: [35, 42], to: [43, 42] },
  { from: [64, 42], to: [72, 42] },
  { from: [77, 42], to: [82, 50] },
  { from: [82, 50], to: [88, 42] },
  { from: [50, 32], to: [50, 14] },
  { from: [50, 14], to: [50, 14] },
  { from: [55, 14], to: [72, 14] },
  { from: [50, 62], to: [50, 72] },
  { from: [72, 14], to: [72, 14] },
  { from: [77, 14], to: [92, 14] },
];

// === COMPONENTS ===

const Badge = ({ color, children }) => (
  <span
    style={{
      display: "inline-block",
      padding: "1px 7px",
      borderRadius: 4,
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: 0.3,
      background: color.bg,
      color: color.text,
      border: `1px solid ${color.border}`,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </span>
);

const StatusBadge = ({ status }) => {
  const map = {
    作成中: { bg: "#FEF3C7", color: "#92400E", border: "#FCD34D" },
    公開: { bg: "#D1FAE5", color: "#065F46", border: "#6EE7B7" },
  };
  const s = map[status] || map["作成中"];
  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 600,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      {status}
    </span>
  );
};

// Tree Node
const TreeNode = ({ item, selected, onSelect, currentStep, showExcluded }) => {
  if (item.exclude && !showExcluded) return null;
  const ltc = LIST_TYPE_COLORS[item.lt] || LIST_TYPE_COLORS.L201;
  const isSelected = selected === item.cd;
  const pipeSize =
    item.lt === "L151" || item.lt === "L152" || item.cd === "0100" ? PIPE_MAP[currentStep] : null;

  return (
    <div
      onClick={() => onSelect(item.cd)}
      style={{
        padding: "6px 10px",
        margin: "1px 0",
        borderRadius: 6,
        cursor: "pointer",
        background: isSelected ? `${ltc.bg}` : "transparent",
        borderLeft: isSelected ? `3px solid ${ltc.border}` : "3px solid transparent",
        opacity: item.exclude ? 0.4 : 1,
        textDecoration: item.exclude ? "line-through" : "none",
        transition: "all 0.15s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {item.main && <span style={{ fontSize: 11 }}>★</span>}
        <Badge color={ltc}>{ltc.label}</Badge>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#1E293B",
            fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
          }}
        >
          {item.kiki || "—"}
        </span>
      </div>
      <div
        style={{ fontSize: 12, color: "#475569", marginTop: 2, paddingLeft: item.main ? 20 : 0 }}
      >
        {item.name}
        {pipeSize && (
          <span style={{ marginLeft: 6, fontSize: 10, color: ltc.text, fontWeight: 600 }}>
            {pipeSize}
          </span>
        )}
      </div>
    </div>
  );
};

// Schematic View
const SchematicView = ({ selectedCd, onSelect, currentStep }) => {
  const pipeSize = PIPE_MAP[currentStep];
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "#FAFBFC",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {/* Title bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          padding: "8px 14px",
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid #E2E8F0",
          zIndex: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, color: "#334155", letterSpacing: 0.5 }}>
          ブロックフロー
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <span
            style={{
              fontSize: 10,
              padding: "2px 8px",
              borderRadius: 4,
              background: "#EEF2FF",
              color: "#4338CA",
              fontWeight: 600,
            }}
          >
            {currentStep} × H3500
          </span>
          <span
            style={{
              fontSize: 10,
              padding: "2px 8px",
              borderRadius: 4,
              background: "#F0FDF4",
              color: "#15803D",
              fontWeight: 600,
            }}
          >
            配管 {pipeSize}
          </span>
        </div>
      </div>

      <svg viewBox="0 0 100 80" style={{ width: "100%", height: "100%", marginTop: 10 }}>
        {/* Grid */}
        <defs>
          <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#E2E8F0" strokeWidth="0.15" />
          </pattern>
        </defs>
        <rect width="100" height="80" fill="url(#grid)" />

        {/* Pipes */}
        <line x1="8" y1="45" x2="14" y2="50" stroke="#94A3B8" strokeWidth="0.4" />
        <polyline points="18,50 22,50 22,42 30,42" fill="none" stroke="#94A3B8" strokeWidth="0.4" />
        <line x1="35" y1="42" x2="43" y2="42" stroke="#94A3B8" strokeWidth="0.4" />
        <line x1="64" y1="42" x2="72" y2="42" stroke="#94A3B8" strokeWidth="0.4" />
        <line x1="77" y1="42" x2="82" y2="50" stroke="#94A3B8" strokeWidth="0.4" />
        <line x1="87" y1="50" x2="88" y2="42" stroke="#94A3B8" strokeWidth="0.4" />
        <line x1="50" y1="32" x2="50" y2="19" stroke="#94A3B8" strokeWidth="0.4" />
        <line x1="50" y1="14" x2="72" y2="14" stroke="#94A3B8" strokeWidth="0.4" />
        <line x1="77" y1="14" x2="94" y2="14" stroke="#94A3B8" strokeWidth="0.4" />
        <line x1="50" y1="62" x2="50" y2="74" stroke="#94A3B8" strokeWidth="0.4" />
        <line
          x1="22"
          y1="60"
          x2="22"
          y2="65"
          stroke="#94A3B8"
          strokeWidth="0.3"
          strokeDasharray="0.8"
        />
        <line x1="64" y1="55" x2="64" y2="62" stroke="#94A3B8" strokeWidth="0.3" />

        {/* Nodes */}
        {SCHEMATIC_NODES.map((n) => {
          const item = ITEMS.find((i) => i.cd === n.cd);
          if (!item) return null;
          const ltc = LIST_TYPE_COLORS[item.lt];
          const isSel = selectedCd === n.cd;

          return (
            <g key={n.cd} onClick={() => onSelect(n.cd)} style={{ cursor: "pointer" }}>
              {/* Hit area */}
              <rect
                x={n.x - n.w / 2 - 1}
                y={n.y - n.h / 2 - 1}
                width={n.w + 2}
                height={n.h + 2}
                fill="transparent"
              />

              {/* Selection glow */}
              {isSel && (
                <rect
                  x={n.x - n.w / 2 - 1.5}
                  y={n.y - n.h / 2 - 1.5}
                  width={n.w + 3}
                  height={n.h + 3}
                  rx="1.5"
                  fill="none"
                  stroke={ltc.border}
                  strokeWidth="0.6"
                  opacity="0.6"
                >
                  <animate
                    attributeName="opacity"
                    values="0.6;1;0.6"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </rect>
              )}

              {/* Shape */}
              {n.shape === "rect" && (
                <rect
                  x={n.x - n.w / 2}
                  y={n.y - n.h / 2}
                  width={n.w}
                  height={n.h}
                  rx="1"
                  fill={isSel ? ltc.bg : "#fff"}
                  stroke={isSel ? ltc.border : "#CBD5E1"}
                  strokeWidth={isSel ? "0.5" : "0.3"}
                />
              )}
              {n.shape === "circle" && (
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={n.w / 2}
                  fill={isSel ? ltc.bg : "#fff"}
                  stroke={isSel ? ltc.border : "#CBD5E1"}
                  strokeWidth={isSel ? "0.5" : "0.3"}
                />
              )}
              {n.shape === "diamond" && (
                <polygon
                  points={`${n.x},${n.y - n.h / 2} ${n.x + n.w / 2},${n.y} ${n.x},${n.y + n.h / 2} ${n.x - n.w / 2},${n.y}`}
                  fill={isSel ? ltc.bg : "#fff"}
                  stroke={isSel ? ltc.border : "#CBD5E1"}
                  strokeWidth={isSel ? "0.5" : "0.3"}
                />
              )}
              {n.shape === "valve" && (
                <>
                  <polygon
                    points={`${n.x - n.w / 2},${n.y - n.h / 2} ${n.x + n.w / 2},${n.y} ${n.x - n.w / 2},${n.y + n.h / 2}`}
                    fill={isSel ? ltc.bg : "#fff"}
                    stroke={isSel ? ltc.border : "#CBD5E1"}
                    strokeWidth="0.3"
                  />
                  <polygon
                    points={`${n.x + n.w / 2},${n.y - n.h / 2} ${n.x - n.w / 2},${n.y} ${n.x + n.w / 2},${n.y + n.h / 2}`}
                    fill={isSel ? ltc.bg : "#fff"}
                    stroke={isSel ? ltc.border : "#CBD5E1"}
                    strokeWidth="0.3"
                  />
                </>
              )}
              {n.shape === "small" && (
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={1.5}
                  fill={isSel ? ltc.border : "#CBD5E1"}
                  stroke="none"
                />
              )}
              {n.shape === "fill" && (
                <rect
                  x={n.x - n.w / 2}
                  y={n.y - n.h / 2}
                  width={n.w}
                  height={n.h}
                  rx="0.5"
                  fill={isSel ? ltc.bg : "#F1F5F9"}
                  stroke={isSel ? ltc.border : "#CBD5E1"}
                  strokeWidth="0.2"
                  opacity="0.7"
                />
              )}

              {/* Label */}
              {item.kiki && n.shape !== "small" && n.shape !== "fill" && (
                <text
                  x={n.x}
                  y={n.y + n.h / 2 + 2.5}
                  textAnchor="middle"
                  fontSize="1.8"
                  fontWeight="600"
                  fill={isSel ? ltc.text : "#64748B"}
                  fontFamily="monospace"
                >
                  {item.kiki}
                </text>
              )}
            </g>
          );
        })}

        {/* Main equipment label */}
        <text
          x="50"
          y="42"
          textAnchor="middle"
          fontSize="2.2"
          fontWeight="700"
          fill="#4338CA"
          fontFamily="sans-serif"
        >
          重力式二層ろ過器
        </text>
        <text
          x="50"
          y="45"
          textAnchor="middle"
          fontSize="1.6"
          fill="#6366F1"
          fontFamily="monospace"
        >
          {currentStep}×H3500
        </text>

        {/* Dimension lines */}
        <text x="50" y="78" textAnchor="middle" fontSize="1.5" fill="#94A3B8">
          配管口径: {pipeSize} / 配管クラス: 1W1P
        </text>
      </svg>
    </div>
  );
};

// Detail Panel
const DetailPanel = ({ item, currentStep }) => {
  const [activeTab, setActiveTab] = useState("overview");
  if (!item)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "#94A3B8",
          fontSize: 13,
          padding: 20,
          textAlign: "center",
        }}
      >
        <div>
          <div style={{ fontSize: 28, marginBottom: 8 }}>←</div>
          左ペインのツリーまたは
          <br />
          中央の図面から
          <br />
          機器を選択してください
        </div>
      </div>
    );

  const ltc = LIST_TYPE_COLORS[item.lt] || LIST_TYPE_COLORS.L201;
  const pipeSize = PIPE_MAP[currentStep];
  const tabs = [
    { id: "overview", label: "概要" },
    { id: "tank", label: "タンクテーブル" },
    { id: "drawing", label: "図面" },
  ];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid #E2E8F0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          {item.main && <span style={{ fontSize: 14, color: "#F59E0B" }}>★</span>}
          <Badge color={ltc}>{ltc.label}</Badge>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#0F172A",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {item.kiki || "—"}
          </span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#1E293B" }}>{item.name}</div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #E2E8F0", padding: "0 12px" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: "8px 12px",
              fontSize: 11,
              fontWeight: 600,
              border: "none",
              background: "none",
              cursor: "pointer",
              color: activeTab === t.id ? ltc.text : "#94A3B8",
              borderBottom:
                activeTab === t.id ? `2px solid ${ltc.border}` : "2px solid transparent",
              transition: "all 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", padding: "12px 16px" }}>
        {activeTab === "overview" && (
          <div>
            <div
              style={{
                background: `${ltc.bg}`,
                borderRadius: 8,
                padding: "10px 14px",
                marginBottom: 14,
                border: `1px solid ${ltc.border}22`,
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 600, color: ltc.text, marginBottom: 4 }}>
                現在の設計条件
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>
                {currentStep} × H3500 / 1W1P
              </div>
            </div>

            {[
              ["原価項目コード", `${BLOCK.cd}-${item.cd}`],
              ["リストタイプ", `${item.lt} ${ltc.label}`],
              ["機器番号", item.kiki || "—"],
              ["主機器", item.main ? "はい" : "いいえ"],
              ["数量", "1"],
              ["増減タイプ", "a（系列比例）"],
              ["除外", item.exclude ? "はい" : "いいえ"],
            ].map(([k, v], i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  borderBottom: "1px solid #F1F5F9",
                  fontSize: 12,
                }}
              >
                <span style={{ color: "#64748B" }}>{k}</span>
                <span style={{ color: "#0F172A", fontWeight: 500 }}>{v}</span>
              </div>
            ))}

            {(item.maker || item.model) && (
              <div
                style={{
                  marginTop: 14,
                  padding: "10px 14px",
                  background: "#F8FAFC",
                  borderRadius: 8,
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 600, color: "#64748B", marginBottom: 6 }}>
                  仕様（{currentStep}条件）
                </div>
                {item.maker && (
                  <div style={{ fontSize: 12, color: "#0F172A" }}>
                    <span style={{ color: "#64748B" }}>メーカー: </span>
                    {item.maker}
                  </div>
                )}
                {item.model && (
                  <div style={{ fontSize: 12, color: "#0F172A", marginTop: 2 }}>
                    <span style={{ color: "#64748B" }}>型式: </span>
                    {item.model}
                  </div>
                )}
                {(item.lt === "L151" || item.lt === "L152") && (
                  <div style={{ fontSize: 12, color: "#0F172A", marginTop: 2 }}>
                    <span style={{ color: "#64748B" }}>口径: </span>
                    <span style={{ fontWeight: 700, color: ltc.text }}>{pipeSize}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "tank" && (
          <div>
            <div style={{ fontSize: 11, color: "#64748B", marginBottom: 10 }}>
              種別: 塔径×高さ / {TANK_STEPS.length}刻み
            </div>
            <div
              style={{
                fontSize: 11,
                borderRadius: 8,
                overflow: "hidden",
                border: "1px solid #E2E8F0",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 60px",
                  background: "#F8FAFC",
                  padding: "6px 10px",
                  fontWeight: 700,
                  color: "#475569",
                  borderBottom: "1px solid #E2E8F0",
                }}
              >
                <span>刻み</span>
                <span style={{ textAlign: "right" }}>口径</span>
              </div>
              {TANK_STEPS.map((step, i) => {
                const prev = i > 0 ? PIPE_MAP[TANK_STEPS[i - 1]] : null;
                const curr = PIPE_MAP[step];
                const changed = prev && prev !== curr;
                const isCurrent = step === currentStep;
                return (
                  <div
                    key={step}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 60px",
                      padding: "5px 10px",
                      background: isCurrent ? ltc.bg : i % 2 === 0 ? "#fff" : "#FAFBFC",
                      borderLeft: isCurrent ? `3px solid ${ltc.border}` : "3px solid transparent",
                      borderBottom: "1px solid #F1F5F9",
                      fontWeight: isCurrent ? 700 : 400,
                    }}
                  >
                    <span style={{ color: isCurrent ? ltc.text : "#334155" }}>{step}×H3500</span>
                    <span
                      style={{
                        textAlign: "right",
                        color: changed ? "#DC2626" : "#334155",
                        fontWeight: changed ? 700 : 400,
                      }}
                    >
                      {changed && "▲ "}
                      {curr}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "drawing" && (
          <div style={{ color: "#64748B", fontSize: 12 }}>
            <div style={{ padding: 16, background: "#F8FAFC", borderRadius: 8, marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 600, marginBottom: 8, color: "#475569" }}>
                標準図（{currentStep}条件）
              </div>
              {item.cd === "0100" ? (
                <>
                  <div>
                    図番:{" "}
                    <span style={{ fontWeight: 600, color: "#0F172A" }}>
                      S-GF-{currentStep.replace("φ", "0").slice(0, 4).padStart(4, "0")}-AD-01
                    </span>
                  </div>
                  <div style={{ marginTop: 4 }}>直胴部長さ: 3500mm</div>
                </>
              ) : (
                <div style={{ color: "#94A3B8" }}>個別図面なし</div>
              )}
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
              図面リンク
            </div>
            {["3D モデル", "3D CADWorx", "メーカー元図"].map((label, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 10px",
                  background: "#fff",
                  border: "1px solid #E2E8F0",
                  borderRadius: 6,
                  marginBottom: 4,
                }}
              >
                <span style={{ fontSize: 11 }}>{label}</span>
                <span
                  style={{
                    fontSize: 10,
                    color: item.cd === "0100" ? "#3B82F6" : "#CBD5E1",
                    cursor: item.cd === "0100" ? "pointer" : "default",
                  }}
                >
                  {item.cd === "0100" ? "開く →" : "未登録"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// === MAIN APP ===
export default function App() {
  const [selectedCd, setSelectedCd] = useState(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(3); // φ1800
  const [treeView, setTreeView] = useState("tree"); // tree | category | list
  const [showExcluded, setShowExcluded] = useState(true);
  const [leftCollapsed, setLeftCollapsed] = useState(false);

  const currentStep = TANK_STEPS[currentStepIdx];
  const selectedItem = ITEMS.find((i) => i.cd === selectedCd);

  const handleSelect = useCallback((cd) => {
    setSelectedCd(cd);
  }, []);

  const groupedItems = useMemo(() => {
    const groups = {};
    ITEMS.forEach((item) => {
      const g = treeView === "category" ? LIST_TYPE_COLORS[item.lt]?.label || "その他" : item.group;
      if (!groups[g]) groups[g] = [];
      groups[g].push(item);
    });
    return groups;
  }, [treeView]);

  const stats = useMemo(() => {
    const active = ITEMS.filter((i) => !i.exclude);
    const excluded = ITEMS.filter((i) => i.exclude);
    return { total: ITEMS.length, active: active.length, excluded: excluded.length };
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Noto Sans JP', 'Inter', system-ui, sans-serif",
        background: "#F1F5F9",
        color: "#0F172A",
      }}
    >
      {/* === GLOBAL HEADER === */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #E2E8F0",
          padding: "0 16px",
          flexShrink: 0,
        }}
      >
        {/* Top row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 44,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              EB
            </div>
            <span style={{ fontSize: 11, color: "#94A3B8" }}>ブロック一覧</span>
            <span style={{ color: "#CBD5E1" }}>/</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#1E293B" }}>{BLOCK.cd}</span>
            <span style={{ fontSize: 12, color: "#475569" }}>{BLOCK.name}</span>
            <StatusBadge status={BLOCK.status} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 10, color: "#94A3B8" }}>REV {BLOCK.rev}</span>
            <span style={{ fontSize: 10, color: "#94A3B8" }}>|</span>
            <span style={{ fontSize: 10, color: "#94A3B8" }}>更新 {BLOCK.lastUpdate}</span>
          </div>
        </div>

        {/* Context switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 8 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#F8FAFC",
              borderRadius: 6,
              padding: "4px 10px",
              border: "1px solid #E2E8F0",
            }}
          >
            <span style={{ fontSize: 10, color: "#64748B", fontWeight: 600, whiteSpace: "nowrap" }}>
              設計条件
            </span>
            <select
              value={currentStepIdx}
              onChange={(e) => setCurrentStepIdx(Number(e.target.value))}
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#4338CA",
                border: "none",
                background: "none",
                cursor: "pointer",
                outline: "none",
              }}
            >
              {TANK_STEPS.map((s, i) => (
                <option key={i} value={i}>
                  {s} × H3500
                </option>
              ))}
            </select>
          </div>
          <div style={{ fontSize: 11, color: "#64748B" }}>
            配管: <span style={{ fontWeight: 700, color: "#15803D" }}>{PIPE_MAP[currentStep]}</span>
            <span style={{ marginLeft: 8 }}>
              クラス: <span style={{ fontWeight: 600 }}>1W1P</span>
            </span>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", gap: 4 }}>
            {["Excel出力", "PDF添付", "T-BOM"].map((label) => (
              <button
                key={label}
                style={{
                  fontSize: 10,
                  padding: "3px 10px",
                  borderRadius: 4,
                  border: "1px solid #E2E8F0",
                  background: "#fff",
                  color: "#475569",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* === 3 PANE BODY === */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", gap: 1, background: "#E2E8F0" }}>
        {/* LEFT PANE */}
        <div
          style={{
            width: leftCollapsed ? 40 : 300,
            minWidth: leftCollapsed ? 40 : 260,
            background: "#fff",
            display: "flex",
            flexDirection: "column",
            transition: "width 0.2s ease",
          }}
        >
          {leftCollapsed ? (
            <div style={{ padding: "12px 8px", textAlign: "center" }}>
              <button
                onClick={() => setLeftCollapsed(false)}
                style={{
                  fontSize: 16,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748B",
                }}
              >
                ▶
              </button>
            </div>
          ) : (
            <>
              {/* View toggle */}
              <div
                style={{
                  padding: "8px 10px",
                  borderBottom: "1px solid #F1F5F9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", gap: 2 }}>
                  {[
                    { id: "tree", label: "ツリー" },
                    { id: "category", label: "種別" },
                  ].map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setTreeView(v.id)}
                      style={{
                        fontSize: 10,
                        padding: "3px 8px",
                        borderRadius: 4,
                        border: "none",
                        cursor: "pointer",
                        background: treeView === v.id ? "#EEF2FF" : "transparent",
                        color: treeView === v.id ? "#4338CA" : "#94A3B8",
                        fontWeight: 600,
                      }}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <label
                    style={{
                      fontSize: 10,
                      color: "#94A3B8",
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={showExcluded}
                      onChange={(e) => setShowExcluded(e.target.checked)}
                      style={{ width: 12, height: 12 }}
                    />
                    除外表示
                  </label>
                  <button
                    onClick={() => setLeftCollapsed(true)}
                    style={{
                      fontSize: 12,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#94A3B8",
                    }}
                  >
                    ◀
                  </button>
                </div>
              </div>

              {/* Tree content */}
              <div style={{ flex: 1, overflow: "auto", padding: "4px 6px" }}>
                {Object.entries(groupedItems).map(([group, items]) => (
                  <div key={group} style={{ marginBottom: 4 }}>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#94A3B8",
                        padding: "6px 10px 2px",
                        textTransform: "uppercase",
                        letterSpacing: 0.8,
                      }}
                    >
                      {group}
                      <span style={{ marginLeft: 6, fontWeight: 400 }}>
                        ({items.filter((i) => showExcluded || !i.exclude).length})
                      </span>
                    </div>
                    {items.map((item) => (
                      <TreeNode
                        key={item.cd}
                        item={item}
                        selected={selectedCd}
                        onSelect={handleSelect}
                        currentStep={currentStep}
                        showExcluded={showExcluded}
                      />
                    ))}
                  </div>
                ))}
              </div>

              {/* Stats footer */}
              <div
                style={{
                  padding: "6px 12px",
                  borderTop: "1px solid #F1F5F9",
                  fontSize: 10,
                  color: "#94A3B8",
                  display: "flex",
                  gap: 8,
                }}
              >
                <span>全{stats.total}件</span>
                <span>有効{stats.active}</span>
                <span>除外{stats.excluded}</span>
              </div>
            </>
          )}
        </div>

        {/* CENTER PANE */}
        <div style={{ flex: 1, minWidth: 300, background: "#fff" }}>
          <SchematicView
            selectedCd={selectedCd}
            onSelect={handleSelect}
            currentStep={currentStep}
          />
        </div>

        {/* RIGHT PANE */}
        <div style={{ width: 320, minWidth: 280, background: "#fff" }}>
          <DetailPanel item={selectedItem} currentStep={currentStep} />
        </div>
      </div>

      {/* === FOOTER === */}
      <div
        style={{
          background: "#fff",
          borderTop: "1px solid #E2E8F0",
          padding: "4px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          height: 28,
        }}
      >
        <div style={{ fontSize: 10, color: "#94A3B8", display: "flex", gap: 12 }}>
          <span>
            配管パターン: <span style={{ color: "#475569", fontWeight: 600 }}>{BLOCK.cd}P</span>
          </span>
          <span>
            口径: <span style={{ color: "#15803D", fontWeight: 600 }}>{PIPE_MAP[currentStep]}</span>
          </span>
          <span>
            クラス: <span style={{ color: "#475569", fontWeight: 600 }}>1W1P</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            style={{
              fontSize: 10,
              padding: "2px 12px",
              borderRadius: 4,
              border: "1px solid #E2E8F0",
              background: "#fff",
              color: "#475569",
              cursor: "pointer",
            }}
          >
            マトリクスビュー
          </button>
          <button
            style={{
              fontSize: 10,
              padding: "2px 12px",
              borderRadius: 4,
              border: "none",
              background: "#4338CA",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
