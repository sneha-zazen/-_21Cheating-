from openai import OpenAI
import base64
import pprint
import json

client = OpenAI()

PROMPT = """There is an attached image of an exam question with an answer circled. Your job 
is to extract what the question is and what the user has answerd and what the answer should be. For example, if the image 
has a question "What is the capital of France?" with option "A) Paris", "B) London", "C) Berlin" 
and the user has circled "A", you should return as a strictly formatted JSON object:

{
    "question": "What is the capital of France?",
    "response": "Paris",
    "correct_answer": "Paris"
}

with no other text or formatting. If the image does not contain a question or answer, return an empty JSON object.
It is important that you do not include the letters A, B, C, etc. in the answer, only the actual answer text.
If the image contains multiple questions, return a list of question-response-answer objects. If the image contains a
question but no answer, return the question with an empty answer field:

{
    "question": "What is the capital of France?",
    "response": "",
    "correct_answer": "Paris"
}

ONLY return the JSON object, do not include any other text or formatting.
"""

def process_pdf(file_path):
    prompt = """
    You will be given a PDF file containing exam questions. Your task is to extract
    the year of the exam, the course code, the type of exam (e.g., midterm, final), 
    and a list of question answer pairs. Each question should be associated with its answer
    and the answer should be the text of the answer, not the option letter. On some 
    papers, the answer may be highlighted or circled. If no answer is highlighted,
    return an empty string for the response. 
    
    Return the extracted information as a JSON object with the following structure:
    {
        "year": "2023",
        "course_code": "CSEE1001",
        "exam_type": "midterm",
        "questions": [
            {
                "question": "What is the capital of France?",
                "response": "Paris"
            },
            {
                "question": "What is 2 + 2?",
                "response": "4"
            }
        ]
    }
    
    Return EXACTLY this JSON structure, with no additional text or formatting.
    """
    with open(file_path, "rb") as f:
        uploaded_file = client.files.create(
            file=f,
            purpose="assistants"  # or "fine-tune" depending on usage
        )

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "file",
                        "file": {
                            "file_id": uploaded_file.id  # ✅ this is what the API wants
                        },
                    },
                ],
            }
        ],
    )

    response_text = response.choices[0].message.content.strip()
    try:
        result = json.loads(response_text)
        return result
    except json.JSONDecodeError:
        print("⚠️ Failed to decode JSON:", response_text)
        return None



def process_image(file_path):
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
    print("Response:", response)
    response_text = response.choices[0].message.content.strip()
    try:
        # Parse the response as JSON
        
        result = json.loads(response_text)
        return result
    except json.JSONDecodeError:
        print("Failed to decode JSON response:", response_text)


if __name__ == "__main__":
    file_path = "images/Engg1300/2520555.pdf"  # Replace with your test image
    result = process_pdf(file_path)
    if result:
        print("Extracted Question and Answer:")
        pprint.pprint(result)