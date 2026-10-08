import React from 'react';
import { render, RenderResult, fireEvent } from '@testing-library/react';
import LikedView from './LikedView';
import { queryByDataHook, getByDataHook } from '@/__tests__/testUtils';

export class LikedViewDriver {
  private renderResult: RenderResult | null = null;

  render(): this {
    this.renderResult = render(<LikedView />);
    return this;
  }

  exists(): boolean {
    if (!this.renderResult) return false;
    return queryByDataHook(this.renderResult.container, 'liked-view-container') !== null;
  }

  getHeadingText(): string {
    if (!this.renderResult) throw new Error('LikedViewDriver: render() required');
    const heading = getByDataHook(this.renderResult.container, 'liked-view-heading');
    return heading.textContent?.trim() ?? '';
  }

  isLoadingVisible(): boolean {
    if (!this.renderResult) return false;
    return queryByDataHook(this.renderResult.container, 'liked-loading-text') !== null;
  }

  getLoadingText(): string {
    if (!this.renderResult) throw new Error('LikedViewDriver: render() required');
    const loading = getByDataHook(this.renderResult.container, 'liked-loading-text');
    return loading.textContent?.trim() ?? '';
  }

  isErrorVisible(): boolean {
    if (!this.renderResult) return false;
    return queryByDataHook(this.renderResult.container, 'liked-error-container') !== null;
  }

  getErrorText(): string {
    if (!this.renderResult) throw new Error('LikedViewDriver: render() required');
    const error = getByDataHook(this.renderResult.container, 'liked-error-text');
    return error.textContent?.trim() ?? '';
  }

  isEmptyStateVisible(): boolean {
    if (!this.renderResult) return false;
    return queryByDataHook(this.renderResult.container, 'liked-empty-text') !== null;
  }

  clickRetry(): void {
    if (!this.renderResult) throw new Error('LikedViewDriver: render() required');
    const retryBtn = getByDataHook(this.renderResult.container, 'liked-retry-button');
    fireEvent.click(retryBtn);
  }
}
