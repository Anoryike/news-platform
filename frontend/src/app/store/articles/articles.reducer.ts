import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { Article } from '../../core/services/articles.service';
import { ArticlesActions } from './articles.actions';

export interface ArticlesState extends EntityState<Article> {
  total: number;
  loading: boolean;
  error: string | null;
  selectedId: number | null;
  publishing: boolean;
}

export const adapter: EntityAdapter<Article> = createEntityAdapter<Article>();

const initialState: ArticlesState = adapter.getInitialState({
  total: 0,
  loading: false,
  error: null,
  selectedId: null,
  publishing: false,
});

export const articlesReducer = createReducer(
  initialState,
  on(ArticlesActions.loadFeed, (state) => ({ ...state, loading: true, error: null })),
  on(ArticlesActions.loadFeedSuccess, (state, { articles, total }) =>
    adapter.setAll(articles, { ...state, total, loading: false }),
  ),
  on(ArticlesActions.loadFeedFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(ArticlesActions.loadArticle, (state, { id }) => ({ ...state, loading: true, selectedId: id })),
  on(ArticlesActions.loadArticleSuccess, (state, { article }) =>
    adapter.upsertOne(article, { ...state, loading: false }),
  ),
  on(ArticlesActions.loadArticleFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(ArticlesActions.publishArticle, (state) => ({ ...state, publishing: true, error: null })),
  on(ArticlesActions.publishArticleSuccess, (state, { article }) =>
    adapter.addOne(article, { ...state, publishing: false, total: state.total + 1 }),
  ),
  on(ArticlesActions.publishArticleFailure, (state, { error }) => ({ ...state, publishing: false, error })),
  on(ArticlesActions.scoreUpdated, (state, { articleId, score, explanation }) =>
    adapter.updateOne(
      { id: articleId, changes: { status: 'analyzed', aiScore: { score, explanation } as any } },
      state,
    ),
  ),
);
