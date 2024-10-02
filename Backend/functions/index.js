// index.js

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const { getStorage } = require('firebase-admin/storage');
const segmindApiKey = functions.config().segmind.api_key;
const items = [
  "bra",
  "headphones",
  "condom",
  "thong",
  "toothbrush",
  "laptop",
  "tv remote",
  "tomato",
  "toilet brush",
  "bottle opener",
  "Boxers underpants",
  "ice",
  "glass of water",
];
const crypto = require('crypto');
const { URL } = require('url');
const pLimit = require('p-limit');

// Initialize Firebase Admin SDK
admin.initializeApp();

/**
 * Encodes an image buffer to a Base64 string.
 *
 * @param {Buffer} imageBuffer - The buffer of the image.
 * @return {string} - The Base64 encoded string of the image.
 */
function encodeImage(imageBuffer) {
  return imageBuffer.toString('base64');
}

/**
 * Generates a response from the OpenAI GPT-4 model.
 *
 * @param {string} model - The model to use.
 * @param {number} temperature - The temperature setting for the model.
 * @param {string} typeOfResponse - The type of response ("text" or "image").
 * @param {string} query - The text query for the model.
 * @param {Buffer} imgBuffer - The image buffer if needed.
 * @param {number} maxTokens - The maximum number of tokens.
 * @return {Promise<string>} - The response from the model.
 */
async function generateResponse(
    model = 'gpt-4o-mini',
    temperature = 0.7,
    typeOfResponse = 'text',
    query = null,
    imgBuffer = null,
    maxTokens = 100
) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${functions.config().openai.key}`,
  };

  const content = [{ type: typeOfResponse, text: query }];

  if (imgBuffer) {
    const encodedImage = encodeImage(imgBuffer);
    content.push({
      type: 'image_url',
      image_url: { url: `data:image/jpeg;base64,${encodedImage}` },
    });
  }

  const payload = {
    model: model,
    temperature: temperature,
    messages: [{ role: 'user', content: content }],
    max_tokens: maxTokens,
  };

  const response = await axios.post('https://api.openai.com/v1/chat/completions', payload, {
    headers: headers,
  });

  const data = response.data;
  if (data.choices && data.choices.length > 0) {
    return data.choices[0].message.content;
  } else {
    throw new Error('Invalid response from OpenAI API');
  }
}

/**
 * Callable function to perform multiple face swaps using images stored in Firebase Storage.
 *
 * @param {object} data - The data containing user1URL, user2URL, and pin.
 * @returns {Promise<object>} - An object indicating the success of the operation.
 */
exports.swapFaces = functions
    .region('europe-west1')
    .runWith({ timeoutSeconds: 540, memory: '2GB' })
    .https.onCall(async (data, _context) => {
      const { user1URL, user2URL, pin } = data;

      try {
        console.log(`Starting swapFaces for pin: ${pin}`);

        const storage = getStorage();
        const database = admin.database();

        /**
         * Helper function to check if participants exist
         * @param {string} pin - The room PIN
         */
        async function checkParticipantsExist(pin) {
          const participantsRef = database.ref(`room/${pin}/participants`);
          const snapshot = await participantsRef.once('value');
          if (!snapshot.exists()) {
            console.warn(`Participants do not exist for pin: ${pin}. Terminating function.`);
            throw new functions.https.HttpsError(
                'not-found',
                `Participants do not exist for pin: ${pin}.`
            );
          }
        }

        /**
         * Fetches and encodes an image from a given URL.
         *
         * @param {string} url - The URL of the image.
         * @returns {Promise<string>} - A promise that resolves to the Base64 encoded image.
         */
        async function fetchAndEncodeImage(url) {
          await checkParticipantsExist(pin); // **Check before API call**
          console.log(`Fetching image from URL: ${url}`);
          const response = await axios.get(url, { responseType: 'arraybuffer' });
          console.log(`Image fetched and encoded from URL: ${url}`);
          return encodeImage(response.data);
        }

        /**
         * Retrieves the list of target images from Firebase Storage.
         *
         * @returns {Promise<object[]>} - A promise that resolves to an array of target image files.
         */
        async function getTargetImages() {
          await checkParticipantsExist(pin); // **Check before API call**
          const bucket = storage.bucket();
          const [allFiles] = await bucket.getFiles({ prefix: 'FaceSwapTargets/' });
          console.log(`Number of files retrieved from 'FaceSwapTargets/': ${allFiles.length}`);
          allFiles.forEach((file, idx) => console.log(`File ${idx}: ${file.name}`));

          if (allFiles.length === 0) {
            throw new Error("No target images available in 'FaceSwapTargets/' directory.");
          }

          // Filter out directories (if any)
          const imageFiles = allFiles.filter((file) => !file.name.endsWith('/'));

          // Sort files to ensure consistent ordering
          imageFiles.sort((a, b) => a.name.localeCompare(b.name));
          return imageFiles;
        }

        /**
         * Calls the face swap API with the given source and target images.
         *
         * @param {string} sourceImage - The Base64 encoded source image.
         * @param {string} targetImage - The Base64 encoded target image.
         * @returns {Promise<string>} - A promise that resolves to the Base64 encoded swapped image.
         */
        async function callFaceSwapAPI(sourceImage, targetImage) {
          await checkParticipantsExist(pin); // **Check before API call**
          const data = {
            source_img: sourceImage,
            target_img: targetImage,
            input_faces_index: 0,
            source_faces_index: 0,
            face_restore: 'codeformer-v0.1.0.pth',
            base64: true,
          };
          const response = await axios.post('https://api.segmind.com/v1/faceswap-v2', data, {
            headers: { 'x-api-key': segmindApiKey },
          });
          if (response.data.image) {
            return response.data.image;
          } else {
            throw new Error('Face swap API did not return an image.');
          }
        }

        /**
         * Saves an image buffer to Firebase Storage and returns its signed URL.
         *
         * @param {Buffer} buffer - The image buffer.
         * @param {string} filePath - The storage path where the image will be saved.
         * @returns {Promise<string>} - A promise that resolves to the signed URL of the saved image.
         */
        async function saveImageToStorage(buffer, filePath) {
          await checkParticipantsExist(pin); // **Check before API call**
          const bucket = storage.bucket();
          const file = bucket.file(filePath);
          await file.save(buffer, { contentType: 'image/jpeg' });
          const [downloadURL] = await file.getSignedUrl({ action: 'read', expires: '03-01-2500' });
          return downloadURL;
        }

        /**
         * Updates the Firebase Realtime Database with the new face swap URLs.
         *
         * @param {string} finalURL1 - The URL of the first swapped image.
         * @param {string} finalURL2 - The URL of the second swapped image.
         */
        async function updateDatabase(finalURL1, finalURL2) {
          await checkParticipantsExist(pin); // **Check before API call**
          const faceSwapRef = database.ref(`room/${pin}/faceSwaps`).push();
          await faceSwapRef.set({
            url1: [finalURL1], // Store as an array
            url2: [finalURL2], // Store as an array
          });
        }

        /**
         * Processes a face swap for the given index.
         *
         * @param {number} index - The index of the target image.
         * @param {object[]} allFiles - The array of all target image files.
         */
        async function processFaceSwapAtIndex(index, allFiles) {
          await checkParticipantsExist(pin); // **Check before API call**
          if (index < 0 || index >= allFiles.length) {
            console.error(`Index ${index} is out of bounds for allFiles with length ${allFiles.length}`);
            throw new Error(`Index ${index} is out of bounds for target images.`);
          }

          // Fetch target image
          const file = allFiles[index];
          console.log(`Processing face swap at index ${index} with file: ${file.name}`);
          const targetImageBufferArray = await file.download();
          const targetImageBuffer = targetImageBufferArray[0];
          const targetImage = encodeImage(targetImageBuffer);
          const targetImageName = file.name;

          // Call face swap API for both users
          const [swappedImage1Base64, swappedImage2Base64] = await Promise.all([
            callFaceSwapAPI(sourceImage1, targetImage),
            callFaceSwapAPI(sourceImage2, targetImage),
          ]);

          // Convert base64 images to buffers
          const buffer1 = Buffer.from(swappedImage1Base64, 'base64');
          const buffer2 = Buffer.from(swappedImage2Base64, 'base64');

          // Generate unique filenames
          const uniqueId1 = crypto.createHash('md5').update(user1URL + targetImageName + index).digest('hex');
          const uniqueId2 = crypto.createHash('md5').update(user2URL + targetImageName + index).digest('hex');
          const filePath1 = `room/${pin}/faceSwaps/${uniqueId1}_1.jpg`;
          const filePath2 = `room/${pin}/faceSwaps/${uniqueId2}_2.jpg`;

          // Save images to storage and get download URLs
          console.log(`Saving swapped images for index ${index} to storage...`);
          const [finalURL1, finalURL2] = await Promise.all([
            saveImageToStorage(buffer1, filePath1),
            saveImageToStorage(buffer2, filePath2),
          ]);

          // Update the database
          console.log(`Updating database with new face swap URLs for index ${index}...`);
          await updateDatabase(finalURL1, finalURL2);
        }

        // Main logic starts here
        // Fetch and encode the users' images
        console.log('Fetching and encoding source images...');
        const [sourceImage1, sourceImage2] = await Promise.all([
          fetchAndEncodeImage(user1URL),
          fetchAndEncodeImage(user2URL),
        ]);

        // Get list of target images
        const allFiles = await getTargetImages();

        // Check if we have enough target images
        const requiredSwaps = 8;
        if (allFiles.length < requiredSwaps) {
          throw new Error(
              `Not enough target images. Required: ${requiredSwaps}, Available: ${allFiles.length}`
          );
        }

        // Retrieve or generate indices
        const indicesRef = database.ref(`room/${pin}/faceSwapIndices`);
        let indicesSnapshot = await indicesRef.once('value');
        let chosenIndices;

        if (indicesSnapshot.exists()) {
          chosenIndices = indicesSnapshot.val();
          console.log(`Retrieved existing indices for pin ${pin}: ${chosenIndices}`);
        } else {
          // Generate random indices
          const numFiles = allFiles.length;
          const indicesArray = Array.from({ length: numFiles }, (_, i) => i);
          // Shuffle indices
          for (let i = indicesArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indicesArray[i], indicesArray[j]] = [indicesArray[j], indicesArray[i]];
          }

          chosenIndices = indicesArray.slice(0, requiredSwaps);
          console.log(`Generated new indices for pin ${pin}: ${chosenIndices}`);
          // Store indices in database
          await indicesRef.set(chosenIndices);
        }

        // Limit concurrency
        const limit = pLimit(3); // Adjust concurrency limit as needed

        // Process face swaps with limited concurrency
        await Promise.all(
            chosenIndices.map((index) =>
                limit(() => {
                  return processFaceSwapAtIndex(index, allFiles).catch((error) => {
                    console.error(`Error processing face swap at index ${index}:`, error);
                    // Optionally handle retries or log the error
                  });
                })
            )
        );

        console.log('All face swaps completed successfully.');
        return { success: true };
      } catch (error) {
        console.error('swapFaces Error:', error);
        throw new functions.https.HttpsError('internal', error.message);
      }
    });

/**
 * Callable function to get a random item.
 */
exports.getRandomItem = functions.region('europe-west1').https.onCall(async (_data, _context) => {
  return items[Math.floor(Math.random() * items.length)];
});

// eslint-disable-next-line no-unused-vars
exports.isItemInImage = functions.region('europe-west1').https.onCall(async (data, _context) => {
  try {
    const { currentItem, image } = data;

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
    return { isPresent };
  } catch (error) {
    console.error(error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

exports.isValidSelfie = functions.region('europe-west1').https.onCall(async (data, _context) => {
  try {
    const { image } = data;

    if (!image) {
      throw new functions.https.HttpsError("invalid-argument", "Image is required.");
    }
    const prompt = `Please analyze this image and ensure the following conditions are met:
    1. This is a selfie image.
    2. The full face should be visible in the frame.
    
    take into consideration that some phones have low quality front cameras, so the image might not be perfect.
    If this image is a good selfie, respond only with the word: yes (without period or any other characters or words).
    
    Else,
      respond only with a SARCASTIC comment that is based on the recived image and explains why it is not a selfie.
      make sure that the sarcastic comment also explains how to fix the selfie. 
      In overall, make the response funny and sarcastic, and in a length suited for a pop up message on a mobile phone.`;

    const imgBuffer = Buffer.from(image, "base64");
    const response = await generateResponse(
        "gpt-4o",
        0.7,
        "text",
        prompt,
        imgBuffer,
        100,
    );
    return { response };
  } catch (error) {
    console.error(error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// eslint-disable-next-line no-unused-vars
exports.testGenerateResponse = functions.region('europe-west1').https.onCall(async (_data, _context) => {
  try {
    const testQuery = "'write a hard riddle where the answer is one Spider-man's villain but don't tell who .'";
    const response = await generateResponse(
        "gpt-4o-mini",
        0.7,
        "text",
        testQuery,
        null,
        50,
    );

    return { response };
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
exports.getHamshir = functions.region('europe-west1').https.onCall(async (data, _context) => {
  try {
    const { item } = data;

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
        7. use common english words that can be understood by an 11 year old.

        here is an example for the item "bra":

        I have two cups but hold no tea,
        Straps and hooks are parts of me.
        I support you throughout the day,
        Under your shirt is where I stay.`;

    const response = await generateResponse(
        "gpt-4o-mini",
        0.7,
        "text",
        prompt,
        null,
        150,
    );

    return { response };
  } catch (error) {
    console.error(error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

exports.getPersonalQuestionFeedback = functions.region('europe-west1').https.onCall(async (data, _context) => {
  try {
    const { pin, subjectName, subjectAnswer, guesserName, guesserGuess, question } = data;

    if (!pin || !question || !subjectAnswer || !guesserGuess) {
      throw new functions.https.HttpsError(
          "invalid-argument",
          "Pin, question, and both answers are required."
      );
    }

    const feedbackRef = admin.database().ref(`room/${pin}/personalQuestion/feedback`);

    // Use a transaction to ensure only one generation occurs
    const feedbackSnapshot = await feedbackRef.once('value');

    if (feedbackSnapshot.exists()) {
      // Feedback already exists, return it
      const existingFeedback = feedbackSnapshot.val();
      return { response: existingFeedback };
    } else {
      // Feedback doesn't exist, generate it
      const prompt = `We play a couples game, and we asked both ${subjectName} and ${guesserName} this question: ${question}.
        ${subjectName} answered: ${subjectAnswer},
        ${guesserName} guessed: ${guesserGuess},
        if the answers are similar to each other or logically connected, write back a happy and sarcastic response,
        that confirms that they know each other quite well.
        if the answers are not similar to each other or not logically connected, write back a sarcastic response,
        based on the provided answers and the question context. make fun of them.

        what ever the case, make your comment length suited for a pop up message on a mobile phone, and use common english words that can be understood by a 13 year old.
        `;

      // Generate response using GPT
      const gptResponse = await generateResponse(
          "gpt-4o-mini",
          0.7,
          "text",
          prompt,
          null,
          1000
      );

      // Store the generated feedback in the database
      await feedbackRef.set(gptResponse);

      return { response: gptResponse };
    }
  } catch (error) {
    console.error("getPersonalQuestionFeedback Error:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

exports.getRandomItem = functions.region('europe-west1').https.onCall(async (_data, _context) => {
  return items[Math.floor(Math.random() * items.length)];
});
