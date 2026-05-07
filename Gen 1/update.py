import re

files = [
    "/home/than/Project/Personal Project/website/Zevon/Gen 1/Utility-Calculator/css/style.css",
    "/home/than/Project/Personal Project/website/Zevon/Gen 1/Utility-Clock/css/style.css",
    "/home/than/Project/Personal Project/website/Zevon/Gen 1/Utility-Pomodoro/css/style.css",
    "/home/than/Project/Personal Project/website/Zevon/Gen 1/Utility-Calender/css/style.css",
    "/home/than/Project/Personal Project/website/Zevon/Gen 2/Utility-Budget-Planner/css/style.css"
]

new_cursor_glow = """.cursor-glow {
    position: fixed;
    top: 0;
    left: 0;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, var(--cursor-color) 0%, transparent 60%);
    border-radius: 50%;
    pointer-events: none;
    z-index: -1;
    transform: translate(-50%, -50%);
    opacity: 0;
    transition: opacity 0.5s ease;
    filter: blur(100px) opacity(35%);
}"""

for fpath in files:
    with open(fpath, "r") as f:
        content = f.read()
    
    # Replace cursor-glow block
    content = re.sub(r'^\.cursor-glow\s*\{[^}]*\}', new_cursor_glow, content, flags=re.MULTILINE)
    
    if "Budget-Planner" not in fpath:
        content = re.sub(r'^\.fab-group\s*\{[^}]*\}', """.fab-group {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
}""", content, flags=re.MULTILINE)
        
        content = re.sub(r'^\.fab-options\s*\{[^}]*\}', """.fab-options {
    position: absolute;
    left: 100%;
    bottom: 0;
    display: flex;
    flex-direction: row;
    gap: 15px;
    opacity: 0;
    visibility: hidden;
    transform: translateX(-20px) scale(0.95);
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    background: rgba(0, 0, 0, 0.1);
    padding: 10px 20px;
    border-radius: 40px;
    backdrop-filter: blur(10px);
    margin-left: 15px;
    transform-origin: left center;
}""", content, flags=re.MULTILINE)
        
        content = re.sub(r'^\.fab-group\.active \.fab-options\s*\{[^}]*\}', """.fab-group.active .fab-options {
    opacity: 1;
    visibility: visible;
    transform: translateX(0) scale(1);
}""", content, flags=re.MULTILINE)
    
    with open(fpath, "w") as f:
        f.write(content)

print("Updated files.")
