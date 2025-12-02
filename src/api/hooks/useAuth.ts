import { useMutation } from "@tanstack/react-query";
import { api } from "@/api/client";
import { useAppDispatch } from "@/store";
import { authActions } from "@/store/authSlice";
import { saveTokens, clearTokens } from "@/utils/tokenStorage";

interface LoginPayload {
  mobilenumber: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export const useAdminLogin = () => {
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
    },
  });
};

export const useLogout = () => {
  const dispatch = useAppDispatch();
  return async () => {
    await clearTokens();
    dispatch(authActions.logout());
  };
};
