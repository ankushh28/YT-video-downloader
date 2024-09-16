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
                yt = YouTube(url, use_po_token=True)
                stream = yt.streams.get_highest_resolution()
                video_file = stream.download(output_path="downloads/")
                return send_file(video_file, as_attachment=True)

    except Exception as e:
        return f"An error occurred: {str(e)}"

if __name__ == '__main__':
    if not os.path.exists("downloads"):
        os.mkdir("downloads")
    app.run(debug=True)
