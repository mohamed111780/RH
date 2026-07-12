package com.PlateformRH.chatbot;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Component
public class OllamaClient {

    private final RestClient restClient;
    private final String model;
    private final Map<String, Object> options;

    public OllamaClient(
            RestClient.Builder restClientBuilder,
            @Value("${ollama.base-url:http://localhost:11434}") String baseUrl,
            @Value("${ollama.model:llama3.2:3b}") String model,
            @Value("${ollama.temperature:0.1}") double temperature,
            @Value("${ollama.num-predict:512}") int numPredict
    ) {
        this.restClient = restClientBuilder.baseUrl(baseUrl).build();
        this.model = model;
        this.options = Map.of(
                "temperature", temperature,
                "num_predict", numPredict,
                "top_p", 0.9
        );
    }

    public String generate(String prompt) {
        try {
            OllamaGenerateResponse response = restClient.post()
                    .uri("/api/generate")
                    .body(new OllamaGenerateRequest(model, prompt, false, options))
                    .retrieve()
                    .body(OllamaGenerateResponse.class);

            if (response == null || response.response() == null || response.response().isBlank()) {
                throw new IllegalStateException("Reponse Ollama vide");
            }

            return response.response().trim();
        } catch (Exception ex) {
            throw new IllegalStateException("Impossible de contacter Ollama", ex);
        }
    }
}
