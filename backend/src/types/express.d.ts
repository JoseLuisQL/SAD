declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
        roleId: string;
        roleName: string;
        permissions: Record<string, any>;
      };
    }
  }
}

export {};
