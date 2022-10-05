import { CSSProperties } from 'react';
import styled from 'styled-components';

interface Props {
  color?: string;
  fontSize?: string;
  fontStyle?: CSSProperties['fontStyle'];
  fontWeight?: CSSProperties['fontWeight'];
}

export const Text = styled.span<Props>`
  color: ${(props) => props.color};
  font-size: ${(props) => props.fontSize || props.theme.defaultFontSize};
  font-style: ${(props) => props.fontStyle};
  font-weight: ${(props) => props.fontWeight};
`;
