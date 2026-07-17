import re

path_js = 'admin.js'
with open(path_js, 'r', encoding='utf-8') as f:
    js = f.read()

old_logout = '''function logout() {
    sessionPassword = "";
    // Reload the page to cleanly clear all data and reset the view
    window.location.reload();
}'''

new_logout = '''function logout() {
    if(window.firebaseAuth) {
        window.signOut(window.firebaseAuth).then(() => {
            sessionPassword = "";
            window.location.reload();
        }).catch((err) => {
            console.error("Logout error", err);
            window.location.reload();
        });
    } else {
        window.location.reload();
    }
}'''

if old_logout in js:
    js = js.replace(old_logout, new_logout)
    with open(path_js, 'w', encoding='utf-8') as f:
        f.write(js)
    print("Fixed logout function!")
else:
    print("Could not find old logout function")
