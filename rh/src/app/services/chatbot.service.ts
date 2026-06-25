import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatbotRequest {
  question: string;
  scope: string;
}

interface ChatbotResponse {
  answer: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiUrl = 'http://localhost:8000/chatbot';

  constructor(private http: HttpClient) {}

  ask(question: string, scope: string): Observable<ChatbotResponse> {
    const body: ChatbotRequest = { question, scope };
    const token = localStorage.getItem('accessToken');
    const options = token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};

    return this.http.post<ChatbotResponse>(`${this.apiUrl}/ask`, body, options);
  }
}
