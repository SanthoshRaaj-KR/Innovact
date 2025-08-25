import modal
import torch
import torch.nn as nn
import torch.nn.functional as F
from pathlib import Path
from fastapi import UploadFile, Form
from fastapi.responses import JSONResponse
from fastapi import HTTPException
from transformers import AutoModel, AutoTokenizer
from typing import Optional

# ---------------- Modal Setup ----------------
volume = modal.Volume.from_name("model-weights-vol", create_if_missing=True)
MODEL_DIR = Path("/models")
SAVED_MODEL_DIR = MODEL_DIR / "code_plagiarism_new"

image = (
    modal.Image.debian_slim()
    .pip_install("torch", "transformers", "fastapi[all]", "numpy", "pydantic")
)

app = modal.App("code-deepfake-detector", image=image)

# ---------------- Model Constants ----------------
LABEL_MAP = {0: "HUMAN_GENERATED", 1: "MACHINE_GENERATED"}

# ---------------- Custom Model Class ----------------
class CodePlagiarismModel(nn.Module):
    """Complete model that matches the saved finetuned model structure"""
    def __init__(self, bert_model, projection_dim=256, num_classes=2):
        super().__init__()
        # This structure should match your saved model
        self.text_encoder = bert_model  # Changed from self.bert to self.text_encoder
        self.additional_loss = nn.ModuleDict({
            'sentence_embedder': bert_model  # This creates the additional_loss.sentence_embedder path
        })
        self.text_projection = nn.Linear(1024, projection_dim)  # ModernBERT-large hidden size
        self.classifier = nn.Linear(projection_dim, num_classes)
        
    def forward(self, input_ids, attention_mask=None):
        # Use the sentence_embedder for inference (as per your training structure)
        bert_output = self.additional_loss.sentence_embedder(
            input_ids=input_ids, 
            attention_mask=attention_mask
        )
        # Use mean pooling of last hidden state
        sentence_embeddings = bert_output.last_hidden_state.mean(dim=1)
        # Project and classify
        projected = F.relu(self.text_projection(sentence_embeddings))
        logits = self.classifier(projected)
        
        return {
            "logits": logits,
            "embeddings": projected
        }

def load_finetuned_model(model_dir, device):
    """Load the complete finetuned model from saved files"""
    print(f"Loading finetuned model from {model_dir}")
    
    # Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(model_dir)
    
    # Load the state dict
    state_dict_path = model_dir / "pytorch_model.bin"
    state_dict = torch.load(state_dict_path, map_location=device)
    
    # Initialize a base BERT model
    bert_model = AutoModel.from_pretrained("answerdotai/ModernBERT-large")
    
    # Create our custom model
    model = CodePlagiarismModel(bert_model, projection_dim=256)
    
    print("All keys in saved state dict:")
    for key in sorted(state_dict.keys()):
        print(f"  {key}")
    
    # Load the complete state dict directly
    try:
        # First try to load the complete state dict
        missing_keys, unexpected_keys = model.load_state_dict(state_dict, strict=False)
        
        print(f"\nLoading results:")
        print(f"Missing keys: {len(missing_keys)}")
        if missing_keys:
            print("Missing keys:")
            for key in missing_keys[:10]:  # Show first 10
                print(f"  {key}")
            if len(missing_keys) > 10:
                print(f"  ... and {len(missing_keys) - 10} more")
        
        print(f"\nUnexpected keys: {len(unexpected_keys)}")
        if unexpected_keys:
            print("Unexpected keys:")
            for key in unexpected_keys[:10]:  # Show first 10
                print(f"  {key}")
            if len(unexpected_keys) > 10:
                print(f"  ... and {len(unexpected_keys) - 10} more")
                
        # If there are too many missing keys, we need to handle the structure mismatch
        if len(missing_keys) > 100:  # Arbitrary threshold
            print("\nToo many missing keys, attempting manual key mapping...")
            
            # Create a new state dict with corrected keys
            corrected_state_dict = {}
            
            for key, value in state_dict.items():
                if key.startswith('text_encoder.'):
                    # Map text_encoder to additional_loss.sentence_embedder
                    new_key = key.replace('text_encoder.', 'additional_loss.sentence_embedder.')
                    corrected_state_dict[new_key] = value
                else:
                    # Keep other keys as they are
                    corrected_state_dict[key] = value
            
            # Try loading with corrected keys
            missing_keys, unexpected_keys = model.load_state_dict(corrected_state_dict, strict=False)
            print(f"\nAfter key correction:")
            print(f"Missing keys: {len(missing_keys)}")
            print(f"Unexpected keys: {len(unexpected_keys)}")
    
    except Exception as e:
        print(f"Error loading state dict: {e}")
        # If direct loading fails, try the manual approach
        bert_state_dict = {}
        other_state_dict = {}
        
        for key, value in state_dict.items():
            if key.startswith('additional_loss.sentence_embedder.'):
                # These are BERT weights - map to our structure
                bert_key = key.replace('additional_loss.sentence_embedder.', '')
                bert_state_dict[bert_key] = value
            elif key.startswith('text_encoder.'):
                # These are also BERT weights - map to our structure  
                bert_key = key.replace('text_encoder.', '')
                bert_state_dict[bert_key] = value
            elif key in ['text_projection.weight', 'text_projection.bias', 
                         'classifier.weight', 'classifier.bias']:
                other_state_dict[key] = value
        
        # Load BERT weights into sentence_embedder
        if bert_state_dict:
            model.additional_loss.sentence_embedder.load_state_dict(bert_state_dict, strict=False)
        
        # Load projection and classifier weights
        if other_state_dict:
            model.load_state_dict(other_state_dict, strict=False)
    
    return model, tokenizer

# Alternative loading function if the above doesn't work
def load_finetuned_model_alternative(model_dir, device):
    """Alternative loading approach - reconstruct the exact training structure"""
    print(f"Loading finetuned model from {model_dir} (alternative method)")
    
    # Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(model_dir)
    
    # Load the state dict
    state_dict_path = model_dir / "pytorch_model.bin"
    state_dict = torch.load(state_dict_path, map_location=device)
    
    # Create a model class that exactly matches your training structure
    class ExactTrainingModel(nn.Module):
        def __init__(self):
            super().__init__()
            self.text_encoder = AutoModel.from_pretrained("answerdotai/ModernBERT-large")
            self.additional_loss = nn.ModuleDict({
                'sentence_embedder': AutoModel.from_pretrained("answerdotai/ModernBERT-large")
            })
            self.text_projection = nn.Linear(1024, 256)
            self.classifier = nn.Linear(256, 2)
        
        def forward(self, input_ids, attention_mask=None):
            bert_output = self.additional_loss.sentence_embedder(
                input_ids=input_ids, 
                attention_mask=attention_mask
            )
            sentence_embeddings = bert_output.last_hidden_state.mean(dim=1)
            projected = F.relu(self.text_projection(sentence_embeddings))
            logits = self.classifier(projected)
            
            return {
                "logits": logits,
                "embeddings": projected
            }
    
    # Create and load the model
    model = ExactTrainingModel()
    missing_keys, unexpected_keys = model.load_state_dict(state_dict, strict=False)
    
    print(f"Alternative loading - Missing: {len(missing_keys)}, Unexpected: {len(unexpected_keys)}")
    
    return model, tokenizer

# ---------------- Modal Inference Class ----------------
@app.cls(gpu="T4", image=image, volumes={MODEL_DIR: volume})
class DeepfakeCodeAPI:
    @modal.enter()
    def load_model(self):
        print("Loading BERT Code Plagiarism Detection model...")
        device = "cuda" if torch.cuda.is_available() else "cpu"
        self.device = device
        
        try:
            # Try the main loading method first
            try:
                self.model, self.tokenizer = load_finetuned_model(SAVED_MODEL_DIR, device)
            except Exception as e:
                print(f"Main loading method failed: {e}")
                print("Trying alternative loading method...")
                self.model, self.tokenizer = load_finetuned_model_alternative(SAVED_MODEL_DIR, device)
            
            # Move to device and set to eval mode
            self.model.to(device)
            self.model.eval()
            
            print(f"Model loaded successfully on {device}")
            
        except Exception as e:
            print(f"Error loading model: {str(e)}")
            raise e

    @modal.method()
    def test_model_structure(self):
        """Test method to debug model structure"""
        print("\nModel structure:")
        for name, module in self.model.named_modules():
            print(f"  {name}: {type(module).__name__}")
        
        print("\nModel parameters:")
        for name, param in self.model.named_parameters():
            print(f"  {name}: {param.shape}")

    @modal.fastapi_endpoint(method="POST", docs=True, requires_proxy_auth=True)
    async def predict(self, file: Optional[UploadFile] = None, code: Optional[str] = Form(None)):
        """Predict if code is human or machine generated"""
        try:
            # Get text input
            if file is not None:
                text_bytes = await file.read()
                text = text_bytes.decode("utf-8")
            elif code is not None:
                text = code
            else:
                raise HTTPException(status_code=400, detail="Either 'file' or 'code' parameter must be provided")
            
            if not text.strip():
                raise HTTPException(status_code=400, detail="Empty code provided")
            
            print(f"Processing code snippet of length: {len(text)}")
            
            # Tokenize
            encoding = self.tokenizer(
                text,
                padding=True,
                truncation=True,
                max_length=512,
                return_tensors="pt"
            )
            
            input_ids = encoding["input_ids"].to(self.device)
            attention_mask = encoding["attention_mask"].to(self.device)
            
            # Run inference
            with torch.no_grad():
                outputs = self.model(input_ids=input_ids, attention_mask=attention_mask)
                logits = outputs["logits"]
                probs = torch.softmax(logits, dim=1)[0].cpu().numpy()
                pred_class = int(probs.argmax())
                
                result = {
                    "prediction": pred_class,
                    "label": LABEL_MAP[pred_class],
                    "confidence": float(probs[pred_class]),
                    "probabilities": {LABEL_MAP[i]: float(p) for i, p in enumerate(probs)},
                    "input_length": len(text)
                }
                
                print(f"Prediction: {LABEL_MAP[pred_class]} (confidence: {result['confidence']:.3f})")
                
                return JSONResponse(result)
                
        except Exception as e:
            print(f"Error during prediction: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

