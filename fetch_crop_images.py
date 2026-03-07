import json

# Curated list of high-quality Unsplash agriculture images
# Using base URLs without parameters to prevent parsing/escaping issues in DBs or React
IMAGES = {
    "Wheat": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b",
    "Rice": "https://images.unsplash.com/photo-1586208537573-0ed7b5247814",
    "Tomato": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea",
    "Cotton": "https://images.unsplash.com/photo-1584551185347-19aa14bc81aa",
    "Sugarcane": "https://images.unsplash.com/photo-1505322839257-2c9ff5068f64",
    "Maize": "https://images.unsplash.com/photo-1627920769493-2c1b2f767a92",
    "Millets": "https://images.unsplash.com/photo-1588169135064-071a9a464956",
    "Potato": "https://images.unsplash.com/photo-1518977676601-b53f82aba655",
    "Onion": "https://images.unsplash.com/photo-1620574387735-3624d75b2dbc",
    "Soybean": "https://images.unsplash.com/photo-1599307730999-5ef861c8ed32",
    "Turmeric": "https://images.unsplash.com/photo-1615486511116-2d147bb43d6c",
    "Mustard": "https://images.unsplash.com/photo-1586864387789-228fff0b6c1c",
    "Chana": "https://images.unsplash.com/photo-1616422340798-750ebcd9fe18",
    "Groundnut": "https://images.unsplash.com/photo-1634563820293-18105e1fc4c8",
    "Brinjal": "https://images.unsplash.com/photo-1630138379435-0de3bdcda067",
    "Cabbage": "https://images.unsplash.com/photo-1592634358823-380ff9baab1d",
    "Cauliflower": "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3",
    "Spinach": "https://images.unsplash.com/photo-1576043005963-f4b2a8d1195d",
    "Peas": "https://images.unsplash.com/photo-1587411768407-6ba7dc603f90",
    "Carrot": "https://images.unsplash.com/photo-1590868309235-ea34bed7bd7f",
    "Garlic": "https://images.unsplash.com/photo-1518296316270-b1d5c22f641a",
    "Ginger": "https://images.unsplash.com/photo-1615486171448-4fdcf5142171"
}

def generate_db_seed():
    """Generates a JSON ready to be injected into a MongoDB or dummy JSON database"""
    
    output = {
        "crops": [
            {
                "id": idx + 1,
                "name": name,
                "image": url,
                "description": f"Detailed growing profile and AI guidance for {name}."
            } for idx, (name, url) in enumerate(IMAGES.items())
        ]
    }
    
    with open('crop_images.json', 'w') as f:
        json.dump(output, f, indent=2)
        
    print("✅ Created crop_images.json with simplified base Unsplash URLs.")
    
if __name__ == "__main__":
    generate_db_seed()
