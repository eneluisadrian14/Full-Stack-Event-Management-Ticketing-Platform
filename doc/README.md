# Licență Word — Aplicație web pentru organizarea și gestionarea evenimentelor

**Autor:** Ene Luis Adrian  
**Coordonator:** Lect. univ. dr. Rusu Andrei

## Generare document

```powershell
cd D:\Facultate\LucrareaDeLicenta\doc
py -m pip install python-docx
py generate_licenta_word.py
```

Rezultat: **`LICENTA.docx`** (~55 pagini, verificat)

## Cuprins

Documentul include: pagină titlu Ovidius, Rezumat, Abstract, Cuprins (actualizați cu F9 în Word dacă e nevoie), capitole 1–5, bibliografie.

Conținutul **exclude** cerințe nefuncționale, limitări și defecte ale aplicației. Concluziile conțin „Perspective de extindere” formulate pozitiv.

## Figuri

Pune capturi/diagrame în `doc/figuri/` (ex. `fig_home.png`). Dacă lipsește un fișier, se inserează automat un spațiu placeholder.

## Date personale

Modifică `metadata.json` dacă e nevoie.
