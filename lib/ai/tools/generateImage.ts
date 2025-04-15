import { incrementUserUsageForUser } from "@/db/queries";
import { openai } from "@ai-sdk/openai";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { DataStreamWriter, experimental_generateImage, tool } from "ai";
import { z } from "zod";

export default function createGenerateImageTool(
  dataStream: DataStreamWriter,
  userId?: string,
) {
  return tool({
    description: "Generate an image",
    parameters: z.object({
      prompt: z.string(),
    }),
    execute: async ({ prompt }) => {
      // Upload image to S3 with user-specific path
      const key = `users/${userId || "anonymous"}/${crypto.randomUUID()}.png`;

      // Tell the user image is being generated
      dataStream.writeData({
        type: "message-kind",
        value: {
          kind: "image",
        },
      });

      const { image } = await experimental_generateImage({
        model: openai.image("dall-e-3"),
        prompt,
        size: "1024x1024",
      });
      // Increment the usage for a premium model for the user
      if (userId) {
        await incrementUserUsageForUser(userId, true);
      }

      // The image is already a base64 string from experimental_generateImage
      const imageBuffer = Buffer.from(image.base64, "base64");

      const s3Client = new S3Client({});

      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.USER_S3_BUCKET,
          Key: key,
          Body: imageBuffer,
        }),
      );

      const imageUrl = `${process.env.USER_DATA_CDN}/${key}`;

      dataStream.writeData({
        type: "tool-image-url",
        value: {
          prompt,
          url: imageUrl,
        },
      });

      return {
        prompt: prompt,
        result: "An image was generated and displayed with the user.",
      };
    },
  });
}
