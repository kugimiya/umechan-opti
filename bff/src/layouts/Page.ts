import { LayoutInterface, Layout } from 'core';
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";

class PageLayout extends Layout implements LayoutInterface {
  name = 'Page';
  direction: "row" | "column" = 'row';
  content: LayoutInterface['content'] = [
    { type: 'layout', item: LeftSidebar },
    { type: 'layout', item: RightSidebar }
  ];
}

export default PageLayout;
