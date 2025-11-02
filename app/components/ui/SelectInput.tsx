interface SelectInputProps<T extends string | number> extends React.InputHTMLAttributes<HTMLSelectElement> {
    label: string;
    name: string;
    defaultValue?: T;
    options: { value: T; label: string }[];
}

export default function SelectInput<T extends string | number>({
    label,
    name,
    options,
    defaultValue,
    ...props
}: SelectInputProps<T>) {
    return (
        <label className="input w-full">
            <span className="label w-50 text-primary font-bold">{label}</span>
            <select
                id={name}
                name={name}
                defaultValue={defaultValue ?? ''}
                className="select select-ghost w-full focus:outline-none focus:ring-0 focus:border-transparent outline-none"
                style={{ outline: 'none', boxShadow: 'none' }}
                {...props}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    );
}
