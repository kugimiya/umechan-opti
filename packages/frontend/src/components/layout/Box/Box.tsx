import React, { CSSProperties } from "react";

export type BoxProps = React.PropsWithChildren & {
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
  return React.createElement(
    props.as || "div",
    {
      className: props.className,
      style: {
        // TODO: move into css
        display: "flex",
        flexDirection: props.flexDirection,
        justifyContent: props.justifyContent,
        alignItems: props.alignItems,
        gap: props.gap,
        flexGrow: props.flexGrow,
        flexWrap: props.flexWrap,
        ...props.style,
      }
    },
    props.children
  );
};
