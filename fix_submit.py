url = "https://script.google.com/macros/s/AKfycbxJ1e5XCWBYEwbm7tQBgfkYsLHFDhGHZXpztTwkbbwCkuRfZv6BHZ0qTSiVY9k68rE/exec"

with open('submit_handler.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace any lingering GOOGLE_SCRIPT_URL references in fetch calls that might be undefined in scope
js = js.replace("fetch(GOOGLE_SCRIPT_URL,", f"fetch('{url}',")

with open('submit_handler.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Fixed submit_handler.js")
