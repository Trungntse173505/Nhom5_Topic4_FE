import { useCallback, useState } from 'react';
import { verifyRealEmail } from '../services/emailValidator';

// Lightweight hook to validate email against the Abstract API before submitting forms.
export const useEmailValidator = () => {
  const [verifying, setVerifying] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const validateEmail = useCallback(
    async (email) => {
      const normalizedEmail = String(email || '').trim();
      if (!normalizedEmail) {
        const result = { isValid: false, message: 'Email không được để trống.' };
        setLastResult(result);
        return result;
      }

      setVerifying(true);
      try {
        const result = await verifyRealEmail(normalizedEmail);
        setLastResult(result);
        return result;
      } finally {
        setVerifying(false);
      }
    },
    []
  );

  return {
    validateEmail,
    verifying,
    lastResult,
  };
};
