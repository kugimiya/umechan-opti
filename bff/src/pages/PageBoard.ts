import PageBoardLayout from '../layouts/PageBoardLayout';
import { Page } from 'core';

class PageBoard extends Page {
  constructor() {
    super(
      'PageBoard',
      PageBoardLayout,
      [
        ['boardId', { type: 'string' }],
        ['page', { type: 'string' }],
      ],
    );
  }
}

export default PageBoard;
