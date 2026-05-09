import { forwardRef } from 'react'

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  erro?: string
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, erro, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--text2)]">{label}</label>
        <input
          ref={ref}
          className={`w-full bg-[var(--bg3)] border rounded-[10px] px-3.5 py-3 text-base text-[var(--text)] placeholder:text-[var(--text3)] outline-none transition-all focus:border-[var(--blue)] ${
            erro ? 'border-[var(--red)]' : 'border-[var(--border2)]'
          }`}
          {...props}
        />
        {erro && <span className="text-xs text-[var(--red)]">{erro}</span>}
      </div>
    )
  }
)
FormInput.displayName = 'FormInput'
