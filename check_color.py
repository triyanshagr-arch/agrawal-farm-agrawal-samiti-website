import cv2
import numpy as np

img = cv2.imread(r"C:\Users\us\.gemini\antigravity\brain\543f93fd-525a-41d1-ab2b-103cee3c5a95\media__1781608021848.jpg")
if img is not None:
    avg_color_per_row = np.average(img, axis=0)
    avg_color = np.average(avg_color_per_row, axis=0)
    print("Average BGR:", avg_color)
else:
    print("Could not read image.")
