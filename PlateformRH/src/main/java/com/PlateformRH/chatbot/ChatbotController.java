package com.PlateformRH.chatbot;

import com.PlateformRH.Utilisateur.Role;
import com.PlateformRH.Utilisateur.utilisateur;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/chatbot")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping("/ask")
    public ResponseEntity<ChatbotResponse> ask(@RequestBody ChatbotRequest request, Authentication authentication) {
        return ResponseEntity.ok(new ChatbotResponse(
                chatbotService.ask(request.question(), resolveAccessLevel(authentication, request.scope()))
        ));
    }

    private ChatbotAccessLevel resolveAccessLevel(Authentication authentication, String requestedScope) {
        ChatbotAccessLevel requestedAccessLevel = parseRequestedScope(requestedScope);

        if (authentication == null || !(authentication.getPrincipal() instanceof utilisateur user)) {
            return ChatbotAccessLevel.VISITEUR;
        }

        if (requestedAccessLevel == ChatbotAccessLevel.VISITEUR) {
            return ChatbotAccessLevel.VISITEUR;
        }

        if (user.getRole() == Role.ADMIN || user.getRole() == Role.RH) {
            return ChatbotAccessLevel.FULL;
        }

        if (user.getRole() == Role.EMPLOYE) {
            return ChatbotAccessLevel.EMPLOYE;
        }

        return ChatbotAccessLevel.VISITEUR;
    }

    private ChatbotAccessLevel parseRequestedScope(String requestedScope) {
        if (requestedScope == null) {
            return ChatbotAccessLevel.VISITEUR;
        }

        return switch (requestedScope.trim().toUpperCase()) {
            case "ADMIN", "RH" -> ChatbotAccessLevel.FULL;
            case "EMPLOYE" -> ChatbotAccessLevel.EMPLOYE;
            default -> ChatbotAccessLevel.VISITEUR;
        };
    }
}
