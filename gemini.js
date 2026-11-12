const MODELS = ["gemini-3.6-flash", "gemini-3.8-flash"];

function isServiceUnavailable(error) {
  return (
    error?.status === 503 ||
    error?.code === 503 ||
    error?.status === "UNAVAILABLE" ||
    error?.message?.includes('"status":"UNAVAILABLE"')
  );
}

async function generateContentWithFallback(ai, request) {
  for (let index = 0; index < MODELS.length; index += 1) {
    try {
      return await ai.models.generateContent({
        ...request,
        model: MODELS[index],
      });
    } catch (error) {
      if (!isServiceUnavailable(error) || index === MODELS.length - 1) {
        throw error;
      }

      console.warn(
        `Gemini model ${MODELS[index]} is unavailable; trying ${MODELS[index + 1]}.`
      );
    }
  }
}

module.exports = { generateContentWithFallback };
