import type { Timestamp } from 'firebase/firestore';

interface DateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    name: string;
    currentValue?: Timestamp;
}

// Format Date to YYYY-MM-DD string using local timezone
function formatLocalDate(date: Date) {
    const year = date.getFullYear(),
        month = String(date.getMonth() + 1).padStart(2, '0'),
        day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export default function DateInput({ label, name, currentValue, ...props }: DateInputProps) {
    const formattedValue = currentValue ? formatLocalDate(currentValue.toDate()) : '';

    return (
        <label className="input w-full">
            <span className="label w-50 font-bold">{label}</span>
            <input
                type="date"
                className="input input-ghost focus:outline-none focus:ring-0 focus:border-transparent outline-none"
                id={name}
                name={name}
                defaultValue={formattedValue}
                {...props}
            />
        </label>
    );
}
