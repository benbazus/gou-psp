import { Check } from 'lucide-react'
import clsx from 'clsx'

export interface Step {
  label: string
  description?: string
}

interface Props {
  steps: Step[]
  current: number
}

export function Stepper({ steps, current }: Props) {
  return (
    <div className="flex items-start">
      {steps.map((step, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={i} className="flex items-start flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={clsx(
                'w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors',
                done   && 'border-success bg-success text-white',
                active && 'border-primary bg-primary text-white',
                !done && !active && 'border-border bg-surface text-muted'
              )}>
                {done ? <Check size={14} /> : i + 1}
              </div>
              <div className="text-xs font-medium mt-1.5 text-center w-20 leading-tight">
                <span className={active ? 'text-primary' : done ? 'text-success' : 'text-muted'}>
                  {step.label}
                </span>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className={clsx(
                'flex-1 h-0.5 mt-4 mx-1 transition-colors',
                i < current ? 'bg-success' : 'bg-border'
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}
