import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content

    # Replace `const customers = useMemo(() => getCustomers(), []);`
    # and variations for store getters
    content = re.sub(r'useMemo\(\(\) => (?:store\.)?getCustomers\(\), \[.*?\]\)', r'store.getCustomers()', content)
    content = re.sub(r'useMemo\(\(\) => (?:store\.)?getInvoices\(\), \[.*?\]\)', r'store.getInvoices()', content)
    content = re.sub(r'useMemo\(\(\) => (?:store\.)?getStockInventory\(\), \[.*?\]\)', r'store.getStockInventory()', content)
    content = re.sub(r'useMemo\(\(\) => (?:store\.)?getInventory\(\), \[.*?\]\)', r'store.getInventory()', content)
    
    # Wait, some components destructure it: `const { getCustomers } = useStore();`
    # Then call `useMemo(() => getCustomers(), [])`
    content = re.sub(r'useMemo\(\(\) => getCustomers\(\), \[.*?\]\)', r'getCustomers()', content)
    content = re.sub(r'useMemo\(\(\) => getInvoices\(\), \[.*?\]\)', r'getInvoices()', content)
    content = re.sub(r'useMemo\(\(\) => getStockInventory\(\), \[.*?\]\)', r'getStockInventory()', content)

    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('/app/applet/components'):
    for file in files:
        if file.endswith('.tsx'):
            process_file(os.path.join(root, file))

