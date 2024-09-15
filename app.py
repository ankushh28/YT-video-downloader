import requests
from pytubefix import YouTube
from flask import Flask, render_template, request, send_file
import os
import time

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/download', methods=['POST'])
def download_video():
    url = request.form['url']
    headers = {'User-Agent': 'your bot 0.1'}

    try:
        # Retry logic for handling 429 errors
        for attempt in range(5):  # try up to 5 times
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                yt = YouTube(url, use_po_token=True)
                stream = yt.streams.get_highest_resolution()
                video_file = stream.download(output_path="downloads/")
                return send_file(video_file, as_attachment=True)
            elif response.status_code == 429:
                # Wait for some time before retrying
                time.sleep(5 * (attempt + 1))  # Exponential backoff
            else:
                return f"Failed to access the video. HTTP status code: {response.status_code}"
        
        return "Failed to download video after multiple attempts."
    except Exception as e:
        return f"An error occurred: {str(e)}"

if __name__ == '__main__':
    if not os.path.exists("downloads"):
        os.mkdir("downloads")
    app.run(debug=True)
