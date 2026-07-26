import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors } from '../theme';

export function PlantAvatar() {
  return (
    <Svg width={42} height={42} viewBox="0 0 42 42">
      <Circle cx="21" cy="21" r="21" fill={colors.avatarBg} />
      <Path d="M21 26C18 18 19 12 21 8C24 13 24 20 21 26Z" fill={colors.green600} />
      <Path d="M20 25C13 20 11 16 10 11C16 12 20 17 20 25Z" fill={colors.sage500} />
      <Path d="M22 25C29 20 31 16 32 11C26 12 22 17 22 25Z" fill={colors.sage500} />
      <Rect x="14" y="26" width="14" height="9" rx="3" fill={colors.clay200} />
      <Path d="M16 26H26L24 36H18L16 26Z" fill={colors.clay300} />
    </Svg>
  );
}
