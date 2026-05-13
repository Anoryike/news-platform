import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ArticlesState, adapter } from './articles.reducer';

const selectState = createFeatureSelector<ArticlesState>('articles');
const { selectAll, selectEntities } = adapter.getSelectors(selectState);

export const selectAllArticles = selectAll;
export const selectArticlesEntities = selectEntities;
export const selectArticlesTotal = createSelector(selectState, (s) => s.total);
export const selectArticlesLoading = createSelector(selectState, (s) => s.loading);
export const selectPublishing = createSelector(selectState, (s) => s.publishing);
export const selectSelectedId = createSelector(selectState, (s) => s.selectedId);
export const selectSelectedArticle = createSelector(
  selectEntities,
  selectSelectedId,
  (entities, id) => (id != null ? entities[id] ?? null : null),
);
