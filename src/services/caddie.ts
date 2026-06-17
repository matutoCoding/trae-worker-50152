import { Caddie } from '@/types/golf';
import { mockCaddies } from '@/data/caddies';

export const getCaddies = async (): Promise<Caddie[]> => {
  console.log('[CaddieService] 获取球童列表');
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockCaddies;
};

export const getAvailableCaddies = async (): Promise<Caddie[]> => {
  console.log('[CaddieService] 获取可用球童');
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockCaddies.filter(c => c.status === 'available');
};

export const getCaddieById = async (id: string): Promise<Caddie | undefined> => {
  console.log('[CaddieService] 获取球童详情', { id });
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockCaddies.find(c => c.id === id);
};
