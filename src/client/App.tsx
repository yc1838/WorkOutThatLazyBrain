import { useEffect, useState } from 'react';

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
            // Optional debug border
            // border: '1px dashed rgba(255,255,255,0.4)',
          }}
        >
          {cardPositions.map((position, index) => (
            <img
              key={index}
              src="/number_card_background_and_frame.png"
              alt=""
              draggable={false}
              decoding="async"
              style={{
                position: 'absolute',
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: 'translate(-50%, -50%)',
                width: `${cardSize}%`,
                height: `${cardSize}%`, // keep square box; geometry uses hexHeight for spacing
                objectFit: 'contain',
                backgroundColor: 'transparent',
                WebkitClipPath:
                  'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
                clipPath:
                  'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
