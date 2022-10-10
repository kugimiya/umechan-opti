import { CSSProperties } from 'react';
import { theme } from 'src/theme';
import styled from 'styled-components';

interface Props {
  display?: CSSProperties['display'];
  overflow?: CSSProperties['overflow'];

  flexDirection?: CSSProperties['flexDirection'];
  justifyContent?: CSSProperties['justifyContent'];
  alignItems?: CSSProperties['alignItems'];
  flexGrow?: CSSProperties['flexGrow'];
  flexWrap?: CSSProperties['flexWrap'];

  gap?: CSSProperties['gap'];
  padding?: CSSProperties['padding'];
  margin?: CSSProperties['margin'];

  width?: CSSProperties['width'];
  minWidth?: CSSProperties['minWidth'];
  maxWidth?: CSSProperties['maxWidth'];

  height?: CSSProperties['height'];
  minHeight?: CSSProperties['minHeight'];
  maxHeight?: CSSProperties['maxHeight'];

  backgroundColor?: keyof typeof theme.colors;
  border?: keyof typeof theme.colors;
  borderRadius?: CSSProperties['borderRadius'];
}

export const Box = styled.div<Props>`
  display: ${(props) => props.display || 'flex'};
  overflow: ${(props) => props.overflow};

  flex-direction: ${(props) => props.flexDirection};
  justify-content: ${(props) => props.justifyContent};
  align-items: ${(props) => props.alignItems};
  flex-grow: ${(props) => props.flexGrow};
  flex-wrap: ${(props) => props.flexWrap};

  gap: ${(props) => props.gap};
  padding: ${(props) => props.padding};
  margin: ${(props) => props.margin};

  width: ${(props) => props.width};
  min-width: ${(props) => props.minWidth};
  max-width: ${(props) => props.maxWidth};

  height: ${(props) => props.height};
  min-height: ${(props) => props.minHeight};
  max-height: ${(props) => props.maxHeight};

  background-color: ${(props) =>
    props.backgroundColor ? theme.colors[props.backgroundColor] : undefined};
  border: ${(props) => `1px solid ${props.border ? theme.colors[props.border] : undefined}`};
  border-radius: ${(props) => props.borderRadius};
`;
