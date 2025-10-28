import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LinkDetailsSheet } from '../LinkDetailsSheet';
import type { Connection } from '@/types/area-detail';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}));

describe('LinkDetailsSheet', () => {
  const mockConnection: Connection = {
    from: 'card-1',
    to: 'card-2',
    order: 1,
  };

  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();
  const mockOnRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when not visible', () => {
    const { queryByText } = render(
      <LinkDetailsSheet
        visible={false}
        connection={mockConnection}
        onClose={mockOnClose}
        onSave={mockOnSave}
        onRemove={mockOnRemove}
      />
    );

    expect(queryByText('Link Details')).toBeNull();
  });

  it('should not render when connection is null', () => {
    const { queryByText } = render(
      <LinkDetailsSheet
        visible={true}
        connection={null}
        onClose={mockOnClose}
        onSave={mockOnSave}
        onRemove={mockOnRemove}
      />
    );

    expect(queryByText('Link Details')).toBeNull();
  });

  it('should display current order value', () => {
    const { getByDisplayValue } = render(
      <LinkDetailsSheet
        visible={true}
        connection={mockConnection}
        onClose={mockOnClose}
        onSave={mockOnSave}
        onRemove={mockOnRemove}
      />
    );

    expect(getByDisplayValue('1')).toBeTruthy();
  });

  it('should update order when input changes', () => {
    const { getByDisplayValue } = render(
      <LinkDetailsSheet
        visible={true}
        connection={mockConnection}
        onClose={mockOnClose}
        onSave={mockOnSave}
        onRemove={mockOnRemove}
      />
    );

    const input = getByDisplayValue('1');
    fireEvent.changeText(input, '5');

    expect(input.props.value).toBe('5');
  });

  it('should call onClose when close button is pressed', () => {
    const { getByTestId, UNSAFE_getByType } = render(
      <LinkDetailsSheet
        visible={true}
        connection={mockConnection}
        onClose={mockOnClose}
        onSave={mockOnSave}
        onRemove={mockOnRemove}
      />
    );

    // Find the close button (X icon)
    const closeButtons = UNSAFE_getByType(require('lucide-react-native').X);
    if (closeButtons) {
      fireEvent.press(closeButtons.parent);
    }

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should update order state when connection prop changes', () => {
    const { rerender, getByDisplayValue } = render(
      <LinkDetailsSheet
        visible={true}
        connection={mockConnection}
        onClose={mockOnClose}
        onSave={mockOnSave}
        onRemove={mockOnRemove}
      />
    );

    expect(getByDisplayValue('1')).toBeTruthy();

    const newConnection: Connection = {
      ...mockConnection,
      order: 5,
    };

    rerender(
      <LinkDetailsSheet
        visible={true}
        connection={newConnection}
        onClose={mockOnClose}
        onSave={mockOnSave}
        onRemove={mockOnRemove}
      />
    );

    expect(getByDisplayValue('5')).toBeTruthy();
  });

  it('should handle connection with undefined order', () => {
    const connectionWithoutOrder: Connection = {
      from: 'card-1',
      to: 'card-2',
    };

    const { getByDisplayValue } = render(
      <LinkDetailsSheet
        visible={true}
        connection={connectionWithoutOrder}
        onClose={mockOnClose}
        onSave={mockOnSave}
        onRemove={mockOnRemove}
      />
    );

    expect(getByDisplayValue('1')).toBeTruthy();
  });

  it('should not call onSave or onRemove if connection is null', async () => {
    const { rerender, getByText, queryByText } = render(
      <LinkDetailsSheet
        visible={true}
        connection={mockConnection}
        onClose={mockOnClose}
        onSave={mockOnSave}
        onRemove={mockOnRemove}
      />
    );

    // Render with null connection
    rerender(
      <LinkDetailsSheet
        visible={true}
        connection={null}
        onClose={mockOnClose}
        onSave={mockOnSave}
        onRemove={mockOnRemove}
      />
    );

    expect(queryByText('Save')).toBeNull();
  });
});
