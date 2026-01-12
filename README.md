# AI-Powered ERP System 🚀

A modern, lightweight Enterprise Resource Planning (ERP) API built with **FastAPI**. This system integrates database persistence, probabilistic inventory analytics, and AI-driven OCR (Optical Character Recognition) to streamline order management.

## 🌟 Key Features

* **Order Management**: Full CRUD capabilities for tracking inventory orders using **SQLAlchemy** and **SQLite**.
* **Probabilistic Analytics**: Leverages **Pandas** to calculate demand probability distributions and identify critical inventory risks.
* **AI Vision (OCR)**: Extracts text from uploaded receipt images using **Tesseract OCR** and **Pillow**.
* **Auto-Documentation**: Provides a fully interactive API documentation interface via **Swagger UI** (OpenAPI).



## 🛠️ Technical Stack

* **Backend**: FastAPI (Python)
* **Database**: SQLite with SQLAlchemy ORM
* **Data Science**: Pandas
* **AI/Vision**: Tesseract OCR, PIL (Pillow)
* **Validation**: Pydantic

## 🚀 Getting Started

### Prerequisites
* Python 3.10+
* Tesseract OCR Engine installed on your system.

### Installation
1. Clone the repository:
   git clone [https://github.com/roastytoasty777/ai_erp_project.git](https://github.com/roastytoasty777/ai_erp_project.git)
   cd ai_erp_project

2. Install the required libraries:
pip install fastapi uvicorn sqlalchemy pandas pytesseract pillow

### Running the Application
Start the local development server:

uvicorn main:app --reload

Access the documentation at: http://127.0.0.1:8000/docs

## 📊 Analytics Logic
The system applies Foundations of Probability to inventory data. It calculates the demand_probability for each item as:
<div align="center">
  <img src="https://latex.codecogs.com/svg.latex?\color{white}\Large&space;P(\text{item})=\frac{\sum\text{Quantity}_{\text{item}}}{\sum\text{Quantity}_{\text{total}}}" title="Probability Formula" alt="P(item) = sum(Quantity_item) / sum(Quantity_total)" />
</div>
If <img src="https://latex.codecogs.com/svg.latex?\color{white}P(\text{item})>0.6" title="Critical Risk" vertical-align="middle" height="18" />, the system flags the item as CRITICAL risk.