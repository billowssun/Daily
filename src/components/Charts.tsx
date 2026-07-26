import Svg, { Circle } from 'react-native-svg';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

export function ProgressRing({ value, size, color }: { value: number; size: number; color: string }) {
  const stroke = 6;
  const radiusValue = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radiusValue;
  const offset = circumference * (1 - value / 100);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radiusValue} stroke={colors.line} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radiusValue}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.ringCenter}>
        <Text style={styles.ringText}>{value}%</Text>
      </View>
    </View>
  );
}

export function MiniBars({ values }: { values: number[] }) {
  const max = Math.max(...values);

  return (
    <View style={styles.bars}>
      {values.map((value, index) => (
        <View
          key={`${value}-${index}`}
          style={[
            styles.bar,
            {
              height: 10 + (value / max) * 26,
              backgroundColor: index === values.length - 1 ? colors.green600 : colors.sage300,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  ringCenter: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  ringText: {
    color: colors.green700,
    fontSize: 13,
    fontWeight: '800',
  },
  bars: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 5,
    height: 38,
    justifyContent: 'center',
    marginTop: 13,
  },
  bar: {
    borderRadius: 999,
    width: 7,
  },
});
