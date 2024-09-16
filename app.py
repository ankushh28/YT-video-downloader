from flask import Flask, request, send_file, render_template, redirect, url_for, flash, jsonify
import yt_dlp
import os
import re

app = Flask(__name__)
app.secret_key = 'supersecretkey'

DOWNLOAD_FOLDER = 'downloads'
os.makedirs(DOWNLOAD_FOLDER, exist_ok=True)

def sanitize_filename(filename):
    """Sanitize the filename to ensure it's safe for the filesystem."""
    return re.sub(r'[<>:"/\\|?*]', '', filename)

def progress_hook(d):
    if d['status'] == 'downloading':
        # Use this for progress calculation
        percent = d.get('downloaded_bytes', 0) / d.get('total_bytes', 1) * 100
        print(f"Progress: {percent:.2f}%")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/download', methods=['POST'])
def download():
    url = request.form.get('url')
    if not url:
        flash('You must provide a YouTube URL.')
        return redirect(url_for('index'))

    ydl_opts = {
        'format': 'best',
        'outtmpl': os.path.join(DOWNLOAD_FOLDER, '%(title)s.%(ext)s'),
        'progress_hooks': [progress_hook],
        'http_headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(url, download=True)
            sanitized_title = sanitize_filename(info_dict['title'])
            file_path = os.path.join(DOWNLOAD_FOLDER, f"{sanitized_title}.{info_dict['ext']}")
            flash('Video downloaded successfully!')
            return send_file(file_path, as_attachment=True)
    except Exception as e:
        print(f"Error: {e}")
        flash('An error occurred while downloading the video. Please check the URL and try again.')
        return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)
