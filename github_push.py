#!/usr/bin/env python3
"""
VegePower GitHub Direct Uploader Script (No Git Binary Required)
Uploads project files directly to https://github.com/fxb-google/vege-recipe-keep-app via GitHub REST API.
"""

import os
import sys
import json
import base64
import urllib.request
import urllib.error

REPO_OWNER = "fxb-google"
REPO_NAME = "vege-recipe-keep-app"
BRANCH = "main"

# Files to upload
FILES_TO_UPLOAD = [
    "index.html",
    "styles.css",
    "app.js",
    "js/recipesData.js",
    "js/recipeApi.js",
    "js/db.js",
    "js/keepExporter.js",
    "js/uiComponents.js",
    "database/schema.sql",
    "database/init_db.py",
    "Dockerfile",
    "cloudbuild.yaml",
    "firebase.json",
    ".gitignore",
    "README.md"
]

def upload_file(token, rel_path):
    abs_path = os.path.join(os.path.dirname(__file__), rel_path)
    if not os.path.exists(abs_path):
        print(f"Skipping missing file: {rel_path}")
        return

    with open(abs_path, "rb") as f:
        content = f.read()

    b64_content = base64.b64encode(content).decode("utf-8")

    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/contents/{rel_path}"

    # Check if file exists on GitHub to get SHA
    req = urllib.request.Request(url, headers={
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "VegePower-Uploader"
    })

    sha = None
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            sha = data.get("sha")
    except urllib.error.HTTPError as e:
        if e.code != 404:
            print(f"Error checking {rel_path}: {e}")

    # Prepare payload
    payload = {
        "message": f"Upload {rel_path} via VegePower Direct Sync",
        "content": b64_content,
        "branch": BRANCH
    }
    if sha:
        payload["sha"] = sha

    data_bytes = json.dumps(payload).encode("utf-8")
    put_req = urllib.request.Request(url, data=data_bytes, method="PUT", headers={
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "VegePower-Uploader"
    })

    try:
        with urllib.request.urlopen(put_req) as resp:
            print(f"✅ Successfully uploaded: {rel_path}")
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        print(f"❌ Failed to upload {rel_path}: {e.code} - {err_msg}")

def main():
    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        if len(sys.argv) > 1:
            token = sys.argv[1]
        else:
            print("Usage: python3 github_push.py <YOUR_GITHUB_PERSONAL_ACCESS_TOKEN>")
            print("or set GITHUB_TOKEN environment variable.")
            sys.exit(1)

    print(f"Uploading files to https://github.com/{REPO_OWNER}/{REPO_NAME}...")
    for rel_path in FILES_TO_UPLOAD:
        upload_file(token, rel_path)

if __name__ == "__main__":
    main()
