import pandas as pd
import numpy as np
from skimage.color import rgb2lab
import os
from app.utils.wait_for_file import wait_for_file

def merge_csv_files(file1, file2, output_path, k=3, use_inverse_distance=True):
    """
    Merges two CSV files by performing LAB color space matching with improved interpolation.

    Args:
        file1 (str): Path to the first CSV file containing reference colors with assigned values.
        file2 (str): Path to the second CSV file containing colors that need values assigned.
        output_path (str): Path to save the merged CSV file.
        k (int): Number of nearest neighbors to use for interpolation (default: 3).
        use_inverse_distance (bool): Whether to use inverse distance weighting (default: True).

    Returns:
        str: Path to the merged CSV file.
    """
    # Wait for the required files
    if not wait_for_file(file1) or not wait_for_file(file2):
        raise FileNotFoundError(f"Required files not found: {file1}, {file2}")
    
    # Load the CSV files
    df1 = pd.read_csv(file1)  # Reference colors with assigned values
    df2 = pd.read_csv(file2)  # Colors that need values assigned

    # Convert RGB to LAB color space
    df1_lab = rgb2lab(df1[['R', 'G', 'B']].values.reshape(-1, 1, 3) / 255.0).reshape(-1, 3)
    df2_lab = rgb2lab(df2[['R', 'G', 'B']].values.reshape(-1, 1, 3) / 255.0).reshape(-1, 3)

    # Add LAB columns
    df1[['L', 'A', 'B_val']] = df1_lab
    df2[['L', 'A', 'B_val']] = df2_lab

    # Merge based on RGB values to find exact matches
    merged_df = pd.merge(df2, df1[['R', 'G', 'B', 'Assigned_Value']], on=['R', 'G', 'B'], how='left')

    def interpolate_lab_value(row):
        if pd.isna(row['Assigned_Value']):  # No exact RGB match
            # Calculate distances to each LAB color in reference dataset
            distances = np.sqrt((df1['L'] - row['L']) ** 2 +
                               (df1['A'] - row['A']) ** 2 +
                               (df1['B_val'] - row['B_val']) ** 2)
            
            # Find k nearest neighbors
            k_neighbors = min(k, len(df1))
            nearest_indices = np.argsort(distances)[:k_neighbors]
            nearest_distances = distances[nearest_indices]
            nearest_values = df1.iloc[nearest_indices]['Assigned_Value'].values
            
            # Handle the case where some distances are zero
            zero_distances = nearest_distances == 0
            if np.any(zero_distances):
                # If we have exact LAB matches (but different RGB), use their mean
                return np.mean(nearest_values[zero_distances])
            
            if use_inverse_distance:
                # Inverse distance weighting
                weights = 1.0 / nearest_distances
                # Normalize weights to sum to 1
                weights = weights / np.sum(weights)
                # Calculate weighted average
                interpolated_value = np.sum(weights * nearest_values)
            else:
                # Simple average
                interpolated_value = np.mean(nearest_values)
                
            return interpolated_value

        return row['Assigned_Value']  # Return existing value if exact match found

    # Apply interpolation to fill missing values
    merged_df['Assigned_Value'] = merged_df.apply(interpolate_lab_value, axis=1)

    # Drop the LAB columns before saving
    merged_df = merged_df.drop(columns=['L', 'A', 'B_val'])

    # Ensure the output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Save the merged CSV file
    merged_df.to_csv(output_path, index=False)

    return output_path