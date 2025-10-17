import { useState } from 'react';

// 卡片选择状态类型
type CardSelection = {
  cardId: string;      // 卡片唯一ID
  order: number;       // 选择顺序 (1, 2, 3)
  operator: string;    // 运算符
  number: number;      // 数字
  label: string;       // 卡片标签
};

type GridCardProps = {
  cardId: string;          // 新增：卡片唯一ID
  value: string;           // number / 运算符内容
  label: string;           // 顶部字母
  gridSize: number;        // 当前棋盘宽度（控制字号等）
  imageSrc: string;        // 背景图片
  capColor?: string;       // 顶部徽章颜色
  operator?: string;       // 运算符，用于主题化
  number: number;          // 新增：数字值
  isSelected: boolean;     // 新增：是否被选中
  selectionOrder: number;  // 新增：选择顺序 (0表示未选中)
  canSelect: boolean;      // 新增：是否可以选择
  onClick: (cardId: string, operator: string, number: number, label: string) => void; // 新增：点击处理器
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

const GridCard = ({ 
  cardId, value, label, gridSize, imageSrc, capColor, operator, number,
  isSelected, selectionOrder, canSelect, onClick 
}: GridCardProps) => {
  const valueFontSize = `calc((var(--board-size) / ${gridSize}) * 0.42)`;
  const labelFontSize = `calc((var(--board-size) / ${gridSize}) * 0.16)`;
  const labelPaddingY = `calc((var(--board-size) / ${gridSize}) * 0.04)`;
  const labelPaddingX = `calc((var(--board-size) / ${gridSize}) * 0.12)`;
  const badgeOffset = `calc((var(--board-size) / ${gridSize}) * 0.14)`;
  
  // 获取运算符主题
  const theme = getOperatorTheme(operator || '');
  const finalCapColor = capColor || theme.capColor;

  // 处理点击事件
  const handleClick = () => {
    if (canSelect || isSelected) {
      onClick(cardId, operator || '', number, label);
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: isSelected 
          ? `0 0 40px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.6), ${theme.shadowColor} 0 0 30px, 0 4px 8px rgba(0,0,0,0.3)`
          : `0 0 30px ${theme.shadowColor}, 0 0 15px ${theme.shadowColor}, 0 4px 8px rgba(0,0,0,0.3)`,
        background: 'transparent',
        transition: 'all 0.3s ease',
        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
        opacity: canSelect ? 1 : 0.6,
        cursor: (canSelect || isSelected) ? 'pointer' : 'not-allowed',
        border: isSelected ? '2px solid rgba(255, 215, 0, 0.8)' : 'none',
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

      {/* 选择顺序指示器 */}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: `calc((var(--board-size) / ${gridSize}) * 0.08)`,
            right: `calc((var(--board-size) / ${gridSize}) * 0.08)`,
            width: `calc((var(--board-size) / ${gridSize}) * 0.2)`,
            height: `calc((var(--board-size) / ${gridSize}) * 0.2)`,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
            border: '2px solid #fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3), 0 0 15px rgba(255, 215, 0, 0.6)',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <span
            style={{
              fontFamily: 'Cinzel, serif',
              fontSize: `calc((var(--board-size) / ${gridSize}) * 0.12)`,
              fontWeight: 800,
              color: '#000',
              lineHeight: 1,
            }}
          >
            {selectionOrder}
          </span>
        </div>
      )}

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
  const [selectedCards, setSelectedCards] = useState<CardSelection[]>([]);

  // 处理卡片点击
  const handleCardClick = (cardId: string, operator: string, number: number, label: string) => {
    // 检查是否已选中
    const existingIndex = selectedCards.findIndex(card => card.cardId === cardId);
    
    if (existingIndex !== -1) {
      // 取消选择：移除该卡片，重新排序
      const filtered = selectedCards.filter(card => card.cardId !== cardId);
      const reordered = filtered.map((card, index) => ({
        ...card,
        order: index + 1
      }));
      setSelectedCards(reordered);
    } else {
      // 添加选择：检查数量限制
      if (selectedCards.length < 3) {
        const newSelection: CardSelection = {
          cardId,
          order: selectedCards.length + 1,
          operator,
          number,
          label
        };
        setSelectedCards([...selectedCards, newSelection]);
      }
    }
  };

  // 获取卡片的选择状态
  const getCardSelectionState = (cardId: string) => {
    const selection = selectedCards.find(card => card.cardId === cardId);
    return {
      isSelected: !!selection,
      order: selection?.order || 0,
      canSelect: selectedCards.length < 3 || !!selection
    };
  };

  const containerSize = 'clamp(280px, 92vmin, 1200px)';
  const boardPadding = 'clamp(16px, 2.4vmin, 32px)';
  const gridGap = '0px';
  const cardImageSrc = '/number_card_background_and_frame.png';

  const totalCells = gridSize * gridSize;
  const ops = ['+7', '÷9', '×2', '-13', '+15', '÷5', '×1', '÷3', '-11', '×3'];
  const cells = Array.from({ length: totalCells }, (_, index) => {
    const cardId = `card-${index}`;
    const opValue = ops[index % ops.length] ?? '';
    const operator = opValue.charAt(0); // 提取运算符
    const number = parseInt(opValue.slice(1)); // 提取数字
    return {
      cardId,
      label: labelForIndex(index),
      value: opValue,
      operator: operator,
      number: number,
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

      {/* 选择状态显示 */}
      <div
        className="absolute z-20"
        style={{ top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 8 }}
      >
        <div
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            background: 'rgba(0,0,0,0.7)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.2)',
            fontFamily: 'Cinzel, serif',
            fontSize: '14px',
            minWidth: '200px',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>
            已选择: {selectedCards.length}/3
          </div>
          {selectedCards.map((card, index) => (
            <div key={card.cardId} style={{ fontSize: '12px', opacity: 0.8 }}>
              {card.order}. {card.label}: {card.operator}{card.number}
            </div>
          ))}
        </div>
      </div>

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
          {cells.map((cell, index) => {
            const selectionState = getCardSelectionState(cell.cardId);
            return (
              <GridCard
                key={cell.cardId}
                cardId={cell.cardId}
                gridSize={gridSize}
                value={cell.value}
                label={cell.label}
                imageSrc={cardImageSrc}
                operator={cell.operator}
                number={cell.number}
                isSelected={selectionState.isSelected}
                selectionOrder={selectionState.order}
                canSelect={selectionState.canSelect}
                onClick={handleCardClick}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
