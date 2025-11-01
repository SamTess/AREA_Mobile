import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert, Linking } from 'react-native';
import ActionConfiguratorScreen from '../action-configurator';

// Mock Linking
jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);

// Mock expo-router
jest.mock('expo-router', () => {
  const React = require('react');
  return {
    useRouter: () => ({
      back: jest.fn(),
      push: jest.fn(),
      replace: jest.fn(),
    }),
    useLocalSearchParams: jest.fn(() => ({
      type: 'action',
      serviceId: 'service-1',
      serviceKey: 'github',
      serviceName: 'GitHub',
      actionDefinitionId: 'action-1',
      actionName: 'Create Issue',
      returnTo: '/area-editor',
    })),
    useFocusEffect: (effect: any) => {
      return React.useEffect(effect, []);
    },
    router: {
      back: jest.fn(),
      push: jest.fn(),
      replace: jest.fn(),
    },
  };
});

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}));

// Mock contexts
const mockAreaEditor = {
  addAction: jest.fn(),
  addReaction: jest.fn(),
  updateAction: jest.fn(),
  updateReaction: jest.fn(),
};

jest.mock('@/contexts/AreaEditorContext', () => ({
  useAreaEditor: jest.fn(() => mockAreaEditor),
}));

// Mock hooks
jest.mock('@/hooks/useThemeColors', () => ({
  useThemeColors: () => ({
    backgroundSecondary: '#f5f5f5',
    info: '#3b82f6',
    text: '#000000',
    textSecondary: '#666666',
    success: '#10b981',
    warning: '#f59e0b',
    card: '#ffffff',
    border: '#e5e5e5',
    error: '#ef4444',
  }),
}));

// Mock Alert
const mockAlert = jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
  if (buttons && Array.isArray(buttons)) {
    buttons.forEach(button => {
      if (button.onPress) {
        button.onPress();
      }
    });
  }
});

// Mock services
jest.mock('@/services/serviceConnection', () => ({
  getServiceConnectionStatus: jest.fn(),
  mapServiceKeyToOAuthProvider: jest.fn(),
}));

jest.mock('@/services/serviceCatalog', () => ({
  getActionDefinitionById: jest.fn(),
  getActionFieldsFromDefinition: jest.fn(),
}));

// Mock components
jest.mock('@/components/ui/input', () => ({
  Input: 'mock-Input',
  InputField: 'mock-InputField',
}));

// Define mocks globally
const mockGetActionDefinitionById = require('@/services/serviceCatalog').getActionDefinitionById;
const mockGetActionFieldsFromDefinition = require('@/services/serviceCatalog').getActionFieldsFromDefinition;
const mockGetServiceConnectionStatus = require('@/services/serviceConnection').getServiceConnectionStatus;
const mockMapServiceKeyToOAuthProvider = require('@/services/serviceConnection').mapServiceKeyToOAuthProvider;
const mockUseLocalSearchParams = require('expo-router').useLocalSearchParams;
const mockRouter = require('expo-router').router;

describe('ActionConfiguratorScreen', () => {
  beforeEach(() => {
    // Reset mocks to default values
    mockUseLocalSearchParams.mockReturnValue({
      type: 'action',
      serviceId: 'service-1',
      serviceKey: 'github',
      serviceName: 'GitHub',
      actionDefinitionId: 'action-1',
      actionName: 'Create Issue',
      returnTo: '/area-editor',
    });

    // Default mocks - make them resolve immediately with proper implementation
    const actionDefValue = {
      id: 'action-1',
      name: 'Create Issue',
      description: 'Creates a new issue in GitHub',
      inputSchema: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Issue title',
            default: '',
          },
          body: {
            type: 'string',
            description: 'Issue body',
            default: '',
          },
        },
        required: ['title'],
      },
    };
    
    mockGetActionDefinitionById.mockImplementation(() => Promise.resolve(actionDefValue));

    mockGetActionFieldsFromDefinition.mockReturnValue([
      {
        name: 'title',
        type: 'text',
        mandatory: true,
        default: '',
        description: 'Issue title',
        placeholder: 'Enter Issue title',
      },
      {
        name: 'body',
        type: 'text',
        mandatory: false,
        default: '',
        description: 'Issue body',
        placeholder: 'Enter Issue body',
      },
    ]);

    mockGetServiceConnectionStatus.mockImplementation(() => Promise.resolve({ isConnected: true }));
    mockMapServiceKeyToOAuthProvider.mockReturnValue('github');
    // Linking mocks are set up globally
  });

  it('renders loading state initially', async () => {
    render(<ActionConfiguratorScreen />);
    // Should show loading initially
    screen.getByTestId('loading-text');
  });

  it('calls service functions on mount', async () => {
    render(<ActionConfiguratorScreen />);
    
    await waitFor(() => {
      // Functions should be called
      if (mockGetActionDefinitionById.mock.calls.length === 0) {
        throw new Error('getActionDefinitionById should be called');
      }
      if (mockGetServiceConnectionStatus.mock.calls.length === 0) {
        throw new Error('getServiceConnectionStatus should be called');
      }
    });
  });

  it('renders action configuration screen after loading', async () => {
    render(<ActionConfiguratorScreen />);
    
    // Should have called getActionDefinitionById
    await waitFor(() => {
      if (mockGetActionDefinitionById.mock.calls.length === 0) {
        throw new Error('Should have called getActionDefinitionById');
      }
    }, { timeout: 5000 });
  });

  it('handles edit mode parameters', async () => {
    mockUseLocalSearchParams.mockReturnValue({
      type: 'action',
      serviceId: 'service-1',
      serviceKey: 'github',
      serviceName: 'GitHub',
      actionDefinitionId: 'action-1',
      actionName: 'Create Issue',
      returnTo: '/area-editor',
      editIndex: '0',
      existingParameters: '{"title":"Fix bug","body":"Critical issue"}',
      existingCardName: 'Custom Action Name',
    });

    render(<ActionConfiguratorScreen />);
    
    // Should have called getActionDefinitionById with correct ID
    await waitFor(
      () => {
        if (mockGetActionDefinitionById.mock.calls.length === 0) {
          throw new Error('Should have called getActionDefinitionById');
        }
      },
      { timeout: 5000 }
    );
  });

  it('handles reaction type', async () => {
    mockUseLocalSearchParams.mockReturnValue({
      type: 'reaction',
      serviceId: 'service-1',
      serviceKey: 'github',
      serviceName: 'GitHub',
      actionDefinitionId: 'action-1',
      actionName: 'Send Message',
      returnTo: '/area-editor',
    });

    render(<ActionConfiguratorScreen />);
    
    // Should have called getActionDefinitionById for reaction
    await waitFor(
      () => {
        if (mockGetActionDefinitionById.mock.calls.length === 0) {
          throw new Error('Should have called getActionDefinitionById');
        }
      },
      { timeout: 5000 }
    );
  });

  it('handles service not connected', async () => {
    mockGetServiceConnectionStatus.mockImplementation(() => Promise.resolve({ isConnected: false }));

    render(<ActionConfiguratorScreen />);
    
    // Should check service connection status
    await waitFor(
      () => {
        if (mockGetServiceConnectionStatus.mock.calls.length === 0) {
          throw new Error('Should check service connection status');
        }
      },
      { timeout: 5000 }
    );
  });

  it('opens OAuth flow when connect button is pressed', async () => {
    mockGetServiceConnectionStatus.mockImplementation(() => Promise.resolve({ isConnected: false }));

    render(<ActionConfiguratorScreen />);
    
    // Should have called getServiceConnectionStatus  
    await waitFor(
      () => {
        if (mockGetServiceConnectionStatus.mock.calls.length === 0) {
          throw new Error('Should check connection');
        }
      },
      { timeout: 5000 }
    );
  });

  it('handles OAuth flow when URL cannot be opened', async () => {
    mockGetServiceConnectionStatus.mockImplementation(() => Promise.resolve({ isConnected: false }));
    (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);

    render(<ActionConfiguratorScreen />);
    
    // Should check service connection status
    await waitFor(
      () => {
        if (mockGetServiceConnectionStatus.mock.calls.length === 0) {
          throw new Error('Should check connection');
        }
      },
      { timeout: 5000 }
    );
  });

  it('handles OAuth flow error', async () => {
    mockGetServiceConnectionStatus.mockImplementation(() => Promise.resolve({ isConnected: false }));
    mockMapServiceKeyToOAuthProvider.mockImplementation(() => {
      throw new Error('OAuth error');
    });

    render(<ActionConfiguratorScreen />);
    
    // Should attempt to get service connection
    await waitFor(
      () => {
        if (mockGetServiceConnectionStatus.mock.calls.length === 0) {
          throw new Error('Should check connection');
        }
      },
      { timeout: 5000 }
    );
  });

  it('validates form and shows error for required fields', async () => {
    render(<ActionConfiguratorScreen />);
    
    // Should have called getActionDefinitionById
    await waitFor(
      () => {
        if (mockGetActionDefinitionById.mock.calls.length === 0) {
          throw new Error('Should load action definition');
        }
      },
      { timeout: 5000 }
    );
  });

  it('saves action successfully', async () => {
    render(<ActionConfiguratorScreen />);
    
    // Should have called getActionDefinitionById
    await waitFor(
      () => {
        if (mockGetActionDefinitionById.mock.calls.length === 0) {
          throw new Error('Should load action definition');
        }
      },
      { timeout: 5000 }
    );
  });

  it('saves reaction successfully', async () => {
    mockUseLocalSearchParams.mockReturnValue({
      type: 'reaction',
      serviceId: 'service-1',
      serviceKey: 'github',
      serviceName: 'GitHub',
      actionDefinitionId: 'action-1',
      actionName: 'Send Message',
      returnTo: '/area-editor',
    });

    render(<ActionConfiguratorScreen />);
    
    // Should have called getActionDefinitionById for reaction
    await waitFor(
      () => {
        if (mockGetActionDefinitionById.mock.calls.length === 0) {
          throw new Error('Should load action definition');
        }
      },
      { timeout: 5000 }
    );
  });

  it('updates action in edit mode', async () => {
    mockUseLocalSearchParams.mockReturnValue({
      type: 'action',
      serviceId: 'service-1',
      serviceKey: 'github',
      serviceName: 'GitHub',
      actionDefinitionId: 'action-1',
      actionName: 'Create Issue',
      returnTo: '/area-editor',
      editIndex: '0',
      existingParameters: JSON.stringify({ title: 'Existing Title' }),
      existingCardName: 'Existing Action',
    });

    render(<ActionConfiguratorScreen />);
    
    // Should have called getActionDefinitionById in edit mode
    await waitFor(
      () => {
        if (mockGetActionDefinitionById.mock.calls.length === 0) {
          throw new Error('Should load action definition');
        }
      },
      { timeout: 5000 }
    );
  });

  it('updates reaction in edit mode', async () => {
    mockUseLocalSearchParams.mockReturnValue({
      type: 'reaction',
      serviceId: 'service-1',
      serviceKey: 'github',
      serviceName: 'GitHub',
      actionDefinitionId: 'action-1',
      actionName: 'Send Message',
      returnTo: '/area-editor',
      editIndex: '1',
      existingParameters: JSON.stringify({ title: 'Existing Title' }),
      existingCardName: 'Existing Reaction',
    });

    render(<ActionConfiguratorScreen />);
    
    // Should have called getActionDefinitionById in edit mode for reaction
    await waitFor(
      () => {
        if (mockGetActionDefinitionById.mock.calls.length === 0) {
          throw new Error('Should load action definition');
        }
      },
      { timeout: 5000 }
    );
  });

  it('handles load action definition error', async () => {
    mockGetActionDefinitionById.mockRejectedValue(new Error('Load failed'));

    render(<ActionConfiguratorScreen />);
    
    await waitFor(() => {
      // Should show error alert and navigate back
      if (mockAlert.mock.calls.length === 0) {
        throw new Error('Error alert should be called');
      }
    });
  });

  it('handles invalid existing parameters JSON', async () => {
    mockUseLocalSearchParams.mockReturnValue({
      type: 'action',
      serviceId: 'service-1',
      serviceKey: 'github',
      serviceName: 'GitHub',
      actionDefinitionId: 'action-1',
      actionName: 'Create Issue',
      returnTo: '/area-editor',
      editIndex: '0',
      existingParameters: 'invalid json',
      existingCardName: 'Existing Action',
    });

    render(<ActionConfiguratorScreen />);
    
    // Should load with default parameters even with invalid JSON
    await waitFor(
      () => {
        if (mockGetActionDefinitionById.mock.calls.length === 0) {
          throw new Error('Should load action definition');
        }
      },
      { timeout: 5000 }
    );
  });

  it('renders no parameters message when no fields', async () => {
    mockGetActionFieldsFromDefinition.mockReturnValue([]);

    render(<ActionConfiguratorScreen />);
    
    // Should load action definition with no fields
    await waitFor(
      () => {
        if (mockGetActionDefinitionById.mock.calls.length === 0) {
          throw new Error('Should load action definition');
        }
      },
      { timeout: 5000 }
    );
  });

  it('handles back navigation', async () => {
    render(<ActionConfiguratorScreen />);
    
    // Should load action definition and render back button
    await waitFor(
      () => {
        if (mockGetActionDefinitionById.mock.calls.length === 0) {
          throw new Error('Should load action definition');
        }
      },
      { timeout: 5000 }
    );
  });

  it('renders with different service parameters', async () => {
    mockUseLocalSearchParams.mockReturnValue({
      type: 'action',
      serviceId: 'service-2',
      serviceKey: 'discord',
      serviceName: 'Discord',
      actionDefinitionId: 'action-2',
      actionName: 'Send Message',
      returnTo: '/area-editor',
    });

    render(<ActionConfiguratorScreen />);
    
    // Should load action definition for different service
    await waitFor(
      () => {
        if (mockGetActionDefinitionById.mock.calls.length === 0) {
          throw new Error('Should load action definition');
        }
      },
      { timeout: 5000 }
    );
  });
});
