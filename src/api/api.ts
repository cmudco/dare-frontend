const BASE_URL = 'process.env.REACT_APP_API_BASE_URL';

export const loginUser = async (data: { username: string; password: string }) => {
  const response = await fetch(`${BASE_URL}/api/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Login failed");
  }
  return await response.json();
};

export const registerUser = async (data: {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  access_code: string;
}) => {
  const response = await fetch(`${BASE_URL}/api/auth/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const responseText = await response.text();
  if (!responseText) {
    throw new Error('Empty response from server');
  }

  const responseData = JSON.parse(responseText);

  if (!response.ok) {
    throw new Error(responseData.message || "Registration failed");
  }

  return responseData;
};

export const forgotPasswordUser = async (data: { email: string }) => {
  const response = await fetch(`${BASE_URL}/api/auth/forgot-password/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const responseText = await response.text();
  if (!responseText) {
    throw new Error('Empty response from server');
  }

  const responseData = JSON.parse(responseText);

  if (!response.ok) {
    throw new Error(responseData.message || "Password recovery failed");
  }

  return responseData;
};

export const verifyCodeUser = async (data: { verificationCode: string }) => {
  const response = await fetch(`${BASE_URL}/api/auth/verify-code/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const responseText = await response.text();
  if (!responseText) {
    throw new Error('Empty response from server');
  }

  const responseData = JSON.parse(responseText);

  if (!response.ok) {
    throw new Error(responseData.message || "Verification failed");
  }

  return responseData;
};

export const resetPasswordUser = async (data: { password: string; confirmPassword: string }) => {
  const response = await fetch(`${BASE_URL}/api/auth/reset-password/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const responseText = await response.text();
  if (!responseText) {
    throw new Error('Empty response from server');
  }

  const responseData = JSON.parse(responseText);

  if (!response.ok) {
    throw new Error(responseData.message || "Password reset failed");
  }

  return responseData;
};
