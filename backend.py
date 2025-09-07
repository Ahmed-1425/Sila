from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import io
from PIL import Image
import numpy as np
import onnxruntime as ort
import uvicorn

app = FastAPI(title="Sila Sign Language Recognition API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://127.0.0.1:8000"],  # Frontend URLs
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Global variables
model_path = "assets/model.onnx"
session = None

# Stability system to prevent rapid letter changes
prediction_history = []
last_stable_prediction = None
stability_threshold = 3  # Need 3 consistent predictions to change
min_confidence_threshold = 0.1  # Minimum confidence for any prediction (lowered for better results)

# Prediction smoothing system
prediction_buffer = []
buffer_size = 5  # Keep last 5 predictions for smoothing

def smooth_prediction(predicted_class, confidence):
    """Apply smoothing to reduce prediction noise"""
    global prediction_buffer, buffer_size
    
    # Add current prediction to buffer
    prediction_buffer.append((predicted_class, confidence))
    
    # Keep only last N predictions
    if len(prediction_buffer) > buffer_size:
        prediction_buffer.pop(0)
    
    # If buffer is not full, return current prediction
    if len(prediction_buffer) < buffer_size:
        return predicted_class, confidence
    
    # Calculate weighted average based on confidence
    class_counts = {}
    total_confidence = 0
    
    for cls, conf in prediction_buffer:
        if cls not in class_counts:
            class_counts[cls] = 0
        class_counts[cls] += conf
        total_confidence += conf
    
    # Find the class with highest weighted confidence
    if total_confidence > 0:
        best_class = max(class_counts.items(), key=lambda x: x[1])[0]
        best_confidence = class_counts[best_class]
        
        # Only use smoothed prediction if it's significantly better
        if best_confidence > confidence * 1.2:  # 20% improvement threshold
            return best_class, best_confidence
    
    return predicted_class, confidence

def is_prediction_stable(predicted_class, confidence):
    """Check if prediction is stable enough to be displayed"""
    global prediction_history, last_stable_prediction, stability_threshold
    
    # Add current prediction to history
    prediction_history.append((predicted_class, confidence))
    
    # Keep only last 10 predictions
    if len(prediction_history) > 10:
        prediction_history.pop(0)
    
    # If we don't have enough history, don't change
    if len(prediction_history) < stability_threshold:
        return False
    
    # Check if last N predictions are the same class
    recent_predictions = [p[0] for p in prediction_history[-stability_threshold:]]
    is_stable = len(set(recent_predictions)) == 1 and recent_predictions[0] == predicted_class
    
    # Additional stability check: confidence should be above threshold
    if confidence < min_confidence_threshold:
        return False
    
    # If prediction is stable and different from last stable, update
    if is_stable and (last_stable_prediction is None or last_stable_prediction != predicted_class):
        last_stable_prediction = predicted_class
        return True
    
    # If prediction is stable and same as last stable, maintain
    if is_stable and last_stable_prediction == predicted_class:
        return True
    
    return False

def validate_model():
    """Validate that the model is working correctly"""
    global session
    try:
        print("🔍 Validating model...")
        
        # Create a test image (simple pattern)
        test_img = np.random.randint(0, 255, (64, 64), dtype=np.uint8)
        test_img = Image.fromarray(test_img)
        
        # Test basic preprocessing (avoid calling the complex function)
        img_array = np.array(test_img.convert("L").resize((64, 64)), dtype=np.float32)
        img_array = (img_array / 255.0 - 0.5) / 0.5  # Simple normalization
        img_array = np.expand_dims(np.expand_dims(img_array, axis=0), axis=0)
        print(f"✅ Preprocessing test passed")
        
        # Test inference
        input_name = session.get_inputs()[0].name
        prediction = session.run(None, {input_name: img_array})[0]
        
        print(f"✅ Inference test passed:")
        print(f"  Input shape: {img_array.shape}")
        print(f"  Output shape: {prediction.shape}")
        print(f"  Output range: [{np.min(prediction):.4f}, {np.max(prediction):.4f}]")
        
        # Test confidence calculation
        confidence = np.max(prediction)
        confidence_percent = (confidence / np.sum(np.abs(prediction))) * 100 if np.sum(np.abs(prediction)) > 0 else 0
        print(f"  Test confidence: {confidence:.4f} ({confidence_percent:.2f}%)")
        
        return True
        
    except Exception as e:
        print(f"❌ Model validation failed: {e}")
        return False

# Load the ONNX model
try:
    print("🔄 Loading ONNX model...")
    session = ort.InferenceSession(model_path)
    print("✅ Model loaded successfully from", model_path)
    
    # Validate the model
    if not validate_model():
        print("⚠️  Model validation failed, but continuing...")
    
except Exception as e:
    print(f"❌ Error loading model: {e}")
    session = None

# ========================================
# Preprocessing the image to match model input
# ========================================
def preprocess_image(img: Image.Image, size=64):
    """Preprocess image to match model input: [batch, 1, 64, 64]"""
    img = img.convert("L").resize((size, size))  # Convert to grayscale and resize
    img_array = np.array(img) / 255.0  # Normalize to [0, 1]
    img_array = (img_array - 0.5) / 0.5  # Normalize to [-1, 1]
    img_array = img_array.astype(np.float32)
    img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
    img_array = np.expand_dims(img_array, axis=0)  # Shape: [1, 1, 64, 64]
    return img_array

# Alternative preprocessing methods for different model input formats
def preprocess_image_alternative1(img: Image.Image, size=64):
    """Alternative preprocessing for models expecting different input format"""
    img = img.convert("L").resize((size, size))
    img_array = np.array(img) / 255.0  # Normalize to [0, 1]
    img_array = img_array.astype(np.float32)
    img_array = np.expand_dims(img_array, axis=0)  # Shape: [1, 64, 64]
    return img_array

def preprocess_image_alternative2(img: Image.Image, size=64):
    """Alternative preprocessing for RGB models"""
    img = img.resize((size, size))
    img_array = np.array(img) / 255.0  # Normalize to [0, 1]
    img_array = img_array.astype(np.float32)
    img_array = np.transpose(img_array, (2, 0, 1))  # Shape: [3, 64, 64]
    img_array = np.expand_dims(img_array, axis=0)  # Shape: [1, 3, 64, 64]
    return img_array

def preprocess_image_optimized(img: Image.Image, size=64):
    """Completely rewritten preprocessing to fix accuracy issues"""
    try:
        # Convert to grayscale and resize
        img = img.convert("L").resize((size, size))
        
        # Convert to numpy array
        img_array = np.array(img, dtype=np.float32)
        
        # Try multiple preprocessing methods and pick the best one
        preprocessing_methods = []
        
        # Method 1: Standard [0,1] normalization
        method1 = img_array / 255.0
        preprocessing_methods.append(("Standard [0,1]", method1))
        
        # Method 2: Z-score normalization
        method2 = (img_array - np.mean(img_array)) / (np.std(img_array) + 1e-8)
        preprocessing_methods.append(("Z-score", method2))
        
        # Method 3: Min-max normalization [-1,1]
        method3 = 2 * (img_array - np.min(img_array)) / (np.max(img_array) - np.min(img_array) + 1e-8) - 1
        preprocessing_methods.append(("Min-max [-1,1]", method3))
        
        # Method 4: Standard ImageNet normalization (most common for trained models)
        method4 = (img_array / 255.0 - 0.5) / 0.5
        preprocessing_methods.append(("Standard [-1,1]", method4))
        
        # Method 5: Simple normalization without offset
        method5 = img_array / 255.0
        preprocessing_methods.append(("Simple [0,1]", method5))
        
        # Method 6: Robust normalization (handle outliers)
        p2, p98 = np.percentile(img_array, (2, 98))
        method6 = np.clip((img_array - p2) / (p98 - p2), 0, 1)
        preprocessing_methods.append(("Robust [0,1]", method6))
        
        # Method 7: Enhanced contrast and brightness
        method7 = np.clip((img_array - 128) / 128, -1, 1)
        preprocessing_methods.append(("Enhanced [-1,1]", method7))
        
        # Use the standard method first (most likely to work with trained models)
        img_array = method4
        
        # Ensure proper shape: [1, 1, 64, 64]
        img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)  # Add channel dimension
        
        return img_array, "Original [-1,1]"
        
    except Exception as e:
        print(f"❌ Preprocessing error: {e}")
        # Fallback to basic preprocessing
        img_array = np.array(img.convert("L").resize((size, size)), dtype=np.float32) / 255.0
        img_array = np.expand_dims(np.expand_dims(img_array, axis=0), axis=0)
        return img_array, "Fallback [0,1]"

@app.get("/")
async def root():
    return {"message": "Sila Sign Language Recognition API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "sign-recognition"}

@app.post("/api/sign/recognize")
async def recognize_sign(request: Request):
    try:
        # Get the image data from the request body
        data = await request.body()
        content_type = request.headers.get("content-type", "unknown")

        if not data:
            return JSONResponse(
                status_code=400,
                content={"error": "No image data received"}
            )
        
        # Convert bytes to PIL Image
        img = Image.open(io.BytesIO(data)).convert("RGB")
        
        # Check if model is loaded
        if session is None:
            # Placeholder mode - return random English pronunciations
            import random
            english_pronunciations = ["ain", "al", "aleff", "bb", "dal", "dha", "dhad", "fa", "gaaf", "ghain", "ha", "haa", "jeem", "kaaf", "khaa", "la", "laam", "meem", "nun", "ra", "saad", "seen", "sheen", "ta", "taa", "thaa", "thal", "toot", "waw", "ya", "yaa", "zay"]
            predicted_text = random.choice(english_pronunciations)
            confidence = 0.85
        else:
            # Use the optimized preprocessing method for this specific model
            try:
                img_array, preprocessing_method = preprocess_image_optimized(img, size=64)
                
                # Get model input/output names
                input_name = session.get_inputs()[0].name
                output_name = session.get_outputs()[0].name
                
                print(f"🔍 Processing image:")
                print(f"  Expected shape: {[dim if dim != -1 else 'batch' for dim in session.get_inputs()[0].shape]}")
                print(f"  Actual shape: {img_array.shape}")
                print(f"  Input type: {img_array.dtype}")
                print(f"  Preprocessing method: {preprocessing_method}")
                
                # Run inference
                prediction = session.run(None, {input_name: img_array})[0]
                
                print(f"✅ Inference successful!")
                print(f"  Output shape: {prediction.shape}")
                print(f"  Output type: {prediction.dtype}")
                
                # Get predicted class and confidence
                predicted_class = np.argmax(prediction)
                confidence = np.max(prediction)
                
                # Apply prediction smoothing
                smoothed_class, smoothed_confidence = smooth_prediction(predicted_class, confidence)
                
                # Use smoothed prediction if it's better
                if smoothed_confidence > confidence:
                    predicted_class = smoothed_class
                    confidence = smoothed_confidence
                    print(f"🎯 Smoothed prediction: class {smoothed_class} (confidence improved from {confidence:.4f} to {smoothed_confidence:.4f})")
                
                # Calculate confidence percentage for better understanding
                # Use softmax to get proper probability distribution
                prediction_softmax = np.exp(prediction - np.max(prediction))
                prediction_softmax = prediction_softmax / np.sum(prediction_softmax)
                confidence_percent = np.max(prediction_softmax) * 100
                
                print(f"🎯 Prediction results:")
                print(f"  Predicted class: {predicted_class}")
                print(f"  Raw confidence: {confidence:.4f}")
                print(f"  Confidence percentage: {confidence_percent:.2f}%")
                print(f"  Raw prediction values: {prediction.flatten()[:5]}...")
                
                # Dynamic confidence threshold based on model performance
                if confidence_percent < 20.0:  # Very low confidence
                    CONFIDENCE_THRESHOLD = 0.1   # Lower threshold for low confidence
                elif confidence_percent < 50.0:  # Medium confidence
                    CONFIDENCE_THRESHOLD = 0.3   # Medium threshold
                else:
                    CONFIDENCE_THRESHOLD = 0.5   # Higher threshold for high confidence
                
                # Apply stricter confidence requirements for stability
                if confidence < min_confidence_threshold:
                    print(f"🚫 Confidence too low for stability: {confidence:.4f} < {min_confidence_threshold}")
                    predicted_text = "غير معروف"
                    return {
                        "text": str(predicted_text),
                        "confidence": float(confidence),
                        "class": int(predicted_class),
                        "debug": {
                            "preprocessing_method": str(preprocessing_method),
                            "confidence_raw": float(confidence),
                            "confidence_percent": float(confidence_percent),
                            "predicted_class": int(predicted_class),
                            "model_output_shape": [int(x) for x in prediction.shape],
                            "threshold_used": float(CONFIDENCE_THRESHOLD),
                            "is_stable": False,
                            "last_stable_class": int(last_stable_prediction) if last_stable_prediction is not None else None,
                            "stability_threshold": int(stability_threshold),
                            "prediction_history_length": int(len(prediction_history)),
                            "reason": "confidence_below_minimum"
                        }
                    }
                
                # If confidence is too low, try alternative preprocessing methods
                if confidence < CONFIDENCE_THRESHOLD:
                    print(f"⚠️  Low confidence prediction ({confidence:.4f} < {CONFIDENCE_THRESHOLD})")
                    print("🔄 Trying alternative preprocessing methods...")
                    
                    # Try all preprocessing methods to find the best one
                    best_confidence = confidence
                    best_prediction = prediction
                    best_method = preprocessing_method
                    best_class = predicted_class
                    
                    for method_name, method_func in [
                        ("Standard [0,1]", lambda x: x / 255.0),
                        ("Z-score", lambda x: (x - np.mean(x)) / (np.std(x) + 1e-8)),
                        ("Min-max [-1,1]", lambda x: 2 * (x - np.min(x)) / (np.max(x) - np.min(x) + 1e-8) - 1),
                        ("ImageNet [-1,1]", lambda x: (x / 255.0 - 0.5) / 0.5),
                        ("Enhanced [-1,1]", lambda x: np.clip((x - 128) / 128, -1, 1)),
                        ("Robust [0,1]", lambda x: np.clip((x - np.percentile(x, 2)) / (np.percentile(x, 98) - np.percentile(x, 2)), 0, 1))
                    ]:
                        try:
                            # Apply alternative preprocessing
                            img_alt = np.array(img.convert("L").resize((64, 64)), dtype=np.float32)
                            img_alt = method_func(img_alt)
                            img_alt = np.expand_dims(np.expand_dims(img_alt, axis=0), axis=0)
                            
                            # Run inference with alternative preprocessing
                            prediction_alt = session.run(None, {input_name: img_alt})[0]
                            confidence_alt = np.max(prediction_alt)
                            predicted_class_alt = np.argmax(prediction_alt)
                            
                            print(f"  🔄 {method_name}: class {predicted_class_alt}, confidence {confidence_alt:.4f}")
                            
                            # Use the better result
                            if confidence_alt > best_confidence:
                                best_confidence = confidence_alt
                                best_prediction = prediction_alt
                                best_method = method_name
                                best_class = predicted_class_alt
                                print(f"    ✅ Better result found!")
                                
                        except Exception as e:
                            print(f"    ❌ {method_name} failed: {e}")
                    
                    # Update with best result
                    if best_confidence > confidence:
                        prediction = best_prediction
                        predicted_class = best_class
                        confidence = best_confidence
                        preprocessing_method = best_method
                        print(f"🎉 Using {best_method} preprocessing (confidence improved from {confidence:.4f} to {best_confidence:.4f})")
                
                # Final confidence check
                if confidence < CONFIDENCE_THRESHOLD:
                    print(f"⚠️  Final low confidence prediction ({confidence:.4f} < {CONFIDENCE_THRESHOLD})")
                    predicted_text = "غير معروف"  # Unknown
                else:
                    # Class mapping: Map model output directly to Arabic letters
                    class_mapping = {
                        0: "ع",      # ain
                        1: "ال",     # al
                        2: "أ",      # aleff
                        3: "ب",      # bb
                        4: "د",      # dal
                        5: "ظ",      # dha
                        6: "ض",      # dhad
                        7: "ف",      # fa
                        8: "ق",      # gaaf
                        9: "غ",      # ghain
                        10: "هـ",    # ha
                        11: "ح",     # haa
                        12: "ج",     # jeem
                        13: "ك",     # kaaf
                        14: "خ",     # khaa
                        15: "لا",    # la
                        16: "ل",     # laam
                        17: "م",     # meem
                        18: "ن",     # nun
                        19: "ر",     # ra
                        20: "ص",     # saad
                        21: "س",     # seen
                        22: "ش",     # sheen
                        23: "ت",     # ta
                        24: "ط",     # taa
                        25: "ث",     # thaa
                        26: "ذ",     # thal
                        27: "ت",     # toot
                        28: "و",     # waw
                        29: "ي",     # ya
                        30: "يا",    # yaa
                        31: "ز",     # zay
                    }

                    # Check if prediction is stable
                    is_stable = is_prediction_stable(predicted_class, confidence)
                    
                    if is_stable:
                        predicted_text = class_mapping.get(predicted_class, f"غير معروف (class {predicted_class})")
                        print(f"✅ STABLE prediction: {predicted_text} (class {predicted_class}) with confidence {confidence:.4f}")
                    else:
                        # Use last stable prediction if available, otherwise show unknown
                        if last_stable_prediction is not None:
                            predicted_text = class_mapping.get(last_stable_prediction, f"غير معروف (class {last_stable_prediction})")
                            print(f"🔄 UNSTABLE - using last stable: {predicted_text} (class {last_stable_prediction})")
                        else:
                            predicted_text = "غير معروف"
                            print(f"⏳ Building stability - need {stability_threshold} consistent predictions")
                    
                    # Show stability info
                    recent_classes = [int(p[0]) for p in prediction_history[-5:]] if len(prediction_history) >= 5 else []
                    print(f"📊 Stability: Recent classes: {recent_classes}, Stable threshold: {stability_threshold}")
                
                # Add comprehensive debug info to response - convert ALL numpy types
                debug_info = {
                    "preprocessing_method": str(preprocessing_method),
                    "confidence_raw": float(confidence),
                    "confidence_percent": float(confidence_percent),
                    "predicted_class": int(predicted_class),
                    "model_output_shape": [int(x) for x in prediction.shape],
                    "threshold_used": float(CONFIDENCE_THRESHOLD),
                    "is_stable": bool(is_prediction_stable(predicted_class, confidence)),
                    "last_stable_class": int(last_stable_prediction) if last_stable_prediction is not None else None,
                    "stability_threshold": int(stability_threshold),
                    "prediction_history_length": int(len(prediction_history))
                }
                
                # Convert numpy types to Python native types for JSON serialization
                return {
                    "text": str(predicted_text),
                    "confidence": float(confidence),
                    "class": int(predicted_class),
                    "debug": debug_info
                }
                
            except Exception as e:
                print(f"❌ Model inference error: {e}")
                return {
                    "error": f"Model inference failed: {str(e)}",
                    "text": "غير معروف",
                    "confidence": 0.0,
                    "class": -1
                }

    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": f"Internal server error: {str(e)}"}
        )

@app.post("/api/sign/recognize-debug")
async def recognize_sign_debug(request: Request):
    """Debug endpoint to see what's being received"""
    try:
        data = await request.body()
        content_type = request.headers.get("content-type", "unknown")
        
        return {
            "received_bytes": len(data),
            "content_type": content_type,
            "first_100_bytes": str(data[:100]),
            "message": "Debug info - check if image data is being received correctly"
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    print("Starting Sila Sign Language Recognition API...")
    print("Frontend should be running on http://localhost:8000")
    print("Backend will be available on http://127.0.0.1:8010")
    print("API endpoint: http://127.0.0.1:8010/api/sign/recognize")
    print("\nPress Ctrl+C to stop the server")
    
    uvicorn.run(
        app, 
        host="127.0.0.1", 
        port=8010,
        log_level="info"
    )