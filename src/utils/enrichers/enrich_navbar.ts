import { EpdsBoard } from "@/types/epds";
import { LinkItem } from "@/types/utils";
import { getFeatureFlags } from "../get_feature_flags";

export const enrich_navbar = (boards: EpdsBoard[], unmod: 'true' | 'false') => {
  const { IS_MODERKA_ENABLED } = getFeatureFlags();

  const boards_items: LinkItem[] = boards.map((board) => ({
    title: board.name,
    url: unmod === 'true' ? `/board/${board.tag}?unmod=true` : `/board/${board.tag}`,
  }));

  const nav_items: LinkItem[] = [
    { title: 'Главная', url: unmod === 'true' ? '/feed?unmod=true' : '/feed' },
  ];

  if (IS_MODERKA_ENABLED) {
    nav_items.push({ title: 'Записки мочератора', url: unmod === 'true' ? '/moderka/logs?unmod=true' : '/moderka/logs' });
  }

  const chans_items: LinkItem[] = [
    { title: 'Шизач', url: 'https://scheoble.xyz/', target: '_blank' },
    { title: 'Писсичан', url: 'https://pissychan.oxore.net/', target: '_blank' },
    { title: 'Оно живое', url: 'http://u05917ya.bget.ru/', target: '_blank' },
  ];

  const other_items: LinkItem[] = [
    { title: 'Дискорд', url: 'https://discord.gg/DhhjsVgXBG', target: '_blank' },
    { title: 'Исходники', url: 'https://github.com/U-Me-Chan', target: '_blank' },
  ];

  if (IS_MODERKA_ENABLED) {
    other_items.push({ title: 'Модерка', url: '/moderka' });
  }

  return {
    'Навигация': nav_items,
    'Доски': boards_items,
    'Наши чаны': chans_items,
    'Другие ссылки': other_items,
  };
}
