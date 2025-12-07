import type { Timestamp } from 'firebase/firestore';

interface DateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    name: string;
    currentValue?: Timestamp;
}

export default function DateInput({ label, name, currentValue, ...props }: DateInputProps) {
    // Format Date to YYYY-MM-DD string for date input
    const formattedValue = currentValue?.toDate().toISOString().split('T')[0] ?? '';

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
