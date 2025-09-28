import face_recognition
import numpy as np
from PIL import Image
import io

def get_face_encoding(image_file):
    """
    Takes an image file stream and returns the face encoding.
    Returns None if no face is found or more than one face is found.
    """
    try:
        # Read the image file
        image = Image.open(image_file.stream)
        
        # Convert image to RGB (face_recognition requirement)
        image = image.convert('RGB')
        
        # Convert PIL image to numpy array
        np_image = np.array(image)
        
        # Find face locations
        face_locations = face_recognition.face_locations(np_image)
        
        # Ensure exactly one face is detected
        if len(face_locations) != 1:
            return None
            
        # Get the face encoding
        face_encodings = face_recognition.face_encodings(np_image, face_locations)
        
        return face_encodings[0].tolist() # Convert numpy array to list for MongoDB
    except Exception as e:
        print(f"Error getting face encoding: {e}")
        return None

def match_face(known_encodings, unknown_image_stream):
    """
    Takes a list of known face encodings and an unknown image stream.
    Returns the index of the matched face or None if no match.
    """
    try:
        # Load the unknown image
        unknown_image = face_recognition.load_image_file(unknown_image_stream)
        
        # Find faces in the unknown image
        unknown_face_locations = face_recognition.face_locations(unknown_image)
        if not unknown_face_locations:
            return None # No faces found in the image

        # Get encodings for faces in the unknown image
        unknown_face_encodings = face_recognition.face_encodings(unknown_image, unknown_face_locations)

        # Convert list of lists back to numpy arrays for comparison
        known_np_encodings = [np.array(enc) for enc in known_encodings]
        
        # Iterate through each face found in the unknown image
        for unknown_encoding in unknown_face_encodings:
            matches = face_recognition.compare_faces(known_np_encodings, unknown_encoding, tolerance=0.6)
            
            # Check if there is a match
            if True in matches:
                first_match_index = matches.index(True)
                return first_match_index
        
        return None
    except Exception as e:
        print(f"Error matching face: {e}")
        return None