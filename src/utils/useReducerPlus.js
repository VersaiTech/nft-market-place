import { useEffect, useRef, useReducer } from 'react';

export function useDevTools() {
  const devTools = useRef({});

  useEffect(() => {
    const withDevTools =
      typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__;

    if (withDevTools) {
      let toolsObj = window.__REDUX_DEVTOOLS_EXTENSION__.connect();
      Object.assign(devTools.current, toolsObj);
      devTools.current.init({ value: 'initial state' });
      // devTools.current.open();
    } else {
      console.log('no dev tools found');
    }
    const dt = devTools.current;
    return () => {
      if (withDevTools) {
        window.__REDUX_DEVTOOLS_EXTENSION__.disconnect();
      }
      Object.assign(dt, {});
      // devTools.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return devTools.current;
}

export function useReducerPlus(initialState) {
  return useReducer((state, update) => {
    if (update) {
      return {
        ...state,
        ...update,
      };
    }
    return state;
  }, initialState);
}

export function useScrollHook() {
  const scrollRef = useRef();
  const scrollTop = () =>
    scrollRef.current.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  const scrollBottom = () =>
    scrollRef.current.scrollTo({
      top: 1000,
      behavior: 'smooth',
    });

  return [scrollRef, scrollTop, scrollBottom];
}
export const handleScroll = (open) => {
  if (open) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'auto';
  }
};
