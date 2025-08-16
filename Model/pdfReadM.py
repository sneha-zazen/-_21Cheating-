from openai import OpenAI
import json

client = OpenAI()

PROMPT = """Extract the first MCQ and its highlighted answer from this PDF.
Return ONLY a JSON object:
{
  "question": "...",
  "response": "..."
}
If no answer is highlighted, return response as "".
If no question exists, return {}.
Do not include option letters, only answer text.
"""

def process_pdf(file_path):
    with open(file_path, "rb") as f:
        pdf_file = f.read()

    response = client.chat.completions.create(
        model="gpt-4.1-mini",  # lightweight model
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": PROMPT},
                    {
                        "type": "input_file",
                        "input_file": {
                            "file": pdf_file,
                            "media_type": "application/pdf",
                            "name": file_path
                        },
                    },
                ],
            }
        ],
    )

    response_text = response.choices[0].message.content.strip()
    try:
        return json.loads(response_text)
    except json.JSONDecodeError:
        print("⚠️ Failed to decode JSON:", response_text)
        return None


if __name__ == "__main__":
    file_path = "images/Engg1300/2520555.jpg"  # Replace with your test PDF
    print(process_pdf(file_path))
