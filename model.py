from llava.model import LlavaForCausalLM
from llava.tokenizer import LlavaTokenizer
from llava.processors import LlavaProcessor
from PIL import Image
import torch

model_path = "./models/llava-v1.6-mistral-7b"
image_path = "csse_example.png"
question = "What's the answer to the question in the image?"

# Load processor, tokenizer, and model
processor = LlavaProcessor.from_pretrained(model_path)
tokenizer = LlavaTokenizer.from_pretrained(model_path)
model = LlavaForCausalLM.from_pretrained(model_path, device_map="auto", load_in_4bit=True)

# Load image
image = Image.open(image_path).convert("RGB")

# Prepare inputs
inputs = processor(images=[image], text=[question], return_tensors="pt").to(model.device)

# Generate
with torch.no_grad():
    output_ids = model.generate(**inputs, max_new_tokens=50)

# Decode
answer = tokenizer.decode(output_ids[0], skip_special_tokens=True)
print("Answer:", answer)
