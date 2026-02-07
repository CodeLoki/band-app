import clsx from 'clsx';
import type { QueryDocumentSnapshot } from 'firebase/firestore';
import type { Band } from '@/firestore/bands';

export default function SvgLogo({ band, className }: { band: QueryDocumentSnapshot<Band>; className?: string }) {
    const { logo } = band.data();
    if (!logo) {
        return null;
    }

    return (
        <div
            className={clsx('fill-current', className)}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: html comes from trusted source
            dangerouslySetInnerHTML={{ __html: logo }}
        />
    );
}
