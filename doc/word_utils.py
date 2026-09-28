# -*- coding: utf-8 -*-
"""Utilitare formatare Word pentru licență FMI Ovidius."""
from __future__ import annotations

from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

DOC_DIR = Path(__file__).resolve().parent
FIG_DIR = DOC_DIR / "figuri"


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
    p.paragraph_format.line_spacing = 1.6
    p.paragraph_format.space_after = Pt(8)
    if first_indent:
        p.paragraph_format.first_line_indent = Cm(1.0)
    for run in p.runs:
        run.font.name = "Times New Roman"
        run.font.size = Pt(12)


def add_bullets(doc: Document, items: list[str]) -> None:
    for item in items:
        p = doc.add_paragraph(item, style="List Bullet")
        p.paragraph_format.left_indent = Cm(1.0)
        p.paragraph_format.space_after = Pt(4)
        for run in p.runs:
            run.font.name = "Times New Roman"
            run.font.size = Pt(12)


def add_numbered(doc: Document, items: list[str]) -> None:
    for item in items:
        p = doc.add_paragraph(item, style="List Number")
        p.paragraph_format.left_indent = Cm(1.0)
        p.paragraph_format.space_after = Pt(4)
        for run in p.runs:
            run.font.name = "Times New Roman"
            run.font.size = Pt(12)


def add_code(doc: Document, code: str) -> None:
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Cm(0.5)
    p.paragraph_format.space_after = Pt(8)
    run = p.add_run(code)
    run.font.name = "Consolas"
    run.font.size = Pt(9)


def add_table(doc: Document, headers: list[str], rows: list[list[str]]) -> None:
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.style = "Table Grid"
    hdr = table.rows[0].cells
    for i, h in enumerate(headers):
        hdr[i].text = h
        for para in hdr[i].paragraphs:
            for r in para.runs:
                r.bold = True
                r.font.name = "Times New Roman"
                r.font.size = Pt(10)
    for ri, row in enumerate(rows):
        cells = table.rows[ri + 1].cells
        for ci, val in enumerate(row):
            cells[ci].text = val
            for para in cells[ci].paragraphs:
                for r in para.runs:
                    r.font.name = "Times New Roman"
                    r.font.size = Pt(10)
    doc.add_paragraph()


def add_figure(doc: Document, path: Path, caption: str, width_cm: float = 14.0) -> None:
    if path.exists():
        doc.add_picture(str(path), width=Cm(width_cm))
        doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER
    else:
        add_figure_placeholder(doc, caption.split("—")[0].strip() if "—" in caption else caption)
        return
    cap = doc.add_paragraph(caption)
    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cap.paragraph_format.space_after = Pt(12)
    for run in cap.runs:
        run.font.name = "Times New Roman"
        run.font.size = Pt(11)
        run.italic = True


def add_figure_placeholder(doc: Document, label: str, height_cm: float = 5.5) -> None:
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cell = table.rows[0].cells[0]
    cell.text = ""
    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run(f"[Spațiu figură: {label}]")
    run.font.name = "Times New Roman"
    run.font.size = Pt(10)
    run.italic = True
    # Spacer paragraphs for visual height (~8 cm equivalent)
    for _ in range(14):
        spacer = cell.add_paragraph("")
        spacer.paragraph_format.space_after = Pt(22)
    doc.add_paragraph()


def add_caption(doc: Document, caption: str) -> None:
    cap = doc.add_paragraph(caption)
    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cap.paragraph_format.space_after = Pt(12)
    for run in cap.runs:
        run.font.name = "Times New Roman"
        run.font.size = Pt(11)
        run.italic = True


def add_toc(doc: Document) -> None:
    doc.add_heading("Cuprins", level=1)
    p = doc.add_paragraph()
    run = p.add_run()
    fld_begin = OxmlElement("w:fldChar")
    fld_begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = ' TOC \\o "1-3" \\h \\z \\u '
    fld_sep = OxmlElement("w:fldChar")
    fld_sep.set(qn("w:fldCharType"), "separate")
    fld_end = OxmlElement("w:fldChar")
    fld_end.set(qn("w:fldCharType"), "end")
    run._r.append(fld_begin)
    run._r.append(instr)
    run._r.append(fld_sep)
    run._r.append(fld_end)
    doc.add_page_break()


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
