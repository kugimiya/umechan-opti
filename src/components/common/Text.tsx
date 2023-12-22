import { CSSProperties } from 'react';
import { theme } from 'src/theme';
import styled from 'styled-components';

export enum TextVariant {
  'textHeading1' = 'textHeading1',
  'textBody1' = 'textBody1',
  'textBodyBold1' = 'textBodyBold1',
  'textButton' = 'textButton',
  'textInput' = 'textInput',
}

interface Props {
  variant?: TextVariant;
  color?: keyof typeof theme.colors;
  fontStyle?: CSSProperties['fontStyle'];
}

export const FONT_SIZES: Record<TextVariant, string> = {
  [TextVariant.textBody1]: '16rem',
  [TextVariant.textBodyBold1]: '16rem',
  [TextVariant.textHeading1]: '24rem',
  [TextVariant.textButton]: '12rem',
  [TextVariant.textInput]: '12rem',
};

export const LINE_HEIGHTS: Record<TextVariant, string> = {
  [TextVariant.textBody1]: '1em',
  [TextVariant.textBodyBold1]: '1em',
  [TextVariant.textHeading1]: '1em',
  [TextVariant.textButton]: '1em',
  [TextVariant.textInput]: '1em',
};

export const FONT_WEIGHTS: Record<TextVariant, string> = {
  [TextVariant.textBody1]: '400',
  [TextVariant.textBodyBold1]: '700',
  [TextVariant.textHeading1]: '700',
  [TextVariant.textButton]: '700',
  [TextVariant.textInput]: '400',
};

export const Text = styled.span<Props>`
  color: ${({ color = 'colorTextPrimary' }) => theme.colors[color]};
  font-style: ${(props) => props.fontStyle};
  font-size: ${({ variant = TextVariant.textBody1 }) => FONT_SIZES[variant]};
  font-weight: ${({ variant = TextVariant.textBody1 }) => FONT_WEIGHTS[variant]};
  line-height: ${({ variant = TextVariant.textBody1 }) => LINE_HEIGHTS[variant]};
  margin: 0;
`;
