import React, { CSSProperties, DOMAttributes } from "react";

export type BoxProps = React.PropsWithChildren & DOMAttributes<'div'> & {
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;

  flexDirection?: CSSProperties["flexDirection"];
  justifyContent?: CSSProperties["justifyContent"];
  alignItems?: CSSProperties["alignItems"];
  gap?: CSSProperties["gap"];
  flexGrow?: CSSProperties["flexGrow"];
  flexWrap?: CSSProperties["flexWrap"];

  style?: CSSProperties;
}

export const Box = (props: BoxProps) => {
  const {
    as,
    className,
    flexDirection,
    justifyContent,
    alignItems,
    gap,
    flexGrow,
    flexWrap,
    style,
    children,
    ...otherProps
  } = props;

  return React.createElement(
    as || "div",
    {
      className: className,
      style: {
        // TODO: move into css
        display: "flex",
        flexDirection: flexDirection,
        justifyContent: justifyContent,
        alignItems: alignItems,
        gap: gap,
        flexGrow: flexGrow,
        flexWrap: flexWrap,
        ...style,
      },
      ...otherProps
    },
    children
  );
};
