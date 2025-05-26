from flask import Blueprint, request, jsonify, current_app, url_for
import os
from werkzeug.utils import secure_filename
import cv2
import numpy as np
import pandas as pd
from statistics import mode
from app.utils.file_utils import allowed_file
from app.utils.color_map.color_map_segmentation import process_color_map
from app.utils.calculate_average import calculate_average
from app.utils.image_segmentation.felzenszwalb_segmentation import (
    felzenszwalb_segmentation, extract_segment_colors_and_areas, export_segment_data_to_csv, find_optimal_felzenszwalb_params
)
from app.utils.wait_for_file import wait_for_file
from app.utils.merge_csv import merge_csv_files

api_bp = Blueprint('api', __name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, 'static')
TEMP_UPLOADS_DIR = os.path.join(STATIC_DIR, 'temp_uploads')
ASSETS_DIR = os.path.join(STATIC_DIR, 'assets')

def apply_mask_to_image(image_path, mask_path):
    """
    Applies a binary mask to an image, setting pixels outside the mask to black.
    
    Args:
        image_path (str): Path to the input image
        mask_path (str): Path to the binary mask image
        
    Returns:
        numpy.ndarray: Masked RGB image
    """
    # Read the images
    image = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)
    mask = cv2.imread(mask_path, cv2.IMREAD_GRAYSCALE)
    
    # Convert RGBA to RGB if necessary
    if image.shape[-1] == 4:
        image = cv2.cvtColor(image, cv2.COLOR_RGBA2RGB)
    
    # Apply the mask
    masked_image = image.copy()
    masked_image[mask == 0] = [0, 0, 0]
    
    return masked_image

def generate_comparison_graph(merged_csv_path, output_image_path):
    stats = {}  # Dictionary to return additional stats

    try:
        df = pd.read_csv(merged_csv_path)

        required_columns = ['Segment', 'R', 'G', 'B', 'Assigned_Value']
        if not all(col in df.columns for col in required_columns):
            return stats

        df_sorted = df.sort_values('Segment').reset_index(drop=True)

        # Basic statistics
        assigned_values = df_sorted['Assigned_Value']
        stats['num_segments'] = len(df_sorted)
        stats['max_value'] = assigned_values.max()
        stats['min_value'] = assigned_values.min()
        stats['mean'] = assigned_values.mean()
        stats['median'] = assigned_values.median()
        try:
            stats['mode'] = mode(assigned_values)
        except:
            stats['mode'] = "No unique mode"

        # Plot
        # plt.figure(figsize=(20, 12))
        # x_vals = df_sorted['Segment']
        # plt.plot(x_vals, assigned_values, color='purple', marker='o', linestyle='-', label='Assigned Value')

        # # Add mean, median, mode lines
        # plt.axhline(stats['mean'], color='black', linestyle='--', linewidth=2, label=f'Mean: {stats["mean"]:.2f}')
        # plt.axhline(stats['median'], color='orange', linestyle='--', linewidth=2, label=f'Median: {stats["median"]:.2f}')
        # if isinstance(stats['mode'], (int, float)):
        #     plt.axhline(stats['mode'], color='blue', linestyle='--', linewidth=2, label=f'Mode: {stats["mode"]:.2f}')

        # plt.title('Assigned Value per Segment', fontsize=24)
        # plt.xlabel('Segment', fontsize=24)
        # plt.ylabel('Assigned Value', fontsize=24)
        # plt.xticks(fontsize=18)
        # plt.yticks(fontsize=18)
        # plt.legend(fontsize=18)
        # plt.tight_layout()
        # plt.savefig(output_image_path)
        # plt.close()

        return stats

    except Exception as e:
        return stats


@api_bp.route('/calculate-average', methods=['POST'])
def calculate_average_route():
    try:
        if 'image' not in request.files or 'mask' not in request.files:
            return jsonify({'error': 'No image or mask file found'}), 400

        image_file = request.files['image']
        mask_file = request.files['mask']
        
        if image_file.filename == '' or mask_file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        top_value = float(request.form.get('topValue', 0))
        bottom_value = float(request.form.get('bottomValue', 0))

        if allowed_file(image_file.filename) and allowed_file(mask_file.filename):
            filename = secure_filename(image_file.filename)
            mask_filename = secure_filename(mask_file.filename)
            upload_folder = current_app.config['UPLOAD_FOLDER']
            
            # Save both files
            image_path = os.path.join(upload_folder, filename)
            mask_path = os.path.join(upload_folder, mask_filename)
            image_file.save(image_path)
            mask_file.save(mask_path)

            # Process color map
            color_map_path = os.path.join(ASSETS_DIR, 'color_map_crop.jpg')
            csv_path_for_colorMap = process_color_map(color_map_path, upload_folder, top_value, bottom_value)

            # Wait for cropped image to be generated
            cropped_image_path = os.path.join(TEMP_UPLOADS_DIR, 'cropped-image.png')
            if wait_for_file(cropped_image_path):
                # Apply mask to the image
                masked_image = apply_mask_to_image(cropped_image_path, mask_path)
                
                # Save the masked image
                masked_image_path = os.path.join(upload_folder, "masked_image.png")
                cv2.imwrite(masked_image_path, masked_image)
                
                # Get optimal parameters and perform segmentation
                scale, sigma, min_size = find_optimal_felzenszwalb_params(masked_image_path)
                segments, segmented_image = felzenszwalb_segmentation(masked_image_path, scale, sigma, min_size, mask_path=mask_path)
            else:
                return jsonify({'error': 'Cropped image not found'}), 500

            # Extract colors and areas only for segments that overlap with the mask
            mask = cv2.imread(mask_path, cv2.IMREAD_GRAYSCALE)
            segment_colors = extract_segment_colors_and_areas(segments, segmented_image, mask)
            
            csv_filename = f"{os.path.splitext(filename)[0]}_colors.csv"
            csv_path_for_image = os.path.join(upload_folder, csv_filename)
            export_segment_data_to_csv(segment_colors, csv_path_for_image)

            # Merge CSVs
            file1 = os.path.join(TEMP_UPLOADS_DIR, 'color_map_colors_with_values.csv')
            file2 = os.path.join(TEMP_UPLOADS_DIR, 'cropped-image_colors.csv')
            output_path_merged_csv = os.path.join(TEMP_UPLOADS_DIR, 'merged_file.csv')
            try:
                merged_file_path = merge_csv_files(file1, file2, output_path_merged_csv)
            except FileNotFoundError as e:
                return jsonify({'error': str(e)}), 500

            # Calculate average
            average = calculate_average(output_path_merged_csv)

            # Generate graph
            graph_output_path = os.path.join(TEMP_UPLOADS_DIR, 'comparison_graph.png')
            graph_stats = generate_comparison_graph(output_path_merged_csv, graph_output_path)

            # Prepare URLs
            segmented_image_url = url_for('static', filename='temp_uploads/segmentedImage.png')
            graph_image_url = url_for('static', filename='temp_uploads/comparison_graph.png')

            color_map_data = []
            unique_colors = {}  # Dictionary to track unique colors with their values

            # Calculate the total area for percentage calculation
            total_area = 0
            try:
                with open(output_path_merged_csv, 'r') as f:
                    # Skip header
                    next(f)
                    for line in f:
                        if line.strip():
                            values = line.strip().split(',')
                            try:
                                pixel_count = int(values[4]) if len(values) > 4 else 0
                                total_area += pixel_count
                            except (IndexError, ValueError):
                                continue
            except Exception:
                total_area = 1  # Fallback to avoid division by zero

            # Calculate the area under curve for each color
            try:
                with open(output_path_merged_csv, 'r') as f:
                    # Skip header
                    next(f)
                    for line in f:
                        if line.strip():
                            values = line.strip().split(',')
                            try:
                                r = int(values[1])
                                g = int(values[2])
                                b = int(values[3])
                                pixel_count = int(values[4]) if len(values) > 4 else 0
                                percentage_area = float(values[5]) if len(values) > 5 else (pixel_count / total_area)
                                assigned_value = float(values[6]) if len(values) > 6 else 0

                                # Calculate area under curve
                                area_under_curve = pixel_count * assigned_value
                                percentage_under_curve = (area_under_curve / (total_area * graph_stats.get('max_value', 1))) * 100

                                # Use RGB as the unique key
                                color_key = f"{r},{g},{b}"

                                # If this color is already in our dictionary, add pixel count and update values
                                if color_key in unique_colors:
                                    unique_colors[color_key]['pixelCount'] += pixel_count
                                    unique_colors[color_key]['percentageArea'] += percentage_area
                                    unique_colors[color_key]['areaUnderCurve'] += area_under_curve
                                    unique_colors[color_key]['percentageUnderCurve'] += percentage_under_curve
                                    # Keep the assigned value the same as they should be identical for same RGB
                                else:
                                    unique_colors[color_key] = {
                                        'segment': values[0],
                                        'r': r,
                                        'g': g,
                                        'b': b,
                                        'pixelCount': pixel_count,
                                        'percentageArea': percentage_area,
                                        'assignedValue': assigned_value,
                                        'areaUnderCurve': area_under_curve,
                                        'percentageUnderCurve': percentage_under_curve
                                    }
                            except (IndexError, ValueError) as e:
                                print(f"Skipping malformed line: {line.strip()}, error: {str(e)}")
                                continue
                            
                # Convert the dictionary to a list
                color_map_data = list(unique_colors.values())

                # Sort by assigned value (ascending)
                color_map_data.sort(key=lambda x: x['assignedValue'])          
    
            except Exception as e:          
                print(f"Error reading color map data: {str(e)}")
            
            return jsonify({
                'success': True,
                'average': average,
                'csvPath': csv_path_for_colorMap,
                'segmentedImageUrl': segmented_image_url,
                'graphImageUrl': graph_image_url,
                'colorMapData': color_map_data,  
                'stats': {
                    'numSegments': graph_stats.get('num_segments', None),
                    'maxAssignedValue': graph_stats.get('max_value', None),
                    'minAssignedValue': graph_stats.get('min_value', None),
                    'mean': graph_stats.get('mean', None),
                    'median': graph_stats.get('median', None),
                    'mode': graph_stats.get('mode', None),
                    'totalPixel': total_area
                }
            })          

        return jsonify({'error': 'Invalid file type'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for Electron to verify backend is running"""
    return jsonify({
        'status': 'healthy',
        'message': 'Backend is running',
        'port': request.environ.get('SERVER_PORT', '5001')
    }), 200