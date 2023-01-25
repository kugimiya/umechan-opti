import styled from 'styled-components';

import { theme } from '../../../theme';
import { Box } from '../../common/Box';

export const StyledPostInfo = styled(Box)`
  align-items: baseline;
  gap: 10px;

  @media ${theme.mobileBreakpoint} {
    flex-wrap: wrap;
  }
`;
