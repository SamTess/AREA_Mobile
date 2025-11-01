import { useIconRenderProps } from '../useIconRenderProps';

describe('useIconRenderProps', () => {
  const baseClassName = (c?: string) => `base-${c ?? 'none'}`;
  const buildClassName = (c?: string) => `build-${c ?? 'none'}`;

  it('returns size when size is a number', () => {
    const result = useIconRenderProps({
      className: 'foo',
      size: 24,
      baseClassName,
      buildClassName,
    });

    expect(result.iconProps.size).toBe(24);
    expect(result.iconProps.className).toBe('base-foo');
  });

  it('returns baseClassName when height/width provided and size undefined', () => {
    const result = useIconRenderProps({
      className: 'bar',
      height: 12,
      baseClassName,
      buildClassName,
    });

    expect(result.iconProps.size).toBeUndefined();
    expect(result.iconProps.className).toBe('base-bar');
  });

  it('falls back to buildClassName when no size/height/width', () => {
    const result = useIconRenderProps({
      className: 'baz',
      baseClassName,
      buildClassName,
    });

    expect(result.iconProps.size).toBeUndefined();
    expect(result.iconProps.className).toBe('build-baz');
  });
});
