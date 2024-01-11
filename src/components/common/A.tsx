import styled from 'styled-components';

import { Text } from './Text';

const AProto = styled(Text)`
  cursor: pointer;
`;

export const A = (props: (typeof Text)['defaultProps']) => <AProto as='a' {...props} />;
