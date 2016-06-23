import pika

import json
import pyrebase
import time
import os

from rgbmatrix import RGBMatrix

config = {
	"apiKey": "AIzaSyANob4DbCBvpUU1PJjq6p77qpTwsMrcJfI",
	"authDomain": "led-fiesta.firebaseapp.com",
	"databaseURL": "https://led-fiesta.firebaseio.com",
	"storageBucket": "led-fiesta.appspot.com",
	"serviceAccount": "",
}
firebase = pyrebase.initialize_app(config)
db = firebase.database()

def hex_to_rgb(value):
    value = value.lstrip('#')
    lv = len(value)
    return tuple(int(value[i:i + lv // 3], 16) for i in range(0, lv, lv // 3))


myMatrix = RGBMatrix(16, 3, 1)
myMatrix.brightness = 10


for y in range(0, 15): 
	for x in range(0, 95):
		myMatrix.SetPixel(x, y, 255, 255, 255)

