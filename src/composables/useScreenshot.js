import { toJpeg as ElToJpg, toPng as ElToPng } from 'html-to-image';
import { ref } from 'vue';

// 截圖 (TODO: 需要優化)
export function useScreenshot() {
  const dataUrl = ref('');
  const imgType = ref('png');
  const error = ref();

  async function capture(el, options = {}) {
    let data;

    const fileName = options.fileName ?? `vue-flow-screenshot-${Date.now()}`;

    switch (options.type) {
      case 'jpeg':
        data = await toJpeg(el, options);
        break;
      case 'png':
        data = await toPng(el, options);
        break;
      default:
        data = await toPng(el, options);
        break;
    }

    // immediately download the image if shouldDownload is true
    if (options.shouldDownload && fileName !== '') {
      download(fileName);
    }

    return data;
  }

  function toJpeg(el, options = { quality: 0.95 }) {
    error.value = null;

    return ElToJpg(el, options)
      .then((data) => {
        dataUrl.value = data;
        imgType.value = 'jpeg';
        return data;
      })
      .catch((err) => {
        error.value = err;
        throw new Error(err);
      });
  }

  function toPng(el, options = { quality: 0.95 }) {
    error.value = null;

    console.log("toPng", el, options);
    return ElToPng(el, options)
      .then((data) => {
        console.log("data", data);
        dataUrl.value = data;
        console.log("dataUrl", dataUrl.value);
        imgType.value = 'png';
        return data;
      })
      .catch((err) => {
        error.value = err;
        throw new Error(err);
      });
  }

  function download(fileName) {
    const link = document.createElement('a');
    link.download = `${fileName}.${imgType.value}`;
    link.href = dataUrl.value;
    link.click();
  }

  return {
    capture,
    download,
    dataUrl,
    error,
  };
}
