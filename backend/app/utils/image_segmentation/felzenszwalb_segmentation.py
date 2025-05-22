import numpy as np
import pandas as pd
import os
from skimage import io, segmentation, color, transform
from skimage.transform import resize
from skimage.color import rgba2rgb
import matplotlib.pyplot as plt

def reorder_segments_by_position(segments):
    """
    Reorders segment labels such that the bottom-left segment is 1,
    proceeding left to right, bottom to top.
    """
    segments = np.nan_to_num(segments, nan=-1).astype(int)
    unique_ids = np.unique(segments)
    centroids = []

    height = segments.shape[0]

    for seg_id in unique_ids:
        if seg_id < 0:
            continue  # Skip unlabeled or NaN regions
        coords = np.column_stack(np.where(segments == seg_id))
        if coords.size == 0:
            continue  # Skip empty segments
        y_mean, x_mean = coords.mean(axis=0)
        y_inverted = height - y_mean
        centroids.append((seg_id, x_mean, y_inverted))

    centroids_sorted = sorted(centroids, key=lambda x: (x[2], x[1]))
    remap_dict = {old_id: new_id + 1 for new_id, (old_id, _, _) in enumerate(centroids_sorted)}

    reordered_segments = np.copy(segments)
    for old_id, new_id in remap_dict.items():
        reordered_segments[segments == old_id] = new_id

    return reordered_segments



def find_optimal_felzenszwalb_params(input_image_path):
    """
    Determines the optimal Felzenszwalb segmentation parameters based on the input image dimensions.

    Args:
        input_image_path (str): Path to the input image.

    Returns:
        tuple: Optimal scale, sigma, and min_size parameters for Felzenszwalb segmentation.
    """
    # Load the input image
    image = io.imread(input_image_path)

    # Get the image dimensions
    height, width, _ = image.shape

    # Determine the scale parameter based on the image size
    scale = max(100, int(200 / np.sqrt(height * width)))

    # Determine the sigma parameter based on the image size
    sigma = 0.5 + 0.3 * np.log(height * width / 10000)
    if(sigma < 0):
        sigma = 0.8
    

    # Determine the min_size parameter based on the image size
    min_size = max(10, int(height * width / 10000))

    return scale, sigma, min_size


def felzenszwalb_segmentation(input_image_path, scale, sigma, min_size):
    """
    Applies Felzenszwalb segmentation on an input image, saves the segmented image with labels.

    Args:
        input_image_path (str): Path to the input image.
        scale (float): Scale parameter for segmentation.
        sigma (float): Sigma value for Gaussian smoothing.
        min_size (int): Minimum component size.

    Returns:
        tuple: Segments array and segmented image.
    """
    # Load the input image
    image = io.imread(input_image_path)

    

    if len(image.shape) == 3 and image.shape[2] == 4:
        image = rgba2rgb(image)

    if len(image.shape) == 2:
        image = np.stack((image,) * 3, axis=-1)
    

    # Perform Felzenszwalb segmentation
    segments = segmentation.felzenszwalb(image, scale=scale, sigma=sigma, min_size=min_size)
    segments = reorder_segments_by_position(segments)


    # Create the segmented image
    segmented_image = color.label2rgb(segments, image=image, kind='avg')

    # Overlay segment IDs on the segmented image
    fig, ax = plt.subplots(figsize=(10, 8))
    ax.imshow(segmented_image)

    unique_ids = np.unique(segments)
    height = segments.shape[0]

    for seg_id in unique_ids:
        coords = np.column_stack(np.where(segments == seg_id))
        y_mean, x_mean = coords.mean(axis=0)
        ax.text(x_mean, y_mean, str(seg_id), color='red', fontsize=8,
                ha='center', va='center', bbox=dict(facecolor='white', alpha=0.5, edgecolor='none'))

    ax.set_title("Segmented Image with Labels")
    ax.axis('off')

    # Save the figure instead of the raw image
    output_path = "app/static/temp_uploads/segmentedImage.png"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    plt.savefig(output_path, bbox_inches='tight', pad_inches=0)
    plt.close()

    return segments, segmented_image


def extract_segment_colors_and_areas(segments, image):
    """
    Extracts the mean color and area (pixel count) of each segment.

    Args:
        segments (ndarray): Segmentation label array.
        image (ndarray): Original image array.

    Returns:
        dict: Dictionary containing segment colors and areas mapped to their IDs.
    """
    segment_ids = np.unique(segments)
    segment_data = {}

    total_pixels = segments.size  # Total number of pixels in the image
    
    for seg_id in segment_ids:
        if seg_id < 0:  # Skip invalid segments if any
            continue

        # Create a mask for each segment
        mask = segments == seg_id
        
        # Count the number of pixels in the segment (area)
        pixel_count = np.sum(mask)
        
        # Calculate percentage of total area
        percentage_area = (pixel_count / total_pixels) * 100
        
        # Compute the mean color of the segment
        mean_color = np.mean(image[mask], axis=0)
        
        # Scale the color values to 0-255 range
        mean_color = np.clip(mean_color * 255, 0, 255).astype(int)
        
        # Store both color and area information
        segment_data[seg_id] = {
            'R': mean_color[0],
            'G': mean_color[1],
            'B': mean_color[2],
            'PixelCount': pixel_count,
            'PercentageArea': percentage_area,
        }

    return segment_data


def export_segment_data_to_csv(segment_data, output_csv_path):
    """
    Exports the segment colors and areas to a CSV file.

    Args:
        segment_data (dict): Dictionary containing segment colors and areas.
        output_csv_path (str): Path to save the CSV file.
    """
    # Convert the nested dictionary to a DataFrame
    df = pd.DataFrame.from_dict(segment_data, orient='index')
    df.index.name = 'Segment'
    
    # Reorder columns for better readability
    column_order = ['R', 'G', 'B', 'PixelCount', 'PercentageArea']
    df = df[column_order]
    
    # Export the DataFrame to CSV
    df.to_csv(output_csv_path)
    print(f"Segment data (colors and areas) have been exported to {output_csv_path}")


