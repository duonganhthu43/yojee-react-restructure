export function prefixClass(className) {
  const _prefix = 'yoj';
  return _prefix ? `${_prefix}-${className}` : className;
}
