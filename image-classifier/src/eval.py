"""Evaluación rápida del modelo entrenado (sin re-ejecutar train.py)"""
import json, torch, random
import torch.nn as nn
from torch.utils.data import DataLoader, Subset
from torchvision.datasets import ImageFolder
from torchvision.models import efficientnet_b0
from torchvision import transforms
from sklearn.metrics import confusion_matrix, classification_report

device = torch.device('cpu')

# --- Construir modelo (misma arquitectura que train.py) ---
backbone = efficientnet_b0(weights='IMAGENET1K_V1')
for param in backbone.parameters():
    param.requires_grad = False
backbone = nn.Sequential(*list(backbone.children())[:-2])

model = nn.Sequential(
    backbone,
    nn.AdaptiveAvgPool2d((1, 1)),
    nn.Flatten(),
    nn.Linear(1280, 128), nn.ReLU(inplace=True),
    nn.Linear(128, 2),
).to(device)
model.load_state_dict(torch.load('../models/dogs_vs_cats_efficientnet.pth', map_location=device))
model.eval()

# --- Data ---
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])
full_test = ImageFolder('../data/processed/test', transform=transform)
random.seed(42)
indices = random.sample(range(len(full_test)), min(500, len(full_test)))
test_loader = DataLoader(Subset(full_test, indices), batch_size=16, num_workers=0)

# --- Evaluar ---
correct, total = 0, 0
all_preds, all_labels = [], []
with torch.no_grad():
    for x, y in test_loader:
        out = model(x)
        pred = out.argmax(dim=1)
        correct += (pred == y).sum().item()
        total += y.size(0)
        all_preds.extend(pred.tolist())
        all_labels.extend(y.tolist())

acc = correct / total
print(f'\n✅ Test Accuracy: {acc:.4f} ({acc*100:.2f}%)')

cm = confusion_matrix(all_labels, all_preds)
print('\n📊 Confusion Matrix:')
print(f'           cat   dog')
print(f'cat     {cm[0,0]:4d}  {cm[0,1]:4d}')
print(f'dog     {cm[1,0]:4d}  {cm[1,1]:4d}')

print('\n📋 Classification Report:')
print(classification_report(all_labels, all_preds, target_names=['cat', 'dog']))

# --- Guardar métricas ---
metrics = {
    'test_accuracy': acc,
    'best_val_acc': 0.96,
    'model': 'EfficientNet-B0 (pre-trained ImageNet, backbone frozen)',
    'total_params': 4171774,
    'trainable_params': 164226,
    'test_samples': total,
    'confusion_matrix': cm.tolist()
}
with open('../models/metrics.json', 'w') as f:
    json.dump(metrics, f, indent=2)
print('📁 metrics.json guardado')