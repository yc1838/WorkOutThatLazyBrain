import { useState } from 'react';

type GridCardProps = {
  value: string;           // number / 运算符内容
  label: string;           // 顶部字母
  gridSize: number;        // 当前棋盘宽度（控制字号等）
  imageSrc: string;        // 背景图片
  capColor?: string;       // 顶部徽章颜色
};

const GridCard = ({ value, label, gridSize, imageSrc, capColor = '#6F5322' }: GridCardProps) => {
  const valueFontSize = `calc((var(--board-size) / ${gridSize}) * 0.42)`;
  const labelFontSize = `calc((var(--board-size) / ${gridSize}) * 0.16)`;
  const labelPaddingY = `calc((var(--board-size) / ${gridSize}) * 0.04)`;
  const labelPaddingX = `calc((var(--board-size) / ${gridSize}) * 0.12)`;
  const badgeOffset = `calc((var(--board-size) / ${gridSize}) * 0.14)`;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: 'none',
        background: 'transparent',
      }}
    >
      <img
        src={imageSrc}
        alt=""
        draggable={false}
        decoding="async"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'saturate(0.92)',
          opacity: 1,
          pointerEvents: 'none',
        }}
      />

      {/* 顶部徽章 */}
      <div
        style={{
          position: 'absolute',
          top: badgeOffset,
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: `${labelPaddingY} ${labelPaddingX}`,
          background: `linear-gradient(180deg, ${capColor} 0%, ${capColor} 65%, #c9a46a 100%)`,
          color: '#21160b',
          borderRadius: 999,
          border: '1px solid rgba(0,0,0,0.35)',
          boxShadow: '0 1px 0 rgba(255,255,255,0.32) inset, 0 -1px 0 rgba(0,0,0,0.35) inset',
          pointerEvents: 'none',
          minWidth: `calc((var(--board-size) / ${gridSize}) * 0.32)`,
        }}
      >
        <span
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: labelFontSize,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: '0.05em',
            userSelect: 'none',
          }}
        >
          {label}
        </span>
      </div>

      {/* 中心数值/运算符 */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: valueFontSize,
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
    </div>
  );
};

const MIN_GRID_SIZE = 3;
const MAX_GRID_SIZE = 10;

const labelForIndex = (index: number) => {
  const alphabetLength = 26;
  let idx = index;
  let label = '';

  do {
    label = String.fromCharCode(65 + (idx % alphabetLength)) + label;
    idx = Math.floor(idx / alphabetLength) - 1;
  } while (idx >= 0);

  return label;
};

// Responsive square board that scales with any N×N configuration.
export const App = () => {
  const [gridSize, setGridSize] = useState(3);

  const containerSize = 'clamp(280px, 92vmin, 1200px)';
  const boardPadding = 'clamp(16px, 2.4vmin, 32px)';
  const gridGap = '0px';
  const cardImageSrc = '/number_card_background_and_frame.png';

  const totalCells = gridSize * gridSize;
  const ops = ['+7', '÷9', '×2', '-13', '+15', '÷5', '×1', '÷3', '-11', '×3'];
  const cells = Array.from({ length: totalCells }, (_, index) => ({
    label: labelForIndex(index),
    value: ops[index % ops.length] ?? '',
  }));

  const isAtMin = gridSize === MIN_GRID_SIZE;
  const isAtMax = gridSize === MAX_GRID_SIZE;

  const controlButtonStyle = (disabled: boolean) => ({
    padding: '6px 10px',
    borderRadius: 8,
    background: 'rgba(0,0,0,0.35)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    transition: 'opacity 120ms ease',
  });

  return (
    <div className="w-full h-screen overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat w-full h-full"
        style={{
          backgroundImage: 'url("/background.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Controls (dev only): change grid size quickly */}
      <div
        className="absolute z-20"
        style={{ top: 12, right: 12, display: 'flex', gap: 8 }}
      >
        <button
          onClick={() => setGridSize((size) => Math.max(MIN_GRID_SIZE, size - 1))}
          style={controlButtonStyle(isAtMin)}
          disabled={isAtMin}
        >
          −
        </button>
        <div
          style={{
            padding: '6px 12px',
            borderRadius: 8,
            background: 'rgba(0,0,0,0.25)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.18)',
            fontFamily: 'Cinzel, serif',
            fontWeight: 600,
            letterSpacing: '0.04em',
          }}
        >
          Grid: {gridSize} × {gridSize}
        </div>
        <button
          onClick={() => setGridSize((size) => Math.min(MAX_GRID_SIZE, size + 1))}
          style={controlButtonStyle(isAtMax)}
          disabled={isAtMax}
        >
          +
        </button>
      </div>

      {/* Square grid container */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full p-4">
        <div
          className="relative"
          style={{
            width: containerSize,
            height: containerSize,
            ['--board-size' as any]: containerSize,
            display: 'grid',
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize}, 1fr)`,
            gap: gridGap,
            padding: boardPadding,
            borderRadius: 28,
            background: 'transparent',
            border: 'none',
            boxShadow: 'none',
            backdropFilter: 'none',
          }}
        >
          {cells.map((cell, index) => (
            <GridCard
              key={index}
              gridSize={gridSize}
              value={cell.value}
              label={cell.label}
              imageSrc={cardImageSrc}
              capColor="#7A5B21"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
