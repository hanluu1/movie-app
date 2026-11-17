interface FormFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  hint?: string;
}

const inputClass = 'w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-[#F1EEFF] backdrop-blur-md transition-all placeholder:text-[#B3A9D6]/70 focus:border-[#8B5CF6]/70 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/25';

export default function FormField ({ label, type = 'text', placeholder, value, onChange, required, hint }: FormFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#F1EEFF]">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={inputClass}
      />
      {hint && <p className="mt-1.5 text-xs text-[#B3A9D6]">{hint}</p>}
    </div>
  );
}
