import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import {
  Input,
  InputField,
  InputIcon,
  InputSlot,
} from '@/components/ui/input';

// Mock the useIconRenderProps hook
jest.mock('@/components/ui/utils/useIconRenderProps', () => ({
  useIconRenderProps: jest.fn(() => ({
    iconProps: {
      className: 'mocked-icon-class',
    },
  })),
}));

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <GluestackUIProvider>{component}</GluestackUIProvider>
  );
};

describe('Input', () => {
  it('renders with default props', () => {
    renderWithProvider(
      <Input>
        <InputField />
      </Input>
    );

    const input = screen.getByLabelText('Input Field');
    expect(input).toBeTruthy();
  });

  it('renders with custom placeholder', () => {
    renderWithProvider(
      <Input>
        <InputField placeholder="Enter text" />
      </Input>
    );

    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeTruthy();
  });

  it('handles onChangeText event', () => {
    const onChangeTextMock = jest.fn();
    renderWithProvider(
      <Input>
        <InputField onChangeText={onChangeTextMock} />
      </Input>
    );

    const input = screen.getByLabelText('Input Field');
    fireEvent.changeText(input, 'test value');
    expect(onChangeTextMock).toHaveBeenCalledWith('test value');
  });

  it('displays initial value', () => {
    renderWithProvider(
      <Input>
        <InputField value="initial value" />
      </Input>
    );

    const input = screen.getByDisplayValue('initial value');
    expect(input).toBeTruthy();
  });

  it('renders different variants correctly', () => {
    const { rerender } = renderWithProvider(
      <Input variant="outline">
        <InputField />
      </Input>
    );

    expect(screen.getByLabelText('Input Field')).toBeTruthy();

    rerender(
      <GluestackUIProvider>
        <Input variant="underlined">
          <InputField />
        </Input>
      </GluestackUIProvider>
    );

    expect(screen.getByLabelText('Input Field')).toBeTruthy();

    rerender(
      <GluestackUIProvider>
        <Input variant="rounded">
          <InputField />
        </Input>
      </GluestackUIProvider>
    );

    expect(screen.getByLabelText('Input Field')).toBeTruthy();
  });

  it('renders different sizes correctly', () => {
    const { rerender } = renderWithProvider(
      <Input size="sm">
        <InputField />
      </Input>
    );

    expect(screen.getByLabelText('Input Field')).toBeTruthy();

    rerender(
      <GluestackUIProvider>
        <Input size="md">
          <InputField />
        </Input>
      </GluestackUIProvider>
    );

    expect(screen.getByLabelText('Input Field')).toBeTruthy();

    rerender(
      <GluestackUIProvider>
        <Input size="lg">
          <InputField />
        </Input>
      </GluestackUIProvider>
    );

    expect(screen.getByLabelText('Input Field')).toBeTruthy();

    rerender(
      <GluestackUIProvider>
        <Input size="xl">
          <InputField />
        </Input>
      </GluestackUIProvider>
    );

    expect(screen.getByLabelText('Input Field')).toBeTruthy();
  });

  it('applies disabled state', () => {
    renderWithProvider(
      <Input isDisabled>
        <InputField />
      </Input>
    );

    // When disabled, the input should not be accessible
    expect(() => screen.getByLabelText('Input Field')).toThrow();
  });

  it('applies invalid state', () => {
    renderWithProvider(
      <Input isInvalid>
        <InputField />
      </Input>
    );

    const input = screen.getByLabelText('Input Field');
    expect(input).toBeTruthy();
  });

  it('applies custom className', () => {
    renderWithProvider(
      <Input className="custom-class">
        <InputField />
      </Input>
    );

    const input = screen.getByLabelText('Input Field');
    expect(input).toBeTruthy();
  });

  it('passes through additional props', () => {
    renderWithProvider(
      <Input testID="custom-input">
        <InputField />
      </Input>
    );

    const input = screen.getByTestId('custom-input');
    expect(input).toBeTruthy();
  });
});

describe('InputField', () => {
  it('renders text content', () => {
    renderWithProvider(
      <Input>
        <InputField value="test content" />
      </Input>
    );

    const input = screen.getByDisplayValue('test content');
    expect(input).toBeTruthy();
  });

  it('applies custom className', () => {
    renderWithProvider(
      <Input>
        <InputField className="custom-field-class" />
      </Input>
    );

    const input = screen.getByLabelText('Input Field');
    expect(input).toBeTruthy();
  });

  it('handles keyboard type', () => {
    renderWithProvider(
      <Input>
        <InputField keyboardType="email-address" />
      </Input>
    );

    const input = screen.getByLabelText('Input Field');
    expect(input.props.keyboardType).toBe('email-address');
  });

  it('handles secure text entry', () => {
    renderWithProvider(
      <Input>
        <InputField secureTextEntry />
      </Input>
    );

    const input = screen.getByLabelText('Input Field');
    expect(input.props.secureTextEntry).toBe(true);
  });
});

describe('InputIcon', () => {
  it('renders icon with props', () => {
    expect(() => {
      renderWithProvider(
        <Input>
          <InputIcon />
        </Input>
      );
    }).not.toThrow();
  });

  it('passes through icon props', () => {
    expect(() => {
      renderWithProvider(
        <Input>
          <InputIcon size="lg" />
        </Input>
      );
    }).not.toThrow();
  });
});

describe('InputSlot', () => {
  it('renders slot content', () => {
    renderWithProvider(
      <Input>
        <InputSlot>
          <InputIcon />
        </InputSlot>
        <InputField />
      </Input>
    );

    expect(screen.getByLabelText('Input Field')).toBeTruthy();
  });

  it('applies custom className', () => {
    renderWithProvider(
      <Input>
        <InputSlot className="custom-slot-class">
          <InputIcon />
        </InputSlot>
        <InputField />
      </Input>
    );

    expect(screen.getByLabelText('Input Field')).toBeTruthy();
  });
});