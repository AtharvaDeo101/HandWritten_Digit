import os
os.environ["HF_HUB_ENABLE_HF_TRANSFER"] = "0"  

import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms
from PIL import Image, ImageOps, ImageFilter
from flask import Flask, request, jsonify
from huggingface_hub import hf_hub_download  

app = Flask(__name__)

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

class CNN(nn.Module):
    def __init__(self):
        super(CNN, self).__init__()
        self.conv1 = nn.Conv2d(1, 10, kernel_size=5)
        self.conv2 = nn.Conv2d(10, 20, kernel_size=5)
        self.drop_out = nn.Dropout2d()
        self.lc1 = nn.Linear(320, 50)
        self.lc2 = nn.Linear(50, 10)

    def forward(self, x):
        x = F.relu(F.max_pool2d(self.conv1(x), 2))
        x = F.relu(F.max_pool2d(self.drop_out(self.conv2(x)), 2))
        x = x.view(-1, 320)
        x = F.relu(self.lc1(x))
        x = F.dropout(x, training=self.training)
        x = self.lc2(x)
        return F.log_softmax(x, dim=1)

device = torch.device('cpu')
model = CNN().to(device)

model_path = hf_hub_download(
    repo_id="AtharvaDeo/HandWritten",
    filename="mnist_cnn.pth",  
    repo_type="model"
)

model.load_state_dict(torch.load(model_path, map_location=device))
model.eval()

mnist_normalize = transforms.Normalize((0.1307,), (0.3081,))
base_to_tensor = transforms.ToTensor()

def preprocess_image(pil_img: Image.Image) -> torch.Tensor:
    img = pil_img.convert('L')
    img = ImageOps.invert(img)
    img = img.point(lambda x: 0 if x < 50 else 255, 'L')
    bbox = img.getbbox()
    if bbox is None:
        img = Image.new('L', (28, 28), 0)
    else:
        img = img.crop(bbox)

    max_side = max(img.size)
    if max_side > 0:
        scale = 20.0 / max_side
        new_size = (max(1, int(img.size[0] * scale)),
                    max(1, int(img.size[1] * scale)))
        img = img.resize(new_size, Image.Resampling.LANCZOS)

    canvas = Image.new('L', (28, 28), 0)
    upper_left = ((28 - img.size[0]) // 2, (28 - img.size[1]) // 2)
    canvas.paste(img, upper_left)
    canvas = canvas.filter(ImageFilter.GaussianBlur(radius=0.5))

    tensor = base_to_tensor(canvas)
    tensor = mnist_normalize(tensor)
    tensor = tensor.unsqueeze(0).to(device)
    return tensor

def predict_from_pil(pil_img: Image.Image):
    tensor = preprocess_image(pil_img)
    with torch.no_grad():
        output = model(tensor)
        probs = torch.exp(output)
        conf, pred = torch.max(probs, dim=1)
    return pred.item(), conf.item()

@app.route('/predict', methods=['POST'])
def predict_digit():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    file = request.files['image']
    try:
        img = Image.open(file.stream)
        pred, conf = predict_from_pil(img)

        threshold = 0.4
        if conf < threshold:
            return jsonify({
                'prediction': None,
                'confidence': conf,
                'message': 'Unrecognized digit'
            })

        return jsonify({
            'prediction': pred,
            'confidence': conf
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# CRITICAL CHANGE FOR RENDER: Use PORT environment variable
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))  # Render sets PORT env var
    app.run(host='0.0.0.0', port=port)