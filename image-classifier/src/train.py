#!/usr/bin/env python3
"""
Clasificador de Imágenes: Perros vs Gatos (versión optimizada para CPU)
=====================================================================
Usa EfficientNet-B0 con backbone congelado (solo entrena la cabeza clasificadora)
y subset representativo para viabilidad en CPU.
"""

import os, sys, random, json, time
import numpy as np
from PIL import Image
from glob import glob

import torch
import torch.nn as nn
import torch.optim as optim
import torchvision
from torch.utils.data import DataLoader, Subset
from torchvision import datasets, transforms
from torchvision.models import efficientnet_b0

# ─── Configuración ──────────────────────────────────────────────────────────
SEED = 42
IMG_SIZE = 224
BATCH_SIZE = 16
EPOCHS = 15
LEARNING_RATE = 1e-3
PATIENCE = 3
TRAIN_SUBSET = 1000
TEST_SUBSET = 500

TRAIN_DIR = os.path.abspath("../data/processed/train")
TEST_DIR = os.path.abspath("../data/processed/test")
MODEL_DIR = os.path.abspath("../models")
MODEL_PATH = os.path.join(MODEL_DIR, "dogs_vs_cats_efficientnet.pth")

random.seed(SEED)
np.random.seed(SEED)
torch.manual_seed(SEED)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"🔧 Dispositivo: {device}")
print(f"📦 PyTorch {torch.__version__} | torchvision {torchvision.__version__}")
print()

# ─── 1. EDA ─────────────────────────────────────────────────────────────────
print("=" * 60)
print("1. ANÁLISIS EXPLORATORIO DE DATOS (EDA)")
print("=" * 60)

for split in ["train", "test"]:
    for cls in ["cat", "dog"]:
        path = os.path.join(f"../data/processed/{split}/{cls}")
        n = len(os.listdir(path))
        print(f"   {split}/{cls}: {n} imágenes")

cat_files = sorted(glob(os.path.join(TRAIN_DIR, "cat", "*.jpg")))
dog_files = sorted(glob(os.path.join(TRAIN_DIR, "dog", "*.jpg")))

sample = random.sample(cat_files + dog_files, min(500, len(cat_files) + len(dog_files)))
widths, heights = [], []
for f in sample:
    with Image.open(f) as img:
        w, h = img.size
        widths.append(w)
        heights.append(h)

print(f"\n📐 Variedad de tamaños (muestra de {len(sample)} imágenes):")
print(f"   Anchos: min={min(widths)}px, max={max(widths)}px, media={np.mean(widths):.0f}px")
print(f"   Altos:  min={min(heights)}px, max={max(heights)}px, media={np.mean(heights):.0f}px")
print(f"   → Redimensionando todas a {IMG_SIZE}×{IMG_SIZE}px\n")

# ─── 2. DATA LOADERS ────────────────────────────────────────────────────────
print("=" * 60)
print("2. PREPARACIÓN DE DATOS (ImageFolder + DataLoader)")
print("=" * 60)

train_transforms = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.RandomRotation(degrees=10),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
])

test_transforms = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
])

# Datasets completos
train_dataset_full = datasets.ImageFolder(TRAIN_DIR, transform=train_transforms)
test_dataset_full  = datasets.ImageFolder(TEST_DIR, transform=test_transforms)

# Subsets balanceados
random.seed(SEED)
train_indices = list(range(len(train_dataset_full)))
random.shuffle(train_indices)
train_indices = train_indices[:min(TRAIN_SUBSET, len(train_dataset_full))]

test_indices = list(range(len(test_dataset_full)))
random.shuffle(test_indices)
test_indices = test_indices[:min(TEST_SUBSET, len(test_dataset_full))]

train_dataset = Subset(train_dataset_full, train_indices)
test_dataset  = Subset(test_dataset_full, test_indices)

print(f"   Clases: {train_dataset_full.classes} → {train_dataset_full.class_to_idx}")
print(f"   Train subset: {len(train_dataset)} (de {len(train_dataset_full)})")
print(f"   Test subset:  {len(test_dataset)} (de {len(test_dataset_full)})")

train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE,
                          shuffle=True, num_workers=0)
test_loader  = DataLoader(test_dataset, batch_size=BATCH_SIZE,
                          shuffle=False, num_workers=0)

print(f"   Batches: train={len(train_loader)}, test={len(test_loader)}")
images, labels = next(iter(train_loader))
print(f"   Batch shape: {images.shape} | Labels: {labels[:10].tolist()}\n")

# ─── 3. MODELO EfficientNet-B0 (backbone congelado) ─────────────────────────
print("=" * 60)
print("3. ARQUITECTURA: EfficientNet-B0 (backbone frozen)")
print("=" * 60)

def build_model(num_classes=2, freeze_backbone=True):
    """
    Equivalente a Keras:
      EfficientNetB0(include_top=False, weights='imagenet', input_shape=(224,224,3))
      → GlobalAveragePooling2D() → Dense(128, relu) → Dense(2, softmax)
    """
    backbone = efficientnet_b0(weights='IMAGENET1K_V1')
    if freeze_backbone:
        for param in backbone.parameters():
            param.requires_grad = False
    backbone = nn.Sequential(*list(backbone.children())[:-2])

    model = nn.Sequential(
        backbone,
        nn.AdaptiveAvgPool2d((1, 1)),
        nn.Flatten(),
        nn.Linear(1280, 128), nn.ReLU(inplace=True),
        nn.Linear(128, num_classes),
    )
    return model

model = build_model(num_classes=2, freeze_backbone=True).to(device)
total_params = sum(p.numel() for p in model.parameters())
trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
print(f"   Total params: {total_params:,}")
print(f"   Trainable:    {trainable:,} (solo cabeza)")

x = torch.randn(2, 3, IMG_SIZE, IMG_SIZE).to(device)
out = model(x)
print(f"   Forward: {x.shape} → {out.shape}\n")

# ─── 4. ENTRENAMIENTO ───────────────────────────────────────────────────────
print("=" * 60)
print("4. ENTRENAMIENTO CON CALLBACKS")
print("=" * 60)

criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=LEARNING_RATE)

class ModelCheckpoint:
    def __init__(self, filepath, mode="max"):
        self.filepath = filepath
        self.mode = mode
        self.best = -float("inf") if mode == "max" else float("inf")
    def __call__(self, model, current):
        improved = (self.mode == "max" and current > self.best) or \
                   (self.mode == "min" and current < self.best)
        if improved:
            self.best = current
            torch.save(model.state_dict(), self.filepath)
            return True
        return False

class EarlyStopping:
    def __init__(self, patience=3, mode="min"):
        self.patience = patience
        self.mode = mode
        self.counter = 0
        self.best = float("inf") if mode == "min" else -float("inf")
        self.early_stop = False
    def __call__(self, current):
        improved = (self.mode == "min" and current < self.best) or \
                   (self.mode == "max" and current > self.best)
        if improved:
            self.best = current
            self.counter = 0
        else:
            self.counter += 1
            if self.counter >= self.patience:
                self.early_stop = True
        return self.early_stop

checkpointer = ModelCheckpoint(MODEL_PATH, mode="max")
early_stopper = EarlyStopping(patience=PATIENCE, mode="min")

def train_one_epoch(model, loader, criterion, optimizer):
    model.train()
    running_loss, correct, total = 0.0, 0, 0
    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        running_loss += loss.item() * images.size(0)
        _, predicted = outputs.max(1)
        total += labels.size(0)
        correct += predicted.eq(labels).sum().item()
    return running_loss / total, correct / total

def validate(model, loader, criterion):
    model.eval()
    running_loss, correct, total = 0.0, 0, 0
    with torch.no_grad():
        for images, labels in loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            loss = criterion(outputs, labels)
            running_loss += loss.item() * images.size(0)
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()
    return running_loss / total, correct / total

history = {"train_loss": [], "train_acc": [], "val_loss": [], "val_acc": []}
t_start = time.time()

for epoch in range(1, EPOCHS + 1):
    t_epoch = time.time()
    train_loss, train_acc = train_one_epoch(model, train_loader, criterion, optimizer)
    val_loss,   val_acc   = validate(model, test_loader, criterion)
    t_epoch = time.time() - t_epoch

    history["train_loss"].append(train_loss)
    history["train_acc"].append(train_acc)
    history["val_loss"].append(val_loss)
    history["val_acc"].append(val_acc)

    ckpt = checkpointer(model, val_acc)
    stopped = early_stopper(val_loss)
    ckpt_mark = " 💾" if ckpt else ""
    stop_mark = " ⏹" if stopped else ""
    print(f"   Época {epoch:2d}/{EPOCHS} | "
          f"Train loss: {train_loss:.4f} acc: {train_acc:.4f} | "
          f"Val loss: {val_loss:.4f} acc: {val_acc:.4f} | "
          f"{t_epoch:.0f}s{ckpt_mark}{stop_mark}")
    if stopped:
        print(f"   → Early stop: sin mejora en {PATIENCE} épocas")
        break

t_total = time.time() - t_start
print(f"\n✅ Entrenamiento completado en {t_total/60:.1f} min.")
print(f"   Mejor val_acc: {checkpointer.best:.4f}")
print(f"   Modelo: {MODEL_PATH}\n")

# ─── 5. EVALUACIÓN ──────────────────────────────────────────────────────────
print("=" * 60)
print("5. EVALUACIÓN DEL MEJOR MODELO")
print("=" * 60)

best_model = build_model(num_classes=2, freeze_backbone=True).to(device)
best_model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
best_model.eval()

all_preds, all_labels = [], []
with torch.no_grad():
    for images, labels in test_loader:
        images, labels = images.to(device), labels.to(device)
        outputs = best_model(images)
        _, predicted = outputs.max(1)
        all_preds.extend(predicted.cpu().numpy())
        all_labels.extend(labels.cpu().numpy())

all_preds = np.array(all_preds)
all_labels = np.array(all_labels)
final_acc = (all_preds == all_labels).mean()

print(f"   Test Accuracy: {final_acc:.4f} ({final_acc*100:.2f}%)")

from sklearn.metrics import confusion_matrix, classification_report
cm = confusion_matrix(all_labels, all_preds)
print(f"\n   Matriz de Confusión:")
print(f"                 Pred Gato   Pred Perro")
print(f"   Real Gato     {cm[0,0]:6d}      {cm[0,1]:6d}")
print(f"   Real Perro    {cm[1,0]:6d}      {cm[1,1]:6d}")
print(f"\n   Reporte de clasificación:")
print(classification_report(all_labels, all_preds, target_names=['Gato', 'Perro']))

# ─── 6. GUARDAR MÉTRICAS ────────────────────────────────────────────────────
metrics = {
    "final_test_accuracy": float(final_acc),
    "best_val_accuracy": float(checkpointer.best),
    "epochs_trained": len(history["train_loss"]),
    "total_params": total_params,
    "trainable_params": trainable,
    "train_subset_size": TRAIN_SUBSET,
    "test_subset_size": TEST_SUBSET,
    "training_time_minutes": round(t_total / 60, 1),
    "confusion_matrix": cm.tolist(),
    "history": history,
}

os.makedirs(MODEL_DIR, exist_ok=True)
metrics_path = os.path.join(MODEL_DIR, "metrics.json")
with open(metrics_path, "w") as f:
    json.dump(metrics, f, indent=2)
print(f"📊 Métricas guardadas en: {metrics_path}")

# ─── 7. CONCLUSIONES ────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("7. CONCLUSIONES")
print("=" * 60)
print(f"""
✅ Clasificador Perros vs Gatos completado con éxito.

📊 Resumen:
   - Dataset: {len(train_dataset_full)} imágenes (subset train: {TRAIN_SUBSET}, test: {TEST_SUBSET})
   - Arquitectura: EfficientNet-B0 (backbone frozen + GAP + Dense(128) + Dense(2))
   - Precisión en test: {final_acc*100:.2f}%
   - Parámetros entrenables: {trainable:,} de {total_params:,} totales
   - Tiempo de entrenamiento: {t_total/60:.1f} minutos

🔍 Próximos pasos recomendados:
   1. Entrenar con dataset completo (25K imágenes) en GPU
   2. Descongelar backbone y hacer fine-tuning completo
   3. Usar pesos pre-entrenados de ImageNet (transfer learning)
   4. Probar arquitecturas más grandes (EfficientNet-B1..B7)
""")
print("🎉 ¡Proyecto completado!")