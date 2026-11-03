---
name: unslop
license: CC-BY-4.0
metadata:
  author: Damir Sokolovsky
  source: https://github.com/heydamir/unslop
description: >-
  Audits and transforms vibecoded, generic AI-looking user interfaces into deliberate,
  polished, product-specific designs. Evaluates and refines spacing, color, icons, copy,
  type, layout, details, visuals, and motion in a strict 9-pass sequence. Use when auditing,
  critiquing, polishing, or redesigning web interfaces to eliminate AI clichés (random
  purple gradients, neon glows, emoji labels, cluttered cards, mismatched typography) while
  preserving the core product identity and functional requirements.
---

# Unslop: Interface Design Quality & De-Vibecoding Skill

Adapted from [heydamir/unslop](https://github.com/heydamir/unslop) (by Damir Sokolovsky, licensed under CC BY 4.0) for Google Antigravity.

## Core Philosophy

AI-generated interfaces fail in predictable ways: every surface glows, every label features an emoji, spacing is random, cards are nested inside cards, and copy is oversold. 

* **The Chrome vs. Content Rule**: Slop spreads color and effects all over the chrome (backgrounds, buttons, borders, labels). Craft keeps the chrome quiet, neutral, and crisp, and channels richness into one or two memorable moments of content (a real rendered product card, a clear data chart, or authentic imagery).
* **Deliberate Craft**: Every size, color, word, border, and spacing unit must be deliberate.
* **Preserve Structure & Function**: Unslopping fixes the craft without altering existing business logic, database operations, routing, or functional workflows.

---

## The 9 Sequential Passes

When auditing or refining an interface, evaluate issues in this exact order:

### 1. Spacing
- Establish an intentional rhythm based on a strict 4px/8px scale (4, 8, 12, 16, 20, 24, 32, 40, 48, 64px).
- Eliminate uniform or bloated padding that creates empty, floating cards.
- Ensure consistent outer container padding and responsive gutters.

### 2. Color
- Purge AI tropes: saturated purple/cyan mesh gradients, glowing neon borders, muddy glassmorphism.
- Enforce clear semantic hierarchy: clean neutral backgrounds (`#FFFFFF`, `#F8FAFC`), crisp dark text (`#0F172A`), muted secondary text (`#64748B`), and a deliberate brand primary color.
- Reserve accent colors strictly for status (Success: Green, Warning: Amber, Error: Red) and primary interactive affordances.

### 3. Icons
- Replace emoji-as-icons with a unified, professional SVG icon set (e.g., Lucide React).
- Enforce consistent icon size (14px, 16px, 18px, 20px) and stroke weight (1.5px / 2px).
- Ensure optical vertical centering with adjacent text.

### 4. Copy
- Audit copy *before* typography because word counts dictate visual layouts.
- Remove AI buzzwords, hyperbolic titles, and repetitive helper descriptions.
- Ensure realistic, domain-specific, concise, and confident terminology.

### 5. Type
- Establish a strict modular typographic scale (Display, H1, H2, H3, Body, Small, Caption).
- Ensure line heights are proportional (headings: 1.1–1.25; body: 1.45–1.6).
- Audit text-background contrast ratios against WCAG AA standards (4.5:1 for body, 3:1 for large text).
- Eliminate random uppercase letter-spacing on regular headings.

### 6. Layout
- Break away from the generic centered-hero-plus-three-cards AI template.
- Establish clear visual hierarchy with primary focal points and secondary supporting panels.
- Ensure responsive layouts stack naturally without horizontal overflow or clipped content.

### 7. Details
- Standardize border-radii across the application (e.g., 8px for controls, 12px for cards, 16px for modals).
- Replace heavy black drop-shadows with soft ambient lighting (`0 1px 3px rgba(0,0,0,0.05), 0 10px 15px -3px rgba(0,0,0,0.03)`).
- Ensure visible focus rings and accessible hover feedback.

### 8. Visuals
- Replace abstract glowing blobs and generic placeholders with authentic product assets, contextual photography, and clean data charts.
- Enforce consistent aspect ratios and `object-fit: cover` with proper error fallbacks.

### 9. Motion
- Eliminate distracting continuous loops, spinning icons, or pulsing borders.
- Ensure animations are functional and purposeful (150ms–250ms ease-out transitions for interactive feedback, modals, and drawers).
- Respect `prefers-reduced-motion` settings.

