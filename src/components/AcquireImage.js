import Dynamsoft from "dwt";

const AcquireImage = ({ productKey }) => {
  const containerId = "dwtcontrolContainer";
  const width = "100%";
  const height = "600";

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

  
  return (
    <div className="w-1/2 h-full bg-gray-200 p-4">
      <div style={{ height: "600px", overflowY: "scroll" }}>
        <div id={containerId}></div>
      </div>
    </div>
  );
};

export default AcquireImage;
