declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      role: string
      employeeData?: any
      companyData?: any
    }
  }

  interface User {
    id: string
    email: string
    role: string
    employeeData?: any
    companyData?: any
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    employeeData?: any
    companyData?: any
  }
}