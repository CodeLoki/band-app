import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.dirname(scriptDirectory);
const distDirectory = path.join(projectDirectory, 'dist');
const manifestPath = path.join(projectDirectory, 'public', 'bands.json');
const templatePath = path.join(distDirectory, 'index.html');
const siteOrigin = (process.env.PUBLIC_SITE_URL ?? 'https://band-app-5jmwy.kinsta.page').replace(/\/$/, '');

const escapeHtml = (value) =>
    String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');

const updateMeta = (html, attribute, value) => {
    const escapedValue = escapeHtml(value);
    const pattern = new RegExp(
        `(<meta\\s+${attribute.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\s+content=\\")[^"]*(\\")`,
        'i'
    );
    return html.replace(pattern, `$1${escapedValue}$2`);
};

const removeMeta = (html, attribute) => {
    const pattern = new RegExp(
        `<meta\\s+${attribute.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\s+content="[^"]*"\\s*/?>\\s*`,
        'gi'
    );
    return html.replace(pattern, '');
};

const setMeta = (html, attribute, value) => {
    const updatedHtml = updateMeta(html, attribute, value);
    if (updatedHtml !== html) return updatedHtml;

    return updatedHtml.replace('</head>', `    <meta ${attribute} content="${escapeHtml(value)}" />\n  </head>`);
};

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const template = await readFile(templatePath, 'utf8');

if (!Array.isArray(manifest.bands)) {
    throw new Error('public/bands.json must contain a bands array');
}

for (const band of manifest.bands) {
    if (!band || typeof band.id !== 'string' || typeof band.name !== 'string') {
        throw new Error('Each manifest band requires string id and name fields');
    }

    const bandId = encodeURIComponent(band.id);
    const name = band.name.trim();
    const pageUrl = `${siteOrigin}/b/${bandId}`;
    let html = template;

    html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(name)} | Band App</title>`);
    html = updateMeta(html, 'property="og:title"', `${name} | Band App`);
    html = updateMeta(html, 'property="og:description"', `Songbook and gig management for ${name}.`);
    html = updateMeta(html, 'property="og:url"', pageUrl);
    if (typeof band.logo === 'string') {
        const imageUrl = new URL(band.logo, `${siteOrigin}/`).toString();
        html = setMeta(html, 'property="og:image"', imageUrl);
        html = setMeta(html, 'property="og:image:type"', 'image/svg+xml');
        html = setMeta(html, 'property="og:image:width"', '700');
        html = setMeta(html, 'property="og:image:height"', '700');
        html = setMeta(html, 'name="twitter:image"', imageUrl);
    } else {
        html = removeMeta(html, 'property="og:image"');
        html = removeMeta(html, 'property="og:image:type"');
        html = removeMeta(html, 'property="og:image:width"');
        html = removeMeta(html, 'property="og:image:height"');
        html = removeMeta(html, 'name="twitter:image"');
    }
    html = updateMeta(html, 'name="twitter:title"', `${name} | Band App`);
    html = updateMeta(html, 'name="twitter:description"', `Songbook and gig management for ${name}.`);
    html = html.replace('</head>', `    <link rel="canonical" href="${escapeHtml(pageUrl)}" />\n  </head>`);

    const outputDirectory = path.join(distDirectory, 'b', bandId);
    await mkdir(outputDirectory, { recursive: true });
    await writeFile(path.join(outputDirectory, 'index.html'), html);
}

console.log(`Generated ${manifest.bands.length} band page${manifest.bands.length === 1 ? '' : 's'}.`);
