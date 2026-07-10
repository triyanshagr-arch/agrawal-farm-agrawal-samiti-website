import glob

for filepath in glob.glob('*.html'):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    out_lines = []
    i = 0
    fixed = False
    while i < len(lines):
        line = lines[i]
        if '<ul class="nav-menu">' in line:
            found_div = -1
            for j in range(i+1, min(i+5, len(lines))):
                if 'mobile-drawer-close' in lines[j] and 'drawer-close-btn' in lines[j]:
                    found_div = j
                    break
            
            if found_div != -1:
                div_line = lines[found_div]
                out_lines.append(div_line)
                out_lines.append(line)
                for k in range(i+1, found_div):
                    out_lines.append(lines[k])
                i = found_div + 1
                fixed = True
                continue
        
        out_lines.append(line)
        i += 1
        
    if fixed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(out_lines)
        print(f'Fixed {filepath}')
