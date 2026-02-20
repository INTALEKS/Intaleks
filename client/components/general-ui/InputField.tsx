import { Eye, EyeOff } from "lucide-react";
import { ComponentType, ChangeEvent, useState } from "react";

interface InputFieldInterface {
  placeholder?: string;
  label?: string;
  type?: string;
  hasIcon?: true;
  Icon?: ComponentType<{ className?: string }>;
  error?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function InputField({ label, type = "text", hasIcon, Icon, placeholder = "Placeholder", error, onChange }: InputFieldInterface) {
  const [showPassword, setShowPassword] = useState(false);
  const labelLowercase = label?.toLowerCase();

  function handleButtonIcon() {
    if (type === "password") {
      setShowPassword((prev) => !prev);
    }
  }

  return (
    <div className="flex flex-col gap-y-1.5">
      {label && (
        <label htmlFor={labelLowercase} className="text-[14px] text-(--text-primary-dark) font-light">
          {label}
        </label>
      )}

      <div className={`flex items-center gap-x-2 bg-(--light-bg) border rounded-md py-1.5 px-2 transition-colors duration-300 focus-within:border-(--primary-border-typing) ${Icon ? "border-(--primary-border-typing)" : error ? "border-(--primary-border-error)" : "border-(--primary-border)"}`}>
        <input type={showPassword ? "text" : type} id={labelLowercase} name={labelLowercase} placeholder={placeholder} className="px-2 py-1.5 flex-1 bg-transparent outline-none text-(--text-primary-dark) placeholder:text-(--placeholder-text) text-[14px]" onChange={onChange} />
        {hasIcon && type === "password" && (
          <button type="button" className="cursor-pointer text-(--text-primary-dark)" onClick={handleButtonIcon}>
            {showPassword ? <Eye /> : <EyeOff />}
          </button>
        )}
      </div>
    </div>
  );
}
