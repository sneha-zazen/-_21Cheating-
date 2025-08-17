from openai import OpenAI
import base64
import pprint
import json
import os
import pandas as pd
from pprint import pprint


client = OpenAI()

system_message = "You are a very smart and very helpful computer science and engineering study assistant. You are to extract the past paper questions and answers from each of the questions provided."

def create_user_message(row):
    return f"\Question: {row['question_text']}"


def write_jsonl(data_list: list, filename: str) -> None:
    with open(filename, "w") as out:
        for ddict in data_list:
            jout = json.dumps(ddict) + "\n"
            out.write(jout)

def prepare_example_conversation(row):
    return {
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user", "content": create_user_message(row)},
            {"role": "assistant", "content": row["correct_answer"]},
        ]
    }     

def upload_file(file_name: str, purpose: str) -> str:
    with open(file_name, "rb") as file_fd:
        response = client.files.create(file=file_fd, purpose=purpose)
    return response.id
 
def pretrain_model():
    # load database
    # db = database.get("exam_questions") #TODO actually load the database
    db = pd.read_csv(r"data\questions.csv")
    db = db.dropna(subset=["correct_answer"])
    db_size = db.shape[0]
    print("Database size:", db_size)
    training_df = db.loc[0:(db_size*0.6)]

    print(db)

    validation_df = db.loc[(db_size*0.6):]
    validation_data = validation_df.apply(
    prepare_example_conversation, axis=1).tolist()

    training_data = training_df.apply(prepare_example_conversation, axis=1).tolist()

    training_file_name = "tmp_SASSI_finetune_training.jsonl"
    write_jsonl(training_data, training_file_name)

    validation_file_name = "tmp_SASSI_finetune_validation.jsonl"
    write_jsonl(validation_data, validation_file_name)

    training_file_id = upload_file(training_file_name, "fine-tune")
    validation_file_id = upload_file(validation_file_name, "fine-tune")

    print("Training file ID:", training_file_id)
    print("Validation file ID:", validation_file_id)

    response = client.fine_tuning.jobs.create(
        training_file=training_file_id,
        validation_file=validation_file_id,
        model="gpt-4.1-mini",
        suffix="SASSI_finetune",
    )

    job_id = response.id

    print("Job ID:", response.id)
    print("Status:", response.status)

    response = client.fine_tuning.jobs.retrieve(job_id)

    print("Job ID:", response.id)
    print("Status:", response.status)
    print("Trained Tokens:", response.trained_tokens)

    return job_id

job_id = pretrain_model()
# response = client.fine_tuning.jobs.retrieve(job_id)
# fine_tuned_model_id = response.fine_tuned_model

# if fine_tuned_model_id is None:
#     raise RuntimeError(
#         "Fine-tuned model ID not found. Your job has likely not been completed yet."
#     )

# print("Fine-tuned model ID:", fine_tuned_model_id)

# job_id = "ftjob-SYQpMQT9toF7vic8bl24FV2P"
response = client.fine_tuning.jobs.retrieve(job_id)
# events = response.data
 
# while(events[-1].message != "Fine-tuning completed"):
#     events = response.data
#     print(events[-1].message)
print("Job ID:", response.id)
print("Status:", response.status)
print("Trained Tokens:", response.trained_tokens)

response = client.fine_tuning.jobs.list_events(job_id)

events = response.data
events.reverse()

for event in events:
    print(event.message)

response = client.fine_tuning.jobs.retrieve(job_id)
fine_tuned_model_id = response.fine_tuned_model
while fine_tuned_model_id is None:
    print(
        "Fine-tuned model ID not found. Your job has likely not been completed yet."
    )
    response = client.fine_tuning.jobs.retrieve(job_id)
    fine_tuned_model_id = response.fine_tuned_model
print("Fine-tuned model ID:", fine_tuned_model_id  )

