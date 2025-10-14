import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import AreasTab from '../areas';

// Mock the areas data
jest.mock('@/mocks/areas.json', () => ({
  areas: [
    {
      id: '1',
      name: 'Test Area 1',
      description: 'Description 1',
      enabled: true,
      userId: 'user-123',
      userEmail: 'test@example.com',
      actions: [],
      reactions: [],
      createdAt: '2025-10-01T10:00:00Z',
      updatedAt: '2025-10-13T08:30:00Z',
    },
    {
      id: '2',
      name: 'Test Area 2',
      description: 'Description 2',
      enabled: false,
      userId: 'user-123',
      userEmail: 'test@example.com',
      actions: [],
      reactions: [],
      createdAt: '2025-10-01T10:00:00Z',
      updatedAt: '2025-10-13T08:30:00Z',
    },
  ],
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

describe('AreasTab', () => {
  it('shows loading screen initially', () => {
    const { getByText } = render(<AreasTab />);

    expect(getByText('Loading Areas...')).toBeTruthy();
  });

  it('displays areas list after loading', async () => {
    const { getByText, queryByText } = render(<AreasTab />);

    await waitFor(() => expect(queryByText('Loading Areas...')).toBeNull());

    expect(getByText('Test Area 1')).toBeTruthy();
    expect(getByText('Test Area 2')).toBeTruthy();
  });

  it('displays header with title and new button', async () => {
    const { getByText } = render(<AreasTab />);

    await waitFor(() => expect(getByText('Areas')).toBeTruthy());
    expect(getByText('New')).toBeTruthy();
  });

  it('displays subtitle text', async () => {
    const { getByText } = render(<AreasTab />);

    await waitFor(() =>
      expect(getByText('Manage your automated workflows')).toBeTruthy()
    );
  });
});
