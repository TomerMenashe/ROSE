const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const {getStorage} = require("firebase-admin/storage");
const segmindApiKey = functions.config().segmind.api_key;
const items = ["bra", "headphones", "condom", "thong", "toothbrush", "laptop", "tv remote", "tomato", "toilet brush"];
const crypto = require('crypto');
const { URL } = require('url');
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
  const { faceImageUrl1, faceImageUrl2, pin } = data;

  try {
    console.log(`Starting swapFaces for pin: ${pin}`);

    const storage = getStorage();
    const database = admin.database();

    // Fetch existing url1 entries to prevent duplicates
    const existingFaceSwapsSnapshot = await database.ref(`room/${pin}/faceSwaps`).once('value');
    const existingFaceSwaps = existingFaceSwapsSnapshot.val() || {};
    const existingUrl1Set = new Set();

    Object.values(existingFaceSwaps).forEach(swap => {
      if (swap.url1 && Array.isArray(swap.url1) && swap.url1.length > 0) {
        const signedUrl = swap.url1[0];
        const urlObj = new URL(signedUrl);
        const pathname = urlObj.pathname; // /bucket-name/file-path
        const pathParts = pathname.split('/');
        const filePath = pathParts.slice(2).join('/'); // Remove leading '/' and bucket name
        existingUrl1Set.add(filePath);
      }
    });
    console.log(`Fetched ${existingUrl1Set.size} existing file paths.`);

    // Fetch the images from the provided URLs
    console.log("Fetching source images...");
    const sourceImage1Response = await axios.get(faceImageUrl1, { responseType: "arraybuffer" });
    const sourceImage2Response = await axios.get(faceImageUrl2, { responseType: "arraybuffer" });

    // Convert images to base64
    const sourceImage1 = encodeImage(sourceImage1Response.data);
    const sourceImage2 = encodeImage(sourceImage2Response.data);
    console.log("Source images encoded.");

    // Get list of target images from 'FaceSwapTargets' folder in Firebase Storage
    const bucket = storage.bucket();
    const [files] = await bucket.getFiles({ prefix: "FaceSwapTargets/" });

    if (files.length < 8) {
      throw new Error("Not enough target images available.");
    }

    // Select 8 random images from the FaceSwapTargets folder
    const selectedImages = files.sort(() => 0.5 - Math.random()).slice(0, 8);
    console.log(`Selected ${selectedImages.length} target images.`);

    const results = [];

    // Process face swaps for each selected image
    for (let i = 0; i < selectedImages.length; i++) {
      try {
        console.log(`Processing face swap ${i + 1} of ${selectedImages.length}...`);
        const targetImageBuffer = await selectedImages[i].download();
        const targetImage = encodeImage(targetImageBuffer[0]);
        console.log(`Target image ${i + 1} downloaded and encoded.`);

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
        console.log("Calling MemoryGame API for both sources...");
        const [response1, response2] = await Promise.all([
          axios.post("https://api.segmind.com/v1/faceswap-v2", data1, { headers: { "x-api-key": segmindApiKey } }),
          axios.post("https://api.segmind.com/v1/faceswap-v2", data2, { headers: { "x-api-key": segmindApiKey } }),
        ]);

        if (response1.data.image && response2.data.image) {
          const buffer1 = Buffer.from(response1.data.image, "base64");
          const buffer2 = Buffer.from(response2.data.image, "base64");

          // Generate deterministic filenames
          const targetImageName = selectedImages[i].name;
          const uniqueId1 = crypto.createHash('md5').update(faceImageUrl1 + targetImageName).digest('hex');
          const uniqueId2 = crypto.createHash('md5').update(faceImageUrl2 + targetImageName).digest('hex');

          const filePath1 = `room/${pin}/faceSwaps/${uniqueId1}_1.jpg`;
          const filePath2 = `room/${pin}/faceSwaps/${uniqueId2}_2.jpg`;

          const file1 = bucket.file(filePath1);
          const file2 = bucket.file(filePath2);

          // Check if filePath1 already exists
          if (existingUrl1Set.has(filePath1)) {
            console.log(`File path ${filePath1} already exists. Skipping push for this pair.`);
            continue; // Skip to the next iteration
          }

          console.log(`Saving swapped images to storage: ${filePath1}, ${filePath2}`);
          await file1.save(buffer1, { contentType: "image/jpeg" });
          await file2.save(buffer2, { contentType: "image/jpeg" });

          const [downloadURL1, downloadURL2] = await Promise.all([
            file1.getSignedUrl({ action: "read", expires: "03-01-2500" }),
            file2.getSignedUrl({ action: "read", expires: "03-01-2500" }),
          ]);

          const finalURL1 = downloadURL1[0];
          const finalURL2 = downloadURL2[0];

          // Use push() to add entries
          const faceSwapRef = database.ref(`room/${pin}/faceSwaps`).push();
          await faceSwapRef.set({
            url1: [finalURL1], // Store as an array
            url2: [finalURL2], // Store as an array
          });
          console.log(`FaceSwap entry ${i + 1} saved to database.`);

          // Add the new filePath1 to the Set to prevent duplicates within this run
          existingUrl1Set.add(filePath1);

          results.push({ url1: [finalURL1], url2: [finalURL2] }); // Add results as arrays
        } else {
          throw new Error("MemoryGame API did not return both images.");
        }
      } catch (iterationError) {
        console.error(`Error processing face swap ${i + 1}:`, iterationError);
        throw iterationError;
      }
    }

    console.log("All face swaps processed successfully.");
    return { results };
  } catch (error) {
    console.error("swapFaces Error:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});
// eslint-disable-next-line no-unused-vars
exports.getRandomItem = functions.https.onCall(async (_data, _context) => {
  return items[Math.floor(Math.random() * items.length)];
});

exports.getPersonalQuestionFeedback = functions.https.onCall(async (data, _context) => {
  try {
    const { subjectName, subjectAnswer, guesserName, guesserGuess, question } = data;

    if (!question || !subjectAnswer || !guesserGuess) {
      throw new functions.https.HttpsError("invalid-argument", "Question, answer1, and answer2 are required.");
    }

    const prompt = `We play a couples game, and we asked both ${subjectName} and ${guesserName} this question: ${question}.
    ${subjectName} answer: ${subjectAnswer},
    ${guesserName} answer: ${guesserGuess},
    if the answers are similar to each other or logically connected, write back a positive and happy and only a little bit sarcastic response,
    that confirms that know each other quite well and they should be proud of themselves.
    if the answers are not similar to each other or not logically connected, write back a response that is a little bit sarcastic,
    and tell them that they should try to know each other better.
    `;

    const response = await generateResponse(
      "gpt-4o",
      0.7,
      "text",
      prompt,
      null,
      1000,
    );

    return { response };
  } catch (error) {
    console.error(error);
    throw new functions.https.HttpsError("internal", error.message);
  }
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
    const prompt = `If this image is a selfie where you can see my face clearly, respond only with the word: yes (without period or any other characters or words),
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
