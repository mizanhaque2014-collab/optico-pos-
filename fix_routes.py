import re

with open('Code.gs', 'r') as f:
    code = f.read()

do_post_match = re.search(r'function doPost\(e\) \{([\s\S]*?)\n\}\n\n\/\*', code)
do_get_match = re.search(r'function doGet\(e\) \{([\s\S]*?)\n\}', code)

print("doPost routes:")
routes_post = re.findall(r"case '([^']+)':", do_post_match.group(1)) if do_post_match else []
print(len(routes_post))

print("doGet routes:")
routes_get = re.findall(r"case '([^']+)':", do_get_match.group(1)) if do_get_match else []
print(len(routes_get))
