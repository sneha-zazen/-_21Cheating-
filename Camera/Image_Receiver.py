import time

import serial
import serial.tools.list_ports

BAUD_RATE = 115200
p = None
ports = serial.tools.list_ports.comports()
for port in ports:
    # print(port.name, port.hwid)
    # Example for a generic Bluetooth Serial Port on Windows
    if "BTHENUM" in port.hwid:
        p = port.device
        break

print("start")
while (True):
    try:
        print("Connecting...")
        ser = serial.Serial(p, BAUD_RATE, timeout=4)
        ser.write(b'1')
        # ser.flush()
        s = ser.read(500000)
        print("bytes:", len(s))
        with open("test.jpg", "wb") as f:
            f.write(s)
            f.truncate()
        f.close()
        ser.close()
    except serial.SerialException as e:
        print("FAIL - Sleeping for 3 seconds...")
        time.sleep(3)
    print("outside")
    # ser = serial.Serial('COM6', 115200, timeout=1, parity=serial.PARITY_NONE, bytesize=serial.EIGHTBITS, stopbits=serial.STOPBITS_ONE)
    # print(ser.name)


# print(s)
