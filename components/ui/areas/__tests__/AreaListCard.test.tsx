import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AreaListCard } from '../AreaListCard';
import type { AreaDto } from '@/types/areas';

const mockAreaDto: AreaDto = {
  id: '1',
  name: 'Test Area',
  description: 'Test description',
  enabled: true,
  userId: 'user-123',
  userEmail: 'test@example.com',
  actions: [
    {
      id: 'action-1',
      actionDefinitionId: 'test-action',
      name: 'Test Action',
      parameters: {},
      activationConfig: {
        type: 'webhook',
        webhook_url: 'https://test.com'
      }
    }
  ],
  reactions: [
    {
      id: 'reaction-1',
      actionDefinitionId: 'test-reaction',
      name: 'Test Reaction',
      parameters: {},
      order: 1,
      continue_on_error: false
    }
  ],
  createdAt: '2025-10-01T10:00:00Z',
  updatedAt: '2025-10-13T08:30:00Z'
};

describe('AreaListCard', () => {
  it('renders area name and description', () => {
    const { getByText } = render(<AreaListCard area={mockAreaDto} />);

    expect(getByText('Test Area')).toBeTruthy();
    expect(getByText('Test description')).toBeTruthy();
  });

  it('displays enabled status correctly', () => {
    const { getByText } = render(<AreaListCard area={mockAreaDto} />);

    expect(getByText('Enabled')).toBeTruthy();
  });

  it('displays disabled status correctly', () => {
    const disabledArea = { ...mockAreaDto, enabled: false };
    const { getByText } = render(<AreaListCard area={disabledArea} />);

    expect(getByText('Disabled')).toBeTruthy();
  });

  it('shows action and reaction count for AreaDto', () => {
    const { getByText } = render(<AreaListCard area={mockAreaDto} />);

    expect(getByText('1 Action')).toBeTruthy();
    expect(getByText('1 Reaction')).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <AreaListCard area={mockAreaDto} onPress={onPressMock} />
    );

    fireEvent.press(getByText('Test Area'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('displays formatted date', () => {
    const { getByText } = render(<AreaListCard area={mockAreaDto} />);

    const dateText = new Date('2025-10-13T08:30:00Z').toLocaleDateString();
    expect(getByText(dateText)).toBeTruthy();
  });
});
