package com.PlateformRH.chatbot;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class OllamaClient {

    private final RestClient restClient;
    private final String model;

    public OllamaClient(
            RestClient.Builder restClientBuilder,
            @Value("${ollama.base-url:http://localhost:11434}") String baseUrl,
            @Value("${ollama.model:llama3.2}") String model
    ) {
        this.restClient = restClientBuilder.baseUrl(baseUrl).build();
        this.model = model;
    }

    public String generate(String prompt) {
        OllamaGenerateResponse response = restClient.post()
                .uri("/api/generate")
                .body(new OllamaGenerateRequest(model, prompt, false))
                .retrieve()
                .body(OllamaGenerateResponse.class);

        if (response == null || response.response() == null || response.response().isBlank()) {
            return "Je n'ai pas pu générer une réponse avec Ollama.";
        }

        return response.response().trim();
    }
}
