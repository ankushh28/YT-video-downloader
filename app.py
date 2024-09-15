from flask import Flask, render_template, request, send_file, redirect, url_for
from pytubefix import YouTube
import os

app = Flask(__name__)

# Route to home page
@app.route('/')
def home():
    return render_template('index.html')

# Route to handle download
@app.route('/download', methods=['POST'])
def download_video():
    url = request.form['url']
    
    try:
        yt = YouTube(url,use_po_token=True)
        stream = yt.streams.get_highest_resolution()

        # Download the video to a temporary directory
        download_path = stream.download(output_path='downloads/')
        return send_file(download_path, as_attachment=True, download_name=f"{yt.title}.mp4")
    
    except Exception as e:
        return f"An error occurred: {str(e)}"

if __name__ == '__main__':
    if not os.path.exists('downloads'):
        os.makedirs('downloads')
    app.run(debug=True)
