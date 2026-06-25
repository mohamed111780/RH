import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { ChatMessage, ChatbotService } from '../../services/chatbot.service';

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot-widget.component.html',
  styleUrls: ['./chatbot-widget.component.css']
})
export class ChatbotWidgetComponent implements OnInit, OnDestroy {
  isOpen = false;
  question = '';
  isLoading = false;
  messages: ChatMessage[] = [];
  private currentScope = '';
  private historiesByScope: Record<string, ChatMessage[]> = {};
  private routeSubscription?: Subscription;

  constructor(
    private chatbotService: ChatbotService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.switchConversation(this.resolveScope());

    this.routeSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const nextScope = this.resolveScope();
        if (nextScope !== this.currentScope) {
          this.switchConversation(nextScope);
        }
      });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  send(): void {
    const text = this.question.trim();
    if (!text || this.isLoading) {
      return;
    }

    this.messages.push({ role: 'user', content: text });
    this.saveCurrentConversation();
    this.question = '';
    this.isLoading = true;

    this.chatbotService.ask(text, this.currentScope).subscribe({
      next: response => {
        this.messages.push({
          role: 'assistant',
          content: response.answer || "Je n'ai pas trouve de reponse."
        });
        this.saveCurrentConversation();
        this.isLoading = false;
      },
      error: () => {
        this.messages.push({
          role: 'assistant',
          content: "Impossible de joindre le chatbot. Verifiez que Spring Boot et Ollama sont demarres."
        });
        this.saveCurrentConversation();
        this.isLoading = false;
      }
    });
  }

  private switchConversation(scope: string): void {
    this.saveCurrentConversation();
    this.currentScope = scope;
    this.question = '';
    this.isLoading = false;
    this.messages = this.historiesByScope[scope]
      ? [...this.historiesByScope[scope]]
      : this.createInitialMessages(scope);
  }

  private saveCurrentConversation(): void {
    if (!this.currentScope) {
      return;
    }

    this.historiesByScope[this.currentScope] = [...this.messages];
  }

  private createInitialMessages(scope: string): ChatMessage[] {
    return [
      {
        role: 'assistant',
        content: this.getWelcomeMessage(scope)
      }
    ];
  }

  private resolveScope(): string {
    const url = this.router.url;
    if (url.startsWith('/admin')) {
      return 'ADMIN';
    }

    if (url.startsWith('/rh')) {
      return 'RH';
    }

    if (url.startsWith('/dashboard')) {
      return 'EMPLOYE';
    }

    if (url.startsWith('/offre') || url.startsWith('/postuler') || url.startsWith('/home') || url === '/') {
      return 'VISITEUR';
    }

    const user = this.getStoredUser();
    if (user?.role === 'ADMIN') {
      return 'ADMIN';
    }

    if (user?.role === 'RH') {
      return 'RH';
    }

    if (user?.role === 'EMPLOYE') {
      return 'EMPLOYE';
    }

    return 'VISITEUR';
  }

  private getStoredUser(): { role?: string } | null {
    const user = localStorage.getItem('user');
    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  }

  private getWelcomeMessage(scope: string): string {
    if (scope === 'ADMIN' || scope === 'RH') {
      return 'Bonjour, je peux repondre aux questions sur toute la plateforme RH.';
    }

    if (scope === 'EMPLOYE') {
      return 'Bonjour, je peux repondre aux questions sur les formations et les offres internes ou externes.';
    }

    return 'Bonjour, je peux repondre aux questions sur les offres externes disponibles.';
  }
}
