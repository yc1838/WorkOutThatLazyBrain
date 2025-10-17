import { useState } from 'react';

type GridCardProps = {
  value: string;           // number / 运算符内容
  label: string;           // 顶部字母
  gridSize: number;        // 当前棋盘宽度（控制字号等）
  imageSrc: string;        // 背景图片
  capColor?: string;       // 顶部徽章颜色
  operator?: string;       // 运算符，用于主题化
};

// 根据运算符获取主题颜色
const getOperatorTheme = (operator: string) => {
  switch (operator) {
    case '+':
      return {
        capColor: '#2D7D32',      // 深绿色 - 生命/治疗
        glowColor: '#4CAF50',     // 亮绿色
        shadowColor: 'rgba(76, 175, 80, 0.3)',
        textShadow: '0 -1px 0 rgba(27, 94, 32, 0.45), 0 2px 4px rgba(129, 199, 132, 0.55), 0 6px 16px rgba(46, 125, 50, 0.5)'
      };
    case '-':
      return {
        capColor: '#C62828',      // 深红色 - 火焰/伤害
        glowColor: '#F44336',     // 亮红色
        shadowColor: 'rgba(244, 67, 54, 0.3)',
        textShadow: '0 -1px 0 rgba(183, 28, 28, 0.45), 0 2px 4px rgba(239, 154, 154, 0.55), 0 6px 16px rgba(198, 40, 40, 0.5)'
      };
    case '×':
      return {
        capColor: '#6A1B9A',      // 深紫色 - 魔法/增幅
        glowColor: '#9C27B0',     // 亮紫色
        shadowColor: 'rgba(156, 39, 176, 0.3)',
        textShadow: '0 -1px 0 rgba(74, 20, 140, 0.45), 0 2px 4px rgba(206, 147, 216, 0.55), 0 6px 16px rgba(106, 27, 154, 0.5)'
      };
    case '÷':
      return {
        capColor: '#1565C0',      // 深蓝色 - 冰霜/分解
        glowColor: '#2196F3',     // 亮蓝色
        shadowColor: 'rgba(33, 150, 243, 0.3)',
        textShadow: '0 -1px 0 rgba(13, 71, 161, 0.45), 0 2px 4px rgba(144, 202, 249, 0.55), 0 6px 16px rgba(21, 101, 192, 0.5)'
      };
    default:
      return {
        capColor: '#6F5322',      // 默认金色
        glowColor: '#FFC107',
        shadowColor: 'rgba(255, 193, 7, 0.3)',
        textShadow: '0 -1px 0 rgba(63, 40, 8, 0.45), 0 2px 4px rgba(227, 182, 76, 0.55), 0 6px 16px rgba(109, 70, 9, 0.5)'
      };
  }
};

const GridCard = ({ value, label, gridSize, imageSrc, capColor, operator }: GridCardProps) => {
  const valueFontSize = `calc((var(--board-size) / ${gridSize}) * 0.42)`;
  const labelFontSize = `calc((var(--board-size) / ${gridSize}) * 0.16)`;
  const labelPaddingY = `calc((var(--board-size) / ${gridSize}) * 0.04)`;
  const labelPaddingX = `calc((var(--board-size) / ${gridSize}) * 0.12)`;
  const badgeOffset = `calc((var(--board-size) / ${gridSize}) * 0.14)`;
  
  // 获取运算符主题
  const theme = getOperatorTheme(operator || '');
  const finalCapColor = capColor || theme.capColor;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: `0 0 30px ${theme.shadowColor}, 0 0 15px ${theme.shadowColor}, 0 4px 8px rgba(0,0,0,0.3)`,
        background: 'transparent',
        transition: 'box-shadow 0.3s ease',
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
          background: `linear-gradient(180deg, ${finalCapColor} 0%, ${finalCapColor} 65%, ${theme.glowColor} 100%)`,
          color: '#21160b',
          borderRadius: 999,
          border: '1px solid rgba(0,0,0,0.35)',
          boxShadow: `0 0 8px ${theme.shadowColor}, 0 1px 0 rgba(255,255,255,0.4) inset, 0 -1px 0 rgba(0,0,0,0.4) inset`,
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
          WebkitTextStroke: '0.6px rgba(0,0,0,0.4)',
          letterSpacing: '0.01em',
          textShadow: `${theme.textShadow}, 0 0 8px ${theme.glowColor}`,
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
  const cells = Array.from({ length: totalCells }, (_, index) => {
    const opValue = ops[index % ops.length] ?? '';
    const operator = opValue.charAt(0); // 提取运算符
    return {
      label: labelForIndex(index),
      value: opValue,
      operator: operator,
    };
  });

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
              operator={cell.operator}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
