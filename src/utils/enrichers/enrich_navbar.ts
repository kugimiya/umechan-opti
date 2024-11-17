import { EpdsBoard } from "@/types/epds";
import { LinkItem } from "@/types/utils";

export const enrich_navbar = (boards: EpdsBoard[]) => {
  const boards_items: LinkItem[] = boards.map((board) => ({
    title: board.name,
    url: `/board/${board.tag}`,
  }));

  const nav_items: LinkItem[] = [
    { title: 'Главная', url: '/' },
    { title: 'Feed', url: '/feed' },
    { title: 'Записки мочератора', url: '/moderka/logs' },
  ];

  const chans_items: LinkItem[] = [
    { title: 'Шизач', url: 'https://scheoble.xyz/', target: '_blank' },
    { title: 'Писсичан', url: 'https://pissychan.oxore.net/', target: '_blank' },
    { title: 'Оно живое', url: 'http://u05917ya.bget.ru/', target: '_blank' },
  ];

  const other_items: LinkItem[] = [
    { title: 'Дискорд', url: 'https://discord.gg/DhhjsVgXBG', target: '_blank' },
    { title: 'Исходники', url: 'https://github.com/U-Me-Chan', target: '_blank' },
    { title: 'Модерка', url: '/moderka' },
  ];

  return {
    'Навигация': nav_items,
    'Доски': boards_items,
    'Наши чаны': chans_items,
    'Другие ссылки': other_items,
  };
}
