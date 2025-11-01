import { render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { Badge, BadgeText } from '../badge';
import { Button, ButtonIcon } from '../button';
import { Skeleton, SkeletonText } from '../skeleton';

describe('Skeleton extra branches', () => {
  it('renders with different speed values (1,2,3) without timing out', () => {
    const { rerender, toJSON } = render(
      <Skeleton speed={1} isLoaded>
        <Text>test</Text>
      </Skeleton>
    );
    expect(toJSON()).toBeTruthy();
    rerender(
      <Skeleton speed={2} isLoaded>
        <Text>test</Text>
      </Skeleton>
    );
    expect(toJSON()).toBeTruthy();
    rerender(
      <Skeleton speed={3} isLoaded>
        <Text>test</Text>
      </Skeleton>
    );
    expect(toJSON()).toBeTruthy();
  });

  it('SkeletonText respects _lines and gap and loaded branch', () => {
    const { rerender, toJSON } = render(
      <SkeletonText _lines={2} gap={4} isLoaded>
        <Text>initial</Text>
      </SkeletonText>
    );
    expect(toJSON()).toBeTruthy();
    rerender(
      <SkeletonText isLoaded>
        <Text testID="loaded">done</Text>
      </SkeletonText>
    );
    expect(toJSON()).toBeTruthy();
  });
});

describe('Badge outline and flags', () => {
  it('renders outline variant with style flags on text', () => {
    const { getByText } = render(
      <Badge variant="outline" action="info">
        <BadgeText bold underline italic strikeThrough highlight sub>
          OUT
        </BadgeText>
      </Badge>
    );
    expect(getByText('OUT')).toBeTruthy();
  });
});

describe('ButtonIcon default branch (no size, no explicit dims)', () => {
  it('renders with parent variants', () => {
    const { getByTestId } = render(
      <Button size="sm" variant="solid" action="positive">
        <ButtonIcon as={(p: any) => <Text {...p} testID="icon-parent" />} />
      </Button>
    );
    expect(getByTestId('icon-parent')).toBeTruthy();
  });
});
