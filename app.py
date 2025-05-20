
from flask import Flask, render_template, request, send_file
import fitz  # PyMuPDF
import os
import json
from io import BytesIO

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    file = request.files['file']
    if file and file.filename.endswith('.pdf'):
        path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(path)
        return {'filename': file.filename, 'status': 'ok'}
    return {'status': 'error'}

@app.route('/generate', methods=['POST'])
def generate():
    data = json.loads(request.form['data'])
    filename = data.get('filename')
    elements = data.get('elements', [])
    pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    doc = fitz.open(pdf_path)

    for item in elements:
        page_index = int(item['page'])
        page = doc[page_index]
        if item['type'] == 'text':
            text = item['text']
            x, y = float(item['x']), float(item['y'])
            size = int(item['size'])
            color = tuple(int(item['color'][i:i+2], 16)/255 for i in (1, 3, 5))
            page.insert_text((x, y), text, fontsize=size, color=color, fontname="helv")
        elif item['type'] == 'image':
            x, y = float(item['x']), float(item['y'])
            w, h = float(item['width']), float(item['height'])
            img_bytes = BytesIO(request.files[item['fileField']].read())
            page.insert_image([x, y, x+w, y+h], stream=img_bytes)

    output = BytesIO()
    doc.save(output)
    output.seek(0)
    return send_file(output, as_attachment=True, download_name='final.pdf', mimetype='application/pdf')

if __name__ == '__main__':
    app.run(debug=True)
