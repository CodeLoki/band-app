import type {
	DocumentSnapshot,
	QueryDocumentSnapshot,
	QuerySnapshot,
} from "firebase/firestore";
import {
	collection,
	doc,
	getDoc,
	getDocs,
	query,
	where,
} from "firebase/firestore";
import { createContext, useCallback, useContext } from "react";
import { db } from "@/config/firebase";
import { type Gig, gigConverter } from "@/firestore/gigs";
import { type Song, songConverter, User } from "@/firestore/songs";

interface FirestoreContextType {
	band: QueryDocumentSnapshot<{ description: string }>;
	bands: QueryDocumentSnapshot<{ description: string }>[];
	user: User;
	canEdit: boolean;
	isMe: boolean;
	// Methods
	getGigs: () => Promise<QuerySnapshot<Gig>>;
	getGig: (gigId: string) => Promise<DocumentSnapshot<Gig>>;
	getSongs: () => Promise<QuerySnapshot<Song>>;
}

const FirestoreContext = createContext<FirestoreContextType>({
	band: {} as QueryDocumentSnapshot<{ id: string; description: string }>,
	bands: [],
	user: User.None,
	canEdit: false,
	isMe: false,
	getGigs: async () => {
		throw new Error("FirestoreProvider not initialized");
	},
	getGig: async () => {
		throw new Error("FirestoreProvider not initialized");
	},
	getSongs: () => {
		throw new Error("FirestoreProvider not initialized");
	},
});

interface FirestoreProviderProps {
	children: React.ReactNode;
	band: QueryDocumentSnapshot<{ description: string }>;
	bands: QueryDocumentSnapshot<{ description: string }>[];
	userCode: User;
}

export function FirestoreProvider({
	children,
	band,
	bands,
	userCode,
}: FirestoreProviderProps) {
	const getGigs = useCallback(() => {
		return getDocs(
			query(
				collection(db, "gigs"),
				where("band", "==", band.ref),
			).withConverter(gigConverter),
		);
	}, [band.ref]);

	const getGig = useCallback((gigId: string) => {
		const gigRef = doc(db, "gigs", gigId).withConverter(gigConverter);
		return getDoc(gigRef);
	}, []);

	const getSongs = useCallback(() => {
		return getDocs(
			query(
				collection(db, "songs"),
				where("bands", "array-contains", band.ref),
			).withConverter(songConverter),
		);
	}, [band.ref]);

	const value = {
		band,
		bands,
		user: userCode,
		canEdit: true,
		isMe: userCode === User.Me,
		getGigs,
		getGig,
		getSongs,
	};

	return (
		<FirestoreContext.Provider value={value}>
			{children}
		</FirestoreContext.Provider>
	);
}

export function useFirestore() {
	return useContext(FirestoreContext);
}
