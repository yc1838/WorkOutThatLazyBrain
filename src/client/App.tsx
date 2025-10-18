import { useState, useEffect } from 'react';
import { generateValidCardSet, generateTargetNumber, generateValidGameConfiguration, validateGameConfiguration, getDifficultyConfig } from '../shared/utils/gameLogic';
import { generateEquation, calculateFromCards, getSolutionsForTarget } from '../shared/utils/mathUtils';
import { formatProgressText, formatProgressPercentage, getProgressStatusText } from '../shared/utils/progressUtils';
import { updateCompletionState, createInitialCompletionState, shouldTriggerCelebration, getCompletionStats } from '../shared/utils/completionUtils';
import type { Card, GameDifficulty, GameCompletionState } from '../shared/types/game';

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
        opacity: canSelect ? 1 : 0.4,
        cursor: (canSelect || isSelected) ? 'pointer' : 'not-allowed',
        filter: canSelect ? 'none' : 'grayscale(0.7) brightness(0.8)',
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

// 根据难度获取固定的网格大小
const getGridSizeForDifficulty = (difficulty: GameDifficulty): number => {
  switch (difficulty) {
    case 'easy':
      return 4;    // 4x4 = 16 cards
    case 'medium':
      return 5;    // 5x5 = 25 cards
    case 'hard':
      return 6;    // 6x6 = 36 cards
    default:
      return 5;
  }
};

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
  const [gridSize, setGridSize] = useState(getGridSizeForDifficulty('medium'));
  const [selectedCards, setSelectedCards] = useState<CardSelection[]>([]);
  const [gameCards, setGameCards] = useState<Card[]>([]);
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medium');
  const [isLoading, setIsLoading] = useState(true);
  const [currentEquation, setCurrentEquation] = useState<string>('');
  const [currentResult, setCurrentResult] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [usedSolutions, setUsedSolutions] = useState<Set<string>>(new Set());
  const [foundSolutions, setFoundSolutions] = useState<Array<{key: string, equation: string, cards: string}>>([]);
  const [score, setScore] = useState<number>(0);
  const [isAlreadyUsed, setIsAlreadyUsed] = useState<boolean>(false);
  const [completionState, setCompletionState] = useState<GameCompletionState>({
    totalSolutions: 0,
    foundSolutions: 0,
    isCompleted: false
  });
  const [allPossibleSolutions, setAllPossibleSolutions] = useState<Array<{cards: [Card, Card, Card], equation: string}>>([]);
  const [gameStartTime, setGameStartTime] = useState<number>(Date.now());

  // 生成新游戏
  const generateNewGame = async () => {
    setIsLoading(true);
    
    try {
      // 使用新的游戏配置生成函数，内置错误处理和重试机制
      const gameConfig = await generateValidGameConfiguration(difficulty);
      
      // 获取所有解法用于显示
      const allSolutions = getSolutionsForTarget(gameConfig.cards, gameConfig.targetNumber);
      
      // 验证配置有效性（额外的安全检查）
      if (!validateGameConfiguration(gameConfig.cards, gameConfig.targetNumber)) {
        throw new Error('Generated game configuration is invalid');
      }
      
      // 成功生成游戏，设置状态
      setGameCards(gameConfig.cards);
      setTargetNumber(gameConfig.targetNumber);
      
      // 清除选择和等式状态
      setSelectedCards([]);
      setCurrentEquation('');
      setCurrentResult(null);
      setIsCorrect(null);
      setUsedSolutions(new Set());
      setFoundSolutions([]);
      setScore(0);
      setIsAlreadyUsed(false);
      
      // 初始化完成状态
      setCompletionState(createInitialCompletionState(gameConfig.totalSolutions));
      
      // 存储所有可能的解法用于测试显示
      setAllPossibleSolutions(allSolutions);
      
      // 设置游戏开始时间
      setGameStartTime(Date.now());
      
      console.log(`Game generated successfully: ${gameConfig.totalSolutions} solutions for target ${gameConfig.targetNumber}`);
      
    } catch (error) {
      console.error('Failed to generate valid game:', error);
      
      // 使用备用数据作为最后的回退
      try {
        // 尝试生成一个简单的备用游戏
        const fallbackCards = generateValidCardSet('easy');
        const fallbackTarget = generateTargetNumber(fallbackCards, 'easy');
        const fallbackSolutions = getSolutionsForTarget(fallbackCards, fallbackTarget);
        
        if (fallbackSolutions.length > 0) {
          setGameCards(fallbackCards);
          setTargetNumber(fallbackTarget);
          setCompletionState(createInitialCompletionState(fallbackSolutions.length));
          setAllPossibleSolutions(fallbackSolutions);
          console.log('Using fallback game configuration');
        } else {
          throw new Error('Even fallback game generation failed');
        }
      } catch (fallbackError) {
        console.error('Fallback game generation also failed:', fallbackError);
        // 最终回退到空状态
        setGameCards([]);
        setTargetNumber(15);
        setCompletionState({
          totalSolutions: 0,
          foundSolutions: 0,
          isCompleted: false
        });
        setAllPossibleSolutions([]);
      }
      
      // 清除其他状态
      setSelectedCards([]);
      setCurrentEquation('');
      setCurrentResult(null);
      setIsCorrect(null);
      setUsedSolutions(new Set());
      setFoundSolutions([]);
      setScore(0);
      setIsAlreadyUsed(false);
      setGameStartTime(Date.now());
    }
    
    setIsLoading(false);
  };

  // 初始化游戏和更新网格大小
  useEffect(() => {
    setGridSize(getGridSizeForDifficulty(difficulty));
    generateNewGame();
  }, [difficulty]);

  // 生成解法的唯一标识符
  const generateSolutionKey = (cards: CardSelection[]): string => {
    // 按选择顺序排序，然后生成唯一键
    const sortedCards = [...cards].sort((a, b) => a.order - b.order);
    return sortedCards.map(card => `${card.cardId}-${card.order}`).join('|');
  };

  // 计算当前等式
  const calculateCurrentEquation = (cards: CardSelection[]) => {
    if (cards.length !== 3) {
      setCurrentEquation('');
      setCurrentResult(null);
      setIsCorrect(null);
      setIsAlreadyUsed(false);
      return;
    }

    try {
      // 按选择顺序排序卡片
      const sortedCards = [...cards].sort((a, b) => a.order - b.order);
      
      // 转换为Card类型（mathUtils需要的格式）
      const cardObjects: [Card, Card, Card] = [
        {
          id: sortedCards[0]!.cardId,
          label: sortedCards[0]!.label,
          operator: sortedCards[0]!.operator as any,
          number: sortedCards[0]!.number,
          position: 0
        },
        {
          id: sortedCards[1]!.cardId,
          label: sortedCards[1]!.label,
          operator: sortedCards[1]!.operator as any,
          number: sortedCards[1]!.number,
          position: 1
        },
        {
          id: sortedCards[2]!.cardId,
          label: sortedCards[2]!.label,
          operator: sortedCards[2]!.operator as any,
          number: sortedCards[2]!.number,
          position: 2
        }
      ];

      // 生成等式字符串
      const equation = generateEquation(cardObjects);
      setCurrentEquation(equation);

      // 计算结果
      const result = calculateFromCards(cardObjects);
      setCurrentResult(result);

      // 检查是否正确
      const correct = result === targetNumber;
      setIsCorrect(correct);

      // 检查是否已经使用过这个解法
      const solutionKey = generateSolutionKey(cards);
      const alreadyUsed = usedSolutions.has(solutionKey);
      setIsAlreadyUsed(alreadyUsed);

      // 如果是正确答案且未使用过，保存解法并加分
      if (correct && !alreadyUsed) {
        setUsedSolutions(prev => new Set([...prev, solutionKey]));
        setScore(prev => prev + 1);
        
        // 保存解法详情
        const cardsInfo = sortedCards.map(card => `${card.label}(${card.operator}${card.number})`).join(' → ');
        setFoundSolutions(prev => [...prev, {
          key: solutionKey,
          equation: equation,
          cards: cardsInfo
        }]);
        
        // 更新完成状态
        setCompletionState(prev => updateCompletionState(prev, prev.foundSolutions + 1));
        
        // 延迟清除选择，让用户看到结果
        setTimeout(() => {
          setSelectedCards([]);
          setCurrentEquation('');
          setCurrentResult(null);
          setIsCorrect(null);
          setIsAlreadyUsed(false);
        }, 1500);
      }

    } catch (error) {
      console.error('计算等式失败:', error);
      setCurrentEquation('计算错误');
      setCurrentResult(null);
      setIsCorrect(false);
      setIsAlreadyUsed(false);
    }
  };

  // 处理卡片点击
  const handleCardClick = (cardId: string, operator: string, number: number, label: string) => {
    // 如果游戏已完成，禁用卡片交互
    if (completionState.isCompleted) {
      return;
    }

    // 检查是否已选中
    const existingIndex = selectedCards.findIndex(card => card.cardId === cardId);
    
    let newSelectedCards: CardSelection[];
    
    if (existingIndex !== -1) {
      // 取消选择：移除该卡片，重新排序
      const filtered = selectedCards.filter(card => card.cardId !== cardId);
      newSelectedCards = filtered.map((card, index) => ({
        ...card,
        order: index + 1
      }));
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
        newSelectedCards = [...selectedCards, newSelection];
      } else {
        return; // 已经选满3张，不能再选
      }
    }
    
    setSelectedCards(newSelectedCards);
    
    // 计算等式
    calculateCurrentEquation(newSelectedCards);
  };

  // 获取卡片的选择状态
  const getCardSelectionState = (cardId: string) => {
    const selection = selectedCards.find(card => card.cardId === cardId);
    const isGameCompleted = completionState.isCompleted;
    
    return {
      isSelected: !!selection,
      order: selection?.order || 0,
      canSelect: !isGameCompleted && (selectedCards.length < 3 || !!selection)
    };
  };

  const containerSize = 'clamp(280px, 92vmin, 1200px)';
  const boardPadding = 'clamp(16px, 2.4vmin, 32px)';
  const gridGap = '0px';
  const cardImageSrc = '/number_card_background_and_frame.png';

  // 使用真实的游戏卡片数据，如果还没加载完成则使用占位数据
  const displayCards = gameCards.length > 0 ? gameCards : [];
  
  // 只显示前gridSize*gridSize张卡片
  const totalCells = gridSize * gridSize;
  const cells = displayCards.slice(0, totalCells).map((card, index) => ({
    cardId: card.id,
    label: card.label,
    value: `${card.operator}${card.number}`,
    operator: card.operator,
    number: card.number,
  }));

  // 如果卡片不够，用占位数据填充（使用确定性生成避免重新渲染时变化）
  while (cells.length < totalCells) {
    const index = cells.length;
    
    // 使用确定性方法生成占位符，基于索引和难度
    const config = getDifficultyConfig(difficulty);
    const operators: ('+' | '-' | '×' | '÷')[] = ['+', '-', '×', '÷'];
    const operator = operators[index % operators.length]!;
    const numberRange = config.maxNumber - config.minNumber + 1;
    const number = (index % numberRange) + config.minNumber;
    const opValue = `${operator}${number}`;
    
    cells.push({
      cardId: `placeholder-${index}`,
      label: labelForIndex(index),
      value: opValue,
      operator: operator,
      number: number,
    });
  }



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

      {/* 游戏信息面板 */}
      <div
        className="absolute z-20"
        style={{ top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 8 }}
      >
        {/* 目标数字和分数显示 */}
        <div
          className="game-info-panel"
          style={{
            padding: '16px 20px',
            borderRadius: 16,
            background: completionState.isCompleted 
              ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.95) 0%, rgba(46, 125, 50, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(255, 193, 7, 0.9) 100%)',
            color: completionState.isCompleted ? '#fff' : '#000',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            fontFamily: 'Cinzel, serif',
            fontSize: '18px',
            fontWeight: 700,
            textAlign: 'center',
            minWidth: '160px',
            boxShadow: completionState.isCompleted
              ? '0 4px 16px rgba(76, 175, 80, 0.6), 0 0 30px rgba(76, 175, 80, 0.4)'
              : '0 4px 12px rgba(255, 215, 0, 0.4), 0 0 20px rgba(255, 215, 0, 0.2)',
            transition: 'all 0.3s ease',
          }}
        >
          {/* 完成状态指示器 */}
          {completionState.isCompleted && (
            <div style={{ 
              fontSize: '16px', 
              fontWeight: 600, 
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}>
              🎉 <span>游戏完成!</span> 🎉
            </div>
          )}
          
          <div style={{ fontSize: '12px', fontWeight: 400, marginBottom: '4px', opacity: 0.8 }}>
            目标数字
          </div>
          <div 
            className="game-info-target"
            style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}
          >
            {isLoading ? '...' : targetNumber}
          </div>
          
          {/* 解法进度显示 - 增强版 */}
          <div style={{ 
            background: 'rgba(0, 0, 0, 0.1)', 
            borderRadius: '8px', 
            padding: '8px 12px', 
            marginBottom: '8px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
              解法进度
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '2px' }}>
              {formatProgressText(completionState.foundSolutions, completionState.totalSolutions)}
            </div>
            {completionState.totalSolutions > 0 && (
              <>
                <div style={{ fontSize: '12px', fontWeight: 500, opacity: 0.9 }}>
                  {formatProgressPercentage(completionState.foundSolutions, completionState.totalSolutions)}
                </div>
                {/* 进度条 */}
                <div 
                  className="progress-bar-container"
                  style={{
                    width: '100%',
                    height: '6px',
                    background: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '3px',
                    marginTop: '6px',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{
                    width: `${(completionState.foundSolutions / completionState.totalSolutions) * 100}%`,
                    height: '100%',
                    background: completionState.isCompleted 
                      ? 'linear-gradient(90deg, #4CAF50, #66BB6A)'
                      : 'linear-gradient(90deg, #FFC107, #FFB300)',
                    borderRadius: '3px',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </>
            )}
          </div>
          
          <div style={{ fontSize: '14px', fontWeight: 600, opacity: 0.9 }}>
            分数: {score}
          </div>
        </div>

        {/* 难度选择器 */}
        <div
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            background: 'rgba(0,0,0,0.7)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.2)',
            fontFamily: 'Cinzel, serif',
            fontSize: '14px',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '6px' }}>难度</div>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as GameDifficulty)}
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '12px',
              fontFamily: 'Cinzel, serif',
              width: '100%',
            }}
          >
            <option value="easy" style={{ background: '#333', color: '#fff' }}>简单 (4×4)</option>
            <option value="medium" style={{ background: '#333', color: '#fff' }}>中等 (5×5)</option>
            <option value="hard" style={{ background: '#333', color: '#fff' }}>困难 (6×6)</option>
          </select>
        </div>

        {/* 等式计算显示 */}
        {selectedCards.length > 0 && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 12,
              background: isCorrect === true && !isAlreadyUsed
                ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.9) 0%, rgba(46, 125, 50, 0.9) 100%)'
                : isCorrect === true && isAlreadyUsed
                ? 'linear-gradient(135deg, rgba(255, 193, 7, 0.9) 0%, rgba(255, 152, 0, 0.9) 100%)'
                : isCorrect === false 
                ? 'linear-gradient(135deg, rgba(244, 67, 54, 0.9) 0%, rgba(198, 40, 40, 0.9) 100%)'
                : 'rgba(0,0,0,0.8)',
              color: '#fff',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              fontFamily: 'Cinzel, serif',
              fontSize: '16px',
              fontWeight: 600,
              textAlign: 'center',
              minWidth: '200px',
              boxShadow: isCorrect === true && !isAlreadyUsed
                ? '0 4px 12px rgba(76, 175, 80, 0.4), 0 0 20px rgba(76, 175, 80, 0.2)'
                : isCorrect === true && isAlreadyUsed
                ? '0 4px 12px rgba(255, 193, 7, 0.4), 0 0 20px rgba(255, 193, 7, 0.2)'
                : isCorrect === false
                ? '0 4px 12px rgba(244, 67, 54, 0.4), 0 0 20px rgba(244, 67, 54, 0.2)'
                : '0 4px 12px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 400, marginBottom: '6px', opacity: 0.9 }}>
              当前等式
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
              {currentEquation || '选择3张卡片'}
            </div>
            {currentResult !== null && (
              <>
                <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                  = {currentResult}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 500 }}>
                  {isCorrect === true && !isAlreadyUsed && '🎉 正确！+1分'}
                  {isCorrect === true && isAlreadyUsed && '✅ 正确但已使用过'}
                  {isCorrect === false && `❌ 目标是 ${targetNumber}`}
                </div>
              </>
            )}
          </div>
        )}

        {/* 选择状态显示 */}
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

        {/* 已找到的解法列表 */}
        {foundSolutions.length > 0 && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              background: 'rgba(76, 175, 80, 0.8)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.3)',
              fontFamily: 'Cinzel, serif',
              fontSize: '12px',
              minWidth: '200px',
              maxHeight: '200px',
              overflowY: 'auto',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '6px', fontSize: '14px' }}>
              🎯 已找到的解法 ({formatProgressText(completionState.foundSolutions, completionState.totalSolutions)})
            </div>
            {foundSolutions.map((solution, index) => (
              <div key={solution.key} style={{ 
                marginBottom: '4px', 
                padding: '4px 6px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '4px',
                fontSize: '11px'
              }}>
                <div style={{ fontWeight: 600, color: '#FFD700' }}>
                  {index + 1}. {solution.equation} = {targetNumber}
                </div>
                <div style={{ opacity: 0.8, fontSize: '10px' }}>
                  {solution.cards}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 新游戏按钮 */}
        <button
          onClick={generateNewGame}
          disabled={isLoading}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            background: isLoading 
              ? 'rgba(128,128,128,0.5)' 
              : 'linear-gradient(135deg, rgba(76, 175, 80, 0.8) 0%, rgba(46, 125, 50, 0.8) 100%)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.3)',
            fontFamily: 'Cinzel, serif',
            fontSize: '14px',
            fontWeight: 600,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {isLoading ? '生成中...' : '新游戏'}
        </button>

        {/* 所有可能解法显示（测试用） */}
        {allPossibleSolutions.length > 0 && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              background: 'rgba(33, 150, 243, 0.8)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.3)',
              fontFamily: 'Cinzel, serif',
              fontSize: '12px',
              minWidth: '200px',
              maxHeight: '300px',
              overflowY: 'auto',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '6px', fontSize: '14px' }}>
              📋 所有可能解法 (测试用)
            </div>
            <div style={{ fontSize: '11px', marginBottom: '8px', opacity: 0.9 }}>
              目标: {targetNumber} | 总计: {allPossibleSolutions.length} 种解法
            </div>
            {allPossibleSolutions.map((solution, index) => (
              <div key={`${solution.equation}-${index}`} style={{ 
                marginBottom: '3px', 
                padding: '3px 6px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '3px',
                fontSize: '10px'
              }}>
                <div style={{ fontWeight: 600, color: '#E3F2FD' }}>
                  {index + 1}. {solution.equation} = {targetNumber}
                </div>
                <div style={{ opacity: 0.8, fontSize: '9px' }}>
                  {solution.cards.map(card => `${card.label}(${card.operator}${card.number})`).join(' → ')}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 所有可能解法显示 (测试用) */}
        {allPossibleSolutions.length > 0 && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              background: 'rgba(33, 150, 243, 0.8)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.3)',
              fontFamily: 'Cinzel, serif',
              fontSize: '12px',
              minWidth: '200px',
              maxHeight: '300px',
              overflowY: 'auto',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '6px', fontSize: '14px' }}>
              🔍 所有可能解法 (测试用) - 共 {allPossibleSolutions.length} 个
            </div>
            {allPossibleSolutions.map((solution, index) => {
              const cardsInfo = solution.cards.map(card => `${card.label}(${card.operator}${card.number})`).join(' → ');
              return (
                <div key={`${solution.equation}-${index}`} style={{ 
                  marginBottom: '4px', 
                  padding: '4px 6px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '4px',
                  fontSize: '11px'
                }}>
                  <div style={{ fontWeight: 600, color: '#E3F2FD' }}>
                    {index + 1}. {solution.equation} = {targetNumber}
                  </div>
                  <div style={{ opacity: 0.8, fontSize: '10px' }}>
                    {cardsInfo}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 游戏完成庆祝界面 */}
      {shouldTriggerCelebration(completionState) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(12px)',
            animation: 'celebration-fade-in 0.5s ease-out',
          }}
        >
          {/* 彩纸效果 */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: '-10px',
                left: `${10 + i * 8}%`,
                width: '8px',
                height: '8px',
                background: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][i % 6],
                borderRadius: '50%',
                animation: `celebration-confetti ${2 + Math.random() * 2}s linear infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
          
          <div
            className="celebration-modal"
            style={{
              position: 'relative',
              padding: '40px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.98) 0%, rgba(255, 193, 7, 0.98) 30%, rgba(255, 152, 0, 0.98) 70%, rgba(255, 111, 97, 0.98) 100%)',
              color: '#000',
              border: '4px solid rgba(255, 255, 255, 0.5)',
              fontFamily: 'Cinzel, serif',
              textAlign: 'center',
              maxWidth: '450px',
              width: '90%',
              boxShadow: '0 25px 50px rgba(255, 215, 0, 0.7), 0 0 80px rgba(255, 215, 0, 0.5), 0 0 120px rgba(255, 215, 0, 0.3)',
              animation: 'celebration-pulse 2s ease-in-out infinite alternate, celebration-glow 3s ease-in-out infinite',
              overflow: 'hidden',
            }}
          >
            {/* 庆祝标题 */}
            <div
              className="celebration-title"
              style={{
                fontSize: '36px',
                fontWeight: 900,
                marginBottom: '20px',
                textShadow: '3px 3px 6px rgba(0, 0, 0, 0.4)',
                animation: 'celebration-bounce 2s ease-in-out infinite',
                background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4)',
                backgroundSize: '400% 400%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              🎉 恭喜完成！ 🎉
            </div>

            {/* 完成信息 */}
            <div
              className="celebration-subtitle"
              style={{
                fontSize: '20px',
                fontWeight: 700,
                marginBottom: '24px',
                opacity: 0.95,
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)',
              }}
            >
              🏆 你找到了所有 <span style={{ 
                color: '#FF6B6B', 
                fontSize: '24px',
                fontWeight: 800,
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
              }}>{completionState.totalSolutions}</span> 个解法！
            </div>

            {/* 游戏统计 - 增强版 */}
            <div
              className="celebration-stats"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.1) 100%)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '28px',
                fontSize: '15px',
                fontWeight: 600,
                border: '2px solid rgba(255, 255, 255, 0.2)',
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div 
                className="celebration-stats-grid"
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '12px',
                  marginBottom: '12px'
                }}
              >
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.1)', 
                  padding: '8px 12px', 
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '2px' }}>目标数字</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#FF6B6B' }}>{targetNumber}</div>
                </div>
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.1)', 
                  padding: '8px 12px', 
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '2px' }}>最终分数</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#4ECDC4' }}>{score}</div>
                </div>
              </div>
              
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                padding: '10px 12px', 
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>完成进度</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#96CEB4', marginBottom: '4px' }}>
                  {completionState.foundSolutions} / {completionState.totalSolutions} 解法
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#45B7D1' }}>
                  100% 完成！
                </div>
              </div>
              
              {(() => {
                const stats = getCompletionStats(completionState, gameStartTime);
                if (stats.gameDuration) {
                  const minutes = Math.floor(stats.gameDuration / 60000);
                  const seconds = Math.floor((stats.gameDuration % 60000) / 1000);
                  return (
                    <div style={{ 
                      background: 'rgba(255, 255, 255, 0.1)', 
                      padding: '8px 12px', 
                      borderRadius: '8px',
                      textAlign: 'center',
                      marginTop: '12px'
                    }}>
                      <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '2px' }}>用时</div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFEAA7' }}>
                        {minutes > 0 ? `${minutes}分` : ''}{seconds}秒
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            {/* 新游戏按钮 - 增强版 */}
            <button
              className="celebration-button"
              onClick={generateNewGame}
              disabled={isLoading}
              style={{
                padding: '16px 32px',
                borderRadius: '16px',
                background: isLoading 
                  ? 'rgba(128, 128, 128, 0.5)' 
                  : 'linear-gradient(135deg, rgba(76, 175, 80, 0.95) 0%, rgba(46, 125, 50, 0.95) 50%, rgba(27, 94, 32, 0.95) 100%)',
                color: '#fff',
                border: '3px solid rgba(255, 255, 255, 0.4)',
                fontFamily: 'Cinzel, serif',
                fontSize: '18px',
                fontWeight: 800,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 6px 16px rgba(76, 175, 80, 0.5), 0 0 20px rgba(76, 175, 80, 0.3)',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.4)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'scale(1.08) translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(76, 175, 80, 0.7), 0 0 30px rgba(76, 175, 80, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'scale(1) translateY(0)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(76, 175, 80, 0.5), 0 0 20px rgba(76, 175, 80, 0.3)';
                }
              }}
            >
              {isLoading ? '🔄 生成中...' : '🎮 开始新游戏'}
              
              {/* 按钮光效 */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                  animation: 'celebration-shimmer 2s ease-in-out infinite',
                }}
              />
            </button>

            {/* 装饰性光环 */}
            <div
              style={{
                position: 'absolute',
                top: '-15px',
                left: '-15px',
                right: '-15px',
                bottom: '-15px',
                borderRadius: '30px',
                background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.15) 50%, transparent 70%)',
                pointerEvents: 'none',
                animation: 'celebration-shimmer 4s ease-in-out infinite',
              }}
            />
            
            {/* 边框光效 */}
            <div
              style={{
                position: 'absolute',
                inset: '-2px',
                borderRadius: '26px',
                background: 'linear-gradient(45deg, #FFD700, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7, #FFD700)',
                backgroundSize: '400% 400%',
                animation: 'celebration-shimmer 3s ease-in-out infinite',
                zIndex: -1,
              }}
            />
          </div>
        </div>
      )}

      {/* Grid size info display */}
      <div
        className="absolute z-20"
        style={{ top: 12, right: 12 }}
      >
        <div
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            background: 'rgba(0,0,0,0.7)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.2)',
            fontFamily: 'Cinzel, serif',
            fontWeight: 600,
            fontSize: '14px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '2px' }}>网格大小</div>
          <div>{gridSize} × {gridSize}</div>
        </div>
      </div>

      {/* Square grid container */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full p-4">
        {isLoading ? (
          // 加载状态
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontFamily: 'Cinzel, serif',
              fontSize: '18px',
              fontWeight: 600,
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid rgba(255, 215, 0, 0.3)',
                borderTop: '3px solid rgba(255, 215, 0, 1)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '16px',
              }}
            />
            <div>生成游戏中...</div>
          </div>
        ) : (
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
        )}
      </div>

      {/* 添加旋转动画的CSS */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
