package com.PlateformRH.chatbot;

public record OllamaGenerateRequest(String model, String prompt, boolean stream) {
}
