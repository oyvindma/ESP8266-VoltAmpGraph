#include <Arduino.h>
#include <Wire.h>
#include <SDL_Arduino_INA3221.h>

SDL_Arduino_INA3221 ina3221;

// the three channels of the INA3221 named for SunAirPlus Solar Power Controller channels (www.switchdoc.com)
#define LIPO_BATTERY_CHANNEL 1
#define SOLAR_CELL_CHANNEL 2
#define OUTPUT_CHANNEL 3

#include <ESPAsyncWebServer.h>

const char *ssid = "YOUR_SSID_HERE";
const char *password = "YOUR_SSID_PASSWORD_HERE";

unsigned long previousMillis = 0;
unsigned long interval = 1000;

AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

void onWsEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len)
{

  if (type == WS_EVT_CONNECT)
  {

    Serial.println("Websocket client connection received");
    client->text("Hello from ESP32 Server");
  }
  else if (type == WS_EVT_DISCONNECT)
  {
    Serial.println("Client disconnected");
  }
}

void setup(void)
{
  Serial.begin(115200);
  // Connect Wifi
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(1000);
    Serial.println("Connecting to WiFi.." +WiFi.status());
  }

  Serial.println(WiFi.localIP());

  //Start webserver
  ws.onEvent(onWsEvent);
  server.addHandler(&ws);

  server.on("/interval", HTTP_POST, [](AsyncWebServerRequest *request) {
    int params = request->params();
    for (int i = 0; i < params; i++)
    {
      AsyncWebParameter *p = request->getParam(i);
      Serial.printf("POST[%s]: %s\n", p->name().c_str(), p->value().c_str());
      interval =  p->value().toInt();
    }
  });




  server.begin();

  //Start INA3221 I2C
  Serial.println("Measuring voltage and current with ina3221 ...");
  Wire.pins(0, 2);
  ina3221.begin();

  Serial.print("Manufactures ID=0x");
  int MID;
  MID = ina3221.getManufID();
  Serial.println(MID, HEX);
}

void loop(void)
{
   unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= interval)
  {
    char data[600];
    
    previousMillis = currentMillis;
    Serial.println("------------------------------");
    float shuntvoltage1 = 0;
    float busvoltage1 = 0;
    float current_mA1 = 0;
    float loadvoltage1 = 0;

    busvoltage1 = ina3221.getBusVoltage_V(LIPO_BATTERY_CHANNEL);
    shuntvoltage1 = ina3221.getShuntVoltage_mV(LIPO_BATTERY_CHANNEL);
    current_mA1 = -ina3221.getCurrent_mA(LIPO_BATTERY_CHANNEL); // minus is to get the "sense" right.   - means the battery is charging, + that it is discharging
    loadvoltage1 = busvoltage1 + (shuntvoltage1 / 1000);

    float shuntvoltage2 = 0;
    float busvoltage2 = 0;
    float current_mA2 = 0;
    float loadvoltage2 = 0;

    busvoltage2 = ina3221.getBusVoltage_V(SOLAR_CELL_CHANNEL);
    shuntvoltage2 = ina3221.getShuntVoltage_mV(SOLAR_CELL_CHANNEL);
    current_mA2 = -ina3221.getCurrent_mA(SOLAR_CELL_CHANNEL);
    loadvoltage2 = busvoltage2 + (shuntvoltage2 / 1000);

    float shuntvoltage3 = 0;
    float busvoltage3 = 0;
    float current_mA3 = 0;
    float loadvoltage3 = 0;

    busvoltage3 = ina3221.getBusVoltage_V(OUTPUT_CHANNEL);
    shuntvoltage3 = ina3221.getShuntVoltage_mV(OUTPUT_CHANNEL);
    current_mA3 = ina3221.getCurrent_mA(OUTPUT_CHANNEL);
    loadvoltage3 = busvoltage3 + (shuntvoltage3 / 1000);

    sprintf(data, "{ \
    \"timestamp\": \"%lu\", \
    \"ch1\": { \
        \"busvoltage\": \"%.3f\", \
        \"shuntvoltage_mV\" : \"%.1f\", \
        \"loadvoltage\" : \"%.3f\", \
        \"current_mA\" : \"%.1f\" \
    }, \
    \"ch2\": { \
        \"busvoltage\": \"%.3f\", \
        \"shuntvoltage_mV\" : \"%.1f\", \
        \"loadvoltage\" : \"%.3f\", \
        \"current_mA\" : \"%.1f\" \
    }, \
    \"ch3\": { \
        \"busvoltage\": \"%.3f\", \
        \"shuntvoltage_mV\" : \"%.1f\", \
        \"loadvoltage\" : \"%.3f\",  \
        \"current_mA\" : \"%.1f\" \
    } \
}", currentMillis, 
    busvoltage1,shuntvoltage1, loadvoltage1 ,current_mA1,  
    busvoltage2,shuntvoltage2, loadvoltage2 ,current_mA2, 
    busvoltage3,shuntvoltage3, loadvoltage3 ,current_mA3);
    //Serial.println (data);
    ws.printfAll(data);

  }



  
}

