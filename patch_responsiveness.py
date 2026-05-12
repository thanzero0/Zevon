import os
import re

base_dir = "/home/than/Project/Personal Project/website/Zevon"
gens = ["Gen 1", "Gen 2"]

responsive_css = """
/* Global Responsiveness & Simplicity Patch */
@media (max-width: 600px) {
    body {
        padding: 20px;
        justify-content: flex-start;
        overflow-y: auto;
    }
    .calculator, .app-container, .clock-wrapper, .planner-grid {
        width: 100% !important;
        transform: scale(1) !important;
        margin-top: 40px;
    }
    .buttons, .utility-grid {
        gap: 8px !important;
    }
    button {
        font-size: 14px !important;
        height: 44px !important;
    }
}
"""

for gen in gens:
    gen_path = os.path.join(base_dir, gen)
    for utility in os.listdir(gen_path):
        utility_path = os.path.join(gen_path, utility)
        if os.path.isdir(utility_path):
            css_dir = os.path.join(utility_path, "css")
            if os.path.exists(css_dir):
                for css_file in os.listdir(css_dir):
                    if css_file.endswith(".css"):
                        fpath = os.path.join(css_dir, css_file)
                        with open(fpath, "a") as f:
                            f.write(responsive_css)

print("Responsiveness patch applied to all utilities.")
