import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert, Linking } from 'react-native';
import ActionConfiguratorScreen from '../action-configurator';

// Mock Linking
jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);

// Mock expo-router
jest.mock('expo-router', () => ({
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
  router: {
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  },
}));

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
    jest.clearAllMocks();
    mockAlert.mockClear();

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

    // Default mocks - make them resolve immediately
    mockGetActionDefinitionById.mockResolvedValue({
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
    });

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

    mockGetServiceConnectionStatus.mockResolvedValue({ isConnected: true });
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
    
    await waitFor(() => {
      screen.getByText('Configure Action');
      screen.getByTestId('service-action-title');
      screen.getByTestId('action-description');
      screen.getByTestId('connected-status');
      screen.getByTestId('parameters-section');
    });
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
      existingParameters: JSON.stringify({ title: 'Existing Title' }),
      existingCardName: 'Existing Action',
    });

    render(<ActionConfiguratorScreen />);
    
    await waitFor(() => {
      screen.getByText('Edit Action');
      // Should have loaded the existing parameters
    });
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
    
    await waitFor(() => {
      screen.getByText('Configure Reaction');
    });
  });

  it('handles service not connected', async () => {
    mockGetServiceConnectionStatus.mockResolvedValue({ isConnected: false });

    render(<ActionConfiguratorScreen />);
    
    await waitFor(() => {
      screen.getByTestId('not-connected-status');
      screen.getByTestId('connect-button');
    });
  });

  it('opens OAuth flow when connect button is pressed', async () => {
    mockGetServiceConnectionStatus.mockResolvedValue({ isConnected: false });

    render(<ActionConfiguratorScreen />);
    
    await waitFor(() => {
      screen.getByTestId('connect-button');
    });

    const connectButton = screen.getByTestId('connect-button');
    fireEvent.press(connectButton);

    await waitFor(() => {
      // Alert should have been called
      if (mockAlert.mock.calls.length === 0) {
        throw new Error('Alert should be called');
      }
    });
  });

  it('handles OAuth flow when URL cannot be opened', async () => {
    mockGetServiceConnectionStatus.mockResolvedValue({ isConnected: false });
    (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);

    render(<ActionConfiguratorScreen />);
    
    await waitFor(() => {
      screen.getByTestId('connect-button');
    });

    const connectButton = screen.getByTestId('connect-button');
    fireEvent.press(connectButton);

    await waitFor(() => {
      // Should show error alert
      if (mockAlert.mock.calls.length === 0) {
        throw new Error('Error alert should be called');
      }
    });
  });

  it('handles OAuth flow error', async () => {
    mockGetServiceConnectionStatus.mockResolvedValue({ isConnected: false });
    mockMapServiceKeyToOAuthProvider.mockImplementation(() => {
      throw new Error('OAuth error');
    });

    render(<ActionConfiguratorScreen />);
    
    await waitFor(() => {
      screen.getByTestId('connect-button');
    });

    const connectButton = screen.getByTestId('connect-button');
    fireEvent.press(connectButton);

    // Error is caught and logged, no alert shown
    if (mockAlert.mock.calls.length !== 0) {
      throw new Error('Alert should not be called');
    }
  });

  it('validates form and shows error for required fields', async () => {
    render(<ActionConfiguratorScreen />);
    
    await waitFor(() => {
      screen.getByText('Configure Action');
    });

    // Find and press save button
    const saveButton = screen.getByTestId('save-button');
    fireEvent.press(saveButton);

    await waitFor(() => {
      // Should show validation error
      if (mockAlert.mock.calls.length === 0) {
        throw new Error('Validation alert should be called');
      }
    });
  });

  it('saves action successfully', async () => {
    render(<ActionConfiguratorScreen />);
    
    await waitFor(() => {
      screen.getByText('Configure Action');
    });

    // Fill required field - find the input field
    const titleInput = screen.getByTestId('input-field-title');
    fireEvent.changeText(titleInput, 'Test Issue');

    // Press save
    const saveButton = screen.getByTestId('save-button');
    fireEvent.press(saveButton);

    await waitFor(() => {
      // Should call addAction and navigate back
      if (mockAreaEditor.addAction.mock.calls.length === 0) {
        throw new Error('addAction should be called');
      }
    });
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
    
    await waitFor(() => {
      screen.getByText('Configure Reaction');
    });

    // Fill required field
    const titleInput = screen.getByTestId('input-field-title');
    fireEvent.changeText(titleInput, 'Test Message');

    // Press save
    const saveButton = screen.getByTestId('save-button');
    fireEvent.press(saveButton);

    await waitFor(() => {
      // Should call addReaction
      if (mockAreaEditor.addReaction.mock.calls.length === 0) {
        throw new Error('addReaction should be called');
      }
    });
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
    
    await waitFor(() => {
      screen.getByText('Edit Action');
    });

    // Press save
    const saveButton = screen.getByTestId('save-button');
    fireEvent.press(saveButton);

    await waitFor(() => {
      // Should call updateAction
      if (mockAreaEditor.updateAction.mock.calls.length === 0) {
        throw new Error('updateAction should be called');
      }
    });
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
    
    await waitFor(() => {
      screen.getByText('Edit Reaction');
    });

    // Press save
    const saveButton = screen.getByTestId('save-button');
    fireEvent.press(saveButton);

    await waitFor(() => {
      // Should call updateReaction
      if (mockAreaEditor.updateReaction.mock.calls.length === 0) {
        throw new Error('updateReaction should be called');
      }
    });
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
    
    await waitFor(() => {
      // Should load successfully with default parameters
      screen.getByText('Edit Action');
    });
  });

  it('renders no parameters message when no fields', async () => {
    mockGetActionFieldsFromDefinition.mockReturnValue([]);

    render(<ActionConfiguratorScreen />);
    
    await waitFor(() => {
      screen.getByTestId('no-parameters-message');
    });
  });

  it('handles back navigation', async () => {
    render(<ActionConfiguratorScreen />);
    
    await waitFor(() => {
      screen.getByText('Configure Action');
    });

    const backButton = screen.getByTestId('back-button');
    fireEvent.press(backButton);

    // Should navigate back
    if (mockRouter.back.mock.calls.length === 0) {
      throw new Error('Router back should be called');
    }
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
    
    await waitFor(() => {
      screen.getByTestId('service-action-title');
      // Should show Discord › Send Message
    });
  });
});
