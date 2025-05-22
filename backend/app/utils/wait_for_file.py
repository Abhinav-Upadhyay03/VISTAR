import os
import time

def wait_for_file(filepath, timeout=30, interval=1):
    """
    Waits for a file to appear at the given path.

    Args:
        filepath (str): Path to the file.
        timeout (int): Maximum time to wait in seconds.
        interval (int): Time between checks in seconds.

    Returns:
        bool: True if the file is found, False if timeout occurs.
    """
    start_time = time.time()
    while not os.path.exists(filepath):
        if time.time() - start_time > timeout:
            return False
        time.sleep(interval)
    return True