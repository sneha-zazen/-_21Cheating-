/* SAss_ts_driver */
#include <SPI.h>
#include <stdint.h>
#include <SeeedTouchScreen.h>
#include <TFTv2.h>
#include <SoftwareSerial.h>

//https://docs.arduino.cc/learn/built-in-libraries/software-serial/
#define rxPin 7
#define txPin 2

// Set up a new SoftwareSerial object
SoftwareSerial mySerial =  SoftwareSerial(rxPin, txPin);

unsigned int count = 0;
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

    Serial.begin(115200);

    // Set the baud rate for the SerialSoftware object
    // portOne.begin(115200);

    // TextOrientation orientation;
    orientation = LANDSCAPE; // text direction
    Tft.drawString("Welcome to SAss system", 20, 200, 2, WHITE, orientation);
    Tft.drawString("(Student Assistant)", 20, 180, 2, WHITE, orientation);
    // Tft.drawString("We do not condone cheating!", 20, 160, 2, WHITE, orientation); // 27, max 25?
    Tft.drawString("We DO not condone", 20, 160, 2, WHITE, orientation);
    Tft.drawString("cheating!", 20, 140, 2, WHITE, orientation);

}

void loop() {
    // read from STM camera module, decode data
    // ====== ADD CODE HERE ======
    char state = '0';

    if (mySerial.available() > 0) {
        state = mySerial.read();
    }

    if (state == '0') {
        Tft.drawString("Touch count: ", 20, 120, 2, RED, orientation);
        Tft.drawString("0", 40, 100, 2, RED, orientation);
    }
    else if (state == '1') {
        Tft.drawString("Touch count: ", 20, 120, 2, BLUE, orientation);
        Tft.drawString("0", 40, 100, 2, BLUE, orientation);
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
        // ====== THIS NEEDS TO BE CHANGED ======

        count += 1;
        count = count % 8;
        color = colors[count];
        // char countStr[16] = "Touch count: " + String(count);
        // Tft.drawString(countStr, 20, 160, 2, WHITE, orientation);

        Tft.drawString("Touch count: ", 20, 120, 2, color, orientation);
        Tft.drawString("0", 40, 100, 2, color, orientation);
        delay(150); // delay to reduce bouncing
    }

}


