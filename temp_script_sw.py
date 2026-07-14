import sys

with open('index.html', 'r', encoding='utf-8') as f:
    idx = f.read()

unregister_script = """
    <script>
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
          for(let registration of registrations) {
            registration.unregister();
            console.log("Service worker unregistered to clear cache.");
          }
        });
      }
    </script>
"""

if 'registration.unregister();' not in idx:
    idx = idx.replace('</body>', unregister_script + '\n</body>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(idx)
