import { Request } from 'express';
import prisma from '../config/database';
import bcrypt from 'bcryptjs';
import { log } from './audit.service';

interface GetAllUsersFilters {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: string;
  isActive?: boolean;
}

interface CreateUserData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleId: string;
}

interface UpdateUserData {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  roleId?: string;
  isActive?: boolean;
}

interface OnboardingData {
  completedTours: string[];
  skippedTours: string[];
  lastUpdated?: Date;
}

export const getAllUsers = async (filters: GetAllUsersFilters) => {
  const {
    page = 1,
    limit = 10,
    search,
    roleId,
    isActive
  } = filters;

  const skip = (page - 1) * limit;

  const where: any = {};

  if (search) {
    where.OR = [
      { username: { contains: search } },
      { email: { contains: search } },
      { firstName: { contains: search } },
      { lastName: { contains: search } }
    ];
  }

  if (roleId) {
    where.roleId = roleId;
  }

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        roleId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    }),
    prisma.user.count({ where })
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    users,
    total,
    page,
    limit,
    totalPages
  };
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      roleId: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      role: {
        select: {
          id: true,
          name: true,
          description: true,
          permissions: true
        }
      }
    }
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  return user;
};

export const createUser = async (userData: CreateUserData, req: Request) => {
  const existingUsername = await prisma.user.findUnique({
    where: { username: userData.username }
  });

  if (existingUsername) {
    throw new Error('El nombre de usuario ya está en uso');
  }

  const existingEmail = await prisma.user.findUnique({
    where: { email: userData.email }
  });

  if (existingEmail) {
    throw new Error('El correo electrónico ya está en uso');
  }

  const roleExists = await prisma.role.findUnique({
    where: { id: userData.roleId }
  });

  if (!roleExists) {
    throw new Error('El rol especificado no existe');
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const user = await prisma.user.create({
    data: {
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      roleId: userData.roleId
    },
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      roleId: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      role: {
        select: {
          id: true,
          name: true,
          description: true
        }
      }
    }
  });

  await log({
    userId: req.user!.id,
    action: 'USER_CREATED',
    module: 'users',
    entityType: 'User',
    entityId: user.id,
    newValue: {
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roleId: user.roleId
    },
    req
  });

  return user;
};

export const updateUser = async (
  id: string,
  userData: UpdateUserData,
  req: Request
) => {
  const existingUser = await prisma.user.findUnique({
    where: { id }
  });

  if (!existingUser) {
    throw new Error('Usuario no encontrado');
  }

  if (userData.email && userData.email !== existingUser.email) {
    const emailExists = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (emailExists) {
      throw new Error('El correo electrónico ya está en uso');
    }
  }

  if (userData.roleId) {
    const roleExists = await prisma.role.findUnique({
      where: { id: userData.roleId }
    });

    if (!roleExists) {
      throw new Error('El rol especificado no existe');
    }
  }

  const dataToUpdate: any = {
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    roleId: userData.roleId,
    isActive: userData.isActive
  };

  if (userData.password) {
    dataToUpdate.password = await bcrypt.hash(userData.password, 10);
  }

  Object.keys(dataToUpdate).forEach(
    key => dataToUpdate[key] === undefined && delete dataToUpdate[key]
  );

  const updatedUser = await prisma.user.update({
    where: { id },
    data: dataToUpdate,
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      roleId: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      role: {
        select: {
          id: true,
          name: true,
          description: true
        }
      }
    }
  });

  const oldValue: any = {
    email: existingUser.email,
    firstName: existingUser.firstName,
    lastName: existingUser.lastName,
    roleId: existingUser.roleId,
    isActive: existingUser.isActive
  };

  const newValue: any = {
    email: updatedUser.email,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    roleId: updatedUser.roleId,
    isActive: updatedUser.isActive
  };

  await log({
    userId: req.user!.id,
    action: 'USER_UPDATED',
    module: 'users',
    entityType: 'User',
    entityId: id,
    oldValue,
    newValue,
    req
  });

  return updatedUser;
};

export const deleteUser = async (id: string, req: Request) => {
  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  if (id === req.user!.id) {
    throw new Error('No puedes eliminar tu propia cuenta');
  }

  await prisma.user.update({
    where: { id },
    data: { isActive: false }
  });

  await log({
    userId: req.user!.id,
    action: 'USER_DELETED',
    module: 'users',
    entityType: 'User',
    entityId: id,
    oldValue: {
      username: user.username,
      email: user.email,
      isActive: true
    },
    newValue: {
      isActive: false
    },
    req
  });
};

export const searchUsers = async (query: string) => {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { username: { contains: query } },
        { email: { contains: query } },
        { firstName: { contains: query } },
        { lastName: { contains: query } }
      ]
    },
    take: 10,
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      roleId: true,
      isActive: true,
      role: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  return users;
};

export const getUsersStats = async () => {
  const [totalUsers, activeUsers, usersByRole, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.groupBy({
      by: ['roleId'],
      _count: {
        id: true
      }
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        email: true,
        isActive: true,
        createdAt: true,
        role: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
  ]);

  const roles = await prisma.role.findMany({
    select: {
      id: true,
      name: true
    }
  });

  const usersByRoleWithNames = usersByRole.map(group => {
    const role = roles.find(r => r.id === group.roleId);
    return {
      roleId: group.roleId,
      roleName: role?.name || 'Unknown',
      count: group._count.id
    };
  });

  const inactiveUsers = totalUsers - activeUsers;

  return {
    totalUsers,
    activeUsers,
    inactiveUsers,
    usersByRole: usersByRoleWithNames,
    recentUsers
  };
};

export const exportUsersToCSV = async (filters: GetAllUsersFilters = {}) => {
  const { stringify } = await import('csv-stringify/sync');
  
  const where: any = {};

  if (filters.search) {
    where.OR = [
      { username: { contains: filters.search } },
      { email: { contains: filters.search } },
      { firstName: { contains: filters.search } },
      { lastName: { contains: filters.search } }
    ];
  }

  if (filters.roleId) {
    where.roleId = filters.roleId;
  }

  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      username: true,
      firstName: true,
      lastName: true,
      email: true,
      isActive: true,
      createdAt: true,
      role: {
        select: {
          name: true
        }
      }
    }
  });

  const data = users.map(user => ({
    'Usuario': user.username,
    'Nombre Completo': `${user.firstName} ${user.lastName}`,
    'Email': user.email,
    'Rol': user.role.name,
    'Estado': user.isActive ? 'Activo' : 'Inactivo',
    'Fecha Creación': new Date(user.createdAt).toLocaleDateString('es-PE')
  }));

  const csv = stringify(data, {
    header: true,
    columns: ['Usuario', 'Nombre Completo', 'Email', 'Rol', 'Estado', 'Fecha Creación']
  });

  return csv;
};

export const exportUsersToExcel = async (filters: GetAllUsersFilters = {}) => {
  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Usuarios');

  const where: any = {};

  if (filters.search) {
    where.OR = [
      { username: { contains: filters.search } },
      { email: { contains: filters.search } },
      { firstName: { contains: filters.search } },
      { lastName: { contains: filters.search } }
    ];
  }

  if (filters.roleId) {
    where.roleId = filters.roleId;
  }

  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      username: true,
      firstName: true,
      lastName: true,
      email: true,
      isActive: true,
      createdAt: true,
      role: {
        select: {
          name: true
        }
      }
    }
  });

  worksheet.columns = [
    { header: 'Usuario', key: 'username', width: 20 },
    { header: 'Nombre Completo', key: 'fullName', width: 30 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Rol', key: 'role', width: 20 },
    { header: 'Estado', key: 'status', width: 15 },
    { header: 'Fecha Creación', key: 'createdAt', width: 20 }
  ];

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF3B82F6' }
  };
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  users.forEach((user, index) => {
    const row = worksheet.addRow({
      username: user.username,
      fullName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role.name,
      status: user.isActive ? 'Activo' : 'Inactivo',
      createdAt: new Date(user.createdAt).toLocaleDateString('es-PE')
    });

    if (index % 2 === 0) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF9FAFB' }
      };
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

export const updateOnboarding = async (userId: string, data: OnboardingData, req?: Request) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  const previousOnboarding = user.onboardingData as any || { completedTours: [], skippedTours: [] };
  
  const onboardingData = {
    completedTours: data.completedTours,
    skippedTours: data.skippedTours,
    lastUpdated: new Date().toISOString()
  };

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      onboardingData: onboardingData
    },
    select: {
      id: true,
      onboardingData: true
    }
  });

  // Audit log for newly completed tours
  const newCompletedTours = data.completedTours.filter(
    (tour: string) => !previousOnboarding.completedTours.includes(tour)
  );
  
  for (const tourId of newCompletedTours) {
    await log({
      userId,
      action: 'TOUR_COMPLETED',
      module: 'ONBOARDING',
      entityType: 'tour',
      entityId: tourId,
      newValue: { tourId, completedAt: new Date() },
      req
    });
  }

  // Audit log for newly skipped tours
  const newSkippedTours = data.skippedTours.filter(
    (tour: string) => !previousOnboarding.skippedTours.includes(tour)
  );
  
  for (const tourId of newSkippedTours) {
    await log({
      userId,
      action: 'TOUR_SKIPPED',
      module: 'ONBOARDING',
      entityType: 'tour',
      entityId: tourId,
      newValue: { tourId, skippedAt: new Date() },
      req
    });
  }

  return updatedUser.onboardingData;
};

export const getOnboardingStatus = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      onboardingData: true
    }
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  if (!user.onboardingData) {
    return {
      completedTours: [],
      skippedTours: [],
      lastUpdated: null
    };
  }

  return user.onboardingData;
};

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      role: {
        select: {
          id: true,
          name: true,
          description: true,
          permissions: true
        }
      },
      _count: {
        select: {
          documents: true,
          archivadores: true,
          signatures: true
        }
      }
    }
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  return user;
};

export const updateProfile = async (
  userId: string,
  profileData: UpdateProfileData,
  req: Request
) => {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!existingUser) {
    throw new Error('Usuario no encontrado');
  }

  if (profileData.email && profileData.email !== existingUser.email) {
    const emailExists = await prisma.user.findUnique({
      where: { email: profileData.email }
    });

    if (emailExists) {
      throw new Error('El correo electrónico ya está en uso');
    }
  }

  const dataToUpdate: any = {
    email: profileData.email,
    firstName: profileData.firstName,
    lastName: profileData.lastName
  };

  Object.keys(dataToUpdate).forEach(
    key => dataToUpdate[key] === undefined && delete dataToUpdate[key]
  );

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: dataToUpdate,
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      role: {
        select: {
          id: true,
          name: true,
          description: true,
          permissions: true
        }
      }
    }
  });

  const oldValue: any = {
    email: existingUser.email,
    firstName: existingUser.firstName,
    lastName: existingUser.lastName
  };

  const newValue: any = {
    email: updatedUser.email,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName
  };

  await log({
    userId,
    action: 'PROFILE_UPDATED',
    module: 'users',
    entityType: 'User',
    entityId: userId,
    oldValue,
    newValue,
    req
  });

  return updatedUser;
};

export const changePassword = async (
  userId: string,
  passwordData: ChangePasswordData,
  req: Request
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  const isPasswordValid = await bcrypt.compare(
    passwordData.currentPassword,
    user.password
  );

  if (!isPasswordValid) {
    throw new Error('La contraseña actual es incorrecta');
  }

  const hashedPassword = await bcrypt.hash(passwordData.newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });

  await log({
    userId,
    action: 'PASSWORD_CHANGED',
    module: 'users',
    entityType: 'User',
    entityId: userId,
    newValue: { message: 'Contraseña actualizada exitosamente' },
    req
  });

  return { message: 'Contraseña actualizada exitosamente' };
};

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  searchUsers,
  getUsersStats,
  exportUsersToCSV,
  exportUsersToExcel,
  updateOnboarding,
  getOnboardingStatus,
  getProfile,
  updateProfile,
  changePassword
};
