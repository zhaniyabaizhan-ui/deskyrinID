import { useId, useRef } from 'react'
import type { DocumentAttachment } from '@/types/application'

type Props = {
  label: string
  required?: boolean
  value: DocumentAttachment
  onChange: (v: DocumentAttachment) => void
  /** e.g. ".pdf,image/*" */
  accept?: string
  demoFileName?: string
}

export function DualPathDocumentSlot({
  label,
  required,
  value,
  onChange,
  accept = '.pdf,.png,.jpg,.jpeg,image/*,application/pdf',
  demoFileName = 'demo_document.pdf',
}: Props) {
  const inputId = useId()
  const fileRef = useRef<HTMLInputElement>(null)

  const badge = !value.attached ? (
    <span className="text-xs text-slate-400">Not attached</span>
  ) : value.source === 'uploaded' ? (
    <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-900">
      From device
    </span>
  ) : (
    <span className="rounded-full bg-lime-100 px-2 py-0.5 text-xs font-medium text-lime-900">
      Demo file
    </span>
  )

  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium text-slate-800" id={inputId + '-lab'}>
          {label}
          {required ? <span className="text-red-500"> *</span> : null}
        </span>
        {badge}
      </div>
      {value.attached && value.fileName ? (
        <p className="mt-2 font-mono text-xs text-slate-600">{value.fileName}</p>
      ) : null}
      <p className="mt-2 text-xs text-slate-500">
        Files are not sent to a server in this MVP — only the file name is stored for review
        display.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <input
          ref={fileRef}
          type="file"
          className="sr-only"
          accept={accept}
          aria-labelledby={inputId + '-lab'}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              onChange({
                attached: true,
                fileName: file.name,
                source: 'uploaded',
              })
            }
            e.target.value = ''
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50"
        >
          Upload file
        </button>
        <button
          type="button"
          onClick={() =>
            onChange({
              attached: true,
              fileName: demoFileName,
              source: 'demo',
            })
          }
          className="rounded-lg bg-lime-400 px-3 py-1.5 text-sm font-semibold text-lime-950 shadow-sm hover:bg-lime-300"
        >
          Use demo file
        </button>
        {value.attached ? (
          <button
            type="button"
            onClick={() => onChange({ attached: false })}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            Remove
          </button>
        ) : null}
      </div>
    </div>
  )
}
