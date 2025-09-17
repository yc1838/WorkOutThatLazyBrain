import { context, reddit } from '@devvit/web/server';

export const createPost = async () => {
  const { subredditName } = context;
  if (!subredditName) {
    throw new Error('subredditName is required');
  }

  return await reddit.submitCustomPost({
    splash: {
      appDisplayName: 'Operation Code 0 - MOST SO CALLED NERDS CANT EVEN CALCULATE',
    },
    subredditName: subredditName,
    title: '"Nerds\'s Fav Diabolically Difficult Games"',
  });
};
