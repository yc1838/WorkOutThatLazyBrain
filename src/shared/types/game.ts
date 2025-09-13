/**
 * 数学金字塔游戏 - 核心类型定义
 * 
 * 这个文件定义了游戏中所有主要的数据结构
 * 包括卡片、游戏会话、玩家答案等核心概念
 */

// 运算符类型 - 游戏中支持的四种数学运算
export type Operator = '+' | '-' | '×' | '÷';

/**
 * 游戏难度等级
 * - easy: 简单模式（数字1-5，主要是加减法）
 * - medium: 中等模式（数字1-9，包含乘除法）
 * - hard: 困难模式（数字1-11，复杂运算组合）
 */
export type GameDifficulty = 'easy' | 'medium' | 'hard';

/**
 * 难度配置类型
 * 定义每个难度等级的具体参数
 */
export type DifficultyConfig = {
  minNumber: number;        // 最小数字
  maxNumber: number;        // 最大数字
  operatorWeights: {        // 各运算符出现的权重
    '+': number;
    '-': number;
    '×': number;
    '÷': number;
  };
  targetRange: {            // 目标数字的范围
    min: number;
    max: number;
  };
};

/**
 * 卡片类型 - 代表金字塔中的一张六边形卡片
 * 
 * 每张卡片包含：
 * - 一个字母标识（A到J）
 * - 一个运算符（加减乘除）  
 * - 一个数字（0到9）
 */
export type Card = {
  id: string;           // 卡片的唯一标识符，用于程序内部识别
  label: string;        // 卡片上显示的字母标识，如 "A", "B", "C"...
  operator: Operator;   // 卡片上的运算符：+, -, ×, ÷
  number: number;       // 卡片上的数字：0-9
  position: number;     // 卡片在金字塔中的位置（0-9，从上到下，从左到右）
};

/**
 * 游戏状态枚举
 * - waiting: 等待开始
 * - playing: 游戏进行中
 * - finished: 游戏结束
 */
export type GameStatus = 'waiting' | 'playing' | 'finished';

/**
 * 玩家答案类型 - 记录玩家提交的一次答案
 * 
 * 包含选择的卡片、生成的等式、计算结果等信息
 */
export type PlayerAnswer = {
  cardIds: [string, string, string];  // 玩家选择的三张卡片的ID（固定3张）
  equation: string;                   // 根据选择生成的等式字符串，如 "5 + 3 × 2"
  result: number;                     // 等式的计算结果
  isCorrect: boolean;                 // 这次答案是否正确（结果是否等于目标数字）
  timestamp: number;                  // 提交答案的时间戳
};

/**
 * 游戏会话类型 - 代表一次完整的游戏
 * 
 * 包含游戏的所有状态信息：卡片、目标、分数、历史答案等
 */
export type GameSession = {
  gameId: string;                     // 游戏的唯一标识符
  postId: string;                     // 对应的Reddit帖子ID
  playerId: string;                   // 玩家ID（通常是Reddit用户名）
  difficulty: GameDifficulty;         // 游戏难度等级
  cards: Card[];                      // 这局游戏的10张卡片
  targetNumber: number;               // 目标数字（玩家需要通过等式达到这个数字）
  score: number;                      // 玩家当前分数
  answers: PlayerAnswer[];            // 玩家已经提交的所有答案
  status: GameStatus;                 // 当前游戏状态
  createdAt: number;                  // 游戏创建时间戳
  updatedAt: number;                  // 游戏最后更新时间戳
};

/**
 * 排行榜条目类型 - 代表排行榜上的一个玩家记录
 */
export type LeaderboardEntry = {
  playerId: string;                   // 玩家ID
  username: string;                   // 显示用的用户名
  score: number;                      // 玩家的最高分数
  gamesPlayed: number;                // 玩家总共玩了多少局游戏
  lastPlayed: number;                 // 最后一次游戏的时间戳
};

/**
 * 卡片选择状态类型 - 用于前端管理用户的卡片选择
 * 
 * 跟踪用户当前选中了哪些卡片，是否已经选够3张等
 */
export type CardSelectionState = {
  selectedCardIds: string[];          // 当前选中的卡片ID列表
  maxSelections: number;              // 最大可选择数量（固定为3）
  isValid: boolean;                   // 当前选择是否有效（是否恰好选中3张卡片）
};
