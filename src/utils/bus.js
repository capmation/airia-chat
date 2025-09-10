const bus = new EventTarget();

export function publish(name, detail) {
  bus.dispatchEvent(new CustomEvent(name, { detail }));
}

export function subscribe(name, handler) {
  const fn = (e) => handler(e.detail);
  bus.addEventListener(name, fn);
  return () => bus.removeEventListener(name, fn);
}
