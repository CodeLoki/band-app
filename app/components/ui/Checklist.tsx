interface ChecklistProps<T extends string | number> {
    label: string;
    name: string;
    options: { value: T; label: string }[];
    values?: T[];
}

export default function Checklist<T extends string | number>({ label, name, options, values = [] }: ChecklistProps<T>) {
    return (
        <fieldset className="form-control">
            <legend className="label">
                <span className="label-text font-bold">{label}</span>
            </legend>
            <div className="flex flex-wrap gap-2 items-center m-0">
                {options.map(({ value, label }) => (
                    <label
                        key={value}
                        className="flex items-center gap-3 cursor-pointer hover:bg-base-200 rounded-lg p-2 transition-colors"
                    >
                        <input
                            type="checkbox"
                            name={name}
                            value={value}
                            className="checkbox checkbox-accent checkbox-sm"
                            defaultChecked={values.includes(value)}
                        />
                        <span className="label-text text-sm">{label}</span>
                    </label>
                ))}
            </div>
        </fieldset>
    );
}
