import { AstroGlobal } from "astro";

export async function getPosts(astro: AstroGlobal) {
    return await astro.glob('../../src/pages/posts/*.md');
}

export function getSlug(astro: AstroGlobal): string {
    return astro.canonicalURL.href.split('/').filter(x => x).pop();
}
