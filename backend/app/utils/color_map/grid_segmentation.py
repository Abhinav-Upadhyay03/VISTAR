import numpy as np  
from skimage import io 
from skimage.transform import resize
from skimage.color import rgba2rgb

def grid_segmentation(input_image_path, num_rows=35, num_cols=1):
    image = io.imread(input_image_path)
    
    # Convert RGBA to RGB if necessary
    if image.ndim == 3 and image.shape[2] == 4:
        image = rgba2rgb(image)
    
    image = resize(image, (512, 512))  # Resize to 512x512

    img_height, img_width, _ = image.shape
    grid_height = img_height // num_rows
    grid_width = img_width // num_cols

    segments = np.zeros((img_height, img_width), dtype=int)

    segment_id = 0
    for row in range(num_rows):
        for col in range(num_cols):
            segments[row * grid_height:(row + 1) * grid_height,
                     col * grid_width:(col + 1) * grid_width] = segment_id
            segment_id += 1

    return segments, image

def extract_grid_segment_colors(segments, image):
    segment_ids = np.unique(segments)
    segment_colors = {}

    for seg_id in segment_ids:
        mask = segments == seg_id
        mean_color = np.mean(image[mask], axis=0)
        mean_color = np.clip(mean_color * 255, 0, 255).astype(int)
        segment_colors[seg_id] = mean_color

    return segment_colors