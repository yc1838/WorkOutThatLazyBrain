/**
 * API类型定义文件
 * 
 * 定义前端和后端之间通信的数据格式
 * 包括原有的计数器功能和新的游戏功能
 */

// 引入游戏相关类型
import { GameSession, PlayerAnswer, LeaderboardEntry, GameDifficulty } from './game';

// ===== 原有的计数器功能API类型 =====

export type InitResponse = {
  type: 'init';
  postId: string;
  count: number;
  username: string;
};

export type IncrementResponse = {
  type: 'increment';
  postId: string;
  count: number;
};

export type DecrementResponse = {
  type: 'decrement';
  postId: string;
  count: number;
};

// ===== 新增的游戏功能API类型 =====

/**
 * 开始新游戏的请求类型
 * 玩家选择难度后发送给服务器
 */
export type StartGameRequest = {
  difficulty: GameDifficulty;       // 玩家选择的游戏难度
};

/**
 * 开始新游戏的响应类型
 * 返回完整的游戏会话信息，包含新生成的卡片和目标数字
 */
export type StartGameResponse = {
  type: 'start_game';
  gameSession: GameSession;         // 新创建的游戏会话
};

/**
 * 提交答案的请求类型
 * 玩家选择3张卡片后发送给服务器
 */
export type SubmitAnswerRequest = {
  gameId: string;                   // 游戏ID，标识是哪局游戏
  cardIds: [string, string, string]; // 玩家选择的3张卡片ID（固定3个）
};

/**
 * 提交答案的响应类型
 * 服务器验证答案后返回结果和更新后的游戏状态
 */
export type SubmitAnswerResponse = {
  type: 'submit_answer';
  isCorrect: boolean;               // 答案是否正确
  score: number;                    // 玩家当前总分
  equation: string;                 // 生成的等式字符串，如 "5 + 3 × 2"
  result: number;                   // 等式计算结果
  message: string;                  // 给玩家看的消息（正确/错误/重复等）
  gameSession: GameSession;         // 更新后的游戏会话
};

/**
 * 获取游戏状态的响应类型
 * 用于刷新或重新加载游戏时获取当前状态
 */
export type GetGameStateResponse = {
  type: 'game_state';
  gameSession: GameSession;         // 当前的游戏会话状态
};

/**
 * 获取排行榜的响应类型
 * 返回排行榜数据和当前玩家的排名
 */
export type GetLeaderboardResponse = {
  type: 'leaderboard';
  entries: LeaderboardEntry[];      // 排行榜条目列表（按分数排序）
  currentPlayerRank?: number;       // 当前玩家的排名（可选，如果玩家未上榜则为空）
};

/**
 * 重新开始游戏的响应类型
 * 创建一个新的游戏会话，重置所有状态
 */
export type RestartGameResponse = {
  type: 'restart_game';
  gameSession: GameSession;         // 新创建的游戏会话
};

/**
 * 通用错误响应类型
 * 当API调用出错时返回
 */
export type ErrorResponse = {
  type: 'error';
  message: string;                  // 错误消息
  code?: string;                    // 错误代码（可选）
};

/**
 * 游戏API响应的联合类型
 * 包含所有可能的游戏相关API响应
 */
export type GameApiResponse = 
  | StartGameResponse 
  | SubmitAnswerResponse 
  | GetGameStateResponse 
  | GetLeaderboardResponse 
  | RestartGameResponse 
  | ErrorResponse;
