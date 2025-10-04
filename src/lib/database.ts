import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Utility function untuk handle database operations dengan retry logic
export async function withDatabaseRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 2,
  delay: number = 100
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: unknown) {
      lastError = error;
      
      // Check if it's a connection or prepared statement error
      const isConnectionError = (error as Error).message?.includes('prepared statement') || 
                               (error as Error).message?.includes('ConnectorError') ||
                               (error as { code?: string }).code === '42P05';
      
      if (isConnectionError && attempt < maxRetries) {
        console.warn(`Database operation failed (attempt ${attempt + 1}), retrying in ${delay}ms:`, (error as Error).message);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
}

// Wrapper functions untuk common database operations
export async function findUserByEmail(email: string) {
  return withDatabaseRetry(() => 
    prisma.user.findUnique({
      where: { email }
    })
  );
}

export async function findUserById(id: number) {
  return withDatabaseRetry(() => 
    prisma.user.findUnique({
      where: { id }
    })
  );
}

export async function createUser(userData: Prisma.UserCreateInput) {
  return withDatabaseRetry(() => 
    prisma.user.create({
      data: userData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true
      }
    })
  );
}

export async function findProducts(params?: Prisma.ProductFindManyArgs) {
  return withDatabaseRetry(() => 
    prisma.product.findMany(params)
  );
}

export async function findProductsWithVariants() {
  return withDatabaseRetry(() => 
    prisma.product.findMany({
      include: {
        variants: {
          include: {
            options: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  );
}

export async function createProduct(data: Prisma.ProductCreateInput) {
  return withDatabaseRetry(() => 
    prisma.product.create({ 
      data,
      include: {
        variants: {
          include: {
            options: true
          }
        }
      }
    })
  );
}

// Category functions
export async function findCategories() {
  return withDatabaseRetry(() => 
    prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
  );
}

export async function createCategory(data: Prisma.CategoryCreateInput) {
  return withDatabaseRetry(() => 
    prisma.category.create({ data })
  );
}

export async function updateCategory(id: number, data: Prisma.CategoryUpdateInput) {
  return withDatabaseRetry(() => 
    prisma.category.update({
      where: { id },
      data
    })
  );
}

export async function deleteCategory(id: number) {
  return withDatabaseRetry(() => 
    prisma.category.delete({
      where: { id }
    })
  );
}

export async function findProductById(id: number) {
  return withDatabaseRetry(() => 
    prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          include: {
            options: true
          }
        }
      }
    })
  );
}