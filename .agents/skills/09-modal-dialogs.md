# Skill 09 — Modal Dialogs
**NetDaftar ERP · React + Tailwind · Slate + Blue**

## Audit: What Is Wrong Right Now

Looking at the "Add New Employee" modal:

| Element | Problem | Fix |
|---------|---------|-----|
| Modal header background | Teal-to-white gradient — vibe-coded, off-brand | Solid `bg-white` header, `border-b border-slate-200` only |
| Modal header title | Large, white text on gradient | `text-[15px] font-medium text-slate-900` on white bg |
| No sticky footer | Footer with Save/Cancel scrolls away | Sticky footer, always visible |
| No size variants | One modal size for everything | sm (400px) / md (560px) / lg (720px) |
| No scroll handling | Long forms clip at viewport | Modal body scrolls, header + footer stay fixed |

---

## Modal Shell Component

```jsx
import { useEffect } from 'react'

function Modal({
  open,
  onClose,
  title,
  subtitle,
  size = 'md',    // 'sm' | 'md' | 'lg'
  children,
  footer,
}) {
  // Lock body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!open) return null

  const widths = { sm: 'max-w-[400px]', md: 'max-w-[560px]', lg: 'max-w-[720px]' }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15, 23, 42, 0.50)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Modal panel */}
      <div className={`
        relative w-full ${widths[size]}
        bg-white rounded-xl border border-slate-200
        flex flex-col
        max-h-[calc(100vh-2rem)] overflow-hidden
      `}>

        {/* Header — solid white, NO gradient */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-200 flex-shrink-0">
          <div>
            <h2 className="text-[15px] font-medium text-slate-900">{title}</h2>
            {subtitle && (
              <p className="text-[12px] text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100
                       rounded-md transition-colors duration-150 ml-4 flex-shrink-0"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Footer — sticky, always visible */}
        {footer && (
          <div className="flex items-center justify-end gap-2 px-6 py-4
                          border-t border-slate-200 bg-slate-50 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## Modal Usage — Add New Employee

```jsx
<Modal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Add new employee"
  subtitle="Fill in the details below to create an employee record"
  size="lg"
  footer={
    <>
      <button
        onClick={() => setIsOpen(false)}
        className="px-4 py-2 text-[13px] text-slate-600 border border-slate-200
                   rounded-md hover:border-slate-300 hover:bg-slate-50
                   transition-colors duration-150"
      >
        Cancel
      </button>
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium
                   text-white bg-blue-600 rounded-md hover:bg-blue-700
                   disabled:opacity-60 transition-colors duration-150"
      >
        {isSubmitting && <Spinner />}
        {isSubmitting ? 'Saving...' : 'Save employee'}
      </button>
    </>
  }
>
  <EmployeeForm />
</Modal>
```

---

## Confirmation / Danger Modal (Delete)

For delete confirmations — keep it compact (`size="sm"`):

```jsx
<Modal
  open={deleteOpen}
  onClose={() => setDeleteOpen(false)}
  title="Delete employee"
  size="sm"
  footer={
    <>
      <button onClick={() => setDeleteOpen(false)}
              className="px-4 py-2 text-[13px] text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50">
        Cancel
      </button>
      <button onClick={handleDelete}
              className="px-4 py-2 text-[13px] font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700">
        Delete
      </button>
    </>
  }
>
  <div className="flex gap-3">
    <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0 mt-0.5">
      <ExclamationTriangleIcon className="w-4.5 h-4.5 text-rose-500" />
    </div>
    <div>
      <p className="text-[13px] font-medium text-slate-800 mb-1">
        Delete Muhammad Hammad Shakeel?
      </p>
      <p className="text-[12px] text-slate-500 leading-relaxed">
        This action cannot be undone. The employee record and all associated
        data will be permanently removed.
      </p>
    </div>
  </div>
</Modal>
```

---

## View / Detail Modal (Read-only)

```jsx
<Modal open={viewOpen} onClose={() => setViewOpen(false)} title="Employee profile" size="md">
  <div className="space-y-4">
    {/* Avatar + name header */}
    <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
        <span className="text-[13px] font-medium text-blue-800">MH</span>
      </div>
      <div>
        <p className="text-[14px] font-medium text-slate-900">Muhammad Hammad Shakeel</p>
        <p className="text-[12px] text-slate-400">Technician · hammad</p>
      </div>
    </div>

    {/* Detail grid */}
    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
      <DetailRow label="Contact"    value="03076346850" />
      <DetailRow label="CNIC"       value="3630214662725" />
      <DetailRow label="Salary"     value="PKR 21,000" />
      <DetailRow label="Balance"    value="PKR 21,000" />
      <DetailRow label="Status"     value={<StatusBadge status="active" />} />
      <DetailRow label="Joined"     value="Jan 15, 2024" />
    </div>
  </div>
</Modal>

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.06em] mb-0.5">{label}</p>
      <p className="text-[13px] text-slate-800">{value}</p>
    </div>
  )
}
```

---

## Modal Critical Rules

1. **Modal header is always `bg-white` with `border-b border-slate-200`. Absolutely no gradients.**
2. **`border-radius: 12px` (`rounded-xl`) on the panel.** Not `rounded-2xl` (too large) or `rounded-lg` (too small for a modal).
3. **Close button: `p-1` icon button, `text-slate-400 hover:text-slate-600`**, top-right corner.
4. **Body scrolls, header and footer are `flex-shrink-0`.** Never let the header or footer scroll away.
5. **Footer background: `bg-slate-50` with `border-t border-slate-200`.** Creates visual separation from the form content.
6. **Footer buttons: Cancel (ghost) on left, primary action (blue-600) on right.**
7. **Danger actions use `bg-rose-600` in the footer**, not `bg-blue-600`.
8. **Backdrop: `rgba(15, 23, 42, 0.50)` — slate-900 at 50%.** Never pure black. Never `backdrop-blur` — adds perceived complexity.
9. **Click-outside to close** — always implemented.
10. **Escape key to close** — always implemented.
11. **Body scroll lock when modal is open** — always implemented.
