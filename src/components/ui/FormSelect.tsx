import { forwardRef } from 'react'

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  erro?: string
  options: { value: string; label: string }[]
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, erro, options, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--text2)]">{label}</label>
        <select
          ref={ref}
          className={`w-full bg-[var(--bg3)] border rounded-[10px] px-3.5 py-3 text-base text-[var(--text)] outline-none transition-all focus:border-[var(--blue)] ${
            erro ? 'border-[var(--red)]' : 'border-[var(--border2)]'
          }`}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-[var(--bg3)]">
              {opt.label}
            </option>
          ))}
        </select>
        {erro && <span className="text-xs text-[var(--red)]">{erro}</span>}
      </div>
    )
  }
)
FormSelect.displayName = 'FormSelect'
