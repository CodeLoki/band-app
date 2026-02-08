import clsx from 'clsx';
import DOMPurify from 'dompurify';
import type { QueryDocumentSnapshot } from 'firebase/firestore';
import { useMemo } from 'react';
import type { Band } from '@/firestore/bands';

export default function SvgLogo({ band, className }: { band: QueryDocumentSnapshot<Band>; className?: string }) {
    const { logo } = band.data();

    const sanitizedSvg = useMemo(
        () =>
            logo
                ? DOMPurify.sanitize(logo, {
                      USE_PROFILES: { svg: true, svgFilters: true }
                  })
                : null,
        [logo]
    );

    if (!sanitizedSvg) {
        return null;
    }

    return (
        <div
            className={clsx('fill-current', className)}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: SVG is sanitized with DOMPurify
            dangerouslySetInnerHTML={{ __html: sanitizedSvg }}
        />
    );
}
