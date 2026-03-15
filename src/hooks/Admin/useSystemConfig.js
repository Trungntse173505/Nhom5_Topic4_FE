import { useCallback, useEffect, useState } from 'react';
import systemConfigApi from '../../api/systemConfig';

const buildErrorMessage = (err) => {
  const status = err?.response?.status;
  const data = err?.response?.data;

  const message =
    data?.message ||
    data?.detail ||
    data?.title ||
    data?.error ||
    (typeof data === 'string' ? data : null) ||
    err?.message ||
    'Lỗi không xác định';

  return status ? `HTTP ${status}: ${message}` : message;
};

const normalizeSystemConfig = (rawResponse) => {
  const data = rawResponse?.data ?? rawResponse;
  const item = Array.isArray(data) ? data[0] : data;

  const id =
    item?.id ??
    item?.configId ??
    item?.configID ??
    item?.systemConfigId ??
    item?.systemConfigID ??
    item?.ID ??
    null;

  const storageLimitGb =
    item?.storageLimitGb ??
    item?.storageLimitGB ??
    item?.storageLimit ??
    item?.storageGb ??
    item?.storageGB ??
    item?.limitGb ??
    item?.limitGB ??
    null;

  const rawFormats =
    item?.allowedFormats ??
    item?.allowedFileFormats ??
    item?.fileFormats ??
    item?.formats ??
    null;

  const allowedFormats = Array.isArray(rawFormats)
    ? rawFormats
    : typeof rawFormats === 'string'
      ? rawFormats
        .split(/[;,]+/g)
        .map((s) => s.trim())
        .filter(Boolean)
      : null;

  return { raw: item ?? data ?? rawResponse ?? null, id, storageLimitGb, allowedFormats };
};

export const useSystemConfig = () => {
  const [systemConfig, setSystemConfig] = useState(null);
  const [systemConfigLoading, setSystemConfigLoading] = useState(false);
  const [systemConfigError, setSystemConfigError] = useState(null);
  const [updatingSystemConfig, setUpdatingSystemConfig] = useState(false);
  const [updateSystemConfigError, setUpdateSystemConfigError] = useState(null);

  const refreshSystemConfig = useCallback(async (config) => {
    setSystemConfigLoading(true);
    setSystemConfigError(null);

    try {
      const response = await systemConfigApi.getSystemConfigs(config);
      setSystemConfig(normalizeSystemConfig(response));
      setSystemConfigLoading(false);
      return { success: true, data: response };
    } catch (err) {
      const errMsg = buildErrorMessage(err);
      setSystemConfigError(errMsg);
      setSystemConfigLoading(false);
      return { success: false, error: errMsg, status: err?.response?.status, details: err?.response?.data };
    }
  }, []);

  const updateSystemConfig = useCallback(
    async (id, payload, config) => {
      const normalizedId = String(id ?? '').trim();
      if (!normalizedId) {
        const errMsg = 'Thiếu id cấu hình hệ thống.';
        setUpdateSystemConfigError(errMsg);
        return { success: false, error: errMsg };
      }

      setUpdatingSystemConfig(true);
      setUpdateSystemConfigError(null);
      try {
        const response = await systemConfigApi.updateConfigs(normalizedId, payload ?? {}, config);
        setSystemConfig(normalizeSystemConfig(response));
        setUpdatingSystemConfig(false);
        return { success: true, data: response };
      } catch (err) {
        const errMsg = buildErrorMessage(err);
        setUpdateSystemConfigError(errMsg);
        setUpdatingSystemConfig(false);
        return { success: false, error: errMsg, status: err?.response?.status, details: err?.response?.data };
      }
    },
    []
  );

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) refreshSystemConfig();
    });
    return () => {
      active = false;
    };
  }, [refreshSystemConfig]);

  return {
    systemConfig,
    systemConfigLoading,
    systemConfigError,
    updatingSystemConfig,
    updateSystemConfigError,
    updateSystemConfig,
  };
};
