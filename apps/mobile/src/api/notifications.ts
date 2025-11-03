import { request } from "./client";

export type RegisterDevicePayload = {
  pushToken: string;
  deviceInfo?: {
    platform?: string;
    deviceName?: string;
  };
};

export const registerDevice = async (payload: RegisterDevicePayload) => {
  return request("/notifications/register-device", {
    method: "POST",
    body: JSON.stringify(payload)
  });
};

export const unregisterDevice = async () => {
  return request("/notifications/register-device", {
    method: "DELETE"
  });
};
