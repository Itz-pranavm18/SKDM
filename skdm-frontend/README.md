# Shiv Kumari Mahavidyalaya (SKM) — Website Frontend

A modern, responsive React frontend for **Shiv Kumari Mahavidyalaya**, a degree
college affiliated to Dr. Ram Manohar Lohia Avadh University, Ashapur village,
Raniganj tehsil, Pratapgarh district, UP.

Rebuilt from the college's existing single-page site into a full multi-page,
industry-style college website — with an admissions flow, a faculty directory,
a notice board, a gallery, and a contact form, in addition to the original
Home / About / Courses / Facilities / Founder / Faculty / Contact pages.

## Tech stack

- React 18 + Vite
- React Router v6 (client-side routing)
- Plain CSS with a design-token system (no framework) — see `src/index.css`
- Zero external image dependencies — icons are hand-rolled inline SVG,
  photos are styled placeholder blocks (see "Replacing dummy data" below)

## Getting started

```bash
npm install
npm run dev       # start local dev server (http://localhost:5173)
npm run build      # production build to /dist
npm run preview    # preview the production build locally
```

## Project structure

```
src/
  components/   Header, Footer, PageHero, NoticeTicker, SealBadge, Icons
  data/         collegeData.js — ALL site content lives here
  pages/        Home, About, Courses, Facilities, Founder, Faculty,
                Admissions, Gallery, Notices, Contact, NotFound
  App.jsx       Route definitions
  main.jsx      React entry point
  index.css     Design tokens + all styling
```

## Replacing dummy data

Everything editable lives in **`src/data/collegeData.js`** — a single file,
so there's no hunting through components to update content:

- `college` — name, address, phone, email, affiliation details
- `stats` — homepage stat counters
- `courses` — programme cards (name, duration, eligibility, seats, subjects)
- `facilities` — facility grid (icon name + text)
- `faculty` — staff directory (name, role, department)
- `notices` — notice board + scrolling ticker items
- `feeStructure`, `admissionSteps` — Admissions page content
- `galleryItems`, `testimonials`, `aboutMilestones`, `mission` — supporting content

Lines with `(dummy)` in the source are placeholder figures pulled from
nowhere real — replace with verified college data before going live.

Photos: the design currently renders founder/faculty/campus photography as
styled initials/color blocks so the project runs with zero external image
requests. Drop real photos into `src/assets/` and swap the `.portrait` /
`.gallery-item` / `.faculty-avatar` blocks for `<img>` tags when ready.

## Design notes

- Palette: deep indigo (`--ink`) + brick maroon (`--maroon`) + marigold gold
  (`--marigold`) on a warm paper background — a nod to Indian academic
  convocation colours and the marigold used in local ceremonies.
- Typography: **Fraunces** (display), **Inter** (body), **Noto Serif
  Devanagari** (for the Sanskrit motto), **IBM Plex Mono** (labels/data).
- Signature element: the circular "seal" badge (`SealBadge.jsx`) styled like
  a convocation stamp carrying the founding year — reused in the hero and
  footer for a consistent institutional identity.
