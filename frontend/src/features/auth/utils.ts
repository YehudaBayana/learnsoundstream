export function getCookie(name: string): string | undefined {
  return document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}
