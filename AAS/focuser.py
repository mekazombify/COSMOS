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
#import pythoncom     #needed if we use 'try' on Dispatch

#telescope = win32com.client.Dispatch("ASCOM.Celestron.Telescope")
#telescopeconnected=False
#telescopecom=r'COM5'
#cordwrapEnabled=False
#focuser = win32com.client.Dispatch("")
camera = win32com.client.Dispatch("MaxIm.CCDCamera")
cameraconnected = False

focuser_connected = False
maxim=Dispatch("MaxIm.Application")

def connectCamera():     #connects to Maxim and sbig!!!
    global cameraconnected
    global camera
    if cameraconnected == False:

    #logging.info('Connecting to camera')
        try:
            camera.LinkEnabled = True
            return True
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

def expose(exptime, objname):    ##Must run connectCamera before successful exposure
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
        filepath = 'C:\Users\Kepler452\Desktop\objname.fit'
        #filepath = "C:\Users\Kepler452\Desktop\\" +objname+ ".fit"
    	camera.SaveImage(filepath)

def connectFocuser():
    global focuser_connected
    try:
        maxim.FocuserConnected = True
        focuser_connected = True
    except:
        print "Focuser no connect"
        focuser_connected = False
    return focuser_connected

def autoFocus(exptime):
    #If focuser connected, begin the MaxIm autofocus procedure

    if focuser_connected == True:
        maxim.Autofocus(exptime)

    #sleep while autofocus is in progress
    while maxim.AutofocusStatus == -1:
        time.sleep(1)

    if maxim.AutofocusStatus == 0:
        print "focus failed"

    elif maxim.AutofocusStatus == 1:
        print "focus success"

if connectCamera():
    if connectFocuser():
        time.sleep(5)
        autoFocus(0.1)
