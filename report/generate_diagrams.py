import os
import matplotlib
os.environ['MPLCONFIGDIR'] = r'c:\Users\gouta\Desktop\silver star\report\.mplconfig'
import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Diagram 1: Employee Onboarding & Digital Verification Workflow
fig, ax = plt.subplots(figsize=(10, 4.2), dpi=300)
ax.set_facecolor('#FFFFFF')
fig.patch.set_facecolor('#FFFFFF')

# 5 Core Process Steps
steps = [
    {"num": "1", "title": "Registration", "sub": "HR enters profile,\nphoto & basic info", "col": "#202B75"},
    {"num": "2", "title": "Doc Collection", "sub": "Upload ID, Address,\nBank & Certs", "col": "#1E3A8A"},
    {"num": "3", "title": "eKYC Check", "sub": "Aadhaar Secure QR /\nDigiLocker Verification", "col": "#0284C7"},
    {"num": "4", "title": "Approval & ID", "sub": "HR reviews & auto-generates\nUnique ID & QR Card", "col": "#0D9488"},
    {"num": "5", "title": "Operations Handover", "sub": "Ready for Site Assignment\n& Shift Scheduling", "col": "#16A34A"},
]

x_start = 0.05
box_w = 0.15
box_h = 0.55
y_pos = 0.25

for i, s in enumerate(steps):
    x = x_start + i * 0.19
    # Shadow
    rect_s = patches.FancyBboxPatch((x + 0.005, y_pos - 0.01), box_w, box_h,
                                    boxstyle="round,pad=0.03,rounding_size=0.04",
                                    facecolor='#E2E8F0', edgecolor='none')
    ax.add_patch(rect_s)
    # Box
    rect = patches.FancyBboxPatch((x, y_pos), box_w, box_h,
                                 boxstyle="round,pad=0.03,rounding_size=0.04",
                                 facecolor=s["col"], edgecolor='#FFFFFF', linewidth=1.5)
    ax.add_patch(rect)
    
    # Text
    ax.text(x + box_w/2, y_pos + box_h - 0.09, f"STEP {s['num']}", ha='center', va='center',
            color='#BAE6FD', fontsize=8.5, fontweight='bold')
    ax.text(x + box_w/2, y_pos + box_h - 0.22, s["title"], ha='center', va='center',
            color='#FFFFFF', fontsize=10, fontweight='bold')
    ax.text(x + box_w/2, y_pos + 0.15, s["sub"], ha='center', va='center',
            color='#F1F5F9', fontsize=7.5, multialignment='center')

    # Arrow to next
    if i < len(steps) - 1:
        arr_x = x + box_w + 0.008
        arr_y = y_pos + box_h/2
        ax.annotate('', xy=(arr_x + 0.03, arr_y), xytext=(arr_x, arr_y),
                    arrowprops=dict(arrowstyle="-|>", color="#26BCEE", lw=2.5, mutation_scale=15))

ax.set_xlim(0, 1.0)
ax.set_ylim(0, 1.0)
ax.axis('off')
ax.set_title("Silver Star Workforce Digital Onboarding & Compliance Workflow",
             fontsize=12, fontweight='bold', color='#202B75', pad=15)

plt.tight_layout()
plt.savefig(r'c:\Users\gouta\Desktop\silver star\report\charts\workflow_onboarding.png', dpi=300, bbox_inches='tight')
plt.close()

# Diagram 2: Geofence Verification Decision Flowchart
fig, ax = plt.subplots(figsize=(10, 4.5), dpi=300)
ax.set_facecolor('#FFFFFF')
fig.patch.set_facecolor('#FFFFFF')

# Draw Flow
# Node 1: Mobile Punch Event
# Node 2: GPS Coordinate Capture & Accuracy Validation
# Node 3: Distance Check vs Geofence Radius
# Node 4: Shift & Duplicate Punch Check
# Node 5: Success / Exception Record
stages = [
    ("Mobile App\nPunch Event", "Employee presses\nPunch In / Out", "#1E293B", 0.06),
    ("GPS & Accuracy\nValidation", "Capture lat/long;\nverify accuracy threshold", "#202B75", 0.28),
    ("Geofence Boundary\nEvaluation", "Calculate distance vs.\nsite radius (e.g. 100m)", "#0284C7", 0.50),
    ("Shift & State\nRules Engine", "Verify assignment,\nschedule & duplicate rules", "#0D9488", 0.72),
    ("Audit Log &\nPanel Sync", "Instant sync to Operations,\nHR & Client App", "#16A34A", 0.94)
]

for title, desc, col, x_c in stages:
    w, h = 0.18, 0.48
    x_l = x_c - w/2
    y_l = 0.26
    
    # Box
    rect = patches.FancyBboxPatch((x_l, y_l), w, h, boxstyle="round,pad=0.02,rounding_size=0.03",
                                 facecolor=col, edgecolor='#CBD5E1', linewidth=1)
    ax.add_patch(rect)
    ax.text(x_c, y_l + h - 0.14, title, ha='center', va='center', color='#FFFFFF', fontsize=9, fontweight='bold')
    ax.text(x_c, y_l + 0.12, desc, ha='center', va='center', color='#E2E8F0', fontsize=7.5, multialignment='center')

# Arrows
for i in range(len(stages) - 1):
    x1 = stages[i][3] + 0.09
    x2 = stages[i+1][3] - 0.09
    y = 0.50
    ax.annotate('', xy=(x2, y), xytext=(x1, y),
                arrowprops=dict(arrowstyle="-|>", color="#26BCEE", lw=2, mutation_scale=12))

# Error / Exception branch
ax.annotate('Outside Geofence / Low Accuracy\n-> Exception Alert & Reason Logged',
            xy=(0.50, 0.25), xytext=(0.50, 0.06),
            ha='center', va='center', fontsize=8, color='#DC2626', fontweight='bold',
            arrowprops=dict(arrowstyle="->", color="#DC2626", lw=1.5, ls='--'),
            bbox=dict(boxstyle="round,pad=0.3", fc="#FEF2F2", ec="#F87171"))

ax.set_xlim(0, 1.0)
ax.set_ylim(0, 1.0)
ax.axis('off')
ax.set_title("GPS Geofencing Attendance Validation & Audit Pipeline",
             fontsize=12, fontweight='bold', color='#202B75', pad=15)

plt.tight_layout()
plt.savefig(r'c:\Users\gouta\Desktop\silver star\report\charts\geofence_flowchart.png', dpi=300, bbox_inches='tight')
plt.close()
print("Diagrams generated!")

