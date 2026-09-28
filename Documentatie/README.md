# Documentație licență ManFast

## Fișiere generate

| Fișier | Descriere |
|--------|-----------|
| `LICENTA_ManFast.docx` | Document Word final |
| `metadata.json` | Date pagină titlu (autor, coordonator, titlu) |
| `diagrame/` | Diagrame PNG (arhitectură, ERD, UML) |
| `imagini/` | Capturi UI (mock-uri tematice ManFast) |
| `script/generate_docx.py` | Regenerare document |
| `script/generate_assets.py` | Regenerare diagrame și capturi |

## Înainte de predare

1. **Editează** [`metadata.json`](metadata.json):
   - `autor` — numele tău complet
   - `coordonator_nume` — coordonatorul științific
   - `titlu` — dacă se schimbă

2. **Regenerează documentul:**
   ```powershell
   cd documentatie\script
   py generate_docx.py
   ```

3. **Deschide** `LICENTA_ManFast.docx` în Word și:
   - Inserează **Cuprins** automat: Referințe → Cuprins → Automat
   - Inserează **Lista figurilor**: Referințe → Inserare listă de figuri
   - Verifică diacriticele și numerotarea paginilor (preliminare i, ii… apoi 1, 2, 3…)
   - **Înlocuiește capturile** din `imagini/` cu screenshot-uri reale din aplicație (opțional, recomandat)

4. **Capturi reale:** rulează frontend + backend, fă screenshot la paginile cheie, salvează în `imagini/` cu aceleași nume de fișier, apoi regenerează.

## Structură document (model FMI Ovidius)

1. Motivație
2. Starea actuală a domeniului
3. Soluția propusă
4. Prezentarea aplicației
5. Concluzii
+ Rezumat, Abstract, Referințe bibliografice

## Cerințe Python

```powershell
py -m pip install python-docx matplotlib pillow
```
