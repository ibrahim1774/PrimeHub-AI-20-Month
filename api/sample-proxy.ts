// Same-origin HTML proxy for /barber-sample's embedded Euphoria sample.
//
// Browsers block the parent window from programmatically scrolling a
// cross-origin iframe (security boundary). To enable an auto-scroll
// effect on /barber-sample, we serve the embedded site's HTML through
// our own origin so the iframe shares an origin with the parent and
// `iframe.contentWindow.scrollTo(0, y)` is allowed.
//
// We only proxy the HTML document — subresources (CSS/JS/images/fonts)
// load directly from the original origin via a `<base>` tag injection.
// That keeps the proxy cheap (one ~tens-of-KB HTML fetch per page load)
// and avoids the visual breakage of also rewriting every asset URL.

const ORIGIN = 'https://dist-black-nine-17.vercel.app';

export default async function handler(req: any, res: any) {
    try {
        const rawPath = req.query?.path;
        const pathStr = Array.isArray(rawPath) ? rawPath.join('/') : (rawPath || '');
        const target = `${ORIGIN}/${pathStr}`;

        const upstream = await fetch(target, {
            // Forward UA so the original site renders the right device flavour.
            headers: {
                'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
                'Accept': 'text/html,application/xhtml+xml',
            },
            redirect: 'follow',
        });

        const ct = upstream.headers.get('content-type') || '';

        // Non-HTML (an asset path snuck in here somehow): redirect to origin.
        if (!ct.includes('text/html')) {
            res.redirect(307, target);
            return;
        }

        let html = await upstream.text();

        // Inject `<base href="https://dist-black-nine-17.vercel.app/">` as the
        // very first thing inside <head> so every relative URL inside the page
        // resolves to the original origin. Idempotent — only injects once.
        const baseTag = `<base href="${ORIGIN}/">`;
        if (!html.includes(baseTag)) {
            // <head> may have attributes (e.g. <head data-foo>); match either form.
            html = html.replace(
                /<head(\s[^>]*)?>/i,
                (m) => `${m}${baseTag}`,
            );
        }

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        // Short-lived cache so we're not hammering the upstream on every load,
        // but a content change there propagates within ~5 minutes.
        res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
        // Belt-and-suspenders: tell the browser this is allowed to be framed
        // by us even if the upstream had a contrary header.
        res.removeHeader?.('X-Frame-Options');
        res.removeHeader?.('Content-Security-Policy');
        return res.send(html);
    } catch (err: any) {
        console.error('[sample-proxy] error:', err?.message || err);
        res.status(502).send('Sample proxy error');
    }
}
