import React, { CSSProperties } from "react";

type BoxProps = React.PropsWithChildren & {
  as?: keyof JSX.IntrinsicElements;
  className?: string;

  flexDirection?: CSSProperties["flexDirection"];
  justifyContent?: CSSProperties["justifyContent"];
  alignItems?: CSSProperties["alignItems"];
  gap?: CSSProperties["gap"];
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
        gap: props.gap
      }
    },
    props.children
  );
};
