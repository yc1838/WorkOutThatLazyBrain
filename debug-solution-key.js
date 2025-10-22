// Debug the solution key generation
console.log('🔍 Debugging Solution Key Generation');
console.log('====================================\n');

const generateSolutionKey = (cards) => {
  const sortedCards = [...cards].sort((a, b) => a.order - b.order);
  return sortedCards.map(card => `${card.operator}${card.number}`).join('|');
};

// Test case: Same equation, different card positions
console.log('Test 1: Same equation (+7, ×1, +2), different card positions');

const scenario1 = [
  { cardId: 'card-A', operator: '+', number: 7, order: 1, label: 'A' },
  { cardId: 'card-B', operator: '×', number: 1, order: 2, label: 'B' },
  { cardId: 'card-C', operator: '+', number: 2, order: 3, label: 'C' }
];

const scenario2 = [
  { cardId: 'card-X', operator: '+', number: 7, order: 1, label: 'X' },
  { cardId: 'card-Y', operator: '×', number: 1, order: 2, label: 'Y' },
  { cardId: 'card-Z', operator: '+', number: 2, order: 3, label: 'Z' }
];

const key1 = generateSolutionKey(scenario1);
const key2 = generateSolutionKey(scenario2);

console.log(`Scenario 1: Cards A(+7), B(×1), C(+2) → Key: "${key1}"`);
console.log(`Scenario 2: Cards X(+7), Y(×1), Z(+2) → Key: "${key2}"`);
console.log(`Are they equal? ${key1 === key2} ${key1 === key2 ? '✅' : '❌'}\n`);

// Test case: Different order (should be different)
console.log('Test 2: Different order should be different');

const scenario3 = [
  { cardId: 'card-A', operator: '×', number: 1, order: 1, label: 'A' },
  { cardId: 'card-B', operator: '+', number: 7, order: 2, label: 'B' },
  { cardId: 'card-C', operator: '+', number: 2, order: 3, label: 'C' }
];

const key3 = generateSolutionKey(scenario3);
console.log(`Scenario 3: Cards A(×1), B(+7), C(+2) → Key: "${key3}"`);
console.log(`Key1 vs Key3 equal? ${key1 === key3} ${key1 === key3 ? '❌ (Should be false)' : '✅'}\n`);

// Test case: Same numbers, different operators
console.log('Test 3: Same numbers, different operators');

const scenario4 = [
  { cardId: 'card-A', operator: '-', number: 7, order: 1, label: 'A' },
  { cardId: 'card-B', operator: '×', number: 1, order: 2, label: 'B' },
  { cardId: 'card-C', operator: '+', number: 2, order: 3, label: 'C' }
];

const key4 = generateSolutionKey(scenario4);
console.log(`Scenario 4: Cards A(-7), B(×1), C(+2) → Key: "${key4}"`);
console.log(`Key1 vs Key4 equal? ${key1 === key4} ${key1 === key4 ? '❌ (Should be false)' : '✅'}\n`);

console.log('🎯 Summary:');
console.log('- Same equation with different card positions: Should be SAME');
console.log('- Different order of operations: Should be DIFFERENT');
console.log('- Different operators: Should be DIFFERENT');
