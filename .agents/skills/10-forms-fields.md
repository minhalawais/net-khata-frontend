# Skill 10 — Forms & Field Components
**NetDaftar ERP · React + Tailwind · Slate + Blue**

## Audit: What Is Wrong Right Now

Looking at the "Add New Employee" form:

| Element | Problem | Fix |
|---------|---------|-----|
| Section containers | Rounded bordered box wrapping each section — heavy, adds nesting | Lightweight section header line, no outer border |
| Leading icons in inputs | Icons are inside the input field — not in our system's input recipe | Icon prefix pattern with exact sizing/color rules |
| Required asterisk | `*` is raw text after the label, no consistent styling | Styled `<span>` in `text-rose-500`, always inline |
| Textarea | No recipe for it | Full textarea recipe with resize control |
| 2-column form grid | No recipe for within-modal 2-col layout | `grid grid-cols-2 gap-x-4 gap-y-4` pattern |
| Select dropdown | Not shown but will exist | Full select recipe with custom arrow |
| No error messages inline | Validation text missing from current UI | Inline error beneath field |

---

## The Field Component (Base)

All form fields use this exact structure:

```jsx
function Field({
  label,
  required = false,
  error,
  hint,
  children,
  className,
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="flex items-center gap-0.5 text-[11px] font-medium text-slate-600">
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-[11px] text-rose-500 flex items-center gap-1">
          <ExclamationCircleIcon className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-[11px] text-slate-400">{hint}</p>
      )}
    </div>
  )
}
```

---

## Text Input — Variants

### Plain input (no icon)
```jsx
<input
  type="text"
  placeholder="Enter first name"
  className="
    w-full h-9 px-3
    text-[13px] text-slate-900 placeholder:text-slate-400
    bg-white border border-slate-200 rounded-md
    focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12]
    hover:border-slate-300
    transition-colors duration-150
  "
/>
```

### Input with leading icon
```jsx
function InputWithIcon({ icon, error, ...props }) {
  return (
    <div className="relative">
      {/* Icon */}
      <span className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none flex-shrink-0">
        {icon}
      </span>
      <input
        className={`
          w-full h-9 pl-8 pr-3
          text-[13px] text-slate-900 placeholder:text-slate-400
          bg-white border rounded-md
          focus:outline-none focus:ring-2 transition-colors duration-150
          ${error
            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/[0.12]'
            : 'border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-500/[0.12]'
          }
        `}
        {...props}
      />
    </div>
  )
}

{/* Usage */}
<Field label="Contact number" required error={errors.contact}>
  <InputWithIcon
    icon={<PhoneIcon />}
    type="tel"
    placeholder="03XX-XXXXXXX"
  />
</Field>
```

### Input with trailing badge (e.g. units, currency)
```jsx
<div className="relative">
  <input className="w-full h-9 pl-3 pr-14 text-[13px] ..." />
  <span className="absolute right-3 top-1/2 -translate-y-1/2
                   text-[11px] font-medium text-slate-400">
    PKR
  </span>
</div>
```

---

## Select Dropdown

```jsx
function SelectField({ options, error, placeholder, ...props }) {
  return (
    <div className="relative">
      <select
        className={`
          w-full h-9 pl-3 pr-8 appearance-none
          text-[13px] text-slate-900 bg-white border rounded-md
          focus:outline-none focus:ring-2 transition-colors duration-150 cursor-pointer
          ${error
            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/[0.12]'
            : 'border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-500/[0.12]'
          }
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>{placeholder}</option>
        )}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {/* Custom chevron */}
      <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5
                                  text-slate-400 pointer-events-none" />
    </div>
  )
}

{/* Usage */}
<Field label="Role" required>
  <SelectField
    placeholder="Select role..."
    options={[
      { value: 'technician', label: 'Technician' },
      { value: 'employee',   label: 'Employee' },
      { value: 'admin',      label: 'Admin' },
    ]}
  />
</Field>
```

---

## Date Input

```jsx
<Field label="Joining date">
  <div className="relative">
    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5
                             text-slate-400 pointer-events-none" />
    <input
      type="date"
      className="
        w-full h-9 pl-8 pr-3
        text-[13px] text-slate-900
        bg-white border border-slate-200 rounded-md
        focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12]
        hover:border-slate-300 transition-colors duration-150
        [&::-webkit-calendar-picker-indicator]:opacity-0
        [&::-webkit-calendar-picker-indicator]:absolute
        [&::-webkit-calendar-picker-indicator]:inset-0
        [&::-webkit-calendar-picker-indicator]:w-full
        [&::-webkit-calendar-picker-indicator]:cursor-pointer
      "
    />
  </div>
</Field>
```

---

## Textarea

```jsx
<Field label="House address" required>
  <div className="relative">
    <MapPinIcon className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    <textarea
      rows={3}
      placeholder="Complete house address"
      className="
        w-full pl-8 pr-3 py-2
        text-[13px] text-slate-900 placeholder:text-slate-400
        bg-white border border-slate-200 rounded-md
        focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12]
        hover:border-slate-300 transition-colors duration-150
        resize-none
      "
    />
  </div>
</Field>
```

**Rule: Always `resize-none`. Never let users resize the textarea — it breaks the modal layout.**

---

## Password Input (for credentials)

```jsx
function PasswordField({ label, required, error }) {
  const [show, setShow] = useState(false)
  return (
    <Field label={label} required={required} error={error}>
      <div className="relative">
        <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <input
          type={show ? 'text' : 'password'}
          className="w-full h-9 pl-8 pr-9 text-[13px] border border-slate-200 rounded-md
                     focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12]
                     hover:border-slate-300 transition-colors"
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {show ? <EyeSlashIcon className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
        </button>
      </div>
    </Field>
  )
}
```

---

## Form Section Divider

Replaces the current heavy bordered-box section containers. Light, clean, minimal:

```jsx
function FormSection({ icon, title, children }) {
  return (
    <div className="space-y-4">
      {/* Section label */}
      <div className="flex items-center gap-2">
        <span className="w-4 h-4 text-slate-400 flex-shrink-0">{icon}</span>
        <p className="text-[12px] font-medium text-slate-500">{title}</p>
        <div className="flex-1 h-px bg-slate-100" />
      </div>
      {/* Fields */}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}

{/* Usage */}
<div className="space-y-6">
  <FormSection icon={<UserIcon />} title="Personal information">
    <div className="grid grid-cols-2 gap-x-4 gap-y-4">
      <Field label="First name" required><InputWithIcon icon={<UserIcon />} placeholder="First name" /></Field>
      <Field label="Last name"  required><InputWithIcon icon={<UserIcon />} placeholder="Last name" /></Field>
    </div>
    <div className="grid grid-cols-2 gap-x-4 gap-y-4">
      <Field label="Contact number"   required><InputWithIcon icon={<PhoneIcon />} placeholder="03XX-XXXXXXX" /></Field>
      <Field label="Emergency contact" required><InputWithIcon icon={<PhoneIcon />} placeholder="Emergency number" /></Field>
    </div>
    <div className="grid grid-cols-2 gap-x-4 gap-y-4">
      <Field label="CNIC number" required><InputWithIcon icon={<IdentificationIcon />} placeholder="XXXXX-XXXXXXX-X" /></Field>
      <Field label="Joining date"><DateInput /></Field>
    </div>
    <Field label="House address" required><Textarea placeholder="Complete house address" /></Field>
  </FormSection>

  <FormSection icon={<ShieldCheckIcon />} title="Account & employment">
    <div className="grid grid-cols-2 gap-x-4 gap-y-4">
      <Field label="Username" required><InputWithIcon icon={<AtSymbolIcon />} placeholder="username" /></Field>
      <Field label="Email"><InputWithIcon icon={<EnvelopeIcon />} placeholder="email@example.com" /></Field>
    </div>
    <div className="grid grid-cols-2 gap-x-4 gap-y-4">
      <Field label="Role" required><SelectField placeholder="Select role..." options={roles} /></Field>
      <Field label="Salary"><InputWithIcon icon={<BanknotesIcon />} placeholder="21,000" /></Field>
    </div>
    <PasswordField label="Password" required />
  </FormSection>
</div>
```

---

## 2-Column Grid Rules

```jsx
{/* Standard 2-col within modal */}
<div className="grid grid-cols-2 gap-x-4 gap-y-4">
  <Field>...</Field>
  <Field>...</Field>
</div>

{/* Full-width field (spans both cols) */}
<Field className="col-span-2">...</Field>

{/* When one field needs more space */}
<div className="grid grid-cols-3 gap-x-4 gap-y-4">
  <div className="col-span-2"><Field label="Address">...</Field></div>
  <Field label="Zip">...</Field>
</div>
```

---

## Checkbox & Radio

```jsx
{/* Checkbox */}
<label className="flex items-center gap-2 cursor-pointer group">
  <input
    type="checkbox"
    className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600
               focus:ring-2 focus:ring-blue-500/[0.12] cursor-pointer"
  />
  <span className="text-[13px] text-slate-700 group-hover:text-slate-900">Active employee</span>
</label>

{/* Radio group */}
<div className="flex gap-4">
  {['Technician', 'Employee', 'Admin'].map(role => (
    <label key={role} className="flex items-center gap-2 cursor-pointer">
      <input type="radio" name="role" value={role.toLowerCase()}
             className="w-3.5 h-3.5 border-slate-300 text-blue-600
                        focus:ring-2 focus:ring-blue-500/[0.12]" />
      <span className="text-[13px] text-slate-700">{role}</span>
    </label>
  ))}
</div>
```

---

## Form Validation Display

```jsx
{/* React Hook Form + Zod pattern */}
const { register, formState: { errors } } = useForm()

<Field label="Contact number" required error={errors.contact?.message}>
  <InputWithIcon
    icon={<PhoneIcon />}
    placeholder="03XX-XXXXXXX"
    {...register('contact', {
      required: 'Contact number is required',
      pattern: { value: /^03\d{9}$/, message: 'Enter a valid Pakistani number' }
    })}
  />
</Field>
```

---

## Critical Form Rules

1. **No bordered-box section containers.** Use `FormSection` with a light line — `flex-1 h-px bg-slate-100`.
2. **Leading icon size: `w-3.5 h-3.5` (14px), color: `text-slate-400`.** Never `text-blue-600` — that implies interactive.
3. **All inputs are `h-9` (36px).** Textarea is the only exception — use `rows` prop.
4. **Required asterisk: `text-rose-500`** — immediately recognizable, doesn't conflict with accent blue.
5. **Error text: `text-[11px] text-rose-500`** with an `ExclamationCircleIcon` prefix.
6. **`resize-none` on all textareas.**
7. **No `autofocus` on the first field in a modal** — it causes keyboard to jump on mobile.
8. **Form grid is `gap-x-4 gap-y-4`** — 16px both directions. Never different gaps for x and y unless intentional.
9. **Select uses `appearance-none` + custom `ChevronDownIcon`.** Never the browser default arrow.
10. **Date inputs hide the browser calendar icon and use a custom `CalendarIcon` as a leading icon.**
