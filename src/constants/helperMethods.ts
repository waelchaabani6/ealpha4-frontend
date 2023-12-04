function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timerId: ReturnType<typeof setTimeout>;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

export { debounce };
