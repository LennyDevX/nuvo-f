import { useMemo } from 'react';
import { createSelector } from 'reselect';

export const createTokenSelector = () => {
  return createSelector(
    [(state) => state.tokens, (state) => state.selected],
    (tokens, selected) => {
      return {
        tokens: tokens || [],
        selected: selected || []
      };
    }
  );
};

export const useTokenSelector = (state) => {
  const selector = useMemo(() => createTokenSelector(), []);
  return useMemo(() => selector(state), [state, selector]);
};
