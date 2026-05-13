import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Article } from '../../core/services/articles.service';

export const ArticlesActions = createActionGroup({
  source: 'Articles',
  events: {
    'Load Feed': props<{ page: number }>(),
    'Load Feed Success': props<{ articles: Article[]; total: number }>(),
    'Load Feed Failure': props<{ error: string }>(),
    'Load Article': props<{ id: number }>(),
    'Load Article Success': props<{ article: Article }>(),
    'Load Article Failure': props<{ error: string }>(),
    'Publish Article': props<{ title: string; body: string }>(),
    'Publish Article Success': props<{ article: Article }>(),
    'Publish Article Failure': props<{ error: string }>(),
    'Score Updated': props<{ articleId: number; score: number; explanation: string }>(),
  },
});
