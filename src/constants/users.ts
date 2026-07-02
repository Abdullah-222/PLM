import type { User } from "@/types";

export const currentUser: User = {
  id: "u1",
  name: "Sarah Chen",
  email: "sarah.chen@acme-plm.com",
  avatar: "",
  role: "Lead Engineer",
  department: "Mechanical Engineering",
};

export const users: User[] = [
  currentUser,
  {
    id: "u2",
    name: "James Wilson",
    email: "j.wilson@acme-plm.com",
    role: "Design Engineer",
    department: "Mechanical Engineering",
  },
  {
    id: "u3",
    name: "Maria Garcia",
    email: "m.garcia@acme-plm.com",
    role: "Quality Engineer",
    department: "Quality Assurance",
  },
  {
    id: "u4",
    name: "Alex Kim",
    email: "a.kim@acme-plm.com",
    role: "Manufacturing Engineer",
    department: "Manufacturing",
  },
  {
    id: "u5",
    name: "David Brown",
    email: "d.brown@acme-plm.com",
    role: "Project Manager",
    department: "Program Management",
  },
];
