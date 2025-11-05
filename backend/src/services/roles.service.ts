import { Request } from 'express';
import prisma from '../config/database';
import { log } from './audit.service';

interface CreateRoleData {
  name: string;
  description?: string;
  permissions: Record<string, any>;
}

interface UpdateRoleData {
  name?: string;
  description?: string;
  permissions?: Record<string, any>;
}

export const getAllRoles = async () => {
  const roles = await prisma.role.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { users: true }
      }
    }
  });

  return roles;
};

export const getRoleById = async (id: string) => {
  const role = await prisma.role.findUnique({
    where: { id },
    include: {
      _count: {
        select: { users: true }
      }
    }
  });

  if (!role) {
    throw new Error('Rol no encontrado');
  }

  return role;
};

export const createRole = async (roleData: CreateRoleData, req: Request) => {
  const existingRole = await prisma.role.findUnique({
    where: { name: roleData.name }
  });

  if (existingRole) {
    throw new Error('Ya existe un rol con este nombre');
  }

  const role = await prisma.role.create({
    data: {
      name: roleData.name,
      description: roleData.description || null,
      permissions: roleData.permissions
    },
    include: {
      _count: {
        select: { users: true }
      }
    }
  });

  await log({
    userId: req.user!.id,
    action: 'ROLE_CREATED',
    module: 'roles',
    entityType: 'Role',
    entityId: role.id,
    newValue: {
      name: role.name,
      description: role.description,
      permissions: role.permissions
    },
    req
  });

  return role;
};

export const updateRole = async (
  id: string,
  roleData: UpdateRoleData,
  req: Request
) => {
  const existingRole = await prisma.role.findUnique({
    where: { id }
  });

  if (!existingRole) {
    throw new Error('Rol no encontrado');
  }

  if (roleData.name && roleData.name !== existingRole.name) {
    const nameExists = await prisma.role.findUnique({
      where: { name: roleData.name }
    });

    if (nameExists) {
      throw new Error('Ya existe un rol con este nombre');
    }
  }

  const dataToUpdate: any = {
    name: roleData.name,
    description: roleData.description,
    permissions: roleData.permissions
  };

  Object.keys(dataToUpdate).forEach(
    key => dataToUpdate[key] === undefined && delete dataToUpdate[key]
  );

  const updatedRole = await prisma.role.update({
    where: { id },
    data: dataToUpdate,
    include: {
      _count: {
        select: { users: true }
      }
    }
  });

  await log({
    userId: req.user!.id,
    action: 'ROLE_UPDATED',
    module: 'roles',
    entityType: 'Role',
    entityId: id,
    oldValue: {
      name: existingRole.name,
      description: existingRole.description,
      permissions: existingRole.permissions
    },
    newValue: {
      name: updatedRole.name,
      description: updatedRole.description,
      permissions: updatedRole.permissions
    },
    req
  });

  return updatedRole;
};

export const deleteRole = async (id: string, req: Request) => {
  const role = await prisma.role.findUnique({
    where: { id },
    include: {
      _count: {
        select: { users: true }
      }
    }
  });

  if (!role) {
    throw new Error('Rol no encontrado');
  }

  if (role._count.users > 0) {
    throw new Error('No se puede eliminar el rol porque tiene usuarios asignados');
  }

  await prisma.role.delete({
    where: { id }
  });

  await log({
    userId: req.user!.id,
    action: 'ROLE_DELETED',
    module: 'roles',
    entityType: 'Role',
    entityId: id,
    oldValue: {
      name: role.name,
      description: role.description,
      permissions: role.permissions
    },
    req
  });
};

export const getRolesAnalytics = async () => {
  const roles = await prisma.role.findMany({
    include: {
      _count: {
        select: { users: true }
      }
    }
  });

  const totalRoles = roles.length;
  const totalUsers = roles.reduce((sum, role) => sum + role._count.users, 0);
  
  const permissionsDistribution: Record<string, number> = {};
  const usersDistribution = roles.map(role => ({
    roleName: role.name,
    userCount: role._count.users
  }));

  roles.forEach(role => {
    if (role.permissions && typeof role.permissions === 'object') {
      Object.keys(role.permissions).forEach(module => {
        permissionsDistribution[module] = (permissionsDistribution[module] || 0) + 1;
      });
    }
  });

  const avgPermissionsPerRole = roles.length > 0
    ? roles.reduce((sum, role) => {
        const permsCount = role.permissions && typeof role.permissions === 'object' 
          ? Object.keys(role.permissions).length 
          : 0;
        return sum + permsCount;
      }, 0) / roles.length
    : 0;

  return {
    totalRoles,
    totalUsers,
    avgPermissionsPerRole: Math.round(avgPermissionsPerRole * 100) / 100,
    permissionsDistribution,
    usersDistribution
  };
};

export const getRoleImpact = async (id: string) => {
  const role = await prisma.role.findUnique({
    where: { id },
    include: {
      users: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          email: true,
          isActive: true
        }
      }
    }
  });

  if (!role) {
    throw new Error('Rol no encontrado');
  }

  const moduleCount = role.permissions && typeof role.permissions === 'object'
    ? Object.keys(role.permissions).length
    : 0;

  let totalPermissions = 0;
  if (role.permissions && typeof role.permissions === 'object') {
    Object.values(role.permissions).forEach((modulePerms: any) => {
      if (typeof modulePerms === 'object') {
        totalPermissions += Object.values(modulePerms).filter(v => v === true).length;
      }
    });
  }

  return {
    role: {
      id: role.id,
      name: role.name,
      description: role.description
    },
    affectedUsers: role.users.map(u => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      email: u.email,
      isActive: u.isActive
    })),
    totalUsers: role.users.length,
    activeUsers: role.users.filter(u => u.isActive).length,
    moduleCount,
    totalPermissions
  };
};

export const duplicateRole = async (id: string, newName: string, req: Request) => {
  const sourceRole = await prisma.role.findUnique({
    where: { id }
  });

  if (!sourceRole) {
    throw new Error('Rol no encontrado');
  }

  const existingRole = await prisma.role.findUnique({
    where: { name: newName }
  });

  if (existingRole) {
    throw new Error('Ya existe un rol con este nombre');
  }

  const duplicatedRole = await prisma.role.create({
    data: {
      name: newName,
      description: sourceRole.description ? `${sourceRole.description} (Copia)` : 'Copia de rol',
      permissions: sourceRole.permissions as any
    },
    include: {
      _count: {
        select: { users: true }
      }
    }
  });

  await log({
    userId: req.user!.id,
    action: 'ROLE_DUPLICATED',
    module: 'roles',
    entityType: 'Role',
    entityId: duplicatedRole.id,
    newValue: {
      sourceRoleId: id,
      sourceRoleName: sourceRole.name,
      newRoleName: newName
    },
    req
  });

  return duplicatedRole;
};

export default {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getRolesAnalytics,
  getRoleImpact,
  duplicateRole
};
