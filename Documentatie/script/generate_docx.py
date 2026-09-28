# -*- coding: utf-8 -*-
"""Asamblează documentația de licență ManFast în format Word."""
from __future__ import annotations

import json
import sys
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

ROOT = Path(__file__).resolve().parents[1]
DIAG = ROOT / "diagrame"
IMG = ROOT / "imagini"
OUT = ROOT / "LICENTA_ManFast.docx"
META = ROOT / "metadata.json"

# Import assets generator if missing
SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))


def load_meta() -> dict:
    with open(META, encoding="utf-8") as f:
        return json.load(f)


def setup_styles(doc: Document) -> None:
    section = doc.sections[0]
    section.page_height = Cm(29.7)
    section.page_width = Cm(21)
    section.top_margin = Cm(1.5)
    section.bottom_margin = Cm(2.5)
    section.left_margin = Cm(3.0)
    section.right_margin = Cm(2.5)

    normal = doc.styles["Normal"]
    normal.font.name = "Times New Roman"
    normal.font.size = Pt(12)
    normal._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")

    for level in range(1, 4):
        h = doc.styles[f"Heading {level}"]
        h.font.name = "Times New Roman"
        h.font.color.rgb = RGBColor(0, 0, 0)
        h.font.bold = True
        if level == 1:
            h.font.size = Pt(16)
        elif level == 2:
            h.font.size = Pt(14)
        else:
            h.font.size = Pt(12)


def add_centered(doc: Document, text: str, size: int = 12, bold: bool = False, space_after: int = 6) -> None:
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run(text)
    run.font.name = "Times New Roman"
    run.font.size = Pt(size)
    run.bold = bold
    p.paragraph_format.space_after = Pt(space_after)


def add_body(doc: Document, text: str, first_indent: bool = True) -> None:
    p = doc.add_paragraph(text)
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.space_after = Pt(6)
    if first_indent:
        p.paragraph_format.first_line_indent = Cm(1.0)
    for run in p.runs:
        run.font.name = "Times New Roman"
        run.font.size = Pt(12)


def add_figure(doc: Document, path: Path, caption: str, width_cm: float = 14.0) -> None:
    if path.exists():
        doc.add_picture(str(path), width=Cm(width_cm))
        last = doc.paragraphs[-1]
        last.alignment = WD_ALIGN_PARAGRAPH.CENTER
    else:
        add_body(doc, f"[Figură indisponibilă: {path.name}]", first_indent=False)
    cap = doc.add_paragraph(caption)
    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cap.paragraph_format.space_after = Pt(12)
    for run in cap.runs:
        run.font.name = "Times New Roman"
        run.font.size = Pt(11)
        run.italic = True


def add_table(doc: Document, headers: list[str], rows: list[list[str]]) -> None:
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.style = "Table Grid"
    hdr = table.rows[0].cells
    for i, h in enumerate(headers):
        hdr[i].text = h
        for p in hdr[i].paragraphs:
            for r in p.runs:
                r.bold = True
                r.font.name = "Times New Roman"
                r.font.size = Pt(10)
    for ri, row in enumerate(rows):
        cells = table.rows[ri + 1].cells
        for ci, val in enumerate(row):
            cells[ci].text = val
            for p in cells[ci].paragraphs:
                for r in p.runs:
                    r.font.name = "Times New Roman"
                    r.font.size = Pt(10)
    doc.add_paragraph()


def cover_page(doc: Document, meta: dict) -> None:
    add_centered(doc, "Ministerul Educației", 12, space_after=4)
    add_centered(doc, "Universitatea „OVIDIUS” Constanța", 12, space_after=4)
    add_centered(doc, f"Facultatea de {meta['facultate']}", 12, space_after=4)
    add_centered(doc, f"Specializarea {meta['specializare']}", 12, space_after=24)
    add_centered(doc, meta["titlu"], 14, bold=True, space_after=36)
    add_centered(doc, f"Lucrare de {meta['tip_lucrare']}", 12, space_after=36)
    add_centered(doc, "Coordonator științific:", 12, space_after=4)
    add_centered(doc, f"{meta['coordonator_grad']} {meta['coordonator_nume']}", 12, space_after=36)
    add_centered(doc, "Absolvent:", 12, space_after=4)
    add_centered(doc, meta["autor"], 12, space_after=48)
    add_centered(doc, meta["oras"], 12, space_after=4)
    add_centered(doc, meta["an"], 12, space_after=0)
    doc.add_page_break()


def rezumat_abstract(doc: Document, meta: dict) -> None:
    doc.add_heading("Rezumat", level=1)
    add_body(
        doc,
        f"Lucrarea de licență {meta['titlu']} propune dezvoltarea unei platforme web "
        "pentru gestionarea evenimentelor sportive și vânzarea biletelor nominale online. "
        "Aplicația ManFast permite utilizatorilor să descopere evenimente filtrate după nume, județ și dată, "
        "să creeze conturi securizate cu verificare email, să achiziționeze bilete prin Stripe Checkout "
        "și să își gestioneze profilul. Administratorii pot publica evenimente cu imagini, "
        "monitoriza participanții și efectua check-in la fața locului.",
    )
    add_body(
        doc,
        "Soluția tehnică folosește arhitectură client-server: frontend React 19 cu Material UI, "
        "backend Node.js/Express, bază de date PostgreSQL, autentificare JWT, criptare bcrypt "
        "și trimitere email prin Brevo SMTP. Documentul prezintă motivația, starea domeniului, "
        "proiectarea și implementarea, precum și capturi din aplicația funcțională.",
    )
    doc.add_page_break()
    doc.add_heading("Abstract", level=1)
    add_body(
        doc,
        f"The bachelor's thesis {meta['titlu']} proposes a web platform for managing sports events "
        "and selling nominal tickets online. The ManFast application allows users to discover events "
        "filtered by name, county and date, create secure accounts with email verification, "
        "purchase tickets via Stripe Checkout and manage their profile. Administrators can publish "
        "events with images, monitor participants and perform on-site check-in.",
        first_indent=False,
    )
    add_body(
        doc,
        "The technical solution uses a client-server architecture: React 19 frontend with Material UI, "
        "Node.js/Express backend, PostgreSQL database, JWT authentication, bcrypt encryption "
        "and email delivery via Brevo SMTP.",
        first_indent=False,
    )
    doc.add_page_break()


def chapter1(doc: Document) -> None:
    doc.add_heading("Capitolul 1", level=1)
    doc.add_heading("Motivație", level=1)

    doc.add_heading("Contextul și problema", level=2)
    add_body(
        doc,
        "Organizarea evenimentelor sportive și a competițiilor implică, în mod tradițional, "
        "procese manuale de promovare, vânzare de bilete și validare a participanților. "
        "Distribuirea informațiilor despre evenimente, gestionarea locurilor disponibile și "
        "colectarea plăților reprezintă provocări frecvente pentru organizatori, "
        "mai ales atunci când resursele sunt limitate.",
    )
    add_body(
        doc,
        "Digitalizarea acestor procese poate reduce erorile umane, crește transparența "
        "și oferă participanților o experiență unitară: de la descoperirea evenimentului "
        "până la achiziția biletului și prezența la competiție. Platformele web moderne "
        "permit centralizarea datelor, filtrarea evenimentelor după locație și dată, "
        "precum și integrarea plăților online securizate.",
    )

    doc.add_heading("Obiectivele lucrării", level=2)
    add_body(doc, "Obiectivul principal al acestei lucrări este proiectarea și implementarea unei aplicații web complete — ManFast — care să acopere următoarele cerințe:")
    objectives = [
        "autentificare și înregistrare securizată a utilizatorilor, cu verificare email;",
        "vizualizarea și filtrarea evenimentelor (nume, județ, dată);",
        "vânzarea biletelor nominale cu plată online prin Stripe;",
        "panou de administrare pentru CRUD evenimente, check-in participanți și gestionare admini;",
        "gestionarea profilului utilizatorului, inclusiv resetare parolă și ștergere cont.",
    ]
    for obj in objectives:
        p = doc.add_paragraph(obj, style="List Bullet")
        p.paragraph_format.left_indent = Cm(1.0)

    doc.add_heading("Structura documentului", level=2)
    add_body(
        doc,
        "Capitolul 2 prezintă starea actuală a domeniului: studii relevante, platforme existente "
        "și o analiză comparativă. Capitolul 3 descrie soluția propusă: cerințe, arhitectură, "
        "tehnologii, diagrame UML, modelul bazei de date și implementarea funcționalităților cheie. "
        "Capitolul 4 ilustrează aplicația prin capturi de ecran și fluxuri de utilizare. "
        "Capitolul 5 sintetizează concluziile, limitările și direcțiile viitoare de dezvoltare.",
    )


def chapter2(doc: Document) -> None:
    doc.add_heading("Capitolul 2", level=1)
    doc.add_heading("Starea actuală a domeniului", level=1)

    doc.add_heading("Studii și articole științifice", level=2)
    add_body(
        doc,
        "Domeniul comerțului electronic și al sistemelor de ticketing online a fost analizat extensiv "
        "în literatura de specialitate. Autorii subliniază importanța securității tranzacțiilor, "
        "a experienței utilizatorului și a scalabilității platformelor [1], [2].",
    )
    add_body(
        doc,
        "În [3], se evidențiază tendința de migrare a serviciilor tradiționale către arhitecturi "
        "web moderne, bazate pe API-uri REST și separarea frontend-backend. Această abordare "
        "facilitează mentenanța și extinderea funcționalităților, fiind adoptată și în proiectul ManFast.",
    )
    add_body(
        doc,
        "Securitatea autentificării reprezintă un aspect esențial. OWASP recomandă hash-uirea "
        "parolelor, utilizarea token-urilor cu expirare și validarea input-ului [4]. "
        "Implementarea JWT și bcrypt în ManFast respectă aceste recomandări.",
    )
    add_body(
        doc,
        "Integrarea gateway-urilor de plată (Payment Service Providers) precum Stripe permite "
        "procesarea tranzacțiilor fără stocarea datelor cardului pe serverul propriu, "
        "reducând riscul de conformitate PCI-DSS [5].",
    )

    doc.add_heading("Aplicații dedicate domeniului", level=2)
    doc.add_heading("Eventbrite", level=3)
    add_body(
        doc,
        "Eventbrite este una dintre cele mai utilizate platforme internaționale pentru crearea "
        "și promovarea evenimentelor. Oferă pagini de eveniment, vânzare bilete, "
        "promovare și analiză de audiență. Limitarea constă în costuri de comision "
        "și personalizare redusă pentru organizatori mici.",
    )

    doc.add_heading("Platforme locale și generice", level=3)
    add_body(
        doc,
        "Pe piața românească există soluții de ticketing pentru concerte și festivaluri, "
        "precum și platforme generice de e-commerce. Acestea nu sunt însă orientate "
        "specific către competiții sportive cu bilete nominale și check-in administrat "
        "de organizatorul evenimentului.",
    )

    doc.add_heading("Analiză comparativă", level=2)
    add_table(
        doc,
        ["Funcționalitate", "Eventbrite", "Platforme generice", "ManFast"],
        [
            ["Bilete nominale", "Da", "Parțial", "Da"],
            ["Plată Stripe RON", "Nu (alte PSP)", "Variabil", "Da"],
            ["Check-in admin", "Da (QR)", "Nu", "Da"],
            ["Verificare email la register", "Da", "Variabil", "Da"],
            ["Filtrare județ/dată", "Da", "Nu", "Da"],
            ["Cod open-source / personalizabil", "Nu", "Nu", "Da"],
        ],
    )
    add_figure(doc, DIAG / "fig_arhitectura.png", "Figura 2.1 — Exemplu arhitectură web modernă (client-server)")

    doc.add_heading("Concluzii parțiale", level=2)
    add_body(
        doc,
        "Analiza domeniului demonstrează necesitatea unei soluții adaptate contextului local: "
        "evenimente sportive, plăți în RON, bilete pe nume și administrare simplă. "
        "ManFast propune o implementare open-source, extensibilă, care combină funcționalitățile "
        "esențiale identificate în platformele existente cu cerințele specifice proiectului.",
    )


def chapter3(doc: Document) -> None:
    doc.add_heading("Capitolul 3", level=1)
    doc.add_heading("Soluția propusă", level=1)

    doc.add_heading("Cerințe funcționale și nefuncționale", level=2)
    doc.add_heading("Cerințe funcționale", level=3)
    func = [
        "Înregistrare cont cu verificare cod email (6 cifre, 15 minute).",
        "Autentificare JWT, resetare parolă (email/telefon), profil editabil, ștergere cont.",
        "Listare evenimente viitoare cu filtre: nume, județ, dată.",
        "Detalii eveniment, cumpărare bilete nominale (unul sau mai multe nume).",
        "Plată Stripe Checkout, confirmare și afișare în „Biletele mele”.",
        "Admin: CRUD evenimente (imagini, județ, localitate), check-in, promovare/revocare admini.",
    ]
    for f in func:
        doc.add_paragraph(f, style="List Bullet")

    doc.add_heading("Cerințe nefuncționale", level=3)
    nfunc = [
        "Securitate: bcrypt, JWT 24h, rate limiting coduri înregistrare.",
        "Disponibilitate: API REST stateless, PostgreSQL relațional.",
        "UX: interfață responsive Material UI, temă dark.",
        "Portabilitate: Node.js 18+, PostgreSQL 14+, deploy separat frontend/backend.",
    ]
    for f in nfunc:
        doc.add_paragraph(f, style="List Bullet")

    doc.add_heading("Arhitectura sistemului", level=2)
    add_body(
        doc,
        "ManFast urmează arhitectura client-server în trei straturi: prezentare (React SPA), "
        "logică de business (Express API) și persistență (PostgreSQL). Serviciile externe "
        "Stripe și Brevo SMTP sunt accesate exclusiv din backend.",
    )
    add_figure(doc, DIAG / "fig_arhitectura.png", "Figura 3.1 — Arhitectura sistemului ManFast")

    doc.add_heading("Tehnologii utilizate", level=2)
    techs = [
        ("React 19 + Vite 8", "Frontend SPA, build rapid, HMR în development."),
        ("Material UI 9", "Componente UI responsive, temă dark cyan."),
        ("Express 4", "API REST, middleware JWT, upload Multer."),
        ("PostgreSQL", "Date relaționale: users, events, tickets, token-uri."),
        ("JWT + bcrypt", "Autentificare stateless, hash parole cost 10."),
        ("Stripe Checkout", "Plăți card în RON, redirect success/cancel."),
        ("Nodemailer + Brevo", "Email verificare înregistrare și reset parolă."),
    ]
    add_table(doc, ["Tehnologie", "Rol"], techs)

    doc.add_heading("Diagrame UML", level=2)
    add_figure(doc, DIAG / "fig_use_case.png", "Figura 3.2 — Diagrama cazurilor de utilizare")
    add_figure(doc, DIAG / "fig_seq_register.png", "Figura 3.3 — Diagramă de secvență: înregistrare cu verificare email")
    add_figure(doc, DIAG / "fig_seq_payment.png", "Figura 3.4 — Diagramă de secvență: cumpărare bilet Stripe")
    add_figure(doc, DIAG / "fig_activity_checkin.png", "Figura 3.5 — Diagramă de activitate: check-in administrator")

    doc.add_heading("Proiectarea bazei de date", level=2)
    add_body(
        doc,
        "Schema bazei de date include tabelele users, events, tickets, password_reset_tokens "
        "și registration_verifications. Relațiile principale: un eveniment are mai multe bilete; "
        "un utilizator poate deține mai multe bilete; la ștergerea contului, user_id pe bilete devine NULL.",
    )
    add_figure(doc, DIAG / "fig_erd.png", "Figura 3.6 — Diagrama entitate-relație (ERD)")

    doc.add_heading("Implementarea funcționalităților cheie", level=2)
    doc.add_heading("Autentificare și verificare email", level=3)
    add_body(
        doc,
        "Fluxul de înregistrare este în doi pași: POST /api/auth/register validează datele, "
        "verifică duplicatele, salvează temporar în registration_verifications și trimite codul. "
        "POST /api/auth/register/verify validează codul hash SHA-256 și creează contul în users.",
    )
    add_body(
        doc,
        "Login-ul generează JWT cu id și role, expirare 24h. Resetarea parolei folosește "
        "token hash în password_reset_tokens, valabil 1 oră, cu rate limit 3 cereri / 15 min.",
    )

    doc.add_heading("Plăți Stripe", level=3)
    add_body(
        doc,
        "create-checkout-session creează sesiune Stripe cu metadata (event_id, user_id, nume_participanti). "
        "confirm-payment verifică sesiunea plătită, inserează bilete nominale și decrementează locuri_disponibile.",
    )

    doc.add_heading("Gestionare evenimente (admin)", level=3)
    add_body(
        doc,
        "Administratorii autentificați pot crea evenimente cu upload imagini (max 8, 5MB), "
        "validare județ din listă fixă (42 județe) și localitate text. Editarea și ștergerea "
        "sunt protejate de middleware requireAdmin.",
    )

    doc.add_heading("Securitate", level=2)
    sec = [
        "Parole hash-uite cu bcrypt (10 rounds).",
        "JWT semnat cu JWT_SECRET separat de cheile Stripe.",
        "Coduri verificare și token reset stocate hash-uite, nu în clar.",
        "CORS restricționat la FRONTEND_URL.",
        "Ultimul admin nu poate fi șters sau revocat fără promovare altui admin.",
    ]
    for s in sec:
        doc.add_paragraph(s, style="List Bullet")


def chapter4(doc: Document) -> None:
    doc.add_heading("Capitolul 4", level=1)
    doc.add_heading("Prezentarea aplicației", level=1)

    doc.add_heading("Utilizarea aplicației — perspectiva utilizatorului", level=2)
    screens_user = [
        ("fig_home.png", "Figura 4.1 — Pagina principală cu filtre de căutare"),
        ("fig_event_details.png", "Figura 4.2 — Pagina de detalii eveniment și formular bilete"),
        ("fig_register.png", "Figura 4.3 — Formular înregistrare cont"),
        ("fig_register_verify.png", "Figura 4.4 — Verificare email cu cod de 6 cifre"),
        ("fig_login.png", "Figura 4.5 — Pagina de autentificare"),
        ("fig_payment_success.png", "Figura 4.6 — Confirmare plată reușită"),
        ("fig_my_tickets.png", "Figura 4.7 — Biletele mele (viitoare și trecute)"),
        ("fig_profile.png", "Figura 4.8 — Profil utilizator și zonă ștergere cont"),
    ]
    for fname, cap in screens_user:
        add_body(doc, cap.split("—")[1].strip() + ". Interfața respectă tema dark a aplicației ManFast.")
        add_figure(doc, IMG / fname, cap)

    doc.add_heading("Utilizarea aplicației — perspectiva administratorului", level=2)
    screens_admin = [
        ("fig_admin_dashboard.png", "Figura 4.9 — Panou admin: listă evenimente și participanți"),
        ("fig_admin_event.png", "Figura 4.10 — Dialog creare/editare eveniment"),
        ("fig_admin_admins.png", "Figura 4.11 — Gestionare administratori"),
    ]
    for fname, cap in screens_admin:
        add_body(doc, cap.split("—")[1].strip() + ". Funcționalitățile sunt accesibile doar rolului admin.")
        add_figure(doc, IMG / fname, cap)


def chapter5(doc: Document) -> None:
    doc.add_heading("Capitolul 5", level=1)
    doc.add_heading("Concluzii", level=1)

    doc.add_heading("Rezultate obținute", level=2)
    results = [
        "Platformă web funcțională ManFast (frontend + backend + PostgreSQL).",
        "Autentificare completă: register cu verificare email, login JWT, reset parolă, ștergere cont.",
        "Gestionare evenimente cu filtre județ/dată și upload imagini.",
        "Plăți Stripe Checkout pentru bilete nominale în RON.",
        "Panou admin: CRUD evenimente, check-in, gestionare admini.",
    ]
    for r in results:
        doc.add_paragraph(r, style="List Bullet")

    doc.add_heading("Limitări", level=2)
    limits = [
        "Lipsă teste automate (unit/integration).",
        "Promovarea primului admin necesită script SQL sau promote-admin.",
        "Emailurile depind de configurarea SMTP Brevo (fallback: consolă dev).",
        "Fără aplicație mobilă nativă sau notificări push.",
    ]
    for l in limits:
        doc.add_paragraph(l, style="List Bullet")

    doc.add_heading("Dezvoltări viitoare", level=2)
    future = [
        "Export participanți CSV din panoul admin.",
        "Webhook Stripe pentru confirmare server-side.",
        "Notificări email la cumpărare bilet.",
        "Teste automate și pipeline CI/CD.",
    ]
    for f in future:
        doc.add_paragraph(f, style="List Bullet")


def bibliography(doc: Document) -> None:
    doc.add_heading("Referințe bibliografice", level=1)
    refs = [
        "[1] R. Fielding, Architectural Styles and the Design of Network-based Software Architectures, 2000.",
        "[2] M. Fowler, Patterns of Enterprise Application Architecture, Addison-Wesley, 2002.",
        "[3] React Documentation, https://react.dev/, accesat 2026.",
        "[4] OWASP, Authentication Cheat Sheet, https://cheatsheetseries.owasp.org/, accesat 2026.",
        "[5] Stripe Documentation, Checkout and Payments, https://stripe.com/docs, accesat 2026.",
        "[6] Express.js Guide, https://expressjs.com/, accesat 2026.",
        "[7] PostgreSQL Documentation, https://www.postgresql.org/docs/, accesat 2026.",
        "[8] IETF RFC 7519 — JSON Web Token (JWT), 2015.",
        "[9] N. Provos, D. Mazières, A Future-Adaptable Password Scheme, USENIX 1999 (bcrypt).",
        "[10] Eventbrite Platform Overview, https://www.eventbrite.com/, accesat 2026.",
        "[11] Material UI Documentation, https://mui.com/, accesat 2026.",
        "[12] Node.js Documentation, https://nodejs.org/docs/, accesat 2026.",
    ]
    for ref in refs:
        p = doc.add_paragraph(ref)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.first_line_indent = Cm(0)
        for run in p.runs:
            run.font.name = "Times New Roman"
            run.font.size = Pt(12)


def main() -> None:
    # Generate assets if needed
    if not (DIAG / "fig_arhitectura.png").exists() or not (IMG / "fig_home.png").exists():
        print("Generare diagrame si capturi...")
        from generate_assets import main as gen_assets
        gen_assets()

    meta = load_meta()
    doc = Document()
    setup_styles(doc)

    cover_page(doc, meta)
    rezumat_abstract(doc, meta)
    chapter1(doc)
    doc.add_page_break()
    chapter2(doc)
    doc.add_page_break()
    chapter3(doc)
    doc.add_page_break()
    chapter4(doc)
    doc.add_page_break()
    chapter5(doc)
    doc.add_page_break()
    bibliography(doc)

    doc.save(OUT)
    print(f"Document salvat: {OUT}")


if __name__ == "__main__":
    main()
