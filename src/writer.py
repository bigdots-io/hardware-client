import pika

import json
import pyrebase
import time
import os

import logging
logging.getLogger("pika").setLevel(logging.DEBUG)

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
myMatrix.brightness = 30 #display['brightness'];


connection = None
channel = None


def on_connected(connection):
    print "timed_receive: Connected to RabbitMQ"
    connection.channel(on_channel_open)


def on_channel_open(channel_):
    global channel
    channel = channel_
    print "timed_receive: Received our Channel"
    channel.queue_declare(on_queue_declareok, queue="pixelChanges")

def on_exchange_declareok(method_frame):
	print "on queue declareok"
	channel.queue_bind(on_bindok, 'pixelChanges', 'pixels')

def on_queue_declareok(method_frame):
	channel.exchange_declare(callback=on_exchange_declareok, exchange="pixels")

def on_bindok(unused_frame):
	print "on bindok"
	channel.basic_consume(callback, 'pixelChanges')


def callback(ch, method, properties, body):
	update = json.loads(body)
	(r, g, b) = hex_to_rgb(update["hex"])
	print("writing")
	myMatrix.SetPixel(int(update["x"]), int(update["y"]), r, g, b)
	channel.basic_ack(method.delivery_tag)

if __name__ == '__main__':

    # Connect to RabbitMQ
    connection = pika.SelectConnection(pika.URLParameters('amqp://localhost'), on_connected)

    # Loop until CTRL-C
    try:
        # Start our blocking loop
        connection.ioloop.start()

    except KeyboardInterrupt:

        # Close the connection
        connection.close()

        # Loop until the connection is closed
        connection.ioloop.start()
