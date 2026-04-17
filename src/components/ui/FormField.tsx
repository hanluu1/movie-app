interface FormFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  hint?: string;
}

const inputClass = "w-full px-4 py-[0.875rem] border-2 border-stone-200 rounded-xl text-[0.95rem] transition-all duration-300 focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10 placeholder:text-stone-400 bg-white";

export default function FormField ({ label, type = 'text', placeholder, value, onChange, required, hint }: FormFieldProps) {
  return (
    <div>
      <label className="block font-semibold text-[0.9rem] mb-2 text-stone-900">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={inputClass}
      />
      {hint && <p className="text-[0.8rem] text-stone-500 mt-2">{hint}</p>}
    </div>
  );
}
