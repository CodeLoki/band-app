import clsx from 'clsx';
import type { QueryDocumentSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import type { Band } from '@/firestore/bands';

export default function SvgLogo({ band, className }: { band: QueryDocumentSnapshot<Band>; className?: string }) {
    const { description } = band.data();
    const logoPath = `/logos/${encodeURIComponent(band.id)}.svg`;
    const [hasLogo, setHasLogo] = useState(true);

    useEffect(() => {
        if (logoPath) setHasLogo(true);
    }, [logoPath]);

    if (!hasLogo) {
        return null;
    }

    return (
        <img src={logoPath} alt={`${description} logo`} className={clsx(className)} onError={() => setHasLogo(false)} />
    );
}
