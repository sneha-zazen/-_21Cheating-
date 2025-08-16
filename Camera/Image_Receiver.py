import time

import serial
import serial.tools.list_ports

import requests

import base64

url = "http://10.89.249.11:5000/process_image"

# Example values

BAUD_RATE = 115200
p = None
ports = serial.tools.list_ports.comports()
for port in ports:
    # print(port.name, port.hwid)
    # Example for a generic Bluetooth Serial Port on Windows
    # if "BTHENUM" in port.hwid:
    #     p = port.device
    #     break
    print("Port:", port.name, "Description:", port.description)
    if "Bluetooth-serial" in port.description:
        p = port.device
        print("Found Bluetooth Serial Port:", p)
        break

print("start")
while (True):
    success = False
    try:
        print("Connecting...")
        ser = serial.Serial(p, BAUD_RATE, timeout=5)
        ser.write(b'1')
        ser.flush()
        s = ser.read(200000)
        # print("bytes:", len(s))
        with open("test2.jpg", "wb") as f:
            f.write(s)
            f.truncate()
        f.close()
        ser.close()
        success = True
        print("bytes:", len(s))
    except serial.SerialException as e:
        success = False
        print("FAIL - Sleeping for 3 seconds...")
        time.sleep(3)
    if success:
        session_id = "1"
        image_path = "test2.jpg"

        with open(image_path, "rb") as f:
            image_b64 = base64.b64encode(f.read()).decode("utf-8")

        payload = {
            "session_id": session_id,
            "image": image_b64
        }

        response = requests.post(url, json=payload)
        print(response.status_code)
        print(response.json())

    # print("outside")
    # ser = serial.Serial('COM6', 115200, timeout=1, parity=serial.PARITY_NONE, bytesize=serial.EIGHTBITS, stopbits=serial.STOPBITS_ONE)
    # print(ser.name)


# print(s)
