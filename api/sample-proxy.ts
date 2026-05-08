// Same-origin HTML proxy for the embedded Euphoria sample.
//
// Browsers block the parent window from programmatically scrolling a
// cross-origin iframe (security boundary). To enable an auto-scroll
// effect, we serve the embedded site's HTML through our own origin so
// the iframe shares an origin with the parent and
// `iframe.contentWindow.scrollTo(0, y)` is allowed.
//
// We only proxy the HTML document — subresources (CSS/JS/images/fonts)
// load directly from the original origin via a `<base>` tag injection.
// That keeps the proxy cheap (one ~tens-of-KB HTML fetch per page load)
// and avoids the visual breakage of also rewriting every asset URL.
//
// /barber-generator personalizes the sample by passing `?shop=…&phone=…&city=…`,
// which triggers a string-replacement pass over the proxied HTML.

const ORIGIN = 'https://dist-black-nine-17.vercel.app';

const escapeHtml = (s: string) =>
    s.replace(/[<>"'&]/g, (c) =>
        ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;' }[c]!));

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

        // /barber-generator personalization. Replace the upstream's "Euphoria"
        // brand and "(617) 945-1137" phone (in 4 distinct formats) with the
        // visitor's shop name and phone before serving.
        const shop = (req.query?.shop || '').toString().trim().slice(0, 80);
        const phone = (req.query?.phone || '').toString().trim().slice(0, 40);
        const city = (req.query?.city || '').toString().trim().slice(0, 60);
        const personalize = !!(shop || phone || city);
        if (personalize) {
            if (phone) {
                const safe = escapeHtml(phone);
                const digits = phone.replace(/\D/g, '');
                html = html
                    .replace(/\(617\)\s*945\s*[·\-]\s*1137/g, safe)
                    .replace(/617-945-1137/g, safe);
                if (digits) html = html.replace(/6179451137/g, digits);
            }
            if (shop) html = html.replace(/\bEuphoria\b/g, escapeHtml(shop));
            // Cambridge, MA appears 35× in upstream copy (titles, meta,
            // about copy, addresses). Word-boundary match avoids
            // collisions like "Cambridgeshire".
            if (city) html = html.replace(/\bCambridge\b/g, escapeHtml(city));

            // Strip Euphoria-specific provenance that doesn't apply to
            // the visitor's shop (state + zip, est. year, neighborhood).
            html = html
                .replace(/,?\s*MA\s*02141/g, '')
                .replace(/\b02141\b/g, '')
                .replace(/\s*[·\-—]\s*Est\.\s*2013/gi, '')
                .replace(/\bEst\.\s*2013\b/gi, '')
                .replace(/\s+since\s+2013/gi, '')
                .replace(/\bWellington-Harrington\b/g, '');

            // Replace the upstream logo image with the visitor's shop
            // name in white serif text. The wrapping <a class="logo-mark">
            // anchor inherits the browser's default link color (blue),
            // which is why we force white on the span.
            if (shop) {
                const safeShop = escapeHtml(shop);
                html = html.replace(
                    /<img\b[^>]*class="logo-img"[^>]*\/?>/g,
                    `<span class="logo-img" style="font-family:'Newsreader',serif;font-size:24px;font-weight:600;letter-spacing:0.01em;color:#ffffff;display:inline-block;line-height:1;text-decoration:none;white-space:nowrap;">${safeShop}</span>`,
                );
            }

            // Replace "Book Online / Book Now / Book an Appointment"
            // links (all pointing at vagaro.com/euphoriabarbershop) with
            // a "Call us · {phone}" tel: link, since the visitor's shop
            // doesn't have a Vagaro booking page.
            if (phone) {
                const safePhone = escapeHtml(phone);
                const digits = phone.replace(/\D/g, '');
                const telHref = digits ? `tel:${digits}` : `tel:${safePhone}`;
                // Swap href first (in any vagaro link), then visible text.
                html = html.replace(
                    /https:\/\/www\.vagaro\.com\/euphoriabarbershop/g,
                    telHref,
                );
                const callLabel = `Call us · ${safePhone}`;
                html = html
                    .replace(/Book an Appointment/g, callLabel)
                    .replace(/Book Online/g, callLabel)
                    .replace(/Book Now/g, callLabel);
            }

            // Remove the "By Email" block in the contact section.
            html = html.replace(
                /<div class="visit-info-block">\s*<div class="visit-label">By Email<\/div>[\s\S]*?<\/div>/,
                '',
            );

            // Remove the "Linktree" link (and its leading separator) in
            // the footer, plus the email link there.
            html = html.replace(
                /<span class="footer-sep">[^<]*<\/span>\s*<a [^>]*linktr\.ee[^>]*>[^<]*<\/a>/g,
                '',
            );
            html = html.replace(
                /<span class="footer-sep">[^<]*<\/span>\s*<a [^>]*mailto:[^>]*>[^<]*<\/a>/g,
                '',
            );
        }

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
        // Personalized responses are per-visitor → never cache them. Otherwise
        // a short shared cache spares the upstream on /barber-sample.
        res.setHeader(
            'Cache-Control',
            personalize ? 'private, no-store' : 'public, max-age=300, s-maxage=300',
        );
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
