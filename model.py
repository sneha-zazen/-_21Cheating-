from openai import OpenAI
import base64

client = OpenAI()

PROMPT = """There is an attached image of an exam question with an answer circled. Your job 
is to extract what the question is and what the user has answerd. For example, if the image 
has a question "What is the capital of France?" with option "A) Paris", "B) London", "C) Berlin" 
and the user has circled "A", you should return as a strictly formatted JSON object:

{
    "question": "What is the capital of France?",
    "response": "Paris"
}

with no other text or formatting. If the image does not contain a question or answer, return an empty JSON object.
It is important that you do not include the letters A, B, C, etc. in the answer, only the actual answer text.
If the image contains multiple questions, return the first question and answer pair. If the image conatins a 
question but no answer, return the question with an empty answer field:

{
    "question": "What is the capital of France?",
    "response": ""
}

ONLY return the JSON object, do not include any other text or formatting.
"""


"""
Process an image file to extract question and answer. If the image contains a question and an answer, 
it returns a dictionary object with fields "question" and "response". If the image does not contain a question or answer,
it returns None. If the image contains a question but no answer, it returns the question with an empty response.

e.g.

Image contains question with circled answer:
{
    "question": "What is the capital of France?",
    "response": "Paris"
}


Image contains question but no circled answer:
{
    "question": "What is the capital of France?",
    "response": ""
}

Parameters:
- file_path (str): The path to the image file.

Returns:
- dict: A dictionary containing the question and answer extracted from the image.
"""
def process_image(file_path):
    with open(file_path, "rb") as f:
        image_base64 = base64.b64encode(f.read()).decode("utf-8")

    # Encode the image as base64
    with open(file_path, "rb") as f:
        image_base64 = base64.b64encode(f.read()).decode("utf-8")

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": PROMPT},
                    {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image_base64}"}},
                ],
            }
        ],
    )
    
    # Extract the response text
    response_text = response.choices[0].message.content.strip()
    try:
        # Parse the response as JSON
        import json
        result = json.loads(response_text)
        return result
    except json.JSONDecodeError:
        print("Failed to decode JSON response:", response_text)


if __name__ == "__main__":
    file_path = "images/csse_circle.png"  # Replace with your image file path
    print(process_image(file_path))