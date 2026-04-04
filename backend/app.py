import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms

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
model.load_state_dict(torch.load('mnist_cnn.pth', map_location=device))
model.eval()  # Set to evaluation mode

transform = transforms.Compose([
    transforms.ToTensor(),  # Converts to [0,1] range and CxHxW format
])

def preprocess_image(image):
    # image: PIL Image or numpy array (28x28 grayscale)
    tensor = transform(image).unsqueeze(0)  # Add batch dimension: [1, 1, 28, 28]
    return tensor.to(device)


def predict(image):
    tensor = preprocess_image(image)
    with torch.no_grad():
        output = model(tensor)
        prediction = output.argmax(dim=1).item()
    return prediction