"""
PDF and plain text extraction utilities.
Used by the resume analyzer to extract text from uploaded files.
"""

import io
from pdfminer.high_level import extract_text_to_fp
from pdfminer.layout import LAParams


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract plain text from a PDF file given as bytes."""
    try:
        output = io.StringIO()
        with io.BytesIO(file_bytes) as pdf_file:
            extract_text_to_fp(
                pdf_file,
                output,
                laparams=LAParams(),
                output_type="text",
                codec="utf-8",
            )
        return output.getvalue().strip()
    except Exception as e:
        print(f"[TextProcessor] PDF extraction error: {e}")
        return ""


def extract_text(file_bytes: bytes, mimetype: str) -> str:
    """Route file bytes to the appropriate text extractor."""
    if "pdf" in mimetype.lower():
        return extract_text_from_pdf(file_bytes)
    elif mimetype.startswith("text/"):
        return file_bytes.decode("utf-8", errors="ignore").strip()
    else:
        # Try PDF first, then raw text
        text = extract_text_from_pdf(file_bytes)
        if not text:
            text = file_bytes.decode("utf-8", errors="ignore").strip()
        return text


def clean_text(text: str) -> str:
    """Basic text cleaning for NLP processing."""
    import re
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^\w\s@.,()\-/&+#]", " ", text)
    return text.lower().strip()
