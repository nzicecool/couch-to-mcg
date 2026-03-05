import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/appStore';

interface PINAuthProps {
  onAuthenticated: () => void;
}

export const PINAuth: React.FC<PINAuthProps> = ({ onAuthenticated }) => {
  const { pinState, setPIN, authenticateWithPIN } = useAppStore();
  const [pin, setPin] = useState('');
  const [isSettingPIN, setIsSettingPIN] = useState(!pinState.isSet);
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handlePINInput = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const newPin = pin.split('');
    newPin[index] = value;
    const newPinStr = newPin.join('');
    setPin(newPinStr);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleConfirmPINInput = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const newPin = confirmPin.split('');
    newPin[index] = value;
    const newPinStr = newPin.join('');
    setConfirmPin(newPinStr);

    if (value && index < 3) {
      inputRefs.current[index + 5]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number, isConfirm: boolean) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (isConfirm) {
        const newPin = confirmPin.split('');
        newPin[index] = '';
        setConfirmPin(newPin.join(''));
        if (index > 0) {
          inputRefs.current[index + 3]?.focus();
        }
      } else {
        const newPin = pin.split('');
        newPin[index] = '';
        setPin(newPin.join(''));
        if (index > 0) {
          inputRefs.current[index - 1]?.focus();
        }
      }
    }
  };

  const handleSetPIN = async () => {
    setError('');

    if (pin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }

    if (pin !== confirmPin) {
      setError('PINs do not match');
      setConfirmPin('');
      inputRefs.current[4]?.focus();
      return;
    }

    await setPIN(pin);
    onAuthenticated();
  };

  const handleAuthenticatePIN = () => {
    setError('');

    if (pin.length !== 4) {
      setError('Please enter 4 digits');
      return;
    }

    const isValid = authenticateWithPIN(pin);
    if (!isValid) {
      setError('Incorrect PIN');
      setPin('');
      inputRefs.current[0]?.focus();
      return;
    }

    onAuthenticated();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    if (/^\d{1,4}$/.test(pastedData)) {
      setPin(pastedData);
      if (pastedData.length === 4) {
        inputRefs.current[3]?.blur();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-4xl font-bold text-white">🏃</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Couch to MCG</h1>
          <p className="text-muted-foreground">
            {isSettingPIN ? 'Set your 4-digit PIN' : 'Enter your PIN to continue'}
          </p>
        </div>

        {/* PIN Input */}
        <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
          {/* First PIN Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-foreground mb-4">
              {isSettingPIN ? 'Create PIN' : 'PIN'}
            </label>
            <div className="flex gap-3 justify-center">
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={`pin-${index}`}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={pin[index] || ''}
                  onChange={(e) => handlePINInput(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index, false)}
                  onPaste={handlePaste}
                  className="pin-input"
                  autoFocus={index === 0}
                />
              ))}
            </div>
          </div>

          {/* Confirm PIN Input (only when setting) */}
          {isSettingPIN && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-foreground mb-4">
                Confirm PIN
              </label>
              <div className="flex gap-3 justify-center">
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={`confirm-pin-${index}`}
                    ref={(el) => {
                      inputRefs.current[index + 4] = el;
                    }}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={confirmPin[index] || ''}
                    onChange={(e) => handleConfirmPINInput(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index, true)}
                    onPaste={handlePaste}
                    className="pin-input"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
              <p className="text-sm font-medium text-destructive">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={isSettingPIN ? handleSetPIN : handleAuthenticatePIN}
            disabled={isSettingPIN ? pin.length !== 4 || confirmPin.length !== 4 : pin.length !== 4}
            className="w-full py-3 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSettingPIN ? 'Set PIN' : 'Unlock'}
          </button>

          {/* Info Text */}
          <p className="text-xs text-muted-foreground text-center mt-4">
            {isSettingPIN
              ? 'Your PIN keeps your training data secure. You\'ll need it every time you open the app.'
              : 'Enter your PIN to access your training plan.'}
          </p>
        </div>
      </div>
    </div>
  );
};
