# 🌐 Sila — Real-Time Sign Language Translator (PWA + FastAPI + ONNX)

<p align="center">
  <img src="logo-sila.png" alt="Sila logo" width="140" />
</p>

![HTML5](https://img.shields.io/badge/HTML5-orange?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-blue?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-yellow?logo=javascript&logoColor=black)
![PWA](https://img.shields.io/badge/Progressive%20Web%20App-563D7C?logo=pwa&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)
![ONNX](https://img.shields.io/badge/ONNX%20Runtime-inference-blue)
![Status](https://img.shields.io/badge/Status-Active-success)

---

## ✨ About

**Sila** هو نظام ويب تفاعلي يترجم  أحرف لغة الإشارة العربية إلى نص/صوت في الوقت الحقيقي.  
المشروع مكوّن من:
- **Front-End** حديث كـ **PWA** (تثبيت + عمل دون اتصال)
- **Back-End** بواسطة **FastAPI** لخدمة الاستدلال (Inference)
- **Model** بصيغة **ONNX** للتشغيل الخفيف والسريع على الخادم

التركيز على:
- واجهة بسيطة وسريعة وقابلة للوصول
- قابلية توصيل الكاميرا من المتصفح للترجمة اللحظية
- جاهزية للدمج مع نماذج ML/AI مستقبلًا

---

📊 Dataset

تم تدريب النموذج باستخدام Sila Dataset (يتكون من 32 فئة — حروف لغة الإشارة العربية).

🔗 [https://data.mendeley.com/datasets/y7pckrw6z2/1]

---
## 🧩 Features

### Front-End
- تصميم متجاوب لكل الأجهزة 📱💻  
- ملفات مرتبة: `index.html`, `styles.css`, `script.js`, `sw.js`, `manifest.json`  
- **Service Worker** لتسريع الأداء والعمل بدون إنترنت  
- **Manifest.json** يجعل المشروع **PWA** قابلاً للتثبيت  

### Back-End (FastAPI)
- واجهة REST نظيفة وسريعة
- تفعيل **CORS** للاتصال الآمن من الفرونت-إند
- نقطة نهاية `/predict` لاستقبال صورة (Base64 أو ملف) وإرجاع التنبؤ

### Model (ONNX)
- تحميل النموذج عند الإقلاع لتقليل زمن الاستجابة
- تشغيل الاستدلال عبر **ONNX Runtime** (CPU افتراضيًا)

---

## 🗂️ Project Structure

.
├─ index.html
├─ styles.css
├─ script.js
├─ sw.js
├─ manifest.json
├─ welcome.html
├─ logo-sila.png
├─ backend.py
├─ model.onnx # ضع نموذجك هنا
├─ requirements.txt
└─ README.md

> **ملاحظة:** تأكد من أن مسار النموذج في `backend.py` يطابق مكان الملف (مثل `MODEL_PATH = "model.onnx"`).

---

## 🚀 Getting Started

### 1) Front-End (Local)

```bash
# داخل مجلد المشروع
python -m http.server 5500
# افتح http://localhost:5500/
# بايثون 3.10+
pip install -r requirements.txt

# داخل مجلد المشروع
uvicorn backend:app --host 0.0.0.0 --port 8000 --reload



🧠 Model Notes (ONNX)
ضع ملف model.onnx في جذر المشروع (أو حدّث MODEL_PATH في backend.py).

يُفضّل تصدير النموذج بمدخل واحد (مثل 1x3x224x224) وتطبيع القيم [0..1] بنفس أسلوب التدريب.

داخل backend.py:

حمّل الجلسة مرة واحدة عند الإقلاع: onnxruntime.InferenceSession(MODEL_PATH, providers=["CPUExecutionProvider"])

نفّذ المعالجة المسبقة للصورة (Resize/CenterCrop/Normalize/CHW).

استدعِ session.run(...) ثم اختَر أعلى احتمالية.

🌐 Front-End ↔ Back-End (تكامل سريع)
في script.js، عند التقاط إطار من الكاميرا:

حوّل الصورة إلى Base64 (PNG/JPEG)

أرسلها إلى /predict

اعرض label مباشرة في واجهة المستخدم

تذكير: المتصفح يطلب HTTPS أو localhost للوصول إلى الكاميرا.

📦 Deployment (ملخّص)
Front-End (PWA): استضفه على Nginx/Apache أو خدمات مثل Vercel/Netlify (مع تمكين HTTPS).

Back-End (FastAPI): شغّل Uvicorn/Gunicorn خلف Nginx واصنع عكس Proxy على المنفذ 8000.

SSL: استخدم Let’s Encrypt (Certbot أو acme.sh) لتوليد شهادات مجانية.

CORS: حدّد allow_origins للدومين النهائي (مثل https://your-domain.com).

🧯 Troubleshooting
الكاميرا لا تعمل: استخدم HTTPS أو localhost. تأكد من صلاحيات المتصفح.

CORS Blocked: أضف دومين الفرونت-إند في allow_origins داخل الباك-إند.

بطء أول استدعاء: تحميل النموذج يتم عند الإقلاع؛ حافظ على جلسة الخادم قيد التشغيل.

أخطاء ONNX Runtime: تأكد من تنصيب onnxruntime المطابق لبيئتك (pip install onnxruntime).

🤝 Credits
Sila Team — Building accessible, real-time AI for everyone.

FastAPI, ONNX Runtime, PWA community.

