import React from "react";
import { useEffect, useState } from "react";
// import fs from 'fs';
// import jsPDF from 'jspdf';
import Dynamsoft from "dwt";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import * as PDFLib from "pdf-lib";

function Right(props) {
  const {
    // sources,
    productKey,
    // selectedSource,
    showUI,
    autoFeeder,
    pixelType,
    resolution,
    onSourceChange,
    onShowUIChange,
    onAutoFeederChange,
    onPixelTypeChange,
    onResolutionChange,
    // onScanAndSave1,
    // onScanAndSave2,
    // onRemoveBlankImages,
    // onRemoveAllImages,
  } = props;

  // const [scannedImages, setScannedImages] = useState([]);
  const [scanners, setScanners] = useState([]);
  const [currentScanner, setCurrentScanner] = useState("Looking for devices..");
  const [DWObject, setDWObject] = useState(null);
  const containerId = "dwtcontrolContainer";
  const width = "100%";
  const height = "600";

  useEffect(() => {
    if (typeof Dynamsoft.DWT === "undefined") {
      return;
    }
    Dynamsoft.DWT.RegisterEvent("OnWebTwainReady", () => {
      const dwObject = Dynamsoft.DWT.GetWebTwain(containerId);
      if (dwObject) {
        const vCount = dwObject.SourceCount;
        const sourceNames = [];
        for (let i = 0; i < vCount; i++) {
          sourceNames.push(dwObject.GetSourceNameItems(i));
        }
        setScanners(sourceNames);
        setDWObject(dwObject);
      }
    });
    loadDWT();
  }, []);

  const loadDWT = () => {
    Dynamsoft.DWT.ProductKey = productKey;
    Dynamsoft.DWT.ResourcesPath = "dwt-resources";
    Dynamsoft.DWT.Containers = [
      { ContainerId: containerId, Width: width, Height: height },
    ];
    const checkScriptLoaded = () => {
      if (Dynamsoft.Lib.detect.scriptLoaded) {
        Dynamsoft.DWT.Load();
      } else {
        setTimeout(() => {
          checkScriptLoaded();
        }, 1000);
      }
    };
    checkScriptLoaded();
  };

  const setErrorMessage = (errorMessage) => {
    //  error message state
  };

  async function acquireImage() {
    return new Promise((resolve, reject) => {
      DWObject.SelectSource(
        function () {
          DWObject.OpenSource();
          DWObject.IfDisableSourceAfterAcquire = true;
          DWObject.AcquireImage({
            OnSuccess: async () => {
              const numImages = DWObject.HowManyImagesInBuffer;
              if (numImages > 0) {
                const pdfDoc = await PDFLib.PDFDocument.create();
                for (let i = 0; i < numImages; i++) {
                  const image = DWObject.GetImage(i);
                  const newPage = pdfDoc.addPage([image.width, image.height]);
                  newPage.drawImage(image, {
                    x: 0,
                    y: 0,
                    width: image.width,
                    height: image.height,
                  });
                }
                const pdfBytes = await pdfDoc.save();
                DWObject.SaveBufferAsPDF(
                  "Dynamsoft Scanned Documents.pdf",
                  pdfBytes,
                  (isSuccessful, errorString) => {
                    if (isSuccessful) {
                      resolve();
                    } else {
                      reject(`Error saving PDF: ${errorString}`);
                    }
                  }
                );
              } else {
                reject("No images were scanned.");
              }
            },
            OnFailure: (errorCode, errorString) => {
              reject(`Error: ${errorCode} - ${errorString}`);
            },
          });
        },
        function (errorCode, errorString) {
          reject(`Error selecting source: ${errorCode} - ${errorString}`);
        }
      );
    });
  }

  const ScanAndSave2 = async () => {
    if (!DWObject) {
      return alert("Please select a scanner first.");
    }
    await DWObject.SelectSourceAsync();
    await DWObject.OpenSourceAsync();
    const saveFolder = "D:\\temp\\";
    let i = 1;
    while (true) {
      const image = await DWObject.AcquireImageAsync();
      if (!image) {
        break; // if no more images
      }
      const filename = `${saveFolder}Image_${i}.pdf`;

      // converting image to PDF
      const pdfDoc = await PDFLib.PDFDocument.create();
      const page = pdfDoc.addPage([image.width, image.height]);
      const imageBytes = image.getData();
      const imageEmbed = await pdfDoc.embedPng(imageBytes);
      page.drawImage(imageEmbed, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });
      const pdfBytes = await pdfDoc.save();
      // to save PDF to disk
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      i++;
    }
  };

  const RemoveBlankImages = ({ DWObject }) => {
    const handleClick = () => {
      // Get all the images in the viewer
      const images = DWObject.HowManyImagesInBuffer;

      // to Loop through each image
      for (let i = 0; i < images; i++) {
        // to Get the data of the image
        const base64Data = DWObject.GetImageAsBase64(i);

        // Create an Image object using the data
        const img = new Image();
        img.src = "data:image/png;base64," + base64Data;

        // Create a canvas element and draw the image onto it
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // way to get the pixel data from the canvas
        const imageData = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        ).data;

        // it Check if the image is blank (all pixel data is white)
        const isBlank = imageData.every((value, index, array) => {
          return index % 4 === 3 || value === 255;
        });

        // If the image is blank, it will remove from viewer
        if (isBlank) {
          DWObject.RemoveImage(i);
          i--; // Decrease the index since we removed an image
        }
      }
    };
  };

  const RemoveAllImages = () => {
    // Remove all images from viewer
    DWObject.RemoveAllImages();
  };

  return (
    <div className="flex-1 flex-col p-4">
      <div className="mb-4">
        <label htmlFor="source" className="block text-gray-700 font-bold mb-2">
          Select Source:
        </label>
        <select
          style={{ margin: "10px" }}
          tabIndex="1"
          value={currentScanner}
          onChange={(e) => onSourceChange(e.target.value)}
          className="block appearance-none w-auto bg-gray-100 border border-gray-300 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
        >
          {scanners.length > 0 ? (
            scanners.map((_name, _index) => (
              <option value={_name} key={_index}>
                {_name}
              </option>
            ))
          ) : (
            <option value="Looking for devices..">Looking for devices..</option>
          )}
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="showUI" className="block text-gray-700 font-bold mb-2">
          Show UI:
        </label>
        <input
          id="showUI"
          type="checkbox"
          className="ml-2 form-checkbox h-5 w-5 text-gray-600"
          checked={showUI}
          onChange={onShowUIChange}
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="autoFeeder"
          className="block text-gray-700 font-bold mb-2"
        >
          Auto Feeder:
        </label>
        <input
          id="autoFeeder"
          type="checkbox"
          className="ml-2 form-checkbox h-5 w-5 text-gray-600"
          checked={autoFeeder}
          onChange={onAutoFeederChange}
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="pixelType"
          className="block text-gray-700 font-bold mb-2"
        >
          Pixel Type:
        </label>
        <select
          id="pixelType"
          className="block w-half py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={pixelType}
          onChange={onPixelTypeChange}
        >
          <option value="black-white">Black & White</option>
          <option value="gray">Gray</option>
          <option value="rgb">RGB Color</option>
        </select>
      </div>
      <div className="mb-4">
        <label
          htmlFor="resolution"
          className="block text-gray-700 font-bold mb-2"
        >
          Resolution:
        </label>
        <select
          id="resolution"
          className="block w-half py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={resolution}
          onChange={onResolutionChange}
        >
          <option value="100">100</option>
          <option value="200">200</option>
          <option value="300">300</option>
          <option value="400">400</option>
          <option value="600">600</option>
          <option value="1200">1200</option>
        </select>
      </div>
      <div className="mb-4">
        <button
          onClick={() =>
            acquireImage().catch((error) => setErrorMessage(error))
          }
          // disabled={scanners.length > 0 ? "" : "disabled"}
          // tabIndex="2"
          className="px-4 py-2 bg-blue-500  hover:bg-blue-600 text-white rounded-lg"
        >
          Scan & Save 1
        </button>
      </div>
      <div className="mb-4">
        <button
          onClick={ScanAndSave2}
          className="px-4 py-2 bg-blue-500   hover:bg-blue-600 text-white rounded-lg"
        >
          Scan & Save 2
        </button>
      </div>
      <button
        className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 rounded-md mr-2 mb-4 w-40"
        onClick={RemoveBlankImages}
      >
        Remove Blank Images
      </button>
      <button
        className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 rounded-md mb-4 w-40"
        onClick={RemoveAllImages}
      >
        Remove All Images
      </button>
    </div>
  );
}

export default Right;
