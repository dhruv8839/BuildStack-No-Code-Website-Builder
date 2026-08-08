package com.buildstack.auth.service;

import com.buildstack.auth.dto.request.LoginRequest;
import com.buildstack.auth.dto.request.RegisterRequest;
import com.buildstack.auth.dto.response.AuthResponse;
import com.buildstack.auth.dto.response.UserResponse;

public interface AuthenticationService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    UserResponse getCurrentUser();
}
