# Prezentare Beamer — licență ManFast

## Compilare

```powershell
cd Documentatie\prezentare
pdflatex prezentare.tex
pdflatex prezentare.tex
```

Rezultat: `prezentare.pdf` (16 slide-uri).

## Structură slide-uri

| Nr | Conținut |
|----|----------|
| 1 | Titlu, autor, coordonator |
| 2 | Structura prezentării |
| 3 | Problema |
| 4 | Obiective |
| 5 | Soluția ManFast |
| 6 | Arhitectură |
| 7 | Tehnologii |
| 8 | Funcționalități utilizator |
| 9 | Funcționalități administrator |
| 10 | Flux principal |
| 11 | Model de date (ERD) |
| 12 | Rezultate |
| 13 | Demonstrație (live + video opțional) |
| 14 | Concluzii și perspective |
| 15 | Mulțumiri |
| 16 | Bibliografie selectivă |

## Poze de adăugat în `figuri/`

| Fișier | Slide | Ce captură |
|--------|-------|------------|
| `slide_home.png` | 5, 8 | Pagina principală + filtre |
| `slide_admin.png` | 9 | Panou admin / participanți / check-in |
| `slide_payment.png` | 10 | Plată reușită sau formular bilete |
| `slide_demo_placeholder.png` | 13 | Thumbnail pentru video demo |
| `demo_manfast.mp4` | 13 | Video demo (opțional, 1–2 min) |

## Diagrame (deja generate)

Din `Documentatie/diagrame/`:
- `fig_arhitectura.png` — slide 6
- `fig_erd.png` — slide 11

Alternativ pe slide 10: `fig_seq_payment.png`.

Dacă un fișier lipsește, PDF-ul compilează cu placeholder `[Inserează poza: ...]`.
