import React, { useCallback, useState } from 'react';

function rotateImage(imageBase64, rotation, originalFormat, cb) {
  const img = new Image();
  img.src = imageBase64;
  img.onload = () => {
    const canvas = document.createElement('canvas');
    let newWidth, newHeight;

    if ([90, 270].includes(rotation)) {
      newWidth = img.height;
      newHeight = img.width;
    } else {
      newWidth = img.width;
      newHeight = img.height;
    }

    canvas.width = newWidth;
    canvas.height = newHeight;

    const ctx = canvas.getContext('2d');
    ctx.translate(newWidth / 2, newHeight / 2);
    ctx.rotate(rotation * (Math.PI / 180));
    ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);

    // Convert the rotated image back to the original format
    const rotatedImageBase64 = canvas.toDataURL(originalFormat);

    cb(rotatedImageBase64);
  };
}

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

function dataURLtoBlob(dataUrl) {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

function App() {
  const [photo, setPhoto] = useState<File | null>(null);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e?.target.files?.[0];
    if (file) setPhoto(file);
  }, []);

  const handleRotate = useCallback(async () => {
    if (!photo) return;

    try {
      const base64Photo = await getBase64(photo);

      // Record the original format before rotation
      const originalFormat = base64Photo.split(';')[0].split(':')[1];

      rotateImage(base64Photo, 90, originalFormat, (rotatedDataUrl) => {
        const blob = dataURLtoBlob(rotatedDataUrl);
        const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
        setPhoto(file);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
    }
  }, [photo]);

  return (
    <div
      style={{
        backgroundColor: 'burlywood',
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: '4rem',
      }}
    >
      <input
        type="file"
        // upload a single photo
        accept="image/*"
        onChange={onInputChange}
      />
      <br />
      <button onClick={handleRotate}>Rotate</button>
      <br />
      {photo ? (
        <>
          <img src={photo ? URL.createObjectURL(photo) : ''} alt="" width="300px" />
          <br />
          <a href={URL.createObjectURL(photo)} download>
            Download
          </a>
        </>
      ) : (
        <></>
      )}
    </div>
  );
}

export default App;
