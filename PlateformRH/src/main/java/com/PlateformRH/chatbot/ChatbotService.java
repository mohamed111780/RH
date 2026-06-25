package com.PlateformRH.chatbot;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatbotService {

    private final ChatbotDataService chatbotDataService;
    private final OllamaClient ollamaClient;

    public String ask(String question, ChatbotAccessLevel accessLevel) {
        String cleanQuestion = question == null ? "" : question.trim();
        if (cleanQuestion.isBlank()) {
            return "Veuillez poser une question.";
        }

        String prompt = """
                Tu es l'assistant RH de l'application PlateformRH.

                Contexte:
                %s

                Question utilisateur:
                %s

                Reponse:
                """.formatted(chatbotDataService.buildContext(accessLevel), cleanQuestion);

        return ollamaClient.generate(prompt);
    }
}
