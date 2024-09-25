const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const {getStorage} = require("firebase-admin/storage");
const items = ["bra", "headphones", "condom", "thong", "toothbrush", "laptop", "tv remote", "tomato", "toilet brush"];

// Initialize Firebase Admin SDK
admin.initializeApp();

/**
 * Encodes an image buffer to a Base64 string.
 *
 * @param {Buffer} imageBuffer - The buffer of the image.
 * @return {string} - The Base64 encoded string of the image.
 */
function encodeImage(imageBuffer) {
  return imageBuffer.toString("base64");
}

/**
 * Generates a response from the OpenAI GPT-4 model.
 */
async function generateResponse(model = "gpt-4o", temperature = 0.7, typeOfResponse = "text", query = null, imgBuffer = null, maxTokens = 100) {
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${functions.config().openai.key}`,
  };

  const content = [
    {type: typeOfResponse, text: query},
  ];

  if (imgBuffer) {
    const encodedImage = encodeImage(imgBuffer);
    content.push({
      type: "image_url",
      image_url: {url: `data:image/jpeg;base64,${encodedImage}`},
    });
  }

  const payload = {
    model: model,
    temperature: temperature,
    messages: [
      {role: "user", content: content},
    ],
    max_tokens: maxTokens,
  };

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (data.choices && data.choices.length > 0) {
    return data.choices[0].message.content;
  } else {
    throw new Error("Invalid response from OpenAI API");
  }
}

/**
 * Callable function to perform a face swap using images stored in Firebase Storage.
 *
 * @returns {Promise<object>} - An object containing the URLs of the swapped faces.
 */
// eslint-disable-next-line no-unused-vars
exports.swapFaces = functions.https.onCall(async (data, _context) => {
  const { faceImageUrl1, faceImageUrl2, pin } = data; // Get the faceImageUrl1, faceImageUrl2, and pin from data

  try {
    const storage = getStorage();
    const database = admin.database();

    // Fetch the images from the provided URLs
    const sourceImage1Response = await axios.get(faceImageUrl1, { responseType: "arraybuffer" });
    const sourceImage2Response = await axios.get(faceImageUrl2, { responseType: "arraybuffer" });

    // Convert images to base64
    const sourceImage1 = encodeImage(sourceImage1Response.data);
    const sourceImage2 = encodeImage(sourceImage2Response.data);

    // Get list of target images from 'FaceSwapTargets' folder in Firebase Storage
    const bucket = storage.bucket();
    const [files] = await bucket.getFiles({ prefix: "FaceSwapTargets/" });

    if (files.length < 3) {
      throw new Error("Not enough target images available.");
    }

    // Select three random images from the FaceSwapTargets folder
    const selectedImages = files.sort(() => 0.5 - Math.random()).slice(0, 3);

    const results = [];

    // Process face swaps for each selected image
    for (let i = 0; i < selectedImages.length; i++) {
      const targetImageBuffer = await selectedImages[i].download();
      const targetImage = encodeImage(targetImageBuffer[0]);

      // Prepare payloads for the API call
      const data1 = {
        source_img: sourceImage1,
        target_img: targetImage,
        input_faces_index: 0,
        source_faces_index: 0,
        face_restore: "codeformer-v0.1.0.pth",
        base64: true,
      };
      const data2 = {
        source_img: sourceImage2,
        target_img: targetImage,
        input_faces_index: 0,
        source_faces_index: 0,
        face_restore: "codeformer-v0.1.0.pth",
        base64: true,
      };

      // API calls
      const [response1, response2] = await Promise.all([
        axios.post("https://api.segmind.com/v1/faceswap-v2", data1, { headers: { "x-api-key": "SG_6fd2da6a5cdfd18d" } }),
        axios.post("https://api.segmind.com/v1/faceswap-v2", data2, { headers: { "x-api-key": "SG_6fd2da6a5cdfd18d" } }),
      ]);

      if (response1.data.image && response2.data.image) {
        const buffer1 = Buffer.from(response1.data.image, "base64");
        const buffer2 = Buffer.from(response2.data.image, "base64");
        const timestamp = Date.now();

        // Save swapped images to Firebase Storage
        const filePath1 = `room/${pin}/faceSwaps/${i}_1.jpg`;
        const filePath2 = `room/${pin}/faceSwaps/${i}_2.jpg`;

        const file1 = bucket.file(filePath1);
        const file2 = bucket.file(filePath2);

        await file1.save(buffer1, { contentType: "image/jpeg" });
        await file2.save(buffer2, { contentType: "image/jpeg" });

        const [downloadURL1, downloadURL2] = await Promise.all([
          file1.getSignedUrl({ action: "read", expires: "03-01-2500" }),
          file2.getSignedUrl({ action: "read", expires: "03-01-2500" }),
        ]);

        // Store results in the database
        const faceSwapRef = database.ref(`room/${pin}/faceSwaps`).push();
        await faceSwapRef.set({
          url1: downloadURL1,
          url2: downloadURL2,
          timestamp,
        });

        results.push({ url1: downloadURL1, url2: downloadURL2 });
      } else {
        throw new Error("FaceSwap API did not return both images.");
      }
    }

    return { results };
  } catch (error) {
    console.error("Error:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});



// eslint-disable-next-line no-unused-vars
exports.getRandomItem = functions.https.onCall(async (_data, _context) => {
  return items[Math.floor(Math.random() * items.length)];
});

// eslint-disable-next-line no-unused-vars
exports.isItemInImage = functions.https.onCall(async (data, _context) => {
  try {
    const {currentItem, image} = data;

    if (!currentItem || !image) {
      throw new functions.https.HttpsError("invalid-argument", "currentItem and image are required.");
    }

    // Decode the image from Base64
    const imgBuffer = Buffer.from(image, "base64");

    const response = await generateResponse(
        "gpt-4o",
        0.7,
        "text",
        `Is there ${currentItem} in the image? Answer using only Yes or No.`,
        imgBuffer,
        3,
    );

    const isPresent = response.toLowerCase().includes("yes");
    return {isPresent};
  } catch (error) {
    console.error(error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

exports.isValidSelfie = functions.https.onCall(async (data, _context) => {
  try {
    const {image} = data;

    if (!image) {
      throw new functions.https.HttpsError("invalid-argument", "Image is required.");
    }
    const prompt = `If this image is a selfie where you can see my face clearly, respond only with the word: yes.
    if not, respond only with a SARCASTIC comment that is based on the recived image and explains why it is not a selfie. 
    make it funny and sarcastic, and in a length suited for a pop up message on a mobile phone.`;

    const imgBuffer = Buffer.from(image, "base64");
    const response = await generateResponse(
        "gpt-4o",
        0.7,
        "text",
        prompt,
        imgBuffer,
        100,
    );
    return {response};
  } catch (error) {
    console.error(error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// eslint-disable-next-line no-unused-vars
exports.testGenerateResponse = functions.https.onCall(async (_data, _context) => {
  try {
    const testQuery = "'write a hard riddle where the answer is one Spider-man's villain but don't tell who .'";
    const response = await generateResponse(
        "gpt-4o",
        0.7,
        "text",
        testQuery,
        null,
        50,
    );

    return {response};
  } catch (error) {
    console.error(error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

/**
 * Callable function to get Hamshir about a given item.
 *
 * @param {object} data - The data payload containing the item.
 * @param {string} data.item - The name of the item to get an opinion on.
 * @returns {Promise<object>} - An object containing Hamshir.
 */
// eslint-disable-next-line no-unused-vars
exports.getHamshir = functions.https.onCall(async (data, _context) => {
  try {
    const {item} = data;

    if (!item) {
      throw new functions.https.HttpsError(
          "invalid-argument",
          "The function must be called with an \"item\" argument.",
      );
    }

    const prompt = `write a small short poem that is also a funny rhymed riddle about the item: ${item}.
        instructions:
        1. the person who reads this short poem will need to guess that the item behind it is: ${item}.
        2. make it funny.
        3. Make it easy to guess.
        4. keep it 4 rows long.
        5. dont write back anything but the poem rhymed riddle.
        6. use simple and easy to understand language

        here is an example for the item "bra":

        I have two cups but hold no tea,
        Straps and hooks are parts of me.
        I support you throughout the day,
        Under your shirt is where I stay.`;

    const response = await generateResponse(
        "gpt-4o",
        0.7,
        "text",
        prompt,
        null,
        150,
    );

    return {response};
  } catch (error) {
    console.error(error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});
