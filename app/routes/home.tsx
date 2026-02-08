import clsx from 'clsx';
import { collection, getDocs, type QueryDocumentSnapshot, query, where } from 'firebase/firestore';
import { LuCirclePlus, LuMusic } from 'react-icons/lu';
import { useLoaderData } from 'react-router';
import NavLink from '@/components/NavLink';
import SvgLogo from '@/components/SvgLogo';
import { db } from '@/config/firebase';
import { useFirestore } from '@/contexts/Firestore';
import { type Gig, gigConverter } from '@/firestore/gigs';
import { useNavigateWithParams } from '@/hooks/useNavigateWithParams';
import { type AppData, loadAppData } from '@/loaders/appData';
import { getTitle, sortBy } from '@/utils/general';

interface HomeLoaderData extends Pick<AppData, 'band'> {
    gigs: QueryDocumentSnapshot<Gig>[];
}

export async function clientLoader({ request }: { request: Request }) {
    const { band } = await loadAppData(request),
        gigsSnapshot = await getDocs(
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
        <li key={gig.id} className="list-row">
            <div>
                <LuMusic className="size-8" />
            </div>
            <NavLink
                to={`gig/${gig.id}`}
                aria-label={`${data.venue} on ${date}`}
                data-gig-id={gig.id}
                className="w-full"
            >
                <div className="text-accent">{data.venue}</div>
                <div className="text-xs uppercase font-semibold opacity-60">Date: {date}</div>
            </NavLink>
        </li>
    );
};

export default function Home() {
    const { band, gigs } = useLoaderData<HomeLoaderData>(),
        bandData = band.data(),
        { canEdit } = useFirestore(),
        { navigate } = useNavigateWithParams();

    const pageTitle = getTitle('Home', band);

    return (
        <>
            <title>{pageTitle}</title>
            <div className="flex flex-col gap-4 m-4 sm:flex-row">
                {bandData.logo ? (
                    <SvgLogo
                        band={band}
                        className={clsx(
                            'shrink-0 fill-slate-200 w-full',
                            '[&_svg]:max-h-[40vh] [&_svg]:justify-self-center [&_svg]:align-self-center',
                            'sm:w-1/2 sm:[&_svg]:max-h-[70vh]'
                        )}
                    />
                ) : null}

                <ul className="list w-full bg-base-100 rounded-box shadow-md">
                    <li className="p-4 text-lg text-accent font-bold">{bandData.description}</li>
                    {gigs.length ? gigs.map(renderGig) : <li className="list-row">No gigs scheduled yet.</li>}
                </ul>
            </div>
            {canEdit ? (
                <div className="fab">
                    <button
                        type="button"
                        className="btn btn-lg btn-circle btn-primary"
                        onClick={() => navigate('edit-gig/new')}
                    >
                        <LuCirclePlus />
                    </button>
                </div>
            ) : null}
        </>
    );
}
