const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();

// Replace this with your actual API key stored in Firebase environment config
const API_KEY = functions.config().openai.key;

/**
 * Encodes an image buffer to a Base64 string.
 *
 * @param {Buffer} imageBuffer - The buffer of the image.
 * @returns {string} - The Base64 encoded string of the image.
 */
function encodeImage(imageBuffer) {
    return imageBuffer.toString('base64');
}

/**
 * Generates a response from the OpenAI GPT-4 model.
 *
 * @param {string} [model="gpt-4o"] - The model to use.
 * @param {number} [temperature=0.7] - The temperature for response creativity.
 * @param {string} [typeOfResponse="text"] - The type of response.
 * @param {string|null} [query=null] - The query to be processed by the model.
 * @param {Buffer|null} [imgBuffer=null] - The buffer of an image to include in the query.
 * @param {number} [maxTokens=100] - The maximum number of tokens in the response.
 * @returns {Promise<string>} - The response from the model.
 */
async function generateResponse(model = "gpt-4o", temperature = 0.7, typeOfResponse = "text", query = null, imgBuffer = null, maxTokens = 100) {
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
    };

    const content = [
        { type: typeOfResponse, text: query }
    ];

    if (imgBuffer) {
        const encodedImage = encodeImage(imgBuffer);
        content.push({
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${encodedImage}` }
        });
    }

    const payload = {
        model: model,
        temperature: temperature,
        messages: [
            { role: "user", content: content }
        ],
        max_tokens: maxTokens
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
    } else {
        throw new Error('Invalid response from OpenAI API');
    }
}

/**
 * Callable function to get a random item.
 *
 * @param {object} _data - The data passed from the client (unused).
 * @param {object} _context - The context of the callable function (unused).
 * @returns {Promise<object>} - An object containing the random item.
 */
// eslint-disable-next-line no-unused-vars
exports.getRandomItem = functions.https.onCall(async (_data, _context) => {
    try {
        const response = await generateResponse(
            "gpt-4o",
            1.7,
            "text",
            "Create a list of 75 random items or products that are in every home. It could be anything " +
            "as long as you are sure it's a must-have in every home and it's possible to hold " +
            "it in your hand. Out of those 75 items, pick one and tell it to me. Do not show " +
            "me the list of the words, only the one you choose from them. Answer with a single word.",
            null,
            5
        );

        return { item: response };
    } catch (error) {
        console.error(error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

/**
 * Callable function to check if an item is in the image.
 *
 * @param {object} data - The data passed from the client.
 * @param {string} data.currentItem - The item to check for.
 * @param {string} data.image - The Base64 encoded image string.
 * @param {object} _context - The context of the callable function (unused).
 * @returns {Promise<object>} - An object indicating whether the item is present.
 */
// eslint-disable-next-line no-unused-vars
exports.isItemInImage = functions.https.onCall(async (data, _context) => {
    try {
        const { currentItem, image } = data;

        if (!currentItem || !image) {
            throw new functions.https.HttpsError('invalid-argument', 'currentItem and image are required.');
        }

        // Decode the image from Base64
        const imgBuffer = Buffer.from(image, 'base64');

        const response = await generateResponse(
            "gpt-4o",
            0.7,
            "text",
            `Is there ${currentItem} in the image? Answer using only Yes or No.`,
            imgBuffer,
            3
        );

        const isPresent = response.toLowerCase().includes("yes");
        return { isPresent };
    } catch (error) {
        console.error(error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

/**
 * Callable function to test generateResponse.
 *
 * @param {object} _data - The data passed from the client (unused).
 * @param {object} _context - The context of the callable function (unused).
 * @returns {Promise<object>} - An object containing the test response.
 */
// eslint-disable-next-line no-unused-vars
exports.testGenerateResponse = functions.https.onCall(async (_data, _context) => {
    try {
        const testQuery = "'write a poem about what beer is best.'";
        const response = await generateResponse(
            "gpt-4o",
            0.7,
            "text",
            testQuery,
            null,
            50
        );

        return { response };
    } catch (error) {
        console.error(error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});
