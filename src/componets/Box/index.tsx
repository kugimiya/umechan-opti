import classNames from 'classnames';
import React from 'react';

import cls from './styles.module.css';

export type BoxProps = {
  display?: React.CSSProperties['display'];
  gap?: React.CSSProperties['gap'];
  justifyContent?: React.CSSProperties['justifyContent'];
  alignItems?: React.CSSProperties['alignItems'];
  flexDirection?: React.CSSProperties['flexDirection'];
  flexWrap?: React.CSSProperties['flexWrap'];

  width?: React.CSSProperties['width'];
  padding?: React.CSSProperties['padding'];
  margin?: React.CSSProperties['margin'];

  component?: React.ElementType;
  styles?: React.CSSProperties;
  children?: React.ReactNode;
  className?: string;

  onClick?: () => void;
  customRef?: React.Ref<HTMLDivElement>;
  id?: string;
};

export function Box(props: BoxProps): JSX.Element {
  const {
    alignItems,
    justifyContent,
    width,
    flexDirection,
    flexWrap,
    display = 'flex',
    className,
    children,
    onClick,
    component,
    padding,
    margin,
    gap,
    styles = {},
    customRef,
    id,
  } = props;

  const completeClassName = classNames(
    display ? cls[`display_${display}`] : '',
    alignItems ? cls[`alignItems_${alignItems}`] : '',
    justifyContent ? cls[`justifyContent_${justifyContent}`] : '',
    flexWrap ? cls[`flexWrap_${flexWrap}`] : '',
    flexDirection ? cls[`flexDirection_${flexDirection}`] : '',
    className,
  );

  if (component) {
    const Wrapper = component;

    return (
      <Wrapper
        id={id}
        className={completeClassName}
        style={{
          width,
          padding,
          margin,
          gap,
          ...styles,
        }}
        onClick={onClick}
        ref={customRef}
      >
        {children}
      </Wrapper>
    );
  }

  return (
    <div
      id={id}
      className={completeClassName}
      style={{
        width,
        padding,
        margin,
        gap,
        ...styles,
      }}
      onClick={onClick}
      ref={customRef}
    >
      {children}
    </div>
  );
}

export default Box;