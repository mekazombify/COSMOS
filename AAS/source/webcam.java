import processing.core.*; 
import processing.data.*; 
import processing.event.*; 
import processing.opengl.*; 

import processing.video.*; 

import java.util.HashMap; 
import java.util.ArrayList; 
import java.io.File; 
import java.io.BufferedReader; 
import java.io.PrintWriter; 
import java.io.InputStream; 
import java.io.OutputStream; 
import java.io.IOException; 

public class webcam extends PApplet {



Capture cam;
int count = 0;

public void setup() {
  
  frameRate(1);
  String[] cameras = Capture.list();
  
  if (cameras.length == 0) {
   exit();
  }
  else {
   cam = new Capture(this, cameras[0]);
   cam.start();     
  }      
}

public void draw() {
  if (cam.available() == true) {
    cam.read();
  }
  image(cam, 0, 0);
  save("image" + count + ".png");
  println("," + count);
  count++;
  count = count % 30;
}
  public void settings() {  size(640, 480); }
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "webcam" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
