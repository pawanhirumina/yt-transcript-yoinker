# DESIGN.md — YouTube Transcript Yoinker

This is the single source of truth for design. Any AI or human editing this site MUST follow this.

## Brand
- **Project:** YouTube Transcript Yoinker
- **Vibe:** Minimal, dark, developer-focused, linear.app / vercel-like, premium but lightweight
- **Author:** Pawan Hirumina
- **URL:** https://pawanhirumina.dev/yt-transcript-yoinker/

## Core Principles
1. **Dark only** - No light mode. Everything is #0a0a0a based.
2. **Minimal noise** - Lots of whitespace, thin borders, no shadows, no gradients except for Firefox button.
3. **Monospace for meta** - Use ui-monospace for dates, version tags, small labels, footer.
4. **Rounded but sharp** - Cards 12-14px radius, pills 9999px, buttons 10px.
5. **No external heavy deps** - Keep it vanilla HTML/CSS/JS. <20kb philosophy.

## Color System (CSS Variables)
```css
:root {
  --bg: #0a0a0a;        /* page background */
  --card: #141414;      /* card bg */
  --card2: #171717;     /* second level card / tag bg */
  --border: #232323;    /* primary border */
  --border2: #2a2a2a;   /* secondary / slightly lighter border */
  --text: #EDECE9;      /* primary text - warm white */
  --muted: #9B9B9B;     /* secondary text */
  --muted2: #6B6B6B;    /* tertiary / disabled text */
  --accent: #FF7139;    /* not used heavily, reserved */
  --btn-bg: #f90130;    /* youtube red */
}
```
- **YouTube Red:** `#f90130` - use only for `.youtube` highlight or primary CTAs if needed.
- **Green dot:** `#2ECC71` - for "live/available" status.
- **Firefox Gradient:** `linear-gradient(165deg, #fca632, #f3294e)` - ONLY for .btn-firefox

Never introduce new bright colors. Stick to grayscale + red gradient.

## Typography
- **Sans:** `ui-sans-system, -apple-system, BlinkMacSystemFont, "Inter", "SF Pro Display", Segoe UI, Roboto, Helvetica, Arial, sans-serif`
- **Mono:** `ui-monospace, SFMono-Regular, Menlo, monospace`
- **Smoothing:** `-webkit-font-smoothing: antialiased`
- **H1:** 56px (40px on mobile), font-weight 650, letter-spacing -0.04em, line-height 0.95
- **H1 muted span:** color var(--muted2), weight 450
- **Paragraph / Copy:** 15.5px, line-height 1.65, color var(--muted), letter-spacing -0.01em
- **Small meta:** 11-13px, mono, var(--muted2)
- **Links:** Default white (#fff), no underline unless .youtube class which has underline

## Layout & Spacing
- **Wrap:** `max-width: 760px`, centered, `padding: 0 24px`
- **Top bar:** `display:flex; justify-content:space-between; padding:28px 0 0; font-size:13px`
  - left: .top-left with dot + text, color muted2
  - right: .top-right mono 12px muted2
- **Hero:** `padding:96px 0 48px` (56px top on mobile), centered, text-align center. On 404 page it's full `100vh`.
- **Section divider:** `height:1px; background:var(--border); margin:56px 0 24px`
- **Footer:** flex space-between, mono 11px muted2, 16px 0 32px padding. Stacks vertical on mobile.

## Scrollbar (Always include)
```css
* { scrollbar-width: thin; scrollbar-color: hsl(0 0% 85%) transparent; }
*::-webkit-scrollbar { width:4px; height:4px; }
*::-webkit-scrollbar-thumb { background: hsl(0 0% 85%); border-radius: 999px; }
```
- Sidebar variant: `.sidebar-scroll` hides scrollbar until hover.

## Components

### 1. Top Status
```html
<div class="top">
  <div class="top-left"><span class="dot"></span> Available on Firefox</div>
  <div class="top-right">v2.5.0 / firefox</div>
</div>
```

### 2. Badge (Pill)
- Border 1px solid var(--border2), bg var(--card), radius 999px, padding 6px 12px, font 12.5px mono, color muted
- `<b>` inside is color var(--text), weight 500

### 3. YouTube Highlight
```css
.hero .youtube { background:#f90130; padding:3px; border-radius:10px; cursor:pointer; text-decoration:underline; }
```

### 4. Buttons
Base: `border-radius:10px; padding:8px 14px; font-size:14px; font-weight:600; letter-spacing:-0.02em; display:inline-flex; gap:10px; transition:transform .12s,opacity .12s`
Hover: `transform:translateY(-1px); opacity:.95`

- **btn-firefox:** `background:linear-gradient(165deg,#fca632,#f3294e); color:#fff; border:none;`
- **btn-github:** `background:var(--card); border:1px solid var(--border2); color:#fff;` hover -> border var(--text)
- **btn-back:** `width:100%; background:var(--card); border:1px solid var(--border2);` hover bg var(--card2)

CTA Layout:
```html
<div class="cta-row"><div class="cta-stack"><div class="cta-top">[firefox][github]</div>[back]</div></div>
```
- cta-row: flex column centered, gap 16px, margin-top 32px
- cta-stack: flex column gap 12px width fit-content margin auto
- cta-top: flex gap 12px

### 5. Mock/Video Wrap
- `.mock-wrap`: margin-top 40px, border 1px solid var(--border), radius 14px, bg var(--card), overflow hidden, max-width 680px centered
- video inside: width 100%, max-height 380px, object-fit cover

### 6. Feature Grid (2x3)
- `.grid`: `display:grid; grid-template-columns:1fr 1fr; border:1px solid var(--border); border-radius:12px; overflow:hidden; margin-top:32px`
- cell div: `padding:14px 16px; font-size:13.5px; border-bottom:1px solid var(--border); border-right:1px solid var(--border); color:var(--muted); display:flex; gap:10px`
- Right edge: nth-child(2n) border-right none
- Bottom edge: nth-last-child(-n+2) border-bottom none
- Inside: `span` = var(--text) weight 500, `em` = mono 12px muted2 margin-left auto
- Mobile: 1 column, adjust borders

### 7. Versions List
- Container `.versions`: border 1px solid var(--border), radius 12px, bg var(--card), margin-bottom 24px, overflow hidden
- Head `.versions-head`: padding 16px 18px flex space-between border-bottom 1px solid var(--border) - h2 15px weight 600, span mono 11px muted2
- Row `.version-row`: `display:grid; grid-template-columns:78px 92px 1fr auto; gap:12px; padding:12px 18px; border-top:1px solid var(--border); align-items:center`
- First row no border-top
- `.v-tag`: mono 11px weight 700, bg var(--card2), border 1px solid var(--border2), padding 3px 8px, radius 9999px width fit-content
- `.v-date`: mono 11px muted2
- `.v-notes`: 12.5px muted, ellipsis nowrap (normal wrap on mobile)
- `.v-actions`: flex gap 6px - links 11px weight 600 padding 5px 9px radius 6px border 1px solid var(--border2)
  - `.v-firefox`: bg #fff color #000 border #fff
  - `.v-github`: transparent color muted, hover color text border text
- Mobile row: `grid-template-columns:1fr 1fr` and notes/actions span full width

### 8. Contribute Box
- `.contribute-dark`: margin-top 16px bg #151515 border 1px solid var(--border2) radius 8px padding 14px 16px flex space-between gap 16px
- p inside: margin 0 font 12.5px muted italic line 1.4
- button `.contribute-btn-dark`: bg #262626 color #fff border 1px solid #333 radius 6px padding 7px 12px font 12.5px weight 600 inline-flex gap 6px white-space nowrap

## Iconography
- Font Awesome 7.3.1 CDN - use `fa-brands fa-firefox-browser`, `fa-brands fa-github`, `fa-solid fa-arrow-left`
- Icons should be 14px range, gap 6-10px from text

## Responsive Rules
- Breakpoint: `@media(max-width:600px)`
- H1: 40px
- Grid: 1 column
- Version row: 1fr 1fr
- Hero padding-top 56px
- Footer flex-direction column align flex-start

## Forbidden / Do NOT
- Do NOT add light backgrounds, shadows, or colorful gradients (except firefox button)
- Do NOT use pure black borders (#000) - use var(--border) #232323
- Do NOT use large font sizes for body copy >16px
- Do NOT center everything - only hero is centered
- Do NOT use rounded 2xl or heavy blur effects
- Do NOT add animations beyond translateY(-1px) hover

## Boilerplate for New Pages
Always include: <meta viewport>, :root variables, scrollbar styles, .wrap max 760px, .top bar, footer with GitHub Repo | Get Addon | Report | Support links, mono footer style.

## JS Style
- Vanilla only
- Use `fetch('./versions.json?v=' + Date.now())` to avoid 304 caching
- Always guard `getElementById` with null check
- Wrap load in DOMContentLoaded check

## Assets
- favicon: ./src/favicon.ico
- og-image: ./og-image.png
- og:image content: ./og-image.png (relative)

