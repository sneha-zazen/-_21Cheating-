from openai import OpenAI
import base64
import pprint
import json

client = OpenAI()
fine_tuned_model_id = "ft:gpt-4o-mini-2024-07-18:personal:recipe-ner:C5MzTgKB"   # TODO replace with the fine-tuned model ID

PROMPT = """There is an attached image of an exam question with an answer circled. Your job 
is to extract what the question is and what the user has answerd and what the answer should be. For example, if the image 
has a question "What is the capital of France?" with option "A) Paris", "B) London", "C) Berlin" 
and the user has circled "A", you should return as a strictly formatted JSON object:
[
{
    "question_number": 1,
    "question": "What is the capital of France?",
    "response": "Paris",
    "correct_answer": "Paris"
}
]

with no other text or formatting. If the image does not contain a question or answer, return an empty list.
It is important that you do not include the letters A, B, C, etc. in the answer, only the actual answer text.
If the image contains multiple questions, return a list of question-response-answer objects. If the image contains a
question but no answer, return the question with an empty answer field:
[
{
    "question_number": 1,
    "question": "What is the capital of France?",
    "response": "",
    "correct_answer": "Paris"
}

ONLY return the list of JSON object, do not include any other text or formatting. Be 
sure to include any extra information that is relevant to the question, such as 
whatever examples are given or any additional context that is provided in the image
as part of the question. WHen you choose your answer it must be one of the options 
given in the image, do not make up your own answer.
"""

def process_paper(file_obj):
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
    file_obj.name = "exam_paper.pdf"  # Ensure the file has a name for the API
    print("asdf", file_obj.name)
    
    uploaded_file = client.files.create(
        file=file_obj,
        purpose="assistants"
    )
    
    print("aosdjflasfkj;ldsahfashkjldfhklh")
    print(uploaded_file)  # Inspect the full object
    print("Uploaded file ID:", uploaded_file.id)

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



def process_image(image_file):
    """
    Process an image file to extract question and answer. If the image contains one or more questions with an answer, 
    it returns a dictionary object with fields "question" and "response". If the image does not contain a question or answer,
    it returns None. If the image contains a question but no answer, it returns the question with an empty response.

    e.g.

    Image contains question with circled answer:
    [
        {
            "question": "What is the capital of France?",
            "response": "Paris"
        }   
    ]


    Image contains question but no circled answer:
    [
        {
            "question": "What is the capital of France?",
            "response": ""
        }
    ]

    Parameters:
    - file_path (str): The path to the image file.

    Returns:
    - dict: A dictionary containing the question and answer extracted from the image.
    """
    image_file.seek(0)
    image_bytes = image_file.read()
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")  
    
    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        # model=fine_tuned_model_id,
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": PROMPT},
                    {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image_b64}"}},
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
        
def get_hint(question, response, correct_answer):
    prompt = f"""
    You are an AI assistant that provides hints for exam questions. Given a
    question, the user's response, and the correct answer, provide a hint that
    helps the user understand the correct answer without giving it away directly.
    Question: {question}
    User's Response: {response}
    Correct Answer: {correct_answer}
    
    Provide a hint that is relevant to the question and helps the user arrive at
    the correct answer. The hint should not be too obvious, but should guide the
    user towards the correct answer. The hint should be concise and clear.
    Your output should be a single sentence hint with no additional text
    or formatting.
    """
    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt}
                ],
            }
        ],
    )
    hint = response.choices[0].message.content.strip()
    return hint


if __name__ == "__main__":
    file_path = "images/Engg1300/2520555.pdf"  # Replace with your test image
    result = process_pdf(file_path)
    if result:
        print("Extracted Question and Answer:")
        pprint.pprint(result)