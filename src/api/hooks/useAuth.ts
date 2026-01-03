import { useMutation } from "@tanstack/react-query";
import { api } from "@/api/client";
import { useAppDispatch } from "@/store";
import { authActions } from "@/store/authSlice";
import { saveTokens, clearTokens } from "@/utils/tokenStorage";
import { unregisterPushNotifications } from "@/services/notificationService";

interface LoginPayload {
  mobilenumber: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export const useAdminLogin = (options?: {
  onSuccess?: () => void | Promise<void>;
}) => {
  const dispatch = useAppDispatch();
  return useMutation<LoginResponse, any, LoginPayload>({
    mutationFn: async (payload) => {
      const res = await api.post("/admin/login", payload);
      return res.data as LoginResponse;
    },
    onSuccess: async (data) => {
      await saveTokens(data.access_token, data.refresh_token);

      dispatch(
        authActions.setTokens({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
        })
      );

      // Call additional onSuccess callback if provided
      if (options?.onSuccess) {
        await options.onSuccess();
      }
    },
  });
};

export const useLogout = () => {
  const dispatch = useAppDispatch();
  return async () => {
    // Unregister push notifications before logout
    console.log("🔕 Unregistering push notifications...");
    await unregisterPushNotifications();

    await clearTokens();
    dispatch(authActions.logout());
    console.log("✅ Logged out successfully");
  };
};
