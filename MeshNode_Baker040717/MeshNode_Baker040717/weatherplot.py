import csv
import matplotlib.pyplot as plt
from time import gmtime, strftime

def readcsv(fname):
	f = open(fname, 'r')
	reader = csv.reader(f)
	lines = list(reader)
	f.close()
	return lines

data = readcsv("tempHumLog.csv")
time = []
temp = []
hum = []
i = 1
while i < len(data):
	time.append(float(data[i][0]))
	temp.append(float(data[i][1]))
	hum.append(float(data[i][2]))
	i = i + 1

plt.plot(temp, '.')
plt.xlabel("Time")
plt.ylabel("Temp *C")
plt.title("Temperature x Time")
plt.show()
plt.plot(hum, '.')
plt.xlabel("Time")
plt.ylabel("Relative Humidity")
plt.title("Relative Humidity x Time")
plt.show()
