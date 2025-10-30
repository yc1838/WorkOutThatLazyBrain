import { context, reddit } from '@devvit/web/server';

export const createPost = async () => {
  const { subredditName } = context;
  if (!subredditName) {
    throw new Error('subredditName is required');
  }

  return await reddit.submitPost({
    subredditName: subredditName,
    title: '🧮 Equation Pyramid - Math Challenge Game',
    text: '🧮 Challenge your math skills!\n\nUse three cards to create equations that equal the target number.\n\n🎯 Multiple difficulty levels\n🏆 Track your progress\n\nClick to start playing!'
  });
};
