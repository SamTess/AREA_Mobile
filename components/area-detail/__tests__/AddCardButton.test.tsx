import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { AddCardButton } from '../AddCardButton';

describe('AddCardButton', () => {
  const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);

  afterEach(() => {
    alertSpy.mockClear();
  });

  afterAll(() => {
    alertSpy.mockRestore();
  });

  it('opens alert and triggers callbacks when options are selected', () => {
    const onAddAction = jest.fn();
    const onAddReaction = jest.fn();

    const { getByTestId } = render(
      <AddCardButton
        isRemoveZoneActive={false}
        onAddAction={onAddAction}
        onAddReaction={onAddReaction}
        testID="add-card"
      />
    );

    fireEvent.press(getByTestId('add-card'));

    expect(alertSpy).toHaveBeenCalledWith(
      'Add Card',
      'What type of card do you want to add?',
      expect.any(Array)
    );

    const buttons = alertSpy.mock.calls[0]?.[2] ?? [];
    const findButton = (label: string) =>
      buttons.find((button) => button?.text === label);

    findButton('Action')?.onPress?.();
    expect(onAddAction).toHaveBeenCalled();

    findButton('Reaction')?.onPress?.();
    expect(onAddReaction).toHaveBeenCalled();
  });
});
