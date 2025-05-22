export const getCroppedImg = (image, crop) => {
  const canvas = document.createElement("canvas")
  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height
  canvas.width = crop.width
  canvas.height = crop.height
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    throw new Error("No 2d context")
  }

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height,
  )

  return new Promise((resolve, reject) => {
    try {
      const base64Image = canvas.toDataURL("image/png")
      resolve(base64Image)
    } catch (e) {
      reject(e)
    }
  })
}

export const base64ToBlob = async (base64String) => {
  // Handle blob URLs
  if (base64String.startsWith("blob:")) {
    const response = await fetch(base64String)
    return await response.blob()
  }

  // Handle regular base64 strings
  try {
    // Split the base64 string to remove data URL prefix if it exists
    const parts = base64String.split(";base64,")
    const imageType = parts[0].split(":")[1] || "image/png"
    const decodedData = parts[1] || base64String

    // Convert base64 to binary
    const byteCharacters = atob(decodedData)
    const byteArrays = []

    for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
      const slice = byteCharacters.slice(offset, offset + 1024)
      const byteNumbers = new Array(slice.length)

      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i)
      }

      const byteArray = new Uint8Array(byteNumbers)
      byteArrays.push(byteArray)
    }

    return new Blob(byteArrays, { type: imageType })
  } catch (error) {
    console.error("Error converting base64 to blob:", error)
    throw new Error("Failed to convert image data")
  }
}
