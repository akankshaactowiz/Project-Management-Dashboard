export const roleHierarchy = {
  Superadmin: ["Manager", "Team Lead", "Developer", "Project Admin"],
  Manager: ["Team Lead", "Developer"],
  "Team Lead": ["Developer"],
  Developer: []
};  