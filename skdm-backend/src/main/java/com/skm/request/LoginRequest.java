package com.skm.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class LoginRequest {

    @NotBlank(message = "Email or username is required")
    private String usernameOrEmail;

    @NotBlank(message = "Password is required")
    private String password;

    private boolean rememberMe;
}
