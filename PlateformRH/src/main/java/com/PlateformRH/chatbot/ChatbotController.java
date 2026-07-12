package com.PlateformRH.chatbot;

import com.PlateformRH.Employe.employe;
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
                chatbotService.ask(request.question(), resolveAccessLevel(authentication))
        ));
    }

    private ChatbotAccessLevel resolveAccessLevel(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof employe user && user.getRole() != null) {
            return switch (user.getRole()) {
                case ADMIN, MANAGER, RH -> ChatbotAccessLevel.FULL;
                case EMPLOYE -> ChatbotAccessLevel.EMPLOYE;
            };
        }

        return ChatbotAccessLevel.VISITEUR;
    }
}
