# SAss system screen code  

### Description  
This is the code that has been flashed onto the Arduino nano, it reads serial inputs 
from virtual tx and rx pins (2, 7) and outputs them onto the screen. Serial inputs 
are broken up using newline characters. You can press on the screen to scroll to the next input.  

### Components used: 
- Arduino nano  
- 2.8 TFT Touch Shield V2.0  
- ESP32-CAM for serial input  

### Library used:  
TFT_Touch_Shield_V2-master ![Link here](https://github.com/Seeed-Studio/TFT_Touch_Shield_V2/tree/master)  

### Wiring guide
![Arduino nano wiring guide](image.png)  
Use this schematic and the schematic in TFT Touch pdf file to wire screen and board  

