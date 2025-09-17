import { useEffect, useState } from 'react';

type HexCardProps = {
  x: number;               // center x in % of board
  y: number;               // center y in % of board
  cardSizePct: number;     // width/height in % of board side
  value: string;           // number / 运算符内容
  label: string;           // 顶部字母
  capColor?: string;       // 帽子颜色
};

const HexCard = ({ x, y, cardSizePct, value, label, capColor = '#6F5322' }: HexCardProps) => {
  // 比例参数（可微调）
  const sizeK = cardSizePct / 100;      // 卡片相对于棋盘的比例
  const valueScale = sizeK * 0.34;      // 中央数字字号相对棋盘的比例
  const capScale = sizeK * 0.115;       // 顶部字母字号比例（更稳重）
  const capWidth = 0.42;                // 帽子宽度（相对卡片）
  const capHeight = 0.20;               // 帽子高度（相对卡片）
  const capCenterOffset = 17;         // 帽子中心相对六边形顶点向下的位移（% of card）

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        width: `${cardSizePct}%`,
        height: `${cardSizePct}%`,
        pointerEvents: 'auto',
      }}
    >
      <img
        src="/number_card_background_and_frame.png"
        alt=""
        draggable={false}
        decoding="async"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          backgroundColor: 'transparent',
          WebkitClipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
          clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
          pointerEvents: 'none',
        }}
      />

      {/* 中心数值/运算符 */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: `calc(var(--board-size) * ${valueScale})`,
          fontFamily: 'Cinzel, serif',
          fontWeight: 600,
          color: '#111',
          WebkitTextStroke: '0.4px rgba(0,0,0,0.25)',
          letterSpacing: '0.01em',
          textShadow: '0 1px 0 rgba(0,0,0,0.25)',
          lineHeight: 1,
          fontVariantNumeric: 'lining-nums tabular-nums',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}
      >
        {value}
      </div>

      {/* 顶部帽子（内嵌于六边形，不外伸），菱形带尖顶 */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: `calc(6.7% + ${capCenterOffset}%)`, // 六边形顶点约 6.7%（与主 hex clipPath 对齐）
          transform: 'translate(-50%, -50%)',
          width: `${capWidth * 100}%`,
          height: `${capHeight * 100}%`,
          background: `linear-gradient(180deg, ${capColor} 0%, ${capColor} 65%, #a68a5d 100%)`,
          // 菱形：顶尖与六边形顶尖方向一致；左右点位 14%/86% 以接近 60° 斜率
          clipPath: 'polygon(50% 0%, 86% 50%, 50% 100%, 14% 50%)',
          boxShadow: '0 0 0 1.2px rgba(0,0,0,0.65), 0 1px 0 rgba(255,255,255,0.08) inset, 0 -1px 0 rgba(0,0,0,0.25) inset',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: `calc(var(--board-size) * ${capScale})`,
            fontWeight: 700,
            lineHeight: 1,
            color: '#111',
            WebkitTextStroke: '0.35px rgba(0,0,0,0.35)',
            textShadow: '0 1px 0 rgba(255,255,255,0.12)',
            letterSpacing: '0.05em',
            userSelect: 'none',
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
};

// A single, geometry-driven layout that renders identically
// across form factors and adapts to any number of layers.
export const App = () => {
  // Pyramid layers (rows). Quick controls below allow tweaking.
  const [layers, setLayers] = useState(4);

  // Keep a vmin-based square so appearance is consistent on mobile/desktop.
  // No orientation branching is needed.
  useEffect(() => {
    // No-op now; placeholder if we later react to viewport for clamping.
  }, []);

  // Layout controls
  const paddingPct = 4; // inner margin in percent of container side

  // Hex geometry (flat-top) relative to a square bounding box of side = 100%.
  const HEX_H = 0.8660254037844386; // sqrt(3)/2
  const COL_STEP = 0.75;            // center-to-center horizontally
  const ROW_STEP = 0.75;            // center-to-center vertically (in hex-height units)

  // Solve hex width as % of the square so the pyramid fits available space.
  const usable = 100 - paddingPct * 2;
  const widthLimit = usable / (1 + COL_STEP * (layers - 1));
  const heightLimit = usable / (HEX_H * (1 + ROW_STEP * (layers - 1)));
  const cardSize = Math.min(widthLimit, heightLimit); // % of container side

  // Derived geometry
  const hexHeight = cardSize * HEX_H;         // % of container side
  const horizontalSpacing = cardSize * COL_STEP;
  const verticalSpacing = hexHeight * ROW_STEP;

  // Center pyramid vertically and horizontally inside the 100% square.
  const totalHeight = hexHeight + (layers - 1) * verticalSpacing;
  const pyramidStartY = (100 - totalHeight) / 2 + hexHeight / 2;
  const pyramidCenterX = 50;

  // Compute positions for rows 1..layers
  const rows = Array.from({ length: layers }, (_, i) => i + 1);
  const cardPositions: { x: number; y: number }[] = [];
  rows.forEach((hexCount, rowIndex) => {
    const rowWidth = (hexCount - 1) * horizontalSpacing;
    const rowStartX = pyramidCenterX - rowWidth / 2;
    const y = pyramidStartY + rowIndex * verticalSpacing;
    for (let c = 0; c < hexCount; c++) {
      cardPositions.push({ x: rowStartX + c * horizontalSpacing, y });
    }
  });

  // 🔍 Debug: Log values for quick verification during tuning
  console.log('layers', layers, 'cardSize%', cardSize.toFixed(2));

  return (
    <div className="w-full h-screen overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat w-full h-full"
        style={{
          backgroundImage: 'url("/background.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Controls (dev only): change layers quickly */}
      <div
        className="absolute z-20"
        style={{ top: 12, right: 12, display: 'flex', gap: 8 }}
      >
        <button
          onClick={() => setLayers((n) => Math.max(1, n - 1))}
          style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.35)', color: '#fff' }}
        >
          −
        </button>
        <div style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.25)', color: '#fff' }}>
          Layers: {layers}
        </div>
        <button
          onClick={() => setLayers((n) => Math.min(12, n + 1))}
          style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.35)', color: '#fff' }}
        >
          +
        </button>
      </div>

      {/* Pyramid container */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full p-4">
        <div
          className="relative"
          style={{
            // vmin-based square with gentle bounds; ensures identical appearance across devices
            width: 'clamp(280px, 92vmin, 1200px)',
            height: 'clamp(280px, 92vmin, 1200px)',
            ['--board-size' as any]: 'clamp(280px, 92vmin, 1200px)',
            // Optional debug border
            // border: '1px dashed rgba(255,255,255,0.4)',
          }}
        >
          {(() => {
            // 为示例生成一组可读的 value/label（实际项目中由状态/逻辑驱动）
            const total = cardPositions.length;
            const ops = ['+7', '÷9', '×2', '-13', '+15', '÷5', '×1', '÷3', '-11', '×3'];
            return cardPositions.map((position, index) => {
              const label = String.fromCharCode(65 + index); // A..Z
              const value = ops[index % ops.length];
              return (
                <HexCard
                  key={index}
                  x={position.x}
                  y={position.y}
                  cardSizePct={cardSize}
                  value={value}
                  label={label}
                  capColor="#7A5B21"
                />
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
};
