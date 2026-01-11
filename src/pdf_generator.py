import datetime
from typing import Dict, List

from reportlab.platypus import (
    SimpleDocTemplate,
    Table,
    TableStyle,
    Paragraph,
    Spacer,
    Image,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from typing import List, Dict
import datetime


class PDFGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.styles.add(
            ParagraphStyle(
                name="ANC_Title",
                parent=self.styles["Heading1"],
                fontSize=24,
                textColor=colors.HexColor("#3b82f6"),  # ANC Blue
                spaceAfter=20,
                alignment=1,  # Center
            )
        )
        self.styles.add(
            ParagraphStyle(name="ANC_Label", fontSize=10, textColor=colors.gray)
        )

    def generate_proposal(
        self,
        project_data: List[Dict],
        client_name: str,
        filename: str = "anc_client_proposal.pdf",
    ):
        # FORCE WIDE LAYOUT: 0.4 inch (28pt) margins.
        # Letter width = 612pt. Printable width = 612 - 56 = 556pt.
        doc = SimpleDocTemplate(
            filename,
            pagesize=LETTER,
            topMargin=30,
            bottomMargin=30,
            leftMargin=28,
            rightMargin=28,
        )
        elements = []

        # 1. Header with Logo Area
        elements.append(Paragraph("ANC SPORTS ENTERPRISES", self.styles["ANC_Title"]))
        elements.append(Paragraph("SALES QUOTATION", self.styles["Heading2"]))

        # VISUAL DEBUG: Full width line to prove margins
        elements.append(
            Image("https://placehold.co/550x5/3b82f6/3b82f6.png", width=556, height=5)
        )
        elements.append(Spacer(1, 20))

        # 2. Metadata Grid
        date_str = datetime.datetime.now().strftime("%Y-%m-%d")
        meta_data = [
            ["Prepared For:", client_name],
            ["Date:", date_str],
            [
                "Valid Until:",
                (datetime.datetime.now() + datetime.timedelta(days=30)).strftime(
                    "%Y-%m-%d"
                ),
            ],
        ]
        # Widen metadata table to match new page width (556pt)
        t_meta = Table(meta_data, colWidths=[120, 436], hAlign="LEFT")
        t_meta.setStyle(
            TableStyle(
                [
                    ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                    ("TEXTCOLOR", (0, 0), (0, -1), colors.gray),
                ]
            )
        )
        elements.append(t_meta)
        elements.append(Spacer(1, 30))

        # 3. Main Product Table
        headers = ["Item Description", "Dimensions", "Pitch", "Qty", "Installed Price"]
        table_data = [headers]

        total_contract_value = 0

        for item in project_data:
            inp = item["inputs"]
            math = item["math"]

            desc = f"{inp.product_class} ({inp.shape}, {inp.access} Access)"
            if inp.is_outdoor:
                desc += " - Outdoor Rated"

            row = [
                desc,
                f"{inp.width_ft}' x {inp.height_ft}'\n({math['sq_ft']:.1f} sqft)",
                f"{inp.pixel_pitch}mm",
                "1",
                f"${math['sell_price']:,.2f}",
            ]
            table_data.append(row)
            total_contract_value += math["sell_price"]

        # Total Row
        table_data.append(["", "", "", "TOTAL:", f"${total_contract_value:,.2f}"])

        # Styling: Total Width MUST be 556pt
        # [266, 110, 60, 40, 80] = 556
        t_prod = Table(table_data, colWidths=[266, 110, 60, 40, 80])
        t_prod.setStyle(
            TableStyle(
                [
                    (
                        "BACKGROUND",
                        (0, 0),
                        (-1, 0),
                        colors.HexColor("#1e293b"),
                    ),  # Dark Header
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("ALIGN", (0, 0), (0, -1), "LEFT"),  # Align desc left
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                    ("GRID", (0, 0), (-1, -2), 0.5, colors.lightgrey),  # Grid for items
                    (
                        "LINEBELOW",
                        (0, -2),
                        (-1, -2),
                        2,
                        colors.HexColor("#3b82f6"),
                    ),  # Bold line before total
                    ("FONTNAME", (-2, -1), (-1, -1), "Helvetica-Bold"),  # Bold Total
                    (
                        "TEXTCOLOR",
                        (-1, -1),
                        (-1, -1),
                        colors.HexColor("#3b82f6"),
                    ),  # Blue Total
                    ("SIZE", (-1, -1), (-1, -1), 14),
                ]
            )
        )
        elements.append(t_prod)
        elements.append(Spacer(1, 40))

        # 4. Exclusions / Terms (Standard Text)
        elements.append(
            Paragraph("Scope of Work & Exclusions", self.styles["Heading3"])
        )
        terms = """
        • Price includes LED Hardware, Standard Structural/Labor (as specified), and Shipping.
        • Excludes: Primary power to site, Permits (unless noted), Data runs > 300ft.
        • Payment Terms: 50% Deposit, 40% Shipping, 10% Completion.
        """
        elements.append(Paragraph(terms, self.styles["Normal"]))

        # 4. Exclusions / Terms (Standard Text)
        elements.append(Paragraph("Scope of Work & Exclusions", self.styles['Heading3']))
        terms = """
        • Price includes LED Hardware, Standard Structural/Labor (as specified), and Shipping.
        • Excludes: Primary power to site, Permits (unless noted), Data runs > 300ft.
        • Payment Terms: 50% Deposit, 40% Shipping, 10% Completion.
        """
        elements.append(Paragraph(terms, self.styles['Normal']))

        doc.build(elements)
        print(f"Generated Publisher PDF: {filename}")
