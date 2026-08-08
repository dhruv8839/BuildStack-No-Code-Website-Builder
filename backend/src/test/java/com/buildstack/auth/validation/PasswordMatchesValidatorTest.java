package com.buildstack.auth.validation;

import com.buildstack.auth.dto.request.RegisterRequest;
import jakarta.validation.ConstraintValidatorContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PasswordMatchesValidatorTest {

    private PasswordMatchesValidator validator;

    @Mock
    private ConstraintValidatorContext context;

    @Mock
    private ConstraintValidatorContext.ConstraintViolationBuilder violationBuilder;

    @Mock
    private ConstraintValidatorContext.ConstraintViolationBuilder.NodeBuilderCustomizableContext nodeBuilder;

    @BeforeEach
    void setUp() {
        validator = new PasswordMatchesValidator();
    }

    @Test
    void isValid_ShouldReturnTrue_WhenPasswordsMatch() {
        RegisterRequest request = RegisterRequest.builder()
                .password("password123")
                .confirmPassword("password123")
                .build();

        assertTrue(validator.isValid(request, context));
    }

    @Test
    void isValid_ShouldReturnFalse_WhenPasswordsDoNotMatch() {
        RegisterRequest request = RegisterRequest.builder()
                .password("password123")
                .confirmPassword("differentPassword")
                .build();

        when(context.getDefaultConstraintMessageTemplate()).thenReturn("Passwords do not match");
        when(context.buildConstraintViolationWithTemplate(anyString())).thenReturn(violationBuilder);
        when(violationBuilder.addPropertyNode(anyString())).thenReturn(nodeBuilder);

        assertFalse(validator.isValid(request, context));
    }

    @Test
    void isValid_ShouldReturnFalse_WhenPasswordIsNull() {
        RegisterRequest request = RegisterRequest.builder()
                .password(null)
                .confirmPassword("password123")
                .build();

        assertFalse(validator.isValid(request, context));
    }

    @Test
    void isValid_ShouldReturnFalse_WhenConfirmPasswordIsNull() {
        RegisterRequest request = RegisterRequest.builder()
                .password("password123")
                .confirmPassword(null)
                .build();

        assertFalse(validator.isValid(request, context));
    }
}
