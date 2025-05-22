import os  
import numpy as np 
import pandas as pd
from app.utils.color_map.grid_segmentation import grid_segmentation, extract_grid_segment_colors
def process_color_map(filepath, upload_folder, top_value, bottom_value):
    # Segment the image
    segments, image = grid_segmentation(filepath)
    segment_colors = extract_grid_segment_colors(segments, image)

    # Generate CSV with top and bottom values as max and min
    csv_path = os.path.join(upload_folder, f"color_map_colors_with_values.csv")
    export_segment_colors_to_csv(segment_colors, bottom_value, top_value, csv_path)
    
    return csv_path

def export_segment_colors_to_csv(segment_colors, min_value, max_value, output_csv_path):
    # Convert the segment_colors dictionary to a pandas DataFrame
    df = pd.DataFrame.from_dict(segment_colors, orient='index', columns=['R', 'G', 'B'])
    df.index.name = 'Segment'

    # Exclude segment 0
    df = df[df.index != 0]

    # Generate values based on the range, with the max value at the top and min at the bottom
    num_segments = len(df)
    df['Assigned_Value'] = np.linspace(max_value, min_value, num_segments)

    # Export the DataFrame to CSV
    df.to_csv(output_csv_path)
    print(f"Segment colors and assigned values have been exported to {output_csv_path}")