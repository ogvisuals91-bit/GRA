import { z } from "zod";
import { insertCategorySchema, insertNomineeSchema, insertPaymentSchema, insertSponsorSchema, adminLoginSchema, categories, nominees, payments, sponsors } from "./schema";

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export { insertCategorySchema, insertNomineeSchema, insertPaymentSchema, insertSponsorSchema, adminLoginSchema };

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/admin/login' as const,
      input: adminLoginSchema,
      responses: {
        200: z.object({ success: z.boolean() }),
        401: errorSchemas.unauthorized
      }
    },
    me: {
      method: 'GET' as const,
      path: '/api/admin/me' as const,
      responses: {
        200: z.object({ loggedIn: z.boolean() }),
        401: errorSchemas.unauthorized
      }
    },
    logout: {
      method: 'POST' as const,
      path: '/api/admin/logout' as const,
      responses: {
        200: z.object({ success: z.boolean() })
      }
    }
  },
  categories: {
    list: {
      method: 'GET' as const,
      path: '/api/categories' as const,
      responses: { 200: z.array(z.custom<typeof categories.$inferSelect>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/categories' as const,
      input: insertCategorySchema,
      responses: { 201: z.custom<typeof categories.$inferSelect>() }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/categories/:id' as const,
      input: insertCategorySchema,
      responses: { 200: z.custom<typeof categories.$inferSelect>() }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/categories/:id' as const,
      responses: { 204: z.void() }
    }
  },
  nominees: {
    list: {
      method: 'GET' as const,
      path: '/api/nominees' as const,
      responses: { 200: z.array(z.custom<typeof nominees.$inferSelect & { categoryName?: string }>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/nominees' as const,
      input: insertNomineeSchema,
      responses: { 201: z.custom<typeof nominees.$inferSelect>() }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/nominees/:id' as const,
      input: insertNomineeSchema.partial(),
      responses: { 200: z.custom<typeof nominees.$inferSelect>() }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/nominees/:id' as const,
      responses: { 204: z.void() }
    }
  },
  payments: {
    list: {
      method: 'GET' as const,
      path: '/api/payments' as const,
      responses: { 200: z.array(z.custom<typeof payments.$inferSelect & { nomineeName?: string }>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/payments' as const,
      input: insertPaymentSchema,
      responses: { 201: z.custom<typeof payments.$inferSelect>() }
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/payments/:id/status' as const,
      input: z.object({ status: z.enum(["pending", "accepted", "declined"]) }),
      responses: { 200: z.custom<typeof payments.$inferSelect>() }
    }
  },
  uploads: {
    create: {
      method: 'POST' as const,
      path: '/api/uploads' as const,
      responses: { 201: z.object({ url: z.string() }) }
    }
  },
  sponsors: {
    list: {
      method: 'GET' as const,
      path: '/api/sponsors' as const,
      responses: { 200: z.array(z.custom<typeof sponsors.$inferSelect>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/sponsors' as const,
      input: insertSponsorSchema,
      responses: { 201: z.custom<typeof sponsors.$inferSelect>() }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/sponsors/:id' as const,
      responses: { 204: z.void() }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
