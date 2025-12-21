interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    name: string;
    defaultValue?: string | number;
}

export default function TextArea({ label, name, defaultValue = '', ...props }: TextAreaProps) {
    return (
        <label className="input w-full h-32">
            <span className="label w-50 h-32 font-bold">{label}</span>
            <textarea
                id={name}
                name={name}
                className="textarea textarea-ghost h-30 w-full focus:outline-none focus:ring-0 focus:border-transparent outline-none"
                defaultValue={defaultValue}
                {...props}
            />
        </label>
    );
}
