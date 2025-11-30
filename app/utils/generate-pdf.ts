import type { DocumentSnapshot } from 'firebase/firestore';
import { jsPDF } from 'jspdf';
import type { Gig } from '@/firestore/gigs';
import type { Song } from '@/firestore/songs';
import { calculateSetListLength, User } from '@/firestore/songs';
import { getSongNotes, SongNoteType } from '@/utils/song-notes';

interface SetListSongs {
    one: DocumentSnapshot<Song>[];
    two: DocumentSnapshot<Song>[];
    pocket: DocumentSnapshot<Song>[];
}

function getSetListTitle(title: string, songs: DocumentSnapshot<Song>[]) {
    return `${title} (${calculateSetListLength(songs)})`;
}

function getGigDate(gig: DocumentSnapshot<Gig>) {
    const gigData = gig.data();
    if (!gigData) return 'Unknown Date';

    return gigData.date.toDate().toLocaleDateString('en', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

interface PdfNote {
    /** ZapfDingbats symbol character (if any) */
    symbol?: string;
    /** Text to display after the symbol */
    text: string;
}

/**
 * ZapfDingbats symbols for note types that use them
 */
const NoteTypeToSymbol: Partial<Record<SongNoteType, string>> = {
    [SongNoteType.Features]: 's', // ▲ triangle
    [SongNoteType.Solos]: 'H' // ★ 5-pointed star
};

/** Note types to exclude from PDF output */
const ExcludedNoteTypes = new Set([SongNoteType.Pad, SongNoteType.Notes]);

/**
 * Generates the song notes to display in the PDF.
 * Filters out notes that don't make sense for PDF (Pad, Notes).
 * For Mixer, also excludes StartsWith.
 * Consolidates multiple Solos notes into one.
 */
function getPDFNotes(data: Song, user: User): PdfNote[] {
    const songNotes = getSongNotes(data, user);

    // Mixer doesn't see StartsWith in PDF
    const excludeTypes =
        user === User.Mixer ? new Set([...ExcludedNoteTypes, SongNoteType.StartsWith]) : ExcludedNoteTypes;

    // Filter and convert notes
    const pdfNotes: PdfNote[] = [];
    const soloTexts: string[] = [];

    for (const note of songNotes) {
        if (excludeTypes.has(note.type)) {
            continue;
        }

        // Collect solos to consolidate them
        if (note.type === SongNoteType.Solos) {
            soloTexts.push(note.text);
            continue;
        }

        pdfNotes.push({
            symbol: NoteTypeToSymbol[note.type],
            text: note.text
        });
    }

    // Add consolidated solos note
    if (soloTexts.length > 0) {
        pdfNotes.push({
            symbol: NoteTypeToSymbol[SongNoteType.Solos],
            text: soloTexts.join(', ')
        });
    }

    return pdfNotes;
}

/**
 * Generates a PDF set list for a gig.
 *
 * @param gig - The gig document
 * @param songs - The songs organized by set (one, two, pocket)
 * @param user - The current user (affects which notes are shown)
 * @throws Error if PDF generation fails
 */
export function generateSetListPdf(gig: DocumentSnapshot<Gig>, songs: SetListSongs, user: User): void {
    const venue = gig.get('venue') as string;
    const date = getGigDate(gig);
    const lineHeight = 10;

    const pdf = new jsPDF({
        format: 'letter'
    });

    const renderHeader = (): number => {
        pdf.setFontSize(12);
        pdf.setFont('Helvetica', 'bold');
        pdf.text(venue, lineHeight, 10);
        pdf.text(date, 200, 10, {
            align: 'right'
        });
        pdf.setFont('Helvetica', 'normal');

        return 20;
    };

    /**
     * Render legend at the bottom of the page for Mixer mode.
     * Shows what the symbols mean.
     */
    const renderLegend = (): void => {
        if (user !== User.Mixer) return;

        const legendY = 270; // Near bottom of page
        pdf.setFontSize(8);
        pdf.setFont('Helvetica', 'normal');

        // Features legend: ▲ = Featured
        let currentX = lineHeight;
        pdf.setFont('ZapfDingbats', 'normal');
        pdf.text('s', currentX, legendY);
        currentX += pdf.getTextWidth('s') + 1;
        pdf.setFont('Helvetica', 'normal');
        pdf.text('= Featured', currentX, legendY);
        currentX += pdf.getTextWidth('= Featured') + 8;

        // Solos legend: ★ = Solos
        pdf.setFont('ZapfDingbats', 'normal');
        pdf.text('H', currentX, legendY);
        currentX += pdf.getTextWidth('H') + 1;
        pdf.setFont('Helvetica', 'normal');
        pdf.text('= Solos', currentX, legendY);
    };

    let baseY = renderHeader();

    /**
     * Render notes with ZapfDingbats symbols where applicable.
     */
    const renderNotes = (notes: PdfNote[], x: number, y: number): void => {
        let currentX = x;
        pdf.setFontSize(10);

        for (let i = 0; i < notes.length; i++) {
            const note = notes[i];

            // Add space between notes
            if (i > 0) {
                currentX += 4;
            }

            // Render symbol if present
            if (note.symbol) {
                pdf.setFont('ZapfDingbats', 'normal');
                pdf.text(note.symbol, currentX, y);
                currentX += pdf.getTextWidth(note.symbol) + 1;
            }

            // Render text
            pdf.setFont('Helvetica', 'normal');
            pdf.text(note.text, currentX, y);
            currentX += pdf.getTextWidth(note.text);
        }
    };

    const addSetList = (
        setTitle: string,
        setSongs: DocumentSnapshot<Song>[],
        xOffset: number,
        yOffset: number
    ): number => {
        // Ensure consistent font size at the start
        pdf.setFontSize(13);
        pdf.setFont('Helvetica', 'bold');
        pdf.text(getSetListTitle(setTitle, setSongs), lineHeight + xOffset, yOffset);
        pdf.setFont('Helvetica', 'normal');

        let currentY = yOffset + lineHeight;

        for (const song of setSongs) {
            const data = song.data();
            if (data) {
                // Song title (normal size)
                pdf.setFontSize(12);
                pdf.text(data.title, lineHeight + xOffset, currentY);

                // Notes on a separate line (smaller, indented)
                const notes = getPDFNotes(data, user);
                if (notes.length > 0) {
                    renderNotes(notes, lineHeight + xOffset + 4, currentY + 5);
                }
                currentY += lineHeight + 5; // Same height for all songs
            }
        }

        // Reset font size
        pdf.setFontSize(12);
        return currentY;
    };

    const { one, two, pocket } = songs;

    let setOneEndY = baseY;
    let setTwoEndY = baseY;

    if (one.length > 0) {
        setOneEndY = addSetList('Set One', one, 0, baseY);
    }

    if (two.length > 0) {
        setTwoEndY = addSetList('Set Two', two, 100, baseY);
    }

    // Update baseY to account for the tallest set list (with some padding)
    baseY = Math.max(setOneEndY, setTwoEndY) + lineHeight;

    if (pocket.length > 0) {
        // Estimate pocket set height for page break check
        // Account for: set title + songs (assuming all have notes for safety margin)
        const pocketHeight = lineHeight + pocket.length * (lineHeight + 5);

        // Will the pocket set NOT fit on the current page?
        // Letter size is 279mm, leaving ~10mm margin at bottom
        if (baseY + pocketHeight > 269) {
            renderLegend(); // Add legend before switching pages
            pdf.addPage();
            baseY = renderHeader();
        }

        addSetList('Pocket', pocket, 0, baseY);
    }

    renderLegend(); // Add legend to the last page
    pdf.save(`${venue}-${date}.pdf`);
}
