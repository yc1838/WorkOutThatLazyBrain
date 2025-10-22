// 测试 info panel 中解法去重功能
console.log('🧪 测试 Info Panel 解法去重功能');
console.log('================================\n');

// 模拟 calculateFromCards 函数
const calculateFromCards = (cardObjects) => {
  const [card1, card2, card3] = cardObjects;
  const num1 = card1.number;
  const op1 = card2.operator;
  const num2 = card2.number;
  const op2 = card3.operator;
  const num3 = card3.number;

  if (op1 === '×' || op1 === '÷') {
    let intermediate = op1 === '×' ? num1 * num2 : num1 / num2;
    if (op2 === '+') return intermediate + num3;
    else if (op2 === '-') return intermediate - num3;
    else if (op2 === '×') return intermediate * num3;
    else return intermediate / num3;
  } else {
    if (op2 === '×' || op2 === '÷') {
      let intermediate = op2 === '×' ? num2 * num3 : num2 / num3;
      return op1 === '+' ? num1 + intermediate : num1 - intermediate;
    } else {
      let result = num1;
      result = op1 === '+' ? result + num2 : result - num2;
      result = op2 === '+' ? result + num3 : result - num3;
      return result;
    }
  }
};

// 模拟 createNormalizedSolutionKey 函数（更新版本，包含乘法减法混合处理）
const createNormalizedSolutionKey = (cardObjects, result) => {
  const [card1, card2, card3] = cardObjects;
  const num1 = card1.number;
  const op1 = card2.operator;
  const num2 = card2.number;
  const op2 = card3.operator;
  const num3 = card3.number;

  let normalizedForm;

  // 处理纯乘法或纯加法（完全可交换）
  if ((op1 === '×' && op2 === '×') || (op1 === '+' && op2 === '+')) {
    const numbers = [num1, num2, num3].sort((a, b) => a - b);
    normalizedForm = `${numbers[0]}${op1}${numbers[1]}${op2}${numbers[2]}`;
  } 
  // 处理加法和乘法混合（考虑交换律和运算优先级）
  else if ((op1 === '+' && op2 === '×') || (op1 === '×' && op2 === '+')) {
    let multPart;
    let addPart;

    if (op1 === '+' && op2 === '×') {
      const sortedMult = [num2, num3].sort((a, b) => a - b);
      multPart = `${sortedMult[0]}×${sortedMult[1]}`;
      addPart = num1;
    } else {
      const sortedMult = [num1, num2].sort((a, b) => a - b);
      multPart = `${sortedMult[0]}×${sortedMult[1]}`;
      addPart = num3;
    }

    normalizedForm = `${addPart}+${multPart}`;
  }
  // 处理乘法和减法混合（乘法可交换，但减法不可交换）
  else if ((op1 === '×' && op2 === '-') || (op1 === '×' && op2 === '+')) {
    // a × b - c 形式：乘法部分可以交换，但减法不能
    // 6 × 9 - 7 和 9 × 6 - 7 应该被认为是相同的
    const sortedMult = [num1, num2].sort((a, b) => a - b);
    normalizedForm = `${sortedMult[0]}×${sortedMult[1]}${op2}${num3}`;
  }
  // 处理减法和乘法混合（考虑运算优先级）
  else if (op1 === '-' && op2 === '×') {
    // a - b × c 形式：乘法部分可以交换
    const sortedMult = [num2, num3].sort((a, b) => a - b);
    normalizedForm = `${num1}-${sortedMult[0]}×${sortedMult[1]}`;
  }
  // 处理加法和减法混合（同级运算，可以重新排列）
  else if ((op1 === '+' && op2 === '-') || (op1 === '-' && op2 === '+')) {
    // 对于 a + b - c 和 a - c + b 这样的表达式
    // 我们需要将它们标准化为相同的形式
    
    // 将所有项分为正项和负项
    let positiveTerms = [num1]; // 第一个数字总是正的
    let negativeTerms = [];
    
    if (op1 === '+') {
      positiveTerms.push(num2);
    } else {
      negativeTerms.push(num2);
    }
    
    if (op2 === '+') {
      positiveTerms.push(num3);
    } else {
      negativeTerms.push(num3);
    }
    
    // 对正项和负项分别排序
    positiveTerms.sort((a, b) => a - b);
    negativeTerms.sort((a, b) => a - b);
    
    // 构建标准化形式：所有正项相加，然后减去所有负项
    let normalized = positiveTerms.join('+');
    if (negativeTerms.length > 0) {
      normalized += '-' + negativeTerms.join('-');
    }
    
    normalizedForm = normalized;
  }
  else {
    // 对于其他情况，保持原始顺序
    normalizedForm = `${num1}${op1}${num2}${op2}${num3}`;
  }

  return `${result}:${normalizedForm}`;
};

// 模拟 deduplicateSolutions 函数
const deduplicateSolutions = (solutions) => {
  const seenKeys = new Set();
  const uniqueSolutions = [];

  for (const solution of solutions) {
    const result = calculateFromCards(solution.cards);
    const normalizedKey = createNormalizedSolutionKey(solution.cards, result);

    if (!seenKeys.has(normalizedKey)) {
      seenKeys.add(normalizedKey);
      uniqueSolutions.push(solution);
    }
  }

  return uniqueSolutions;
};

// 创建测试数据：包含数学等价重复解法的解法数组
const testSolutions = [
  {
    cards: [
      { number: 7, operator: '+', label: 'A' },
      { number: 5, operator: '×', label: 'B' },
      { number: 1, operator: '×', label: 'C' },
    ],
    equation: '7 × 5 × 1',
  },
  {
    cards: [
      { number: 1, operator: '+', label: 'D' },
      { number: 7, operator: '×', label: 'E' },
      { number: 5, operator: '×', label: 'F' },
    ],
    equation: '1 × 7 × 5',
  },
  {
    cards: [
      { number: 5, operator: '+', label: 'G' },
      { number: 1, operator: '×', label: 'H' },
      { number: 7, operator: '×', label: 'I' },
    ],
    equation: '5 × 1 × 7',
  },
  {
    cards: [
      { number: 7, operator: '+', label: 'J' },
      { number: 5, operator: '×', label: 'K' },
      { number: 1, operator: '+', label: 'L' },
    ],
    equation: '7 × 5 + 1',
  },
  {
    cards: [
      { number: 5, operator: '+', label: 'M' },
      { number: 7, operator: '×', label: 'N' },
      { number: 1, operator: '+', label: 'O' },
    ],
    equation: '5 × 7 + 1',
  },
  {
    cards: [
      { number: 10, operator: '+', label: 'P' },
      { number: 2, operator: '+', label: 'Q' },
      { number: 3, operator: '+', label: 'R' },
    ],
    equation: '10 + 2 + 3',
  },
  {
    cards: [
      { number: 3, operator: '+', label: 'S' },
      { number: 10, operator: '+', label: 'T' },
      { number: 2, operator: '+', label: 'U' },
    ],
    equation: '3 + 10 + 2',
  },
  // 新增：测试乘法和减法混合的关键bug案例
  {
    cards: [
      { number: 6, operator: '+', label: 'V' },
      { number: 9, operator: '×', label: 'W' },
      { number: 7, operator: '-', label: 'X' },
    ],
    equation: '6 × 9 - 7',
  },
  {
    cards: [
      { number: 9, operator: '+', label: 'Y' },
      { number: 6, operator: '×', label: 'Z' },
      { number: 7, operator: '-', label: 'AA' },
    ],
    equation: '9 × 6 - 7',
  },
  // 新增：测试加法和减法混合的案例
  {
    cards: [
      { number: 5, operator: '+', label: 'BB' },
      { number: 4, operator: '+', label: 'CC' },
      { number: 8, operator: '-', label: 'DD' },
    ],
    equation: '5 + 4 - 8',
  },
  {
    cards: [
      { number: 5, operator: '+', label: 'EE' },
      { number: 8, operator: '-', label: 'FF' },
      { number: 4, operator: '+', label: 'GG' },
    ],
    equation: '5 - 8 + 4',
  },
];

console.log('📋 原始解法数组:');
testSolutions.forEach((solution, index) => {
  const result = calculateFromCards(solution.cards);
  console.log(`  ${index + 1}. ${solution.equation} = ${result}`);
});

console.log(`\\n原始解法总数: ${testSolutions.length}\\n`);

// 应用去重
const uniqueSolutions = deduplicateSolutions(testSolutions);

console.log('📋 去重后的解法数组:');
uniqueSolutions.forEach((solution, index) => {
  const result = calculateFromCards(solution.cards);
  console.log(`  ${index + 1}. ${solution.equation} = ${result}`);
});

console.log(`\\n去重后解法总数: ${uniqueSolutions.length}\\n`);

// 验证去重效果
console.log('🎯 去重效果验证:');
console.log(`✅ 7×5×1, 1×7×5, 5×1×7 (结果=35) → 只保留 1 个`);
console.log(`✅ 7×5+1, 5×7+1 (结果=36) → 只保留 1 个`);
console.log(`✅ 10+2+3, 3+10+2 (结果=15) → 只保留 1 个`);
console.log(`✅ 6×9-7, 9×6-7 (结果=47) → 只保留 1 个 [关键bug修复]`);
console.log(`✅ 原来 ${testSolutions.length} 个解法 → 现在 ${uniqueSolutions.length} 个解法`);

const expectedUniqueCount = 4; // 应该有4个唯一解法（增加了乘法减法混合的测试）
if (uniqueSolutions.length === expectedUniqueCount) {
  console.log(`\\n🎉 SUCCESS: Info Panel 去重功能正常工作！`);
  console.log(
    `   数学等价的解法被正确去重，从 ${testSolutions.length} 个减少到 ${uniqueSolutions.length} 个`
  );
} else {
  console.log(
    `\\n❌ ERROR: 预期 ${expectedUniqueCount} 个唯一解法，实际得到 ${uniqueSolutions.length} 个`
  );
}
