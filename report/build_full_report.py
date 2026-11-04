import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def create_proposal_document():
    doc = docx.Document()
    
    # Page setup - Standard A4 (8.27 x 11.69 inches), 0.85 inch margins
    sections = doc.sections
    for s in sections:
        s.page_width = Inches(8.27)
        s.page_height = Inches(11.69)
        s.top_margin = Inches(0.85)
        s.bottom_margin = Inches(0.85)
        s.left_margin = Inches(0.85)
        s.right_margin = Inches(0.85)

    # Styles & Colors
    # Primary: Deep Navy (#202B75), Secondary: Bright Cyan (#26BCEE), Slate: (#475569), Dark: (#0F172A)
    NAVY_HEX = "202B75"
    CYAN_HEX = "26BCEE"
    SLATE_HEX = "475569"
    DARK_HEX = "0F172A"
    LIGHT_BG_HEX = "F8FAFC"
    BORDER_HEX = "CBD5E1"
    
    NAVY = RGBColor(32, 43, 117)
    CYAN = RGBColor(38, 188, 238)
    SLATE = RGBColor(71, 85, 105)
    DARK = RGBColor(15, 23, 42)
    GRAY = RGBColor(100, 116, 139)

    # Helper functions
    def set_cell_background(cell, hex_color):
        tcPr = cell._tc.get_or_add_tcPr()
        for ch in list(tcPr):
            if ch.tag.endswith('shd'):
                tcPr.remove(ch)
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
        tcPr.append(shd)

    def set_cell_padding(cell, top=120, bottom=120, left=160, right=160):
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

    def add_heading_1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = "Segoe UI"
        run.font.size = Pt(16)
        run.font.bold = True
        run.font.color.rgb = NAVY
        return p

    def add_heading_2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = "Segoe UI"
        run.font.size = Pt(12.5)
        run.font.bold = True
        run.font.color.rgb = NAVY
        return p

    def add_heading_3(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = "Segoe UI"
        run.font.size = Pt(11)
        run.font.bold = True
        run.font.color.rgb = DARK
        return p

    def add_body(text, bold_prefix=None, space_after=4):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            r_bold = p.add_run(bold_prefix)
            r_bold.font.name = "Segoe UI"
            r_bold.font.size = Pt(10)
            r_bold.font.bold = True
            r_bold.font.color.rgb = DARK
        run = p.add_run(text)
        run.font.name = "Segoe UI"
        run.font.size = Pt(10)
        run.font.color.rgb = DARK
        return p

    def add_bullet(text, bold_prefix=None):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(2.5)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            r_bold = p.add_run(bold_prefix)
            r_bold.font.name = "Segoe UI"
            r_bold.font.size = Pt(9.5)
            r_bold.font.bold = True
            r_bold.font.color.rgb = DARK
        run = p.add_run(text)
        run.font.name = "Segoe UI"
        run.font.size = Pt(9.5)
        run.font.color.rgb = DARK
        return p

    def add_callout(text, bold_title="IMPORTANT:"):
        table = doc.add_table(rows=1, cols=1)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = False
        cell = table.rows[0].cells[0]
        cell.width = Inches(6.5)
        set_cell_background(cell, "F0F9FF")
        set_cell_padding(cell, top=140, bottom=140, left=200, right=180)
        
        tcPr = cell._tc.get_or_add_tcPr()
        borders = parse_xml(
            f'<w:tcBorders {nsdecls("w")}>'
            f'<w:top w:val="none"/>'
            f'<w:bottom w:val="none"/>'
            f'<w:left w:val="single" w:sz="24" w:space="0" w:color="{CYAN_HEX}"/>'
            f'<w:right w:val="none"/>'
            f'</w:tcBorders>'
        )
        tcPr.append(borders)
        
        # cantSplit on callout
        trPr = table.rows[0]._tr.get_or_add_trPr()
        trPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))
        
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.15
        if bold_title:
            r1 = p.add_run(bold_title + " ")
            r1.font.name = "Segoe UI"
            r1.font.size = Pt(9.5)
            r1.font.bold = True
            r1.font.color.rgb = NAVY
        r2 = p.add_run(text)
        r2.font.name = "Segoe UI"
        r2.font.size = Pt(9.5)
        r2.font.color.rgb = DARK
        
        sp = doc.add_paragraph()
        sp.paragraph_format.space_before = Pt(0)
        sp.paragraph_format.space_after = Pt(4)

    def add_image_box(img_path, caption, width=Inches(6.0)):
        if os.path.exists(img_path):
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(8)
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.keep_with_next = True
            run = p.add_run()
            run.add_picture(img_path, width=width)
            
            p_cap = doc.add_paragraph()
            p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_cap.paragraph_format.space_before = Pt(0)
            p_cap.paragraph_format.space_after = Pt(8)
            r_cap = p_cap.add_run(caption)
            r_cap.font.name = "Segoe UI"
            r_cap.font.size = Pt(8.5)
            r_cap.font.italic = True
            r_cap.font.color.rgb = GRAY

    def style_table(table, col_widths, headers, data, align_cols=None):
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = False
        set_table_borders(table)
        
        # Header Row
        hdr_row = table.rows[0]
        trPr_hdr = hdr_row._tr.get_or_add_trPr()
        trPr_hdr.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))
        trPr_hdr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))
        
        hdr_cells = hdr_row.cells
        for i, h in enumerate(headers):
            hdr_cells[i].width = col_widths[i]
            set_cell_background(hdr_cells[i], NAVY_HEX)
            set_cell_padding(hdr_cells[i], top=120, bottom=120, left=140, right=140)
            hdr_cells[i].vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            p = hdr_cells[i].paragraphs[0]
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            if align_cols and i in align_cols:
                p.alignment = align_cols[i]
            run = p.add_run(h)
            run.font.name = "Segoe UI"
            run.font.size = Pt(9)
            run.font.bold = True
            run.font.color.rgb = RGBColor(255, 255, 255)
            
        # Data Rows
        for r_idx, row_data in enumerate(data):
            row = table.add_row()
            trPr_row = row._tr.get_or_add_trPr()
            trPr_row.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))
            
            row_cells = row.cells
            bg_color = LIGHT_BG_HEX if r_idx % 2 == 1 else "FFFFFF"
            for c_idx, val in enumerate(row_data):
                row_cells[c_idx].width = col_widths[c_idx]
                set_cell_background(row_cells[c_idx], bg_color)
                set_cell_padding(row_cells[c_idx], top=80, bottom=80, left=140, right=140)
                row_cells[c_idx].vertical_alignment = WD_ALIGN_VERTICAL.CENTER
                p = row_cells[c_idx].paragraphs[0]
                p.paragraph_format.space_before = Pt(0)
                p.paragraph_format.space_after = Pt(0)
                p.paragraph_format.line_spacing = 1.15
                if align_cols and c_idx in align_cols:
                    p.alignment = align_cols[c_idx]
                run = p.add_run(str(val))
                run.font.name = "Segoe UI"
                run.font.size = Pt(8.5)
                run.font.color.rgb = DARK

        sp = doc.add_paragraph()
        sp.paragraph_format.space_before = Pt(0)
        sp.paragraph_format.space_after = Pt(6)

    # ==========================================
    # 1. COVER PAGE
    # ==========================================
    logo_path = r'c:\Users\gouta\Desktop\silver star\report\extracted_media\silverstar_logo.png'
    if os.path.exists(logo_path):
        p_logo = doc.add_paragraph()
        p_logo.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p_logo.paragraph_format.space_before = Pt(10)
        p_logo.paragraph_format.space_after = Pt(20)
        run_logo = p_logo.add_run()
        run_logo.add_picture(logo_path, width=Inches(2.4))

    p_bar = doc.add_paragraph()
    p_bar.paragraph_format.space_before = Pt(30)
    p_bar.paragraph_format.space_after = Pt(4)
    run_bar = p_bar.add_run("SYSTEM PROPOSAL REPORT — FACILITY MANAGEMENT APPLICATION")
    run_bar.font.name = "Segoe UI"
    run_bar.font.size = Pt(11)
    run_bar.font.bold = True
    run_bar.font.color.rgb = CYAN

    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(8)
    run_title = p_title.add_run("Integrated Facility Management\nWeb Platform & Mobile App Suite")
    run_title.font.name = "Segoe UI"
    run_title.font.size = Pt(25)
    run_title.font.bold = True
    run_title.font.color.rgb = NAVY

    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(30)
    run_sub = p_sub.add_run("Centralized Operations Command, HR Onboarding & eKYC, Geofenced Attendance Verification, Multi-Tenant Client Transparency, and 3rd-Party Cloud Services Cost Matrix.")
    run_sub.font.name = "Segoe UI"
    run_sub.font.size = Pt(11)
    run_sub.font.color.rgb = SLATE

    meta_table = doc.add_table(rows=6, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.LEFT
    meta_widths = [Inches(1.8), Inches(4.7)]
    meta_data = [
        ("Client Organization", "Silver Star Facility Management Pvt. Ltd."),
        ("Corporate Website", "https://silverstarindia.net/"),
        ("Operational Verticals", "Integrated Facility Management, Security Services, Electro-Mechanical AMC, Housekeeping"),
        ("Document Reference", "SSFM-TECH-PROP-2026-V1"),
        ("Prepared By", "Technology & Solutions Architecture Team"),
        ("Date & Version", "November 2026 | Version 1.0 (Production Architecture Proposal)")
    ]
    for idx, (lbl, val) in enumerate(meta_data):
        row = meta_table.rows[idx]
        trPr_m = row._tr.get_or_add_trPr()
        trPr_m.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))
        
        r_cells = row.cells
        r_cells[0].width = meta_widths[0]
        r_cells[1].width = meta_widths[1]
        set_cell_background(r_cells[0], LIGHT_BG_HEX)
        set_cell_background(r_cells[1], "FFFFFF")
        set_cell_padding(r_cells[0], top=60, bottom=60, left=100, right=100)
        set_cell_padding(r_cells[1], top=60, bottom=60, left=100, right=100)
        
        p0 = r_cells[0].paragraphs[0]
        p0.paragraph_format.space_before = Pt(0)
        p0.paragraph_format.space_after = Pt(0)
        r0 = p0.add_run(lbl)
        r0.font.name = "Segoe UI"
        r0.font.size = Pt(9.5)
        r0.font.bold = True
        r0.font.color.rgb = DARK
        
        p1 = r_cells[1].paragraphs[0]
        p1.paragraph_format.space_before = Pt(0)
        p1.paragraph_format.space_after = Pt(0)
        r1 = p1.add_run(val)
        r1.font.name = "Segoe UI"
        r1.font.size = Pt(9.5)
        r1.font.color.rgb = DARK

    set_table_borders(meta_table, color="E2E8F0", sz="4")

    p_cov_bot = doc.add_paragraph()
    p_cov_bot.paragraph_format.space_before = Pt(60)
    p_cov_bot.paragraph_format.space_after = Pt(0)
    r_cov_bot = p_cov_bot.add_run("CONFIDENTIAL & PROPRIETARY — PREPARED EXCLUSIVELY FOR SILVER STAR FACILITY MANAGEMENT PVT. LTD.")
    r_cov_bot.font.name = "Segoe UI"
    r_cov_bot.font.size = Pt(8.5)
    r_cov_bot.font.bold = True
    r_cov_bot.font.color.rgb = GRAY

    doc.add_page_break()

    # ==========================================
    # HEADER & FOOTER SETUP
    # ==========================================
    body_section = doc.sections[0]
    header = body_section.header
    p_hdr = header.paragraphs[0]
    p_hdr.paragraph_format.space_after = Pt(4)
    r_hdr = p_hdr.add_run("Silver Star Facility Management Pvt. Ltd. | System Proposal & Commercial Report")
    r_hdr.font.name = "Segoe UI"
    r_hdr.font.size = Pt(8.5)
    r_hdr.font.color.rgb = GRAY
    
    p_hdrPr = p_hdr._p.get_or_add_pPr()
    pBdr = parse_xml(f'<w:pBdr {nsdecls("w")}><w:bottom w:val="single" w:sz="6" w:space="1" w:color="{BORDER_HEX}"/></w:pBdr>')
    p_hdrPr.append(pBdr)

    footer = body_section.footer
    p_ftr = footer.paragraphs[0]
    p_ftr.paragraph_format.space_before = Pt(4)
    r_ftr_left = p_ftr.add_run("Confidential — For Internal & Client Evaluation Only\tPage ")
    r_ftr_left.font.name = "Segoe UI"
    r_ftr_left.font.size = Pt(8.5)
    r_ftr_left.font.color.rgb = GRAY
    
    r_page = p_ftr.add_run()
    r_page.font.name = "Segoe UI"
    r_page.font.size = Pt(8.5)
    r_page.font.color.rgb = GRAY
    fld1 = parse_xml(r'<w:fldChar %s w:fldCharType="begin"/>' % nsdecls('w'))
    instr1 = parse_xml(r'<w:instrText %s xml:space="preserve"> PAGE </w:instrText>' % nsdecls('w'))
    fld2 = parse_xml(r'<w:fldChar %s w:fldCharType="separate"/>' % nsdecls('w'))
    fld3 = parse_xml(r'<w:fldChar %s w:fldCharType="end"/>' % nsdecls('w'))
    r_page._r.append(fld1)
    r_page._r.append(instr1)
    r_page._r.append(fld2)
    r_page._r.append(fld3)

    r_of = p_ftr.add_run(" of ")
    r_of.font.name = "Segoe UI"
    r_of.font.size = Pt(8.5)
    r_of.font.color.rgb = GRAY

    r_numpages = p_ftr.add_run()
    r_numpages.font.name = "Segoe UI"
    r_numpages.font.size = Pt(8.5)
    r_numpages.font.color.rgb = GRAY
    fld4 = parse_xml(r'<w:fldChar %s w:fldCharType="begin"/>' % nsdecls('w'))
    instr2 = parse_xml(r'<w:instrText %s xml:space="preserve"> NUMPAGES </w:instrText>' % nsdecls('w'))
    fld5 = parse_xml(r'<w:fldChar %s w:fldCharType="separate"/>' % nsdecls('w'))
    fld6 = parse_xml(r'<w:fldChar %s w:fldCharType="end"/>' % nsdecls('w'))
    r_numpages._r.append(fld4)
    r_numpages._r.append(instr2)
    r_numpages._r.append(fld5)
    r_numpages._r.append(fld6)

    p_ftrPr = p_ftr._p.get_or_add_pPr()
    pBdrFtr = parse_xml(f'<w:pBdr {nsdecls("w")}><w:top w:val="single" w:sz="6" w:space="1" w:color="{BORDER_HEX}"/></w:pBdr>')
    p_ftrPr.append(pBdrFtr)

    # ==========================================
    # 2. EXECUTIVE SUMMARY & OBJECTIVES
    # ==========================================
    add_heading_1("1. Executive Summary & Strategic Objective")
    
    add_body("Silver Star Facility Management Pvt. Ltd. (silverstarindia.net) is an established integrated facility management enterprise delivering comprehensive solutions—including corporate housekeeping, physical guarding and electronic surveillance, electro-mechanical maintenance (AMC), utility management, and industrial support staffing—across major technology hubs such as Bangalore, New Delhi, and pan-India.", bold_prefix="Company Background: ")

    add_body("As Silver Star scales its workforce deployment across diverse corporate tech parks, pharmaceutical plants, commercial high-rises, and educational institutions, managing operations using fragmented manual logs or disconnected attendance machines introduces substantial operational bottlenecks. Primary friction points include muster roll reconciliation delays, potential buddy-punching, unverified employee identity records, manual shift scheduling conflicts, and lack of real-time client visibility into on-site staffing.", bold_prefix="The Operational Challenge: ")

    add_body("This document presents the complete technical and commercial proposal for the custom-architected Silver Star Digital Platform. The platform establishes a centralized, high-security operational ecosystem connecting three specialized web management portals (Super Admin, HR, Operations) with two native mobile application experiences (Client App and Employee App), driven by an event-based GPS geofencing verification engine, automated digital eKYC onboarding, and a single source of truth relational database.", bold_prefix="The Digital Solution: ")

    add_callout(
        "The proposed digital platform guarantees complete role-based access control (RBAC), zero data exposure across client boundaries, tamper-resistant GPS attendance logging, automated ID-card issuance with dynamic QR codes, and full transparency for corporate clients through dedicated mobile dashboards.",
        bold_title="CORE PROPOSITION:"
    )

    obj_headers = ["Strategic Pillar", "Operational Impact", "Key Metric / Deliverable"]
    obj_data = [
        ["Paperless Digital Onboarding", "Eliminates physical dossier delays; validates credentials via Aadhaar Secure QR / DigiLocker before site dispatch.", "100% digital KYC compliance; unique ID & QR generation."],
        ["GPS Geofenced Attendance", "Restricts punch-in/out strictly within authorized physical site perimeters (e.g. 50-100m radius).", "Zero buddy-punching; tamper-proof GPS and time stamp."],
        ["Client Trust & Transparency", "Corporate clients receive live visibility of on-duty personnel, shift attendance, and daily work reports.", "Client Mobile App with real-time present/absent counters."],
        ["Operations Command & Control", "Coordinates workforce deployment, shift rosters, incident management, and site-level supervision.", "Unified Operations Panel linking HR-approved staff to sites."],
        ["Cost-Optimized Architecture", "Utilizes Silver Star's existing AWS cloud infrastructure (₹0 net cloud addition) plus free tier quotas (Aadhaar Secure QR offline verification, Firebase FCM, Google Maps India tier).", "Predictable net running cost of only ~₹2,250 INR/month for 500 staff."]
    ]
    style_table(doc.add_table(rows=1, cols=3), [Inches(1.8), Inches(3.0), Inches(1.7)], obj_headers, obj_data)

    # ==========================================
    # 3. PLATFORM ARCHITECTURE & SYSTEM TOPOLOGY
    # ==========================================
    add_heading_1("2. Platform Architecture & System Topology")
    
    add_body("The platform is engineered around a unified, microservices-ready modular monolith architecture where all internal web panels and external mobile apps communicate securely through a centralized REST API gateway. The architecture ensures strict multi-tenant data boundaries, complete role segregation, and horizontal scalability.")

    arch_img_path = r'c:\Users\gouta\Desktop\silver star\report\extracted_media\image1.png'
    add_image_box(arch_img_path, "Figure 1: High-Level Architectural Topology of the Silver Star Digital Platform")

    add_heading_2("2.1 Platform Core Layers & Technical Stack")
    add_body("The technical stack has been selected to ensure maximum performance, long-term code maintainability, bank-grade data security, and seamless mobile cross-platform execution on both Android and iOS:")

    tech_headers = ["Architecture Layer", "Recommended Technology", "Purpose & Architectural Role"]
    tech_data = [
        ["Web Frontend", "React.js with TypeScript", "Powers Super Admin, HR, and Operations management web panels with strong typing, component reusability, and responsive layouts."],
        ["Mobile Frontend", "React Native", "Delivers unified cross-platform mobile apps for both Client and Employee experiences with native device location and camera access."],
        ["Backend / REST API", "Python FastAPI", "Provides asynchronous, high-throughput business logic execution, authentication, permission enforcement, attendance math, and integrations."],
        ["Database Layer", "PostgreSQL (Managed RDS)", "Central ACID-compliant relational data store with spatial extensions for coordinate distance calculation and foreign key integrity."],
        ["Object & Media Storage", "AWS S3 (Mumbai Region)", "Encrypted cloud bucket storage for employee photographs, verified KYC documents, daily work reports, and generated ID-card PDFs."],
        ["Cloud Hosting Infrastructure", "AWS Mumbai (ap-south-1)", "Hosted on Silver Star's existing enterprise AWS account (leveraging client-owned compute, RDS PostgreSQL, and S3 storage; ₹0 new cloud procurement)."],
        ["Push Notification Engine", "Firebase Cloud Messaging (FCM) & APNs", "Delivers immediate transactional alerts, shift schedule updates, and urgent operational notices to mobile devices."],
        ["Maps & Geolocation", "Google Maps Platform", "Enables interactive site pin selection and geofence boundary visualization in Operations; coordinates matched against device GPS."],
        ["PDF & QR Engine", "Python ReportLab & PyQRCode", "Automates dynamic rendering of employee ID cards, secure QR embedding, and downloadable attendance audit reports."]
    ]
    style_table(doc.add_table(rows=1, cols=3), [Inches(1.5), Inches(2.0), Inches(3.0)], tech_headers, tech_data)

    add_heading_2("2.2 Application Data Flow & Boundary Enforcement")
    add_bullet("All three web management panels and both mobile apps communicate strictly through the central FastAPI backend over TLS 1.3 encrypted HTTPS endpoints.", bold_prefix="Secured API Ingestion: ")
    add_bullet("Hiding screens or UI elements in the frontend is explicitly rejected as a security model; the backend strictly enforces role-based access control (RBAC) and client-level data boundaries on every API request.", bold_prefix="Server-Side Authorization: ")
    add_bullet("Employee profiles created and reviewed by HR become deployable only upon formal approval status change to 'Approved'. Operations cannot deploy unverified or rejected candidates.", bold_prefix="Strict Stage-Gate Handoff: ")
    add_bullet("The Employee Mobile App queries current site assignment and shift schedule metadata during each punch attempt, ensuring attendance cannot be submitted against deactivated sites or outside shift windows.", bold_prefix="Dynamic Geofence Verification: ")
    add_bullet("Client users are strictly scoped to their assigned organization ID. SQL queries enforce tenancy constraints preventing any client from viewing another client's sites, headcounts, or records.", bold_prefix="Multi-Tenant Isolation: ")

    # ==========================================
    # 4. SUPER ADMIN PORTAL
    # ==========================================
    doc.add_page_break()
    add_heading_1("3. Super Admin Portal – Complete Structure & Executive KPIs")
    
    add_body("The Super Admin Portal serves as the primary governance center for executive leadership and system administrators, providing 360-degree organizational visibility, system configurations, compliance tracking, and overall facility health metrics.")

    add_heading_2("3.1 Executive Dashboard Operational KPIs")
    add_body("The admin dashboard aggregates real-time data across all branches and client facilities into 11 core KPIs:")
    
    kpi_headers = ["No.", "Executive KPI Metric", "Operational Definition & Governance Value"]
    kpi_data = [
        ["1", "Total Active Employees", "Total number of active personnel on company rolls across all service verticals."],
        ["2", "New Registrations (MTD)", "Volume of candidate profiles onboarded during the current billing month."],
        ["3", "KYC Pending Verification", "Total employees awaiting identity document or Aadhaar verification approval."],
        ["4", "Employees Deployed", "Workforce actively assigned to revenue-generating client contracts and sites."],
        ["5", "Employees Not Deployed", "Buffer / bench workforce available for immediate deployment or relief shifts."],
        ["6", "Present vs. Absent Today", "Real-time attendance ratio aggregated across all operating client sites."],
        ["7", "Active Client Contracts", "Total valid commercial agreements currently serviced with active SLAs."],
        ["8", "Active Work Locations", "Physical geofenced client properties actively monitored in the system."],
        ["9", "Pending Client Complaints", "Logged service escalations, maintenance tickets, or customer issues awaiting resolution."],
        ["10", "Pending Approvals", "Workflow stage-gates requiring management sign-off (onboarding, corrections, transfers)."],
        ["11", "Monthly Manpower Cost", "Consolidated gross workforce expenditure linked to attendance hours and payroll inputs."]
    ]
    style_table(doc.add_table(rows=1, cols=3), [Inches(0.6), Inches(2.3), Inches(3.6)], kpi_headers, kpi_data)

    add_heading_2("3.2 Complete 14-Module Admin Portal Structure")
    add_body("The table below specifies the complete structural architecture of the Super Admin web application (Proposal 1, Table 0):")

    admin_headers = ["Module No.", "Admin Module Name", "Core Functional Features & Administrative Capabilities"]
    admin_data = [
        ["1", "Executive Dashboard", "Consolidated business overview, operational KPI widgets, shift status, and urgent compliance alerts."],
        ["2", "Client Management", "Create and manage client profiles, commercial contracts, branches, service agreements, and client portal user credentials."],
        ["3", "Employee Management", "Central master directory of all staff profiles, employment status, historical service records, and contact archives."],
        ["4", "Employee Onboarding", "End-to-end management of new candidate registrations, document collection, digital eKYC status, and approval queues."],
        ["5", "Attendance Management", "Central attendance ledger, real-time check-in/out records, anomaly detection, late marks, and supervisor correction workflows."],
        ["6", "Geofencing & Sites", "Master registry of all client facilities, GPS coordinates, perimeter radius definitions, and geospatial exception logs."],
        ["7", "Workforce Deployment", "Organization-wide deployment matrix, cross-branch allocation, supervisor mapping, and relief staff assignments."],
        ["8", "ID Card Management", "Automated batch generation, QR code encryption, digital download, physical print queue, and deactivation on termination."],
        ["9", "Document Management", "Secure cloud repository for compliance documents, licenses, contracts, KYC records, and client service certifications."],
        ["10", "Reports & Analytics", "Cross-tabular reporting engine generating attendance, billing readiness, overtime, muster rolls, and SLA adherence exports."],
        ["11", "Billing & Contracts", "Contract duration tracking, billing milestone reminders, rate card mapping, and attendance-backed invoicing inputs."],
        ["12", "User & Role Management", "Granular Role-Based Access Control (RBAC) configuring permissions across Super Admin, HR, Operations, and Clients."],
        ["13", "Notifications Engine", "Broadcast system for company-wide bulletins, policy updates, urgent emergency alerts, and system-wide notifications."],
        ["14", "System Settings", "Configuration of organization details, branch hierarchies, default geofence parameters, shift rules, and API keys."]
    ]
    style_table(doc.add_table(rows=1, cols=3), [Inches(1.0), Inches(2.0), Inches(3.5)], admin_headers, admin_data)

    # ==========================================
    # 5. HR MANAGEMENT PANEL
    # ==========================================
    doc.add_page_break()
    add_heading_1("4. HR Management Panel – Workforce Lifecycle & Digital Onboarding")
    
    add_body("The HR Panel is dedicated to managing the human capital foundation of Silver Star. It guarantees that every employee deployed to client premises is legally verified, thoroughly vetted, issued a tamper-proof digital ID card, and maintained in full statutory compliance.")

    add_heading_2("4.1 Complete 11-Module HR Panel Structure")
    add_body("The HR web panel comprises 11 functional modules configured in the application navigation (Proposal 1, Table 1):")

    hr_headers = ["Module No.", "HR Panel Module", "Detailed Operational Capabilities & HR Scope"]
    hr_data = [
        ["1", "HR Dashboard", "Workforce statistics, monthly recruitment trends, onboarding funnel KPIs, pending verifications, and compliance alerts."],
        ["2", "Employee Onboarding", "Register new candidates, capture detailed personal and demographic records, initiate verification workflows."],
        ["3", "Employee Directory", "Search, filter, view, edit, and maintain active and past employee profiles, performance history, and departmental tags."],
        ["4", "eKYC Verification", "Aadhaar Secure QR offline verification, DigiLocker pull, or authorized eKYC gateway status tracking and audit history."],
        ["5", "Document Management", "Upload, inspect, approve, or reject identity proofs, address documents, educational certificates, and police clearances."],
        ["6", "Employee ID Cards", "Generate standardized company ID cards featuring staff photo, unique ID, job role, and encrypted verification QR code."],
        ["7", "Client & Site Mapping", "Review site deployments from an HR perspective; verify statutory compliance before personnel dispatch to specific clients."],
        ["8", "Departments & Roles", "Configure organizational structure, departments (Housekeeping, Security, Electro-Mechanical), and designation ladders."],
        ["9", "Payroll Information", "Maintain bank account details, statutory PF/ESI identifiers, pay structure inputs, and gross billing parameters."],
        ["10", "HR Reports", "Generate statutory compliance reports, onboarding turn-around time (TAT), document expiry logs, and attrition statistics."],
        ["11", "HR Access Controls", "Manage HR sub-roles (Recruiter, Compliance Officer, Payroll Admin) with restricted data visibility."]
    ]
    style_table(doc.add_table(rows=1, cols=3), [Inches(1.0), Inches(2.0), Inches(3.5)], hr_headers, hr_data)

    add_heading_2("4.2 The 9-Step Standardized Employee Onboarding Workflow")
    add_body("To eliminate unauthorized deployments and ensure 100% compliance, the platform enforces a strict 9-step stage-gate onboarding workflow:")

    wf_img_path = r'c:\Users\gouta\Desktop\silver star\report\charts\workflow_onboarding.png'
    add_image_box(wf_img_path, "Figure 2: Silver Star Digital Workforce Onboarding & Compliance Pipeline")

    add_bullet("HR initiates the onboarding record by creating an entry in the system with primary contact information and basic biographical tags.", bold_prefix="1. Employee Registration: ")
    add_bullet("System captures full legal name, date of birth, gender, passport-size photograph, primary/secondary mobile numbers, permanent and current address, emergency contact, designation, and department.", bold_prefix="2. Demographic & Profile Capture: ")
    add_bullet("HR collects and uploads digital copies of approved identity proofs (Aadhaar / Voter ID / Driving License), address proofs, education certificates, and prior employment service records.", bold_prefix="3. Document Collection: ")
    add_bullet("Verification is executed using UIDAI Aadhaar Secure QR offline scanning or authorized DigiLocker integration. Verification reference is captured without storing raw unmasked Aadhaar numbers.", bold_prefix="4. Digital eKYC Verification: ")
    add_bullet("Designated HR officer reviews all captured data, cross-checks document clarity against KYC outcomes, and marks candidate as 'Approved' or 'Rejected' with mandatory justification.", bold_prefix="5. HR Review & Approval Gate: ")
    add_bullet("Upon approval, the system algorithmically generates an immutable, unique Employee ID (e.g., SS-10482) based on branch, vertical, and sequence logic.", bold_prefix="6. Employee ID Generation: ")
    add_bullet("The system automatically compiles a high-resolution, print-ready PDF ID card incorporating company branding, employee photograph, unique ID, designation, emergency contact, and a tamper-resistant QR code.", bold_prefix="7. Digital QR ID Card Generation: ")
    add_bullet("The backend automatically provisions an Employee Mobile App account using the Employee ID as the username and securely dispatches temporary login credentials via SMS.", bold_prefix="8. Secure Account Provisioning: ")
    add_bullet("The approved profile is instantly published to the Operations Panel pool as an available, verified resource ready for client site deployment and shift scheduling.", bold_prefix="9. Operations Handover: ")

    add_heading_2("4.3 Employee Onboarding Form – Required Data Fields")
    add_body("The table below details the mandatory data schema enforced during candidate registration (Proposal 1, Table 2):")

    schema_headers = ["Information Section", "Mandatory Captured Fields & Statutory Verification Purpose"]
    schema_data = [
        ["Personal Details", "Legal Full Name, Date of Birth, Gender, Marital Status, Blood Group, and high-resolution passport-style photograph."],
        ["Contact Details", "Primary Mobile Number (OTP validated), Alternate Contact, Personal Email, Permanent Residential Address with PIN Code, Current Local Address."],
        ["Emergency Details", "Emergency Contact Person Name, Primary Relationship (Spouse, Parent, Kin), Primary Phone Number, and Alternative Address."],
        ["Employment Details", "Designation (e.g., Security Guard, Housekeeping Attendant, HVAC Technician), Department, Employment Type (Permanent / Contract), Joining Date."],
        ["Identity Verification", "Selected KYC Method (Aadhaar Secure QR / DigiLocker / Authorized eKYC), Verification Reference Token, Verification Date & Officer."],
        ["Documents Repository", "Uploaded high-resolution PDF/JPEG files of Photo ID, Address Proof, Educational Qualification, Police Verification Certificate (if mandatory)."],
        ["Bank & Statutory Details", "Bank Name, Account Holder Name, Account Number, IFSC Code (for direct payroll transfer; collected securely only where payroll is integrated)."],
        ["System Credentials", "Auto-generated Unique Employee ID, Login Status (Active / Inactive), Initial Temporary Password, Role Assignment (Employee)."]
    ]
    style_table(doc.add_table(rows=1, cols=2), [Inches(2.2), Inches(4.3)], schema_headers, schema_data)

    # ==========================================
    # 6. OPERATIONS PANEL
    # ==========================================
    doc.add_page_break()
    add_heading_1("5. Operations Panel – Workforce Deployment & Site Management")
    
    add_body("The Operations Panel provides operational command for field managers, area supervisors, and operations executives. It enables precise workforce deployment, geospatial site setup, shift roster management, and daily service delivery monitoring.")

    add_heading_2("5.1 Operations Panel Structure")
    add_body("The Operations web application incorporates 10 operational modules (Proposal 1, Table 3):")

    ops_headers = ["Module No.", "Operations Module", "Field Operations Capabilities & Dispatch Features"]
    ops_data = [
        ["1", "Operations Dashboard", "Real-time field operations overview, active site deployments, live punch rates, shortfall alerts, and urgent incidents."],
        ["2", "Client & Site Management", "Registry of client properties, geofenced facility coordinates, site operational contacts, and physical boundary parameters."],
        ["3", "Workforce Deployment", "Deploy HR-approved personnel to specific client sites, job roles, shift timings, and reporting field supervisors."],
        ["4", "Employee Directory", "Live view of all verified, deployable staff; check current assignment status, site allocation history, and bench availability."],
        ["5", "Geofencing & GPS Setup", "Interactive map interface to drop pins on client facilities, establish geofence radius (e.g., 50-100m), and review breach logs."],
        ["6", "Task & Shift Management", "Create, schedule, and assign daily, weekly, and monthly operational tasks and shift rosters across client locations."],
        ["7", "Daily Work Reports (DWR)", "Field supervisors submit, inspect, and approve daily operational reports, equipment maintenance logs, and consumables usage."],
        ["8", "Incident Management", "Log, categorize, escalate, and resolve security alerts, workplace accidents, property damage, or client complaints."],
        ["9", "Operations Reports", "Comprehensive operational reporting covering site-wise attendance strength, punctuality, shift deviations, and overtime hours."],
        ["10", "Field Audit Logs", "Immutable audit trail recording all manual shift adjustments, supervisor overrides, and site reassignment events."]
    ]
    style_table(doc.add_table(rows=1, cols=3), [Inches(1.0), Inches(2.0), Inches(3.5)], ops_headers, ops_data)

    add_heading_2("5.2 Workforce Deployment & Shift Scheduling Rules")
    add_bullet("Only personnel whose onboarding status has been formally marked 'Approved' in the HR Panel appear in the deployable workforce roster.", bold_prefix="HR Stage-Gate Dependency: ")
    add_bullet("Operations managers configure work shifts with defined start time, end time, grace periods (e.g., 15 minutes for check-in), and effective calendar dates.", bold_prefix="Shift Roster Configuration: ")
    add_bullet("The system algorithmically prevents overlapping assignments, ensuring no single employee is scheduled across two distant sites or conflicting shifts on the same workday.", bold_prefix="Conflict Prevention Engine: ")
    add_bullet("Maintains a permanent, date-stamped transfer history showing when an employee was deployed, relieved, transferred between facilities, or designated as relief coverage.", bold_prefix="Assignment Audit Trail: ")

    # ==========================================
    # 7. GPS GEOFENCING & ATTENDANCE ENGINE
    # ==========================================
    doc.add_page_break()
    add_heading_1("6. GPS Geofencing & Real-Time Attendance Verification Engine")
    
    add_body("The GPS Geofencing Attendance Engine replaces unreliable paper registers and fixed biometric hardware with an event-driven, mobile-native geospatial verification pipeline.")

    geo_img_path = r'c:\Users\gouta\Desktop\silver star\report\extracted_media\image2.jpeg'
    add_image_box(geo_img_path, "Figure 3: Operational Geofencing Principle — Permitted vs. Blocked Attendance Zones", width=Inches(4.8))

    geo_flow_path = r'c:\Users\gouta\Desktop\silver star\report\charts\geofence_flowchart.png'
    add_image_box(geo_flow_path, "Figure 4: GPS Geofenced Attendance Verification Decision Pipeline", width=Inches(5.5))

    add_heading_2("6.1 How GPS Geofencing Works in Practice")
    add_bullet("Operations selects the client facility on the web map or inputs surveyed GPS latitude and longitude coordinates.", bold_prefix="1. Site Geofence Creation: ")
    add_bullet("Operations sets a circular geofence boundary around the physical facility (e.g., 50 meters, 100 meters, or custom perimeter based on site area).", bold_prefix="2. Perimeter Configuration: ")
    add_bullet("The assigned employee arrives on-site and opens the Employee Mobile App to select 'Punch In'.", bold_prefix="3. Location Acquisition: ")
    add_bullet("The app captures the high-accuracy device GPS coordinates along with reported accuracy radius and dispatches a signed payload over HTTPS.", bold_prefix="4. Backend Geospatial Math: ")
    add_bullet("The backend computes the exact spherical distance between the device coordinates and the configured site center using the Haversine formula.", bold_prefix="5. Boundary Evaluation: ")
    add_bullet("If the calculated distance is less than or equal to the site radius, the punch is registered, date-stamped, and confirmed on screen. If outside, the punch is blocked.", bold_prefix="6. Verification Outcome: ")
    add_bullet("Verified attendance instantly updates the Operations Panel, HR attendance ledger, and the Client Mobile App dashboard.", bold_prefix="7. Instant Portal Synchronization: ")

    add_heading_2("6.2 Technical Safeguards, Privacy & Exception Handling")
    add_callout(
        "To preserve mobile battery life, respect employee privacy, and comply with mobile OS background execution restrictions, the platform utilizes Event-Based Geolocation Checks. GPS hardware is queried strictly at the exact moments the employee taps 'Punch In' or 'Punch Out'. Continuous background tracking is deliberately avoided.",
        bold_title="BATTERY & PRIVACY ARCHITECTURE:"
    )

    add_bullet("The mobile app checks for mock location flags and developer-mode GPS spoofing tools on the operating system, rejecting punches generated by spoofed coordinates.", bold_prefix="Anti-Spoofing & Mock Location: ")
    add_bullet("Every GPS payload includes an accuracy metric (in meters). If GPS signal degradation occurs (e.g. inside a basement or reinforced concrete structure) exceeding the configured tolerance threshold, the app alerts the user to step into an open area.", bold_prefix="Accuracy Threshold Filtering: ")
    add_bullet("In rare cases of genuine device hardware failure or total GPS unavailability, field supervisors can submit a manual attendance adjustment. Every manual adjustment mandates an explicit reason code, supervisor ID, and permanent audit entry.", bold_prefix="Supervisor Exception Workflow: ")
    add_bullet("The engine enforces state validation to prevent accidental duplicate punch-ins or unclosed shifts, maintaining attendance record integrity.", bold_prefix="Duplicate Punch Prevention: ")

    # ==========================================
    # 8. CLIENT MOBILE APPLICATION
    # ==========================================
    doc.add_page_break()
    add_heading_1("7. Client Mobile Application – Real-Time Service Transparency")
    
    add_body("The Client Mobile App is a dedicated mobile interface for Silver Star's corporate clients (e.g., facility directors, property managers, admin heads), giving them live visibility into the workforce deployed at their properties.")

    add_heading_2("7.1 Client Mobile App Scope & Feature Matrix")
    add_body("The client app is focused on transparency, SLA monitoring, and real-time attendance tracking (Proposal 1, Table 4):")

    client_headers = ["Module No.", "Client App Feature", "Operational Value for Corporate Clients"]
    client_data = [
        ["1", "Secure Client Login", "Authenticated mobile access using enterprise credentials provisioned and authorized by Silver Star Super Admin."],
        ["2", "Live Status Dashboard", "Executive summary showing Total Deployed Workforce, Present Staff Today, Absent Count, and Assigned Locations."],
        ["3", "Employee Deployment View", "Full roster of personnel actively assigned to the client's premises, categorized by site, shift, and designation."],
        ["4", "Real-Time Site Attendance", "Real-time stream of employee punch-in and punch-out events, punctuality indicators, and shift coverage."],
        ["5", "Site Details & Shift Strength", "Drill-down into specific client properties showing sanctioned vs. actual deployed workforce strength at each location."],
        ["6", "Attendance Reports & Exports", "Generate and download daily muster summaries, weekly trends, and monthly billing-ready attendance sheets in PDF/Excel."],
        ["7", "Service Notifications", "Instant mobile alerts regarding shift commencement, critical staffing shortages, emergency notices, or supervisor updates."],
        ["8", "Profile & Security", "Manage client contact details, change security passwords, review active sessions, and secure logout."]
    ]
    style_table(doc.add_table(rows=1, cols=3), [Inches(1.0), Inches(2.0), Inches(3.5)], client_headers, client_data)

    add_heading_2("7.2 Sample Client Deployment Screen Data Layout")
    add_body("Below is the structured data presentation visible to client facility managers (Proposal 1, Table 5):")

    sample_headers = ["Employee ID", "Employee Name", "Designation / Role", "Assigned Client Site"]
    sample_data = [
        ["SS1001", "Employee A", "Housekeeping Attendant", "Site A (Tech Park Campus)"],
        ["SS1002", "Employee B", "Security Guard", "Site A (Tech Park Campus)"],
        ["SS1003", "Employee C", "Electro-Mechanical Technician", "Site B (Corporate Tower)"],
        ["SS1004", "Employee D", "Housekeeping Supervisor", "Site B (Corporate Tower)"]
    ]
    style_table(doc.add_table(rows=1, cols=4), [Inches(1.2), Inches(1.8), Inches(2.0), Inches(1.5)], sample_headers, sample_data)

    add_heading_2("7.3 Strict Client Security & Data Isolation Boundaries")
    add_bullet("Clients have strictly scoped read-only visibility into their own contracted sites and assigned personnel.", bold_prefix="Strict Tenancy Isolation: ")
    add_bullet("Client users are strictly prohibited from viewing sensitive personal documents, unmasked Aadhaar details, KYC files, employee bank accounts, or pay rate data.", bold_prefix="Confidentiality Protection: ")
    add_bullet("To maintain client simplicity and focus, the initial client app explicitly excludes employee recruitment, payroll editing, and internal task dispatches.", bold_prefix="Focused Scope: ")

    # ==========================================
    # 9. EMPLOYEE MOBILE APPLICATION
    # ==========================================
    add_heading_1("8. Employee Mobile Application – Workforce Self-Service")
    
    add_body("The Employee Mobile App provides an intuitive, rugged mobile utility designed for on-ground facility staff—including security guards, housekeeping attendants, and technical maintenance personnel.")

    add_heading_2("8.1 Core Functional Capabilities")
    add_bullet("Staff log in using their unique Employee ID and temporary or established password. Includes secure password reset via registered mobile number.", bold_prefix="1. Secure Login & Authentication: ")
    add_bullet("Clean visual home screen showing employee name, official photograph, employee ID, job designation, reporting supervisor name, and current site assignment.", bold_prefix="2. Profile & Shift Overview: ")
    add_bullet("Prominent 'Punch In' and 'Punch Out' actions. Tapping initiates immediate GPS query, boundary distance check, and confirmation toast.", bold_prefix="3. Geofenced Attendance Action: ")
    add_bullet("Displays confirmation dialog showing recorded punch timestamp, location name, and shift status. If outside the geofence, provides an explicit message indicating distance to boundary.", bold_prefix="4. Real-Time Feedback & Exceptions: ")
    add_bullet("Displays basic attendance status for the current workday and previous shifts within the current pay cycle.", bold_prefix="5. Daily History View: ")

    add_heading_2("8.2 Scope Boundary for Initial Release")
    add_callout(
        "To maximize frontline adoption, minimize training overhead, and ensure flawless performance across entry-level budget Android smartphones, the initial release of the Employee Mobile App deliberately focuses exclusively on Identity Display, Shift Verification, and Geofenced Attendance. Complex ancillary modules (leave applications, salary advance requests, internal chat, document uploaders) are intentionally deferred to future updates.",
        bold_title="DESIGN PHILOSOPHY:"
    )

    # ==========================================
    # 10. THIRD-PARTY SERVICES & ONLINE PRICING
    # ==========================================
    doc.add_page_break()
    add_heading_1("9. Third-Party Services, API Integrations & Comprehensive Online Pricing")
    
    add_body("To provide total commercial clarity and eliminate hidden operating costs, this section presents verified online pricing, billing structures, and projected monthly operational expenditures for all required third-party services and APIs. All costs are presented exclusively in Indian Rupees (INR ₹).")

    add_callout(
        "Silver Star Facility Management Pvt. Ltd. already possesses and actively maintains enterprise AWS Cloud infrastructure. Therefore, the digital platform will be deployed directly within Silver Star's existing AWS cloud environment, resulting in ₹0 Net New Cloud Procurement Cost for this project. For full budgetary transparency and organizational benchmarking, standalone reference pricing is also provided below detailing what the cloud infrastructure would cost if it were not already available.",
        bold_title="EXISTING INFRASTRUCTURE SAVINGS:"
    )

    cost_chart_path = r'c:\Users\gouta\Desktop\silver star\report\charts\cost_projection.png'
    add_image_box(cost_chart_path, "Figure 5: Monthly 3rd-Party Operational Costs — Actual Net Expenditure vs. Standalone Cloud Reference (INR)", width=Inches(5.8))

    add_heading_2("9.1 Detailed Analysis of Third-Party Services & Verified Rates (INR)")

    # AWS
    add_heading_3("1. Cloud Hosting & Storage Infrastructure (Amazon Web Services — Mumbai Region ap-south-1)")
    add_body("Silver Star's application workloads, PostgreSQL relational database, and encrypted document storage will be hosted directly within Silver Star's existing AWS Mumbai cloud environment. Because this infrastructure is already owned and maintained by the client, zero additional monthly cloud hosting procurement is required from this project.")
    
    add_body("Reference Cost (If Provisioned Afresh): For organizational benchmarking and audit completeness, the table below outlines the market cost of provisioning a dedicated AWS production environment in Mumbai (ap-south-1) if it were not already available:")
    
    aws_sub_headers = ["AWS Cloud Component", "Recommended Configuration", "Unit Rate (INR)", "Standalone Cost (INR / Month)"]
    aws_sub_data = [
        ["EC2 Application Compute", "t4g.small (2 vCPU, 2 GiB RAM, Graviton2)", "~₹0.95 INR / hour", "~₹680 INR / month"],
        ["EC2 Root Storage", "20 GB General Purpose SSD (gp3)", "~₹6.70 INR / GB-month", "~₹135 INR / month"],
        ["RDS Managed Database", "db.t4g.small PostgreSQL (Single-AZ)", "~₹2.68 INR / hour", "~₹1,950 INR / month"],
        ["RDS Storage & Backups", "20 GB gp3 + Automated Daily Snapshots", "~₹9.60 INR / GB-month", "~₹250 INR / month"],
        ["S3 Standard Object Storage", "Encrypted document & photo storage (up to 100 GB)", "~₹2.10 INR / GB-month", "~₹210 INR / month"],
        ["Route 53 & Network Egress", "Custom DNS routing, health checks, outbound transfer", "Standard pricing", "~₹235 INR / month"],
        ["Standalone Baseline Cloud Total", "Complete Production AWS Stack (ap-south-1)", "Pre-tax standalone reference", "~₹3,460 INR / month"],
        ["Silver Star Actual Monthly Cost", "Deployed on Silver Star's Existing AWS Cloud", "Client-Owned Account", "₹0.00 / month (Already Owned)"]
    ]
    style_table(doc.add_table(rows=1, cols=4), [Inches(1.8), Inches(2.2), Inches(1.2), Inches(1.3)], aws_sub_headers, aws_sub_data)
    add_body("Direct Client Savings: Because Silver Star already maintains this cloud environment, Silver Star saves ~₹3,460 to ~₹14,500 INR per month compared to an organization starting from scratch. Applicable GST (18%) on AWS is claimable as Input Tax Credit by registered businesses.", bold_prefix="Infrastructure Benefit: ")

    # Google Maps
    add_heading_3("2. Maps & Geolocation Services (Google Maps Platform — India Pricing Model)")
    add_body("Google Maps Platform retired the universal flat monthly credit and transitioned to an India-specific INR billing model with per-SKU free allowances and volume discounts:")
    add_bullet("Mobile Maps SDK for Android & iOS is completely FREE with unlimited mobile map views and camera pans on employee and client devices.", bold_prefix="Mobile Maps SDK: ")
    add_bullet("Under the India Essentials pricing tier, the first 70,000 Dynamic Maps and Geocoding requests per month are FREE. Beyond 70,000 calls, volume tiers charge ~₹0.15 to ₹0.28 INR per request.", bold_prefix="Web Map & Geocoding Allowance: ")
    add_bullet("Since geofence attendance verification calculates coordinates locally and on the backend using the Haversine formula (without invoking Google APIs on every punch), Google Maps calls are only generated when Operations views or edits site boundaries. Monthly baseline cost is ₹0.00 INR (100% covered under the free tier).", bold_prefix="Monthly Cost Projection: ")

    # eKYC
    add_heading_3("3. eKYC & Identity Verification Solutions (India Market Benchmarks)")
    add_body("Employee verification can be deployed using two complementary approaches based on operational budget:")
    add_bullet("Zero 3rd-party API fees (₹0.00 INR). The mobile app uses the camera to scan the official Aadhaar Secure QR code printed on the physical Aadhaar card or e-Aadhaar. The backend cryptographically validates the UIDAI digital signature using UIDAI's public key, extracting validated Name, DOB, Gender, Address, and Photo offline.", bold_prefix="Method A: Aadhaar Secure QR Offline Verification (Recommended): ")
    add_bullet("For remote or digital hiring, authorized Indian verification gateways (Cashfree Secure ID, Zoop.one, Surepass) charge pay-as-you-go rates: Aadhaar OTP / DigiLocker verification ranges from ₹2.00 to ₹4.50 INR per hit; PAN verification costs ₹1.00 to ₹2.50 INR per hit; Bank Account penny drop costs ₹1.50 to ₹3.50 INR per hit.", bold_prefix="Method B: Commercial Identity Verification APIs (Optional): ")

    # SMS / DLT
    add_heading_3("4. Transactional SMS, OTP & Regulatory Compliance (TRAI DLT)")
    add_body("To comply with Telecom Regulatory Authority of India (TRAI) regulations, all business transactional SMS traffic must be routed through registered Distributed Ledger Technology (DLT) headers:")
    add_bullet("One-time enterprise registration fee of ₹5,900 INR (inclusive of 18% GST) paid to a licensed telecom operator portal (Jio, Airtel, Vodafone Idea, or BSNL).", bold_prefix="TRAI DLT Registration: ")
    add_bullet("Through certified CPaaS aggregators such as MSG91 or Fast2SMS, transactional SMS and OTPs cost between ₹0.16 and ₹0.25 INR per SMS (+ 18% GST).", bold_prefix="Transactional Per-SMS Rate: ")
    add_bullet("Assuming 2 to 4 transactional messages per employee per month (credential issuance, password resets, critical alerts), a workforce of 500 staff incurs ~₹350 to ₹450 INR per month.", bold_prefix="Monthly SMS Projection: ")

    # Push notifications
    add_heading_3("5. Mobile Push Notification Engines (Firebase Cloud Messaging & APNs)")
    add_bullet("Firebase Cloud Messaging (FCM) is completely free and supports unlimited push notifications across all Android and iOS devices.", bold_prefix="FCM (Google): ")
    add_bullet("Included at no additional fee within the standard Apple Developer Program membership.", bold_prefix="APNs (Apple): ")
    add_bullet("₹0.00 INR / month across all deployment scales.", bold_prefix="Projected Cost: ")

    # App Stores
    add_heading_3("6. Mobile App Store Developer Distribution Accounts")
    add_bullet("One-time registration fee of ₹2,100 INR for lifetime distribution privileges on the Google Play Store.", bold_prefix="Google Play Console: ")
    add_bullet("Annual subscription of ~₹8,400 to ₹8,700 INR per year (equivalent to ~₹700 to ₹725 INR per month) for iOS app publishing and APNs maintenance.", bold_prefix="Apple Developer Program: ")

    add_heading_2("9.2 Consolidated 3rd-Party Monthly Running Cost Matrix (INR)")
    add_body("The table below synthesizes all verified third-party operational costs across three realistic workforce scaling tiers for Silver Star. The primary totals represent the actual net out-of-pocket expenditure (leveraging Silver Star's existing AWS cloud account), alongside the comparative standalone cloud reference:")

    cost_headers = ["Service Category", "Starter Scale (500 Staff)", "Growth Scale (1,500 Staff)", "Enterprise Scale (3,500+ Staff)"]
    cost_data = [
        ["AWS Cloud Infrastructure (Mumbai)", "₹0 (Already Owned by Silver Star)", "₹0 (Already Owned by Silver Star)", "₹0 (Already Owned by Silver Star)"],
        ["Google Maps Platform (India Tier)", "₹0 (Free Tier)", "₹1,200 / month", "₹3,800 / month"],
        ["eKYC Verification (Hybrid QR + API)", "₹750 / month", "₹2,250 / month", "₹4,500 / month"],
        ["Transactional SMS & DLT (MSG91)", "₹650 / month", "₹1,850 / month", "₹4,200 / month"],
        ["App Store Licenses (Prorated)", "₹850 / month", "₹850 / month", "₹850 / month"],
        ["Push Notifications (FCM / APNs)", "₹0 (Free)", "₹0 (Free)", "₹0 (Free)"],
        ["ACTUAL NET MONTHLY EXPENDITURE", "₹2,250 INR / month", "₹6,150 INR / month", "₹13,350 INR / month"],
        ["Reference: Standalone Cloud Cost (If Afresh)", "₹3,500 / month", "₹7,200 / month", "₹14,500 / month"],
        ["Reference: Total Cost If Cloud NOT Owned", "₹5,750 INR / month", "₹13,350 INR / month", "₹27,850 INR / month"]
    ]
    style_table(doc.add_table(rows=1, cols=4), [Inches(2.3), Inches(1.4), Inches(1.4), Inches(1.4)], cost_headers, cost_data)

    # ==========================================
    # 11. TECHNICAL SPECIFICATIONS & RBAC
    # ==========================================
    doc.add_page_break()
    add_heading_1("10. Functional Technical Specifications & Security Stack")
    
    add_body("This section specifies the rigorous technical standards and security mechanisms implemented across all platform components (Proposal 1, Section 5):")

    add_heading_2("10.1 Authentication & Role-Based Access Control (RBAC)")
    add_bullet("All portal and mobile accounts authenticate using industry-standard OAuth2 / JSON Web Token (JWT) stateless sessions with cryptographic signatures.", bold_prefix="Cryptographic Sessions: ")
    add_bullet("All passwords are hashed using bcrypt or Argon2 with unique salts before persistence. Raw plaintext passwords are never logged, transmitted, or stored.", bold_prefix="Zero Plaintext Passwords: ")
    add_bullet("Strict RBAC engine defines permissions across five distinct user roles: Super Admin, HR Executive, Operations Manager, Corporate Client, and Employee.", bold_prefix="Role-Based Authorization: ")
    add_bullet("Two-factor authentication (TOTP authenticator app or SMS OTP) is enforced for privileged administrative accounts.", bold_prefix="Privileged MFA: ")
    add_bullet("All security-sensitive operations (password resets, permission escalations, manual attendance corrections, status changes) are written to an immutable audit table with timestamp and IP address.", bold_prefix="Immutable Audit Logging: ")

    add_heading_2("10.2 Data Validation & Geospatial Calculation Engine")
    add_bullet("The mobile device submits latitude, longitude, timestamp, accuracy radius, and device state over HTTPS.", bold_prefix="Payload Ingestion: ")
    add_bullet("Backend verifies that the site ID is active and that the employee holds an active assignment at that site for the current timestamp.", bold_prefix="Assignment Check: ")
    add_bullet("Backend applies the Haversine formula to compute great-circle distance between device GPS and configured site centroid, validating that distance <= site geofence radius.", bold_prefix="Haversine Computation: ")
    add_bullet("Validates that no active punch-in exists for the employee on the same shift, preventing double-entry errors.", bold_prefix="Duplicate Suppression: ")

    # ==========================================
    # 12. DEPLOYMENT & DEVOPS ARCHITECTURE
    # ==========================================
    add_heading_1("11. Deployment Environments & DevOps Architecture")
    
    add_body("To ensure uninterrupted operations across 24/7 client facilities, the system is deployed using standard enterprise DevOps pipelines (Proposal 1, Section 10):")

    add_bullet("Strict segregation between Development (local sandboxes), Staging/UAT (pre-release customer testing environment mirroring production), and Production (live AWS Mumbai instance).", bold_prefix="Environment Isolation: ")
    add_bullet("Application source code managed via Git version control; automated CI/CD pipelines run linting, security scans, and automated tests prior to staging deployment.", bold_prefix="Version Control & CI/CD: ")
    add_bullet("Zero production secrets or API keys are hard-coded in source code. Credentials are dynamically injected at runtime via AWS Secrets Manager and environment variables.", bold_prefix="Secrets Management: ")
    add_bullet("Automated daily snapshots of the PostgreSQL RDS database with 14-day retention and point-in-time recovery (PITR) to protect against accidental data corruption.", bold_prefix="Automated Backups: ")
    add_bullet("Custom domain integration with automated Let's Encrypt / AWS Certificate Manager SSL/TLS certificates enforcing HTTPS encryption.", bold_prefix="SSL/TLS Certificates: ")
    add_bullet("Android APK / AAB bundles published via Google Play Console; iOS builds deployed via Apple TestFlight and Apple App Store.", bold_prefix="App Store Distribution: ")

    # ==========================================
    # 13. QUALITY ASSURANCE & ACCEPTANCE CRITERIA
    # ==========================================
    doc.add_page_break()
    add_heading_1("12. Quality Assurance & Acceptance Testing Matrix")
    
    add_body("Formal platform handover is governed by a 10-point Acceptance Testing Matrix covering all operational and security capabilities (Proposal 1, Section 11):")

    qa_headers = ["Test ID", "Functional Scope", "Verification Procedure", "Acceptance Criteria"]
    qa_data = [
        ["TC-01", "Role-Based Access Control", "Attempt cross-role URL navigation and unauthorized API endpoint queries.", "100% blocked; non-permitted actions return HTTP 403 Forbidden."],
        ["TC-02", "Multi-Tenant Client Isolation", "Client account attempts to query employees and site data belonging to a peer client.", "SQL queries return only own client records; zero cross-tenant leakage."],
        ["TC-03", "Employee Onboarding & KYC", "Execute full 9-step onboarding workflow including document upload and QR check.", "Unique Employee ID and verified QR ID card generated upon HR approval."],
        ["TC-04", "Workforce Shift Deployment", "Assign approved staff to site; test conflicting overlapping shift assignment.", "Assignment published to Employee App; system blocks conflicting shifts."],
        ["TC-05", "Geofence In-Bounds Punch", "Employee triggers 'Punch In' within configured 100m site boundary.", "Punch successfully accepted; recorded in Operations within < 2 seconds."],
        ["TC-06", "Geofence Out-of-Bounds Punch", "Employee attempts 'Punch In' outside configured site geofence.", "Punch blocked; explicit 'Outside Geofence' notification with distance displayed."],
        ["TC-07", "GPS Degradation / No Permission", "Test punch with location permissions disabled or low GPS accuracy.", "Graceful error prompting user to enable high-accuracy location."],
        ["TC-08", "Duplicate Punch & State Checks", "Attempt double punch-in without punch-out; test supervisor manual correction.", "Duplicate blocked; supervisor correction logs mandatory reason and admin ID."],
        ["TC-09", "Client Live Dashboard Sync", "Compare real-time present/absent counters against raw attendance ledger.", "100% numerical match between live punches and client dashboard."],
        ["TC-10", "Disaster Recovery & Backup", "Trigger simulated database failure and execute snapshot point-in-time restore.", "Database restored to consistent state within < 30 minutes without data loss."]
    ]
    style_table(doc.add_table(rows=1, cols=4), [Inches(0.7), Inches(1.6), Inches(2.3), Inches(1.9)], qa_headers, qa_data)

    # ==========================================
    # 14. IMPLEMENTATION ROADMAP & DELIVERABLES
    # ==========================================
    doc.add_page_break()
    add_heading_1("13. Implementation Roadmap, Deliverables & Handover Plan")
    
    add_body("The project is executed in five sequential milestones ensuring rapid deployment, rigorous testing, and structured knowledge transfer:")

    milestone_headers = ["Phase", "Milestone Focus", "Primary Deliverables", "Timeline"]
    milestone_data = [
        ["Phase 1", "Core Architecture & Database", "Database schema, REST API foundation, authentication, RBAC, AWS Mumbai setup.", "Weeks 1 – 3"],
        ["Phase 2", "Web Management Portals", "Super Admin Portal, HR Onboarding Panel (with eKYC & ID Cards), Operations Panel.", "Weeks 4 – 7"],
        ["Phase 3", "Mobile Applications", "Employee Mobile App (Geofenced punch engine), Client Mobile App (Live status dashboard).", "Weeks 8 – 11"],
        ["Phase 4", "Integration & Pilot UAT", "Google Maps, SMS/DLT, push notifications, field pilot testing across 2 live sites.", "Weeks 12 – 13"],
        ["Phase 5", "Production Launch & Handover", "Play Store / App Store release, administrator training, user manuals, production handover.", "Weeks 14 – 15"]
    ]
    style_table(doc.add_table(rows=1, cols=4), [Inches(0.8), Inches(1.8), Inches(2.7), Inches(1.2)], milestone_headers, milestone_data)

    add_heading_2("13.1 Deliverables Checklist")
    add_bullet("Production-ready source code repository with comprehensive inline documentation.", bold_prefix="1. Source Code Repository: ")
    add_bullet("Full deployed web application hosting Super Admin, HR, and Operations panels.", bold_prefix="2. Web Portals: ")
    add_bullet("Compiled production release binaries for Android (Google Play Store) and iOS (Apple App Store).", bold_prefix="3. Mobile Applications: ")
    add_bullet("Complete architectural diagrams, entity relationship diagrams (ERD), and OpenAPI (Swagger) API documentation.", bold_prefix="4. System Documentation: ")
    add_bullet("Dedicated step-by-step user manuals and recorded training sessions for HR and Operations staff.", bold_prefix="5. Administrator Manuals: ")
    add_bullet("Standard 90-day post-launch warranty covering defect rectification, performance tuning, and operational stabilization.", bold_prefix="6. Warranty & Handover Support: ")

    # Sign-off box
    sign_table = doc.add_table(rows=2, cols=2)
    sign_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    sign_widths = [Inches(3.2), Inches(3.3)]
    for row in sign_table.rows:
        trPr_s = row._tr.get_or_add_trPr()
        trPr_s.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))
        for idx, cell in enumerate(row.cells):
            cell.width = sign_widths[idx]
            set_cell_padding(cell, top=100, bottom=100, left=120, right=120)
            set_cell_background(cell, LIGHT_BG_HEX)
    set_table_borders(sign_table, color="CBD5E1", sz="4")

    c00 = sign_table.rows[0].cells[0].paragraphs[0]
    c00.paragraph_format.space_before = Pt(0)
    c00.paragraph_format.space_after = Pt(2)
    r00 = c00.add_run("SUBMITTED BY:\nTechnology Solutions Architecture Team")
    r00.font.name = "Segoe UI"
    r00.font.size = Pt(9)
    r00.font.bold = True
    r00.font.color.rgb = NAVY

    c01 = sign_table.rows[0].cells[1].paragraphs[0]
    c01.paragraph_format.space_before = Pt(0)
    c01.paragraph_format.space_after = Pt(2)
    r01 = c01.add_run("ACCEPTED & ACKNOWLEDGED BY:\nSilver Star Facility Management Pvt. Ltd.")
    r01.font.name = "Segoe UI"
    r01.font.size = Pt(9)
    r01.font.bold = True
    r01.font.color.rgb = NAVY

    c10 = sign_table.rows[1].cells[0].paragraphs[0]
    c10.paragraph_format.space_before = Pt(24)
    c10.paragraph_format.space_after = Pt(0)
    r10 = c10.add_run("Authorized Signature: _______________________\nDate: November 2026")
    r10.font.name = "Segoe UI"
    r10.font.size = Pt(8.5)
    r10.font.color.rgb = DARK

    c11 = sign_table.rows[1].cells[1].paragraphs[0]
    c11.paragraph_format.space_before = Pt(24)
    c11.paragraph_format.space_after = Pt(0)
    r11 = c11.add_run("Authorized Signature: _______________________\nDate: ________________________")
    r11.font.name = "Segoe UI"
    r11.font.size = Pt(8.5)
    r11.font.color.rgb = DARK

    out_docx_path = r'c:\Users\gouta\Desktop\silver star\report\Silver_Star_Facility_Management_Proposal_Report.docx'
    doc.save(out_docx_path)
    print(f"Report document successfully updated at: {out_docx_path}")

if __name__ == "__main__":
    create_proposal_document()
