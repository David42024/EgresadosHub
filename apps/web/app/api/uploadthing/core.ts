import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const f = createUploadthing();

// Secret JWT desde variables de entorno
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'tu-secret-key-aqui-cambia-en-produccion'
);

// Tipos de usuario válidos
interface UserPayload {
  userId: string;
  email: string;
  role: 'EGRESADO' | 'EMPRESA' | 'ADMINISTRADOR';
}

// Función de autenticación real con JWT
async function auth(req: Request): Promise<UserPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    
    if (!token) {
      console.log('[UploadThing Auth] No token found in cookies');
      return null;
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    return {
      userId: payload.sub as string,
      email: payload.email as string,
      role: payload.role as 'EGRESADO' | 'EMPRESA' | 'ADMINISTRADOR',
    };
  } catch (error) {
    console.error('[UploadThing Auth] Error verifying token:', error);
    return null;
  }
}

export const ourFileRouter = {
  // ─── 1. imageUploader — Para avatars de egresados ──────────────────────────
  imageUploader: f({
    image: { 
      maxFileSize: '2MB', 
      maxFileCount: 1,
      contentDisposition: 'inline',
    },
  })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new Error('Unauthorized - No valid session');
      if (user.role !== 'EGRESADO' && user.role !== 'ADMINISTRADOR') {
        throw new Error('Forbidden - Only EGRESADO or ADMIN can upload avatars');
      }
      return { 
        userId: user.userId, 
        role: user.role,
        type: 'avatar' as const,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('[UploadThing] Avatar uploaded:', {
        userId: metadata.userId,
        url: file.url,
        name: file.name,
        size: file.size,
      });
      return { 
        uploadedBy: metadata.userId, 
        url: file.url,
        type: 'avatar',
      };
    }),

  // ─── 2. cvUploader — Para CVs de egresados (PDF) ────────────────────────────
  cvUploader: f({
    pdf: { 
      maxFileSize: '4MB', 
      maxFileCount: 1,
      contentDisposition: 'inline',
    },
  })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new Error('Unauthorized - No valid session');
      if (user.role !== 'EGRESADO') {
        throw new Error('Forbidden - Only EGRESADO can upload CVs');
      }
      return { 
        userId: user.userId, 
        role: user.role,
        type: 'cv' as const,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('[UploadThing] CV uploaded:', {
        userId: metadata.userId,
        url: file.url,
        name: file.name,
        size: file.size,
      });
      // La actualización en BD se hará desde el frontend via tRPC
      return { 
        uploadedBy: metadata.userId, 
        url: file.url,
        type: 'cv',
      };
    }),

  // ─── 3. logoUploader — Para logos de empresas ───────────────────────────────
  logoUploader: f({
    image: { 
      maxFileSize: '2MB', 
      maxFileCount: 1,
      contentDisposition: 'inline',
    },
  })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new Error('Unauthorized - No valid session');
      if (user.role !== 'EMPRESA' && user.role !== 'ADMINISTRADOR') {
        throw new Error('Forbidden - Only EMPRESA or ADMIN can upload logos');
      }
      return { 
        userId: user.userId, 
        role: user.role,
        type: 'logo' as const,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('[UploadThing] Logo uploaded:', {
        userId: metadata.userId,
        url: file.url,
        name: file.name,
        size: file.size,
      });
      return { 
        uploadedBy: metadata.userId, 
        url: file.url,
        type: 'logo',
      };
    }),

} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

