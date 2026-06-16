import cv2
import numpy as np

img = cv2.imread(r"C:\Users\us\.gemini\antigravity\brain\543f93fd-525a-41d1-ab2b-103cee3c5a95\media__1781608021848.jpg")
if img is not None:
    # get center of image
    h, w = img.shape[:2]
    center_img = img[int(h*0.7):int(h*0.9), int(w*0.4):int(w*0.6)]
    avg_color_per_row = np.average(center_img, axis=0)
    avg_color = np.average(avg_color_per_row, axis=0)
    print("Center BGR:", avg_color)
else:
    print("Could not read image.")
