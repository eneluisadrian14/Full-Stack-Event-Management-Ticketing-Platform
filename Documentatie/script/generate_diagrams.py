# -*- coding: utf-8 -*-
"""Genereaza cele 6 diagrame ManFast in stil ISS/UML, pe fundal alb."""
from __future__ import annotations

from pathlib import Path

import matplotlib.patches as mpatches
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "diagrame"
DPI = 220

BG = "#ffffff"
PANEL = "#f8fbff"
PANEL_ALT = "#eef5ff"
ACCENT = "#0d47a1"
BORDER = "#1e5aa8"
TEXT = "#111827"
MUTED = "#566573"
SUCCESS = "#e8f5e9"
WARN = "#fff8e1"


def _ensure_dirs() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)


def _save_fig(name: str) -> None:
    path = OUT_DIR / name
    plt.savefig(path, dpi=DPI, facecolor=BG, bbox_inches="tight", edgecolor="none")
    plt.close()
    print(f"  {path}")


def _new_fig(width: float, height: float):
    fig, ax = plt.subplots(figsize=(width, height))
    fig.patch.set_facecolor(BG)
    ax.set_facecolor(BG)
    ax.axis("off")
    return fig, ax


def _box(ax, x, y, w, h, label, fc=PANEL, ec=BORDER, fontsize=9, lw=1.25, radius=0.03):
    rect = FancyBboxPatch(
        (x, y),
        w,
        h,
        boxstyle=f"round,pad=0.04,rounding_size={radius}",
        fc=fc,
        ec=ec,
        lw=lw,
    )
    ax.add_patch(rect)
    ax.text(x + w / 2, y + h / 2, label, ha="center", va="center", color=TEXT, fontsize=fontsize)
    return rect


def _arrow(ax, start, end, label="", color=ACCENT, lw=1.25, style="->", ls="-", fontsize=7.5):
    ax.annotate(
        "",
        xy=end,
        xytext=start,
        arrowprops=dict(arrowstyle=style, color=color, lw=lw, linestyle=ls, shrinkA=2, shrinkB=2),
    )
    if label:
        mx = (start[0] + end[0]) / 2
        my = (start[1] + end[1]) / 2
        ax.text(mx, my + 0.12, label, ha="center", va="center", color=MUTED, fontsize=fontsize)


def _actor(ax, x: float, y: float, label: str) -> None:
    ax.add_patch(plt.Circle((x, y + 0.75), 0.22, fill=False, ec=TEXT, lw=1.8))
    ax.plot([x, x], [y + 0.53, y - 0.25], color=TEXT, lw=1.8)
    ax.plot([x - 0.38, x + 0.38], [y + 0.25, y + 0.25], color=TEXT, lw=1.8)
    ax.plot([x, x - 0.34], [y - 0.25, y - 0.75], color=TEXT, lw=1.8)
    ax.plot([x, x + 0.34], [y - 0.25, y - 0.75], color=TEXT, lw=1.8)
    ax.text(x, y - 1.05, label, ha="center", va="center", color=TEXT, fontsize=9, fontweight="bold")


def _use_case(ax, x: float, y: float, label: str, w: float = 1.72, h: float = 0.72):
    ellipse = mpatches.Ellipse((x, y), w, h, fc="#ffffff", ec=BORDER, lw=1.15)
    ax.add_patch(ellipse)
    ax.text(x, y, label, ha="center", va="center", color=TEXT, fontsize=7.3)


def _relation_label(ax, start, end, label: str) -> None:
    mx = (start[0] + end[0]) / 2
    my = (start[1] + end[1]) / 2
    ax.text(mx, my + 0.1, label, ha="center", color=MUTED, fontsize=7, style="italic")


def draw_architecture() -> None:
    fig, ax = _new_fig(12, 7)
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 7.8)

    ax.text(6, 7.35, "Arhitectura sistemului ManFast", ha="center", color=ACCENT, fontsize=15, fontweight="bold")
    ax.text(6, 7.0, "Stil arhitectural: client-server, organizare stratificata", ha="center", color=MUTED, fontsize=9)

    layers = [
        (0.6, 5.45, 10.8, 1.15, "Strat prezentare", "Browser utilizator / administrator\nReact 19 + Vite + Material UI"),
        (0.6, 3.55, 10.8, 1.35, "Strat aplicatie", "Express API REST\n/api/auth  /api/events  /api/tickets\nmiddleware JWT + requireAdmin"),
        (0.6, 1.6, 10.8, 1.15, "Strat date", "PostgreSQL\nusers, events, tickets, password_reset_tokens, registration_verifications"),
    ]
    for x, y, w, h, title, body in layers:
        _box(ax, x, y, w, h, "", fc=PANEL, ec=BORDER, lw=1.4)
        ax.text(x + 0.28, y + h - 0.28, title, ha="left", va="center", color=ACCENT, fontsize=10, fontweight="bold")
        ax.text(x + w / 2, y + h / 2 - 0.08, body, ha="center", va="center", color=TEXT, fontsize=9)

    _box(ax, 0.9, 0.25, 2.5, 0.85, "Stripe Checkout\nplati card RON", fc="#ffffff", fontsize=8.5)
    _box(ax, 4.75, 0.25, 2.5, 0.85, "Brevo SMTP\ncod verificare / reset", fc="#ffffff", fontsize=8.5)
    _box(ax, 8.6, 0.25, 2.5, 0.85, "uploads/\nimagini evenimente", fc="#ffffff", fontsize=8.5)

    _arrow(ax, (6, 5.45), (6, 4.9), "HTTPS / JSON")
    _arrow(ax, (6, 3.55), (6, 2.75), "SQL")
    _arrow(ax, (4.4, 3.55), (2.15, 1.1), "checkout.sessions")
    _arrow(ax, (6.0, 3.55), (6.0, 1.1), "SMTP")
    _arrow(ax, (7.6, 3.55), (9.85, 1.1), "Multer / static")

    _save_fig("fig_arhitectura.png")


def draw_use_case() -> None:
    fig, ax = _new_fig(12.5, 7.4)
    ax.set_xlim(0, 12.5)
    ax.set_ylim(0, 7.4)
    ax.text(6.25, 7.05, "Diagrama cazurilor de utilizare", ha="center", color=ACCENT, fontsize=15, fontweight="bold")

    boundary = FancyBboxPatch((1.75, 0.55), 9.0, 5.95, boxstyle="round,pad=0.05", fc=PANEL, ec=BORDER, lw=1.4, ls="--")
    ax.add_patch(boundary)
    ax.text(6.25, 6.2, "Sistem ManFast", ha="center", color=ACCENT, fontsize=11, fontweight="bold")

    _actor(ax, 0.65, 4.8, "Utilizator")
    _actor(ax, 11.85, 2.0, "Administrator")

    cases = {
        "register": (3.0, 5.35, "Inregistrare cont\n+ verificare email"),
        "login": (5.55, 5.35, "Autentificare\nJWT"),
        "filter": (8.1, 5.35, "Filtrare\nevenimente"),
        "pay": (3.0, 4.08, "Cumparare bilet\nStripe"),
        "tickets": (5.55, 4.08, "Vizualizare\nBiletele mele"),
        "profile": (8.1, 4.08, "Gestionare\nprofil"),
        "events": (3.65, 2.08, "CRUD\nevenimente"),
        "participants": (6.25, 2.08, "Lista participanti\n+ check-in"),
        "admins": (8.85, 2.08, "Gestionare\nadministratori"),
        "email": (5.55, 6.0, "Transmitere\nemail"),
        "payment": (5.55, 3.18, "Procesare\nplata"),
    }

    for x, y, label in cases.values():
        _use_case(ax, x, y, label)

    user_targets = ["register", "login", "filter", "pay", "tickets", "profile"]
    admin_targets = ["login", "events", "participants", "admins"]
    for key in user_targets:
        x, y, _ = cases[key]
        ax.plot([1.1, x - 0.86], [4.8, y], color=MUTED, lw=0.75, alpha=0.75)
    for key in admin_targets:
        x, y, _ = cases[key]
        ax.plot([11.4, x + 0.86], [2.0, y], color=MUTED, lw=0.75, alpha=0.75)

    for source, target, label in [
        ("register", "email", "<<include>>"),
        ("pay", "payment", "<<include>>"),
        ("participants", "events", "<<extend>>"),
    ]:
        x1, y1, _ = cases[source]
        x2, y2, _ = cases[target]
        direction = 1 if x2 >= x1 else -1
        _arrow(ax, (x1 + direction * 0.86, y1), (x2 - direction * 0.86, y2), color=MUTED, ls="--", style="->")
        _relation_label(ax, (x1, y1), (x2, y2), label)

    _save_fig("fig_use_case.png")


def _draw_sequence(ax, actors: list[tuple[str, float]], top: float, bottom: float) -> None:
    for label, x in actors:
        _box(ax, x - 0.62, top - 0.38, 1.24, 0.5, label, fc=PANEL_ALT, fontsize=8.2, radius=0.02)
        ax.plot([x, x], [bottom, top - 0.42], color=MUTED, ls="--", lw=1)


def _activation(ax, x: float, y_top: float, y_bottom: float) -> None:
    ax.add_patch(mpatches.Rectangle((x - 0.045, y_bottom), 0.09, y_top - y_bottom, fc="#ffffff", ec=BORDER, lw=0.8))


def _message(ax, x1: float, x2: float, y: float, label: str, dashed: bool = False) -> None:
    style = "->"
    ls = "--" if dashed else "-"
    _arrow(ax, (x1, y), (x2, y), label, color=ACCENT if not dashed else MUTED, lw=1.15, style=style, ls=ls, fontsize=7.1)


def draw_sequence_register() -> None:
    fig, ax = _new_fig(12.5, 7.0)
    ax.set_xlim(0, 12.5)
    ax.set_ylim(0, 7.0)
    ax.text(6.25, 6.65, "Diagrama de secventa - inregistrare cu verificare email", ha="center", color=ACCENT, fontsize=14, fontweight="bold")

    actors = [("Frontend", 1.2), ("Backend", 4.0), ("PostgreSQL", 7.1), ("SMTP", 10.2)]
    _draw_sequence(ax, actors, top=6.25, bottom=0.6)
    for x, y1, y2 in [(4.0, 5.75, 1.6), (7.1, 5.1, 2.15), (10.2, 4.75, 4.25)]:
        _activation(ax, x, y1, y2)

    messages = [
        (1.2, 4.0, 5.55, "POST /api/auth/register"),
        (4.0, 7.1, 5.05, "SELECT duplicate + INSERT/UPDATE registration_verifications"),
        (4.0, 10.2, 4.55, "trimite cod 6 cifre"),
        (10.2, 4.0, 4.05, "email acceptat", True),
        (4.0, 1.2, 3.55, "requiresVerification", True),
        (1.2, 4.0, 2.9, "POST /api/auth/register/verify"),
        (4.0, 7.1, 2.4, "SELECT code_hash valid + INSERT users"),
        (4.0, 7.1, 1.9, "DELETE registration_verifications"),
        (4.0, 1.2, 1.35, "201 Cont creat", True),
    ]
    for x1, x2, y, label, *rest in messages:
        _message(ax, x1, x2, y, label, bool(rest and rest[0]))

    _save_fig("fig_seq_register.png")


def draw_sequence_payment() -> None:
    fig, ax = _new_fig(13, 7.5)
    ax.set_xlim(0, 13)
    ax.set_ylim(0, 7.5)
    ax.text(6.5, 7.15, "Diagrama de secventa - plata Stripe", ha="center", color=ACCENT, fontsize=14, fontweight="bold")

    actors = [("Utilizator", 0.8), ("Frontend", 2.7), ("Backend", 5.0), ("Stripe", 7.9), ("PostgreSQL", 10.9)]
    _draw_sequence(ax, actors, top=6.7, bottom=0.55)
    for x, y1, y2 in [(2.7, 6.05, 1.3), (5.0, 6.2, 1.15), (7.9, 5.75, 2.4), (10.9, 2.65, 1.6)]:
        _activation(ax, x, y1, y2)

    messages = [
        (2.7, 5.0, 6.0, "POST /create-checkout-session (JWT, event_id, nume)"),
        (5.0, 10.9, 5.55, "SELECT event + verifica locuri"),
        (5.0, 7.9, 5.1, "checkout.sessions.create(metadata)"),
        (7.9, 5.0, 4.65, "session.id + session.url", True),
        (5.0, 2.7, 4.2, "URL redirect", True),
        (0.8, 7.9, 3.7, "plata card in pagina gazduita Stripe"),
        (2.7, 5.0, 3.05, "POST /confirm-payment(session_id)"),
        (5.0, 7.9, 2.6, "sessions.retrieve"),
        (7.9, 5.0, 2.15, "payment_status = paid", True),
        (5.0, 10.9, 1.7, "BEGIN; INSERT tickets; UPDATE locuri; COMMIT"),
        (5.0, 2.7, 1.15, "succes - bilete emise", True),
    ]
    for x1, x2, y, label, *rest in messages:
        _message(ax, x1, x2, y, label, bool(rest and rest[0]))

    _save_fig("fig_seq_payment.png")


def draw_activity_checkin() -> None:
    fig, ax = _new_fig(11.5, 8.3)
    ax.set_xlim(0, 11.5)
    ax.set_ylim(0, 8.3)
    ax.text(5.75, 7.95, "Diagrama de activitate - check-in administrator", ha="center", color=ACCENT, fontsize=14, fontweight="bold")

    lanes = [(0.4, 0.45, 3.45, "Administrator"), (3.85, 0.45, 3.45, "Frontend"), (7.3, 0.45, 3.75, "Backend + DB")]
    for x, y, w, label in lanes:
        ax.add_patch(mpatches.Rectangle((x, y), w, 6.95, fc="#ffffff", ec="#b0bec5", lw=0.9))
        ax.add_patch(mpatches.Rectangle((x, 7.05), w, 0.35, fc=PANEL_ALT, ec="#b0bec5", lw=0.9))
        ax.text(x + w / 2, 7.22, label, ha="center", va="center", color=ACCENT, fontsize=9, fontweight="bold")

    def start(x, y):
        ax.add_patch(plt.Circle((x, y), 0.18, fc=TEXT, ec=TEXT))

    def end(x, y):
        ax.add_patch(plt.Circle((x, y), 0.24, fill=False, ec=TEXT, lw=1.5))
        ax.add_patch(plt.Circle((x, y), 0.14, fc=TEXT, ec=TEXT))

    def action(x, y, text, w=2.25):
        _box(ax, x - w / 2, y - 0.28, w, 0.56, text, fc=PANEL, fontsize=7.8, radius=0.02)

    def decision(x, y, text):
        poly = plt.Polygon([(x, y + 0.48), (x + 0.82, y), (x, y - 0.48), (x - 0.82, y)], closed=True, fc=WARN, ec=BORDER, lw=1.1)
        ax.add_patch(poly)
        ax.text(x, y, text, ha="center", va="center", color=TEXT, fontsize=7.3)

    start(2.1, 6.55)
    action(2.1, 5.85, "Selecteaza eveniment")
    action(5.55, 5.25, "Solicita lista\nparticipanti")
    action(9.15, 4.65, "GET participanti\nJOIN tickets/events")
    action(5.55, 4.05, "Afiseaza lista\nparticipanti")
    action(2.1, 3.45, "Alege participant\npentru check-in")
    decision(5.55, 2.75, "Bilet\nvalid?")
    action(9.15, 2.05, "PATCH /tickets/:id/checkin\ncheck_in = true", w=2.8)
    action(5.55, 1.35, "Actualizeaza UI\nsi status bilet")
    action(2.1, 1.35, "Mesaj eroare")
    end(5.55, 0.75)

    flows = [
        ((2.1, 6.35), (2.1, 6.13), ""),
        ((2.1, 5.57), (5.55, 5.53), ""),
        ((5.55, 4.97), (9.15, 4.93), ""),
        ((9.15, 4.37), (5.55, 4.33), ""),
        ((5.55, 3.77), (2.1, 3.73), ""),
        ((2.1, 3.17), (4.75, 2.75), ""),
        ((6.37, 2.75), (9.15, 2.33), "Da"),
        ((9.15, 1.77), (5.55, 1.63), ""),
        ((5.55, 1.07), (5.55, 0.99), ""),
        ((4.73, 2.75), (2.1, 1.63), "Nu"),
        ((2.1, 1.07), (5.31, 0.75), ""),
    ]
    for start_pt, end_pt, label in flows:
        _arrow(ax, start_pt, end_pt, label, color=MUTED, lw=1.05, fontsize=7)

    _save_fig("fig_activity_checkin.png")


def draw_erd() -> None:
    fig, ax = _new_fig(13, 8.5)
    ax.set_xlim(0, 13)
    ax.set_ylim(0, 8.5)
    ax.text(6.5, 8.15, "Model de domeniu / diagrama entitate-relatie", ha="center", color=ACCENT, fontsize=14, fontweight="bold")

    def entity(name: str, x: float, y: float, fields: list[str], w: float = 3.25):
        h = 0.42 + len(fields) * 0.28 + 0.25
        ax.add_patch(mpatches.Rectangle((x, y), w, h, fc="#ffffff", ec=BORDER, lw=1.15))
        ax.add_patch(mpatches.Rectangle((x, y + h - 0.42), w, 0.42, fc=PANEL_ALT, ec=BORDER, lw=1.15))
        ax.text(x + w / 2, y + h - 0.21, name, ha="center", va="center", color=ACCENT, fontsize=9.5, fontweight="bold")
        for i, field in enumerate(fields):
            ax.text(x + 0.12, y + h - 0.68 - i * 0.28, field, ha="left", va="center", color=TEXT, fontsize=7.2)
        return (x, y, w, h)

    users = entity("users", 0.45, 5.25, ["PK id", "username UNIQUE", "email UNIQUE", "password_hash", "numar_telefon UNIQUE", "role"])
    tickets = entity("tickets", 4.85, 5.25, ["PK id", "FK event_id", "FK user_id NULL", "nume_buletin", "stripe_session_id", "check_in"])
    events = entity("events", 9.05, 5.1, ["PK id", "titlu", "data_eveniment", "judet, localitate", "pret", "locuri_totale", "locuri_disponibile", "imagini[]"])
    resets = entity("password_reset_tokens", 0.45, 1.45, ["PK id", "FK user_id", "token_hash", "expires_at", "used_at"])
    verifications = entity("registration_verifications", 4.85, 1.25, ["PK id", "email UNIQUE", "username UNIQUE", "numar_telefon UNIQUE", "password_hash", "code_hash", "expires_at"])

    def center_right(box):
        x, y, w, h = box
        return (x + w, y + h / 2)

    def center_left(box):
        x, y, _, h = box
        return (x, y + h / 2)

    def center_bottom(box):
        x, y, w, _ = box
        return (x + w / 2, y)

    def center_top(box):
        x, y, w, h = box
        return (x + w / 2, y + h)

    _arrow(ax, center_right(users), center_left(tickets), color=MUTED, style="-")
    ax.text(3.55, 6.65, "1  ->  0..N", ha="center", color=MUTED, fontsize=7)
    ax.text(3.55, 6.4, "ON DELETE SET NULL", ha="center", color=MUTED, fontsize=6.7)

    _arrow(ax, center_left(events), center_right(tickets), color=MUTED, style="-")
    ax.text(8.05, 6.65, "1  ->  0..N", ha="center", color=MUTED, fontsize=7)
    ax.text(8.05, 6.4, "ON DELETE CASCADE", ha="center", color=MUTED, fontsize=6.7)

    _arrow(ax, center_bottom(users), center_top(resets), color=MUTED, style="-")
    ax.text(1.9, 4.15, "1  ->  0..N", ha="center", color=MUTED, fontsize=7)
    ax.plot([6.48, 6.48], [4.0, 4.6], color=MUTED, lw=1.0, ls=":")
    ax.text(7.2, 4.55, "date inainte de confirmare", ha="left", va="center", color=MUTED, fontsize=7)
    ax.text(7.2, 4.25, "tabel temporar, fara FK catre users", ha="left", va="center", color=MUTED, fontsize=7, style="italic")
    _arrow(ax, center_top(verifications), (6.48, 4.6), color=MUTED, style="-", ls=":")

    _save_fig("fig_erd.png")


def main() -> None:
    _ensure_dirs()
    print("Generare diagrame ISS ManFast (tema light, DPI 220)...")
    draw_architecture()
    draw_use_case()
    draw_sequence_register()
    draw_sequence_payment()
    draw_activity_checkin()
    draw_erd()
    print("Gata - 6 fisiere PNG in:")
    print(f"  {OUT_DIR}")


if __name__ == "__main__":
    main()
