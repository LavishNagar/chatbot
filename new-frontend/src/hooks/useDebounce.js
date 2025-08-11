import { useRef, useEffect } from 'react';

// simple debounce hook that returns a debounced function
export default function useDebounce(fn, delay = 300) {
  const ref = useRef();
  useEffect(() => {
    ref.current = fn;
  }, [fn]);

  const debounced = (...args) => {
    if (debounced._timeout) clearTimeout(debounced._timeout);
    debounced._timeout = setTimeout(() => {
      ref.current(...args);
    }, delay);
  };
  return debounced;
}
