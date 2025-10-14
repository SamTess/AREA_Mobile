import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { AreaHeader } from '../AreaHeader';

describe('AreaHeader', () => {
  const defaultProps = {
    title: 'My Automation',
    description: 'Keep workflows flowing',
    isEditing: false,
    onChangeTitle: jest.fn(),
    onChangeDescription: jest.fn(),
    onToggleEditing: jest.fn(),
    onRequestDelete: jest.fn(),
  };

  beforeEach(() => {
    Object.values(defaultProps).forEach((value) => {
      if (typeof value === 'function') {
        value.mockClear();
      }
    });
  });

  it('renders display mode and triggers edit/delete actions', () => {
    const { getAllByRole } = render(<AreaHeader {...defaultProps} />);

    const [editButton, deleteButton] = getAllByRole('button');
    fireEvent.press(editButton);
    expect(defaultProps.onToggleEditing).toHaveBeenCalled();

    fireEvent.press(deleteButton);
    expect(defaultProps.onRequestDelete).toHaveBeenCalled();
  });

  it('renders editable fields and propagates changes', () => {
    const { getByPlaceholderText } = render(
      <AreaHeader
        {...defaultProps}
        isEditing
      />
    );

    fireEvent.changeText(getByPlaceholderText('Area title'), 'Updated');
    expect(defaultProps.onChangeTitle).toHaveBeenCalledWith('Updated');

    fireEvent.changeText(getByPlaceholderText('Area description'), 'Details');
    expect(defaultProps.onChangeDescription).toHaveBeenCalledWith('Details');
  });
});
