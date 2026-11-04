import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from reportlab.pdfgen import canvas

# Register Segoe UI with full Unicode ₹ support
pdfmetrics.registerFont(TTFont('SegoeUI', 'C:/Windows/Fonts/segoeui.ttf'))
pdfmetrics.registerFont(TTFont('SegoeUI-Bold', 'C:/Windows/Fonts/segoeuib.ttf'))
pdfmetrics.registerFont(TTFont('SegoeUI-Italic', 'C:/Windows/Fonts/segoeuii.ttf'))
registerFontFamily('SegoeUI', normal='SegoeUI', bold='SegoeUI-Bold', italic='SegoeUI-Italic', boldItalic='SegoeUI-Bold')

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_decorations(self, page_count):
        self.saveState()
        self.setFont("SegoeUI", 8)
        self.setFillColor(colors.HexColor("#64748B"))

        # Running header on Page 2+
        if self._pageNumber > 1:
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(36, A4[1] - 30, A4[0] - 36, A4[1] - 30)
            self.drawString(36, A4[1] - 25, "Silver Star Facility Management Pvt. Ltd. — Commercial Proposal & Cost Breakdown")
            self.drawRightString(A4[0] - 36, A4[1] - 25, "CONFIDENTIAL & PROPRIETARY")

        # Running footer on all pages
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(36, 34, A4[0] - 36, 34)
        self.drawString(36, 22, "Silver Star Facility Management Digital Platform · https://silverstarindia.net/")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(A4[0] - 36, 22, page_str)
        self.restoreState()

def build_pdf():
    pdf_path = os.path.abspath(r'c:\Users\gouta\Desktop\silver star\report\Silver_Star_Pricing_Breakdown.pdf')
    logo_path = os.path.abspath(r'c:\Users\gouta\Desktop\silver star\report\extracted_media\silverstar_logo.png')

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    # Brand Colors
    NAVY = colors.HexColor("#202B75")
    CYAN = colors.HexColor("#26BCEE")
    SLATE = colors.HexColor("#475569")
    DARK = colors.HexColor("#0F172A")
    LIGHT_BG = colors.HexColor("#F8FAFC")
    BORDER_COLOR = colors.HexColor("#E2E8F0")
    EMERALD = colors.HexColor("#059669")
    BLUE_ACCENT = colors.HexColor("#F0F7FF")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='SegoeUI-Bold',
        fontSize=15,
        leading=19,
        textColor=NAVY
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='SegoeUI',
        fontSize=8.5,
        leading=12.5,
        textColor=SLATE
    )

    h2_style = ParagraphStyle(
        'Heading2',
        parent=styles['Normal'],
        fontName='SegoeUI-Bold',
        fontSize=10.5,
        leading=14,
        textColor=NAVY,
        spaceBefore=0,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='SegoeUI',
        fontSize=8.2,
        leading=11.8,
        textColor=DARK
    )

    bullet_style = ParagraphStyle(
        'BulletText',
        parent=styles['Normal'],
        fontName='SegoeUI',
        fontSize=8.2,
        leading=11.8,
        textColor=DARK,
        leftIndent=12,
        firstLineIndent=-12,
        spaceAfter=3
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='SegoeUI-Bold',
        fontSize=8,
        leading=10.5,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='SegoeUI',
        fontSize=7.6,
        leading=10.2,
        textColor=DARK
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='SegoeUI-Bold',
        fontSize=7.6,
        leading=10.2,
        textColor=NAVY
    )

    table_cell_green = ParagraphStyle(
        'TableCellGreen',
        parent=styles['Normal'],
        fontName='SegoeUI-Bold',
        fontSize=7.6,
        leading=10.2,
        textColor=EMERALD
    )

    story = []

    # =========================================================================
    # PAGE 1: HEADER, OVERVIEW, SECTION 1 (ONE-TIME), SECTION 2 (RECURRING)
    # =========================================================================

    # Header with Logo & Metadata
    if os.path.exists(logo_path):
        img = Image(logo_path, width=1.95*inch, height=0.56*inch)
        img.hAlign = 'LEFT'
        logo_cell = [img, Paragraph("<font size=7 color='#26BCEE'><b>Your True Business Partners</b></font>", body_style)]
    else:
        logo_cell = [Paragraph("<font size=16 color='#202B75'><b>SILVER STAR</b></font><br/><font size=7.5 color='#26BCEE'>Your True Business Partners</font>", body_style)]

    meta_text = (
        "<para align='right'>"
        "<b><font size=11 color='#202B75'>COMMERCIAL PROPOSAL &amp; PRICING</font></b><br/>"
        "<font size=7.5 color='#64748B'>"
        "Client: <b>Silver Star Facility Management Pvt. Ltd.</b><br/>"
        "Date: November 02, 2026 · Quotation Ref: <b>SS-QUOTE-2026-V1.4</b><br/>"
        "Classification: <b>Separated One-Time &amp; Subscription Costs</b>"
        "</font></para>"
    )
    meta_cell = Paragraph(meta_text, body_style)

    header_table = Table([[logo_cell, meta_cell]], colWidths=[2.6*inch, 4.66*inch])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(header_table)
    story.append(HRFlowable(width="100%", thickness=1.5, color=CYAN, spaceBefore=4, spaceAfter=8))

    # Title & Lead
    story.append(Paragraph("Enterprise Platform Development &amp; Infrastructure Pricing", title_style))
    story.append(Spacer(1, 3))
    lead_text = (
        "This commercial quotation presents the separated investment breakdown for <b>Silver Star Facility Management Pvt. Ltd.</b> "
        "Costs are structured strictly into two distinct categories: <b>(1) One-Time Capital Investment</b> for turnkey software development and lifetime publishing, "
        "and <b>(2) Ongoing Operating Subscriptions</b> for cloud hosting and annual store memberships. No third-party recurring API license fees are involved."
    )
    story.append(Paragraph(lead_text, subtitle_style))
    story.append(Spacer(1, 8))

    # -------------------------------------------------------------------------
    # PART A: ONE-TIME CAPITAL CHARGES
    # -------------------------------------------------------------------------
    story.append(Paragraph("1. One-Time Capital Outlay (Fixed Implementation)", h2_style))

    table_data_onetime = [
        [
            Paragraph("One-Time Component", table_header_style),
            Paragraph("Scope of Work &amp; Deliverables", table_header_style),
            Paragraph("Billing Type", table_header_style),
            Paragraph("Amount (INR ₹)", table_header_style)
        ],
        [
            Paragraph("<b>Software Development Charges</b>", table_cell_bold),
            Paragraph("Turnkey engineering and delivery of all 5 platform applications:<br/>"
                      "• <b>Super Admin Web Console</b> (Governance, GST Billing &amp; Analytics)<br/>"
                      "• <b>HR Management Web Panel</b> (Onboarding Engine &amp; Employee Dossiers)<br/>"
                      "• <b>Operations Management Web Panel</b> (Daily Work Reports &amp; Staff Deployment)<br/>"
                      "• <b>Client Mobile Application</b> (Self-Service Rosters &amp; Incident Logging)<br/>"
                      "• <b>Employee Mobile Application</b> (Smart ID Badge &amp; GPS Duty Punch)", table_cell_style),
            Paragraph("One-Time<br/>(Milestone-Based)", table_cell_style),
            Paragraph("<b>₹50,000</b>", table_cell_bold)
        ],
        [
            Paragraph("<b>Google Play Store Developer Account</b>", table_cell_bold),
            Paragraph("Direct registration fee paid straight to Google for lifetime developer account ownership under Silver Star corporate brand. Gives unlimited Android app publishing rights with zero renewal fees.", table_cell_style),
            Paragraph("One-Time Lifetime<br/>($25 USD direct)", table_cell_style),
            Paragraph("<b>~₹2,100</b>", table_cell_bold)
        ],
    ]

    t_onetime = Table(table_data_onetime, colWidths=[1.6*inch, 2.96*inch, 1.35*inch, 1.35*inch])
    t_onetime.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_BG]),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, BORDER_COLOR),
    ]))
    story.append(t_onetime)
    story.append(Spacer(1, 5))

    # One-Time Subtotal Callout Box
    subtotal_onetime_data = [
        [
            Paragraph("<b><font size=8.5 color='#202B75'>SUBTOTAL: ONE-TIME CAPITAL OUTLAY</font></b><br/>"
                      "<font size=6.8 color='#64748B'>Turnkey development of 5 platforms (₹50,000) + Google Play lifetime registration (~₹2,100).</font>", body_style),
            Paragraph("<para align='right'><b><font size=12 color='#202B75'>₹52,100</font></b><br/><font size=6.5 color='#64748B'>One-Time Investment</font></para>", body_style)
        ]
    ]
    t_sub_onetime = Table(subtotal_onetime_data, colWidths=[5.46*inch, 1.8*inch])
    t_sub_onetime.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BLUE_ACCENT),
        ('BOX', (0,0), (-1,-1), 1, CYAN),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 7),
        ('RIGHTPADDING', (0,0), (-1,-1), 7),
    ]))
    story.append(t_sub_onetime)
    story.append(Spacer(1, 10))

    # -------------------------------------------------------------------------
    # PART B: RECURRING & SUBSCRIPTION OPERATING CHARGES
    # -------------------------------------------------------------------------
    story.append(Paragraph("2. Recurring Operating Subscriptions &amp; Cloud Expenses", h2_style))

    table_data_recurring = [
        [
            Paragraph("Subscription Component", table_header_style),
            Paragraph("Technical Specifications &amp; Utility", table_header_style),
            Paragraph("Billing Frequency", table_header_style),
            Paragraph("Estimated Cost", table_header_style)
        ],
        [
            Paragraph("<b>Cloud VPS Server Hosting</b>", table_cell_bold),
            Paragraph("Dedicated Ubuntu Cloud VPS (2 vCPU, 4GB RAM, NVMe SSD) sized for 250 employees &amp; 50 clients in Indian Datacenter (Mumbai/Bangalore). Includes automated daily backups &amp; free SSL.", table_cell_style),
            Paragraph("Monthly Hosting<br/>(Avg. ₹799 / mo)", table_cell_style),
            Paragraph("<b>₹799 / mo</b><br/><font color='#64748B' size=6.5>(~₹9,588 / yr)</font>", table_cell_bold)
        ],
        [
            Paragraph("<b>Apple Developer Program Membership</b>", table_cell_bold),
            Paragraph("Annual developer organization membership paid directly to Apple. Required by Apple to keep iOS applications live and installable on iPhones.", table_cell_style),
            Paragraph("Annual Renewal<br/>($99 USD / year)", table_cell_style),
            Paragraph("<b>~₹8,400 / yr</b>", table_cell_bold)
        ],
        [
            Paragraph("<b>Native Device GPS Geofencing</b>", table_cell_bold),
            Paragraph("Perimeter boundary calculations performed directly using device hardware GPS chips and Haversine algorithms. Zero paid Google/Mapbox API charges.", table_cell_style),
            Paragraph("Handled by Phone<br/>Hardware", table_cell_style),
            Paragraph("<b>₹0 (100% Free)</b>", table_cell_green)
        ],
        [
            Paragraph("<b>Offline Aadhaar QR eKYC Decoding</b>", table_cell_bold),
            Paragraph("In-app photographic and demographic decoding using UIDAI public cryptographic certificates. Completely eliminates ₹25/call third-party KYC API fees.", table_cell_style),
            Paragraph("Local Cryptographic<br/>Decoding", table_cell_style),
            Paragraph("<b>₹0 (100% Free)</b>", table_cell_green)
        ],
        [
            Paragraph("<b>Push Notifications (FCM / APNs)</b>", table_cell_bold),
            Paragraph("Unlimited instant emergency broadcasts, shift scheduling reminders, and duty alerts via Google Firebase (FCM) &amp; Apple APNs.", table_cell_style),
            Paragraph("Platform Ecosystem<br/>Standard", table_cell_style),
            Paragraph("<b>₹0 (100% Free)</b>", table_cell_green)
        ],
    ]

    t_recurring = Table(table_data_recurring, colWidths=[1.6*inch, 2.96*inch, 1.35*inch, 1.35*inch])
    t_recurring.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_BG]),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, BORDER_COLOR),
    ]))
    story.append(t_recurring)

    # PAGE BREAK TO CLEAN 2-PAGE SPREAD
    story.append(PageBreak())

    # =========================================================================
    # PAGE 2: SECTIONS 3, 4, 5 (SECTIONS 6 & 7 COMPLETELY REMOVED)
    # =========================================================================

    # SECTION 3: Direct App Store Registration Details
    story.append(Paragraph("3. Direct App Store Registration Details (Client Owned)", h2_style))
    story.append(Paragraph(
        "To ensure 100% intellectual property, legal compliance, and corporate branding under <b>Silver Star Facility Management Pvt. Ltd.</b>, "
        "developer accounts are registered directly in the client's name. Fees are paid straight to Google and Apple without intermediary markups:",
        body_style
    ))
    story.append(Spacer(1, 4))
    store_bullets = [
        "<b>Google Play Store (One-Time):</b> A <b>$25 USD one-time fee</b> (~₹2,100 INR) for a lifetime developer account (no annual renewal fee). Allows publishing unlimited Android apps under the Silver Star brand forever.",
        "<b>Apple App Store (Annual Subscription):</b> <b>$99 USD per year</b> (~₹8,400 INR) for an individual or organization Apple Developer Program membership (renews annually; required by Apple to keep iOS apps downloadable on iPhones)."
    ]
    for b in store_bullets:
        story.append(Paragraph(f"• &nbsp; {b}", bullet_style))
    story.append(Spacer(1, 14))

    # SECTION 4: How the QR Scanning Workflows Work
    story.append(Paragraph("4. How the Aadhaar QR Scanning Workflow Works (100% Free &amp; Offline)", h2_style))
    story.append(Paragraph(
        "Commercial verification APIs (like Karza, IDfy, or Signzy) charge ₹15 to ₹45 per verification, generating continuous operational expenses. "
        "We implement <b>Option A: Completely Free &amp; Offline Local Decoding</b>:",
        body_style
    ))
    story.append(Spacer(1, 4))
    qr_bullets = [
        "<b>The User Flow:</b> The onboarding officer or employee grants camera permission in the mobile app. The camera scans the large 2048-bit digital Secure QR code printed on the physical Aadhaar card or e-Aadhaar printout.",
        "<b>The Cryptographic Logic:</b> Instead of transmitting sensitive citizen records to an external cloud API, the mobile app decodes the binary payload entirely on the device. It decompresses the data, extracts official demographic details (Name, DOB, Gender, Address) plus the high-resolution photo, and cryptographically checks it against UIDAI’s public digital certificate.",
        "<b>Security &amp; Statutory Compliance:</b> 100% private, zero risk of data leakage, compliant with UIDAI paperless offline e-KYC guidelines, and works seamlessly even in basement security posts without internet.",
        "<b>Recurring Cost:</b> <b>₹0 (100% Free Forever)</b> — saves recurring monthly third-party API verification bills."
    ]
    for q in qr_bullets:
        story.append(Paragraph(f"• &nbsp; {q}", bullet_style))
    story.append(Spacer(1, 14))

    # SECTION 5: Cloud VPS Server Hosting Architecture
    story.append(Paragraph("5. Cloud VPS Sizing Analysis (250 Employees / 50 Clients)", h2_style))
    story.append(Paragraph(
        "For an enterprise scale of <b>250 active employees</b>, <b>50 client portal accounts</b>, and standard monthly staff turnover (10–15 joins and 5–10 exits), "
        "an economical Cloud VPS in Mumbai or Bangalore delivers sub-second response times:",
        body_style
    ))
    story.append(Spacer(1, 4))

    vps_table_data = [
        [
            Paragraph("Infrastructure Component", table_header_style),
            Paragraph("Technical Specification", table_header_style),
            Paragraph("Monthly Budget", table_header_style)
        ],
        [
            Paragraph("<b>Cloud VPS Compute &amp; RAM</b>", table_cell_bold),
            Paragraph("2 vCPU cores, 4 GB High-Speed RAM (Runs FastAPI/Node backend + PostgreSQL 16 database)", table_cell_style),
            Paragraph("<b>₹799 / month</b><br/><font color='#64748B' size=6.5>(~₹9,588 / yr)</font>", table_cell_bold)
        ],
        [
            Paragraph("<b>NVMe SSD Storage</b>", table_cell_bold),
            Paragraph("50 GB – 80 GB NVMe Storage (Capacity for ~90,000 attendance records/yr + 5 years of KYC documents)", table_cell_style),
            Paragraph("Included in VPS", table_cell_style)
        ],
        [
            Paragraph("<b>SSL &amp; Reverse Proxy</b>", table_cell_bold),
            Paragraph("Nginx reverse proxy with automated Let's Encrypt Wildcard SSL encryption &amp; Gzip compression", table_cell_style),
            Paragraph("₹0 (Free Lifetime)", table_cell_green)
        ],
        [
            Paragraph("<b>Automated Nightly Backups</b>", table_cell_bold),
            Paragraph("Automated server snapshot taken every night at 2:00 AM for instant disaster recovery", table_cell_style),
            Paragraph("~₹150 – ₹200 / mo", table_cell_style)
        ]
    ]

    vps_table = Table(vps_table_data, colWidths=[2.1*inch, 3.66*inch, 1.5*inch])
    vps_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_BG]),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, BORDER_COLOR),
    ]))
    story.append(vps_table)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF generated successfully without sections 6 & 7: {pdf_path} ({os.path.getsize(pdf_path)} bytes)")
    return pdf_path

if __name__ == "__main__":
    build_pdf()
