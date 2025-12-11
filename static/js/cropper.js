/**
 * Image cropping functionality for the file manager
 * Uses CropperJS library
 */

// Store the cropper instance
let cropper = null;

// Function to open the crop modal and initialize cropper
function openCrop(imageSrc, imagePath) {
    const modal = document.getElementById('cropModal');
    const cropImage = document.getElementById('cropImage');
    const imagePathInput = document.getElementById('imagePath');
    
    // Set the image source and path
    cropImage.src = imageSrc;
    imagePathInput.value = imagePath;
    
    // Show the modal using Bootstrap
    const cropModal = new bootstrap.Modal(modal);
    cropModal.show();
    
    // Initialize CropperJS once the image is loaded
    cropImage.addEventListener('load', function() {
        if (cropper) {
            cropper.destroy(); // Remove existing instance
        }
        
        // Create new cropper instance
        cropper = new Cropper(cropImage, {
            aspectRatio: NaN, // Free aspect ratio
            viewMode: 1, // Restrict the crop box to not exceed the size of the canvas
            guides: true, // Show the grid lines within the crop box
            center: true, // Show the center indicator within the crop box
            highlight: true, // Show the white modal to highlight the crop box
            background: true, // Show the grid background
            autoCropArea: 0.8, // The initial crop area should be 80% of the image
            responsive: true, // Re-render the cropper when the window resizes
            cropBoxResizable: true, // Allow the crop box to be resized
            cropBoxMovable: true, // Allow the crop box to be moved
        });
    });
}

// Function to close the modal and destroy the cropper
function closeCrop() {
    const modal = document.getElementById('cropModal');
    const cropModal = bootstrap.Modal.getInstance(modal);
    cropModal.hide();
    
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
}

// Function to get the cropped image as a data URL
function getCroppedImageData() {
    if (!cropper) {
        return null;
    }
    
    // Get the cropped canvas
    const canvas = cropper.getCroppedCanvas({
        width: 800, // Maximum width
        height: 800, // Maximum height
        fillColor: '#fff', // Fill transparent areas with white
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
    });
    
    // Convert to data URL
    return canvas.toDataURL('image/png');
}

// Function to save the cropped image
function saveCroppedImage() {
    if (!cropper) {
        console.error('Cropper not initialized');
        return;
    }
    
    const imagePath = document.getElementById('imagePath').value;
    const imageData = getCroppedImageData();
    
    if (!imageData) {
        console.error('Could not get cropped image data');
        return;
    }
    
    // Send the cropped image to the server
    fetch('/crop', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            image_path: imagePath,
            image_data: imageData
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show success message
            alert('Image cropped and saved successfully!');
            
            // Reload the page to show the updated image
            window.location.reload();
        } else {
            // Show error message
            console.error('Error saving cropped image:', data.error);
            alert('Error saving cropped image: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error saving cropped image. See console for details.');
    });
    
    // Close the crop modal
    closeCrop();
}

// Initialize event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Handle the crop button click
    const cropButton = document.getElementById('cropButton');
    if (cropButton) {
        cropButton.addEventListener('click', saveCroppedImage);
    }
    
    // Handle modal close button
    const closeButtons = document.querySelectorAll('[data-bs-dismiss="modal"]');
    closeButtons.forEach(button => {
        button.addEventListener('click', closeCrop);
    });
});
