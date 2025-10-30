import { useState, useEffect } from 'react';
import { generateValidCardSet, generateTargetNumber, generateValidGameConfiguration, validateGameConfiguration, getDifficultyConfig, generateCardsWithRepetitionLimit, getGridSizeForDifficulty } from '../shared/utils/gameLogic';
import { generateEquation, calculateFromCards, getSolutionsForTarget } from '../shared/utils/mathUtils';
import { formatProgressText, formatProgressPercentage, getProgressStatusText } from '../shared/utils/progressUtils';
import { updateCompletionState, createInitialCompletionState, shouldTriggerCelebration, getCompletionStats } from '../shared/utils/completionUtils';
import { generateNormalizedSolutionKey, deduplicateSolutions } from '../shared/utils/expressionNormalizer';
import { SplashScreen } from './components/SplashScreen';
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
  const valueFontSize = `calc((var(--board-size) / ${gridSize}) * 0.35)`;
  const labelFontSize = `calc((var(--board-size) / ${gridSize}) * 0.14)`;

  // 获取运算符主题颜色 - 基于图片的柔和渐变色
  const getCardTheme = (operator: string) => {
    switch (operator) {
      case '+':
        return {
          primary: '#E8A5E8',    // 柔和紫色
          secondary: '#D1A3D1',  // 稍深紫色
          accent: '#F5C2F5',     // 浅紫色
        };
      case '-':
        return {
          primary: '#FFB3BA',    // 柔和粉红
          secondary: '#FF9AA1',  // 稍深粉红
          accent: '#FFCCCF',     // 浅粉红
        };
      case '×':
        return {
          primary: '#B3D9FF',    // 柔和蓝色
          secondary: '#9AC7FF',  // 稍深蓝色
          accent: '#CCE6FF',     // 浅蓝色
        };
      case '÷':
        return {
          primary: '#B3FFB3',    // 柔和绿色
          secondary: '#9AFF9A',  // 稍深绿色
          accent: '#CCFFCC',     // 浅绿色
        };
      default:
        return {
          primary: '#E8A5E8',    // 默认紫色
          secondary: '#D1A3D1',
          accent: '#F5C2F5',
        };
    }
  };

  const theme = getCardTheme(operator || '');

  // 处理点击事件
  const handleClick = () => {
    if (canSelect || isSelected) {
      onClick(cardId, operator || '', number, label);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="low-poly-card"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: '16px', // 圆角如图片所示
        overflow: 'visible', // 允许阴影显示
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isSelected ? 'scale(1.08) translateY(-4px)' : 'scale(1)',
        opacity: canSelect ? 1 : 0.6,
        cursor: (canSelect || isSelected) ? 'pointer' : 'not-allowed',
        filter: canSelect ? 'none' : 'grayscale(0.4) brightness(0.8)',
      }}
    >
      {/* 主卡片背景 - 模仿图片的渐变和3D效果 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '16px',
          background: `
            linear-gradient(145deg, ${theme.primary} 0%, ${theme.secondary} 50%, ${theme.primary} 100%),
            linear-gradient(45deg, ${theme.accent}40 0%, transparent 50%, ${theme.secondary}30 100%)
          `,
          boxShadow: isSelected
            ? `
              0 12px 24px rgba(0,0,0,0.15),
              0 6px 12px rgba(0,0,0,0.1),
              0 0 0 3px rgba(255,215,0,0.6),
              inset 0 1px 0 rgba(255,255,255,0.4),
              inset 0 -1px 0 rgba(0,0,0,0.1)
            `
            : `
              0 6px 12px rgba(0,0,0,0.1),
              0 2px 4px rgba(0,0,0,0.06),
              inset 0 1px 0 rgba(255,255,255,0.3),
              inset 0 -1px 0 rgba(0,0,0,0.05)
            `,
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      />

      {/* 3D 底部阴影层 - 模仿图片的立体效果 */}
      <div
        style={{
          position: 'absolute',
          bottom: '-2px',
          left: '2px',
          right: '-2px',
          height: '8px',
          borderRadius: '0 0 16px 16px',
          background: `linear-gradient(180deg, ${theme.secondary}80 0%, ${theme.secondary}40 100%)`,
          filter: 'blur(1px)',
          zIndex: -1,
        }}
      />
      {/* 顶部字母标识 - 如图片所示 */}
      <div
        style={{
          position: 'absolute',
          top: '12%',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'Orbitron, monospace',
          fontSize: labelFontSize,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.9)',
          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        {label}
      </div>

      {/* 运算符和数字 - 直接显示在卡片上 */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '58%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'Orbitron, monospace',
            fontSize: valueFontSize,
            fontWeight: 800,
            color: '#ffffff',
            textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)',
            userSelect: 'none',
            letterSpacing: '-0.02em',
          }}
        >
          {value}
        </span>
      </div>

      {/* 选择顺序指示器 - 保持原有的金色设计但调整位置 */}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: '8%',
            right: '8%',
            width: `calc((var(--board-size) / ${gridSize}) * 0.18)`,
            height: `calc((var(--board-size) / ${gridSize}) * 0.18)`,
            borderRadius: '50%',
            background: `
              linear-gradient(135deg, #FFD700 0%, #FF8F00 50%, #FFD700 100%),
              radial-gradient(circle at 30% 30%, #FFF59D 0%, transparent 50%)
            `,
            border: '2px solid #ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `
              0 4px 12px rgba(255, 215, 0, 0.6), 
              0 0 20px rgba(255, 215, 0, 0.4),
              inset 0 2px 0 rgba(255,255,255,0.4)
            `,
            pointerEvents: 'none',
            zIndex: 10,
            animation: 'pulse 2s infinite',
          }}
        >
          <span
            style={{
              fontFamily: 'Orbitron, monospace',
              fontSize: `calc((var(--board-size) / ${gridSize}) * 0.1)`,
              fontWeight: 900,
              color: '#1a1a1a',
              lineHeight: 1,
              textShadow: '0 1px 0 rgba(255,255,255,0.5)',
            }}
          >
            {selectionOrder}
          </span>
        </div>
      )}
    </div>
  );
};

// 网格大小现在从gameLogic模块导入

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
  const [showSplash, setShowSplash] = useState(true);
  const [currentEquation, setCurrentEquation] = useState<string>('');
  const [currentResult, setCurrentResult] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [usedSolutions, setUsedSolutions] = useState<Set<string>>(new Set());
  const [foundSolutions, setFoundSolutions] = useState<Array<{ key: string, equation: string, cards: string }>>([]);
  const [score, setScore] = useState<number>(0);
  const [isAlreadyUsed, setIsAlreadyUsed] = useState<boolean>(false);
  const [completionState, setCompletionState] = useState<GameCompletionState>({
    totalSolutions: 0,
    foundSolutions: 0,
    isCompleted: false
  });
  const [allPossibleSolutions, setAllPossibleSolutions] = useState<Array<{ cards: [Card, Card, Card], equation: string }>>([]);
  const [gameStartTime, setGameStartTime] = useState<number>(Date.now());

  // 生成新游戏
  const generateNewGame = async () => {
    setIsLoading(true);

    try {
      // 使用新的游戏配置生成函数，内置错误处理和重试机制
      const gameConfig = await generateValidGameConfiguration(difficulty);

      // 获取所有解法用于显示
      const allSolutions = getSolutionsForTarget(gameConfig.cards, gameConfig.targetNumber);

      // 对所有解法进行数学等价性去重（使用 Math.js）
      const uniqueSolutions = deduplicateGameSolutions(allSolutions);

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

      // 使用去重后的解法数量初始化完成状态
      setCompletionState(createInitialCompletionState(uniqueSolutions.length));

      // 存储去重后的解法用于测试显示
      setAllPossibleSolutions(uniqueSolutions);

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
        const uniqueFallbackSolutions = deduplicateSolutions(fallbackSolutions);

        if (uniqueFallbackSolutions.length > 0) {
          setGameCards(fallbackCards);
          setTargetNumber(fallbackTarget);
          setCompletionState(createInitialCompletionState(uniqueFallbackSolutions.length));
          setAllPossibleSolutions(uniqueFallbackSolutions);
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

  // 生成解法的唯一标识符（使用 Math.js 处理数学等价性）
  const generateSolutionKey = (cards: CardSelection[]): string => {
    // 按选择顺序排序卡片
    const sortedCards = [...cards].sort((a, b) => a.order - b.order);

    // 转换为Card类型
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

    // 使用 Math.js 生成标准化键
    return generateNormalizedSolutionKey(cardObjects);
  };

  // 使用 Math.js 进行解法去重（替代手动的 case-by-case 处理）
  const deduplicateGameSolutions = (solutions: Array<{ cards: [Card, Card, Card], equation: string }>): Array<{ cards: [Card, Card, Card], equation: string }> => {
    return deduplicateSolutions(solutions);
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

  // 生成部分等式显示
  const generatePartialEquation = (cards: CardSelection[]): string => {
    if (cards.length === 0) {
      return '_ _ _ = ?';
    }

    // 按选择顺序排序
    const sortedCards = [...cards].sort((a, b) => a.order - b.order);

    // 创建等式字符串，用 _ 填充未选择的位置
    const parts: string[] = [];

    for (let i = 0; i < 3; i++) {
      if (i < sortedCards.length) {
        const card = sortedCards[i]!;
        // 第一个数字不显示运算符，只显示数字
        if (i === 0) {
          parts.push(`${card.number}`);
        } else {
          parts.push(`${card.operator}${card.number}`);
        }
      } else {
        parts.push('_');
      }
    }

    return `${parts.join(' ')} = ?`;
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

  // 使用游戏卡片数据，如果没有则生成占位符
  const totalCells = gridSize * gridSize;
  const displayCards = gameCards.length > 0 ? gameCards : [];

  // 如果卡片不够，用占位数据填充（遵循难度设置和重复限制）
  let cells = displayCards.slice(0, totalCells).map((card, index) => ({
    cardId: card.id,
    label: card.label,
    value: `${card.operator}${card.number}`,
    operator: card.operator,
    number: card.number,
  }));

  // 如果需要占位符卡片
  if (cells.length < totalCells) {
    const placeholderCards = generateCardsWithRepetitionLimit(difficulty, totalCells, gridSize);

    // 用占位符填充剩余位置
    for (let i = cells.length; i < totalCells; i++) {
      const placeholderCard = placeholderCards[i]!;
      cells.push({
        cardId: `placeholder-${i}`,
        label: labelForIndex(i),
        value: `${placeholderCard.operator}${placeholderCard.number}`,
        operator: placeholderCard.operator,
        number: placeholderCard.number,
      });
    }
  }



  // Handle splash screen
  const handleStartGame = (selectedDifficulty: GameDifficulty) => {
    setDifficulty(selectedDifficulty);
    setShowSplash(false);
  };

  // Show splash screen first
  if (showSplash) {
    return <SplashScreen onStart={handleStartGame} />;
  }

  return (
    <div className="game-layout">
      {/* Background */}
      <div
        className="layout-background"
        style={{
          backgroundImage: 'url("/background.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Information Panel - Top Center */}
      {!shouldTriggerCelebration(completionState) && (
        <div className="info-panel-container">
          <div className="info-panel-content">
            {/* 目标数字和分数显示 - 简化为横向长条 */}
            <div
              className="game-info-panel"
              style={{
                padding: '12px 24px',
                borderRadius: '12px !important', // 简单的圆角长方形
                clipPath: 'none !important', // 确保移除任何clipPath
                background: completionState.isCompleted
                  ? `
                linear-gradient(135deg, rgba(76, 175, 80, 0.95) 0%, rgba(46, 125, 50, 0.95) 100%),
                linear-gradient(45deg, rgba(129, 199, 132, 0.3) 0%, transparent 50%, rgba(76, 175, 80, 0.3) 100%)
              `
                  : `
                linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(255, 193, 7, 0.9) 100%),
                linear-gradient(45deg, rgba(255, 235, 59, 0.3) 0%, transparent 50%, rgba(255, 193, 7, 0.3) 100%)
              `,
                color: completionState.isCompleted ? '#fff' : '#1a1a1a',
                border: `2px solid ${completionState.isCompleted ? 'rgba(129, 199, 132, 0.8)' : 'rgba(255, 235, 59, 0.8)'}`,
                fontFamily: 'var(--font-primary)',
                fontSize: '16px',
                fontWeight: 600,
                textAlign: 'center',
                width: '100%',
                maxWidth: '400px', // 限制最大宽度，适合移动端
                minWidth: '280px', // 确保最小宽度
                boxShadow: completionState.isCompleted
                  ? `
                0 6px 16px rgba(76, 175, 80, 0.3), 
                0 0 30px rgba(76, 175, 80, 0.15),
                inset 0 1px 0 rgba(255,255,255,0.2)
              `
                  : `
                0 6px 16px rgba(255, 215, 0, 0.25), 
                0 0 30px rgba(255, 215, 0, 0.1),
                inset 0 1px 0 rgba(255,255,255,0.3)
              `,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* 整合的信息显示 - 多行布局 */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                gap: '12px'
              }}>
                {/* 第一行：目标数字、进度、分数 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  gap: '16px',
                  flexWrap: 'wrap'
                }}>
                  {/* 左侧：目标数字 */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minWidth: '80px'
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 500, marginBottom: '2px', opacity: 0.8 }}>
                      Target
                    </div>
                    <div
                      className="game-info-target"
                      style={{ fontSize: '24px', fontWeight: 800 }}
                    >
                      {isLoading ? '...' : targetNumber}
                    </div>
                  </div>

                  {/* 中间：进度信息 */}
                  <div style={{
                    flex: 1,
                    minWidth: '120px',
                    textAlign: 'center'
                  }}>
                    {completionState.isCompleted && (
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        marginBottom: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}>
                        🎉 <span>Complete!</span> 🎉
                      </div>
                    )}
                    <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '2px' }}>
                      {formatProgressText(completionState.foundSolutions, completionState.totalSolutions)}
                    </div>
                    {completionState.totalSolutions > 0 && (
                      <>
                        <div style={{ fontSize: '11px', fontWeight: 500, opacity: 0.9, marginBottom: '4px' }}>
                          {formatProgressPercentage(completionState.foundSolutions, completionState.totalSolutions)}
                        </div>
                        {/* 进度条 */}
                        <div
                          className="progress-bar-container"
                          style={{
                            width: '100%',
                            height: '4px',
                            background: 'rgba(0, 0, 0, 0.2)',
                            borderRadius: '2px',
                            overflow: 'hidden'
                          }}
                        >
                          <div style={{
                            width: `${(completionState.foundSolutions / completionState.totalSolutions) * 100}%`,
                            height: '100%',
                            background: completionState.isCompleted
                              ? 'linear-gradient(90deg, #4CAF50, #66BB6A)'
                              : 'linear-gradient(90deg, #FFC107, #FFB300)',
                            borderRadius: '2px',
                            transition: 'width 0.5s ease'
                          }} />
                        </div>
                      </>
                    )}
                  </div>

                  {/* 右侧：分数 */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minWidth: '60px'
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 500, marginBottom: '2px', opacity: 0.8 }}>
                      Score
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 800 }}>
                      {score}
                    </div>
                  </div>
                </div>

                {/* 第二行：已选择卡片、难度选择、新游戏按钮 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  gap: '12px',
                  flexWrap: 'wrap',
                  borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                  paddingTop: '8px'
                }}>
                  {/* 左侧：已选择卡片 */}
                  <div style={{
                    flex: 1,
                    minWidth: '120px'
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, marginBottom: '4px', opacity: 0.8 }}>
                      Selected: {selectedCards.length}/3
                    </div>
                    <div style={{ fontSize: '10px', opacity: 0.7, lineHeight: 1.2 }}>
                      {selectedCards.length > 0
                        ? selectedCards.map((card, index) => (
                          `${card.order}.${card.label}(${card.operator}${card.number})`
                        )).join(' ')
                        : 'Select 3 cards'
                      }
                    </div>
                  </div>

                  {/* 中间：当前难度显示 */}
                  <div style={{
                    minWidth: '100px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, marginBottom: '4px', opacity: 0.8 }}>
                      Difficulty
                    </div>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: completionState.isCompleted ? '#fff' : '#1a1a1a',
                      textTransform: 'capitalize'
                    }}>
                      {difficulty}
                    </div>
                  </div>

                  {/* 右侧：新游戏按钮 */}
                  <div style={{
                    minWidth: '80px'
                  }}>
                    <button
                      onClick={generateNewGame}
                      disabled={isLoading}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: isLoading
                          ? 'rgba(128,128,128,0.5)'
                          : 'rgba(0, 0, 0, 0.2)',
                        color: completionState.isCompleted ? '#fff' : '#1a1a1a',
                        border: '1px solid rgba(0, 0, 0, 0.2)',
                        fontFamily: 'var(--font-primary)',
                        fontSize: '10px',
                        fontWeight: 600,
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        width: '100%'
                      }}
                    >
                      {isLoading ? 'Loading...' : 'New Game'}
                    </button>
                  </div>
                </div>
              </div>
            </div>



            {/* Current Selection Display - Always Visible */}
            <div
              style={{
                padding: '16px 20px',
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
                width: '320px', // Fixed width
                minHeight: '120px', // Fixed minimum height
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxShadow: isCorrect === true && !isAlreadyUsed
                  ? '0 4px 12px rgba(76, 175, 80, 0.4), 0 0 20px rgba(76, 175, 80, 0.2)'
                  : isCorrect === true && isAlreadyUsed
                    ? '0 4px 12px rgba(255, 193, 7, 0.4), 0 0 20px rgba(255, 193, 7, 0.2)'
                    : isCorrect === false
                      ? '0 4px 12px rgba(244, 67, 54, 0.4), 0 0 20px rgba(244, 67, 54, 0.2)'
                      : '0 4px 12px rgba(0, 0, 0, 0.4)',
                transition: 'all 0.3s ease',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 400, marginBottom: '8px', opacity: 0.9 }}>
                Current Selection ({selectedCards.length}/3)
              </div>

              {/* Selected Cards Display */}
              <div style={{
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '8px',
                minHeight: '20px', // Ensures consistent height
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {selectedCards.length > 0 ? (
                  selectedCards
                    .sort((a, b) => a.order - b.order)
                    .map((card, index) => (
                      <span key={card.cardId}>
                        {card.label}({card.operator}{card.number})
                        {index < selectedCards.length - 1 ? ' → ' : ''}
                      </span>
                    ))
                ) : (
                  <span style={{ opacity: 0.7 }}>Select 3 cards to create equation</span>
                )}
              </div>

              {/* Equation Display */}
              <div style={{
                fontSize: '18px',
                fontWeight: 700,
                marginBottom: '8px',
                minHeight: '24px', // Ensures consistent height
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {currentEquation || generatePartialEquation(selectedCards)}
              </div>

              {/* Result Display */}
              <div style={{
                minHeight: '40px', // Ensures consistent height for result area
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {currentResult !== null ? (
                  <>
                    <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                      = {currentResult}
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 500 }}>
                      {isCorrect === true && !isAlreadyUsed && '🎉 Correct! +1 point'}
                      {isCorrect === true && isAlreadyUsed && '✅ Correct but already used'}
                      {isCorrect === false && `❌ Target is ${targetNumber}`}
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: '14px', opacity: 0.7 }}>
                    {selectedCards.length === 3 ? 'Calculating...' : 'Need 3 cards'}
                  </div>
                )}
              </div>
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
                  🎯 Found Solutions ({formatProgressText(completionState.foundSolutions, completionState.totalSolutions)})
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








          </div>
        </div>
      )}



      {/* Game Grid Container - Below Info Panel */}
      <div className="game-grid-container">
        <div className="game-grid-content">

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
                  🎉 Congratulations! 🎉
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
                  🏆 You found all <span style={{
                    color: '#FF6B6B',
                    fontSize: '24px',
                    fontWeight: 800,
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
                  }}>{completionState.totalSolutions}</span> solutions!
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
                      <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '2px' }}>Target</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#FF6B6B' }}>{targetNumber}</div>
                    </div>
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '2px' }}>Final Score</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#4ECDC4' }}>{score}</div>
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>Progress</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#96CEB4', marginBottom: '4px' }}>
                      {completionState.foundSolutions} / {completionState.totalSolutions} solutions
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#45B7D1' }}>
                      100% Complete!
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
                          <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '2px' }}>Time</div>
                          <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFEAA7' }}>
                            {minutes > 0 ? `${minutes}m ` : ''}{seconds}s
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
                  {isLoading ? '🔄 Loading...' : '🎮 Start New Game'}

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



          {/* Game Content */}
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
              <div>Generating game...</div>
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
      </div>

      {/* Test Solutions Panel - Below Game Grid */}
      {allPossibleSolutions.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: 'var(--layout-padding-desktop)',
          paddingTop: '0'
        }}>
          <div
            className="test-solutions-panel"
            style={{
              padding: '12px 16px',
              borderRadius: 12,
              background: 'rgba(33, 150, 243, 0.9)',
              color: '#fff',
              border: '2px solid rgba(255,255,255,0.3)',
              fontFamily: 'var(--font-primary)',
              fontSize: '12px',
              boxShadow: '0 8px 20px rgba(33, 150, 243, 0.3), 0 0 40px rgba(33, 150, 243, 0.1)',
              maxWidth: '600px',
              width: '100%'
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: '8px', fontSize: '14px', textAlign: 'center' }}>
              🔍 All Possible Solutions (Debug)
            </div>
            <div style={{ fontSize: '11px', marginBottom: '10px', opacity: 0.9, textAlign: 'center' }}>
              Target: {targetNumber} | Total: {allPossibleSolutions.length} solutions
            </div>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {allPossibleSolutions.map((solution, index) => {
                const cardsInfo = solution.cards.map(card => `${card.label}(${card.operator}${card.number})`).join(' → ');
                return (
                  <div key={`${solution.equation}-${index}`} style={{
                    marginBottom: '6px',
                    padding: '6px 8px',
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: '6px',
                    fontSize: '10px',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <div style={{ fontWeight: 600, color: '#E3F2FD', marginBottom: '2px' }}>
                      {index + 1}. {solution.equation} = {targetNumber}
                    </div>
                    <div style={{ opacity: 0.8, fontSize: '9px', lineHeight: 1.2 }}>
                      {cardsInfo}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
