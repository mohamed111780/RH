package com.PlateformRH.chatbot;

import java.util.Map;

public record OllamaGenerateRequest(
        String model,
        String prompt,
        boolean stream,
        Map<String, Object> options
) {
}
