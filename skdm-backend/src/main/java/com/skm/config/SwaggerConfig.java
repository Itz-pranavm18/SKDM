package com.skm.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.*;
import io.swagger.v3.oas.models.security.*;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("SKM College Management System API")
                        .description("Complete REST API for Shiv Kumari Mahavidyalaya College Management System. " +
                                     "Provides endpoints for authentication, admissions, courses, faculty, notices, gallery, and admin management.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("SKM College Admin")
                                .email("admin@skmahavidyalaya.ac.in")
                                .url("http://localhost:8080"))
                        .license(new License().name("Private")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Development Server")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter your JWT access token here")));
    }
}
