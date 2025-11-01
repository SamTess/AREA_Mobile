import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { Button, ButtonText, ButtonIcon, ButtonSpinner, ButtonGroup } from '../index';

// Mock the useStyleContext hook
jest.mock('@gluestack-ui/utils/nativewind-utils', () => ({
  ...jest.requireActual('@gluestack-ui/utils/nativewind-utils'),
  useStyleContext: jest.fn(() => ({
    variant: 'solid',
    size: 'md',
    action: 'primary',
  })),
}));

// Mock the useIconRenderProps hook
jest.mock('@/components/ui/utils/useIconRenderProps', () => ({
  useIconRenderProps: jest.fn(() => ({
    iconProps: {
      className: 'mock-icon-class',
    },
  })),
}));

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <GluestackUIProvider>
      {component}
    </GluestackUIProvider>
  );
};

describe('Button', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    renderWithProvider(<Button />);
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('renders with custom text', () => {
    renderWithProvider(
      <Button>
        <ButtonText>Click me</ButtonText>
      </Button>
    );
    expect(screen.getByText('Click me')).toBeTruthy();
  });

  it('handles onPress event', () => {
    const onPressMock = jest.fn();
    renderWithProvider(
      <Button onPress={onPressMock}>
        <ButtonText>Press me</ButtonText>
      </Button>
    );

    const button = screen.getByRole('button');
    fireEvent.press(button);
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('applies disabled state', () => {
    const onPressMock = jest.fn();
    renderWithProvider(
      <Button isDisabled onPress={onPressMock}>
        <ButtonText>Disabled</ButtonText>
      </Button>
    );

    const button = screen.getByRole('button');
    // Check that onPress is not called when button is disabled
    fireEvent.press(button);
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('renders different variants correctly', () => {
    const { rerender } = renderWithProvider(
      <Button variant="solid">
        <ButtonText>Solid</ButtonText>
      </Button>
    );
    expect(screen.getByText('Solid')).toBeTruthy();

    rerender(
      <GluestackUIProvider>
        <Button variant="outline">
          <ButtonText>Outline</ButtonText>
        </Button>
      </GluestackUIProvider>
    );
    expect(screen.getByText('Outline')).toBeTruthy();

    rerender(
      <GluestackUIProvider>
        <Button variant="link">
          <ButtonText>Link</ButtonText>
        </Button>
      </GluestackUIProvider>
    );
    expect(screen.getByText('Link')).toBeTruthy();
  });

  it('renders different actions correctly', () => {
    const { rerender } = renderWithProvider(
      <Button action="primary">
        <ButtonText>Primary</ButtonText>
      </Button>
    );
    expect(screen.getByText('Primary')).toBeTruthy();

    rerender(
      <GluestackUIProvider>
        <Button action="secondary">
          <ButtonText>Secondary</ButtonText>
        </Button>
      </GluestackUIProvider>
    );
    expect(screen.getByText('Secondary')).toBeTruthy();

    rerender(
      <GluestackUIProvider>
        <Button action="positive">
          <ButtonText>Positive</ButtonText>
        </Button>
      </GluestackUIProvider>
    );
    expect(screen.getByText('Positive')).toBeTruthy();

    rerender(
      <GluestackUIProvider>
        <Button action="negative">
          <ButtonText>Negative</ButtonText>
        </Button>
      </GluestackUIProvider>
    );
    expect(screen.getByText('Negative')).toBeTruthy();
  });

  it('renders different sizes correctly', () => {
    const { rerender } = renderWithProvider(
      <Button size="xs">
        <ButtonText>XS</ButtonText>
      </Button>
    );
    expect(screen.getByText('XS')).toBeTruthy();

    rerender(
      <GluestackUIProvider>
        <Button size="sm">
          <ButtonText>SM</ButtonText>
        </Button>
      </GluestackUIProvider>
    );
    expect(screen.getByText('SM')).toBeTruthy();

    rerender(
      <GluestackUIProvider>
        <Button size="md">
          <ButtonText>MD</ButtonText>
        </Button>
      </GluestackUIProvider>
    );
    expect(screen.getByText('MD')).toBeTruthy();

    rerender(
      <GluestackUIProvider>
        <Button size="lg">
          <ButtonText>LG</ButtonText>
        </Button>
      </GluestackUIProvider>
    );
    expect(screen.getByText('LG')).toBeTruthy();

    rerender(
      <GluestackUIProvider>
        <Button size="xl">
          <ButtonText>XL</ButtonText>
        </Button>
      </GluestackUIProvider>
    );
    expect(screen.getByText('XL')).toBeTruthy();
  });

  it('applies custom className', () => {
    renderWithProvider(
      <Button className="custom-class">
        <ButtonText>Custom</ButtonText>
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button.props.className).toContain('custom-class');
  });

  it('passes through additional props', () => {
    renderWithProvider(
      <Button testID="custom-button" accessibilityLabel="Custom Button">
        <ButtonText>Test</ButtonText>
      </Button>
    );
    const button = screen.getByTestId('custom-button');
    expect(button.props.accessibilityLabel).toBe('Custom Button');
  });
});

describe('ButtonText', () => {
  it('renders text content', () => {
    renderWithProvider(
      <Button>
        <ButtonText>Hello World</ButtonText>
      </Button>
    );
    expect(screen.getByText('Hello World')).toBeTruthy();
  });

  it('applies custom className', () => {
    renderWithProvider(
      <Button>
        <ButtonText className="custom-text-class">Text</ButtonText>
      </Button>
    );
    const text = screen.getByText('Text');
    expect(text.props.className).toContain('custom-text-class');
  });
});

describe('ButtonIcon', () => {
  it('renders icon with props', () => {
    const MockIcon = () => <div>Icon</div>;

    renderWithProvider(
      <Button>
        <ButtonIcon as={MockIcon} size="md" />
      </Button>
    );

    // The icon should be rendered (mocked)
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('passes through icon props', () => {
    const MockIcon = () => <div>Icon</div>;

    renderWithProvider(
      <Button>
        <ButtonIcon as={MockIcon} height={24} width={24} />
      </Button>
    );

    expect(screen.getByRole('button')).toBeTruthy();
  });
});

describe('ButtonSpinner', () => {
  it('renders spinner', () => {
    renderWithProvider(
      <Button>
        <ButtonSpinner />
      </Button>
    );
    expect(screen.getByRole('button')).toBeTruthy();
  });
});

describe('ButtonGroup', () => {
  it('renders group of buttons', () => {
    renderWithProvider(
      <ButtonGroup>
        <Button>
          <ButtonText>Button 1</ButtonText>
        </Button>
        <Button>
          <ButtonText>Button 2</ButtonText>
        </Button>
      </ButtonGroup>
    );

    expect(screen.getByText('Button 1')).toBeTruthy();
    expect(screen.getByText('Button 2')).toBeTruthy();
  });

  it('applies different space variants', () => {
    const { rerender } = renderWithProvider(
      <ButtonGroup space="xs">
        <Button>
          <ButtonText>Btn</ButtonText>
        </Button>
      </ButtonGroup>
    );
    expect(screen.getByText('Btn')).toBeTruthy();

    rerender(
      <GluestackUIProvider>
        <ButtonGroup space="lg">
          <Button>
            <ButtonText>Btn</ButtonText>
          </Button>
        </ButtonGroup>
      </GluestackUIProvider>
    );
    expect(screen.getByText('Btn')).toBeTruthy();
  });

  it('applies flexDirection variants', () => {
    const { rerender } = renderWithProvider(
      <ButtonGroup flexDirection="row">
        <Button>
          <ButtonText>Btn</ButtonText>
        </Button>
      </ButtonGroup>
    );
    expect(screen.getByText('Btn')).toBeTruthy();

    rerender(
      <GluestackUIProvider>
        <ButtonGroup flexDirection="column">
          <Button>
            <ButtonText>Btn</ButtonText>
          </Button>
        </ButtonGroup>
      </GluestackUIProvider>
    );
    expect(screen.getByText('Btn')).toBeTruthy();
  });

  it('applies isAttached prop', () => {
    renderWithProvider(
      <ButtonGroup isAttached>
        <Button>
          <ButtonText>Btn</ButtonText>
        </Button>
      </ButtonGroup>
    );
    expect(screen.getByText('Btn')).toBeTruthy();
  });
});