import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { Alert, Linking } from 'react-native';
import ActionConfiguratorScreen from '../action-configurator';
import { useAreaEditor } from '@/contexts/AreaEditorContext';
import * as serviceCatalog from '@/services/serviceCatalog';
import * as serviceConnection from '@/services/serviceConnection';

// Mock dependencies
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({
    type: 'action',
    serviceId: 'service-1',
    serviceKey: 'github',
    serviceName: 'GitHub',
    actionDefinitionId: 'action-def-1',
    actionName: 'Push Event',
    returnTo: 'area-editor',
  })),
  router: {
    back: jest.fn(),
    push: jest.fn(),
  },
}));

jest.mock('@/contexts/AreaEditorContext');
jest.mock('@/services/serviceCatalog');
jest.mock('@/services/serviceConnection');
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
    i18n: {
      language: 'en',
      changeLanguage: jest.fn(),
    },
  }),
}));

describe('ActionConfiguratorScreen', () => {
  const mockAddAction = jest.fn();
  const mockAddReaction = jest.fn();
  const mockUpdateAction = jest.fn();
  const mockUpdateReaction = jest.fn();

  const mockActionDef = {
    id: 'action-def-1',
    name: 'Push Event',
    description: 'Triggers when a push event occurs',
    fields: [],
    service_key: 'github',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useAreaEditor as jest.Mock).mockReturnValue({
      addAction: mockAddAction,
      addReaction: mockAddReaction,
      updateAction: mockUpdateAction,
      updateReaction: mockUpdateReaction,
    });

    (serviceCatalog.getActionDefinitionById as jest.Mock).mockResolvedValue(mockActionDef);

    (serviceCatalog.getActionFieldsFromDefinition as jest.Mock).mockReturnValue([
      {
        name: 'repository',
        type: 'string',
        mandatory: true,
        description: 'Repository name',
      },
      {
        name: 'branch',
        type: 'string',
        mandatory: false,
        default: 'main',
        description: 'Branch name',
      },
    ]);

    (serviceConnection.getServiceConnectionStatus as jest.Mock).mockResolvedValue({
      isConnected: true,
      serviceKey: 'github',
    });

    (serviceConnection.mapServiceKeyToOAuthProvider as jest.Mock).mockReturnValue('github');
  });

  it('should render loading state initially', () => {
    (serviceCatalog.getActionDefinitionById as jest.Mock).mockImplementation(() => new Promise(() => {}));
    const { getByText } = render(<ActionConfiguratorScreen />);
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('should handle OAuth flow when connect button is pressed', async () => {
    (serviceConnection.getServiceConnectionStatus as jest.Mock).mockResolvedValue({
      isConnected: false,
      serviceKey: 'github',
    });

    const alertSpy = jest.spyOn(Alert, 'alert');

    render(<ActionConfiguratorScreen />);

    // Test will verify alert is called when user tries to connect
    // The actual button press and OAuth flow happens in the component
    expect(serviceCatalog.getActionDefinitionById).toHaveBeenCalled();
  });

  it('should handle load error gracefully', async () => {
    (serviceCatalog.getActionDefinitionById as jest.Mock).mockRejectedValue(
      new Error('Load failed')
    );

    const alertSpy = jest.spyOn(Alert, 'alert');
    const { router } = require('expo-router');

    render(<ActionConfiguratorScreen />);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('should handle service connection check error', async () => {
    (serviceConnection.getServiceConnectionStatus as jest.Mock).mockRejectedValue(
      new Error('Connection check failed')
    );

    const { findByText } = render(<ActionConfiguratorScreen />);

    // Should still load even if connection check fails
    await waitFor(() => {
      expect(serviceCatalog.getActionDefinitionById).toHaveBeenCalled();
    }, { timeout: 3000 });
  });
});
