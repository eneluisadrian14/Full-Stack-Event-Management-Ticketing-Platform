"""Generează diagrame și capturi placeholder pentru documentația de licență ManFast."""
from __future__ import annotations

import os
from pathlib import Path

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
DIAG = ROOT / "diagrame"
IMG = ROOT / "imagini"

BG = "#0a1628"
PANEL = "#132337"
ACCENT = "#00bcd4"
TEXT = "#e8f4f8"
MUTED = "#8ba3b5"


def _ensure_dirs() -> None:
    DIAG.mkdir(parents=True, exist_ok=True)
    IMG.mkdir(parents=True, exist_ok=True)


def _save_fig(name: str) -> None:
    path = DIAG / name
    plt.tight_layout()
    plt.savefig(path, dpi=160, facecolor=BG, bbox_inches="tight")
    plt.close()
    print(f"  Diagrama: {path.name}")


def draw_architecture() -> None:
    fig, ax = plt.subplots(figsize=(11, 6))
    fig.patch.set_facecolor(BG)
    ax.set_facecolor(BG)
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 7)
    ax.axis("off")

    boxes = [
        (0.6, 4.2, 2.4, 1.2, "Browser\n(React + MUI)"),
        (4.0, 4.2, 2.6, 1.2, "API REST\n(Express.js)"),
        (7.6, 4.2, 2.2, 1.2, "PostgreSQL\n(bază de date)"),
        (4.0, 1.6, 2.6, 1.2, "Servicii externe"),
        (2.2, 0.4, 2.0, 0.9, "Stripe\n(plăți)"),
        (6.4, 0.4, 2.0, 0.9, "Brevo SMTP\n(email)"),
    ]
    for x, y, w, h, label in boxes:
        rect = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.05", fc=PANEL, ec=ACCENT, lw=1.5)
        ax.add_patch(rect)
        ax.text(x + w / 2, y + h / 2, label, ha="center", va="center", color=TEXT, fontsize=10)

    arrows = [
        ((3.0, 4.8), (4.0, 4.8), "HTTPS / JSON"),
        ((6.6, 4.8), (7.6, 4.8), "SQL"),
        ((5.3, 4.2), (5.3, 2.8), "API calls"),
        ((4.8, 1.6), (3.2, 1.3), ""),
        ((6.0, 1.6), (7.4, 1.3), ""),
    ]
    for start, end, label in arrows:
        ax.annotate("", xy=end, xytext=start, arrowprops=dict(arrowstyle="->", color=ACCENT, lw=1.5))
        if label:
            mx, my = (start[0] + end[0]) / 2, (start[1] + end[1]) / 2
            ax.text(mx, my + 0.15, label, ha="center", color=MUTED, fontsize=8)

    ax.set_title("Arhitectura sistemului ManFast", color=ACCENT, fontsize=14, pad=12)
    _save_fig("fig_arhitectura.png")


def draw_erd() -> None:
    fig, ax = plt.subplots(figsize=(12, 7))
    fig.patch.set_facecolor(BG)
    ax.set_facecolor(BG)
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 9)
    ax.axis("off")

    entities = {
        "users": (0.8, 5.5, ["id PK", "username", "email", "password_hash", "numar_telefon", "role"]),
        "events": (5.5, 5.5, ["id PK", "titlu", "data_eveniment", "judet", "localitate", "pret", "locuri_*"]),
        "tickets": (10.0, 5.5, ["id PK", "event_id FK", "user_id FK", "nume_buletin", "check_in"]),
        "password_reset_tokens": (0.8, 1.5, ["id PK", "user_id FK", "token_hash", "expires_at"]),
        "registration_verifications": (5.5, 1.5, ["email PK", "username", "code_hash", "expires_at"]),
    }
    positions = {}
    for name, (x, y, fields) in entities.items():
        h = 0.35 * len(fields) + 0.5
        rect = FancyBboxPatch((x, y), 3.2, h, boxstyle="round,pad=0.04", fc=PANEL, ec=ACCENT, lw=1.2)
        ax.add_patch(rect)
        ax.text(x + 1.6, y + h - 0.25, name, ha="center", color=ACCENT, fontsize=10, fontweight="bold")
        for i, f in enumerate(fields):
            ax.text(x + 0.15, y + h - 0.55 - i * 0.32, f, color=TEXT, fontsize=8)
        positions[name] = (x + 1.6, y + h / 2)

    rels = [
        ("users", "tickets", "1:N"),
        ("events", "tickets", "1:N"),
        ("users", "password_reset_tokens", "1:N"),
    ]
    for a, b, card in rels:
        x1, y1 = positions[a]
        x2, y2 = positions[b]
        ax.annotate("", xy=(x2 - 0.5, y2), xytext=(x1 + 0.5, y1),
                    arrowprops=dict(arrowstyle="-|>", color=MUTED, lw=1.2))
        ax.text((x1 + x2) / 2, (y1 + y2) / 2 + 0.2, card, color=MUTED, fontsize=8)

    ax.set_title("Diagrama entitate-relație (ERD)", color=ACCENT, fontsize=14, pad=12)
    _save_fig("fig_erd.png")


def draw_use_case() -> None:
    fig, ax = plt.subplots(figsize=(11, 6))
    fig.patch.set_facecolor(BG)
    ax.set_facecolor(BG)
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 7)
    ax.axis("off")

    system = FancyBboxPatch((2.5, 0.8), 7.0, 5.4, boxstyle="round,pad=0.06", fc=PANEL, ec=ACCENT, lw=1.5, ls="--")
    ax.add_patch(system)
    ax.text(6.0, 6.0, "Sistem ManFast", ha="center", color=ACCENT, fontsize=12)

    cases = [
        (3.2, 5.0, "Înregistrare\n+ verificare email"),
        (5.0, 5.0, "Autentificare"),
        (6.8, 5.0, "Cumpărare\nbilet Stripe"),
        (4.1, 3.5, "Vizualizare\nevenimente"),
        (5.9, 3.5, "Gestionare\nprofil"),
        (7.7, 3.5, "Biletele mele"),
        (4.5, 2.0, "CRUD\nevenimente"),
        (6.3, 2.0, "Check-in\nparticipanți"),
        (8.1, 2.0, "Gestionare\nadmini"),
    ]
    for x, y, label in cases:
        e = mpatches.Ellipse((x, y), 1.6, 0.9, fc="#1a3348", ec=ACCENT, lw=1)
        ax.add_patch(e)
        ax.text(x, y, label, ha="center", va="center", color=TEXT, fontsize=7)

    actors = [("Utilizator", 0.8, 3.8), ("Administrator", 0.8, 1.8)]
    for name, x, y in actors:
        ax.plot([x, x], [y - 0.5, y + 0.5], color=TEXT, lw=2)
        ax.plot([x - 0.35, x + 0.35], [y + 0.5, y + 0.5], color=TEXT, lw=2)
        circle = plt.Circle((x, y + 0.85), 0.28, fill=False, ec=TEXT, lw=2)
        ax.add_patch(circle)
        ax.text(x, y - 0.9, name, ha="center", color=TEXT, fontsize=9)
        for cx, cy, _ in cases:
            if (name == "Utilizator" and cy >= 3.0) or (name == "Administrator" and cy < 3.0):
                ax.plot([x + 0.35, cx - 0.8], [y, cy], color=MUTED, lw=0.8, alpha=0.6)

    ax.set_title("Diagrama cazurilor de utilizare", color=ACCENT, fontsize=14, pad=12)
    _save_fig("fig_use_case.png")


def draw_sequence_register() -> None:
    fig, ax = plt.subplots(figsize=(11, 5.5))
    fig.patch.set_facecolor(BG)
    ax.set_facecolor(BG)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 8)
    ax.axis("off")

    actors = [("Frontend", 1.5), ("Backend", 4.0), ("PostgreSQL", 6.5), ("SMTP", 8.5)]
    for name, x in actors:
        ax.text(x, 7.5, name, ha="center", color=ACCENT, fontsize=10)
        ax.plot([x, x], [0.5, 7.0], color=MUTED, ls="--", lw=1)

    steps = [
        (1.2, 6.8, "POST /register"),
        (1.2, 6.2, "Salvare registration_verifications"),
        (1.2, 5.6, "Trimite cod 6 cifre"),
        (1.2, 4.8, "POST /register/verify"),
        (1.2, 4.2, "Validare cod + INSERT users"),
    ]
    y = 6.8
    pairs = [(1.5, 4.0), (4.0, 6.5), (4.0, 8.5), (1.5, 4.0), (4.0, 6.5)]
    labels = ["Date înregistrare", "Stocare temporară", "Email verificare", "Cod + email", "Creare cont"]
    for i, ((x1, x2), label) in enumerate(zip(pairs, labels)):
        yy = 6.8 - i * 0.65
        ax.annotate("", xy=(x2, yy), xytext=(x1, yy), arrowprops=dict(arrowstyle="->", color=ACCENT, lw=1.3))
        ax.text(5.0, yy + 0.12, label, ha="center", color=TEXT, fontsize=8)

    ax.set_title("Diagramă de secvență — înregistrare cu verificare email", color=ACCENT, fontsize=13, pad=10)
    _save_fig("fig_seq_register.png")


def draw_sequence_payment() -> None:
    fig, ax = plt.subplots(figsize=(11, 5.5))
    fig.patch.set_facecolor(BG)
    ax.set_facecolor(BG)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 8)
    ax.axis("off")

    actors = [("Utilizator", 1.2), ("Frontend", 3.0), ("Backend", 5.0), ("Stripe", 7.0), ("DB", 8.8)]
    for name, x in actors:
        ax.text(x, 7.5, name, ha="center", color=ACCENT, fontsize=9)
        ax.plot([x, x], [0.5, 7.0], color=MUTED, ls="--", lw=1)

    pairs = [(3.0, 5.0), (5.0, 7.0), (3.0, 5.0), (5.0, 8.8), (3.0, 5.0)]
    labels = ["Checkout session", "Redirect plată", "Confirm payment", "Inserare bilete", "Succes"]
    for i, ((x1, x2), label) in enumerate(zip(pairs, labels)):
        yy = 6.8 - i * 0.7
        ax.annotate("", xy=(x2, yy), xytext=(x1, yy), arrowprops=dict(arrowstyle="->", color=ACCENT, lw=1.3))
        ax.text((x1 + x2) / 2, yy + 0.12, label, ha="center", color=TEXT, fontsize=8)

    ax.set_title("Diagramă de secvență — cumpărare bilet Stripe", color=ACCENT, fontsize=13, pad=10)
    _save_fig("fig_seq_payment.png")


def draw_activity_checkin() -> None:
    fig, ax = plt.subplots(figsize=(8, 7))
    fig.patch.set_facecolor(BG)
    ax.set_facecolor(BG)
    ax.set_xlim(0, 8)
    ax.set_ylim(0, 9)
    ax.axis("off")

    nodes = [
        (4, 8.2, "start", "Admin deschide\npanoul"),
        (4, 7.0, "proc", "Selectează eveniment"),
        (4, 5.8, "proc", "Vizualizează\nparticipanți"),
        (4, 4.6, "dec", "Bilet valid?"),
        (2, 3.2, "proc", "Marchează check-in"),
        (6, 3.2, "proc", "Afișează eroare"),
        (4, 1.8, "end", "Actualizare listă"),
    ]
    for x, y, kind, label in nodes:
        if kind == "dec":
            diamond = plt.Polygon([(x, y + 0.45), (x + 0.7, y), (x, y - 0.45), (x - 0.7, y)], closed=True, fc=PANEL, ec=ACCENT)
            ax.add_patch(diamond)
        elif kind == "start" or kind == "end":
            e = mpatches.Ellipse((x, y), 1.8, 0.7, fc=PANEL, ec=ACCENT)
            ax.add_patch(e)
        else:
            rect = FancyBboxPatch((x - 1.0, y - 0.35), 2.0, 0.7, boxstyle="round,pad=0.03", fc=PANEL, ec=ACCENT)
            ax.add_patch(rect)
        ax.text(x, y, label, ha="center", va="center", color=TEXT, fontsize=8)

    flow = [(4, 8.2, 4, 7.0), (4, 7.0, 4, 5.8), (4, 5.8, 4, 4.6), (4, 4.6, 2, 3.2), (2, 3.2, 4, 1.8), (4, 4.6, 6, 3.2)]
    for x1, y1, x2, y2 in flow:
        ax.annotate("", xy=(x2, y2 + 0.35), xytext=(x1, y1 - 0.35), arrowprops=dict(arrowstyle="->", color=MUTED, lw=1.2))

    ax.text(2.8, 3.9, "Da", color=MUTED, fontsize=8)
    ax.text(5.2, 3.9, "Nu", color=MUTED, fontsize=8)
    ax.set_title("Diagramă de activitate — check-in admin", color=ACCENT, fontsize=13, pad=10)
    _save_fig("fig_activity_checkin.png")


def _font(size: int = 16):
    try:
        return ImageFont.truetype("segoeui.ttf", size)
    except OSError:
        return ImageFont.load_default()


def draw_ui_mock(filename: str, title: str, subtitle: str, elements: list[str]) -> None:
    w, h = 1280, 720
    img = Image.new("RGB", (w, h), BG)
    draw = ImageDraw.Draw(img)
    title_f = _font(28)
    sub_f = _font(16)
    el_f = _font(14)

    draw.rectangle([0, 0, w, 56], fill=PANEL)
    draw.text((24, 14), "ManFast", fill=ACCENT, font=title_f)
    draw.text((w // 2 - 120, 80), title, fill=TEXT, font=title_f)
    draw.text((w // 2 - len(subtitle) * 4, 120), subtitle, fill=MUTED, font=sub_f)

    card_y = 170
    for el in elements:
        draw.rounded_rectangle([80, card_y, w - 80, card_y + 48], radius=10, fill=PANEL, outline=ACCENT)
        draw.text((100, card_y + 14), el, fill=TEXT, font=el_f)
        card_y += 58

    img.save(IMG / filename)
    print(f"  Captura: {filename}")


def draw_all_screenshots() -> None:
    mocks = [
        ("fig_home.png", "Pagina principală", "Listă evenimente + filtre", ["Filtru: nume eveniment", "Filtru: județ (dropdown 42 județe)", "Filtru: dată", "Card eveniment: titlu, locație, preț, locuri"]),
        ("fig_event_details.png", "Detalii eveniment", "Informații + cumpărare bilet", ["Galerie imagini", "Descriere, dată, județ, localitate", "Formular nume participanți (bilete nominale)", "Buton: Plătește cu Stripe"]),
        ("fig_register.png", "Înregistrare", "Pas 1 — formular cont", ["Username, email, telefon, parolă", "Buton: Creează cont"]),
        ("fig_register_verify.png", "Verificare email", "Pas 2 — cod 6 cifre", ["Câmp cod de verificare", "Retrimite cod / Înapoi la formular"]),
        ("fig_login.png", "Autentificare", "Login JWT", ["Email, parolă", "Link: Am uitat parola", "Link: Înregistrează-te"]),
        ("fig_my_tickets.png", "Biletele mele", "Bilete viitoare și trecute", ["Card bilet: eveniment, participant, status", "Status: Plătit / Check-in / Expirat"]),
        ("fig_profile.png", "Profil utilizator", "Editare + securitate", ["Editare username, email, telefon", "Schimbare parolă", "Zonă periculoasă: ștergere cont"]),
        ("fig_payment_success.png", "Plată reușită", "Confirmare Stripe", ["Mesaj succes", "Redirect către biletele mele"]),
        ("fig_admin_dashboard.png", "Panou Admin", "Gestionare evenimente", ["Listă evenimente admin", "Creare / editare / ștergere", "Tab participanți + check-in"]),
        ("fig_admin_event.png", "Editare eveniment", "Dialog admin", ["Upload imagini (max 8)", "Județ + localitate + locație", "Preț, locuri, durată"]),
        ("fig_admin_admins.png", "Gestionare admini", "Promovare / revocare", ["Email utilizator", "Parolă autorizare", "Confirmare acțiune"]),
    ]
    for fname, title, sub, els in mocks:
        draw_ui_mock(fname, title, sub, els)


def main() -> None:
    _ensure_dirs()
    print("Generare diagrame...")
    draw_architecture()
    draw_erd()
    draw_use_case()
    draw_sequence_register()
    draw_sequence_payment()
    draw_activity_checkin()
    print("Generare capturi UI...")
    draw_all_screenshots()
    print("Gata.")


if __name__ == "__main__":
    main()
