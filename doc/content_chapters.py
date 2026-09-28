# -*- coding: utf-8 -*-
"""Conținut capitole licență — versiune pozitivă pentru Word."""
from __future__ import annotations

from docx import Document
from docx.shared import Cm, Pt

from word_utils import (
    FIG_DIR,
    add_body,
    add_bullets,
    add_caption,
    add_code,
    add_figure,
    add_figure_placeholder,
    add_numbered,
    add_table,
)


def build_rezumat(doc: Document, meta: dict) -> None:
    doc.add_heading("Rezumat", level=1)
    add_body(
        doc,
        f"Lucrarea de licență {meta['titlu']} propune dezvoltarea unei platforme web complete "
        "destinate organizatorilor și participanților la conferințe, meeting-uri, concerte, "
        "evenimente culturale și, într-o măsură mai mică, competiții sportive. Aplicația permite "
        "publicarea evenimentelor, filtrarea după nume, județ și dată, achiziționarea biletelor "
        "nominale cu plată online prin Stripe și administrarea participanților printr-un panou dedicat.",
    )
    add_body(
        doc,
        "Soluția tehnică adoptă arhitectura client-server: frontend React 19 cu Material UI 9, "
        "backend Node.js/Express, bază de date PostgreSQL. Autentificarea utilizează token-uri JWT, "
        "parole hash-uite cu bcrypt, verificare email la înregistrare (cod de 6 cifre) și resetare parolă. "
        "Administratorii gestionează evenimente (inclusiv imagini), efectuează check-in și promovează alți administratori.",
    )
    add_body(
        doc,
        "Documentul prezintă motivația temei, starea domeniului, proiectarea și implementarea soluției, "
        "capturi din aplicația funcțională și concluzii. Platforma reprezintă o soluție scalabilă, "
        "adaptabilă contextului românesc (plăți RON, județe).",
    )
    doc.add_page_break()
    doc.add_heading("Abstract", level=1)
    add_body(
        doc,
        f"The bachelor's thesis {meta['titlu']} proposes a complete web platform for organizers "
        "and participants in conferences, meetings, concerts, cultural events, and to a lesser extent "
        "sports competitions. The application enables event publishing, filtering by name, county and date, "
        "purchasing nominal tickets with online payment via Stripe, and participant management through a dedicated admin panel.",
        first_indent=False,
    )
    add_body(
        doc,
        "The technical solution adopts a client-server architecture: React 19 frontend with Material UI 9, "
        "Node.js/Express backend, PostgreSQL database. Authentication uses JWT tokens, bcrypt password hashing, "
        "email verification on registration (6-digit code), and password reset.",
        first_indent=False,
    )
    doc.add_page_break()


def build_chapter1(doc: Document) -> None:
    doc.add_heading("Capitolul 1", level=1)
    doc.add_heading("Motivație", level=1)

    doc.add_heading("Contextul și problema", level=2)
    add_body(
        doc,
        "Organizarea conferințelor, meeting-urilor, concertelor și a altor evenimente cu public și locuri "
        "limitate implică, în mod tradițional, procese fragmentate: promovarea prin canale disparate "
        "(rețele sociale, email, site-uri proprii), vânzarea biletelor sau înscrierilor în format fizic "
        "sau prin transfer bancar manual, și validarea participanților la intrare prin liste pe hârtie.",
    )
    add_body(
        doc,
        "Digitalizarea procesului — centralizarea informațiilor despre evenimente, automatizarea plăților "
        "și asocierea fiecărui bilet cu identitatea participantului — reprezintă un pas natural în contextul "
        "extinderii serviciilor online și al așteptărilor utilizatorilor privind comoditatea și securitatea tranzacțiilor.",
    )
    add_body(
        doc,
        "Organizatorii (universități, firme, asociații culturale, săli de concert) nu dispun adesea de resurse "
        "pentru soluții enterprise costisitoare. Platformele internaționale generice nu sunt întotdeauna adaptate "
        "pieței locale: moneda RON, structura administrativă pe județe, sau necesitatea unui flux simplu de check-in "
        "administrat de organizator. Pentru evenimente sportive amatoriale, aceleași mecanisme de înscriere și plată "
        "sunt utile ca nișă complementară.",
    )
    add_body(
        doc,
        "Participanții au nevoie de o interfață clară: descoperire evenimente, filtrare, achiziție rapidă a unuia "
        "sau mai multor bilete nominale, vizualizarea istoricului și gestionarea contului. Organizatorii au nevoie "
        "de un panou unic pentru publicare, monitorizare locuri disponibile și confirmare prezență la fața locului.",
    )

    doc.add_heading("Obiectivele lucrării", level=2)
    add_body(doc, "Obiectivul principal este proiectarea și implementarea aplicației web pentru organizarea și gestionarea evenimentelor:")
    add_numbered(
        doc,
        [
            "Implementarea unui modul de autentificare securizat: înregistrare cu verificare email, login JWT, resetare parolă, editare profil și ștergere cont.",
            "Oferirea unei interfețe publice pentru listarea evenimentelor viitoare, cu filtre după nume, județ și dată.",
            "Permiterea achiziționării biletelor nominale (unul sau mai multe nume per tranzacție) cu plată online prin Stripe Checkout, în moneda RON.",
            "Dezvoltarea unui panou de administrare pentru CRUD evenimente (inclusiv imagini), listă participanți și check-in.",
            "Gestionarea rolurilor utilizator/admin și promovarea/revocarea administratorilor cu parolă de autorizare.",
            "Documentarea arhitecturii, a modelului de date și a fluxurilor principale (UML, ERD).",
        ],
    )

    doc.add_heading("Structura documentului", level=2)
    add_body(
        doc,
        "Capitolul 2 analizează starea actuală a domeniului: studii relevante, platforme existente și o comparație "
        "cu soluția propusă. Capitolul 3 descrie arhitectura și implementarea aplicației. Capitolul 4 prezintă "
        "interfețele prin capturi de ecran și fluxuri de utilizare. Capitolul 5 sintetizează concluziile și perspectivele de extindere.",
    )

    doc.add_heading("Tipuri de evenimente vizate", level=2)
    add_table(
        doc,
        ["Categorie", "Exemple", "Funcționalități folosite"],
        [
            ["Conferințe", "Congrese, workshop-uri", "Listare, filtre, bilete nominale, check-in"],
            ["Meeting-uri", "Training corporate, meetup-uri", "Înregistrare, plată online, profil"],
            ["Concerte", "Concerte locale, festivaluri", "Galerie imagini, locuri limitate, Stripe RON"],
            ["Culturale", "Expoziții, lansări carte", "Descriere, filtrare, link public"],
            ["Sportive (secundar)", "Competiții locale", "Bilete pe nume, check-in admin"],
        ],
    )
    add_body(
        doc,
        "Universitățile, camerele de comerț și firmele organizează periodic conferințe și meeting-uri cu număr "
        "limitat de locuri. Platforma acoperă fluxul end-to-end: publicare eveniment, înregistrare online, "
        "emitere bilet nominal și check-in la intrare.",
    )
    add_body(
        doc,
        "Concertele necesită prezentare atractivă (titlu, descriere, imagini) și vânzare rapidă a biletelor. "
        "Filtrarea după județ și dată ajută publicul să descopere evenimente din apropiere. Biletele nominale "
        "asociază fiecare loc unui participant, simplificând controlul la intrare.",
    )
    add_body(
        doc,
        "Indiferent de tipul evenimentului, organizatorul beneficiază de un singur panou pentru toate formatele, "
        "trasabilitate plăți prin Stripe, adaptare locală (județe, RON, email SMTP) și control asupra datelor în PostgreSQL.",
    )
    doc.add_page_break()


def extend_chapter1(doc: Document) -> None:
    doc.add_heading("Justificarea alegerii temei", level=2)
    paras = [
        "Digitalizarea evenimentelor reprezintă una dintre direcțiile prioritare ale transformării "
        "digitale în sectorul public și privat. Universitățile organizează conferințe și simpozioane "
        "cu participare națională; firmele desfășoară training-uri și workshop-uri; sălile de concert "
        "și teatrele locale promovează spectacole cu public numeros. Toate aceste formate au în comun "
        "necesitatea gestionării locurilor limitate și a identificării participanților.",
        "Soluțiile existente pe piață sunt fie costisitoare (platforme internaționale cu comision per bilet), "
        "fie generice (e-commerce fără check-in integrat), fie fragmentate (formulare + plăți manuale). "
        "O aplicație web dedicată, self-hosted, răspunde nevoii de control, cost predictibil și adaptare "
        "la specificul românesc.",
        "Proiectul demonstrează competențe full-stack: proiectare bază de date, API REST, interfață "
        "modernă, integrare plăți și securitate — competențe evaluate în cadrul programului de licență "
        "Informatică de la Facultatea de Matematică și Informatică, Ovidius Constanța.",
        "Evenimentele sportive amatoriale completează aria de aplicabilitate fără a domina proiectul: "
        "același flux de înscriere și plată poate deservi un turneu local, însă accentul documentației "
        "și al scenariilor de demonstrație rămâne pe conferințe, concerte și meeting-uri.",
    ]
    for p in paras:
        add_body(doc, p)

    doc.add_heading("Beneficii pentru părțile interesate", level=2)
    add_table(
        doc,
        ["Parte interesată", "Beneficiu principal"],
        [
            ["Participant", "Descoperire și plată rapidă, bilete centralizate"],
            ["Organizator", "Panou unic, check-in, control locuri"],
            ["Instituție", "Date stocate local, conformitate GDPR"],
            ["Dezvoltator", "Cod modular, extensibil"],
        ],
    )


def build_chapter2(doc: Document) -> None:
    doc.add_heading("Capitolul 2", level=1)
    doc.add_heading("Starea actuală a domeniului", level=1)

    doc.add_heading("Studii și articole științifice", level=2)
    doc.add_heading("Arhitecturi web și API-uri REST", level=3)
    add_body(
        doc,
        "Fielding [1] definește principiile REST ca stil arhitectural pentru sisteme distribuite. Separarea "
        "clientului de server, utilizarea resurselor adresabile prin URI și a metodelor HTTP standard facilitează "
        "dezvoltarea aplicațiilor web scalabile. Aplicația expune un API REST în Node.js/Express, consumat de frontend-ul React.",
    )
    add_body(
        doc,
        "Fowler [2] descrie tipare de proiectare enterprise, inclusiv separarea responsabilităților între straturi "
        "(prezentare, logică de business, persistență). React gestionează UI, Express conține regulile de business, "
        "PostgreSQL stochează datele.",
    )

    doc.add_heading("Securitatea autentificării", level=3)
    add_body(
        doc,
        "OWASP [4] enumeră bune practici pentru autentificare: hash-uirea parolelor, protecția sesiunilor, "
        "limitarea ratei de cereri, validarea input-ului. Aplicația implementează bcrypt pentru parole, JWT cu "
        "expirare 24h, rate limiting pe codurile de verificare email și resetare parolă.",
    )
    add_body(
        doc,
        "Standardul JWT [8] permite transmiterea securizată a claims-urilor între părți. Token-ul semnat conține "
        "id-ul utilizatorului și rolul (user/admin), verificat la fiecare cerere protejată. Provos și Mazières [9] "
        "introduc bcrypt, algoritm de hash adaptat la cost computațional configurabil.",
    )

    doc.add_heading("Plăți online și gateway-uri", level=3)
    add_body(
        doc,
        "Documentația Stripe [5] descrie fluxul Checkout: sesiune de plată găzduită, redirect către pagina "
        "securizată Stripe, confirmare prin verificare sesiune. Aplicația creează sesiuni Checkout cu metadata "
        "(event_id, user_id, nume participanți) fără a stoca date de card pe serverul propriu, reducând "
        "responsabilitatea PCI-DSS.",
    )

    doc.add_heading("Persistență și baze de date relaționale", level=3)
    add_body(
        doc,
        "PostgreSQL [7] oferă tranzacții ACID, constrângeri de integritate referențială și tipuri avansate "
        "(array pentru imagini eveniment). Schema exploatează aceste capabilități pentru consistența bilete–locuri disponibile.",
    )

    doc.add_heading("Interfețe utilizator și SPA", level=3)
    add_body(
        doc,
        "React [3] și ecosistemul său permit construirea de Single Page Applications reactive. Material UI [11] "
        "oferă componente accesibile și responsive. Aplicația utilizează React 19, Vite pentru build rapid și MUI 9 cu temă dark personalizată.",
    )

    doc.add_heading("Aplicații dedicate domeniului", level=2)
    doc.add_heading("Eventbrite", level=3)
    add_body(
        doc,
        "Eventbrite [10] este o platformă internațională pentru crearea și promovarea evenimentelor, cu vânzare "
        "bilete, pagini de destinație și instrumente de marketing. Oferă check-in prin cod QR și analiză audiență. "
        "Suportă concerte, conferințe, workshop-uri. Limitările pentru organizatori mici includ comisioane per bilet "
        "și dependența de ecosistemul proprietar.",
    )
    add_figure_placeholder(doc, "fig_eventbrite.png")
    add_caption(doc, "Figura 2.1 — Interfața unei platforme de ticketing (exemplu comparativ)")

    doc.add_heading("Platforme locale și generice", level=3)
    add_body(
        doc,
        "Pe piața românească există soluții pentru bilete la concerte și festivaluri (iaBilet, Eventim), precum "
        "și platforme e-commerce generice. Acestea sunt optimizate pentru vânzare la scară largă. Organizatorii "
        "locali folosesc frecvent formulare Google și liste Excel — soluții cu risc ridicat de erori la reconciliere.",
    )
    add_body(
        doc,
        "Aplicația propusă oferă un echilibru: cost de operare redus (self-hosted), flux clar de la descoperire "
        "eveniment la plată și check-in, adaptare la județele românești și plăți RON via Stripe.",
    )

    doc.add_heading("Tendințe și standarde în industria ticketing-ului", level=2)
    add_body(
        doc,
        "Industria biletelor electronice investește în experiență mobilă, analitică de vânzări și integrare marketing. "
        "Aplicația urmărește funcționalitatea minimă viabilă pentru organizatori locali: publicare eveniment, "
        "vânzare online, listă participanți, check-in la intrare.",
    )
    add_body(
        doc,
        "Standardul PCI-DSS impune măsuri stricte pentru procesarea datelor de card. Soluțiile cu Stripe Checkout "
        "hosted delegă colectarea datelor sensibile către Stripe — comerciantul primește doar confirmarea plății prin API.",
    )

    doc.add_heading("Platforme pentru conferințe, concerte și meeting-uri", level=2)
    add_table(
        doc,
        ["Tip eveniment", "Eventbrite", "iaBilet/Eventim", "Aplicația propusă"],
        [
            ["Conferință", "Foarte bun", "Slab", "Bun (taxă + check-in)"],
            ["Meeting/seminar", "Bun", "Slab", "Bun"],
            ["Concert local", "Bun", "Foarte bun", "Bun (capacitate mică–mediu)"],
            ["Competiție sportivă", "Parțial", "Slab", "Acceptabil (nominale)"],
        ],
    )
    add_body(
        doc,
        "Universitățile și companiile au accelerat trecerea la înscrieri online pentru conferințe și training-uri. "
        "Soluția analizată unifică înscrierea, plata și lista de prezență, menținând o experiență coerentă pentru "
        "organizator și participant. Regulamentul GDPR impune transparență și securitate la prelucrarea datelor personale.",
    )

    doc.add_heading("Analiză comparativă", level=2)
    add_table(
        doc,
        ["Funcționalitate", "Eventbrite", "Generic e-comm", "Aplicația propusă"],
        [
            ["Bilete nominale", "Da", "Parțial", "Da"],
            ["Plăți Stripe RON", "Nu", "Variabil", "Da"],
            ["Check-in admin", "Da (QR)", "Nu", "Da (listă)"],
            ["Verificare email register", "Da", "Variabil", "Da (cod 6 cifre)"],
            ["Filtrare județ/dată", "Da", "Nu", "Da (42 județe)"],
            ["Cod deschis", "Nu", "Nu", "Da"],
            ["Reset parolă tel.+email", "Variabil", "Variabil", "Da"],
        ],
    )

    doc.add_heading("Concluzii parțiale", level=2)
    add_body(
        doc,
        "Analiza demonstrează că există un spațiu pentru o soluție adaptată conferințelor, meeting-urilor, "
        "concertelor și evenimentelor culturale, cu plăți RON via Stripe, bilete pe nume și administrare simplă. "
        "Următorul capitol detaliază arhitectura, tehnologiile și implementarea soluției propuse.",
    )


def build_chapter3(doc: Document) -> None:
    doc.add_heading("Capitolul 3", level=1)
    doc.add_heading("Soluția propusă", level=1)

    doc.add_heading("Cerințe funcționale", level=2)
    doc.add_heading("Cerințe funcționale — utilizator", level=3)
    add_bullets(
        doc,
        [
            "RF-U1 — Înregistrare cont: username, email, telefon, parolă; trimitere cod 6 cifre pe email; creare cont după verificare.",
            "RF-U2 — Autentificare cu email și parolă; primire token JWT.",
            "RF-U3 — Resetare parolă prin email sau telefon.",
            "RF-U4 — Vizualizare listă evenimente viitoare; filtre: nume, județ, dată.",
            "RF-U5 — Pagină detalii eveniment: descriere, imagini, locație, preț, locuri.",
            "RF-U6 — Cumpărare bilete nominale (1..N nume); redirect Stripe Checkout.",
            "RF-U7 — Confirmare plată; vizualizare bilete în „Biletele mele”.",
            "RF-U8 — Editare profil; schimbare parolă; ștergere cont.",
        ],
    )
    doc.add_heading("Cerințe funcționale — administrator", level=3)
    add_bullets(
        doc,
        [
            "RF-A1 — CRUD evenimente: titlu, descriere, dată, județ, localitate, locație, preț, locuri, durată, imagini (max 8).",
            "RF-A2 — Listă participanți per eveniment; check-in.",
            "RF-A3 — Promovare/revocare rol admin; protecție ultim admin.",
        ],
    )

    doc.add_heading("Arhitectura sistemului", level=2)
    add_body(
        doc,
        "Aplicația urmează arhitectura client-server în trei straturi: (1) strat prezentare — SPA React (Vite), "
        "routing React Router, context autentificare; (2) strat aplicație — Express cu rute /api/auth, /api/events, "
        "/api/tickets; (3) strat date — PostgreSQL și fișiere statice imagini în uploads/. Servicii externe: Stripe (plăți), Brevo SMTP (email).",
    )
    add_figure_placeholder(doc, "fig_arhitectura.png", 6.0)
    add_caption(doc, "Figura 3.1 — Arhitectura sistemului")
    doc.add_page_break()

    doc.add_heading("Tehnologii utilizate", level=2)
    add_table(
        doc,
        ["Tehnologie", "Rol"],
        [
            ["React 19 + Vite 8", "Frontend SPA, HMR dev"],
            ["Material UI 9", "Componente UI, temă dark"],
            ["Express 4", "API REST, Multer upload"],
            ["PostgreSQL", "Persistență relațională"],
            ["JWT + bcrypt", "Autentificare și hash parole"],
            ["Stripe Checkout", "Plăți card RON"],
            ["Nodemailer + Brevo", "Email SMTP"],
        ],
    )
    add_body(
        doc,
        "React [3] gestionează starea UI și re-renderarea eficientă. Vite oferă build rapid în development. "
        "Express [6] routează cererile HTTP către handler-e modulare. Driverul pg conectează la PostgreSQL. "
        "Stripe SDK creează sesiuni Checkout securizate.",
    )
    add_body(
        doc,
        "Material UI 9 furnizează componente accesibile (TextField, Button, Dialog, Grid) și suport responsive "
        "prin breakpoints. Tema dark personalizată (cyan pe fundal închis) oferă identitate vizuală modernă, "
        "potrivită pentru publicul tinerilor participanți la concerte și conferințe.",
    )
    add_body(
        doc,
        "PostgreSQL asigură consistența tranzacțiilor la confirmarea plății: inserarea biletelor și decrementarea "
        "locurilor disponibile sunt atomice. Tipul array TEXT[] stochează URL-urile imaginilor per eveniment.",
    )

    doc.add_heading("Diagrame UML", level=2)
    doc.add_heading("Cazuri de utilizare", level=3)
    add_body(
        doc,
        "Actorii principali sunt Utilizatorul și Administratorul. Utilizatorul poate înregistra cont, autentifica, "
        "filtra evenimente, cumpăra bilete, gestiona profilul. Administratorul publică evenimente, face check-in, gestionează alți admini.",
    )
    add_figure_placeholder(doc, "fig_use_case.png", 6.0)
    add_caption(doc, "Figura 3.2 — Diagrama cazurilor de utilizare")
    doc.add_page_break()

    doc.add_heading("Secvență — înregistrare cu verificare email", level=3)
    add_body(
        doc,
        "Flux: Frontend POST /register → Backend validează, salvează în registration_verifications, trimite cod SMTP "
        "→ Frontend POST /register/verify → INSERT users.",
    )
    add_figure_placeholder(doc, "fig_seq_register.png", 6.0)
    add_caption(doc, "Figura 3.3 — Diagrama de secvență — înregistrare cu email")
    doc.add_page_break()

    doc.add_heading("Secvență — plată Stripe", level=3)
    add_body(
        doc,
        "Flux: Frontend POST create-checkout-session → redirect Stripe → success URL → confirm-payment → INSERT tickets, UPDATE locuri.",
    )
    add_figure_placeholder(doc, "fig_seq_payment.png", 6.0)
    add_caption(doc, "Figura 3.4 — Diagrama de secvență — plată Stripe")
    doc.add_page_break()

    doc.add_heading("Activitate — check-in admin", level=3)
    add_figure_placeholder(doc, "fig_activity_checkin.png", 5.5)
    add_caption(doc, "Figura 3.5 — Diagrama de activitate — check-in")

    doc.add_heading("Proiectarea bazei de date", level=2)
    add_body(
        doc,
        "Tabele principale: users, events, tickets, password_reset_tokens, registration_verifications. "
        "Relații: events 1:N tickets; users 1:N tickets (ON DELETE SET NULL); verificări înregistrare temporare până la confirmare.",
    )
    add_figure_placeholder(doc, "fig_erd.png", 6.5)
    add_caption(doc, "Figura 3.6 — Diagrama entitate-relație (ERD)")
    doc.add_page_break()

    doc.add_heading("Implementarea funcționalităților cheie", level=2)
    doc.add_heading("Autentificare și verificare email", level=3)
    add_code(
        doc,
        "function genereazaCodVerificare() {\n"
        "    return String(crypto.randomInt(100000, 1000000));\n"
        "}\n"
        "function hashCodVerificare(cod) {\n"
        "    return crypto.createHash('sha256')\n"
        "        .update(String(cod).trim()).digest('hex');\n"
        "}",
    )
    add_body(
        doc,
        "La POST /register/verify, codul este comparat cu code_hash, expirarea verificată, apoi utilizatorul inserat în users. Login-ul generează JWT cu expirare 24h.",
    )

    doc.add_heading("Plăți Stripe", level=3)
    add_code(
        doc,
        "const session = await stripe.checkout.sessions.create({\n"
        "  payment_method_types: ['card'],\n"
        "  line_items: [{ price_data: {\n"
        "      currency: 'ron',\n"
        "      product_data: { name: `Bilet - ${event.titlu}` },\n"
        "      unit_amount: Math.round(Number(event.pret) * 100),\n"
        "    }, quantity: cantitate }],\n"
        "  mode: 'payment',\n"
        "  success_url: `${frontendUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,\n"
        "  metadata: { event_id, user_id, nume_participanti: JSON.stringify(nume) }\n"
        "});",
    )
    add_body(
        doc,
        "confirm-payment verifică session.payment_status === 'paid', inserează câte un rând tickets per nume "
        "și decrementează locuri_disponibile într-o tranzacție PostgreSQL.",
    )

    doc.add_heading("Gestionare evenimente", level=3)
    add_body(
        doc,
        "Crearea evenimentului folosește Multer pentru imagini și validare județ din listă fixă (42 județe). "
        "La INSERT, locuri_disponibile = locuri_totale. Editarea permite adăugare incrementală de imagini.",
    )

    doc.add_heading("Securitate", level=2)
    add_bullets(
        doc,
        [
            "Parole: bcrypt cost 10; hash-uri în baza de date.",
            "JWT: secret separat; expirare 24h.",
            "Coduri email și token reset: SHA-256 în DB.",
            "Rate limit: max 3 coduri / 15 min; cooldown 60s retrimitere.",
            "CORS: doar FRONTEND_URL.",
            "Admin: ultimul admin protejat la ștergere/revocare.",
            "Ștergere cont: confirmare parolă obligatorie.",
        ],
    )
    add_body(
        doc,
        "Implementarea respectă recomandările OWASP [4] pentru autentificare și gestionarea sesiunilor.",
    )

    doc.add_heading("Scenarii de utilizare pe tipuri de evenimente", level=2)
    doc.add_heading("Scenariul 1: Conferință universitară", level=3)
    add_body(
        doc,
        "Facultatea organizează o conferință cu 150 locuri, taxă 120 RON. Administratorul creează evenimentul "
        "cu program, speakeri, imagini banner. Participanții se înregistrează, plătesc online, primesc bilet nominal. "
        "Check-in la recepție validează prezența.",
    )
    doc.add_heading("Scenariul 2: Concert în aer liber", level=3)
    add_body(
        doc,
        "Asociație culturală: 500 locuri, bilet 50 RON, galerie foto artiști. Vânzarea poate include mai multe "
        "bilete într-o tranzacție Stripe — fiecare nume corespunde unui bilet nominal.",
    )
    doc.add_heading("Scenariul 3: Meeting corporate", level=3)
    add_body(
        doc,
        "Workshop IT, 30 locuri. Verificarea email reduce înscrierile fictive. Check-in din admin oferă listă de prezență pentru raport intern.",
    )
    doc.add_heading("Scenariul 4: Competiție sportivă", level=3)
    add_body(
        doc,
        "Club sportiv: taxă înscriere, nume conform buletinului. Fluxul de plată și check-in este identic cu conferințele, "
        "demonstrând flexibilitatea modelului unificat.",
    )

    doc.add_heading("Model relațional — detaliu tabele", level=2)
    add_body(
        doc,
        "Tabelul users stochează conturile (username, email, password_hash, role). events conține titlu, descriere, "
        "data_eveniment, județ, localitate, preț, locuri_totale, locuri_disponibile, imagini[]. tickets leagă "
        "evenimentul de utilizator și nume_buletin, stripe_session_id, check_in.",
    )

    doc.add_heading("API REST — referință", level=2)
    add_table(
        doc,
        ["Endpoint", "Metodă", "Descriere"],
        [
            ["/auth/register", "POST", "Trimite cod verificare email"],
            ["/auth/register/verify", "POST", "Confirmă cod, creează cont"],
            ["/auth/login", "POST", "Autentificare, returnează JWT"],
            ["/auth/me", "GET", "Utilizator curent"],
            ["/auth/profile", "PUT", "Actualizare profil"],
            ["/auth/password", "PUT", "Schimbare parolă"],
            ["/auth/account", "DELETE", "Ștergere cont"],
            ["/auth/forgot-password", "POST", "Solicitare reset"],
            ["/auth/reset-password", "POST", "Parolă nouă cu token"],
            ["/auth/admin/create", "POST", "Promovare admin"],
        ],
    )
    add_table(
        doc,
        ["Endpoint", "Metodă", "Descriere"],
        [
            ["/events", "GET", "Listă publică evenimente viitoare"],
            ["/events/:id", "GET", "Detalii eveniment"],
            ["/events", "POST", "Creare (admin)"],
            ["/events/:id", "PUT", "Editare (admin)"],
            ["/events/:id", "DELETE", "Ștergere (admin)"],
            ["/tickets/create-checkout-session", "POST", "Sesiune Stripe"],
            ["/tickets/confirm-payment", "POST", "Confirmare plată"],
            ["/tickets/my-tickets", "GET", "Biletele utilizatorului"],
            ["/tickets/admin/participants", "GET", "Participanți (admin)"],
        ],
    )

    doc.add_heading("Configurare și deployment", level=2)
    add_body(
        doc,
        "Variabile backend: DB_*, JWT_SECRET, STRIPE_SECRET_KEY, FRONTEND_URL, SMTP_*, MAIL_FROM, "
        "ADMIN_AUTHORIZATION_PASSWORD. Frontend: VITE_API_URL. Instalare: PostgreSQL, npm run setup-db, "
        "npm run dev (backend + frontend), promote-admin pentru primul administrator.",
    )

    doc.add_heading("Componente frontend", level=2)
    add_body(
        doc,
        "Rute React Router: /, /login, /register, /events/:id, /profile, /my-tickets, /payment-success, /admin. "
        "AuthContext expune user, token, login, logout. Token JWT în localStorage. AdminRoute protejează panoul admin.",
    )


def build_chapter4(doc: Document) -> None:
    doc.add_heading("Capitolul 4", level=1)
    doc.add_heading("Prezentarea aplicației", level=1)
    add_body(
        doc,
        "Aplicația web pentru organizarea și gestionarea evenimentelor rulează în browser la localhost:5173 "
        "(frontend) și comunică cu API-ul Express la portul 5000. Interfețele principale sunt ilustrate în figurile de mai jos.",
    )

    doc.add_heading("Utilizarea aplicației — perspectiva utilizatorului", level=2)

    sections_user = [
        ("Pagina principală", "fig_home.png", "Figura 4.1 — Pagina principală — listă evenimente și filtre",
         "Pagina principală afișează evenimentele viitoare. EventSearchFilters permite filtrarea după nume, județ (42 județe) și dată. "
         "Cardurile EventListItem prezintă titlu, locație, preț și locuri disponibile."),
        ("Detalii eveniment", "fig_event_details.png", "Figura 4.2 — Pagina detalii eveniment",
         "Pagina /events/:id prezintă titlu, galerie imagini, descriere, dată, locație, preț. Utilizatorul autentificat "
         "poate adăuga câmpuri „Nume participant” și iniția plata Stripe."),
        ("Înregistrare cont", "fig_register.png", "Figura 4.3 — Formular înregistrare",
         "Formularul colectează username, email, telefon, parolă. La submit se trimite cod de verificare pe email."),
        ("Verificare email", "fig_register_verify.png", "Figura 4.4 — Verificare email cu cod",
         "Utilizatorul introduce codul de 6 cifre primit pe email."),
        ("Autentificare", "fig_login.png", "Figura 4.5 — Pagina login",
         "Pagina /login permite autentificarea. Link-uri către resetare parolă și înregistrare."),
        ("Confirmare plată", "fig_payment_success.png", "Figura 4.6 — Pagină succes plată",
         "După Stripe Checkout, utilizatorul revine la /payment-success și confirmă plata."),
        ("Biletele mele", "fig_my_tickets.png", "Figura 4.7 — Biletele mele",
         "/my-tickets grupează biletele în „viitoare” și „trecute”."),
        ("Profil utilizator", "fig_profile.png", "Figura 4.8 — Profil utilizator",
         "/profile: editare date, schimbare parolă, ștergere cont."),
    ]
    for title, fname, caption, text in sections_user:
        doc.add_heading(title, level=3)
        add_body(doc, text)
        add_body(
            doc,
            f"Interfața {title.lower()} respectă tema dark a aplicației, cu componente Material UI "
            "responsive. Elementele de navigare permit revenire rapidă către lista de evenimente sau "
            "către contul utilizatorului. Mesajele de confirmare și eroare sunt afișate contextual.",
        )
        add_figure(doc, FIG_DIR / fname, caption)
        doc.add_page_break()

    doc.add_heading("Resetare parolă", level=3)
    add_body(
        doc,
        "Utilizatorul poate solicita resetarea parolei introducând email sau telefon. După confirmare, "
        "primește link pe email și setează parola nouă pe pagina dedicată.",
    )
    add_figure_placeholder(doc, "fig_forgot_password.png")
    add_caption(doc, "Figura 4.13 — Pagina Am uitat parola")
    doc.add_page_break()
    add_figure_placeholder(doc, "fig_reset_password.png")
    add_caption(doc, "Figura 4.14 — Formular parolă nouă")
    doc.add_page_break()

    doc.add_heading("Utilizarea aplicației — perspectiva administratorului", level=2)
    add_body(
        doc,
        "Administratorul accesează /admin după autentificare cu rol admin. Panoul centralizează gestionarea "
        "evenimentelor și a participanților: creare, editare, ștergere evenimente, check-in, gestionare admini.",
    )
    sections_admin = [
        ("Panou admin — dashboard", "fig_admin_dashboard.png", "Figura 4.9 — Panou admin — dashboard",
         "Listă evenimente cu acțiuni editare/ștergere; tab participanți; check-in."),
        ("Creare / editare eveniment", "fig_admin_event.png", "Figura 4.10 — Dialog editare eveniment",
         "Dialog cu titlu, descriere, dată, județ, localitate, preț, locuri, upload imagini."),
        ("Check-in participant", "fig_admin_checkin.png", "Figura 4.11 — Check-in participant",
         "Marcarea unui participant ca prezent."),
        ("Gestionare administratori", "fig_admin_admins.png", "Figura 4.12 — Gestionare administratori",
         "Dialog promovare/revocare admin cu parolă autorizare."),
    ]
    for title, fname, caption, text in sections_admin:
        doc.add_heading(title, level=3)
        add_body(doc, text)
        add_body(
            doc,
            "Panoul administratorului oferă acces rapid la acțiunile frecvente: publicare eveniment nou, "
            "editare detalii, vizualizare participanți și validare prezență. Dialogurile modale evită "
            "părăsirea contextului curent și păstrează starea listei de evenimente.",
        )
        add_figure(doc, FIG_DIR / fname, caption)
        doc.add_page_break()

    doc.add_heading("Experiența utilizatorului și design responsive", level=2)
    add_body(
        doc,
        "Fluxul complet: descoperire eveniment → detalii → login/register → plată Stripe → bilete → check-in. "
        "Material UI 9 oferă layout responsive: meniu hamburger pe mobil, filtre stivuite vertical, formulare centrate în AuthCard.",
    )
    add_body(
        doc,
        "Au fost implementate măsuri de accesibilitate: focus corect după închiderea meniului mobil, etichete pe câmpuri, "
        "contrast ridicat în tema dark. Mesajele de eroare sunt traduse în română, fără detalii tehnice expuse utilizatorului.",
    )

    doc.add_heading("Exemple pe categorii de evenimente", level=2)
    add_body(
        doc,
        "Conferință: descriere cu program și speakeri, filtre județ/dată pentru participanți regionali. "
        "Concert: accent pe galerie imagini și locuri limitate. Meeting: monitorizare locuri disponibile în timp real "
        "și check-in pentru listă de prezență. Eveniment sportiv: nume pe bilet pentru validare la concurs.",
    )


def build_chapter5(doc: Document) -> None:
    doc.add_heading("Capitolul 5", level=1)
    doc.add_heading("Concluzii", level=1)

    doc.add_heading("Rezultate obținute", level=2)
    add_body(
        doc,
        "Lucrarea de licență a avut ca obiectiv dezvoltarea aplicației web pentru organizarea și gestionarea "
        "evenimentelor, orientate întâi spre conferințe, meeting-uri, concerte și evenimente culturale, "
        "cu suport complementar pentru competiții sportive. Obiectivele propuse au fost atinse:",
    )
    add_bullets(
        doc,
        [
            "Aplicație full-stack funcțională: React + Express + PostgreSQL.",
            "Autentificare completă: înregistrare cu verificare email, login JWT, reset parolă, profil, ștergere cont.",
            "Listare și filtrare evenimente (nume, județ, dată).",
            "Plăți Stripe Checkout în RON; bilete nominale și „Biletele mele”.",
            "Panou admin: CRUD evenimente cu imagini, check-in, gestionare admini.",
            "Documentare: arhitectură, ERD, UML, API REST, scenarii pe tipuri de evenimente.",
        ],
    )
    add_body(
        doc,
        "Soluția demonstrează integrarea unor tehnologii moderne într-un produs coerent, adaptat contextului românesc (județe, RON, email Brevo).",
    )

    doc.add_heading("Perspective de extindere", level=2)
    add_body(
        doc,
        "Platforma dezvoltată poate constitui punct de plecare pentru extinderi care sporesc valoarea pentru organizatori:",
    )
    add_bullets(
        doc,
        [
            "Integrarea unor categorii de bilete ar permite diversificarea ofertei pentru conferințe (early bird / regular) și concerte (VIP).",
            "Exportul participanților în format CSV ar facilita raportarea și comunicarea post-eveniment.",
            "Notificările email automate la cumpărare ar îmbunătăți experiența participanților.",
            "O aplicație mobilă sau PWA ar extinde accesibilitatea check-in-ului la intrarea în sală.",
            "Paginarea și caching-ul evenimentelor ar sprijini creșterea numărului de evenimente listate.",
            "Module dedicate evenimentelor sportive (echipe, program) ar completa nișa complementară deja suportată.",
        ],
    )
    add_body(
        doc,
        "Aplicația reprezintă o bază solidă pentru extindere într-un produs destinat organizatorilor de conferințe, "
        "concerte și meeting-uri, cu accent pe simplitate, securitate și experiența utilizatorului.",
    )


def build_bibliography(doc: Document) -> None:
    doc.add_heading("Referințe bibliografice", level=1)
    refs = [
        "[1] R. Fielding, Architectural Styles and the Design of Network-based Software Architectures, University of California, Irvine, 2000.",
        "[2] M. Fowler, Patterns of Enterprise Application Architecture, Addison-Wesley, 2002.",
        "[3] Meta Platforms, React Documentation, https://react.dev/, accesat 2026.",
        "[4] OWASP Foundation, Authentication Cheat Sheet, https://cheatsheetseries.owasp.org/, accesat 2026.",
        "[5] Stripe Inc., Stripe Checkout Documentation, https://stripe.com/docs, accesat 2026.",
        "[6] OpenJS Foundation, Express.js Guide, https://expressjs.com/, accesat 2026.",
        "[7] PostgreSQL Global Development Group, PostgreSQL Documentation, https://www.postgresql.org/docs/, accesat 2026.",
        "[8] M. Jones, J. Bradley, N. Sakimura, RFC 7519 — JSON Web Token (JWT), IETF, 2015.",
        "[9] N. Provos, D. Mazières, A Future-Adaptable Password Scheme, USENIX, 1999.",
        "[10] Eventbrite Inc., Eventbrite Platform, https://www.eventbrite.com/, accesat 2026.",
        "[11] MUI Team, Material UI Documentation, https://mui.com/, accesat 2026.",
        "[12] OpenJS Foundation, Node.js Documentation, https://nodejs.org/docs/, accesat 2026.",
    ]
    for ref in refs:
        p = doc.add_paragraph(ref)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.first_line_indent = Cm(0)
        for run in p.runs:
            run.font.name = "Times New Roman"
            run.font.size = Pt(12)

