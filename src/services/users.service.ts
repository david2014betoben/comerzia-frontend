import { api } from "../lib/api";
import type { CreateUserInput, RegisterInput, User } from "../types/users";
export const usersService = {
  register: (data: RegisterInput) => api<User>("/users/register", "POST", data),
  createStaff: (data: CreateUserInput) =>
    api<User>("/users/staff", "POST", data),
};
