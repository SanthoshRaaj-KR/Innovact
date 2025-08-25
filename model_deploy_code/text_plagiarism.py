import modal
import pickle
from pathlib import Path
from fastapi import UploadFile, Form
from fastapi.responses import JSONResponse
from fastapi import HTTPException
from typing import Optional
import nltk

# ---------------- Modal Setup ----------------
volume = modal.Volume.from_name("model-weights-vol", create_if_missing=True)
MODEL_DIR = Path("/models")
SAVED_MODEL_PATH = MODEL_DIR / "text_plagiarism.pkl"

image = (
    modal.Image.debian_slim()
    .pip_install(
        "scikit-learn==1.6.1",
        "numpy",
        "pandas",
        "fastapi[all]",
        "nltk"
    )
)

app = modal.App("text_plagiarism", image=image)

# ---------------- Modal Inference Class ----------------
@app.cls(image=image, volumes={MODEL_DIR: volume},timeout=120)
class AIHumanTextDetectorAPI:
    @modal.enter()
    def load_model(self):
        print("Loading AI vs Human Detection model...")
        try:
            with open(SAVED_MODEL_PATH, "rb") as f:
                model_data = pickle.load(f)

            self.vectorizer = model_data["vectorizer"]
            self.scaler = model_data["scaler"]
            self.model = model_data["model"]
            self.is_trained = model_data["is_trained"]

            print("Model loaded successfully from", SAVED_MODEL_PATH)

            # Ensure nltk tokenizers exist
            nltk.download("punkt", quiet=True)
            nltk.download("punkt_tab", quiet=True)
            nltk.download("stopwords", quiet=True)

        except Exception as e:
            print(f"Error loading model: {e}")
            raise e

    def prepare_features(self, texts, fit_vectorizer=False, fit_scaler=False):
        """
        IMPORTANT: Use the SAME preprocessing pipeline that was used in training.
        The saved vectorizer & scaler already embed the training-time feature logic,
        so we don’t need to reimplement `extract_linguistic_features` here.
        """
        # Transform with vectorizer
        tfidf_features = self.vectorizer.transform(texts)

        # Linguistic features: scaler was already fitted during training
        # Just transform input using that scaler
        # (The scaler expects the same linguistic feature shape as training)
        # So: just re-use scaler.transform with the right shape.
        # In training, it was scaler.transform(ling_df.values)
        # So we must rebuild that logic minimally.

        # === Minimal re-import of training extractor ===
        import pandas as pd
        from nltk.tokenize import sent_tokenize
        import numpy as np, re, string

        def extract_linguistic_features(text):
            features = {}
            words = text.split()
            try:
                sentences = sent_tokenize(text)
                sentence_count = len(sentences)
            except:
                sentence_count = max(text.count('.')+text.count('!')+text.count('?'),1)

            features['char_count']=len(text)
            features['word_count']=len(words)
            features['sentence_count']=sentence_count
            features['avg_word_length']=np.mean([len(w) for w in words]) if words else 0
            features['avg_sentence_length']=features['word_count']/max(sentence_count,1)
            features['exclamation_count']=text.count('!')
            features['question_count']=text.count('?')
            features['comma_count']=text.count(',')
            features['period_count']=text.count('.')
            features['uppercase_ratio']=sum(1 for c in text if c.isupper())/max(len(text),1)
            words_lower=text.lower().split()
            unique_words=set(words_lower)
            features['vocabulary_diversity']=len(unique_words)/max(len(words_lower),1)
            ai_phrases=['as an ai','i apologize','i understand','furthermore','moreover',
                        'additionally','in conclusion','to summarize','it is important to note',
                        'however','therefore','nevertheless']
            features['ai_phrases_count']=sum(phrase in text.lower() for phrase in ai_phrases)
            if len(words_lower)>1:
                bigrams=[' '.join(words_lower[i:i+2]) for i in range(len(words_lower)-1)]
                if bigrams:
                    import pandas as pd
                    bigram_counts=pd.Series(bigrams).value_counts()
                    features['max_bigram_freq']=bigram_counts.iloc[0]/len(bigrams)
                else:
                    features['max_bigram_freq']=0
            else:
                features['max_bigram_freq']=0
            def estimate_syllables(txt):
                words=re.findall(r'\b\w+\b',txt.lower())
                total=0
                for w in words:
                    total+=max(1,len(re.findall(r'[aeiouy]+',w)))
                return total
            features['syllable_density']=estimate_syllables(text)/max(features['word_count'],1)
            features['long_word_ratio']=sum(1 for w in words if len(w)>6)/max(len(words),1)
            return features

        ling_features=[extract_linguistic_features(t) for t in texts]
        ling_df=pd.DataFrame(ling_features)
        ling_scaled=self.scaler.transform(ling_df.values)

        return np.hstack([tfidf_features.toarray(), ling_scaled])

    # -------- Prediction Endpoint --------
    @modal.fastapi_endpoint(method="POST", docs=True, requires_proxy_auth=True)
    async def predict(self, file: Optional[UploadFile] = None, text: Optional[str] = Form(None)):
        """Predict if text is AI or Human generated"""
        try:
            # Input
            if file is not None:
                text_bytes=await file.read()
                text=text_bytes.decode("utf-8")
            elif text is not None:
                text=text
            else:
                raise HTTPException(status_code=400, detail="Either 'file' or 'text' parameter must be provided")

            if not text.strip():
                raise HTTPException(status_code=400, detail="Empty text provided")

            print(f"Processing input of length: {len(text)}")

            # Extract features with full pipeline
            features=self.prepare_features([text], fit_vectorizer=False, fit_scaler=False)

            # Predict
            pred_class=self.model.predict(features)[0]
            probas=self.model.predict_proba(features)[0]

            result={
                "prediction":"AI" if pred_class==1 else "Human",
                "confidence":float(max(probas)),
                "probabilities":{"Human":float(probas[0]),"AI":float(probas[1])},
                "input_length":len(text),
            }

            print(f"Prediction: {result['prediction']} (confidence: {result['confidence']:.3f})")

            return JSONResponse(result)

        except Exception as e:
            print(f"Error during prediction: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
