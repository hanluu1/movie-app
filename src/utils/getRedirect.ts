export function getRedirect () {
  if (typeof window === 'undefined') return '/';
  const target = new URLSearchParams(window.location.search).get('redirect');
  return target?.startsWith('/') && !target.startsWith('//') ? target : '/';
}
