import os  
import numpy as np 
import pandas as pd
from app.utils.color_map.grid_segmentation import grid_segmentation, extract_grid_segment_colors

def determine_distribution_type(min_value, max_value):
    """
    Determines the appropriate distribution type based on the input values.
    
    Args:
        min_value (float): Minimum value
        max_value (float): Maximum value
        
    Returns:
        str: Distribution type ('linear', 'log', or 'symlog')
    """
    # If either value is zero, use linear distribution to avoid log10(0) issues
    if min_value == 0 or max_value == 0:
        return 'linear'
    
    if min_value <= 0 and max_value >= 0:
        # If range crosses zero, use symlog
        return 'symlog'
    elif max_value / min_value > 100 or min_value / max_value > 100:
        # If range spans more than 2 orders of magnitude, use log
        return 'log'
    else:
        # Otherwise use linear
        return 'linear'

def generate_distributed_values(min_value, max_value, num_segments, distribution_type='linear'):
    """
    Generates distributed values based on the specified distribution type.
    
    Args:
        min_value (float): Minimum value
        max_value (float): Maximum value
        num_segments (int): Number of segments
        distribution_type (str): Type of distribution ('linear', 'log', 'symlog')
        
    Returns:
        numpy.ndarray: Array of distributed values
    """
    # Handle zero values explicitly - use linear distribution to avoid log10(0) issues
    if min_value == 0 and max_value == 0:
        # Edge case: both are zero, return all zeros
        return np.zeros(num_segments)
    elif min_value == 0 or max_value == 0:
        # One value is zero, use linear distribution
        return np.linspace(max_value, min_value, num_segments)
    
    if distribution_type == 'linear':
        return np.linspace(max_value, min_value, num_segments)
    
    elif distribution_type == 'log':
        # For log distribution, ensure all values are positive
        if min_value <= 0:
            raise ValueError("Log distribution requires all values to be positive")
        
        # Create log-spaced values
        log_values = np.logspace(np.log10(max_value), np.log10(min_value), num_segments)
        return log_values
    
    elif distribution_type == 'symlog':
        # For symlog, handle both positive and negative values
        # Note: We've already handled zero cases above, so min_value != 0 and max_value != 0 here
        if min_value > 0:
            # All positive values, use log
            return np.logspace(np.log10(max_value), np.log10(min_value), num_segments)
        elif max_value < 0:
            # All negative values, use negative log
            return -np.logspace(np.log10(abs(min_value)), np.log10(abs(max_value)), num_segments)
        else:
            # Mixed positive and negative values (but neither is zero)
            # Create symlog distribution
            pos_values = max_value
            neg_values = min_value
            
            # Calculate how many segments for positive and negative parts
            pos_ratio = abs(pos_values) / (abs(pos_values) + abs(neg_values))
            num_pos = max(1, int(num_segments * pos_ratio))
            num_neg = num_segments - num_pos
            
            if num_pos > 0 and num_neg > 0:
                # Both positive and negative segments
                pos_segments = np.logspace(np.log10(pos_values), np.log10(0.1), num_pos)
                neg_segments = -np.logspace(np.log10(0.1), np.log10(abs(neg_values)), num_neg)
                return np.concatenate([pos_segments, neg_segments])
            elif num_pos > 0:
                # Only positive segments
                return np.logspace(np.log10(pos_values), np.log10(0.1), num_segments)
            else:
                # Only negative segments
                return -np.logspace(np.log10(0.1), np.log10(abs(neg_values)), num_segments)
    
    else:
        raise ValueError(f"Unknown distribution type: {distribution_type}")

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

    # Determine the appropriate distribution type
    distribution_type = determine_distribution_type(min_value, max_value)
    
    # Generate values based on the determined distribution
    num_segments = len(df)
    try:
        df['Assigned_Value'] = generate_distributed_values(min_value, max_value, num_segments, distribution_type)
        print(f"Using {distribution_type} distribution for value assignment")
    except ValueError as e:
        print(f"Error with {distribution_type} distribution: {e}. Falling back to linear distribution.")
        df['Assigned_Value'] = np.linspace(max_value, min_value, num_segments)

    # Export the DataFrame to CSV
    df.to_csv(output_csv_path)
    print(f"Segment colors and assigned values have been exported to {output_csv_path}")