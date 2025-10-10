import os
import re

# Define regex pattern to match URLs
url_pattern = re.compile(r"https?://[^\s\"'>]+")  

# Set project directory (change this if needed)
project_dir = os.getcwd()  # Uses current working directory

# Collect URLs
urls = set()

# Walk through all files in the project directory
for root, _, files in os.walk(project_dir):
    for file in files:
        file_path = os.path.join(root, file)
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
                found_urls = url_pattern.findall(content)
                urls.update(found_urls)
        except:
            pass  # Skip files that can't be read

# Save results
with open("urls.txt", "w") as output:
    for url in sorted(urls):
        output.write(url + "\n")

print(f"Extracted {len(urls)} URLs. Check urls.txt for results.")
