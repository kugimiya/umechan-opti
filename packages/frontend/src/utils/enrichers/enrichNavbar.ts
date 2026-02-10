import { EpdsBoard, LinkItem, UnmodFlag } from "@umechan/shared";
import { getFeatureFlags } from "../getFeatureFlags";

export const enrichNavbar = (boards: EpdsBoard[], unmod: UnmodFlag) => {
  const { IS_MODERKA_ENABLED } = getFeatureFlags();

  const boardsItems: LinkItem[] = boards.map((board) => ({
    title: board.name,
    url: unmod === 'true' ? `/board/${board.tag}?unmod=true` : `/board/${board.tag}`,
  }));

  const navItems: LinkItem[] = [
    { title: 'Главная', url: unmod === 'true' ? '/feed?unmod=true' : '/feed' },
  ];

  if (IS_MODERKA_ENABLED) {
    navItems.push({ title: 'Записки мочератора', url: unmod === 'true' ? '/moderka/logs?unmod=true' : '/moderka/logs' });
  }

  const chansItems: LinkItem[] = [
    { title: 'Шизач', url: 'https://scheoble.xyz/', target: '_blank' },
    { title: 'Писсичан', url: 'https://pissychan.oxore.net/', target: '_blank' },
    { title: 'Оно живое', url: 'http://u05917ya.bget.ru/', target: '_blank' },
  ];

  const otherItems: LinkItem[] = [
    { title: 'Дискорд', url: 'https://discord.gg/DhhjsVgXBG', target: '_blank' },
    { title: 'Исходники', url: 'https://github.com/U-Me-Chan', target: '_blank' },
  ];

  if (IS_MODERKA_ENABLED) {
    otherItems.push({ title: 'Модерка', url: '/moderka' });
  }

  return {
    'Навигация': navItems,
    'Доски': boardsItems,
    'Наши чаны': chansItems,
    'Другие ссылки': otherItems,
  };
}
