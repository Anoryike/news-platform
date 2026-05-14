import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WebsocketService {
  onScoreUpdate(articleId: number): Observable<{ score: number; explanation: string }> {
    return new Observable((observer) => {
      const ws = new WebSocket(`${environment.wsUrl}/ws/${articleId}`);
      ws.onmessage = (event) => observer.next(JSON.parse(event.data));
      ws.onerror = () => observer.error('WebSocket error');
      ws.onclose = () => observer.complete();
      return () => ws.close();
    });
  }

  onFeedUpdates(): Observable<{ articleId: number; score: number; explanation: string }> {
    return new Observable((observer) => {
      const ws = new WebSocket(`${environment.wsUrl}/ws/feed`);
      ws.onmessage = (event) => observer.next(JSON.parse(event.data));
      ws.onerror = () => observer.error('WebSocket error');
      ws.onclose = () => observer.complete();
      return () => ws.close();
    });
  }
}
