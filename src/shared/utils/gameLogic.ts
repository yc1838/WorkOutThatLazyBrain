/**
 * 数学金字塔游戏 - 游戏逻辑工具函数
 * 
 * 这个文件包含游戏的核心逻辑函数，比如卡片生成、等式验证等
 * 所有函数都是纯函数，便于测试和调试
 */

import { Card, Operator, GameDifficulty, DifficultyConfig } from '../types/game';

// ===== 难度配置相关函数 =====

/**
 * 获取指定难度的配置信息
 * 
 * 根据难度等级返回相应的游戏参数配置
 * 
 * @param difficulty - 游戏难度等级
 * @returns {DifficultyConfig} 对应难度的配置信息
 */
export declare function getDifficultyConfig(difficulty: GameDifficulty): DifficultyConfig;

/**
 * 获取默认难度配置映射
 * 
 * 返回所有难度等级的预设配置
 * 
 * @returns {Record<GameDifficulty, DifficultyConfig>} 难度配置映射表
 */
export declare function getDefaultDifficultyConfigs(): Record<GameDifficulty, DifficultyConfig>;

// ===== 卡片生成相关函数 =====

/**
 * 生成游戏所需的10张卡片
 * 
 * 根据指定难度生成10张卡片，每张卡片包含：
 * - 一个字母标识（A到J）
 * - 一个随机的运算符（根据难度权重分配）
 * - 一个随机的数字（根据难度范围：easy=1-5, medium=1-9, hard=1-11）
 * - 在金字塔中的位置（0到9）
 * 
 * @param difficulty - 游戏难度等级，影响数字范围和运算符分布
 * @returns {Card[]} 包含10张卡片的数组，按金字塔位置排序
 */
export declare function generateCards(difficulty: GameDifficulty): Card[];

/**
 * 生成一个随机的运算符
 * 
 * 根据难度配置的权重随机选择运算符
 * 简单模式更倾向于+和-，困难模式所有运算符均衡分布
 * 
 * @param difficulty - 游戏难度等级，影响运算符的选择权重
 * @returns {Operator} 根据权重随机选择的运算符
 */
export declare function generateRandomOperator(difficulty: GameDifficulty): Operator;

/**
 * 生成一个随机的数字
 * 
 * 根据难度等级生成指定范围内的随机整数
 * - easy: 1-5
 * - medium: 1-9  
 * - hard: 1-11
 * 
 * @param difficulty - 游戏难度等级，决定数字范围
 * @returns {number} 指定范围内的随机数字（不包含0）
 */
export declare function generateRandomNumber(difficulty: GameDifficulty): number;

/**
 * 根据位置生成卡片标识字母
 * 
 * 将位置索引（0-9）转换为对应的字母标识（A-J）
 * 
 * @param position - 卡片在金字塔中的位置（0-9）
 * @returns {string} 对应的字母标识（A-J）
 */
export declare function generateCardLabel(position: number): string;

/**
 * 生成一个合适的目标数字
 * 
 * 根据生成的卡片内容和难度等级，计算出一个合理的目标数字
 * 确保至少有一种可能的解法（即至少有一组3张卡片能达到这个目标）
 * 不同难度有不同的目标数字范围
 * 
 * @param cards - 已生成的10张卡片
 * @param difficulty - 游戏难度等级，影响目标数字的范围
 * @returns {number} 合适的目标数字
 */
export declare function generateTargetNumber(cards: Card[], difficulty: GameDifficulty): number;

/**
 * 验证卡片组合是否有效
 * 
 * 检查生成的卡片是否满足游戏要求：
 * - 确保有足够的数字和运算符多样性
 * - 确保至少存在一种可能的解法
 * - 验证卡片符合当前难度的要求
 * 
 * @param cards - 要验证的卡片数组
 * @param difficulty - 游戏难度等级
 * @returns {boolean} 如果卡片组合有效返回true，否则返回false
 */
export declare function validateCardSet(cards: Card[], difficulty: GameDifficulty): boolean;

/**
 * 重新生成卡片直到获得有效组合
 * 
 * 如果第一次生成的卡片组合无效（比如没有可能的解法），
 * 会重新生成直到获得一个有效的组合
 * 
 * @param difficulty - 游戏难度等级
 * @param maxAttempts - 最大尝试次数，防止无限循环（默认100次）
 * @returns {Card[]} 有效的卡片组合
 * @throws {Error} 如果超过最大尝试次数仍无法生成有效组合
 */
export declare function generateValidCardSet(difficulty: GameDifficulty, maxAttempts?: number): Card[];
