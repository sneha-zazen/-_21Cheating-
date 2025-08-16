import easyocr
from PIL import Image, ImageDraw, ImageFont
import numpy as np
import os

# Check if test image exists
image_path = 'csse_example.png'
if not os.path.exists(image_path):
    print(f"Error: {image_path} not found!")
    exit(1)

try:
    # Initialize EasyOCR reader
    # ['en'] for English, you can add more languages like ['en', 'es', 'fr']
    reader = easyocr.Reader(['en'])
    
    print("EasyOCR initialized successfully!")
    
    # Run OCR
    results = reader.readtext(image_path)
    
    # Check if we got results
    if not results:
        print("No text detected in the image.")
        exit(1)
    
    # Print all detected text
    print("\nDetected text:")
    print("-" * 50)
    all_text = []
    for i, (bbox, text, confidence) in enumerate(results):
        print(f"{i+1}. Text: '{text}' | Confidence: {confidence:.3f}")
        print(f"    Bounding box: {bbox}")
        all_text.append((bbox, text, confidence))
    
    # Optional: Create annotated image
    try:
        # Open the original image
        image = Image.open(image_path).convert('RGB')
        draw = ImageDraw.Draw(image)
        
        # Try to use a default font, fallback to basic if not available
        try:
            font = ImageFont.truetype("/usr/share/fonts/dejavu/DejaVuSans.ttf", 20)
        except:
            font = ImageFont.load_default()
        
        # Draw bounding boxes and text
        for bbox, text, confidence in results:
            # Convert bbox to rectangle coordinates
            top_left = tuple(map(int, bbox[0]))
            bottom_right = tuple(map(int, bbox[2]))
            
            # Draw rectangle
            draw.rectangle([top_left, bottom_right], outline="red", width=2)
            
            # Draw text above the box
            text_y = max(top_left[1] - 25, 0)
            draw.text((top_left[0], text_y), f"{text} ({confidence:.2f})", 
                     fill="red", font=font)
        
        # Save the result
        output_path = 'easyocr_output_with_text.png'
        image.save(output_path)
        print(f"\nAnnotated image saved as: {output_path}")
        
    except Exception as e:
        print(f"\nCould not create annotated image: {e}")

except Exception as e:
    print(f"Error running EasyOCR: {e}")
    exit(1)

print("\nEasyOCR processing completed successfully!")

print("Text detected: ", all_text)
