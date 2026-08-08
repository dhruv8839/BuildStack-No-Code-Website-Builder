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
import com.buildstack.auth.security.CustomUserDetails;
import com.buildstack.organization.entity.Organization;
import com.buildstack.organization.entity.OrganizationMember;
import com.buildstack.organization.entity.Workspace;
import com.buildstack.organization.enums.OrganizationRole;
import com.buildstack.organization.repository.OrganizationMemberRepository;
import com.buildstack.organization.repository.OrganizationRepository;
import com.buildstack.organization.repository.WorkspaceRepository;
import com.buildstack.security.jwt.JwtProperties;
import com.buildstack.security.jwt.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationServiceImpl implements AuthenticationService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final AuthenticationManager authenticationManager;
    private final AuthMapper authMapper;
    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final WorkspaceRepository workspaceRepository;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new InvalidPasswordException("Passwords do not match");
        }

        String email = request.getEmail().trim().toLowerCase(java.util.Locale.ROOT);

        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException("Email is already in use");
        }

        Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                .orElseThrow(() -> new RoleNotFoundException("Error: Role is not found."));

        User user = authMapper.toUser(request);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.addRole(userRole);

        user = userRepository.save(user);

        // Provision default organization & workspace for the new user
        provisionDefaultOrgAndWorkspace(user);

        String jwt = jwtService.generateToken(user.getEmail());
        UserResponse userResponse = authMapper.toUserResponse(user);

        return AuthResponse.builder()
                .accessToken(jwt)
                .tokenType("Bearer")
                .expiresIn(jwtProperties.getExpiration())
                .user(userResponse)
                .build();
    }

    private void provisionDefaultOrgAndWorkspace(User user) {
        try {
            String orgName = (user.getFirstName() != null ? user.getFirstName() : "My") + "'s Organization";
            String baseSlug = (user.getFirstName() != null ? user.getFirstName() : "my").toLowerCase().replaceAll("[^a-z0-9]", "") + "-org";
            String orgSlug = baseSlug + "-" + System.currentTimeMillis() % 10000;

            Organization org = Organization.builder()
                    .name(orgName)
                    .slug(orgSlug)
                    .description("Default organization for " + user.getEmail())
                    .createdBy(user)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            org = organizationRepository.save(org);

            OrganizationMember member = OrganizationMember.builder()
                    .organization(org)
                    .user(user)
                    .role(OrganizationRole.OWNER)
                    .joinedAt(LocalDateTime.now())
                    .build();
            organizationMemberRepository.save(member);

            Workspace workspace = Workspace.builder()
                    .organization(org)
                    .name("Default Workspace")
                    .key("DEF")
                    .description("Primary workspace")
                    .color("#6366F1")
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            workspaceRepository.save(workspace);

            log.info("Auto-provisioned default organization '{}' and workspace for user '{}'", org.getName(), user.getEmail());
        } catch (Exception e) {
            log.error("Failed to auto-provision default organization for user '{}'", user.getEmail(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase(java.util.Locale.ROOT);
        log.info("Attempting login for email: '{}'", email);
        
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );
            log.info("Authentication manager approved credentials for email: '{}'", email);
        } catch (org.springframework.security.core.AuthenticationException e) {
            log.error("AuthenticationManager rejected credentials for email: '{}'. Reason: {}", email, e.getMessage());
            throw new AuthenticationException("Invalid email or password");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("User '{}' not found in database after authentication", email);
                    return new AuthenticationException("User not found");
                });

        String jwt = jwtService.generateToken(user.getEmail());
        UserResponse userResponse = authMapper.toUserResponse(user);
        log.info("Login successful for email: '{}'", email);

        return AuthResponse.builder()
                .accessToken(jwt)
                .tokenType("Bearer")
                .expiresIn(jwtProperties.getExpiration())
                .user(userResponse)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            throw new AuthenticationException("User is not authenticated");
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new AuthenticationException("User not found"));

        return authMapper.toUserResponse(user);
    }
}
