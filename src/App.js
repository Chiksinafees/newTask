// import Left from "./components/Left";
import Right from "./components/Right";
import { useState, useEffect } from "react";
import AcquireImage from "./components/AcquireImage";
import Dynamsoft from 'dwt';
import { PDFDocument } from 'pdf-lib';

function App() {
  const [sources, setSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState("");
  const [showUI, setShowUI] = useState(false);
  const [autoFeeder, setAutoFeeder] = useState(false);
  const [pixelType, setPixelType] = useState("black-white");
  const [resolution, setResolution] = useState(300);
 

  // to load Dynamsoft library and get scanner devices in select source
  useEffect(() => {
    Dynamsoft.DWT.Containers = [{ ContainerId: "dwtcontrolContainer", Width: "100%", Height: "100%" }];
    Dynamsoft.DWT.AutoLoad = false;
    Dynamsoft.DWT.RegisterEvent('OnWebTwainReady', async () => {
      const devices = await Dynamsoft.DWT.DefaultSources;
      setSources(devices);
      setSelectedSource(devices[0]?.name || '');
    }); 
    Dynamsoft.DWT.Load();
  }, []);


  function handleSourceChange(event) {
    setSelectedSource(event.target.value);  
  }


  function onShowUIChange() {
    setShowUI(!showUI);
    // DWObject.SetViewMode(showUI ? 2 : 0);
  }

  function handleAutoFeederChange(event) {
    setAutoFeeder(event.target.checked);
  }

  function handlePixelTypeChange(event) {
    setPixelType(event.target.value);
  }

  function handleResolutionChange(event) {
    setResolution(event.target.value);
  }

  
  async function handleScanAndSave1() {
    // const pdfDoc = await PDFDocument.create();
    // await Dynamsoft.DWT.acquireImage({
    //   pixelType: pixelType,
    //   resolution: resolution,
    //   source: selectedSource,
    //   onPostAllTransfers: async (index, data) => {
    //     // Add all the scanned images to the PDF document
    //     for (const imageData of data) {
    //       const page = pdfDoc.addPage([imageData.width, imageData.height]);
    //       const img = await pdfDoc.embedJpg(imageData.src);
    //       page.drawImage(img, { x: 0, y: 0, width: imageData.width, height: imageData.height });
    //     }
    //     // Save the PDF document to the local disk
    //     const pdfBytes = await pdfDoc.save();
    //     const blob = new Blob([pdfBytes], { type: "application/pdf" });
    //     const url = URL.createObjectURL(blob);
    //     const a = document.createElement("a");
    //     a.href = url;
    //     a.download = "result.pdf";
    //     a.click();
    //   },
    // });
  }

  function handleScanAndSave2() {
    let pageCount = 0;
    Dynamsoft.DWT.acquireImage({
      pixelType: pixelType,
      resolution: resolution,
      source: selectedSource,
      onPostTransfer: (index, data) => {
        pageCount++;
      },
      onPostAllTransfers: () => {
        alert(`Successfully saved ${pageCount} images.`);
      },
    });
  }

  
  function handleRemoveBlankImages() {
    const imageViewer = Dynamsoft.DWT.GetViewer('dwtcontrolContainer');
    const images = imageViewer.getAll();
    images.forEach((image) => {
      const bitmap = image.getInnerBitmap();
      if (bitmap && bitmap.IsBlank) {
        imageViewer.remove(image);
      }
    });
  }
  

  function handleRemoveAllImages() {
    const imageViewer = Dynamsoft.DWT.GetViewer('dwtcontrolContainer');
    imageViewer.removeAll();
  }

  return (
    <div className="flex h-screen w-screen  m-10 border rounded-lg"> 
      <AcquireImage
productKey="t0186SwUAAJ+c0ZI/kn7CtY0a1UYA5/GKvWY99lK5pIgRX5zeI+bSDSDu73uNNPwVTlgQxwbO4X/7cGGHueg1PKK31kQtlZxWy3Sfbi0tj9HqeS1q7YwhWrJDhsBnuwVcCG3cv4TSrYZX4BkAPQ7kACgHYjsF8NI92zIkAPcA7QBx0k3ga5P11ra4mhp+HS+aTh7g1Oud+cVe48zP9V+nv1W/RHkraIkA5VtOAO4B2gHiABLACowl4z6n7Al3"
/>
      <Right
        productKey="t0186SwUAAJ+c0ZI/kn7CtY0a1UYA5/GKvWY99lK5pIgRX5zeI+bSDSDu73uNNPwVTlgQxwbO4X/7cGGHueg1PKK31kQtlZxWy3Sfbi0tj9HqeS1q7YwhWrJDhsBnuwVcCG3cv4TSrYZX4BkAPQ7kACgHYjsF8NI92zIkAPcA7QBx0k3ga5P11ra4mhp+HS+aTh7g1Oud+cVe48zP9V+nv1W/RHkraIkA5VtOAO4B2gHiABLACowl4z6n7Al3"
        sources={sources}
        selectedSource={selectedSource}
        showUI={showUI}
        autoFeeder={autoFeeder}
        pixelType={pixelType}
        resolution={resolution}
        onSourceChange={handleSourceChange}
        onShowUIChange={onShowUIChange}
        onAutoFeederChange={handleAutoFeederChange}
        onPixelTypeChange={handlePixelTypeChange}
        onResolutionChange={handleResolutionChange}
        onScanAndSave1={handleScanAndSave1}
        onScanAndSave2={handleScanAndSave2}
        onRemoveBlankImages={handleRemoveBlankImages}
        onRemoveAllImages={handleRemoveAllImages}
      />
    </div>
  );
}

export default App