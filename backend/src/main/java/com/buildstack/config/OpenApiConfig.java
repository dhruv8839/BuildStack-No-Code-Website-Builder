package com.buildstack.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI buildStackOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("BuildStack API")
                        .description("Backend REST API for the BuildStack project management SaaS platform.")
                        .version("v1.0"));
    }
}
