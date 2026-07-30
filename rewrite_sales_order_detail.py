import re

with open('components/SalesOrderDetailCard.tsx', 'r') as f:
    content = f.read()

# First replace the items parsing at the top
replacement_items = """
  const items = Array.isArray(inv.items) ? inv.items : (typeof inv.items === 'string' ? JSON.parse(inv.items) : []);
  const frames = items.filter((item: any) => (item.itemType?.toLowerCase() === 'frame' || item.type?.toLowerCase() === 'frame') && item.productType !== 'Sunglass');
  const lenses = items.filter((item: any) => item.itemType?.toLowerCase() === 'lens' || item.type?.toLowerCase() === 'lens');
  const sunglasses = items.filter((item: any) => (item.itemType?.toLowerCase() === 'frame' || item.type?.toLowerCase() === 'frame') && item.productType === 'Sunglass');
  const accessories = items.filter((item: any) => item.itemType?.toLowerCase() === 'manual' || item.type?.toLowerCase() === 'manual');
"""

content = re.sub(
    r'  const frames = inv\.items\.filter.*?const accessories = inv\.items\.filter.*?;',
    replacement_items,
    content,
    flags=re.DOTALL
)

# Then we replace the FRAME DETAILS block.
# Wait, let's just do targeted string replacements using regex or Python for the specific sections.
