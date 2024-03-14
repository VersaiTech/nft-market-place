import React, { useState, useRef } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const Test = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [crop, setCrop] = useState({ aspect: 1 });
  const imageRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedImage(URL.createObjectURL(file));
  };

  const handleCropComplete = (cropResult) => {
    console.log({ isLoaded });
    if (isLoaded) {
      const imageElement = imageRef.current;
      const canvas = document.createElement('canvas');
      const scaleX = imageElement.naturalWidth / imageElement.width;
      const scaleY = imageElement.naturalHeight / imageElement.height;
      const width = cropResult.width * scaleX;
      const height = cropResult.height * scaleY;

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        imageElement,
        cropResult.x * scaleX,
        cropResult.y * scaleY,
        width,
        height,
        0,
        0,
        width,
        height,
      );

      const dataUrl = canvas.toDataURL('image/png');
      const croppedFile = dataURLtoFile(dataUrl, 'cropped-image.png');
      console.log('Cropped image file:', croppedFile);
    }
  };

  // Helper function to convert data URL to File object
  const dataURLtoFile = (dataUrl, filename) => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  };

  const [isLoaded, setIsLoaded] = useState(false);
  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', color: 'black' }}>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <div style={{ height: '100%', background: 'red' }}>
        {selectedImage && (
          <ReactCrop
            src={selectedImage}
            crop={crop}
            onChange={(newCrop) => setCrop(newCrop)}
            // onComplete={handleCropComplete}
            imageStyle={{ maxWidth: '100%' }}
          />
        )}
        {selectedImage && <img src={selectedImage} alt="Selected" />}
      </div>
    </div>
  );
};

export default Test;
