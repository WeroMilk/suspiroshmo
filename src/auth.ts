export type EmployeeSession = {
  username: string;
  name: string;
  loggedAt: string;
};

const SESSION_KEY = 'suspiros-employee-session';

/** Empleados de Suspiros (solo front; easter egg interno). */
const EMPLOYEES: Array<{ username: string; password: string; name: string }> = [
  { username: 'admin', password: 'suspiros2004', name: 'Administración' },
  { username: 'empleado', password: 'momentos', name: 'Equipo Suspiros' },
];

export function loginEmployee(username: string, password: string): EmployeeSession | null {
  const match = EMPLOYEES.find(
    (employee) =>
      employee.username.toLowerCase() === username.trim().toLowerCase() &&
      employee.password === password,
  );
  if (!match) return null;
  const session: EmployeeSession = {
    username: match.username,
    name: match.name,
    loggedAt: new Date().toISOString(),
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function logoutEmployee() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function getEmployeeSession(): EmployeeSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as EmployeeSession;
    if (!parsed?.username || !parsed?.name) return null;
    return parsed;
  } catch {
    return null;
  }
}
