import { collection, getDocs, type QueryDocumentSnapshot, query, where } from 'firebase/firestore';
import { useEffect } from 'react';
import { LuCirclePlus } from 'react-icons/lu';
import { useLoaderData } from 'react-router-dom';
import NavBarLink from '@/components/NavBarLink';
import NavLink from '@/components/NavLink';
import { db } from '@/config/firebase';
import { useFirestore } from '@/contexts/Firestore';
import { useNavbar } from '@/contexts/NavbarContext';
import { type Gig, gigConverter } from '@/firestore/gigs';
import { loadAppData } from '@/loaders/appData';
import { CardStyle, getTitle, sortBy } from '@/utils/general';

export async function clientLoader({ request }: { request: Request }) {
    const { band } = await loadAppData(request);

    // Fetch gigs for this band
    const gigsSnapshot = await getDocs(
        query(collection(db, 'gigs'), where('band', '==', band.ref)).withConverter(gigConverter)
    );

    return {
        band,
        gigs: sortBy(gigsSnapshot.docs, 'date')
    };
}

const renderGig = (gig: QueryDocumentSnapshot<Gig>) => {
    const data = gig.data(),
        date = data.date.toDate().toLocaleDateString();

    return (
        <NavLink key={gig.id} to={`gig/${gig.id}`} className={CardStyle} aria-label={`${data.venue} on ${date}`}>
            <div className="card-body text-center p-6">
                <h2 className="card-title justify-center">{data.venue}</h2>
                <p>Date: {date}</p>
            </div>
        </NavLink>
    );
};

export default function Home() {
    const { band, gigs } = useLoaderData() as Awaited<ReturnType<typeof clientLoader>>,
        { canEdit } = useFirestore(),
        { setNavbarContent } = useNavbar();

    useEffect(() => {
        if (canEdit) {
            setNavbarContent(
                <NavBarLink to="/edit-gig/new" className="text-primary">
                    <LuCirclePlus />
                    Add
                </NavBarLink>
            );
        }

        return () => setNavbarContent(null);
    }, [setNavbarContent, canEdit]);

    const pageTitle = getTitle('Home', band);

    return (
        <>
            <title>{pageTitle}</title>
            <div className="bg-base-800 m-4 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {gigs.length ? gigs.map(renderGig) : <p className="text-center col-span-full">No gigs scheduled.</p>}
            </div>
        </>
    );
}
