package com.buildstack.auth.service;

import com.buildstack.auth.dto.request.LoginRequest;
import com.buildstack.auth.dto.request.RegisterRequest;
import com.buildstack.auth.dto.response.AuthResponse;
import com.buildstack.auth.dto.response.UserResponse;
import com.buildstack.auth.entity.Role;
import com.buildstack.auth.entity.User;
import com.buildstack.auth.enums.RoleName;
import com.buildstack.auth.exception.AuthenticationException;
import com.buildstack.auth.exception.EmailAlreadyExistsException;
import com.buildstack.auth.exception.InvalidPasswordException;
import com.buildstack.auth.exception.RoleNotFoundException;
import com.buildstack.auth.mapper.AuthMapper;
import com.buildstack.auth.repository.RoleRepository;
import com.buildstack.auth.repository.UserRepository;
import com.buildstack.security.jwt.JwtProperties;
import com.buildstack.security.jwt.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceImplTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @Mock
    private JwtProperties jwtProperties;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private AuthMapper authMapper;

    @InjectMocks
    private AuthenticationServiceImpl authenticationService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User user;
    private Role role;
    private UserResponse userResponse;

    @BeforeEach
    void setUp() {
        registerRequest = RegisterRequest.builder()
                .firstName("John")
                .lastName("Doe")
                .email("test@example.com")
                .password("password123")
                .confirmPassword("password123")
                .build();

        loginRequest = LoginRequest.builder()
                .email("test@example.com")
                .password("password123")
                .build();

        role = Role.builder().name(RoleName.ROLE_USER).build();
        user = User.builder().email("test@example.com").password("encoded").build();
        userResponse = UserResponse.builder().email("test@example.com").build();
    }

    @Test
    void register_ShouldReturnAuthResponse_WhenRequestIsValid() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(roleRepository.findByName(RoleName.ROLE_USER)).thenReturn(Optional.of(role));
        when(authMapper.toUser(any(RegisterRequest.class))).thenReturn(user);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(jwtService.generateToken(anyString())).thenReturn("jwt-token");
        when(authMapper.toUserResponse(any(User.class))).thenReturn(userResponse);
        when(jwtProperties.getExpiration()).thenReturn(3600000L);

        AuthResponse response = authenticationService.register(registerRequest);

        assertNotNull(response);
        assertEquals("jwt-token", response.getAccessToken());
        assertEquals("Bearer", response.getTokenType());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_ShouldThrowException_WhenPasswordsDoNotMatch() {
        registerRequest.setConfirmPassword("different");

        assertThrows(InvalidPasswordException.class, () -> authenticationService.register(registerRequest));
    }

    @Test
    void register_ShouldThrowException_WhenEmailExists() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        assertThrows(EmailAlreadyExistsException.class, () -> authenticationService.register(registerRequest));
    }

    @Test
    void register_ShouldThrowException_WhenRoleNotFound() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(roleRepository.findByName(RoleName.ROLE_USER)).thenReturn(Optional.empty());

        assertThrows(RoleNotFoundException.class, () -> authenticationService.register(registerRequest));
    }

    @Test
    void login_ShouldReturnAuthResponse_WhenCredentialsAreValid() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(null);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(anyString())).thenReturn("jwt-token");
        when(authMapper.toUserResponse(any(User.class))).thenReturn(userResponse);
        when(jwtProperties.getExpiration()).thenReturn(3600000L);

        AuthResponse response = authenticationService.login(loginRequest);

        assertNotNull(response);
        assertEquals("jwt-token", response.getAccessToken());
    }

    @Test
    void login_ShouldThrowException_WhenBadCredentials() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new org.springframework.security.authentication.BadCredentialsException("Bad credentials"));

        assertThrows(AuthenticationException.class, () -> authenticationService.login(loginRequest));
    }
}
