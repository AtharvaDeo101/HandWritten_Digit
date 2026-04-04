import io
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms
from PIL import Image, ImageOps, ImageFilter
from flask import Flask, request, jsonify

app = Flask(__name__)

# CORS
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# CNN model (same architecture as training)
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
model.load_state_dict(
    torch.load(
        r'C:\\Users\\deoat\\Desktop\\DL Miniproject\\backend\\models\\mnist_cnn.pth',
        map_location=device
    )
)
model.eval()

# If you normalized MNIST during training, plug the same mean/std here.
# For standard MNIST: mean=0.1307, std=0.3081
mnist_normalize = transforms.Normalize((0.1307,), (0.3081,))

base_to_tensor = transforms.ToTensor()

def preprocess_image(pil_img: Image.Image) -> torch.Tensor:
    """
    Convert canvas PNG to MNIST-like 28x28 tensor:
    - Convert to grayscale
    - Invert (white digit on black background)
    - Crop to bounding box
    - Resize to 20x20, then pad to 28x28 and center
    - Optional blur to smooth strokes
    - Normalize like MNIST
    """
    # 1. Ensure grayscale
    img = pil_img.convert('L')

    # 2. Invert (canvas: black strokes on white, MNIST: white digit on black)
    img = ImageOps.invert(img)

    # 3. Binarize lightly to get a clear bounding box
    img = img.point(lambda x: 0 if x < 50 else 255, 'L')

    # 4. Crop to bounding box of the digit
    bbox = img.getbbox()
    if bbox is None:
        # Empty image
        img = Image.new('L', (28, 28), 0)
    else:
        img = img.crop(bbox)

    # 5. Resize to fit in 20x20, preserving aspect ratio (MNIST-style)
    max_side = max(img.size)
    if max_side > 0:
        scale = 20.0 / max_side
        new_size = (max(1, int(img.size[0] * scale)),
                    max(1, int(img.size[1] * scale)))
        img = img.resize(new_size, Image.Resampling.LANCZOS)

    # 6. Paste into 28x28 and center
    canvas = Image.new('L', (28, 28), 0)
    upper_left = ((28 - img.size[0]) // 2, (28 - img.size[1]) // 2)
    canvas.paste(img, upper_left)

    # 7. Slight blur to smooth jagged strokes (optional but often helps)
    canvas = canvas.filter(ImageFilter.GaussianBlur(radius=0.5))

    # 8. To tensor in [0,1], shape [1,28,28]
    tensor = base_to_tensor(canvas)

    # 9. Normalize exactly like during training
    tensor = mnist_normalize(tensor)

    # 10. Add batch dimension [1,1,28,28]
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

        # Adjust threshold as you like
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


if __name__ == '__main__':
    # For production, use a proper WSGI server instead of app.run
    app.run(host='0.0.0.0', port=5000)