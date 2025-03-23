# 🛒 ScanCart - Retail Product Scanner

ScanCart is a full-stack retail application that allows users to scan an image of a product and compare prices across different retailers. It leverages the **Google Cloud Vision API** for product recognition and brand detection, along with a **custom web scraping solution** to fetch price comparisons from platforms like **Amazon and Target**.

## 🚀 Features

- 📷 **Image Upload & Webcam Capture:** Users can upload an image or capture one using their webcam.  
- 🧠 **Google Cloud Vision API Integration:** Extracts product details, labels, and brand information.  
- 🔎 **Web Scraping for Price Comparison:** Retrieves product pricing from retailers like Amazon and Target.  
- 📝 **AI-Generated Descriptions:** Provides product descriptions based on detected features.  
- 🎨 **User-Friendly Interface:** One-page web application with a clean and intuitive UI.  

## 🏗️ Tech Stack

**Frontend:**  
- React.js (with Vite for fast builds)  
- Tailwind CSS for styling  
- Webcam capture using `react-webcam`  

**Backend:**  
- Flask (Python) for API handling  
- Google Cloud Vision API for image processing  
- BeautifulSoup & Requests for web scraping  

## 📦 Installation & Setup

### Prerequisites
- Node.js & npm installed
- Python 3 installed
- Google Cloud API credentials (for Vision API)

### Frontend Setup  
1. Clone the repository:  
   ```bash
   git clone https://github.com/your-repo/scancarts.git
   cd scancart/frontend
