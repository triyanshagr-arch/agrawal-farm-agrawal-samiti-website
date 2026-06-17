import re

with open('style.css', 'r', encoding='utf-8') as f:
    content = f.read()

split_fix = """
.agrasen-img {
    width: auto;
    height: 180px;
    max-width: 100%;
    object-fit: contain;
    margin-top: 0;
    filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2));
}

.lakshmi-img {
    width: auto;
    height: 180px;
    max-width: 100%;
    object-fit: contain;
    margin-top: 0;
    filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2));
}

@media (max-width: 992px) {
    .header-container {
        flex-direction: column;
        align-items: center;
        padding-top: 100px; /* Greatly reduced to shrink header height */
    }
    .header-image-box {
        position: absolute;
        top: 10px;
        left: 10px;
    }
    .header-image-box-right {
        position: absolute;
        top: 10px;
        right: 10px;
        display: block; 
    }
    .agrasen-img {
        height: 90px;
    }
    .lakshmi-img {
        height: 90px;
    }
}
"""

# Find the .agrasen-img, .lakshmi-img block
content = re.sub(r'\.agrasen-img,\s*\.lakshmi-img\s*\{[^}]+\}', '', content)
# Find the specific media query block for max-width: 992px that contains header-container flex-direction
content = re.sub(r'@media\s*\(\s*max-width:\s*992px\s*\)\s*\{[^}]+padding-top:\s*150px;[^}]+\}\s*\}\s*\}\s*', '', content)
# It's tricky to regex replace the exact media block without grabbing too much. Let's do it safer.

# I'll just append it to the end and let CSS cascade handle it, BUT it's cleaner to replace.
# Let's read the file line by line to remove the old blocks.
