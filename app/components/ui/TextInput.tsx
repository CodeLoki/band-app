interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    name: string;
    defaultValue?: string | number;
    type?: string;
}

export default function TextInput({ label, name, defaultValue = '', type, ...props }: TextInputProps) {
    return (
        <label className="input w-full">
            <span className="label w-50 text-primary font-bold">{label}</span>
            <input type={type ?? 'text'} id={name} name={name} defaultValue={defaultValue} {...props} />
        </label>
    );
}
