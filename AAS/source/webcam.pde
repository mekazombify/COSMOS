import processing.video.*;

Capture cam;
int count = 0;

void setup() {
  size(640, 480);
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

void draw() {
  if (cam.available() == true) {
    cam.read();
  }
  image(cam, 0, 0);
  save("image" + count + ".png");
  println("," + count);
  count++;
  count = count % 30;
}