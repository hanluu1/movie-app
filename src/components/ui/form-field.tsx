interface FormFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  hint?: string;
}

const inputClass = "w-full px-4 py-3 border border-[#3A3530] rounded-xl text-sm transition-all focus:outline-none focus:border-[#C8956A]/60 placeholder:text-[#4A4038] bg-[#272320] text-[#F2EDE4]";

export default function FormField ({ label, type = 'text', placeholder, value, onChange, required, hint }: FormFieldProps) {
  return (
    <div>
      <label className="block font-semibold text-sm mb-2 text-[#C8B8A2]">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={inputClass}
      />
      {hint && <p className="text-xs text-[#4A4038] mt-1.5">{hint}</p>}
    </div>
  );
}