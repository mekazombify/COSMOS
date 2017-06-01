import subprocess,shlex
from array import *
import time
import win32com.client                 #Needed for telescope
from win32com.client import Dispatch   #Needed to Dispatch MaximDL and to use camera
import signal
import _winreg
from datetime import datetime
import pywintypes
import math
import msvcrt
import os
import sys
import json

camera = win32com.client.Dispatch("MaxIm.CCDCamera")
cameraconnected = False

def UTCDate():
    now = datetime.utcnow().strftime("%Y%m%d")
    return now
def UTCDateAndTime():    ##returns year, month, day, hour:minutes:seconds
    now = datetime.utcnow().strftime("%Y%m%d %H:%M:%S")
    return now
def log(telescopeevent):
    #add destination folder
    name = UTCDate() + '.txt'
    file = open(name, 'a')  # 'a' opens the file for appending
    file.write(str(UTCDateAndTime()))
    file.write(telescopeevent+"\n")
    file.close()

def longpause():
    time.sleep(2)
def shortpause():
    time.sleep(1)


def connectCamera():     #connects to Maxim and sbig!!!
    global cameraconnected
    global camera
    if cameraconnected == False:

    #logging.info('Connecting to camera')
        try:
            camera.LinkEnabled = True
        except:
            print "Unable to connect camera"
            return False

        if camera.LinkEnabled == False:
            print ('Failed to connect to camera')
        else:
            cameraconnected = True
            print ('connected to camera')

    #logging.info('Preventing the camera from disconnecting when we exit')
        camera.DisableAutoShutdown = True

    #logging.info('Preventing maxim from closing upon exit')
        maxim = Dispatch("MaxIm.Application")
        maxim.LockApp = True

    else:
        return cameraconnected




def expose(exptime, objname, save):    ##Must run connectCamera before successful exposure
    global camera
    exptypes = {
        'Dark' : 0,
        'Bias' : 0,
        'SkyFlat' : 1,
        }
    if objname in exptypes.keys():
        exptype = exptypes[objname]
    else:
    	exptype = 1 # science exposure
    #while not camera.ImageReady:
    #    time.sleep(0.1)
    camera.Expose(exptime, exptype)
    #while loop; while camera.ImageReady==False
    while camera.ImageReady == False:
    	time.sleep(1)
    else:
    	print camera.ImageReady
        if(save == "true"):
            filepath = 'C:\\Users\\Frank\\Desktop\\AAS\\' + objname + '.fit'
            camera.SaveImage(filepath)
        pixels = camera.ImageArray
        current = open('new.json', 'w+')
        for pixel in pixels:
            if pixel > 65535:
                pixel = 65535
        current.write("{\n\t\"image\" : ")
        json.dump(pixels, current)
        current.write("\n}")
        current.close()
        os.remove("current.json")
        os.rename("new.json", "current.json")
connectCamera()
expose(sys.argv[2], sys.argv[1], sys.argv[3])
