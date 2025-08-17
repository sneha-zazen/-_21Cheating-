/* SAss_ts_driver */
#include <SPI.h>
#include <stdint.h>
#include <SeeedTouchScreen.h>
#include <TFTv2.h>
#include <SoftwareSerial.h>

//https://docs.arduino.cc/learn/built-in-libraries/software-serial/
#define rxPin 7
#define txPin 2

#define LIST_SIZE 30
#define CHAR_LIMIT 25

// Set up a new SoftwareSerial object
SoftwareSerial mySerial =  SoftwareSerial(rxPin, txPin);

unsigned int count = 0;
unsigned int hintCount = 0;
TouchScreen ts = TouchScreen(XP, YP, XM, YM); //init TouchScreen port pins
TextOrientation orientation;
int color = WHITE;  //Paint brush color
unsigned int colors[8] = {BLACK, RED, GREEN, BLUE, CYAN, YELLOW, WHITE, GRAY1};

void setup() {
    TFT_BL_ON;      // turn on the background light
    Tft.TFTinit();  // init TFT library

    // Define pin modes for TX and RX
    pinMode(rxPin, INPUT);
    pinMode(txPin, OUTPUT);

    Serial.begin(9600);

    mySerial.begin(9600);


    Serial.println("Start programme");
    // Set the baud rate for the SerialSoftware object
    // portOne.begin(115200);

    // TextOrientation orientation;
    orientation = LANDSCAPE; // text direction
    Tft.drawString("Welcome to SAss system", 20, 200, 2, WHITE, orientation);
    Tft.drawString("(Student Assistant)", 20, 180, 2, WHITE, orientation);
    // Tft.drawString("We do not condone cheating!", 20, 160, 2, WHITE, orientation); // 27, max 25?
    Tft.drawString("We DO not condone", 20, 160, 2, WHITE, orientation);
    Tft.drawString("cheating!", 20, 140, 2, WHITE, orientation);
    Tft.drawString("PRESS SCREEN", 20, 120, 2, WHITE, orientation);

}

String sendMessage;
String receivedMessage;
String hintsList[LIST_SIZE];


void loop() {
    // read from STM camera module, decode data
    char input;

    if (mySerial.available() > 0) {
        input = mySerial.read();
        // Serial.println(input);
        if (input == '\n') {
            // print out msg and clear
            Serial.println(sendMessage);
            hintsList[hintCount] = sendMessage;
            hintCount += 1;
            sendMessage = "";
        } else {
            sendMessage += input;
        }

        if (hintCount == LIST_SIZE) {
            Serial.println("Full");
            for (int i = 0; i < LIST_SIZE; i++) {
                // Serial.println(char(i));
                Serial.print(hintsList[i]);
            }
            hintCount = 0;
        }
    }

    // checking for a touch screen press
    // a point object holds x y and z coordinates.
    Point p = ts.getPoint();

    //map the ADC value read to into pixel co-ordinates
    p.x = map(p.x, TS_MINX, TS_MAXX, 0, 240);
    p.y = map(p.y, TS_MINY, TS_MAXY, 0, 320);

    // we have some minimum pressure we consider 'valid'
    // pressure of 0 means no pressing!
    if (p.z > __PRESURE) {
        // when screen is touched, scroll to next hint

        // colour cycling for debugging
        // count = count % 8;
        // color = colors[count];

        // clear screen
        Tft.fillScreen(0, 250, 0, 350, BLACK);

        for (int i = 0; i < (hintsList[count].length() / CHAR_LIMIT) + 1; i++) {
            // last loop
            if (i == (hintsList[count].length() / CHAR_LIMIT)) {
                Tft.drawString(hintsList[count].substring(i*CHAR_LIMIT, hintsList[count].length()).c_str(), 10, 200-(i*20), 2, color, orientation);
            } else {
                Tft.drawString(hintsList[count].substring(i*CHAR_LIMIT, (i+1)*CHAR_LIMIT).c_str(), 10, 200-(i*20), 2, color, orientation);
            }
        }

        count += 1;
        count = count % 30;

        delay(150); // delay to reduce bouncing
    }

}


