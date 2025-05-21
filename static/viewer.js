let pdfDoc = null;
let currentPage = 1;

document.getElementById('pdf-upload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
        const fileReader = new FileReader();
        fileReader.onload = function () {
            const typedarray = new Uint8Array(this.result);
            pdfjsLib.getDocument(typedarray).promise.then(function (pdf) {
                pdfDoc = pdf;
                currentPage = 1;
                renderPage(currentPage);
            });
        };
        fileReader.readAsArrayBuffer(file);
    }
});

function renderPage(num) {
    pdfDoc.getPage(num).then(function (page) {
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const container = document.getElementById('pdf-container');
        container.innerHTML = '';
        container.appendChild(canvas);
        page.render({ canvasContext: context, viewport: viewport });
    });
}

function addText() {
    const div = document.createElement('div');
    div.className = 'draggable';
    div.contentEditable = true;
    div.innerText = 'نص';
    div.style.left = '100px';
    div.style.top = '100px';
    document.getElementById('pdf-container').appendChild(div);
    makeDraggable(div);
}

function addImage() {
    document.getElementById('image-upload').click();
}

document.getElementById('image-upload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (evt) {
        const img = document.createElement('img');
        img.src = evt.target.result;
        img.style.width = '100px';
        img.style.height = 'auto';
        img.className = 'draggable';
        document.getElementById('pdf-container').appendChild(img);
        makeDraggable(img);
    };
    reader.readAsDataURL(file);
});

function makeDraggable(el) {
    el.onmousedown = function (e) {
        const offsetX = e.clientX - el.offsetLeft;
        const offsetY = e.clientY - el.offsetTop;
        function mouseMoveHandler(e) {
            el.style.left = `${e.clientX - offsetX}px`;
            el.style.top = `${e.clientY - offsetY}px`;
        }
        function mouseUpHandler() {
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        }
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    };
}