import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AiScore {
  score: number;
  bertScore: number | null;
  claimbusterScore: number | null;
  factcheckScore: number | null;
  explanation: string | null;
}

export interface Article {
  id: number;
  title: string;
  body: string;
  status: 'pending' | 'analyzed';
  createdAt: string;
  author: { id: number; email: string };
  aiScore: AiScore | null;
}

export interface ArticlesPage {
  data: Article[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class ArticlesService {
  private readonly url = `${environment.apiUrl}/articles`;

  constructor(private http: HttpClient) {}

  getAll(page = 1, limit = 20): Observable<ArticlesPage> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<ArticlesPage>(this.url, { params });
  }

  getOne(id: number): Observable<Article> {
    return this.http.get<Article>(`${this.url}/${id}`);
  }

  create(title: string, body: string): Observable<Article> {
    return this.http.post<Article>(this.url, { title, body });
  }
}
