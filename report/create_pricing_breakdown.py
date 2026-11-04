import os
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

def create_pricing_document():
    doc = Document()

    # Page setup - A4 with 0.8 in margins
    for s in doc.sections:
        s.page_width = Inches(8.27)
        s.page_height = Inches(11.69)
        s.top_margin = Inches(0.7)
        s.bottom_margin = Inches(0.7)
        s.left_margin = Inches(0.8)
        s.right_margin = Inches(0.8)

    # Brand Colors
    NAVY_HEX = "202B75"
    CYAN_HEX = "26BCEE"
    SLATE_HEX = "475569"
    DARK_HEX = "0F172A"
    LIGHT_BG_HEX = "F8FAFC"
    BORDER_HEX = "E2E8F0"

    NAVY = RGBColor(32, 43, 117)
    CYAN = RGBColor(38, 188, 238)
    SLATE = RGBColor(71, 85, 105)
    DARK = RGBColor(15, 23, 42)
    GRAY = RGBColor(100, 116, 139)
    GREEN = RGBColor(5, 150, 105)

    def set_cell_background(cell, hex_color):
        tcPr = cell._tc.get_or_add_tcPr()
        for ch in list(tcPr):
            if ch.tag.endswith('shd'):
                tcPr.remove(ch)
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
        tcPr.append(shd)

    def set_cell_padding(cell, top=100, bottom=100, left=140, right=140):
        tcPr = cell._tc.get_or_add_tcPr()
        tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
        tcPr.append(tcMar)

    def set_table_borders(table, color=BORDER_HEX, sz="4", val="single"):
        tblPr = table._tbl.tblPr
        for ch in list(tblPr):
            if ch.tag.endswith('tblBorders'):
                tblPr.remove(ch)
        borders = parse_xml(
            f'<w:tblBorders {nsdecls("w")}>'
            f'<w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
            f'<w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
            f'<w:left w:val="none"/>'
            f'<w:right w:val="none"/>'
            f'<w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
            f'<w:insideV w:val="none"/>'
            f'</w:tblBorders>'
        )
        tblPr.append(borders)

    logo_path = os.path.abspath(r'c:\Users\gouta\Desktop\silver star\report\extracted_media\silverstar_logo.png')

    # Header with Logo & Document Metadata
    header_table = doc.add_table(rows=1, cols=2)
    header_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    header_table.autofit = False
    header_table.columns[0].width = Inches(3.6)
    header_table.columns[1].width = Inches(3.07)

    c0 = header_table.cell(0, 0)
    c1 = header_table.cell(0, 1)

    p0 = c0.paragraphs[0]
    p0.paragraph_format.space_after = Pt(2)
    if os.path.exists(logo_path):
        p0.add_run().add_picture(logo_path, width=Inches(2.1))
    else:
        r = p0.add_run("SILVER STAR")
        r.font.size = Pt(18)
        r.font.bold = True
        r.font.color.rgb = NAVY

    r_tag = p0.add_run("\nYour True Business Partners")
    r_tag.font.size = Pt(8.5)
    r_tag.font.color.rgb = CYAN
    r_tag.font.italic = True

    p1 = c1.paragraphs[0]
    p1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p1.paragraph_format.space_after = Pt(2)
    r_doc = p1.add_run("COMMERCIAL PROPOSAL &\nPRICE BREAKDOWN")
    r_doc.font.size = Pt(12)
    r_doc.font.bold = True
    r_doc.font.color.rgb = NAVY

    p1_sub = c1.add_paragraph()
    p1_sub.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p1_sub.paragraph_format.space_before = Pt(2)
    p1_sub.paragraph_format.space_after = Pt(0)
    r_date = p1_sub.add_run("Client: Silver Star Facility Management Pvt. Ltd.\nDate: November 02, 2026 · Quotation Ref: SS-QUOTE-2026-V1.4\nClassification: Separated One-Time & Subscription Costs")
    r_date.font.size = Pt(8)
    r_date.font.color.rgb = GRAY

    # Thin decorative divider line
    p_div = doc.add_paragraph()
    p_div.paragraph_format.space_before = Pt(6)
    p_div.paragraph_format.space_after = Pt(10)
    r_div = p_div.add_run("―" * 58)
    r_div.font.size = Pt(14)
    r_div.font.bold = True
    r_div.font.color.rgb = CYAN

    # Document Heading
    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(3)
    r_title = p_title.add_run("Enterprise Platform Development & Infrastructure Pricing")
    r_title.font.size = Pt(16)
    r_title.font.bold = True
    r_title.font.color.rgb = NAVY

    p_lead = doc.add_paragraph()
    p_lead.paragraph_format.space_after = Pt(10)
    r_lead = p_lead.add_run(
        "This commercial quotation presents the separated investment breakdown for Silver Star Facility Management Pvt. Ltd. "
        "Costs are structured strictly into two distinct categories: (1) One-Time Capital Investment for turnkey software engineering and lifetime publishing, "
        "and (2) Ongoing Operating Subscriptions for cloud hosting and annual store memberships. No third-party recurring API license fees are involved."
    )
    r_lead.font.size = Pt(9)
    r_lead.font.color.rgb = SLATE

    # ==========================================
    # SECTION 1: ONE-TIME CAPITAL OUTLAY
    # ==========================================
    p_s1 = doc.add_paragraph()
    p_s1.paragraph_format.space_before = Pt(6)
    p_s1.paragraph_format.space_after = Pt(4)
    r_s1 = p_s1.add_run("1. One-Time Capital Outlay (Fixed Implementation)")
    r_s1.font.size = Pt(12)
    r_s1.font.bold = True
    r_s1.font.color.rgb = NAVY

    t_onetime = doc.add_table(rows=3, cols=4)
    t_onetime.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_onetime.autofit = False
    set_table_borders(t_onetime)

    col_widths = [Inches(1.8), Inches(2.2), Inches(1.3), Inches(1.37)]
    for row in t_onetime.rows:
        for idx, w in enumerate(col_widths):
            row.cells[idx].width = w

    headers_ot = ["One-Time Component", "Scope & Technical Delivery", "Billing Frequency", "Estimated Cost"]
    for i, title in enumerate(headers_ot):
        cell = t_onetime.cell(0, i)
        set_cell_background(cell, NAVY_HEX)
        set_cell_padding(cell, top=100, bottom=100, left=120, right=120)
        p = cell.paragraphs[0]
        r = p.add_run(title)
        r.font.size = Pt(8.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    items_ot = [
        (
            "Software Development Charges",
            "Turnkey engineering & delivery of all 5 platform applications:\n"
            "• Super Admin Web Governance Panel\n"
            "• HR Management & Onboarding Panel\n"
            "• Operations Field Management Panel\n"
            "• Client Mobile Self-Service App\n"
            "• Employee Mobile Attendance & ID App",
            "One-Time\n(Milestone-Based)",
            "₹50,000"
        ),
        (
            "Google Play Store Developer Account",
            "Direct registration fee paid straight to Google for lifetime developer account ownership under Silver Star corporate brand. Gives unlimited Android app publishing rights with zero renewal fees.",
            "One-Time Lifetime\n($25 USD direct)",
            "~₹2,100"
        )
    ]

    for row_idx, item in enumerate(items_ot, start=1):
        bg = LIGHT_BG_HEX if row_idx % 2 == 1 else "FFFFFF"
        for col_idx in range(4):
            cell = t_onetime.cell(row_idx, col_idx)
            set_cell_background(cell, bg)
            set_cell_padding(cell, top=100, bottom=100, left=120, right=120)
            p = cell.paragraphs[0]
            r = p.add_run(item[col_idx])
            r.font.size = Pt(8)
            r.font.color.rgb = DARK if col_idx != 3 else NAVY
            if col_idx == 0 or col_idx == 3:
                r.font.bold = True

    # One-Time Subtotal Box (NO GRAND TOTAL)
    p_sp1 = doc.add_paragraph()
    p_sp1.paragraph_format.space_before = Pt(4)
    p_sp1.paragraph_format.space_after = Pt(2)

    t_sub_ot = doc.add_table(rows=1, cols=2)
    t_sub_ot.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_sub_ot.autofit = False
    t_sub_ot.columns[0].width = Inches(4.7)
    t_sub_ot.columns[1].width = Inches(1.97)
    set_table_borders(t_sub_ot, color=CYAN_HEX, sz="6")

    c_ot_l = t_sub_ot.cell(0, 0)
    c_ot_r = t_sub_ot.cell(0, 1)
    set_cell_background(c_ot_l, "F0F7FF")
    set_cell_background(c_ot_r, "F0F7FF")
    set_cell_padding(c_ot_l, top=100, bottom=100, left=140, right=140)
    set_cell_padding(c_ot_r, top=100, bottom=100, left=140, right=140)

    p_ot_l = c_ot_l.paragraphs[0]
    r_ot_l = p_ot_l.add_run("SUBTOTAL: ONE-TIME CAPITAL OUTLAY\n")
    r_ot_l.font.size = Pt(9)
    r_ot_l.font.bold = True
    r_ot_l.font.color.rgb = NAVY
    r_ot_sub = p_ot_l.add_run("Turnkey development of 5 platforms (₹50,000) + Google Play lifetime registration (~₹2,100).")
    r_ot_sub.font.size = Pt(7.5)
    r_ot_sub.font.color.rgb = GRAY

    p_ot_r = c_ot_r.paragraphs[0]
    p_ot_r.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r_ot_r = p_ot_r.add_run("₹52,100\n")
    r_ot_r.font.size = Pt(13)
    r_ot_r.font.bold = True
    r_ot_r.font.color.rgb = NAVY
    r_ot_note = p_ot_r.add_run("Fixed Setup Fee")
    r_ot_note.font.size = Pt(7)
    r_ot_note.font.color.rgb = SLATE

    # ==========================================
    # SECTION 2: RECURRING SUBSCRIPTION EXPENSES
    # ==========================================
    p_s2 = doc.add_paragraph()
    p_s2.paragraph_format.space_before = Pt(12)
    p_s2.paragraph_format.space_after = Pt(4)
    r_s2 = p_s2.add_run("2. Recurring Operating Subscriptions & Cloud Expenses")
    r_s2.font.size = Pt(12)
    r_s2.font.bold = True
    r_s2.font.color.rgb = NAVY

    t_recurring = doc.add_table(rows=6, cols=4)
    t_recurring.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_recurring.autofit = False
    set_table_borders(t_recurring)

    for row in t_recurring.rows:
        for idx, w in enumerate(col_widths):
            row.cells[idx].width = w

    headers_rec = ["Subscription Component", "Technical Specifications & Utility", "Billing Frequency", "Estimated Cost"]
    for i, title in enumerate(headers_rec):
        cell = t_recurring.cell(0, i)
        set_cell_background(cell, NAVY_HEX)
        set_cell_padding(cell, top=100, bottom=100, left=120, right=120)
        p = cell.paragraphs[0]
        r = p.add_run(title)
        r.font.size = Pt(8.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    items_rec = [
        (
            "Cloud VPS Server Hosting",
            "Dedicated Ubuntu Cloud VPS (2 vCPU, 4GB RAM, NVMe SSD) sized for 250 employees & 50 clients in Indian Datacenter (Mumbai/Bangalore). Includes automated daily backups & free SSL.",
            "Monthly Hosting\n(Avg. ₹799 / mo)",
            "₹799 / mo\n(~₹9,588 / yr)"
        ),
        (
            "Apple Developer Program Membership",
            "Annual developer organization membership paid directly to Apple. Required by Apple to keep iOS applications live and installable on iPhones.",
            "Annual Renewal\n($99 USD / year)",
            "~₹8,400 / yr"
        ),
        (
            "Native Device GPS Geofencing",
            "Perimeter boundary calculations performed directly using device hardware GPS chips and Haversine algorithms. Zero paid Google/Mapbox API charges.",
            "Handled by Phone\nHardware",
            "₹0 (100% Free)"
        ),
        (
            "Offline Aadhaar QR eKYC Decoding",
            "In-app photographic and demographic decoding using UIDAI public cryptographic certificates. Completely eliminates ₹25/call third-party KYC API fees.",
            "Local Cryptographic\nDecoding",
            "₹0 (100% Free)"
        ),
        (
            "Push Notifications (FCM / APNs)",
            "Unlimited instant emergency broadcasts, shift scheduling reminders, and duty alerts via Google Firebase (FCM) & Apple APNs.",
            "Platform Ecosystem\nStandard",
            "₹0 (100% Free)"
        )
    ]

    for row_idx, item in enumerate(items_rec, start=1):
        bg = LIGHT_BG_HEX if row_idx % 2 == 1 else "FFFFFF"
        for col_idx in range(4):
            cell = t_recurring.cell(row_idx, col_idx)
            set_cell_background(cell, bg)
            set_cell_padding(cell, top=100, bottom=100, left=120, right=120)
            p = cell.paragraphs[0]
            r = p.add_run(item[col_idx])
            r.font.size = Pt(8)
            r.font.color.rgb = DARK if col_idx != 3 else NAVY
            if col_idx == 0 or col_idx == 3:
                r.font.bold = True
            if col_idx == 3 and "₹0" in item[col_idx]:
                r.font.color.rgb = GREEN

    # PAGE BREAK TO PAGE 2
    doc.add_page_break()

    # ==========================================
    # SECTION 3: DIRECT APP STORE FEES
    # ==========================================
    p_s3 = doc.add_paragraph()
    p_s3.paragraph_format.space_before = Pt(8)
    p_s3.paragraph_format.space_after = Pt(4)
    r_s3 = p_s3.add_run("3. Direct App Store Registration Details (Client Owned)")
    r_s3.font.size = Pt(12)
    r_s3.font.bold = True
    r_s3.font.color.rgb = NAVY

    p_s3_desc = doc.add_paragraph()
    p_s3_desc.paragraph_format.space_after = Pt(6)
    r_s3_desc = p_s3_desc.add_run(
        "To ensure 100% intellectual property, legal compliance, and corporate branding under Silver Star Facility Management Pvt. Ltd., "
        "developer accounts are registered directly in the client's name. Fees are paid straight to Google and Apple without intermediary markups:"
    )
    r_s3_desc.font.size = Pt(8.5)
    r_s3_desc.font.color.rgb = SLATE

    bullets_store = [
        ("Google Play Store (One-Time): ", "A $25 USD one-time fee (~₹2,100 INR) for a lifetime developer account (no annual renewal fee). Allows publishing unlimited Android apps under the Silver Star brand forever."),
        ("Apple App Store (Annual Subscription): ", "$99 USD per year (~₹8,400 INR) for an individual or organization Apple Developer Program membership (renews annually; required by Apple to keep iOS apps downloadable on iPhones).")
    ]
    for b_title, b_body in bullets_store:
        p_b = doc.add_paragraph(style='List Bullet')
        p_b.paragraph_format.space_after = Pt(3)
        rb_t = p_b.add_run(b_title)
        rb_t.font.size = Pt(8.5)
        rb_t.font.bold = True
        rb_t.font.color.rgb = NAVY
        rb_b = p_b.add_run(b_body)
        rb_b.font.size = Pt(8.5)
        rb_b.font.color.rgb = SLATE

    # ==========================================
    # SECTION 4: HOW THE QR SCANNING WORKFLOW WORKS
    # ==========================================
    p_s4 = doc.add_paragraph()
    p_s4.paragraph_format.space_before = Pt(10)
    p_s4.paragraph_format.space_after = Pt(4)
    r_s4 = p_s4.add_run("4. Aadhaar eKYC Verification: Free & Offline Cryptographic Decoding")
    r_s4.font.size = Pt(12)
    r_s4.font.bold = True
    r_s4.font.color.rgb = NAVY

    p_s4_box = doc.add_paragraph()
    p_s4_box.paragraph_format.space_after = Pt(6)
    r_s4_box = p_s4_box.add_run(
        "Commercial verification APIs (like Karza, IDfy, or Signzy) charge ₹15 to ₹45 per verification, generating continuous operational expenses. "
        "We implement Option A: Completely Free & Offline Local Decoding:"
    )
    r_s4_box.font.size = Pt(8.5)
    r_s4_box.font.color.rgb = SLATE

    qr_points = [
        ("The User Flow: ", "The onboarding officer or employee grants camera permission in the mobile app. The camera scans the large 2048-bit digital Secure QR code printed on the physical Aadhaar card or e-Aadhaar printout."),
        ("The Cryptographic Logic: ", "Instead of transmitting sensitive citizen records to an external cloud API, the mobile app decodes the binary payload entirely on the device. It decompresses the data, extracts official demographic details (Name, DOB, Gender, Address) plus the high-resolution photo, and cryptographically checks it against UIDAI’s public digital certificate."),
        ("Security & Statutory Compliance: ", "100% private, zero risk of data leakage, compliant with UIDAI paperless offline e-KYC guidelines, and works seamlessly even in basement security posts without internet."),
        ("Recurring Cost: ", "₹0 (100% Free Forever) — saves recurring monthly third-party API verification bills.")
    ]
    for q_t, q_b in qr_points:
        p_q = doc.add_paragraph(style='List Bullet')
        p_q.paragraph_format.space_after = Pt(3)
        rq_t = p_q.add_run(q_t)
        rq_t.font.size = Pt(8.5)
        rq_t.font.bold = True
        rq_t.font.color.rgb = NAVY if "Cost" not in q_t else GREEN
        rq_b = p_q.add_run(q_b)
        rq_b.font.size = Pt(8.5)
        rq_b.font.color.rgb = SLATE if "Cost" not in q_t else GREEN
        if "Cost" in q_t:
            rq_b.font.bold = True

    # ==========================================
    # SECTION 5: SERVER HOSTING & INFRASTRUCTURE
    # ==========================================
    p_s5 = doc.add_paragraph()
    p_s5.paragraph_format.space_before = Pt(10)
    p_s5.paragraph_format.space_after = Pt(4)
    r_s5 = p_s5.add_run("5. Cloud VPS Sizing Analysis (250 Employees / 50 Clients)")
    r_s5.font.size = Pt(12)
    r_s5.font.bold = True
    r_s5.font.color.rgb = NAVY

    p_s5_body = doc.add_paragraph()
    p_s5_body.paragraph_format.space_after = Pt(6)
    r_s5_body = p_s5_body.add_run(
        "For an enterprise scale of 250 active employees, 50 client portal accounts, and standard monthly staff turnover (10–15 joins and 5–10 exits), "
        "an economical Cloud VPS in Mumbai or Bangalore delivers sub-second response times:"
    )
    r_s5_body.font.size = Pt(8.5)
    r_s5_body.font.color.rgb = SLATE

    t_vps = doc.add_table(rows=5, cols=3)
    t_vps.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_vps.autofit = False
    set_table_borders(t_vps)

    vps_widths = [Inches(1.8), Inches(3.3), Inches(1.57)]
    for row in t_vps.rows:
        for idx, w in enumerate(vps_widths):
            row.cells[idx].width = w

    vps_headers = ["Infrastructure Component", "Technical Specification", "Monthly Budget"]
    for i, title in enumerate(vps_headers):
        cell = t_vps.cell(0, i)
        set_cell_background(cell, NAVY_HEX)
        set_cell_padding(cell, top=100, bottom=100, left=120, right=120)
        p = cell.paragraphs[0]
        r = p.add_run(title)
        r.font.size = Pt(8.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    vps_rows = [
        ("Cloud VPS Compute & RAM", "2 vCPU cores, 4 GB High-Speed RAM (Runs FastAPI/Node backend + PostgreSQL 16 database)", "₹799 / month (Avg)"),
        ("NVMe SSD Storage", "50 GB – 80 GB NVMe Storage (Capacity for ~90,000 attendance records/yr + 5 years of KYC documents)", "Included in VPS"),
        ("SSL & Reverse Proxy", "Nginx reverse proxy with automated Let's Encrypt Wildcard SSL encryption & Gzip compression", "₹0 (Free Lifetime)"),
        ("Automated Nightly Backups", "Automated server snapshot taken every night at 2:00 AM for instant disaster recovery", "~₹150 – ₹200 / month")
    ]
    for row_idx, (c1_txt, c2_txt, c3_txt) in enumerate(vps_rows, start=1):
        bg = LIGHT_BG_HEX if row_idx % 2 == 1 else "FFFFFF"
        for col_idx, txt in enumerate([c1_txt, c2_txt, c3_txt]):
            cell = t_vps.cell(row_idx, col_idx)
            set_cell_background(cell, bg)
            set_cell_padding(cell, top=80, bottom=80, left=120, right=120)
            p = cell.paragraphs[0]
            r = p.add_run(txt)
            r.font.size = Pt(8)
            r.font.color.rgb = DARK if col_idx != 2 else NAVY
            if col_idx == 0 or col_idx == 2:
                r.font.bold = True

    # Save DOCX
    docx_out = os.path.abspath(r'c:\Users\gouta\Desktop\silver star\report\Silver_Star_Pricing_Breakdown_Updated.docx')
    doc.save(docx_out)
    print(f"DOCX created successfully: {docx_out} ({os.path.getsize(docx_out)} bytes)")
    return docx_out

if __name__ == "__main__":
    create_pricing_document()
