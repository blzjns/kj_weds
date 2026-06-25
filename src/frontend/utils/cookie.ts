import { SESSION_MAX_AGE } from "@/session.constants";

export async function getCookie(cname: string): Promise<string | undefined> {
    try {
        if (!!window.cookieStore) {
            return (await window.cookieStore.get(cname))?.value;
        } else {
            return document.cookie.match(`(^|;)\\s*${cname}\\s*=\\s*([^;]+)`)?.[2] || undefined;
        }
    } catch (error) {
        console.error("Error in getCookie", error);
        return undefined;
    }
}

export async function deleteCookie(cname: string) {
    if (!!window.cookieStore) {
        await window.cookieStore.delete(cname);
    } else {
        document.cookie = `${cname}=; Max-Age=0; path=/;`;
    }
}

export async function setCookie(cookieOptions: CookieInit & { maxAge: number }, setOnlyIfNull: boolean = true) {
    const cookie = await getCookie(cookieOptions.name);
    if (setOnlyIfNull && !!cookie) return;
    if (!!window.cookieStore) {
        window.cookieStore.set(cookieOptions);
    } else {
        document.cookie = `${cookieOptions.name}=${cookieOptions.value}; Path=${cookieOptions.path ?? '/'}; SameSite=${cookieOptions.sameSite ?? 'lax'}; Max-Age=${cookieOptions.maxAge}`;
    }
}
