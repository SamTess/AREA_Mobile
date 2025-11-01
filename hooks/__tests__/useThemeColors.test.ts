import { renderHook } from '@testing-library/react-native';
import { useThemeColors } from '../useThemeColors';
import { useColorScheme } from 'nativewind';

jest.mock('nativewind', () => ({
  useColorScheme: jest.fn(),
}));

describe('useThemeColors', () => {
  it('should return light theme colors when color scheme is light', () => {
    (useColorScheme as jest.Mock).mockReturnValue({ colorScheme: 'light' });

    const { result } = renderHook(() => useThemeColors());

    expect(result.current.isDark).toBe(false);
    expect(result.current.primary).toBe('#333333');
    expect(result.current.background).toBe('#FFFFFF');
  });

  it('should return dark theme colors when color scheme is dark', () => {
    (useColorScheme as jest.Mock).mockReturnValue({ colorScheme: 'dark' });

    const { result } = renderHook(() => useThemeColors());

    expect(result.current.isDark).toBe(true);
    expect(result.current.primary).toBe('#A3A3A3');
    expect(result.current.background).toBe('#000000');
  });
});
