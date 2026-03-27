import { describe, it, expect, beforeAll } from 'vitest';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

describe('Body Parameter JSON String Parsing', () => {
  const bodySchema = z.object({
    subject: z.string().describe('Email subject'),
    body: z
      .object({
        contentType: z.enum(['text', 'html']),
        content: z.string(),
      })
      .optional(),
    toRecipients: z
      .array(
        z.object({
          emailAddress: z.object({
            address: z.string(),
          }),
        })
      )
      .optional(),
  });

  it('should convert Zod schema to JSON schema', () => {
    const jsonSchema = zodToJsonSchema(bodySchema, { name: 'body' });
    expect(jsonSchema).toBeDefined();
    expect(jsonSchema.$ref).toBe('#/definitions/body');
    expect(jsonSchema.definitions).toBeDefined();
  });

  it('should parse JSON string and validate against schema', () => {
    const jsonString = JSON.stringify({
      subject: 'Test Email',
      body: {
        contentType: 'html',
        content: '<h1>Hello</h1>',
      },
      toRecipients: [
        {
          emailAddress: {
            address: 'test@example.com',
          },
        },
      ],
    });

    const parsed = JSON.parse(jsonString);
    const result = bodySchema.safeParse(parsed);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.subject).toBe('Test Email');
      expect(result.data.body?.contentType).toBe('html');
    }
  });

  it('should handle invalid JSON gracefully', () => {
    const invalidJson = '{ invalid json }';

    expect(() => JSON.parse(invalidJson)).toThrow();
  });

  it('should validate parsed JSON against schema', () => {
    const validJson = JSON.stringify({
      subject: 'Test',
    });

    const parsed = JSON.parse(validJson);
    const result = bodySchema.safeParse(parsed);

    expect(result.success).toBe(true);
  });

  it('should reject invalid data', () => {
    const invalidData = {
      subject: 123, // Should be string
    };

    const result = bodySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
