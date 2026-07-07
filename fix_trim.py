import os
import re

properties = [
    'mobile', 'email', 'companyName', 'ownerName', 'branchName', 
    'address', 'whatsApp', 'gstNumber', 'username', 'role', 'status',
    'search', 'query', 'name', 'password', 'whatsAppNumber'
]

pattern = re.compile(r'([a-zA-Z0-9_$.]+)\.trim\(\)')

def replacement(match):
    full_var = match.group(1)
    # Don't replace if it's already wrapped in String(
    # or if it's string literal
    if full_var.endswith('"') or full_var.endswith("'"):
        return match.group(0)
    
    # Let's just wrap it: String(full_var ?? "").trim()
    return f'String({full_var} ?? "").trim()'

for root, dirs, files in os.walk('/app/applet'):
    if 'node_modules' in root or '.next' in root:
        continue
    for file in files:
        if file.endswith('.ts') or file.endswith('.tsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            new_content = pattern.sub(replacement, content)
            
            if new_content != content:
                with open(filepath, 'w') as f:
                    f.write(new_content)
                print(f"Updated {filepath}")
