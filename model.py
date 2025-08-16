from openai import OpenAI
import base64

client = OpenAI()

# Path to your local image
image_path = "csse_example.png"

# Encode the image as base64
with open(image_path, "rb") as f:
    image_base64 = base64.b64encode(f.read()).decode("utf-8")

response = client.chat.completions.create(
    model="gpt-4.1-mini",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What's the answer to the question in this image?"},
                {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image_base64}"}},
            ],
        }
    ],
)

print(response.choices[0].message.content)
