import os
import re

VIEWS_DIR = r"c:\localWork\localWork\frontend\src\views"

# Patterns to match and replace alert(...) with showToast(..., type)
# We will heuristically assign type based on the string.
# If it contains "Error" or "No se pudo", we make it 'error', otherwise 'success'
# Unless it's just 'info'.
import_stmt = "import { showToast } from '@/assets/js/utils/helpers.js'"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip if no alert
    if "alert(" not in content:
        return

    # Replace alerts
    # Matches alert('something') or alert(`something`)
    def replacer(match):
        msg = match.group(1)
        # Determine type
        lmsg = msg.lower()
        if "error" in lmsg or "no se pudo" in lmsg or "no puede" in lmsg:
            t = "'error'"
        elif "enviad" in lmsg or "activad" in lmsg or "guardad" in lmsg or "éxito" in lmsg or "correctamente" in lmsg or "actualizad" in lmsg or "cread" in lmsg or "retirad" in lmsg or "aceptada" in lmsg or "rechazada" in lmsg or "copiado" in lmsg or "leídas" in lmsg or "enviada" in lmsg or "eliminado" in lmsg:
            t = "'success'"
        else:
            t = "'info'" # fallback

        # If the msg already has backticks, we preserve it
        return f"showToast({msg}, {t})"

    # Regex: alert\(\s*(['`].*?['`])\s*\)
    new_content = re.sub(r"alert\(\s*(['`].*?['`])\s*\)", replacer, content)
    
    # Also we might have alert(var === 'x' ? 'y' : 'z')
    # Let's handle specifically: alert(action === 'accepted' ? 'Solicitud aceptada' : 'Solicitud rechazada')
    # -> showToast(action === 'accepted' ? 'Solicitud aceptada' : 'Solicitud rechazada', 'success')
    new_content = re.sub(r"alert\((action === 'accepted' \? 'Solicitud aceptada' : 'Solicitud rechazada')\)",
                         r"showToast(\1, 'success')", new_content)

    # Insert import if missing and if we replaced something
    if "showToast(" in new_content and "import { showToast }" not in new_content:
        # Find the script tag
        script_match = re.search(r"<script.*?>\n", new_content)
        if script_match:
            insert_pos = script_match.end()
            new_content = new_content[:insert_pos] + f"{import_stmt}\n" + new_content[insert_pos:]

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk(VIEWS_DIR):
    for file in files:
        if file.endswith('.vue'):
            process_file(os.path.join(root, file))
