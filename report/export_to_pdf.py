import os
import win32com.client

docx_path = os.path.abspath(r'c:\Users\gouta\Desktop\silver star\report\Silver_Star_Facility_Management_Proposal_Report.docx')
pdf_path = os.path.abspath(r'c:\Users\gouta\Desktop\silver star\report\Silver_Star_Facility_Management_Proposal_Report.pdf')

print("Converting DOCX to PDF...")
print("Input:", docx_path)
print("Output:", pdf_path)

word = win32com.client.Dispatch("Word.Application")
word.Visible = False
try:
    doc = word.Documents.Open(docx_path)
    # 17 corresponds to wdFormatPDF
    doc.SaveAs(pdf_path, FileFormat=17)
    doc.Close()
    print("PDF export successful!")
except Exception as e:
    print("Error during export:", e)
finally:
    word.Quit()

if os.path.exists(pdf_path):
    print("Verified: PDF file exists, size:", os.path.getsize(pdf_path), "bytes")
else:
    print("Error: PDF file not found!")

