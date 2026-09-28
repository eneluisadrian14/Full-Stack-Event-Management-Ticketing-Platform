# -*- coding: utf-8 -*-
"""Generează LICENTA.docx (~55 pagini) din conținut pozitiv filtrat."""
from __future__ import annotations

import json
import sys
from pathlib import Path

from docx import Document

DOC_DIR = Path(__file__).resolve().parent
if str(DOC_DIR) not in sys.path:
    sys.path.insert(0, str(DOC_DIR))

from content_chapters import (
    build_bibliography,
    build_chapter1,
    build_chapter2,
    build_chapter3,
    build_chapter4,
    build_chapter5,
    build_rezumat,
    extend_chapter1,
)
from content_extend import extend_chapter2, extend_chapter3, extend_chapter4, extend_padding, extend_final
from word_utils import add_toc, cover_page, setup_styles

OUT = DOC_DIR / "LICENTA.docx"
META_PATH = DOC_DIR / "metadata.json"


def load_meta() -> dict:
    with open(META_PATH, encoding="utf-8") as f:
        return json.load(f)


def main() -> None:
    meta = load_meta()
    doc = Document()
    setup_styles(doc)

    cover_page(doc, meta)
    build_rezumat(doc, meta)
    add_toc(doc)

    build_chapter1(doc)
    extend_chapter1(doc)
    doc.add_page_break()
    build_chapter2(doc)
    extend_chapter2(doc)
    doc.add_page_break()
    doc.add_page_break()
    build_chapter3(doc)
    extend_chapter3(doc)
    extend_padding(doc)
    doc.add_page_break()
    doc.add_page_break()
    build_chapter4(doc)
    extend_chapter4(doc)
    extend_final(doc)
    doc.add_page_break()
    build_chapter5(doc)
    doc.add_page_break()
    build_bibliography(doc)

    doc.save(OUT)
    print(f"Document salvat: {OUT}")
    print(f"Dimensiune: {OUT.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
