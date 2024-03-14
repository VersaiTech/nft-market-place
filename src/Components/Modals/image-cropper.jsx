import React, { useState } from 'react';
import Modal from 'react-modal';

import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { handleFileIpfs } from '../../utils/IPFS';
import { dataURLtoFile } from '../../utils/helper';
import ButtonLoader from '../ButtonLoader';
import { toast } from 'react-toastify';

export default function ImageCropper({
  src,
  width,
  height,
  cropperModal,
  setCropperModal,
  handleSubmit,
  file,
}) {
  const appElement = document.getElementById('root');
  Modal.setAppElement(appElement);

  const [crop, setCrop] = useState({
    aspect: width / height,
    unit: '%', // Can be 'px' or '%'
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  });
  const [image, setImage] = useState(null);
  const [loader, setLoader] = useState(false);
  const [defaultLoader, setDefaultLoader] = useState(false);

  const getCroppedImg = async () => {
    if (crop.height <= 0 && crop.width <= 0) {
      toast.warning('Please select the image portion');
      return;
    }
    setLoader(true);
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const width = crop.width * scaleX;
    const height = crop.height * scaleY;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      width,
      height,
      0,
      0,
      width,
      height,
    );
    const dataUrl = canvas.toDataURL('image/png');
    const croppedFile = dataURLtoFile(dataUrl, 'cropped-image.png');
    try {
      const path = await handleFileIpfs(croppedFile);
      handleSubmit(path);
      setCropperModal(false);
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoader(false);
    }
  };

  const handleDefault = async () => {
    setDefaultLoader(true);
    try {
      const path = await handleFileIpfs(file);
      handleSubmit(path);
      setCropperModal(false);
    } catch (err) {
      console.log(err.message);
    } finally {
      setDefaultLoader(false);
    }
  };

  return (
    <Modal
      appElement={appElement}
      isOpen={cropperModal}
      onRequestClose={() => {
        setCropperModal(false);
        document.body.style.overflow = 'auto';
      }}
      style={style}
    >
      <button
        className="login-close-btn"
        onClick={() => {
          setCropperModal(false);
          document.body.style.overflow = 'auto';
        }}
      >
        <CloseButton />
      </button>
      {/* <h1
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginTop: '2rem',
        }}
      >
        Select Image
      </h1> */}
      {/* IMAGE CROPPER */}
      <div
        style={{
          width: 'auto',
          height: '580px',
          overflow: 'auto',
          objectFit: 'cover',
          margin: '40px 0 0',
          // background: 'red',
        }}
      >
        <ReactCrop
          src={src}
          crop={crop}
          onChange={(newCrop) => setCrop(newCrop)}
          onImageLoaded={setImage}
          imageStyle={{
            width: 'auto',
            height: '560px',
            objectFit: 'contain',
          }}
          aspect={1}
        />
      </div>
      <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
        <button
          className="btn btn-primary"
          onClick={getCroppedImg}
          style={{ marginTop: '10px' }}
          disabled={loader}
        >
          {loader ? <ButtonLoader /> : 'Crop Image'}
        </button>
        <button
          className="btn btn-primary"
          onClick={handleDefault}
          style={{ marginTop: '10px' }}
          disabled={defaultLoader}
        >
          {defaultLoader ? <ButtonLoader /> : 'Use Default'}
        </button>
      </div>
    </Modal>
  );
}

const CloseButton = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    className="bi bi-x"
    viewBox="0 0 16 16"
  >
    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
  </svg>
);

const style = {
  content: {
    maxWidth: '700px',
    height: '720px',
    margin: 'auto',
    textAlign: 'center',
    backgroundColor: '#ffff',
    color: '#111111',
    borderRadius: '15px',
    zIndex: '999',
  },
  overlay: {
    backgroundColor: 'rgba(30, 30, 30, 0.7)',
  },
};
