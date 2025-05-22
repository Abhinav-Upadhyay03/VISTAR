import pandas as pd
import os
from app.utils.wait_for_file import wait_for_file

def calculate_average(merged_file_path, timeout=30):
    """
    Waits for the merged CSV file to be present and calculates the weighted average of the 
    'Assigned_Value' column based on the 'PercentageArea', combining duplicate color values.

    Args:
        merged_file_path (str): Path to the merged CSV file.
        timeout (int): Maximum time to wait for the file, in seconds.

    Returns:
        float: The calculated weighted average of the 'Assigned_Value' column.

    Raises:
        FileNotFoundError: If the file is not found within the timeout period.
        ValueError: If the file doesn't contain valid data or required columns are missing.
    """
    # Wait for the file to be present
    if not wait_for_file(merged_file_path, timeout=timeout):
        raise FileNotFoundError(f"File not found after waiting: {merged_file_path}")

    # Load the merged CSV file
    df = pd.read_csv(merged_file_path)

    # Ensure required columns exist
    required_columns = ['R', 'G', 'B', 'PercentageArea', 'Assigned_Value']
    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        raise ValueError(f"Required columns missing in the file: {missing_columns}")

    # Create a color identifier by combining RGB values
    df['Color_ID'] = df['R'].astype(str) + '_' + df['G'].astype(str) + '_' + df['B'].astype(str)

    # Group by unique colors and sum their areas
    color_groups = df.groupby('Color_ID').agg({
        'PercentageArea': 'sum',
        'Assigned_Value': 'first'  # Take the first assigned value for each unique color
    }).reset_index()

    # Calculate weighted average
    total_weighted_value = (color_groups['Assigned_Value'] * color_groups['PercentageArea']).sum()
    total_area = color_groups['PercentageArea'].sum()

    if total_area == 0:
        raise ValueError("Total area is zero, cannot calculate weighted average.")

    return total_weighted_value / total_area