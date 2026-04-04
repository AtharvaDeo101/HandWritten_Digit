import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms
from PIL import Image
from flask import Flask, request, jsonify

app = Flask(__name__)

# Enable CORS for all routes
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Define the same CNN architecture
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

# Load model
device = torch.device('cpu')  # Use CPU for web deployment unless you have GPU
model = CNN().to(device)
model.load_state_dict(torch.load(r'C:\Users\deoat\Desktop\DL Miniproject\backend\models\mnist_cnn.pth', map_location=device))
model.eval()  # Set to evaluation mode

transform = transforms.Compose([
    transforms.ToTensor(),  # Converts to [0,1] range and CxHxW format
])

def preprocess_image(image):
    # image: PIL Image or numpy array (28x28 grayscale)
    # MNIST has black background (0) and white digits (up to 1.0)
    # Canvas drawing has white background and black strokes, so we need to invert
    tensor = transform(image)  # [0,1] range
    tensor = 1.0 - tensor  # INVERT: black background, white strokes
    tensor = tensor.unsqueeze(0)  # Add batch dimension: [1, 1, 28, 28]
    return tensor.to(device)

def predict(image):
    tensor = preprocess_image(image)
    with torch.no_grad():
        output = model(tensor)
        # Get the probabilities
        probabilities = torch.exp(output)  # because we used log_softmax
        # Get the predicted class and the confidence (max probability)
        confidence, prediction = torch.max(probabilities, dim=1)
    return prediction.item(), confidence.item()

@app.route('/predict', methods=['POST'])
def predict_digit():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    file = request.files['image']
    # Open the image
    img = Image.open(file.stream)
    # Convert to grayscale if it's not
    if img.mode != 'L':
        img = img.convert('L')
    # Resize to 28x28 if needed (the canvas is 500x500, but model expects 28x28)
    img = img.resize((28, 28))
    # Make prediction
    try:
        pred, conf = predict(img)
        # We'll consider a digit recognized if confidence > 0.6 (lowered threshold for testing)
        if conf < 0.6:
            return jsonify({'prediction': None, 'confidence': conf, 'message': 'Unrecognized digit'})
        else:
            return jsonify({'prediction': pred, 'confidence': conf})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)