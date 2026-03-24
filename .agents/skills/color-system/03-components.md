# Color System — Component Usage
**NetDaftar ERP · Slate + Blue · Production v1.0**

## How to Use This File

Every component section below gives the exact token recipe. When building a component, follow the recipe precisely. Do not deviate toward raw hex values.

---

## Buttons

### Primary button
```
background:   var(--accent)          /* #2563EB */
color:        var(--text-inverse)    /* #FFFFFF */
border:       none
border-radius: var(--radius-md)      /* 6px */

hover   → background: var(--accent-hover)   /* #1D4ED8 */
active  → background: var(--accent-active)  /* #1E40AF */
```

### Secondary button (ghost with accent fill)
```
background:   var(--accent-subtle)        /* #EFF6FF */
color:        var(--blue-800)             /* #1E40AF */
border:       0.5px solid var(--accent-subtle-border)  /* #BFDBFE */
border-radius: var(--radius-md)

hover   → background: var(--blue-100)    /* #DBEAFE */
```

### Outline button
```
background:   transparent
color:        var(--accent)              /* #2563EB */
border:       0.5px solid var(--accent)
border-radius: var(--radius-md)

hover   → background: var(--accent-subtle)
```

### Ghost / neutral button
```
background:   var(--bg-subtle)           /* #F1F5F9 */
color:        var(--text-secondary)      /* #475569 */
border:       0.5px solid var(--border)  /* #E2E8F0 */
border-radius: var(--radius-md)

hover   → border-color: var(--border-strong)
```

### Danger button
```
background:   var(--danger-bg)           /* #FFF1F2 */
color:        var(--danger-text)         /* #E11D48 */
border:       0.5px solid var(--danger-border)  /* #FFE4E6 */
border-radius: var(--radius-md)

hover   → background: var(--danger-border)
```

### Dark / high-emphasis button
```
background:   var(--slate-900)           /* #0F172A */
color:        var(--text-inverse)        /* #FFFFFF */
border:       none
border-radius: var(--radius-md)

hover   → background: var(--slate-800)
```

---

## Form Inputs

### Text input — default state
```
background:    var(--bg-surface)         /* #FFFFFF */
color:         var(--text-primary)       /* #0F172A */
border:        0.5px solid var(--border) /* #E2E8F0 */
border-radius: var(--radius-md)          /* 6px */
placeholder:   var(--text-hint)          /* #94A3B8 */
height:        36px
padding:       7px 10px
```

### Text input — focused state
```
border:        0.5px solid var(--border-accent)  /* #2563EB */
box-shadow:    0 0 0 3px var(--accent-ring)       /* rgba(37,99,235,0.12) */
outline:       none
```

### Text input — error state
```
border:        0.5px solid var(--border-danger)   /* #E11D48 */
box-shadow:    0 0 0 3px rgba(225, 29, 72, 0.10)
```

### Text input — success/valid state
```
border:        0.5px solid var(--border-success)  /* #16A34A */
```

### Text input — disabled state
```
background:    var(--bg-subtle)          /* #F1F5F9 */
color:         var(--text-hint)          /* #94A3B8 */
border:        0.5px solid var(--border)
cursor:        not-allowed
```

### Form label
```
font-size:     11px
font-weight:   500
color:         var(--text-secondary)     /* #475569 */
margin-bottom: 4px
letter-spacing: 0.02em
```

### Helper / hint text (below input)
```
font-size:     11px
color:         var(--text-muted)         /* #64748B */
margin-top:    4px
```

### Error message text (below input)
```
font-size:     11px
color:         var(--danger-text)        /* #E11D48 */
margin-top:    4px
```

---

## Status Badges / Pills

All badges follow the same structure: `background` + `border` + `text` + optional leading dot.

### Active / Paid / Connected
```
background:    var(--success-bg)         /* #F0FDF4 */
border:        0.5px solid var(--success-border)  /* #DCFCE7 */
color:         var(--success-text)       /* #16A34A */
dot:           var(--success-bold)       /* #14532D */
border-radius: var(--radius-pill)
padding:       2px 8px
font-size:     11px
font-weight:   500
```

### Pending / Partial / Due Soon
```
background:    var(--warning-bg)         /* #FFFBEB */
border:        0.5px solid var(--warning-border)  /* #FEF3C7 */
color:         var(--warning-text)       /* #D97706 */
dot:           var(--warning-bold)       /* #78350F */
```

### Overdue / Error / Suspended / Disconnected
```
background:    var(--danger-bg)          /* #FFF1F2 */
border:        0.5px solid var(--danger-border)   /* #FFE4E6 */
color:         var(--danger-text)        /* #E11D48 */
dot:           var(--danger-bold)        /* #881337 */
```

### Trial / Info / New
```
background:    var(--blue-100)           /* #DBEAFE */
border:        0.5px solid var(--blue-200)  /* #BFDBFE */
color:         var(--blue-900)           /* #1E3A8A */
dot:           var(--blue-600)           /* #2563EB */
```

### Archived / Inactive / Disabled
```
background:    var(--bg-subtle)          /* #F1F5F9 */
border:        0.5px solid var(--border)
color:         var(--text-muted)         /* #64748B */
dot:           var(--text-hint)          /* #94A3B8 */
```

### Premium / Special / Dark pill
```
background:    var(--slate-900)          /* #0F172A */
color:         #F1F5F9
dot:           var(--blue-400)           /* #60A5FA */
```

---

## Cards & Panels

### Standard surface card
```
background:    var(--bg-surface)         /* #FFFFFF */
border:        0.5px solid var(--border) /* #E2E8F0 */
border-radius: var(--radius-lg)          /* 10px */
padding:       16px 20px
```

### Subtle / inset card (within a card)
```
background:    var(--bg-subtle)          /* #F1F5F9 */
border:        0.5px solid var(--border)
border-radius: var(--radius-md)          /* 6px */
padding:       10px 12px
```

### KPI metric card
```
background:    var(--bg-surface)         /* #FFFFFF */
border:        0.5px solid var(--border)
border-radius: var(--radius-lg)
padding:       10px 14px

  value text:  var(--text-primary) / 18px / weight 500
  label text:  var(--text-muted)   / 11px / weight 400
  delta (+):   var(--success-text)  #16A34A / 11px
  delta (-):   var(--danger-text)   #E11D48 / 11px
```

### Accent KPI card (highlighted metric)
```
/* Same as KPI card, but value uses the accent color */
  value text:  var(--blue-800)    /* #1E40AF */
```

---

## Data Tables

### Table header row
```
background:    var(--bg-subtle)          /* #F1F5F9 */
border-bottom: 0.5px solid var(--border)
th color:      var(--text-muted)         /* #64748B */
font-size:     11px
font-weight:   500
padding:       6px 12px
text-transform: uppercase
letter-spacing: 0.06em
```

### Table body rows
```
background:    var(--bg-surface)         /* #FFFFFF */
border-bottom: 0.5px solid var(--bg-subtle)  /* very subtle #F1F5F9 */
td color:      var(--text-primary)       /* #0F172A */
font-size:     13px
padding:       8px 12px

hover row → background: var(--blue-50)  /* #EFF6FF — subtle blue tint */
```

### Table numeric/amount columns
```
color:         var(--text-primary)       /* #0F172A */
font-variant-numeric: tabular-nums
text-align:    right
```

### Table muted/secondary columns (e.g. package name, zone)
```
color:         var(--text-muted)         /* #64748B */
```

---

## Navigation Sidebar

### Sidebar container
```
background:    var(--sidebar-bg)         /* #020617 */
width:         220px (recommended)
padding:       14px 10px
```

### Logo / app name
```
color:         #F1F5F9
font-size:     13px
font-weight:   500
border-bottom: 0.5px solid var(--sidebar-border)  /* rgba(255,255,255,0.07) */
margin-bottom: 12px
padding-bottom: 12px

accent word in logo → color: var(--blue-400)  /* #60A5FA */
```

### Section group label
```
color:         var(--sidebar-section-label)  /* #475569 */
font-size:     10px
font-weight:   500
letter-spacing: 0.08em
text-transform: uppercase
padding:       10px 9px 4px
```

### Nav item — inactive
```
color:         var(--sidebar-text)       /* #94A3B8 */
background:    transparent
border-radius: var(--radius-md)
padding:       6px 9px
font-size:     12px
```

### Nav item — active
```
color:         var(--sidebar-text-active)     /* #93C5FD */
background:    var(--sidebar-item-active-bg)  /* rgba(37,99,235,0.14) */
```

### Nav item — hover (inactive)
```
background:    rgba(255,255,255,0.04)
color:         #CBD5E1
```

### Notification badge on nav item
```
background:    var(--sidebar-badge-bg)   /* #1D4ED8 */
color:         var(--sidebar-badge-text) /* #DBEAFE */
font-size:     10px
border-radius: var(--radius-pill)
padding:       1px 6px
```

---

## Avatars / Initials

Pair each avatar's background to the row's status or a consistent per-entity color using the blue scale for neutrals:

### Default / neutral avatar
```
background:    var(--blue-100)           /* #DBEAFE */
color:         var(--blue-800)           /* #1E40AF */
```

### Warning-state avatar (e.g. pending customer)
```
background:    var(--warning-border)     /* #FEF3C7 */
color:         var(--warning-bold)       /* #78350F */
```

### Danger-state avatar (e.g. overdue customer)
```
background:    var(--danger-border)      /* #FFE4E6 */
color:         var(--danger-bold)        /* #881337 */
```

---

## Charts (Single-Color Scale Strategy)

Never use multiple accent colors in charts. Use the Blue scale stops as a sequential ramp — lighter for older/lower values, darker for current/higher values.

### Bar chart — sequential ramp
```
Oldest / lowest:  --blue-200  #BFDBFE
                  --blue-300  #93C5FD
                  --blue-400  #60A5FA
                  --blue-500  #3B82F6
                  --blue-600  #2563EB
Current / highest: --blue-700  #1D4ED8
```

### Chart axis / grid lines
```
color:         var(--border)             /* #E2E8F0 */
```

### Chart labels / axis text
```
color:         var(--text-muted)         /* #64748B */
font-size:     11px
```

### Chart tooltip
```
background:    var(--slate-900)          /* #0F172A */
color:         #F8FAFC
border-radius: var(--radius-md)
padding:       6px 10px
font-size:     12px
```

---

## Alert Banners

### Info alert
```
background:    var(--accent-subtle)      /* #EFF6FF */
border-left:   3px solid var(--accent)   /* #2563EB */
border-radius: 0  (no rounding on single-sided border)
color:         var(--blue-900)           /* #1E3A8A */
```

### Success alert
```
background:    var(--success-bg)         /* #F0FDF4 */
border-left:   3px solid var(--success-text)  /* #16A34A */
color:         var(--success-bold)       /* #14532D */
```

### Warning alert
```
background:    var(--warning-bg)         /* #FFFBEB */
border-left:   3px solid var(--warning-text)  /* #D97706 */
color:         var(--warning-bold)       /* #78350F */
```

### Danger alert
```
background:    var(--danger-bg)          /* #FFF1F2 */
border-left:   3px solid var(--danger-text)   /* #E11D48 */
color:         var(--danger-bold)        /* #881337 */
```

---

## Skeleton / Loading States

```
background:    var(--bg-subtle)          /* #F1F5F9 */
animation:     shimmer left-to-right
shimmer color: var(--border)             /* #E2E8F0 */
border-radius: var(--radius-md)
```

---

## Empty States

```
icon color:    var(--text-hint)          /* #94A3B8 */
heading color: var(--text-primary)       /* #0F172A */
body color:    var(--text-muted)         /* #64748B */
CTA button:    primary button recipe
```
